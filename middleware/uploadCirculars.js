// middleware/uploadCirculars.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const __dirname = path.resolve();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = path.join(__dirname, 'uploads/circulars');
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

const uploadCirculars = multer({ storage });
export default uploadCirculars;
