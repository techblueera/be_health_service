import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 👉 FIX: If _id is nested inside another object, flatten it manually
      if (typeof decoded._id === 'object' && decoded._id._id) {
        req.user = {
          _id: decoded._id._id,
          account_type: decoded._id.account_type,
        };
      } else {
        req.user = decoded;
      }

      console.log(`✅ Auth Middleware (verified payload): User ID ${req.user._id}`);
      next();
    } catch (error) {
      console.error("❌ Auth Middleware Verification Error:", error.message);

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: "Not authorized, token has expired.",
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: "Not authorized, token invalid or malformed.",
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "An unexpected authentication error occurred.",
          error: error.message,
        });
      }
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided.",
    });
  }
};

// ✅ Role check disabled — everyone is allowed
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    next();
  };
};

// ✅ Company check disabled too
export const authorizeCompany = authorizeRoles();
