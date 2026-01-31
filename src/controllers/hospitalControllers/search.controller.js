import https from 'https';
import { getBusinessesByLocation,getBusinessByUserId } from '../../grpc/clients/businessClient.js';
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

export const searchAcrossModels = async (req, res) => {
  try {
    // 1. Extract pagination and control parameters
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      keyword = '',
      pincode = '',
      city = '',
      state = '',
      businessId = '', // Optional: search specific hospital
      ...otherFilters
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // 2. First, find matching hospitals by location (pincode, city, state)
    let businessIds = [];
    
    if (pincode || city || state || businessId) {
      const locationQuery = {};
      
      if (businessId) {
        businessIds = [businessId];
      } else {
        if (pincode) locationQuery['address'] = { $regex: pincode, $options: 'i' };
        if (city) locationQuery['address'] = { $regex: city, $options: 'i' };
        if (state) locationQuery['address'] = { $regex: state, $options: 'i' };
        
        if (Object.keys(locationQuery).length > 0) {
          const matchingContacts = await Contact.find(locationQuery).lean();
          businessIds = matchingContacts.map(c => c.businessId);
        }
      }
    }

    const results = {};
    let totalResults = 0;

    // 3. Search through ALL models
    for (const modelName of Object.keys(hospitalModels)) {
      const model = hospitalModels[modelName];
      if (!model || !model.schema) continue;

      const query = {};
      let hasSearchCriteria = false;

      // 4. Filter by location if provided
      if (businessIds.length > 0) {
        query.businessId = { $in: businessIds };
        hasSearchCriteria = true;
      }

      // 5. Handle keyword search
      if (keyword) {
        const modelSchemaPaths = Object.keys(model.schema.paths);
        const textFields = modelSchemaPaths.filter(path => {
          const schemaType = model.schema.paths[path].instance;
          return schemaType === 'String' && path !== 'businessId';
        });

        if (textFields.length > 0) {
          const keywordConditions = textFields.map(field => ({
            [field]: { $regex: keyword, $options: 'i' }
          }));
          
          if (query.$or) {
            query.$and = [{ $or: query.$or }, { $or: keywordConditions }];
            delete query.$or;
          } else {
            query.$or = keywordConditions;
          }
          hasSearchCriteria = true;
        }
      }

      // 6. Handle specific field filters
      const modelSchemaPaths = Object.keys(model.schema.paths);
      for (let [key, value] of Object.entries(otherFilters)) {
        if (key === 'price') key = 'fees';
        
        if (modelSchemaPaths.includes(key)) {
          hasSearchCriteria = true;
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
          } else if (schemaType === 'Date') {
            query[key] = new Date(value);
          } else {
            query[key] = value;
          }
        }
      }

      // 7. Search Execution
      if (hasSearchCriteria) {
        try {
          const data = await model
            .find(query)
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
    }

    // 8. Enrich results with business details via gRPC
    if (totalResults > 0) {
      const allBusinessIds = new Set();
      Object.values(results).forEach(result => {
        result.data.forEach(item => {
          if (item.businessId) allBusinessIds.add(item.businessId);
        });
      });

      const uniqueBusinessIds = Array.from(allBusinessIds);

      // Fetch hospital contact info from MongoDB
      const hospitalContacts = await Contact.find({
        businessId: { $in: uniqueBusinessIds }
      }).lean();

      const contactMap = hospitalContacts.reduce((acc, hospital) => {
        acc[hospital.businessId] = {
          hospitalName: hospital.hospitalName,
          address: hospital.address,
          phone: hospital.phone,
          email: hospital.email,
          website: hospital.website
        };
        return acc;
      }, {});

      // --- FIXED: Fetch business details via parallel gRPC calls ---
      let businessDetailsMap = {};
      try {
        const businessPromises = uniqueBusinessIds.map(id => getBusinessByUserId(id));
        
        // Use Settled to ensure one failure doesn't break the whole search
        const settledResults = await Promise.allSettled(businessPromises);
        
        businessDetailsMap = settledResults.reduce((acc, result) => {
          if (result.status === 'fulfilled' && result.value) {
            const business = result.value;
            // Map by the business ID (ensure field name matches your proto: id or business_id)
            const bId = business.id || business.business_id;
            if (bId) acc[bId] = business;
          }
          return acc;
        }, {});

        console.log(`Fetched business details for ${Object.keys(businessDetailsMap).length} businesses`);
      } catch (grpcError) {
        console.error('gRPC error fetching business details:', grpcError.message);
      }

      // Merge combined hospital info + raw business details into results
      Object.keys(results).forEach(modelName => {
        results[modelName].data = results[modelName].data.map(item => ({
          ...item,
          hospitalInfo: contactMap[item.businessId] || null,
          businessDetails: businessDetailsMap[item.businessId] || null
        }));
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