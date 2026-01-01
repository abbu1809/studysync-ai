const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateUser } = require('../middleware/auth');
const documentController = require('../controllers/document.controller');
const { validate, schemas } = require('../middleware/validation');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024 // Default 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and images are allowed.'));
    }
  }
});

// Upload document
router.post('/',
  authenticateUser,
  upload.single('file'),
  validate(schemas.documentMetadata),
  documentController.uploadDocument
);

// Get all user documents
router.get('/', authenticateUser, documentController.getDocuments);

// Get specific document
router.get('/:documentId', authenticateUser, documentController.getDocument);

// Delete document
router.delete('/:documentId', authenticateUser, documentController.deleteDocument);

// Reprocess document (trigger OCR again)
router.post('/:documentId/reprocess', authenticateUser, documentController.reprocessDocument);

module.exports = router;
