import multer from 'multer';
import fs from 'fs';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = 'uploads/gallery';
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = file.fieldname === 'thumbnail' ? 'thumb' : 'img';
    cb(null, `${Date.now()}-${name}${ext}`);
  }
});

const upload = multer({ storage });

export default upload;
