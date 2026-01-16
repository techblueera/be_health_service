import { toggleGrpcSessionValidation, getSessionValidationStatus } from '../middlewares/auth.middleware.js';
import logger from '../utils/appLogger.js';

/**
 * @description Toggles the gRPC session validation feature.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const toggleValidation = (req, res) => {
  const { enabled } = req.body;

  if (typeof enabled !== 'boolean') {
    logger.warn('Toggle validation attempt with invalid body.', 'auth.controller');
    return res.status(400).json({ success: false, message: 'Request body must contain an "enabled" boolean property.' });
  }

  try {
    toggleGrpcSessionValidation(enabled);
    res.status(200).json({
      success: true,
      message: `gRPC session validation is now ${enabled ? 'ENABLED' : 'DISABLED'}.`,
    });
  } catch (error) {
    logger.error('Failed to toggle session validation.', 'auth.controller', error);
    res.status(500).json({ success: false, message: 'An internal error occurred.' });
  }
};

/**
 * @description Gets the current status of the gRPC session validation feature.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const getValidationStatus = (req, res) => {
  try {
    const status = getSessionValidationStatus();
    res.status(200).json({
      success: true,
      ...status,
    });
  } catch (error) {
    logger.error('Failed to get session validation status.', 'auth.controller', error);
    res.status(500).json({ success: false, message: 'An internal error occurred.' });
  }
};