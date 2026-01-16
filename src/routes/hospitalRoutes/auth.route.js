import express from "express";
import {
  toggleValidation,
  getValidationStatus,
} from "../../controllers/auth.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth Feature Toggle
 *   description: API to manage authentication strategies at runtime.
 */

/**
 * @swagger
 * /api/auth/session-validation/status:
 *   get:
 *     summary: Get current session validation status
 *     tags: [Auth Feature Toggle]
 *     description: Returns the current state of the gRPC session validation feature toggle.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 isGrpcSessionValidationEnabled:
 *                   type: boolean
 *                   example: false
 *       500:
 *         description: Internal server error.
 */
router.get("/session-validation/status", getValidationStatus);

/**
 * @swagger
 * /api/auth/session-validation/toggle:
 *   put:
 *     summary: Toggle gRPC session validation on or off
 *     tags: [Auth Feature Toggle]
 *     description: Toggles the authentication strategy between JWT-only and gRPC session validation.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enabled
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 description: Set to `true` to enable gRPC validation, `false` to disable.
 *     responses:
 *       200:
 *         description: Successfully updated the status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "gRPC session validation is now ENABLED."
 *       400:
 *         description: Bad request, "enabled" property is missing or not a boolean.
 *       500:
 *         description: Internal server error.
 */
router.put("/session-validation/toggle", toggleValidation);

export default router;
