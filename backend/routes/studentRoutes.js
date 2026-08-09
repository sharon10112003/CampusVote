const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const logAction = require('../utils/auditLogger');
const bcrypt = require('bcryptjs');

// Helper to generate a default password hash or cleartext
const generateDefaultPassword = (registerNumber) => {
  // Use Register Number in lowercase as default password
  return registerNumber.toLowerCase();
};

// @desc    Get all students (with search, pagination)
// @route   GET /api/students
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const pageSize = 15;
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { registerNumber: { $regex: req.query.keyword, $options: 'i' } },
            { department: { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};

    const count = await User.countDocuments({ role: 'student', ...keyword });
    const students = await User.find({ role: 'student', ...keyword })
      .select('-password')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ registerNumber: 1 });

    res.json({ students, page, pages: Math.ceil(count / pageSize), total: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create student
// @route   POST /api/students
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  const { registerNumber, name, email, department, dob } = req.body;

  try {
    const userExists = await User.findOne({ registerNumber });

    if (userExists) {
      return res.status(400).json({ message: 'Student with this Register Number already exists' });
    }

    const student = await User.create({
      registerNumber,
      name,
      email,
      department,
      dob: dob || '01-01-2000',
      role: 'student',
      isActive: true,
    });

    await logAction(req, 'CREATE_STUDENT', `Created student: ${name} (${registerNumber})`);

    res.status(201).json({
      _id: student._id,
      registerNumber: student.registerNumber,
      name: student.name,
      email: student.email,
      department: student.department,
      dob: student.dob,
      isActive: student.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (student) {
      student.name = req.body.name || student.name;
      student.email = req.body.email || student.email;
      student.department = req.body.department || student.department;
      student.registerNumber = req.body.registerNumber || student.registerNumber;
      if (req.body.dob) {
        student.dob = req.body.dob;
      }

      const updatedStudent = await student.save();
      await logAction(req, 'UPDATE_STUDENT', `Updated student: ${student.name} (${student.registerNumber})`);

      res.json({
        _id: updatedStudent._id,
        registerNumber: updatedStudent.registerNumber,
        name: updatedStudent.name,
        email: updatedStudent.email,
        department: updatedStudent.department,
        dob: updatedStudent.dob,
        isActive: updatedStudent.isActive,
      });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (student) {
      if (student.role === 'admin') {
        return res.status(400).json({ message: 'Cannot delete an Admin account' });
      }
      await User.deleteOne({ _id: req.params.id });
      await logAction(req, 'DELETE_STUDENT', `Deleted student: ${student.name} (${student.registerNumber})`);
      res.json({ message: 'Student removed successfully' });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Toggle student status (Enable/Disable)
// @route   PATCH /api/students/:id/status
// @access  Private/Admin
router.patch('/:id/status', protect, admin, async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (student) {
      student.isActive = !student.isActive;
      await student.save();
      await logAction(
        req,
        student.isActive ? 'ENABLE_STUDENT' : 'DISABLE_STUDENT',
        `${student.isActive ? 'Enabled' : 'Disabled'} account for: ${student.name} (${student.registerNumber})`
      );
      res.json({ message: `Student account ${student.isActive ? 'enabled' : 'disabled'}`, isActive: student.isActive });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reset student DOB
// @route   POST /api/students/:id/reset-password
// @access  Private/Admin
router.post('/:id/reset-password', protect, admin, async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (student) {
      // Reset Date of Birth to default placeholder
      student.dob = '01-01-2000';
      await student.save();

      await logAction(req, 'RESET_DOB', `Reset DOB for student: ${student.name} (${student.registerNumber})`);
      res.json({ message: 'Date of Birth reset to 01-01-2000 successfully' });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Import students from CSV or Excel
// @route   POST /api/students/import
// @access  Private/Admin
router.post('/import', protect, admin, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a CSV or Excel file' });
  }

  const filePath = req.file.path;
  const fileExt = path.extname(req.file.originalname).toLowerCase();
  const studentsToInsert = [];
  const errors = [];

  try {
    if (fileExt === '.csv') {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          // Expect keys: registerNumber, name, email, department
          const regNo = row.registerNumber || row.RegisterNumber || row['Register Number'] || row.regNo;
          const name = row.name || row.Name;
          const email = row.email || row.Email || '';
          const dept = row.department || row.Department || row.dept || '';
          const dobVal = row.dob || row.dateOfBirth || row.DOB || row['Date of Birth'] || row['date of birth'] || '01-01-2000';

          if (regNo && name) {
            studentsToInsert.push({
              registerNumber: regNo.trim(),
              name: name.trim(),
              email: email.trim(),
              department: dept.trim(),
              dob: String(dobVal).trim(),
            });
          }
        })
        .on('end', async () => {
          await processImportedStudents(studentsToInsert, req, res, filePath);
        });
    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      data.forEach((row) => {
        const regNo = row.registerNumber || row.RegisterNumber || row['Register Number'] || row.regNo;
        const name = row.name || row.Name;
        const email = row.email || row.Email || '';
        const dept = row.department || row.Department || row.dept || '';
        const dobVal = row.dob || row.dateOfBirth || row.DOB || row['Date of Birth'] || row['date of birth'] || '01-01-2000';

        if (regNo && name) {
          studentsToInsert.push({
            registerNumber: String(regNo).trim(),
            name: String(name).trim(),
            email: String(email).trim(),
            department: String(dept).trim(),
            dob: String(dobVal).trim(),
          });
        }
      });

      await processImportedStudents(studentsToInsert, req, res, filePath);
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Unsupported file format. Please upload CSV or Excel.' });
    }
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: error.message });
  }
});

// Helper to save imported students
async function processImportedStudents(students, req, res, filePath) {
  let createdCount = 0;
  let skippedCount = 0;

  try {
    for (const studentData of students) {
      const exists = await User.findOne({ registerNumber: studentData.registerNumber });
      if (exists) {
        skippedCount++;
        continue;
      }

      await User.create({
        registerNumber: studentData.registerNumber,
        name: studentData.name,
        email: studentData.email,
        department: studentData.department,
        dob: studentData.dob,
        role: 'student',
        isActive: true,
      });
      createdCount++;
    }

    await logAction(
      req,
      'IMPORT_STUDENTS',
      `Imported ${createdCount} students from file. Skipped ${skippedCount} duplicates.`
    );

    // Clean up file
    fs.unlinkSync(filePath);

    res.json({
      message: `Import completed. ${createdCount} students imported, ${skippedCount} skipped.`,
      createdCount,
      skippedCount,
    });
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: error.message });
  }
}

module.exports = router;
