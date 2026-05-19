const express = require('express');
const documentController = require('../controllers/documentController');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Upload document (teacher/admin only)
router.post('/upload', authorize('teacher', 'admin'), documentController.upload, documentController.uploadDocument);

// Get class documents
router.get('/class/:classId', documentController.getClassDocuments);

// Get single document
router.get('/:id', async (req, res) => {
  try {
    const Document = require('../models/Document');
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    res.json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch document' });
  }
});

// Download (protected)
router.get('/:id/download', documentController.downloadDocument);

// Delete document (teacher/admin or uploader)
router.delete('/:id', authorize('teacher', 'admin'), documentController.deleteDocument);

module.exports = router;