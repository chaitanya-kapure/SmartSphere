const cloudinary = require("../config/cloudinary");
const { AppError } = require("../utils/errors");

class UploadService {
  async uploadComplaintImage(buffer, complaintId) {
    return this._upload(buffer, `complaints/${complaintId}`);
  }

  async uploadProofImage(buffer, complaintId) {
    return this._upload(buffer, `proofs/${complaintId}`);
  }

  _upload(buffer, folder) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) {
            return reject(new AppError("Image upload failed", 500));
          }
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
    return cloudinary.uploader.destroy(publicId);
  }
}

module.exports = new UploadService();
