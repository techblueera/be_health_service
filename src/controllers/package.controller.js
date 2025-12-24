import PackageItem from '../models/packageItem.model.js';
import Offering from '../models/offering.model.js';
import logger from '../utils/appLogger.js';

export const addItemToPackage = async (req, res) => {
  const { packageOfferingId, includedOfferingId } = req.body;

  try {
    const pkg = await Offering.findById(packageOfferingId);
    if (!pkg || pkg.type !== 'PACKAGE') {
      return res.status(400).json({
        message: 'Invalid package offering',
      });
    }

    const item = await Offering.findById(includedOfferingId);
    if (!item) {
      return res.status(404).json({
        message: 'Included offering not found',
      });
    }

    const packageItem = new PackageItem({
      packageOfferingId,
      includedOfferingId,
    });

    await packageItem.save();

    res.status(201).json({
      message: 'Item added to package successfully',
      data: packageItem,
    });
  } catch (error) {
    logger.error('Error adding item to package', 'addItemToPackage', error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Item already exists in this package',
      });
    }

    res.status(500).json({
      message: 'Error adding item to package',
      error: error.message,
    });
  }
};


export const getPackageItems = async (req, res) => {
  const { packageId } = req.params;

  try {
    const items = await PackageItem.find({
      packageOfferingId: packageId,
    }).populate('includedOfferingId');

    res.status(200).json({
      message: 'Package items fetched successfully.',
      count: items.length,
      data: items,
    });
  } catch (error) {
    logger.error('Error fetching package items', 'getPackageItems', error);
    res.status(500).json({
      message: 'Error fetching package items',
      error: error.message,
    });
  }
};

export const removeItemFromPackage = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await PackageItem.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        message: 'Package item not found',
      });
    }

    res.status(200).json({
      message: 'Item removed from package successfully.',
    });
  } catch (error) {
    logger.error(
      'Error removing item from package',
      'removeItemFromPackage',
      error
    );
    res.status(500).json({
      message: 'Error removing item from package',
      error: error.message,
    });
  }
};

