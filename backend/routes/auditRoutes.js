const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all audit logs (with pagination)
// @route   GET /api/audit
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const pageSize = 20;
    const page = Number(req.query.pageNumber) || 1;

    const count = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .populate('userId', 'name registerNumber email')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ logs, page, pages: Math.ceil(count / pageSize), total: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
