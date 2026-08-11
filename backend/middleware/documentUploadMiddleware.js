const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },

  filename(req, file, cb) {
    cb(
      null,
      `student-import-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const allowedExtensions = ['.csv', '.xlsx', '.xls'];

const upload = multer({
  storage,

  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV, XLS, and XLSX files are allowed'));
    }
  },

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = upload;
