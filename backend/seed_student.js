const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  
  // delete student if exists
  await User.deleteOne({ registerNumber: 'STUDENT101' });
  
  const student = await User.create({
    registerNumber: 'STUDENT101',
    name: 'Test Student',
    email: 'student@example.com',
    dob: '01/01/2000',
    role: 'student',
    isActive: true,
  });
  console.log('Seeded student:', student.registerNumber, student.dob);
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
