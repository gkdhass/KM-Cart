/**
 * @file server/middleware/upload.js
 * @description Multer configuration for image file uploads
 * Validates file type, size, and configures memory storage for image processing
 */

const multer = require('multer');

// Configure memory storage (no disk writes, keeps buffer for OCR processing)
const storage = multer.memoryStorage();

// File filter - accept only image files
const fileFilter = (req, file, cb) => {
  // Accepted image MIME types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP images are allowed.`
      ),
      false
    );
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Error handler middleware for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.',
      });
    }
    
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  } else if (err) {
    // Other errors (e.g., from fileFilter)
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  
  next();
};

module.exports = {
  upload,
  handleMulterError,
};
