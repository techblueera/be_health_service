// // routes/pharmacyRoutes/pharmacyContact.routes.js
// import express from 'express';
// import {
//   createPharmacyContact,
//   getPharmacyContact,
//   updatePharmacyContact,
//   deletePharmacyContact,
// } from "../../controllers/pharmacyControllers/pharmacyContact.controller.js";
// import { protect } from "../../middlewares/auth.middleware.js";

// const router = express.Router();

// /**
//  * @swagger
//  * tags:
//  *   name: PharmacyContact
//  *   description: Pharmacy contact and communication details
//  */

// /**
//  * @swagger
//  * components:
//  *   schemas:
//  *     PharmacyContact:
//  *       type: object
//  *       properties:
//  *         _id:
//  *           type: string
//  *           example: 64f203c2a1b23c0012345678
//  *         pharmacyName:
//  *           type: string
//  *           example: City Care Pharmacy
//  *         website:
//  *           type: string
//  *           example: https://citycarepharmacy.com
//  *         address:
//  *           type: string
//  *           example: 45 Ring Road, New Delhi
//  *         pincode:
//  *           type: string
//  *           example: "110021"
//  *         location:
//  *           type: object
//  *           properties:
//  *             type:
//  *               type: string
//  *               enum: [Point]
//  *             coordinates:
//  *               type: array
//  *               items:
//  *                 type: number
//  *         phone:
//  *           type: string
//  *           example: +91-9876543210
//  *         email:
//  *           type: string
//  *           example: info@citycarepharmacy.com
//  *         openFrom:
//  *           type: string
//  *           example: "09:00 AM"
//  *         openTill:
//  *           type: string
//  *           example: "10:00 PM"
//  *         createdAt:
//  *           type: string
//  *           format: date-time
//  *         updatedAt:
//  *           type: string
//  *           format: date-time
//  */

// /**
//  * @swagger
//  * /api/ms/contact:
//  *   post:
//  *     summary: Create pharmacy contact details
//  *     tags: [PharmacyContact]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               pharmacyName:
//  *                 type: string
//  *               website:
//  *                 type: string
//  *               address:
//  *                 type: string
//  *               pincode:
//  *                 type: string
//  *               phone:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *               openFrom:
//  *                 type: string
//  *               openTill:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: Pharmacy contact created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/PharmacyContact'
//  *       400:
//  *         description: Validation or creation error
//  */
// router.post('/', protect, createPharmacyContact);

// /**
//  * @swagger
//  * /api/ms/pharmacy-contact:
//  *   get:
//  *     summary: Get pharmacy contact details for logged-in business
//  *     tags: [PharmacyContact]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Pharmacy contact details fetched successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/PharmacyContact'
//  *       404:
//  *         description: Pharmacy contact not found
//  *       500:
//  *         description: Server error
//  */
// router.get('/', protect, getPharmacyContact);

// /**
//  * @swagger
//  * /api/ms/pharmacy-contact:
//  *   put:
//  *     summary: Update pharmacy contact details (upsert supported)
//  *     tags: [PharmacyContact]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               pharmacyName:
//  *                 type: string
//  *               website:
//  *                 type: string
//  *               address:
//  *                 type: string
//  *               pincode:
//  *                 type: string
//  *               phone:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *               openFrom:
//  *                 type: string
//  *               openTill:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Pharmacy contact updated successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/PharmacyContact'
//  *       400:
//  *         description: Validation error
//  */
// router.put('/', protect, updatePharmacyContact);

// /**
//  * @swagger
//  * /api/ms/pharmacy-contact:
//  *   delete:
//  *     summary: Delete pharmacy contact details
//  *     tags: [PharmacyContact]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Pharmacy contact deleted successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Pharmacy contact deleted successfully
//  *       404:
//  *         description: Pharmacy contact not found
//  *       500:
//  *         description: Server error
//  */
// router.delete('/', protect, deletePharmacyContact);

// export default router;
