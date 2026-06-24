const mongoose = require("mongoose");

const complaintHistorySchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: [true, "Complaint reference is required"],
    },
    previousStatus: {
      type: String,
      default: null,
    },
    newStatus: {
      type: String,
      required: [true, "New status is required"],
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Changed by is required"],
    },
    remark: {
      type: String,
      trim: true,
      maxlength: [500, "Remark must be at most 500 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

complaintHistorySchema.index({ complaint: 1, createdAt: 1 });

module.exports = mongoose.model("ComplaintHistory", complaintHistorySchema);
