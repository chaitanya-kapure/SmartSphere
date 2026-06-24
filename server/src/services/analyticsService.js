const mongoose = require("mongoose");
const Complaint = require("../models/Complaint");

class AnalyticsService {
  _roleFilter(user) {
    const match = { isDeleted: false };
    if (user.role === "citizen") {
      match.citizen = new mongoose.Types.ObjectId(user.id);
    } else if (user.role === "worker") {
      match.assignedWorker = new mongoose.Types.ObjectId(user.id);
    } else if (user.role === "dept_head") {
      match.department = new mongoose.Types.ObjectId(user.department);
    }
    return match;
  }

  async stats(user) {
    const match = this._roleFilter(user);
    const results = await Complaint.aggregate([
      { $match: match },
      {
        $facet: {
          total: [{ $count: "count" }],
          pending: [{ $match: { status: "pending" } }, { $count: "count" }],
          inProgress: [
            { $match: { status: "in_progress" } },
            { $count: "count" },
          ],
          resolved: [{ $match: { status: "resolved" } }, { $count: "count" }],
          overdue: [{ $match: { isOverdue: true } }, { $count: "count" }],
          avgResolutionTime: [
            {
              $match: {
                status: "resolved",
                resolutionTimeHours: { $ne: null },
              },
            },
            { $group: { _id: null, avg: { $avg: "$resolutionTimeHours" } } },
          ],
        },
      },
    ]);

    const r = results[0] || {};
    return {
      total: r.total?.[0]?.count ?? 0,
      pending: r.pending?.[0]?.count ?? 0,
      inProgress: r.inProgress?.[0]?.count ?? 0,
      resolved: r.resolved?.[0]?.count ?? 0,
      overdue: r.overdue?.[0]?.count ?? 0,
      avgResolutionTime: r.avgResolutionTime?.[0]?.avg
        ? Math.round(r.avgResolutionTime[0].avg * 10) / 10
        : null,
    };
  }

  async monthlyTrend(user) {
    const match = this._roleFilter(user);
    return Complaint.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, month: "$_id", count: 1 } },
    ]);
  }

  async departmentDistribution(user) {
    const match = this._roleFilter(user);
    match.department = { $ne: null };
    return Complaint.aggregate([
      { $match: match },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "_id",
          as: "dept",
        },
      },
      { $unwind: { path: "$dept", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          department: "$_id",
          name: "$dept.name",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  async statusDistribution(user) {
    const match = this._roleFilter(user);
    return Complaint.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
      { $sort: { count: -1 } },
    ]);
  }

  async priorityDistribution(user) {
    const match = this._roleFilter(user);
    return Complaint.aggregate([
      { $match: match },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
      { $project: { _id: 0, priority: "$_id", count: 1 } },
      { $sort: { count: -1 } },
    ]);
  }

  async areaTrend(user) {
    const match = this._roleFilter(user);
    match["location.coordinates"] = { $ne: [0, 0] };
    return Complaint.aggregate([
      { $match: match },
      {
        $addFields: {
          latBucket: {
            $round: [{ $arrayElemAt: ["$location.coordinates", 1] }, 2],
          },
          lngBucket: {
            $round: [{ $arrayElemAt: ["$location.coordinates", 0] }, 2],
          },
        },
      },
      {
        $group: {
          _id: { lat: "$latBucket", lng: "$lngBucket" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
      {
        $project: {
          _id: 0,
          area: {
            $concat: [
              { $toString: "$_id.lat" },
              ", ",
              { $toString: "$_id.lng" },
            ],
          },
          count: 1,
          lat: "$_id.lat",
          lng: "$_id.lng",
        },
      },
    ]);
  }

  async workerPerformance(user) {
    const match = this._roleFilter(user);
    match.assignedWorker = { $ne: null };
    match.status = "resolved";

    if (user.role === "dept_head") {
      const User = require("../models/User");
      const workers = await User.find(
        { department: user.department, role: "worker" },
        { _id: 1 }
      );
      match.assignedWorker = {
        $in: workers.map((w) => w._id),
        $ne: null,
      };
    }

    return Complaint.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$assignedWorker",
          resolved: { $sum: 1 },
          avgTime: { $avg: "$resolutionTimeHours" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "worker",
        },
      },
      { $unwind: { path: "$worker", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          worker: "$_id",
          name: "$worker.name",
          resolved: 1,
          avgTime: { $round: ["$avgTime", 1] },
        },
      },
      { $sort: { resolved: -1 } },
      { $limit: 20 },
    ]);
  }
}

module.exports = new AnalyticsService();
