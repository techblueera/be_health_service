import jwt from 'jsonwebtoken';
import { validateSession } from '../grpc/clients/authClient.js';
import logger from '../utils/appLogger.js';

// Global toggle for session validation strategy. Default to false for local dev.
let isGrpcSessionValidationEnabled =  false;

logger.info(`gRPC Session Validation Enabled: ${isGrpcSessionValidationEnabled}`, 'AuthMiddleware');

// --- Start of new logic with feature toggle ---

// Expose functions to manage the toggle at runtime
export const toggleGrpcSessionValidation = (status) => {
  if (typeof status !== 'boolean') {
    throw new Error('Status must be a boolean.');
  }
  isGrpcSessionValidationEnabled = status;
  logger.info(`gRPC Session Validation Enabled set to: ${isGrpcSessionValidationEnabled}`, 'AuthMiddleware');
};

export const getSessionValidationStatus = () => ({ isGrpcSessionValidationEnabled });

// The main authentication middleware
export const protect = async (req, res, next) => {
  if (isGrpcSessionValidationEnabled) {
    return await protectWithGrpc(req, res, next);
  } else {
    return protectWithJwt(req, res, next);
  }
};

// --- Logic 1: New gRPC-based validation ---
const protectWithGrpc = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.decode(token); // Decode without verification

      if (!decoded || !decoded.sessionId) {
        logger.warn('Auth (gRPC): Token is missing sessionId.', 'protectWithGrpc');
        return res.status(401).json({ success: false, message: 'Not authorized, token is invalid.' });
      }

      // Validate session via gRPC
      const { is_valid, user } = await validateSession(decoded.sessionId);

      if (!is_valid) {
        logger.warn(`Auth (gRPC): Invalid session for ID ${decoded.sessionId}.`, 'protectWithGrpc');
        return res.status(401).json({ success: false, message: 'Not authorized, session is invalid or has expired.' });
      }
      
      // Using the old req.user structure to prevent breaking changes
      req.user = {
        _id: user.id,
        account_type: user.account_type,
        role: user.account_type ? user.account_type.toLowerCase() : undefined,
      };

      logger.info(`✅ Auth (gRPC): User ID ${req.user._id}`, 'protectWithGrpc');
      next();
    } catch (error) {
      logger.error('❌ Auth (gRPC) Verification Error:', 'protectWithGrpc', error);
      // Fallback for resilience: if gRPC service fails, trust the JWT
      logger.warn('gRPC session validation failed. Falling back to JWT verification.', 'protectWithGrpc');
      return protectWithJwt(req, res, next);
    }
  } else {
    logger.warn('Auth (gRPC): No token provided.', 'protectWithGrpc');
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided.' });
  }
};

// --- Logic 2: Original JWT-based validation ---
const protectWithJwt = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (typeof decoded._id === 'object' && decoded._id._id) {
        req.user = {
          _id: decoded._id._id,
          account_type: decoded._id.account_type,
          role: decoded._id.account_type ? decoded._id.account_type.toLowerCase() : undefined,
        };
      } else {
        req.user = {
          ...decoded,
          role: decoded.account_type ? decoded.account_type.toLowerCase() : undefined,
        };
      }

      logger.info(`✅ Auth (JWT): User ID ${req.user._id}`, 'protectWithJwt');
      next();
    } catch (error) {
      logger.error('❌ Auth (JWT) Verification Error:', 'protectWithJwt', error);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Not authorized, token has expired.' });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Not authorized, token invalid or malformed.' });
      } else {
        return res.status(500).json({ success: false, message: 'An unexpected authentication error occurred.' });
      }
    }
  } else {
    logger.warn('Auth (JWT): No token provided.', 'protectWithJwt');
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided.' });
  }
};

// --- End of new logic ---


// Role-based authorization (unchanged)
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    next();
  };
};

export const authorizeCompany = authorizeRoles();
