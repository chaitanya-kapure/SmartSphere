const Department = require("../models/Department");

const RULES = [
  {
    keywords: [
      "street light", "streetlight", "light", "lamp post", "lamp",
      "electrical", "power cut", "power outage", "electricity",
      "wire", "cable", "pole", "transformer", "voltage", "circuit",
    ],
    category: "Electrical",
    departmentName: "Electrical Department",
    departmentCode: "ELEC",
  },
  {
    keywords: [
      "garbage", "waste", "sanitation", "trash", "rubbish",
      "dump", "litter", "clean", "sweep", "bin", "dustbin",
      "stench", "smell", "rotten", "decay",
    ],
    category: "Sanitation",
    departmentName: "Sanitation Department",
    departmentCode: "SAN",
  },
  {
    keywords: [
      "road", "pothole", "pavement", "footpath", "sidewalk",
      "speed breaker", "speed bump", "road divider", "median",
      "street", "asphalt", "culvert", "manhole", "kerb",
    ],
    category: "Roads",
    departmentName: "Roads Department",
    departmentCode: "ROAD",
  },
  {
    keywords: [
      "water", "leak", "pipe", "drain", "sewage", "sewer",
      "plumbing", "tap", "supply", "flood", "overflow",
      "drainage", "clog", "blocked drain",
    ],
    category: "Water Supply",
    departmentName: "Water Supply Department",
    departmentCode: "WATER",
  },
  {
    keywords: [
      "park", "garden", "tree", "plant", "playground",
      "bench", "fountain", "grass", "hedge", "flower",
    ],
    category: "Parks & Gardens",
    departmentName: "Parks & Gardens Department",
    departmentCode: "PARK",
  },
  {
    keywords: [
      "noise", "encroachment", "illegal construction",
      "nuisance", "stray animal", "cow", "dog", "pest",
      "rodent", "mosquito", "fogging",
    ],
    category: "Public Safety",
    departmentName: "Public Safety Department",
    departmentCode: "SAFETY",
  },
  {
    keywords: [
      "hospital", "health", "clinic", "medical", "disease",
      "ambulance", "medicine",
    ],
    category: "Health",
    departmentName: "Health Department",
    departmentCode: "HEALTH",
  },
  {
    keywords: [
      "school", "college", "education", "library", "museum",
      "play school", "university",
    ],
    category: "Education",
    departmentName: "Education Department",
    departmentCode: "EDU",
  },
  {
    keywords: [
      "building", "construction", "property", "land",
      "encroachment", "violation", "demolition", "license",
    ],
    category: "Building & Construction",
    departmentName: "Building & Construction Department",
    departmentCode: "BUILD",
  },
  {
    keywords: [
      "bus", "traffic", "signal", "transport", "auto",
      "rickshaw", "vehicle", "parking", "taxi", "cab",
      "road blockage", "traffic jam",
    ],
    category: "Transport",
    departmentName: "Transport Department",
    departmentCode: "TRAN",
  },
];

async function classifyByKeywords(title, description) {
  const text = `${title} ${description}`.toLowerCase();

  let bestMatch = null;
  let bestScore = 0;

  for (const rule of RULES) {
    let score = 0;
    for (const keyword of rule.keywords) {
      let idx = 0;
      while (idx !== -1) {
        idx = text.indexOf(keyword, idx);
        if (idx !== -1) {
          score++;
          idx += keyword.length;
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = rule;
    }
  }

  let source = "general";
  let deptName = "General Services Department";
  let deptCode = "GEN";
  let category = "General";

  if (bestMatch && bestScore > 0) {
    source = "keyword";
    deptName = bestMatch.departmentName;
    deptCode = bestMatch.departmentCode;
    category = bestMatch.category;
  }

  let dept = await Department.findOne({ code: deptCode });
  if (!dept) {
    dept = await Department.create({
      name: deptName,
      code: deptCode,
      description: `Auto-created for ${category} complaints`,
    });
  }

  return { departmentId: dept._id, category, departmentName: deptName, source };
}

module.exports = { classifyByKeywords };
