import CatalogNode from '../models/catalogNode.model.js';
import Offering from '../models/offering.model.js';
import logger from '../utils/appLogger.js';

export const getCatalogForLocation = async (req, res) => {
  const { moduleId } = req.query;
  const location = req.location;

  try {
    if (!location) {
      return res.status(400).json({
        message: 'Pincode is required',
      });
    }

    const catalogNodes = await CatalogNode.find({
      module: moduleId,
      isActive: true,
    }).lean();

    res.status(200).json({
      message: 'Catalog fetched successfully',
      count: catalogNodes.length,
      data: catalogNodes,
    });
  } catch (error) {
    logger.error(
      'Error fetching catalog',
      'getCatalogForLocation',
      error
    );
    res.status(500).json({
      message: 'Error fetching catalog',
      error: error.message,
    });
  }
};


export const getOfferingsForNode = async (req, res) => {
  const { nodeId } = req.params;
  const location = req.location; // resolved earlier

  try {
    if (!location) {
      return res.status(400).json({
        message: 'Pincode is required',
      });
    }

    const offerings = await Offering.find({
      catalogNodeId: nodeId,
      isActive: true,
      serviceablePincodes: location.pincode,
    }).lean();

    res.status(200).json({
      message: 'Offerings fetched successfully',
      count: offerings.length,
      data: offerings,
    });
  } catch (error) {
    logger.error(
      'Error fetching offerings for node',
      'getOfferingsForNode',
      error
    );
    res.status(500).json({
      message: 'Error fetching offerings',
      error: error.message,
    });
  }
};


export const searchCatalog = async (req, res) => {
  const { q } = req.query;
  const location = req.location;

  try {
    if (!q) {
      return res.status(400).json({
        message: 'Search query is required',
      });
    }

    if (!location) {
      return res.status(400).json({
        message: 'Pincode is required',
      });
    }

    const offerings = await Offering.find({
      isActive: true,
      serviceablePincodes: location.pincode,
      name: { $regex: q, $options: 'i' },
    }).lean();

    res.status(200).json({
      message: 'Search results fetched successfully',
      count: offerings.length,
      data: offerings,
    });
  } catch (error) {
    logger.error(
      'Error searching catalog',
      'searchCatalog',
      error
    );
    res.status(500).json({
      message: 'Error searching catalog',
      error: error.message,
    });
  }
};

