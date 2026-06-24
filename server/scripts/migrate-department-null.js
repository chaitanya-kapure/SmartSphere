const mongoose = require("mongoose");
const config = require("../src/config/env");
const User = require("../src/models/User");
const Department = require("../src/models/Department");

async function migrate() {
  if (!config.mongodbUri) {
    console.error("MONGODB_URI is not set. Check .env file.");
    process.exit(1);
  }
  await mongoose.connect(config.mongodbUri);
  console.log("Connected to MongoDB");

  const GEN = await Department.findOne({ code: "GEN" });
  if (!GEN) {
    console.log("No GEN department found; creating it...");
    const gen = await Department.create({
      name: "General Services Department",
      code: "GEN",
      description: "Fallback department for unclassified assignments",
    });
    console.log(`Created department: ${gen.name} (${gen._id})`);
  }

  const genDepartment = await Department.findOne({ code: "GEN" });

  const nullDeptUsers = await User.find({
    role: { $in: ["dept_head", "worker"] },
    $or: [{ department: null }, { department: { $exists: false } }],
  });

  console.log(`Found ${nullDeptUsers.length} users with department=null (dept_head/worker)`);

  if (nullDeptUsers.length > 0) {
    const result = await User.updateMany(
      { _id: { $in: nullDeptUsers.map((u) => u._id) } },
      { $set: { department: genDepartment._id } }
    );
    console.log(`Updated ${result.modifiedCount} users to GEN department`);

    for (const user of nullDeptUsers) {
      console.log(`  ${user.email} (${user.role}) → GEN`);
    }
  }

  await mongoose.disconnect();
  console.log("Migration complete");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
