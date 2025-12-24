import express from 'express';
import {
  createModule,
  getModules,
  getModuleById,
  updateModule,
} from '../controllers/module.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Modules
 *   description: Platform modules and feature configuration
 */


/**
 * @swagger
 * /api/modules:
 *   post:
 *     summary: Create a new module
 *     description: Defines a new platform module and its feature capabilities.
 *     tags: [Modules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *             properties:
 *               code:
 *                 type: string
 *                 example: LAB
 *               name:
 *                 type: string
 *                 example: Laboratory Services
 *               enabled:
 *                 type: boolean
 *                 example: true
 *               config:
 *                 type: object
 *                 properties:
 *                   allowsInventory:
 *                     type: boolean
 *                     example: false
 *                   allowsPrescription:
 *                     type: boolean
 *                     example: true
 *                   allowsAppointments:
 *                     type: boolean
 *                     example: false
 *                   allowsPackages:
 *                     type: boolean
 *                     example: true
 *     responses:
 *       201:
 *         description: Module created successfully
 *       400:
 *         description: Validation error or duplicate module code
 *       500:
 *         description: Server error
 */
router.post('/', createModule);

/**
 * @swagger
 * /api/modules:
 *   get:
 *     summary: Get all modules
 *     description: Fetches all platform modules.
 *     tags: [Modules]
 *     responses:
 *       200:
 *         description: Modules fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Modules fetched successfully
 *                 count:
 *                   type: number
 *                   example: 4
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */
router.get('/', getModules);

/**
 * @swagger
 * /api/modules/{id}:
 *   get:
 *     summary: Get a module by ID
 *     description: Retrieves module details by module ID.
 *     tags: [Modules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Module ID
 *     responses:
 *       200:
 *         description: Module fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Module not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getModuleById);

/**
 * @swagger
 * /api/modules/{id}:
 *   patch:
 *     summary: Update a module
 *     description: Updates module metadata or feature configuration.
 *     tags: [Modules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Module ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Module Name
 *               enabled:
 *                 type: boolean
 *                 example: true
 *               config:
 *                 type: object
 *                 properties:
 *                   allowsInventory:
 *                     type: boolean
 *                   allowsPrescription:
 *                     type: boolean
 *                   allowsAppointments:
 *                     type: boolean
 *                   allowsPackages:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Module updated successfully
 *       400:
 *         description: Invalid update payload
 *       404:
 *         description: Module not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', updateModule);

export default router;
