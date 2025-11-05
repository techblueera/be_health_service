import express from "express";
import { helloController } from "../controllers/hello.controller.js";
const router = express.Router();

/**
 * @swagger
 * /api/hello:
 *   get:
 *     summary: Returns a hello message
 *     tags: [Hello]
 *     responses:
 *       200:
 *         description: A successful response.
 */
router.get("/", helloController);
export default router;
