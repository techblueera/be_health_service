import Module from '../models/module.model.js';
import logger from '../utils/appLogger.js';
import CatalogNode from "../models/catalogNode.model.js";
/**
 * POST /modules
 */
export const createModule = async (req, res) => {
  const { enabled, ...rest } = req.body;

  try {
    const payload = {
      ...rest,
      ...(enabled !== undefined && { isActive: enabled }),
    };

    const module = await Module.create(payload);

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
  const { enabled, code, ...rest } = req.body;

  try {
    if (code !== undefined) {
      return res.status(400).json({
        message: 'Module code cannot be updated',
      });
    }

    const updatePayload = {
      ...rest,
      ...(enabled !== undefined && { isActive: enabled }),
    };

    const module = await Module.findByIdAndUpdate(
      id,
      { $set: updatePayload },
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


export const getCatalogTreeByModuleKey = async (req, res) => {
  try {
    const { moduleKey } = req.params;

    if (!moduleKey) {
      return res.status(400).json({ message: "moduleKey is required" });
    }

    const module = await Module.findOne({
      code: moduleKey,
      isActive: true,
    }).lean();

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    console.log('Found module:', module);

    const nodes = await CatalogNode.find({
      moduleId: module._id,
      isActive: true,
    })
      .sort({ level: 1, order: 1 })
      .lean();

    if (nodes.length === 0) {
      return res.json({
        message: "Catalog tree fetched successfully",
        count: 0,
        data: [],
      });
    }

    const map = new Map();
    nodes.forEach(n =>
      map.set(n._id.toString(), { ...n, children: [] })
    );

    const tree = [];
    nodes.forEach(n => {
      if (n.parentId) {
        map.get(n.parentId.toString())?.children.push(
          map.get(n._id.toString())
        );
      } else {
        tree.push(map.get(n._id.toString()));
      }
    });

    return res.json({
      message: "Catalog tree fetched successfully",
      count: tree.length,
      data: tree,
    });

  } catch (error) {
    logger.error("Error fetching catalog tree by moduleKey", error);
    return res.status(500).json({
      message: "Error fetching catalog tree by moduleKey",
      error: error.message,
    });
  }
};