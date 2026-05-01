const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const { verifyToken } = require('../middleware/auth.middleware');
const { detectPest, getRecentScans } = require('../controllers/pest.controller');

const router = express.Router();

const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, or WEBP images are allowed'));
    }
    return cb(null, true);
  },
});

const pestDetectLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many scan requests. Please try again later.' },
});

const detectUploadMiddleware = (req, res, next) => {
  upload.single('image')(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'Image too large. Max size is 5MB.' });
      }
      return res.status(400).json({ success: false, error: error.message || 'Invalid upload' });
    }

    return res.status(400).json({ success: false, error: error.message || 'Invalid image upload' });
  });
};

router.post('/detect', pestDetectLimiter, verifyToken, detectUploadMiddleware, detectPest);
router.get('/recent', verifyToken, getRecentScans);

module.exports = router;
