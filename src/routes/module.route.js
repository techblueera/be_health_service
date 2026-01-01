import express from "express";
import {
  createModule,
  getModules,
  getModuleById,
  updateModule,
} from "../controllers/module.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Modules
 *  description: Platform modules and feature configuration
 */

/**
 * @swagger
 * /api/modules:
 *   post:
 *     summary: "[Admin/Business] Create a new module"
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
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
 *                 example: HOSPITAL
 *               name:
 *                 type: string
 *                 example: Hospital Module
 *               description:
 *                 type: string
 *                 example: Handles hospital-related services
 *               enabled:
 *                 type: boolean
 *                 example: true
 *                 description: Maps internally to isActive
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
 *       201:
 *         description: Module created successfully
 *       409:
 *         description: Module with this code already exists
 *       500:
 *         description: Internal Server Error
 */
router.post("/", protect, authorizeRoles("BUSINESS", "ADMIN"), createModule);

/**
 * @swagger
 * /api/modules:
 *   get:
 *     summary: Get all modules
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
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal Server Error
 */
router.get("/", getModules);

/**
 * @swagger
 * /api/modules/{id}:
 *   get:
 *     summary: Get module by ID
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
 *       404:
 *         description: Module not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id", getModuleById);

/**
 * @swagger
 * /api/modules/{id}:
 *   patch:
 *     summary: "[Admin/Business] Update module details"
 *     description: Module code cannot be updated. Use `enabled` to toggle active state.
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
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
 *               description:
 *                 type: string
 *               enabled:
 *                 type: boolean
 *                 description: Maps internally to isActive
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
 *         description: Module code cannot be updated
 *       404:
 *         description: Module not found
 *       500:
 *         description: Internal Server Error
 */
router.patch(
  "/:id",
  protect,
  authorizeRoles("BUSINESS", "ADMIN"),
  updateModule
);

export default router;
