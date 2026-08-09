const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const electionRoutes = require('./routes/electionRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve candidate uploads static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/audit', auditRoutes);

// Seed Default Admin User if not exists
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ registerNumber: 'sharon123' });
    if (!adminExists) {
      // Clean up previous placeholder admin if exists
      await User.deleteOne({ registerNumber: 'ADMIN101' });
      
      await User.create({
        registerNumber: 'sharon123',
        name: 'Sharon',
        email: 'admin@rvscas.ac.in',
        password: 'adminpassword',
        dob: '10/11/2003',
        role: 'admin',
        department: 'Administration',
        isActive: true,
      });
      console.log('Admin account created successfully!');
      console.log('Register Number: sharon123');
      console.log('DOB: 10/11/2003');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
  }
};
seedAdmin();

// Error Handling Middlewares
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
