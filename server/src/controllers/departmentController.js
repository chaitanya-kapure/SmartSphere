const Department = require("../models/Department");

exports.listActive = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true, isDeleted: false })
      .select("name code description")
      .sort("name")
      .lean();
    res.json({ success: true, data: departments });
  } catch (err) {
    next(err);
  }
};
