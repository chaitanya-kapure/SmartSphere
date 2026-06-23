const uploadService = require("../services/uploadService");
const { AppError } = require("../utils/errors");

exports.uploadComplaintImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError("Image file is required", 400));
    }
    const complaintId = req.body.complaintId || "new";
    const result = await uploadService.uploadComplaintImage(
      req.file.buffer,
      complaintId
    );
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

exports.uploadProofImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError("Image file is required", 400));
    }
    const complaintId = req.body.complaintId || "new";
    const result = await uploadService.uploadProofImage(
      req.file.buffer,
      complaintId
    );
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
