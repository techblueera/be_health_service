
// controllers/pharmacyControllers/pharmacySearchController.js
import * as pharmacyModels from '../../models/pharmacyModels/index.js';

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

    // 2. Get all pharmacy model names
    const allModels = Object.keys(pharmacyModels).filter(
      key => key !== 'default' && typeof pharmacyModels[key] === 'function'
    );

    // 3. Search through ALL pharmacy models automatically
    for (const modelName of allModels) {
      const model = pharmacyModels[modelName];
      
      if (!model || !model.schema) continue;

      // Build query
      const query = { businessId }; // Always filter by businessId
      let hasSearchCriteria = false;

      // 4. Handle keyword search (searches across multiple text fields)
      if (keyword) {
        const modelSchemaPaths = Object.keys(model.schema.paths);
        const textFields = modelSchemaPaths.filter(path => {
          const schemaType = model.schema.paths[path].instance;
          return schemaType === 'String' && path !== 'businessId';
        });

        if (textFields.length > 0) {
          query.$or = textFields.map(field => ({
            [field]: { $regex: keyword, $options: 'i' }
          }));
          hasSearchCriteria = true;
        }
      }

      // 5. Handle specific field filters (auto-detect which models have these fields)
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
            // Exact number match or range
            if (value.includes('-')) {
              const [min, max] = value.split('-').map(Number);
              query[key] = { $gte: min, $lte: max };
            } else {
              query[key] = Number(value);
            }
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

      // 6. Only search if we have meaningful criteria
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
    console.error('Pharmacy search error:', error);
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