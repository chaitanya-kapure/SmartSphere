const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: [true, "Complaint ID is required"],
      unique: true,
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Citizen is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title must be at most 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description must be at most 2000 characters"],
    },
    category: {
      type: String,
      default: null,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    address: {
      type: String,
      default: "",
    },
    images: {
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String, required: true },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
      validate: {
        validator: (v) => v.length <= 5,
        message: "Maximum 5 images allowed",
      },
    },
    proofImages: {
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String, required: true },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
      validate: {
        validator: (v) => v.length <= 5,
        message: "Maximum 5 proof images allowed",
      },
    },
    completedAt: { type: Date, default: null },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rejectionRemark: { type: String, default: null, trim: true, maxlength: 500 },
    rejectedAt: { type: Date, default: null },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: {
        values: [
          "pending",
          "assigned",
          "in_progress",
          "verification",
          "resolved",
          "rejected",
          "reopened",
        ],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high", "critical"],
        message: "{VALUE} is not a valid priority",
      },
      default: "medium",
    },
    aiClassification: {
      source: {
        type: String,
        enum: { values: ["gemini", "keyword", "general"], message: "Invalid classifier source" },
        default: null,
      },
      category: { type: String, default: null },
      department: { type: String, default: null },
      priority: { type: String, default: null },
      confidence: { type: Number, default: null },
      isDuplicate: { type: Boolean, default: false },
      duplicateOf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Complaint",
        default: null,
      },
      duplicateConfidence: { type: Number, default: null },
    },
    aiSummary: { type: String, default: null },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null,
    },
    slaDeadline: {
      type: Date,
      default: null,
    },
    isOverdue: {
      type: Boolean,
      default: false,
    },
    resolutionTimeHours: {
      type: Number,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

complaintSchema.index({ complaintId: 1 }, { unique: true });
complaintSchema.index({ citizen: 1, createdAt: -1 });
complaintSchema.index({ assignedWorker: 1, status: 1 });
complaintSchema.index({ department: 1, status: 1 });
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ location: "2dsphere" });
complaintSchema.index({ isDuplicate: 1 });
complaintSchema.index({ isDeleted: 1 });

module.exports = mongoose.model("Complaint", complaintSchema);
