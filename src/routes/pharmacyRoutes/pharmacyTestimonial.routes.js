// routes/pharmacyRoutes/pharmacyTestimonial.routes.js
import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import {
  createPharmacyTestimonial,
  getAllPharmacyTestimonials,
  getActivePharmacyTestimonials,
  getPharmacyTestimonialById,
  updatePharmacyTestimonial,
  deletePharmacyTestimonial,
  togglePharmacyTestimonialStatus
} from '../../controllers/pharmacyControllers/pharmacyTestimonial.controller.js';

const router = Router();

router.use(protect);

/**
 * @swagger
 * components:
 *   schemas:
 *     PharmacyTestimonial:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: Jane Doe
 *         image:
 *           type: string
 *           example: https://cdn.app/user2.jpg
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           example: 4
 *         message:
 *           type: string
 *           example: Very helpful staff!
 *         designation:
 *           type: string
 *           example: Customer
 *         isActive:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /api/ms/testimonials:
 *   post:
 *     summary: Create a pharmacy testimonial
 *     tags: [PharmacyTestimonials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PharmacyTestimonial'
 *     responses:
 *       201:
 *         description: Pharmacy testimonial created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', createPharmacyTestimonial);

/**
 * @swagger
 * /api/ms/testimonials:
 *   get:
 *     summary: Get all pharmacy testimonials
 *     tags: [PharmacyTestimonials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pharmacy testimonials fetched successfully
 *       500:
 *         description: Server error
 */
router.get('/', getAllPharmacyTestimonials);

/**
 * @swagger
 * /api/ms/testimonials/active:
 *   get:
 *     summary: Get active pharmacy testimonials only
 *     tags: [PharmacyTestimonials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active pharmacy testimonials fetched successfully
 *       500:
 *         description: Server error
 */
router.get('/active', getActivePharmacyTestimonials);

/**
 * @swagger
 * /api/ms/testimonials/{id}:
 *   get:
 *     summary: Get pharmacy testimonial by ID
 *     tags: [PharmacyTestimonials]
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
 *         description: Pharmacy testimonial fetched successfully
 *       404:
 *         description: Pharmacy testimonial not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getPharmacyTestimonialById);

/**
 * @swagger
 * /api/ms/testimonials/{id}:
 *   put:
 *     summary: Update a pharmacy testimonial
 *     tags: [PharmacyTestimonials]
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
 *         description: Pharmacy testimonial updated successfully
 *       404:
 *         description: Pharmacy testimonial not found
 *       400:
 *         description: Validation error
 */
router.put('/:id', updatePharmacyTestimonial);

/**
 * @swagger
 * /api/ms/testimonials/{id}/toggle-status:
 *   patch:
 *     summary: Toggle pharmacy testimonial active status
 *     tags: [PharmacyTestimonials]
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
 *         description: Pharmacy testimonial status toggled successfully
 *       404:
 *         description: Pharmacy testimonial not found
 *       400:
 *         description: Failed to toggle status
 */
router.patch('/:id/toggle-status', togglePharmacyTestimonialStatus);

/**
 * @swagger
 * /api/ms/testimonials/{id}:
 *   delete:
 *     summary: Delete a pharmacy testimonial
 *     tags: [PharmacyTestimonials]
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
 *         description: Pharmacy testimonial deleted successfully
 *       404:
 *         description: Pharmacy testimonial not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deletePharmacyTestimonial);

export default router;
