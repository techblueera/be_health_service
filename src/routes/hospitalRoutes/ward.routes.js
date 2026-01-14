// routes/wardRoutes.js
import express from 'express';
import {
  createWard,
  getAllWards,
  getWardsByDepartment,
  getWardById,
  updateWard,
  deleteWard,
  updateAvailableBeds,
} from "../../controllers/hospitalControllers/ward.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wards
 *   description: Hospital ward and bed capacity management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Ward:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f26dc2a1b23c0012345678
 *         departmentId:
 *           type: string
 *           example: 64f21ac2a1b23c0098765432
 *         name:
 *           type: string
 *           example: General Ward A
 *         type:
 *           type: string
 *           enum:
 *             - General
 *             - Semi-Private
 *             - Private
 *             - Isolation
 *             - Pediatric
 *             - Maternity
 *           example: General
 *         totalBeds:
 *           type: number
 *           example: 40
 *         availableBeds:
 *           type: number
 *           example: 12
 *         fees:
 *           type: number
 *           example: 1500
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
 * /api/wards:
 *   post:
 *     summary: Create a new ward
 *     tags: [Wards]
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
 *                   - General
 *                   - Semi-Private
 *                   - Private
 *                   - Isolation
 *                   - Pediatric
 *                   - Maternity
 *               totalBeds:
 *                 type: number
 *               availableBeds:
 *                 type: number
 *               fees:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Ward created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ward'
 *       400:
 *         description: Validation error
 */
router.post('/', protect, createWard);

/**
 * @swagger
 * /api/wards:
 *   get:
 *     summary: Get all wards for logged-in business
 *     tags: [Wards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of wards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ward'
 *       500:
 *         description: Server error
 */
router.get('/', protect, getAllWards);

/**
 * @swagger
 * /api/wards/department/{departmentId}:
 *   get:
 *     summary: Get wards by department ID
 *     tags: [Wards]
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
 *         description: Wards under the department
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ward'
 *       500:
 *         description: Server error
 */
router.get('/department/:departmentId', protect, getWardsByDepartment);

/**
 * @swagger
 * /api/wards/{id}:
 *   get:
 *     summary: Get ward by ID
 *     tags: [Wards]
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
 *         description: Ward details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ward'
 *       404:
 *         description: Ward not found
 *       500:
 *         description: Server error
 */

router.get('/:id', protect, getWardById);

/**
 * @swagger
 * /api/wards/{id}:
 *   put:
 *     summary: Update ward details
 *     tags: [Wards]
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
 *                   - General
 *                   - Semi-Private
 *                   - Private
 *                   - Isolation
 *                   - Pediatric
 *                   - Maternity
 *               totalBeds:
 *                 type: number
 *               availableBeds:
 *                 type: number
 *               fees:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Ward updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ward'
 *       404:
 *         description: Ward not found
 *       400:
 *         description: Validation error
 */
router.put('/:id', protect, updateWard);

/**
 * @swagger
 * /api/wards/{id}:
 *   delete:
 *     summary: Delete a ward
 *     tags: [Wards]
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
 *         description: Ward deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ward deleted successfully
 *       404:
 *         description: Ward not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, deleteWard);

/**
 * @swagger
 * /api/wards/{id}/beds:
 *   patch:
 *     summary: Update available beds for a ward
 *     tags: [Wards]
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
 *             required:
 *               - availableBeds
 *             properties:
 *               availableBeds:
 *                 type: number
 *                 example: 10
 *     responses:
 *       200:
 *         description: Available beds updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ward'
 *       404:
 *         description: Ward not found
 *       400:
 *         description: Validation error
 */
router.patch('/:id/beds', protect, updateAvailableBeds);

export default router;