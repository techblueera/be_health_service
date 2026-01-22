import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import {
  createTestimonial,
  getAllTestimonials,
  getActiveTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialStatus
} from '../../controllers/hospitalControllers/testimonial.controller.js';

const router = Router();

/**
 * ======================================================
 * All routes are protected
 * ======================================================
 */
router.use(protect);

/**
 * ======================================================
 * Swagger Schemas
 * ======================================================
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Testimonial:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: John Doe
 *         image:
 *           type: string
 *           example: https://cdn.app/user.jpg
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *         message:
 *           type: string
 *           example: Excellent service and doctors!
 *         designation:
 *           type: string
 *           example: Patient
 *         isActive:
 *           type: boolean
 *           example: true
 */

/**
 * ======================================================
 * Create Testimonial
 * ======================================================
 */

/**
 * @swagger
 * /api/hp/testimonials:
 *   post:
 *     summary: Create a testimonial
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Testimonial'
 *     responses:
 *       201:
 *         description: Testimonial created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', createTestimonial);

/**
 * ======================================================
 * Get All Testimonials
 * ======================================================
 */

/**
 * @swagger
 * /api/hp/testimonials:
 *   get:
 *     summary: Get all testimonials
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Testimonials fetched successfully
 *       500:
 *         description: Server error
 */
router.get('/', getAllTestimonials);

/**
 * ======================================================
 * Get Active Testimonials
 * ======================================================
 */

/**
 * @swagger
 * /api/hp/testimonials/active:
 *   get:
 *     summary: Get active testimonials only
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active testimonials fetched successfully
 *       500:
 *         description: Server error
 */
router.get('/active', getActiveTestimonials);

/**
 * ======================================================
 * Get Testimonial By ID
 * ======================================================
 */

/**
 * @swagger
 * /api/hp/testimonials/{id}:
 *   get:
 *     summary: Get testimonial by ID
 *     tags: [Testimonials]
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
 *         description: Testimonial fetched successfully
 *       404:
 *         description: Testimonial not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getTestimonialById);

/**
 * ======================================================
 * Update Testimonial
 * ======================================================
 */

/**
 * @swagger
 * /api/hp/testimonials/{id}:
 *   put:
 *     summary: Update a testimonial
 *     tags: [Testimonials]
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
 *               image:
 *                 type: string
 *               rating:
 *                 type: number
 *               message:
 *                 type: string
 *               designation:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Testimonial updated successfully
 *       404:
 *         description: Testimonial not found
 *       400:
 *         description: Validation error
 */
router.put('/:id', updateTestimonial);

/**
 * ======================================================
 * Toggle Testimonial Status
 * ======================================================
 */

/**
 * @swagger
 * /api/hp/testimonials/{id}/toggle-status:
 *   patch:
 *     summary: Toggle testimonial active status
 *     tags: [Testimonials]
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
 *         description: Testimonial status toggled successfully
 *       404:
 *         description: Testimonial not found
 *       400:
 *         description: Failed to toggle status
 */
router.patch('/:id/toggle-status', toggleTestimonialStatus);

/**
 * ======================================================
 * Delete Testimonial
 * ======================================================
 */

/**
 * @swagger
 * /api/hp/testimonials/{id}:
 *   delete:
 *     summary: Delete a testimonial
 *     tags: [Testimonials]
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
 *         description: Testimonial deleted successfully
 *       404:
 *         description: Testimonial not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteTestimonial);

export default router;
