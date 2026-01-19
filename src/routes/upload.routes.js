// routes/upload.routes.js
import { Router } from 'express';
import { generateUploadUrl } from '../utils/s3Uploader.js';

const router = Router();

/**
 * @swagger
 * /api/upload/init:
 *   get:
 *     summary: Generate a pre-signed PUT URL for direct S3 upload
 *     tags: [Upload]
 *     parameters:
 *       - in: query
 *         name: fileName
 *         schema:
 *           type: string
 *           example: myVideo.mp4
 *         required: true
 *         description: Original file name (used to extract extension)
 *       - in: query
 *         name: fileType
 *         schema:
 *           type: string
 *           example: video/mp4
 *         required: true
 *         description: MIME type of the file
 *     responses:
 *       200:
 *         description: URLs generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadUrl:
 *                   type: string
 *                   format: uri
 *                   example: https://my-bucket.s3.amazonaws.com/uploads/1719991234567-uuid123.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&...
 *                 publicUrl:
 *                   type: string
 *                   format: uri
 *                   example: https://my-bucket.s3.us-east-1.amazonaws.com/uploads/1719991234567-uuid123.mp4
 *                 fileKey:
 *                   type: string
 *                   example: uploads/1719991234567-uuid123.mp4
 *       400:
 *         description: Missing or invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: fileName and fileType are required
 *       500:
 *         description: Server error while generating URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to generate upload URL
 */
router.get('/init', generateUploadUrl);

export default router;