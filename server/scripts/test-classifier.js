const mongoose = require("mongoose");
const config = require("../src/config/env");
const dc = require("../src/services/departmentClassifier");

const samples = [
  { title: "Street light not working", desc: "The street light at junction near market has been broken for 3 days", expect: "ELEC" },
  { title: "Garbage not collected", desc: "Garbage bins are overflowing in sector 12", expect: "SAN" },
  { title: "Pothole on main road", desc: "Large pothole on the main road near bus stop damaging vehicles", expect: "ROAD" },
  { title: "Water pipeline leakage", desc: "Water pipeline has burst near apartment complex, lots of wastage", expect: "WATER" },
  { title: "Something vague", desc: "I have a general complaint about things in my neighborhood", expect: "GEN" },
];

(async () => {
  await mongoose.connect(config.mongodbUri);
  console.log("Connected\n");

  let allPass = true;
  for (const s of samples) {
    const result = await dc.classifyByKeywords(s.title, s.desc);
    const nameCheck = s.expect === "ELEC" ? "Electrical"
      : s.expect === "SAN" ? "Sanitation"
      : s.expect === "ROAD" ? "Roads"
      : s.expect === "WATER" ? "Water Supply"
      : "General";
    const pass = result.source === (s.expect === "GEN" ? "general" : "keyword") &&
      result.departmentName.includes(nameCheck);
    if (!pass) allPass = false;
    console.log(
      `${pass ? "PASS" : "FAIL"} | ${s.title.padEnd(30)} | ${result.category.padEnd(18)} | source=${result.source.padEnd(7)} | dept=${result.departmentName}`
    );
  }

  console.log(`\n${allPass ? "ALL PASS" : "SOME FAILED"}`);
  await mongoose.disconnect();
})();
