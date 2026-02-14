// routes/pharmacyRoutes/pharmacyAboutUs.routes.js
import express from 'express';
import {
    upsertPharmacyAboutUs,
    getPharmacyAboutUs,
} from '../../controllers/medicalStore/pharmacyAboutUs.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: PharmacyAboutUs
 *   description: Pharmacy about us management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PharmacyAboutUs:
 *       type: object
 *       properties:
 *         businessId:
 *           type: string
 *         logo:
 *           type: string
 *         medicalStoreImage:
 *           type: string
 */

/**
 * @swagger
 * /api/ms/about-us:
 *   put:
 *     summary: Create or update pharmacy about us details
 *     tags: [PharmacyAboutUs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *               medicalStoreImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pharmacy about us updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PharmacyAboutUs'
 *       400:
 *         description: Validation error
 */
router.put('/', upsertPharmacyAboutUs);

/**
 * @swagger
 * /api/ms/about-us:
 *   get:
 *     summary: Get pharmacy about us details
 *     tags: [PharmacyAboutUs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pharmacy about us details fetched successfully
 *       404:
 *         description: Pharmacy about us not found
 *       500:
 *         description: Server error
 */
router.get('/', getPharmacyAboutUs);

export default router;
