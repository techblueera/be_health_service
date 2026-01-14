// routes/facilityRoutes.js
import express from 'express';
import {
  createFacility,
  getAllFacilities,
  getFacilitiesByType,
  getFacilityById,
  updateFacility,
  deleteFacility,
} from "../../controllers/hospitalControllers/facility.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Facilities
 *   description: Hospital facilities and amenities management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Facility:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f25bc2a1b23c0012345678
 *         name:
 *           type: string
 *           example: 24x7 Ambulance Service
 *         type:
 *           type: string
 *           enum:
 *             - Insurance
 *             - Ambulance
 *             - GovernmentScheme
 *             - BloodBank
 *             - Other
 *           example: Ambulance
 *         description:
 *           type: string
 *           example: Fully equipped emergency ambulances available round the clock
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
 * /api/facilities:
 *   post:
 *     summary: Create a new facility
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum:
 *                   - Insurance
 *                   - Ambulance
 *                   - GovernmentScheme
 *                   - BloodBank
 *                   - Other
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Facility created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Facility'
 *       400:
 *         description: Validation error
 */
router.post('/', protect, createFacility);

/**
 * @swagger
 * /api/facilities:
 *   get:
 *     summary: Get all facilities for logged-in business
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of facilities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Facility'
 *       500:
 *         description: Server error
 */
router.get('/', protect, getAllFacilities);

/**
 * @swagger
 * /api/facilities/type/{type}:
 *   get:
 *     summary: Get facilities by type
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - Insurance
 *             - Ambulance
 *             - GovernmentScheme
 *             - BloodBank
 *             - Other
 *     responses:
 *       200:
 *         description: Facilities filtered by type
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Facility'
 *       500:
 *         description: Server error
 */
router.get('/type/:type', protect, getFacilitiesByType);

/**
 * @swagger
 * /api/facilities/{id}:
 *   get:
 *     summary: Get facility by ID
 *     tags: [Facilities]
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
 *         description: Facility details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Facility'
 *       404:
 *         description: Facility not found
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, getFacilityById);


/**
 * @swagger
 * /api/facilities/{id}:
 *   put:
 *     summary: Update facility details
 *     tags: [Facilities]
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
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum:
 *                   - Insurance
 *                   - Ambulance
 *                   - GovernmentScheme
 *                   - BloodBank
 *                   - Other
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Facility updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Facility'
 *       404:
 *         description: Facility not found
 *       400:
 *         description: Validation error
 */

router.put('/:id', protect, updateFacility);

/**
 * @swagger
 * /api/facilities/{id}:
 *   delete:
 *     summary: Delete a facility
 *     tags: [Facilities]
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
 *         description: Facility deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Facility deleted successfully
 *       404:
 *         description: Facility not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, deleteFacility);

export default router;