import { Catalog, Service } from '../models/index.js';
import logger from '../utils/appLogger.js';
import mongoose from 'mongoose';

export const createService = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productData } = req.body;

    /* ---------------- Guard: productData ---------------- */
    if (!productData) {
      return res.status(400).json({ message: 'productData is required' });
    }

    let parsedProductData;
    try {
      parsedProductData = JSON.parse(productData);
    } catch (err) {
      return res.status(400).json({
        message: `Invalid JSON format in productData. ${err.message}`,
      });
    }

    const {
      catalogNodeId,
      serviceType,
      labDetails,
      includedServices,
      pricing,
    } = parsedProductData;

    /* ---------------- Guard: serviceType ---------------- */
    if (!serviceType) {
      return res.status(400).json({ message: 'serviceType is required' });
    }

    if (!['LAB_TEST', 'LAB_PACKAGE'].includes(serviceType)) {
      return res.status(400).json({
        message: `Invalid serviceType. Allowed: LAB_TEST, LAB_PACKAGE`,
      });
    }

    /* ---------------- Guard: catalog ---------------- */
    if (!catalogNodeId || !mongoose.Types.ObjectId.isValid(catalogNodeId)) {
      return res.status(400).json({ message: 'Valid catalogNodeId is required' });
    }

    const category = await Catalog.findById(catalogNodeId).session(session);
    if (!category) {
      return res.status(404).json({
        message: `Catalog with id ${catalogNodeId} not found`,
      });
    }

    /* ---------------- Guard: pricing ---------------- */
    if (!Array.isArray(pricing) || pricing.length === 0) {
      return res.status(400).json({
        message: 'pricing is required and must be a non-empty array',
      });
    }

    /* =====================================================
       LAB_TEST VALIDATION
    ====================================================== */
    if (serviceType === 'LAB_TEST') {
      if (!labDetails) {
        return res.status(400).json({
          message: 'labDetails are required for LAB_TEST',
        });
      }

      if (includedServices && includedServices.length > 0) {
        return res.status(400).json({
          message: 'includedServices is not allowed for LAB_TEST',
        });
      }
    }

    /* =====================================================
       LAB_PACKAGE VALIDATION
    ====================================================== */
    if (serviceType === 'LAB_PACKAGE') {
      if (!Array.isArray(includedServices) || includedServices.length === 0) {
        return res.status(400).json({
          message: 'includedServices is required for LAB_PACKAGE',
        });
      }

      // Validate ObjectIds
      const invalidIds = includedServices.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id)
      );

      if (invalidIds.length > 0) {
        return res.status(400).json({
          message: 'includedServices contains invalid ObjectIds',
        });
      }

      // Ensure all included services exist and are LAB_TEST
      const labTests = await Service.find({
        _id: { $in: includedServices },
        serviceType: 'LAB_TEST',
      }).session(session);

      if (labTests.length !== includedServices.length) {
        return res.status(400).json({
          message: 'All includedServices must be existing LAB_TEST services',
        });
      }

      // Prevent nested packages
      const hasNestedPackage = labTests.some(
        (s) => s.serviceType !== 'LAB_TEST'
      );

      if (hasNestedPackage) {
        return res.status(400).json({
          message: 'LAB_PACKAGE cannot include another package',
        });
      }
    }

    /* ---------------- Create service ---------------- */
    const newService = new Service({
      ...parsedProductData,
      product: catalogNodeId,
    });

    await newService.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: 'Service created successfully',
      data: newService,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error('Error creating service', 'createService', error);

    return res.status(500).json({
      message: 'Error creating service',
      error: error.message,
    });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    /* ---------------- Guard: ID ---------------- */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid service ID' });
    }

    /* ---------------- Query ---------------- */
    const service = await Service.findById(id)
      .populate({
        path: 'includedServices',
        select: 'name serviceType labDetails',
      })
      .lean();

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    /* ---------------- Optional sanity check ---------------- */
    if (
      service.serviceType === 'LAB_PACKAGE' &&
      (!service.includedServices || service.includedServices.length === 0)
    ) {
      logger.warn(
        `LAB_PACKAGE ${id} has no includedServices`,
        'getServiceById'
      );
    }

    return res.status(200).json({
      message: 'Service fetched successfully',
      data: service,
    });
  } catch (error) {
    logger.error('Error fetching service by ID', 'getServiceById', error);
    return res.status(500).json({
      message: 'Error fetching service',
      error: error.message,
    });
  }
};


export const deleteService = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    /* ---------------- Guard: ID ---------------- */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid service ID' });
    }

    /* ---------------- Fetch service ---------------- */
    const service = await Service.findById(id).session(session);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    /* =====================================================
       LAB_TEST: Prevent deletion if used in package
    ====================================================== */
    if (service.serviceType === 'LAB_TEST') {
      const usedInPackage = await Service.exists({
        serviceType: 'LAB_PACKAGE',
        includedServices: service._id,
      }).session(session);

      if (usedInPackage) {
        return res.status(400).json({
          message:
            'Cannot delete LAB_TEST. It is used in one or more LAB_PACKAGE services.',
        });
      }
    }

    /* ---------------- Delete ---------------- */
    await Service.deleteOne({ _id: id }).session(session);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: 'Service deleted successfully',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error('Error deleting service', 'deleteService', error);

    return res.status(500).json({
      message: 'Error deleting service',
      error: error.message,
    });
  }
};


export const updateService = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const updateData = req.body;

    /* ---------------- Guard: ID ---------------- */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid service ID' });
    }

    /* ---------------- Fetch existing service ---------------- */
    const existingService = await Service.findById(id).session(session);
    if (!existingService) {
      return res.status(404).json({ message: 'Service not found' });
    }

    /* ---------------- Prevent serviceType change ---------------- */
    if (
      updateData.serviceType &&
      updateData.serviceType !== existingService.serviceType
    ) {
      return res.status(400).json({
        message: 'serviceType cannot be changed once created',
      });
    }

    /* =====================================================
       LAB_TEST VALIDATION
    ====================================================== */
    if (existingService.serviceType === 'LAB_TEST') {
      if (updateData.includedServices?.length) {
        return res.status(400).json({
          message: 'includedServices not allowed for LAB_TEST',
        });
      }
    }

    /* =====================================================
       LAB_PACKAGE VALIDATION
    ====================================================== */
    if (existingService.serviceType === 'LAB_PACKAGE') {
      if (
        updateData.includedServices &&
        (!Array.isArray(updateData.includedServices) ||
          updateData.includedServices.length === 0)
      ) {
        return res.status(400).json({
          message: 'LAB_PACKAGE must contain at least one includedService',
        });
      }

      if (updateData.includedServices) {
        const labTests = await Service.find({
          _id: { $in: updateData.includedServices },
          serviceType: 'LAB_TEST',
        }).session(session);

        if (labTests.length !== updateData.includedServices.length) {
          return res.status(400).json({
            message: 'All includedServices must be valid LAB_TEST services',
          });
        }
      }
    }

    /* ---------------- Perform update ---------------- */
    const updatedService = await Service.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: 'Service updated successfully',
      data: updatedService,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error('Error updating service', 'updateService', error);

    return res.status(500).json({
      message: 'Error updating service',
      error: error.message,
    });
  }
};


export const listServices = async (req, res) => {
  try {
    const {
      categoryId,
      serviceType,
      searchTerm,
      pincode,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    /* ---------------- Build filter ---------------- */
    const filter = {};

    // Service type filter
    if (serviceType) {
      filter.serviceType = serviceType;
    }

    // Category filter
    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({
          message: 'Invalid categoryId',
        });
      }
      filter.product = categoryId;
    }

    // Search by name (case-insensitive)
    if (searchTerm) {
      filter.name = { $regex: searchTerm, $options: 'i' };
    }

    // Pricing / pincode filter
    if (pincode) {
      filter.pricing = {
        $elemMatch: {
          pincode: String(pincode),
        },
      };
    }

    /* ---------------- Query ---------------- */
    const [services, total] = await Promise.all([
      Service.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('includedServices', 'name serviceType')
        .lean(),

      Service.countDocuments(filter),
    ]);

    /* ---------------- Response ---------------- */
    return res.status(200).json({
      message: 'Services fetched successfully',
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      data: services,
    });
  } catch (error) {
    logger.error('Error fetching services', 'listServices', error);
    return res.status(500).json({
      message: 'Error fetching services',
      error: error.message,
    });
  }
};
