const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = 'uploads/downloads';
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, filename);
  },
});

const uploadDownloads = multer({ storage });

module.exports = uploadDownloads;
