const Document = require('../models/Document');
const Class = require('../models/Class');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.warn('Sharp not installed - image compression disabled');
}
const logger = require('../utils/logger');

// Secure uploads directory
const UPLOAD_DIR = 'uploads/';

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// File type validation - Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

// File extension validation
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.txt'];

// Magic numbers for file type validation (hex signatures)
const MAGIC_NUMBERS = {
  'jpeg': ['ffd8ff'],
  'png': ['89504e47'],
  'gif': ['47494638'],
  'pdf': ['25504446'],
  'doc': ['d0cf11e0'],
  'docx': ['504b0304']
};

// Multer storage config - Secure
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Security: Use subdirectories by date to prevent too many files in one directory
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const subDir = path.join(UPLOAD_DIR, `${year}${month}${day}`);

    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }

    cb(null, subDir);
  },
  filename: (req, file, cb) => {
    // Generate secure filename - no original name, no predictable names
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const safeExt = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9]/g, '');
    cb(null, `${uniqueId}${safeExt}`);
  }
});

// File filter with validation
const fileFilter = (req, file, cb) => {
  // 1. Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    logger.warn(`Rejected file: Invalid extension ${ext}`);
    return cb(new Error(`Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
  }

  // 2. Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    logger.warn(`Rejected file: Invalid MIME type ${file.mimetype}`);
    return cb(new Error('Invalid file type.'), false);
  }

  // 3. Additional security checks can be added here
  // - Virus scanning (requires integration with ClamAV or similar)
  // - Magic number validation

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Max 5 files per request
  },
  fileFilter
});

// Upload document
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Additional validation after file is received
    const fileStats = fs.statSync(req.file.path);

    // Check if file is too small (possible empty file or attack)
    if (fileStats.size < 100) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'File too small or invalid' });
    }

    // Compress images if possible
    let finalPath = req.file.path;
    let finalSize = fileStats.size;

    if (req.file.mimetype.startsWith('image/') && sharp) {
      try {
        const compressed = await compressImage(req.file.path, req.file.filename);
        if (compressed !== req.file.path && fs.existsSync(compressed)) {
          // Remove original, use compressed
          fs.unlinkSync(req.file.path);
          finalPath = compressed;
          finalSize = fs.statSync(compressed).size;
        }
      } catch (compressErr) {
        logger.warn('Image compression failed, using original:', compressErr.message);
      }
    }

    // Get user ID from auth middleware
    const userId = req.user ? req.user.id : req.body.userId;

    const document = await Document.create({
      title: req.body.title || req.file.originalname,
      description: req.body.description,
      fileName: req.file.originalname,
      filePath: finalPath,
      fileSize: finalSize,
      fileType: req.file.mimetype,
      uploadedBy: userId,
      classId: req.body.classId,
      documentType: req.body.documentType || 'material',
    });

    logger.info(`Document uploaded: ${document.id} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document,
    });
  } catch (error) {
    logger.error('Upload error:', error);

    // Cleanup uploaded file on error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupErr) {
        logger.warn('Failed to cleanup uploaded file:', cleanupErr.message);
      }
    }

    res.status(400).json({
      success: false,
      message: 'Upload failed',
    });
  }
};

// List documents by class
const getClassDocuments = async (req, res) => {
  try {
    const { classId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    const { count, rows } = await Document.findAndCountAll({
      where: { classId },
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'fullName'] }
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    logger.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
    });
  }
};

// Download document (increment counter)
const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Security check: Ensure file exists and is accessible
    if (!document.filePath || !fs.existsSync(document.filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Prevent path traversal
    const safePath = path.normalize(document.filePath);
    if (!safePath.startsWith(path.normalize(UPLOAD_DIR))) {
      logger.error('Path traversal attempt detected:', document.filePath);
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Increment download count
    document.downloads += 1;
    await document.save();

    res.download(document.filePath, document.fileName);
  } catch (error) {
    logger.error('Download error:', error);
    res.status(500).json({ success: false, message: 'Download failed' });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Check permissions (only uploader or admin can delete)
    if (req.user && req.user.id !== document.uploadedBy && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    // Delete physical file
    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete database record
    await document.destroy();

    logger.info(`Document deleted: ${id} by user ${req.user?.id}`);

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    logger.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};

// Image compression helper
const compressImage = async (inputPath, filename) => {
  if (!sharp) {
    console.warn('Sharp not available - skipping compression');
    return inputPath;
  }
  try {
    const outputPath = inputPath.replace(path.extname(inputPath), '.webp');
    await sharp(inputPath)
      .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
    return outputPath;
  } catch (err) {
    console.warn('Image compression failed:', err.message);
    return inputPath;
  }
};

module.exports = {
  upload: upload.single('file'),
  uploadDocument,
  getClassDocuments,
  downloadDocument,
  deleteDocument,
};