const User = require("../models/User");

exports.listWorkers = async (req, res, next) => {
  try {
    const department = req.user.department;
    if (!department) {
      return res.json({ success: true, data: [] });
    }
    const workers = await User.find({
      role: "worker",
      department,
      isDeleted: false,
    })
      .select("name email")
      .sort("name")
      .lean();
    res.json({ success: true, data: workers });
  } catch (err) {
    next(err);
  }
};
