// routes/bedRoutes.js
import express from 'express';
import {
  createBed,
  getAllBeds,
  getBedsByWard,
  getBedById,
  updateBed,
  deleteBed,
  toggleBedOccupancy,
} from "../../controllers/hospitalControllers/bed.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Beds
 *   description: Hospital bed management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Bed:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f1d2c1a1b23c0012345678
 *         wardId:
 *           type: string
 *           example: 64f1c9c2a1b23c0099999999
 *         bedNumber:
 *           type: string
 *           example: B-12
 *         image:
 *           type: string
 *           example: https://cdn.example.com/bed.jpg
 *         description:
 *           type: string
 *           example: ICU bed near window
 *         fees:
 *           type: number
 *           example: 2500
 *         isOccupied:
 *           type: boolean
 *           example: false
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
 * /api/beds:
 *   post:
 *     summary: Create a new bed
 *     tags: [Beds]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wardId
 *               - bedNumber
 *             properties:
 *               wardId:
 *                 type: string
 *               bedNumber:
 *                 type: string
 *               image:
 *                 type: string
 *               description:
 *                 type: string
 *               fees:
 *                 type: number
 *     responses:
 *       201:
 *         description: Bed created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bed'
 *       400:
 *         description: Validation error
 */
router.post('/', protect, createBed);

/**
 * @swagger
 * /api/beds:
 *   get:
 *     summary: Get all beds for logged-in business
 *     tags: [Beds]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of beds
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bed'
 *       500:
 *         description: Server error
 */
router.get('/', protect, getAllBeds);

/**
 * @swagger
 * /api/beds/ward/{wardId}:
 *   get:
 *     summary: Get beds by ward ID
 *     tags: [Beds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Beds under the ward
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bed'
 *       500:
 *         description: Server error
 */

router.get('/ward/:wardId', protect, getBedsByWard);

/**
 * @swagger
 * /api/beds/{id}:
 *   get:
 *     summary: Get a bed by ID
 *     tags: [Beds]
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
 *         description: Bed details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bed'
 *       404:
 *         description: Bed not found
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, getBedById);

/**
 * @swagger
 * /api/beds/{id}:
 *   put:
 *     summary: Update bed details
 *     tags: [Beds]
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
 *               wardId:
 *                 type: string
 *               bedNumber:
 *                 type: string
 *               image:
 *                 type: string
 *               description:
 *                 type: string
 *               fees:
 *                 type: number
 *               isOccupied:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Bed updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bed'
 *       404:
 *         description: Bed not found
 *       400:
 *         description: Validation error
 */
router.put('/:id', protect, updateBed);

/**
 * @swagger
 * /api/beds/{id}:
 *   delete:
 *     summary: Delete a bed
 *     tags: [Beds]
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
 *         description: Bed deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bed deleted successfully
 *       404:
 *         description: Bed not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, deleteBed);

/**
 * @swagger
 * /api/beds/{id}/occupancy:
 *   patch:
 *     summary: Toggle bed occupancy status
 *     tags: [Beds]
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
 *         description: Bed occupancy toggled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bed'
 *       404:
 *         description: Bed not found
 *       400:
 *         description: Error toggling occupancy
 */
router.patch('/:id/occupancy', protect, toggleBedOccupancy);

export default router;