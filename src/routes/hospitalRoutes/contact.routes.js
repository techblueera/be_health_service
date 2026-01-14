// routes/contactRoutes.js
import express from 'express';
import {
  createContact,
  getContact,
  updateContact,
  deleteContact,
} from "../../controllers/hospitalControllers/contact.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Hospital contact and communication details
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f203c2a1b23c0012345678
 *         hospitalName:
 *           type: string
 *           example: City Care Hospital
 *         website:
 *           type: string
 *           example: https://citycarehospital.com
 *         address:
 *           type: string
 *           example: 45 Ring Road, New Delhi
 *         admissionPhone:
 *           type: string
 *           example: +91-9876543210
 *         principalPhone:
 *           type: string
 *           example: +91-9123456789
 *         email:
 *           type: string
 *           example: info@citycarehospital.com
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
 * /api/contact:
 *   post:
 *     summary: Create contact details
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hospitalName:
 *                 type: string
 *               website:
 *                 type: string
 *               address:
 *                 type: string
 *               admissionPhone:
 *                 type: string
 *               principalPhone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contact created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Validation or creation error
 */
router.post('/', protect, createContact);

/**
 * @swagger
 * /api/contact:
 *   get:
 *     summary: Get contact details for logged-in business
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contact details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.get('/', protect, getContact);

/**
 * @swagger
 * /api/contact:
 *   put:
 *     summary: Update contact details (upsert supported)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hospitalName:
 *                 type: string
 *               website:
 *                 type: string
 *               address:
 *                 type: string
 *               admissionPhone:
 *                 type: string
 *               principalPhone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Validation error
 */
router.put('/', protect, updateContact);

/**
 * @swagger
 * /api/contact:
 *   delete:
 *     summary: Delete contact details
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contact deleted successfully
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.delete('/', protect, deleteContact);

export default router;