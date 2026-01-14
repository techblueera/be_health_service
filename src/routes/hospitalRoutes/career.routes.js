// routes/careerRoutes.js
import express from 'express';
import {
  createCareer,
  getAllCareers,
  getActiveCareers,
  getCareerById,
  updateCareer,
  deleteCareer,
  toggleCareerStatus,
} from "../../controllers/hospitalControllers/career.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Careers
 *   description: Career and job openings management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Career:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f1f2c2a1b23c0012345678
 *         position:
 *           type: string
 *           example: Staff Nurse
 *         description:
 *           type: string
 *           example: Responsible for patient care and monitoring
 *         requirements:
 *           type: string
 *           example: BSc Nursing with 2+ years experience
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
 * /api/careers:
 *   post:
 *     summary: Create a new career opening
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - position
 *             properties:
 *               position:
 *                 type: string
 *               description:
 *                 type: string
 *               requirements:
 *                 type: string
 *     responses:
 *       201:
 *         description: Career created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Career'
 *       400:
 *         description: Validation error
 */

router.post('/', protect, createCareer);

/**
 * @swagger
 * /api/careers:
 *   get:
 *     summary: Get all careers for logged-in business
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of careers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Career'
 *       500:
 *         description: Server error
 */

router.get('/', protect, getAllCareers);

/**
 * @swagger
 * /api/careers/active:
 *   get:
 *     summary: Get all active career openings
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active careers list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Career'
 *       500:
 *         description: Server error
 */
router.get('/active', protect, getActiveCareers);

/**
 * @swagger
 * /api/careers/{id}:
 *   get:
 *     summary: Get career by ID
 *     tags: [Careers]
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
 *         description: Career details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Career'
 *       404:
 *         description: Career not found
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, getCareerById);

/**
 * @swagger
 * /api/careers/{id}:
 *   put:
 *     summary: Update career details
 *     tags: [Careers]
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
 *               position:
 *                 type: string
 *               description:
 *                 type: string
 *               requirements:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Career updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Career'
 *       404:
 *         description: Career not found
 *       400:
 *         description: Validation error
 */

router.put('/:id', protect, updateCareer);

/**
 * @swagger
 * /api/careers/{id}:
 *   delete:
 *     summary: Delete a career
 *     tags: [Careers]
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
 *         description: Career deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Career deleted successfully
 *       404:
 *         description: Career not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, deleteCareer);

/**
 * @swagger
 * /api/careers/{id}/status:
 *   patch:
 *     summary: Toggle career active status
 *     tags: [Careers]
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
 *         description: Career status toggled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Career'
 *       404:
 *         description: Career not found
 *       400:
 *         description: Error toggling status
 */
router.patch('/:id/status', protect, toggleCareerStatus);

export default router;