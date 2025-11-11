import multer from 'multer';
import path from 'path';
import util from 'util';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import sharp from 'sharp';
import stream from 'stream';
import dotenv from 'dotenv';

dotenv.config();

export const s3 = new S3Client({
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  },
  region: 'eu-central-1',
  forcePathStyle: true,
  requestHandler: {
    metadata: {
      keepAlive: true,
      timeout: 300000,
    },
  },
});

const compressImage = async (fileBuffer, originalMimeType) => {
  try {
    return await sharp(fileBuffer)
      .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 50, progressive: true })
      .toBuffer();
  } catch (error) {
    // Log the error but return the original buffer to prevent upload failure.
    console.warn(
      `Warning: Image compression failed for file type ${originalMimeType}. Uploading original file.`,
      error
    );
    return fileBuffer; // Return original buffer if compression fails
  }
};

const storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_S3_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, uniqueName);
  },
  shouldTransform: async (req, file, cb) => {
    // Only attempt to transform if it's an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  transformFile: async (req, file, cb) => {
    try {
      // Call compressImage, which now handles its own errors and returns a fallback buffer
      const processedBuffer = await compressImage(file.buffer, file.mimetype);
      const processedStream = new stream.PassThrough();
      processedStream.end(processedBuffer);
      cb(null, processedStream);
    } catch (error) {
      // This catch block should only be hit for unexpected errors outside of compressImage
      console.error(`Critical error during file transformation for ${file.originalname}:`, error);
      cb(error);
    }
  },
});

function checkFileType(file, cb) {
  // Define allowed MIME types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
    'image/heic', // Added for mobile camera images
    'image/heif', // Added for mobile camera images
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'text/plain',
    'text/csv',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/flac',
    'audio/mp4',
    'audio/x-m4a',
    'audio/x-ms-wma',
    'audio/aiff',
    'audio/opus',
    'audio/webm',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-flv',
    'video/x-matroska',
    'video/webm',
    'application/zip',
  ];

  // Define allowed file extensions
  const allowedExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
    '.heic',
    '.heif',
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.txt',
    '.csv',
    '.mp3',
    '.wav',
    '.ogg',
    '.aac',
    '.flac',
    '.m4a',
    '.wma',
    '.aiff',
    '.opus',
    '.mp4',
    '.mov',
    '.avi',
    '.wmv',
    '.flv',
    '.mkv',
    '.webm',
    '.zip',
    '.avif',
  ];

  const extname = allowedExtensions.includes(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedMimeTypes.includes(file.mimetype);

  if (extname && mimeType) {
    cb(null, true);
  } else {
    // Log error for unsupported file type
    console.error(
      `Error: Unsupported file type for ${file.originalname}. MIME: ${file.mimetype}, Ext: ${path
        .extname(file.originalname)
        .toLowerCase()}`
    );
    cb(new Error('Error: Unsupported file type.'));
  }
}

const upload = multer({
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  storage: storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).array('file', 5);

const uploadMiddleware = util.promisify(upload);

export default uploadMiddleware;
