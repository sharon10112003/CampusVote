const AuditLog = require('../models/AuditLog');

const logAction = async (req, action, details = '') => {
  try {
    if (req.user) {
      await AuditLog.create({
        action,
        userId: req.user._id,
        userName: req.user.name,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        details,
      });
    }
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};

module.exports = logAction;
