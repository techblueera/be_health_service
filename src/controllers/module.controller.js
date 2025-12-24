import Module from '../models/module.model.js';
import logger from '../utils/appLogger.js';

/**
 * POST /modules
 */
export const createModule = async (req, res) => {
  const { code, name, config, isActive } = req.body;

  try {
    const module = new Module({
      code,
      name,
      config,
      isActive,
    });

    await module.save();

    res.status(201).json({
      message: 'Module created successfully.',
      data: module,
    });
  } catch (error) {
    logger.error('Error creating module', 'createModule', error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Module with this code already exists.',
      });
    }

    res.status(500).json({
      message: 'Error creating module',
      error: error.message,
    });
  }
};

/**
 * GET /modules
 */
export const getModules = async (req, res) => {
  try {
    const modules = await Module.find();

    res.status(200).json({
      message: 'Modules fetched successfully.',
      count: modules.length,
      data: modules,
    });
  } catch (error) {
    logger.error('Error fetching modules', 'getModules', error);
    res.status(500).json({
      message: 'Error fetching modules',
      error: error.message,
    });
  }
};

/**
 * GET /modules/:id
 */
export const getModuleById = async (req, res) => {
  const { id } = req.params;

  try {
    const module = await Module.findById(id);

    if (!module) {
      return res.status(404).json({
        message: 'Module not found',
      });
    }

    res.status(200).json({
      message: 'Module fetched successfully.',
      data: module,
    });
  } catch (error) {
    logger.error('Error fetching module', 'getModuleById', error);
    res.status(500).json({
      message: 'Error fetching module',
      error: error.message,
    });
  }
};

/**
 * PATCH /modules/:id
 */
export const updateModule = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const module = await Module.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!module) {
      return res.status(404).json({
        message: 'Module not found',
      });
    }

    res.status(200).json({
      message: 'Module updated successfully.',
      data: module,
    });
  } catch (error) {
    logger.error('Error updating module', 'updateModule', error);
    res.status(500).json({
      message: 'Error updating module',
      error: error.message,
    });
  }
};
