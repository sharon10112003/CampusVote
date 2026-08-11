const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

const parseDate = (dStr) => {
  if (!dStr) return null;
  const parts = dStr.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      // DD/MM/YYYY
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
  }
  const parsed = new Date(dStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { registerNumber, password, dob } = req.body;

  try {
    const user = await User.findOne({ 
      registerNumber: { $regex: new RegExp(`^${registerNumber}$`, 'i') } 
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid register number or credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is disabled. Contact Admin.' });
    }

    let isMatch = false;

    if (user.role === 'admin') {
      if (!password) {
        return res.status(400).json({ message: 'Password is required for admin login' });
      }
      isMatch = await user.matchPassword(password);
    } else {
      if (!dob) {
        return res.status(400).json({ message: 'Date of Birth is required for student login' });
      }
      const userDate = parseDate(user.dob);
      const inputDate = parseDate(dob);
      isMatch = userDate && inputDate && (userDate.toDateString() === inputDate.toDateString());
    }

    if (isMatch) {
      res.json({
        _id: user._id,
        name: user.name,
        registerNumber: user.registerNumber,
        email: user.email,
        role: user.role,
        department: user.department,
        dob: user.dob,
        votedElections: user.votedElections,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: user.role === 'admin' ? 'Invalid password' : 'Date of Birth does not match records' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      registerNumber: user.registerNumber,
      email: user.email,
      role: user.role,
      department: user.department,
      votedElections: user.votedElections,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

module.exports = router;
