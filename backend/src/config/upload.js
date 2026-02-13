const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (path.extname(file.originalname).toLowerCase() !== ".pdf") {
    cb(new Error("Only PDF files allowed"), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
