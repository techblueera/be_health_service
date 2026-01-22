// routes/departmentRoutes.js
import express from 'express';
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getMainDepartments,
  getSubDepartments,
  getDepartmentWithChildren,
} from "../../controllers/hospitalControllers/department.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Hospital department management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DepartmentTree:
 *       type: object
 *       properties:
 *         department:
 *           $ref: '#/components/schemas/Department'
 *         subDepartments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Department'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f21ac2a1b23c0012345678
 *         name:
 *           type: string
 *           example: Cardiology
 *         type:
 *           type: string
 *           enum:
 *             - OPD
 *             - IPD
 *             - Emergency
 *             - Diagnostic
 *             - MedicalStore
 *             - Other
 *           example: OPD
 *         icon:
 *           type: string
 *           example: https://cdn.example.com/icons/cardiology.svg
 *         isActive:
 *           type: boolean
 *           example: true
 *         parentId:
 *           type: string
 *           example: 64f20bc2a1b23c0098765432
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
 * /api/hp/departments:
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum:
 *                   - OPD
 *                   - IPD
 *                   - Emergency
 *                   - Diagnostic
 *                   - MedicalStore
 *                   - Other
 *               icon:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       400:
 *         description: Validation error
 */
router.post('/', protect, createDepartment);


/**
 * @swagger
 * /api/hp/departments:
 *   get:
 *     summary: Get all departments for logged-in business
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of departments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Department'
 *       500:
 *         description: Server error
 */
router.get('/', protect, getAllDepartments);



/**
 * @swagger
 * /api/hp/departments/main:
 *   get:
 *     summary: Get main (top-level) departments
 *     description: >
 *       Returns departments that do not have a parent.
 *       Used for department update screens and main navigation.
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of main departments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Department'
 *       500:
 *         description: Server error
 */

router.get('/main', protect, getMainDepartments); // For Update Tab

/**
 * @swagger
 * /api/hp/departments/{id}/with-children:
 *   get:
 *     summary: Get department along with its sub-departments
 *     description: >
 *       Returns a department and all its immediate child departments.
 *       Useful for building department trees.
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department with sub-departments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentTree'
 *       404:
 *         description: Department not found
 *       500:
 *         description: Server error
 */

router.get('/:id/with-children', protect, getDepartmentWithChildren); // Complete tree

/**
 * @swagger
 * /api/hp/departments/{parentId}/sub:
 *   get:
 *     summary: Get sub-departments by parent department
 *     description: >
 *       Returns all child departments under a given parent department.
 *       Commonly used for OPD and department-specific pages.
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Parent department ID
 *     responses:
 *       200:
 *         description: List of sub-departments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Department'
 *       500:
 *         description: Server error
 */
router.get('/:parentId/sub', protect, getSubDepartments);

/**
 * @swagger
 * /api/hp/departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Departments]
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
 *         description: Department details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       404:
 *         description: Department not found
 *       500:
 *         description: Server error
 */

router.get('/:id', protect, getDepartmentById);

/**
 * @swagger
 * /api/hp/departments/{id}:
 *   put:
 *     summary: Update department details
 *     tags: [Departments]
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
 *               type:
 *                 type: string
 *                 enum:
 *                   - OPD
 *                   - IPD
 *                   - Emergency
 *                   - Diagnostic
 *                   - MedicalStore
 *                   - Other
 *               icon:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Department updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       404:
 *         description: Department not found
 *       400:
 *         description: Validation error
 */
router.put('/:id', protect, updateDepartment);

/**
 * @swagger
 * /api/hp/departments/{id}:
 *   delete:
 *     summary: Delete a department
 *     tags: [Departments]
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
 *         description: Department deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Department deleted successfully
 *       404:
 *         description: Department not found
 *       500:
 *         description: Server error
 */

router.delete('/:id', protect, deleteDepartment);

export default router;