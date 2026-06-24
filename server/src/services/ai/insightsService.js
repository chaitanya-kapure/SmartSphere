const geminiService = require("./geminiService");
const prompts = require("./prompts");
const Complaint = require("../../models/Complaint");
const Department = require("../../models/Department");

async function getAggregatedData() {
  const [
    categoryDist,
    areaData,
    monthlyTrend,
    deptCounts,
    priorityDist,
    totalComplaints,
    recentComplaints,
  ] = await Promise.all([
    Complaint.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    Complaint.aggregate([
      { $match: { isDeleted: false, "location.coordinates": { $ne: [0, 0] } } },
      {
        $addFields: {
          latBucket: { $round: [{ $arrayElemAt: ["$location.coordinates", 1] }, 1] },
          lngBucket: { $round: [{ $arrayElemAt: ["$location.coordinates", 0] }, 1] },
        },
      },
      { $group: { _id: { lat: "$latBucket", lng: "$lngBucket" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    Complaint.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 6 },
    ]),
    Complaint.aggregate([
      { $match: { isDeleted: false, department: { $ne: null } } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    Complaint.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]),
    Complaint.countDocuments({ isDeleted: false }),
    Complaint.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("complaintId title category status createdAt")
      .lean(),
  ]);

  const departments = await Department.find({}).select("name").lean();
  const deptMap = {};
  for (const d of departments) {
    deptMap[d._id.toString()] = d.name;
  }

  return {
    totalComplaints,
    categoryDistribution: categoryDist.map((c) => ({ category: c._id, count: c.count })),
    highDensityAreas: areaData.map((a) => ({
      area: `${a._id.lat}, ${a._id.lng}`,
      count: a.count,
    })),
    monthlyTrend: monthlyTrend.map((m) => ({ month: m._id, count: m.count })),
    departmentWorkload: deptCounts.map((d) => ({
      department: deptMap[d._id?.toString()] || "Unknown",
      count: d.count,
    })),
    priorityDistribution: priorityDist.map((p) => ({ priority: p._id, count: p.count })),
    recentComplaints: recentComplaints.map((c) => ({
      id: c.complaintId,
      title: c.title,
      category: c.category,
      status: c.status,
      date: c.createdAt,
    })),
  };
}

async function generate() {
  try {
    const data = await getAggregatedData();
    const prompt = prompts.INSIGHTS_PROMPT(data);
    const result = await geminiService.execute(prompt, null);

    if (!result) {
      return { data, insights: null };
    }

    return {
      data,
      insights: {
        topCategories: result.topCategories || "Data being analyzed",
        highRiskAreas: result.highRiskAreas || "Data being analyzed",
        emergingTrends: result.emergingTrends || "Data being analyzed",
        workloadPredictions: result.workloadPredictions || "Data being analyzed",
      },
    };
  } catch (err) {
    console.error("[AI Insights Error]", err.message);
    return { data: null, insights: null };
  }
}

module.exports = { generate };
