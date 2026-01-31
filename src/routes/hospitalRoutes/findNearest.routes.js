// routes/hospitalRoutes/findNearest.routes.js
import express from 'express';
import { findNearestHospitals } from '../../controllers/hospitalControllers/findNearest.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: FindNearest
 *   description: Find nearest hospitals
 */

/**
 * @swagger
 * /api/hp/hospitals/nearest:
 *   post:
 *     summary: Find nearest hospitals
 *     tags: [FindNearest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pincode:
 *                 type: string
 *               radius:
 *                 type: number
 *     responses:
 *       200:
 *         description: A list of nearest hospitals
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/', findNearestHospitals);

export default router;
