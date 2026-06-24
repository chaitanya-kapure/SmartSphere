const mongoose = require("mongoose");
const config = require("../src/config/env");
const Complaint = require("../src/models/Complaint");
const User = require("../src/models/User");
const Department = require("../src/models/Department");
const Counter = require("../src/models/Counter");

(async () => {
  await mongoose.connect(config.mongodbUri);
  console.log("Connected\n");

  const citizen = await User.findOne({ role: "citizen" });
  if (!citizen) {
    console.log("No citizen found. Create one first.");
    process.exit(1);
  }
  console.log(`Using citizen: ${citizen.name} (${citizen._id})\n`);

  const complaintService = require("../src/services/complaintService");

  const samples = [
    { title: "Street light not working at junction", description: "The street light near the market has been broken for 3 days. Area is dark at night." },
    { title: "Garbage bins overflowing", description: "Garbage not collected for a week in sector 12. Waste is scattered everywhere." },
    { title: "Pothole on main road", description: "Large pothole on the main road near bus stop causing damage to vehicles." },
    { title: "Water pipeline leakage", description: "Water pipeline has burst near apartment complex. Lots of water wastage." },
    { title: "General complaint about neighborhood", description: "I have a general issue I want to report about my locality." },
  ];

  let allPass = true;
  const createdIds = [];

  for (const s of samples) {
    const complaint = await complaintService.create(citizen._id.toString(), {
      title: s.title,
      description: s.description,
    });
    createdIds.push(complaint._id);

    const doc = await Complaint.findById(complaint._id).populate("department", "name code");
    const checks = [];
    checks.push({ name: "department", pass: doc.department != null, val: doc.department?.name });
    checks.push({ name: "category", pass: doc.category != null, val: doc.category });
    checks.push({ name: "priority", pass: doc.priority != null, val: doc.priority });
    checks.push({ name: "aiClassification.source", pass: ["gemini", "keyword", "general"].includes(doc.aiClassification.source), val: doc.aiClassification.source });
    checks.push({ name: "aiClassification.confidence", pass: typeof doc.aiClassification.confidence === "number", val: doc.aiClassification.confidence });

    const fail = checks.filter(c => !c.pass);
    if (fail.length) { allPass = false; }
    const status = fail.length ? "FAIL" : "PASS";
    const details = checks.map(c => `${c.name}=${c.val ?? "null"}`).join(" | ");
    console.log(`${status} | ${s.title.padEnd(35)} | ${details}`);
  }

  console.log(`\n${allPass ? "ALL PASS" : "SOME FAILED"}`);

  for (const id of createdIds) {
    await Complaint.findByIdAndDelete(id);
  }
  console.log("Cleaned up test complaints");

  await mongoose.disconnect();
})();
