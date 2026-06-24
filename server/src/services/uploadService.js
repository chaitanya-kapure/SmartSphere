const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const cloudinary = require("../config/cloudinary");
const config = require("../config/env");
const { AppError } = require("../utils/errors");

const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");

const _useCloudinary =
  config.cloudinaryCloudName &&
  config.cloudinaryCloudName !== "your-cloud-name" &&
  config.cloudinaryApiKey &&
  config.cloudinaryApiKey !== "your-api-key";

class UploadService {
  async uploadComplaintImage(buffer, complaintId) {
    return _useCloudinary
      ? this._cloudinaryUpload(buffer, `complaints/${complaintId}`)
      : this._localUpload(buffer, `complaints/${complaintId}`);
  }

  async uploadProofImage(buffer, complaintId) {
    return _useCloudinary
      ? this._cloudinaryUpload(buffer, `proofs/${complaintId}`)
      : this._localUpload(buffer, `proofs/${complaintId}`);
  }

  _localUpload(buffer, folder) {
    const publicId = `${folder}/${crypto.randomUUID()}`;
    const relativePath = `${publicId}.png`;
    const absolutePath = path.join(UPLOADS_DIR, `${publicId}.png`);

    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, buffer);

    const url = `http://localhost:${config.port}/uploads/${relativePath.replace(/\\/g, "/")}`;
    console.log("[UploadService] Local upload:", url);
    return { url, publicId };
  }

  _cloudinaryUpload(buffer, folder) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) {
            console.error("[UploadService] Cloudinary error:", error.message || error);
            return reject(new AppError("Image upload failed", 500));
          }
          console.log("[UploadService] Cloudinary upload:", result.secure_url);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
      uploadStream.end(buffer);
    });
  }

  async deleteImage(publicId) {
    if (_useCloudinary) {
      return cloudinary.uploader.destroy(publicId);
    }
    const absolutePath = path.join(UPLOADS_DIR, publicId);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }
}

module.exports = new UploadService();
