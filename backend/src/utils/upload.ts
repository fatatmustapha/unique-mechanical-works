import path from "node:path";
import crypto from "node:crypto";

import multer from "multer";

const carUploadDirectory = path.resolve(
  process.cwd(),
  "uploads",
  "cars",
);

const storage = multer.diskStorage({
  destination: (
    _request,
    _file,
    callback,
  ) => {
    callback(null, carUploadDirectory);
  },

  filename: (
    _request,
    file,
    callback,
  ) => {
    const extension = path.extname(
      file.originalname,
    );

    const randomPart = crypto
      .randomBytes(8)
      .toString("hex");

    const filename = `car-${Date.now()}-${randomPart}${extension}`;

    callback(null, filename);
  },
});

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const fileFilter: multer.Options["fileFilter"] = (
  _request,
  file,
  callback,
) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(
      new Error(
        "Only JPEG, PNG, and WEBP images are allowed.",
      ),
    );

    return;
  }

  callback(null, true);
};

export const carImageUpload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});