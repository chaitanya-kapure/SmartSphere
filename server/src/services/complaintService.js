const Complaint = require("../models/Complaint");
const ComplaintHistory = require("../models/ComplaintHistory");
const Counter = require("../models/Counter");
const User = require("../models/User");
const Department = require("../models/Department");
const { AppError } = require("../utils/errors");
const notificationService = require("./notificationService");
const { getIO } = require("../socket");
const classificationService = require("./ai/classificationService");
const priorityService = require("./ai/priorityService");
const duplicateDetectionService = require("./ai/duplicateDetectionService");
const summarizationService = require("./ai/summarizationService");
const departmentClassifier = require("./departmentClassifier");

const TRANSITIONS = {
  pending: ["assigned", "rejected"],
  assigned: ["in_progress", "rejected"],
  in_progress: ["verification", "rejected"],
  verification: ["resolved", "rejected"],
  resolved: ["reopened"],
  reopened: ["assigned"],
};

const SLA_HOURS = 48;

class ComplaintService {
  async create(userId, data) {
    const complaintId = await this._generateComplaintId();

    const [classification, priority, duplicate, summary] = await Promise.allSettled([
      classificationService.classify(data.title, data.description),
      priorityService.predict(data.title, data.description),
      duplicateDetectionService.check(data.title, data.description),
      summarizationService.summarize(data.title, data.description),
    ]);

    const aiData = {};
    let classifierSource = null;

    if (classification.status === "fulfilled") {
      aiData["aiClassification.category"] = classification.value.category;
      aiData["aiClassification.confidence"] = classification.value.confidence;
      aiData.category = classification.value.category;

      if (classification.value.department && classification.value.confidence >= 0.7) {
        const dept = await Department.findOne({
          name: { $regex: new RegExp(`^${classification.value.department}$`, "i") },
        }).select("_id");
        if (dept) {
          aiData.department = dept._id;
          classifierSource = "gemini";
        }
      }
    }

    if (!classifierSource) {
      const fallback = await departmentClassifier.classifyByKeywords(
        data.title,
        data.description
      );
      aiData.department = fallback.departmentId;
      aiData.category = fallback.category;
      aiData["aiClassification.category"] = fallback.category;
      classifierSource = fallback.source;
    }

    if (priority.status === "fulfilled") {
      aiData["aiClassification.priority"] = priority.value.priority;
      aiData.priority = priority.value.priority;
    } else {
      aiData.priority = "medium";
      aiData["aiClassification.priority"] = "medium";
    }

    if (duplicate.status === "fulfilled") {
      aiData["aiClassification.isDuplicate"] = duplicate.value.isDuplicate;
      aiData.isDuplicate = duplicate.value.isDuplicate;
      if (duplicate.value.duplicateOf) {
        aiData["aiClassification.duplicateOf"] = duplicate.value.duplicateOf;
        aiData.duplicateOf = duplicate.value.duplicateOf;
      }
      aiData["aiClassification.duplicateConfidence"] = duplicate.value.confidence;
    }

    if (summary.status === "fulfilled") {
      aiData.aiSummary = summary.value.summary;
    }

    const complaint = await Complaint.create({
      complaintId,
      citizen: userId,
      title: data.title,
      description: data.description,
      location: data.location || { type: "Point", coordinates: [0, 0] },
      address: data.address || "",
      city: data.city || "",
      state: data.state || "",
      pincode: data.pincode || "",
      images: data.images || [],
      slaDeadline: new Date(Date.now() + SLA_HOURS * 60 * 60 * 1000),
      ...(aiData.category ? { category: aiData.category } : {}),
      ...(aiData.department ? { department: aiData.department } : {}),
      ...(aiData.priority ? { priority: aiData.priority } : {}),
      ...(aiData.isDuplicate !== undefined ? { isDuplicate: aiData.isDuplicate } : {}),
      ...(aiData.duplicateOf ? { duplicateOf: aiData.duplicateOf } : {}),
      ...(aiData.aiSummary ? { aiSummary: aiData.aiSummary } : {}),
      aiClassification: {
        source: classifierSource,
        category: aiData["aiClassification.category"] || null,
        department: aiData["aiClassification.department"] || null,
        priority: aiData["aiClassification.priority"] || null,
        confidence: aiData["aiClassification.confidence"] ?? null,
        isDuplicate: aiData["aiClassification.isDuplicate"] ?? false,
        duplicateOf: aiData["aiClassification.duplicateOf"] || null,
        duplicateConfidence: aiData["aiClassification.duplicateConfidence"] ?? null,
      },
    });

    await this._recordHistory(complaint._id, null, "pending", userId, "Complaint submitted");

    try {
      const io = getIO();
      io.to("role:dept_head").to("role:super_admin").emit("complaint_created", {
        complaintId: complaint.complaintId,
        title: complaint.title,
        status: complaint.status,
        category: complaint.category,
        priority: complaint.priority,
        isDuplicate: complaint.isDuplicate,
      });
    } catch {}

    return complaint;
  }

  async list(user, query = {}) {
    const filter = { isDeleted: false };

    if (user.role === "citizen") {
      filter.citizen = user.id;
    } else if (user.role === "worker") {
      filter.assignedWorker = user.id;
    } else if (user.role === "dept_head") {
      const userDoc = await User.findById(user.id);
      if (!userDoc.department) {
        return [];
      }
      filter.department = userDoc.department;
    }

    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.department) filter.department = query.department;

    const complaints = await Complaint.find(filter)
      .populate("citizen", "name email")
      .populate("assignedWorker", "name email")
      .populate("department", "name code")
      .sort({ createdAt: -1 });

    return complaints;
  }

  async getById(user, complaintId) {
    const complaint = await Complaint.findById(complaintId)
      .populate("citizen", "name email")
      .populate("assignedWorker", "name email")
      .populate("department", "name code");

    if (!complaint || complaint.isDeleted) {
      throw new AppError("Complaint not found", 404);
    }

    this._checkAccess(user, complaint);

    return complaint;
  }

  async update(user, complaintId, data) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint || complaint.isDeleted) {
      throw new AppError("Complaint not found", 404);
    }

    this._checkOwnerOrAdmin(user, complaint);

    const allowedFields = ["title", "description", "category", "address"];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        complaint[field] = data[field];
      }
    }

    if (data.location) {
      complaint.location = data.location;
    }

    await complaint.save();
    return complaint;
  }

  async remove(user, complaintId) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint || complaint.isDeleted) {
      throw new AppError("Complaint not found", 404);
    }

    this._checkOwnerOrAdmin(user, complaint);

    if (user.role === "citizen" && complaint.status !== "pending") {
      throw new AppError(
        "You can only delete complaints in pending status",
        403
      );
    }

    complaint.isDeleted = true;
    await complaint.save();
  }

  async assign(user, complaintId, workerId) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint || complaint.isDeleted) {
      throw new AppError("Complaint not found", 404);
    }

    if (complaint.status !== "pending" && complaint.status !== "reopened") {
      throw new AppError(
        "Complaint must be in pending or reopened status to assign",
        400
      );
    }

    const worker = await User.findById(workerId);
    if (!worker || worker.role !== "worker") {
      throw new AppError("Worker not found or invalid role", 400);
    }

    complaint.assignedWorker = workerId;
    complaint.assignedBy = user.id;
    complaint.assignedAt = new Date();
    complaint.status = "assigned";
    await complaint.save();

    await this._recordHistory(
      complaint._id,
      "pending",
      "assigned",
      user.id,
      `Assigned to ${worker.name}`
    );

    try {
      const io = getIO();
      io.to(`user:${workerId}`).emit("worker_assigned", {
        complaintId: complaint.complaintId,
        title: complaint.title,
      });
    } catch {}

    await notificationService.create({
      recipient: workerId,
      type: "assignment",
      title: "New Task Assigned",
      message: `Complaint ${complaint.complaintId}: ${complaint.title}`,
      complaint: complaint._id,
    });

    return complaint;
  }

  async updateStatus(user, complaintId, newStatus, remark, proofImages) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint || complaint.isDeleted) {
      throw new AppError("Complaint not found", 404);
    }

    this._validateTransition(complaint.status, newStatus);

    const previousStatus = complaint.status;

    if (newStatus === "verification") {
      if (!proofImages || proofImages.length === 0) {
        throw new AppError("Proof image is required before marking complete", 400);
      }
      complaint.proofImages = proofImages;
      complaint.completedAt = new Date();
      complaint.completedBy = user.id;
    } else if (proofImages && proofImages.length > 0) {
      complaint.proofImages = proofImages;
    }

    complaint.status = newStatus;

    if (newStatus === "resolved") {
      complaint.resolvedAt = new Date();
      const diffMs = complaint.resolvedAt - complaint.createdAt;
      complaint.resolutionTimeHours = Math.round(diffMs / (1000 * 60 * 60));
    }

    await complaint.save();

    await this._recordHistory(
      complaint._id,
      previousStatus,
      newStatus,
      user.id,
      remark || `Status changed to ${newStatus}`
    );

    try {
      const io = getIO();
      io.to(`user:${complaint.citizen}`).emit("status_changed", {
        complaintId: complaint.complaintId,
        previousStatus,
        newStatus,
        remark,
      });

      if (newStatus === "verification" && complaint.department) {
        io.to(`department:${complaint.department}`).emit("verification_requested", {
          complaintId: complaint.complaintId,
        });
      }
    } catch {}

    await notificationService.create({
      recipient: complaint.citizen,
      type: "status_change",
      title: `Complaint ${newStatus.replace("_", " ")}`,
      message: `Complaint ${complaint.complaintId} is now ${newStatus.replace("_", " ")}`,
      complaint: complaint._id,
    });

    if (newStatus === "resolved") {
      await notificationService.create({
        recipient: complaint.citizen,
        type: "feedback_request",
        title: "Complaint Resolved — Share Feedback",
        message: `Your complaint ${complaint.complaintId} has been resolved. Please rate your experience.`,
        complaint: complaint._id,
      });
    }

    return complaint;
  }

  async approve(user, complaintId) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint || complaint.isDeleted) {
      throw new AppError("Complaint not found", 404);
    }

    if (complaint.status !== "verification") {
      throw new AppError("Complaint must be in verification status to approve", 400);
    }

    this._checkDeptAccess(user, complaint);

    complaint.status = "resolved";
    complaint.verifiedAt = new Date();
    complaint.verifiedBy = user.id;
    complaint.resolvedAt = new Date();
    const diffMs = complaint.resolvedAt - complaint.createdAt;
    complaint.resolutionTimeHours = Math.round(diffMs / (1000 * 60 * 60));
    await complaint.save();

    await this._recordHistory(
      complaint._id,
      "verification",
      "resolved",
      user.id,
      "Approved by department head"
    );

    try {
      const io = getIO();
      io.to(`user:${complaint.citizen}`).emit("status_changed", {
        complaintId: complaint.complaintId,
        previousStatus: "verification",
        newStatus: "resolved",
      });
      if (complaint.assignedWorker) {
        io.to(`user:${complaint.assignedWorker}`).emit("notification", {
          type: "verification_approved",
          complaintId: complaint.complaintId,
        });
      }
    } catch {}

    await notificationService.create({
      recipient: complaint.citizen,
      type: "feedback_request",
      title: "Complaint Resolved",
      message: `Your complaint ${complaint.complaintId} has been verified and resolved.`,
      complaint: complaint._id,
    });

    if (complaint.assignedWorker) {
      await notificationService.create({
        recipient: complaint.assignedWorker,
        type: "verification_approved",
        title: "Work Approved",
        message: `Your work on complaint ${complaint.complaintId} has been approved.`,
        complaint: complaint._id,
      });
    }

    return complaint;
  }

  async reject(user, complaintId, remark) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint || complaint.isDeleted) {
      throw new AppError("Complaint not found", 404);
    }

    if (complaint.status !== "verification") {
      throw new AppError("Complaint must be in verification status to reject", 400);
    }

    this._checkDeptAccess(user, complaint);

    if (!remark || !remark.trim()) {
      throw new AppError("Remark is required when rejecting", 400);
    }

    complaint.status = "in_progress";
    complaint.rejectionRemark = remark.trim();
    complaint.rejectedAt = new Date();
    complaint.rejectedBy = user.id;
    await complaint.save();

    await this._recordHistory(
      complaint._id,
      "verification",
      "in_progress",
      user.id,
      `Rejected: ${remark}`
    );

    if (complaint.assignedWorker) {
      try {
        const io = getIO();
        io.to(`user:${complaint.assignedWorker}`).emit("notification", {
          type: "verification_rejected",
          complaintId: complaint.complaintId,
          remark,
        });
      } catch {}

      await notificationService.create({
        recipient: complaint.assignedWorker,
        type: "verification_rejected",
        title: "Work Rejected — Needs Revision",
        message: `Your work on complaint ${complaint.complaintId} was rejected: ${remark}`,
        complaint: complaint._id,
      });
    }

    return complaint;
  }

  async timeline(complaintId) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint || complaint.isDeleted) {
      throw new AppError("Complaint not found", 404);
    }

    const history = await ComplaintHistory.find({ complaint: complaintId })
      .populate("changedBy", "name role")
      .sort({ createdAt: 1 });

    return history;
  }

  _validateTransition(current, next) {
    const allowed = TRANSITIONS[current];
    if (!allowed) {
      throw new AppError(`Invalid current status: ${current}`, 400);
    }
    if (!allowed.includes(next)) {
      throw new AppError(
        `Cannot transition from "${current}" to "${next}". Allowed: ${allowed.join(", ")}`,
        400
      );
    }
  }

  async _generateComplaintId() {
    const year = new Date().getFullYear().toString();
    const counter = await Counter.findByIdAndUpdate(
      "complaintId",
      { $inc: { seq: 1 }, $setOnInsert: { year } },
      { upsert: true, new: true }
    );
    return `CMP-${year}-${String(counter.seq).padStart(4, "0")}`;
  }

  async _recordHistory(complaintId, previousStatus, newStatus, changedBy, remark) {
    await ComplaintHistory.create({
      complaint: complaintId,
      previousStatus,
      newStatus,
      changedBy,
      remark,
    });
  }

  _checkAccess(user, complaint) {
    if (user.role === "super_admin") return;
    if (
      user.role === "citizen" &&
      complaint.citizen.toString() === user.id
    ) {
      return;
    }
    if (
      user.role === "worker" &&
      complaint.assignedWorker &&
      complaint.assignedWorker.toString() === user.id
    ) {
      return;
    }
    throw new AppError("You do not have access to this complaint", 403);
  }

  _checkOwnerOrAdmin(user, complaint) {
    if (user.role === "super_admin") return;
    if (complaint.citizen.toString() === user.id) return;
    throw new AppError("You can only modify your own complaints", 403);
  }

  _checkDeptAccess(user, complaint) {
    if (user.role === "super_admin") return;
    if (user.role === "dept_head" && user.department) {
      if (complaint.department && complaint.department.toString() === user.department) {
        return;
      }
    }
    throw new AppError("You do not have permission to verify this complaint", 403);
  }
}

module.exports = new ComplaintService();
