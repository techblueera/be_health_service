import https from 'https';
import { getBusinessesByLocation,getBusinessByUserId,getBusinessById } from '../../grpc/clients/businessClient.js';
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
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      keyword = '',
      pincode = '',
      city = '',
      state = '',
      businessId = '',
      ...otherFilters
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

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

    for (const modelName of Object.keys(hospitalModels)) {
      const model = hospitalModels[modelName];
      if (!model || !model.schema) continue;

      const query = {};
      let hasSearchCriteria = false;

      if (businessIds.length > 0) {
        query.businessId = { $in: businessIds };
        hasSearchCriteria = true;
      }

      if (keyword) {
        const textFields = Object.keys(model.schema.paths).filter(path => {
          return model.schema.paths[path].instance === 'String' && path !== 'businessId';
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

      const modelSchemaPaths = Object.keys(model.schema.paths);
      for (let [key, value] of Object.entries(otherFilters)) {
        if (key === 'price') key = 'fees';
        if (modelSchemaPaths.includes(key)) {
          hasSearchCriteria = true;
          const schemaType = model.schema.paths[key].instance;
          if (schemaType === 'String') query[key] = { $regex: value, $options: 'i' };
          else if (schemaType === 'Number') {
            if (typeof value === 'string' && value.includes('-')) {
              const [min, max] = value.split('-').map(Number);
              query[key] = { $gte: min, $lte: max };
            } else query[key] = Number(value);
          } else if (schemaType === 'Boolean') query[key] = value === 'true' || value === true;
          else if (schemaType === 'Date') query[key] = new Date(value);
          else query[key] = value;
        }
      }

      if (hasSearchCriteria) {
        try {
          const data = await model.find(query).sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 }).skip(skip).limit(limitNum).lean();
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

    // 8. Enrich results with business details (UserID -> Fallback to BusinessID)
    if (totalResults > 0) {
      const allBusinessIds = new Set();
      Object.values(results).forEach(resObj => resObj.data.forEach(item => item.businessId && allBusinessIds.add(item.businessId)));
      const uniqueIds = Array.from(allBusinessIds);

      const hospitalContacts = await Contact.find({ businessId: { $in: uniqueIds } }).lean();
      const contactMap = hospitalContacts.reduce((acc, h) => {
        acc[h.businessId] = { hospitalName: h.hospitalName, address: h.address, phone: h.phone, email: h.email, website: h.website };
        return acc;
      }, {});

      // --- FALLBACK LOGIC: UserID -> BusinessID ---
      let businessDetailsMap = {};
      const fetchDetails = async (id) => {
        try {
          // Try fetching by User ID first
          let biz = await getBusinessByUserId(id);
          // If not found or empty, try fetching by Business ID
          if (!biz || Object.keys(biz).length === 0) {
            biz = await getBusinessById(id);
          }
          return { id, biz };
        } catch (err) {
          // If first call fails, still try the second one
          try {
            const biz = await getBusinessById(id);
            return { id, biz };
          } catch (innerErr) {
            return { id, biz: null };
          }
        }
      };

      const enrichPromises = uniqueIds.map(id => fetchDetails(id));
      const enrichedResults = await Promise.all(enrichPromises);

      businessDetailsMap = enrichedResults.reduce((acc, item) => {
        if (item.biz) acc[item.id] = item.biz;
        return acc;
      }, {});

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
      message: totalResults > 0 ? 'Search completed' : 'No results found',
      data: results,
      pagination: { page: pageNum, limit: limitNum, totalPages: Math.ceil(totalResults / limitNum), totalResults }
    });
  } catch (error) {
    console.error('Public search error:', error);
    res.status(500).json({ success: false, message: 'Error during search', error: error.message });
  }
};

export default {
  searchAcrossModels,
};