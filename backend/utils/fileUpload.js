import multer from 'multer';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, createReadStream, promises as fsPromises } from 'fs';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_DIR || join(__dirname, '../uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(16).toString('hex')}`;
    const ext = file.originalname.split('.').pop();
    cb(null, `${uniqueSuffix}.${ext}`);
  },
});

// File filter - accept all image types
const fileFilter = (req, file, cb) => {
  // Accept any file that starts with "image/"
  if (file.mimetype.startsWith('image/')) {
    logger.info(`Accepting file: ${file.originalname}, mimetype: ${file.mimetype}`);
    cb(null, true);
  } else {
    logger.warn(`Rejecting file: ${file.originalname}, mimetype: ${file.mimetype}`);
    cb(new Error(`Only image files are allowed. Your file type: ${file.mimetype}`), false);
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
});

// Calculate file hash
export const calculateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

// Get file info
export const getFileInfo = async (filePath) => {
  const stats = await fsPromises.stat(filePath);
  return {
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
  };
};

