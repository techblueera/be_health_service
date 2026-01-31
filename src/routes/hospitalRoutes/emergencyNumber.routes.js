// routes/hospitalRoutes/emergencyNumber.routes.js
import express from 'express';
import {
  upsertEmergencyNumber,
  getEmergencyNumber,
  deleteEmergencyNumber,
} from '../../controllers/hospitalControllers/emergencyNumber.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: EmergencyNumber
 *   description: Emergency Number management for hospital/business
 */

/**
 * @swagger
 * /api/hp/emergency-number:
 *   put:
 *     summary: Add or update emergency number
 *     tags: [EmergencyNumber]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emergencyNumber:
 *                 type: number
 *                 example: 9123456789
 *     responses:
 *       200:
 *         description: Emergency number updated successfully
 *       400:
 *         description: Validation error
 */
router.put('/', protect, upsertEmergencyNumber);

/**
 * @swagger
 * /api/hp/emergency-number:
 *   get:
 *     summary: Get emergency number
 *     tags: [EmergencyNumber]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Emergency number fetched successfully
 *       404:
 *         description: Emergency number not found
 *       500:
 *         description: Server error
 */
router.get('/', protect, getEmergencyNumber);

/**
 * @swagger
 * /api/hp/emergency-number:
 *   delete:
 *     summary: Delete emergency number
 *     tags: [EmergencyNumber]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Emergency number deleted successfully
 *       404:
 *         description: Emergency number not found
 *       500:
 *         description: Server error
 */
router.delete('/', protect, deleteEmergencyNumber);

export default router;
