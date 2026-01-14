// routes/doctorRoutes.js
import express from 'express';
import {
  createDoctor,
  getAllDoctors,
  getDoctorsByDepartment,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  setDoctorLeave,
  removeDoctorLeave,
} from "../../controllers/hospitalControllers/doctor.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor management and availability
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Doctor:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f234c2a1b23c0012345678
 *         departmentId:
 *           type: string
 *           example: 64f21ac2a1b23c0098765432
 *         name:
 *           type: string
 *           example: Dr. Ananya Sharma
 *         specialization:
 *           type: string
 *           example: Cardiologist
 *         qualification:
 *           type: string
 *           example: MD, DM (Cardiology)
 *         photo:
 *           type: string
 *           example: https://cdn.example.com/doctors/ananya.jpg
 *         availability:
 *           type: string
 *           example: Mon–Fri 10:00–16:00
 *         fees:
 *           type: number
 *           example: 800
 *         isOnLeave:
 *           type: boolean
 *           example: false
 *         leaveFrom:
 *           type: string
 *           format: date
 *           example: 2026-01-20
 *         leaveTo:
 *           type: string
 *           format: date
 *           example: 2026-01-25
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
 * /api/doctors:
 *   post:
 *     summary: Create a new doctor
 *     tags: [Doctors]
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
 *               specialization:
 *                 type: string
 *               qualification:
 *                 type: string
 *               photo:
 *                 type: string
 *               availability:
 *                 type: string
 *               fees:
 *                 type: number
 *     responses:
 *       201:
 *         description: Doctor created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       400:
 *         description: Validation error
 */

router.post('/', protect, createDoctor);

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get all doctors for logged-in business
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of doctors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Doctor'
 *       500:
 *         description: Server error
 */
router.get('/', protect, getAllDoctors);

/**
 * @swagger
 * /api/doctors/department/{departmentId}:
 *   get:
 *     summary: Get doctors by department ID
 *     tags: [Doctors]
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
 *         description: Doctors under the department
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Doctor'
 *       500:
 *         description: Server error
 */
router.get('/department/:departmentId', protect, getDoctorsByDepartment);

/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     summary: Get doctor by ID
 *     tags: [Doctors]
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
 *         description: Doctor details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, getDoctorById);

/**
 * @swagger
 * /api/doctors/{id}:
 *   put:
 *     summary: Update doctor details
 *     tags: [Doctors]
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
 *               specialization:
 *                 type: string
 *               qualification:
 *                 type: string
 *               photo:
 *                 type: string
 *               availability:
 *                 type: string
 *               fees:
 *                 type: number
 *     responses:
 *       200:
 *         description: Doctor updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       404:
 *         description: Doctor not found
 *       400:
 *         description: Validation error
 */
router.put('/:id', protect, updateDoctor);

/**
 * @swagger
 * /api/doctors/{id}:
 *   delete:
 *     summary: Delete a doctor
 *     tags: [Doctors]
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
 *         description: Doctor deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Doctor deleted successfully
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Server error
 */

router.delete('/:id', protect, deleteDoctor);

/**
 * @swagger
 * /api/doctors/{id}/leave:
 *   put:
 *     summary: Set doctor leave period
 *     tags: [Doctors]
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
 *               - leaveFrom
 *               - leaveTo
 *             properties:
 *               leaveFrom:
 *                 type: string
 *                 format: date
 *               leaveTo:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Doctor leave set successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       404:
 *         description: Doctor not found
 *       400:
 *         description: Validation error
 */

router.put('/:id/leave', protect, setDoctorLeave);

/**
 * @swagger
 * /api/doctors/{id}/leave:
 *   delete:
 *     summary: Remove doctor leave
 *     tags: [Doctors]
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
 *         description: Doctor leave removed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       404:
 *         description: Doctor not found
 *       400:
 *         description: Error removing leave
 */

router.delete('/:id/leave', protect, removeDoctorLeave);

export default router;