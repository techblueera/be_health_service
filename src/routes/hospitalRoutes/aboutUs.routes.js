// routes/aboutUsRoutes.js
import express from "express";
import {
  createAboutUs,
  getAboutUs,
  updateAboutUs,
  deleteAboutUs,
} from "../../controllers/hospitalControllers/aboutUs.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AboutUs
 *   description: About Us management for hospital/business
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AboutUs:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f1c9c2a1b23c0012345678
 *         businessId:
 *           type: string
 *           example: 64f1c9c2a1b23c0098765432
 *         visionMission:
 *           type: string
 *           example: To provide world-class healthcare
 *         history:
 *           type: string
 *           example: Established in 1998 with a mission to serve
 *         management:
 *           type: string
 *           example: Managed by a team of senior doctors
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
 * /api/about-us:
 *   post:
 *     summary: Create About Us details
 *     tags: [AboutUs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               visionMission:
 *                 type: string
 *               history:
 *                 type: string
 *               management:
 *                 type: string
 *     responses:
 *       201:
 *         description: About Us created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AboutUs'
 *       400:
 *         description: Validation or creation error
 */
router.post("/", protect, createAboutUs);

/**
 * @swagger
 * /api/about-us:
 *   get:
 *     summary: Get About Us details for logged-in business
 *     tags: [AboutUs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: About Us fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AboutUs'
 *       404:
 *         description: About Us not found
 *       500:
 *         description: Server error
 */
router.get("/", protect, getAboutUs);

/**
 * @swagger
 * /api/about-us:
 *   put:
 *     summary: Update About Us details (upsert supported)
 *     tags: [AboutUs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               visionMission:
 *                 type: string
 *               history:
 *                 type: string
 *               management:
 *                 type: string
 *     responses:
 *       200:
 *         description: About Us updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AboutUs'
 *       400:
 *         description: Validation error
 */
router.put("/", protect, updateAboutUs);

/**
 * @swagger
 * /api/about-us:
 *   delete:
 *     summary: Delete About Us details
 *     tags: [AboutUs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: About Us deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: About Us deleted successfully
 *       404:
 *         description: About Us not found
 *       500:
 *         description: Server error
 */
router.delete("/", protect, deleteAboutUs);

export default router;
