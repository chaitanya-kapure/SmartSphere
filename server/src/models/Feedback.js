const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: [true, "Complaint reference is required"],
      unique: true,
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Citizen reference is required"],
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Worker reference is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, "Comment must be at most 500 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ complaint: 1 }, { unique: true });
feedbackSchema.index({ worker: 1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
