import https from 'https';
import { getBusinessesByLocation } from '../../grpc/clients/businessClient.js';
import Department from '../../models/hospitalModels/department.model.js';
import Doctor from '../../models/hospitalModels/doctor.model.js';
import Ward from '../../models/hospitalModels/ward.model.js';
import Bed from '../../models/hospitalModels/bed.model.js';
import EmergencyService from '../../models/hospitalModels/emergencyService.model.js';
import Facility from '../../models/hospitalModels/facility.model.js';
import AboutUs from '../../models/hospitalModels/aboutUs.model.js';
import Contact from '../../models/hospitalModels/contact.model.js';
import Career from '../../models/hospitalModels/career.model.js';
import Branch from '../../models/hospitalModels/branch.model.js';
import Testimonial from '../../models/hospitalModels/testimonial.model.js';

const hospitalModels = {
  Department,
  Doctor,
  Ward,
  Bed,
  EmergencyService,
  Facility,
  AboutUs,
  Contact,
  Career,
  Branch,
  // Testimonial
};

// Helper function to get lat/long from pincode using an external API
const getLatLongFromPincode = (pincode) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.postalpincode.in',
      path: `/pincode/${pincode}`,
      method: 'GET'
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          if (parsedData && parsedData.length > 0 && parsedData[0].Status === 'Success' && parsedData[0].PostOffice && parsedData[0].PostOffice.length > 0) {
            const office = parsedData[0].PostOffice[0];
            resolve({ lat: parseFloat(office.Latitude), long: parseFloat(office.Longitude) });
          } else {
            reject(new Error('Invalid pincode or no data found.'));
          }
        } catch (e) {
          reject(new Error('Failed to parse pincode API response.'));
        }
      });
    });
    req.on('error', error => { reject(new Error(`Pincode API request failed: ${error.message}`)); });
    req.end();
  });
};


export const searchAcrossModels = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      keyword = '',
      pincode = '',
      radius = 10, // Default radius
      businessId = '', // Optional: search specific hospital
      ...otherFilters
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let businessIds = [];
    
    if (businessId) {
        businessIds = [businessId];
    } else if (pincode) {
        try {
            const { lat, long } = await getLatLongFromPincode(pincode);
            const noOfEntries = 1000; // High limit for gRPC call
            const businessResponse = await getBusinessesByLocation(lat, long, noOfEntries, parseFloat(radius));
            if (businessResponse && businessResponse.businesses) {
                businessIds = businessResponse.businesses.map(b => b.id);
            }
        } catch (e) {
            return res.status(404).json({ success: false, message: e.message || 'Could not fetch location data.' });
        }
    } else {
        return res.status(400).json({ success: false, message: "A pincode or businessId is required for the search." });
    }

    if (businessIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No hospitals found for the specified location.',
        data: {},
        pagination: { page: pageNum, limit: limitNum, totalPages: 0, totalResults: 0 }
      });
    }

    const results = {};
    let totalResults = 0;

    for (const modelName of Object.keys(hospitalModels)) {
      const model = hospitalModels[modelName];
      if (!model || !model.schema) continue;

      const query = { businessId: { $in: businessIds } };
      
      if (keyword) {
        const textFields = Object.keys(model.schema.paths).filter(path => 
            model.schema.paths[path].instance === 'String' && path !== 'businessId');
        if (textFields.length > 0) {
          query.$or = textFields.map(field => ({ [field]: { $regex: keyword, $options: 'i' } }));
        }
      }
      
      const modelSchemaPaths = Object.keys(model.schema.paths);
      for (let [key, value] of Object.entries(otherFilters)) {
        if (key === 'price') key = 'fees';
        
        if (modelSchemaPaths.includes(key)) {
          const schemaType = model.schema.paths[key].instance;
          if (schemaType === 'String') {
            query[key] = { $regex: value, $options: 'i' };
          } else if (schemaType === 'Number') {
            if (typeof value === 'string' && value.includes('-')) {
              const [min, max] = value.split('-').map(Number);
              query[key] = { $gte: min, $lte: max };
            } else {
              query[key] = Number(value);
            }
          } else if (schemaType === 'Boolean') {
            query[key] = value === 'true' || value === true;
          } else {
            query[key] = value;
          }
        }
      }

      try {
        const data = await model.find(query)
          .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limitNum)
          .lean();
        const count = await model.countDocuments(query);
        if (data.length > 0) {
          results[modelName] = { data, count };
          totalResults += count;
        }
      } catch (err) {
        console.error(`Error searching ${modelName}:`, err.message);
      }
    }

    if (totalResults > 0) {
      const allBusinessIds = Array.from(new Set(Object.values(results).flatMap(r => r.data.map(i => i.businessId))));
      const hospitalInfo = await Contact.find({ businessId: { $in: allBusinessIds } }).lean();
      const hospitalMap = hospitalInfo.reduce((acc, h) => {
        acc[h.businessId] = { hospitalName: h.hospitalName, address: h.address, phone: h.phone, email: h.email };
        return acc;
      }, {});
      Object.values(results).forEach(r => {
        r.data.forEach(item => { item.hospitalInfo = hospitalMap[item.businessId] || null; });
      });
    }

    res.status(200).json({
      success: true,
      message: totalResults > 0 ? 'Search completed successfully' : 'No results found',
      data: results,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalResults / limitNum),
        totalResults
      }
    });
  } catch (error) {
    console.error('Public search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during search',
      error: error.message
    });
  }
};

export default {
  searchAcrossModels,
};