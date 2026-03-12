import express from 'express';
import {
  createGalleryPhoto,
  getGalleryPhotos,
  getGalleryPhotoById,
  updateGalleryPhoto,
  deleteGalleryPhoto,
  deleteGalleryImage,
} from '../../controllers/medicalStore/gallery.controller.js';
import { validate } from '../../utils/validate.js';
import { 
  createGalleryPhotoSchema, 
  updateGalleryPhotoSchema,
  deleteGalleryImageSchema,
} from '../../validations/gallery.validation.js';
// import { protect } from '../../middlewares/auth.middlewares.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// All gallery routes are protected
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Gallery
 *   description: Business gallery photo management
 */

/**
 * @swagger
 * /api/ms/gallery:
 *   post:
 *     summary: Add a new gallery entry with one or more photos
 *     tags: [Gallery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGalleryPhoto'
 *           example:
 *             title: "Opening Day"
 *             imageUrls: 
 *               - "https://example.com/image1.jpg"
 *               - "https://example.com/image2.png"
 *     responses:
 *       201:
 *         description: Gallery entry created successfully.
 *       400:
 *         description: Bad request (e.g., invalid URL or missing fields).
 *       401:
 *         description: Unauthorized.
 */
router.post('/', validate(createGalleryPhotoSchema), createGalleryPhoto);

/**
 * @swagger
 * /api/ms/gallery:
 *   get:
 *     summary: Get all gallery entries for the business
 *     tags: [Gallery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of gallery entries.
 *       401:
 *         description: Unauthorized.
 */
router.get('/', getGalleryPhotos);

/**
 * @swagger
 * /api/ms/gallery/{id}:
 *   get:
 *     summary: Get a single gallery entry by ID
 *     tags: [Gallery]
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
 *         description: A single gallery entry.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Gallery entry not found.
 */
router.get('/:id', getGalleryPhotoById);

/**
 * @swagger
 * /api/ms/gallery/{id}:
 *   put:
 *     summary: Update a gallery entry's title or images
 *     tags: [Gallery]
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
 *             $ref: '#/components/schemas/UpdateGalleryPhoto'
 *     responses:
 *       200:
 *         description: Gallery entry updated successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Gallery entry not found.
 */
router.put('/:id', validate(updateGalleryPhotoSchema), updateGalleryPhoto);

/**
 * @swagger
 * /api/ms/gallery/{id}/images:
 *   delete:
 *     summary: Delete a single image from a gallery entry
 *     tags: [Gallery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the gallery entry.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *             example:
 *               imageUrl: "https://example.com/image2.png"
 *     responses:
 *       200:
 *         description: Image deleted successfully from the gallery entry.
 *       400:
 *         description: Bad request (e.g., invalid URL).
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Gallery entry or specific image not found.
 */
router.delete('/:id/images', validate(deleteGalleryImageSchema), deleteGalleryImage);


/**
 * @swagger
 * /api/ms/gallery/{id}:
 *   delete:
 *     summary: Delete a gallery entry
 *     tags: [Gallery]
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
 *         description: Gallery entry deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Gallery entry not found.
 */
router.delete('/:id', deleteGalleryPhoto);

export default router;