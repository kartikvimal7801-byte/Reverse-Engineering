const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

// Track last activity for session management
const userActivity = new Map();

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: { code: 'AUTH_ERROR', message: 'Authentication required' }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check inactivity timeout (30 minutes)
    const lastActivity = userActivity.get(decoded.userId);
    if (lastActivity) {
      const inactiveTime = Date.now() - lastActivity;
      if (inactiveTime > 30 * 60 * 1000) {
        userActivity.delete(decoded.userId);
        return res.status(401).json({
          error: { code: 'SESSION_EXPIRED', message: 'Session expired due to inactivity' }
        });
      }
    }

    // Update last activity
    userActivity.set(decoded.userId, Date.now());

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: { code: 'AUTH_ERROR', message: 'Invalid or expired token' }
      });
    }
    console.error('Authentication error:', error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Authentication failed' }
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'AUTH_ERROR', message: 'Authentication required' }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
