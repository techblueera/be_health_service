// routes/emergencyServiceRoutes.js
import express from 'express';
import {
  createEmergencyService,
  getAllEmergencyServices,
  getEmergencyServicesByDepartment,
  getEmergencyServiceById,
  updateEmergencyService,
  deleteEmergencyService,
} from "../../controllers/hospitalControllers/emergencyService.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: EmergencyServices
 *   description: Emergency and critical care services management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EmergencyService:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f245c2a1b23c0012345678
 *         departmentId:
 *           type: string
 *           example: 64f21ac2a1b23c0098765432
 *         name:
 *           type: string
 *           example: 24x7 Emergency Care
 *         type:
 *           type: string
 *           enum:
 *             - Emergency
 *             - Trauma
 *             - ICU
 *             - CCU
 *             - NICU
 *             - PICU
 *           example: Emergency
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/emergency-services:
 *   post:
 *     summary: Create a new emergency service
 *     tags: [EmergencyServices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - departmentId
 *               - name
 *             properties:
 *               departmentId:
 *                 type: string
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum:
 *                   - Emergency
 *                   - Trauma
 *                   - ICU
 *                   - CCU
 *                   - NICU
 *                   - PICU
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Emergency service created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmergencyService'
 *       400:
 *         description: Validation error
 */

router.post('/', protect, createEmergencyService);

/**
 * @swagger
 * /api/emergency-services:
 *   get:
 *     summary: Get all emergency services for logged-in business
 *     tags: [EmergencyServices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of emergency services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EmergencyService'
 *       500:
 *         description: Server error
 */

router.get('/', protect, getAllEmergencyServices);

/**
 * @swagger
 * /api/emergency-services/department/{departmentId}:
 *   get:
 *     summary: Get emergency services by department ID
 *     tags: [EmergencyServices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Emergency services under the department
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EmergencyService'
 *       500:
 *         description: Server error
 */

router.get('/department/:departmentId', protect, getEmergencyServicesByDepartment);

/**
 * @swagger
 * /api/emergency-services/{id}:
 *   get:
 *     summary: Get emergency service by ID
 *     tags: [EmergencyServices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Emergency service details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmergencyService'
 *       404:
 *         description: Emergency service not found
 *       500:
 *         description: Server error
 */

router.get('/:id', protect, getEmergencyServiceById);

/**
 * @swagger
 * /api/emergency-services/{id}:
 *   put:
 *     summary: Update emergency service details
 *     tags: [EmergencyServices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departmentId:
 *                 type: string
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum:
 *                   - Emergency
 *                   - Trauma
 *                   - ICU
 *                   - CCU
 *                   - NICU
 *                   - PICU
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Emergency service updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmergencyService'
 *       404:
 *         description: Emergency service not found
 *       400:
 *         description: Validation error
 */

router.put('/:id', protect, updateEmergencyService);
/**
 * @swagger
 * /api/emergency-services/{id}:
 *   delete:
 *     summary: Delete an emergency service
 *     tags: [EmergencyServices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Emergency service deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Emergency Service deleted successfully
 *       404:
 *         description: Emergency service not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, deleteEmergencyService);

export default router;