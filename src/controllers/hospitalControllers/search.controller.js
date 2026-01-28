// controllers/searchController.js
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
  Testimonial
};

export const searchAcrossModels = async (req, res) => {
  try {
    const businessId = req.user._id;

    // 1. Extract pagination and control parameters
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      keyword = '',
      ...otherFilters
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const results = {};
    let totalResults = 0;

    // 2. Search through ALL models automatically
    for (const modelName of Object.keys(hospitalModels)) {
      const model = hospitalModels[modelName];
      
      if (!model || !model.schema) continue;

      // Build query
      const query = { businessId }; // Always filter by businessId
      let hasSearchCriteria = false;

      // 3. Handle keyword search (searches across multiple text fields)
      if (keyword) {
        const modelSchemaPaths = Object.keys(model.schema.paths);
        const textFields = modelSchemaPaths.filter(path => {
          const schemaType = model.schema.paths[path].instance;
          return schemaType === 'String' && path !== 'businessId'; // Exclude businessId
        });

        if (textFields.length > 0) {
          query.$or = textFields.map(field => ({
            [field]: { $regex: keyword, $options: 'i' }
          }));
          hasSearchCriteria = true;
        }
      }

      // 4. Handle specific field filters (auto-detect which models have these fields)
      const modelSchemaPaths = Object.keys(model.schema.paths);
      for (const [key, value] of Object.entries(otherFilters)) {
        if (modelSchemaPaths.includes(key)) {
          hasSearchCriteria = true;
          
          // Handle different data types
          const schemaType = model.schema.paths[key].instance;
          
          if (schemaType === 'String') {
            // Case-insensitive string search
            query[key] = { $regex: value, $options: 'i' };
          } else if (schemaType === 'Number') {
            // Exact number match
            query[key] = Number(value);
          } else if (schemaType === 'Boolean') {
            // Boolean conversion
            query[key] = value === 'true' || value === true;
          } else if (schemaType === 'Date') {
            // Date range support
            query[key] = new Date(value);
          } else {
            // Default exact match
            query[key] = value;
          }
        }
      }

      // 5. Only search if we have meaningful criteria
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
            results[modelName] = {
              data,
              count
            };
            totalResults += count;
          }
        } catch (err) {
          console.error(`Error searching ${modelName}:`, err.message);
          // Continue with other models even if one fails
        }
      }
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
    console.error('Search error:', error);
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