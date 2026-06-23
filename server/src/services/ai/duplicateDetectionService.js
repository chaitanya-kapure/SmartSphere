const geminiService = require("./geminiService");
const prompts = require("./prompts");
const Complaint = require("../../models/Complaint");

const FALLBACK = {
  isDuplicate: false,
  duplicateOf: null,
  reason: null,
  confidence: 0,
};

async function check(title, description) {
  try {
    const recent = await Complaint.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("complaintId title description")
      .lean();

    if (recent.length === 0) {
      return { ...FALLBACK };
    }

    const prompt = prompts.DUPLICATE_PROMPT(title, description, recent);
    const result = await geminiService.execute(prompt, FALLBACK);

    const matched = recent.find((c) => c.complaintId === result?.duplicateOf);

    return {
      isDuplicate: result?.isDuplicate === true,
      duplicateOf: matched?._id || null,
      duplicateComplaintId: result?.isDuplicate ? (result?.duplicateOf || null) : null,
      reason: result?.reason || null,
      confidence: typeof result?.confidence === "number" ? result.confidence : 0,
    };
  } catch (err) {
    console.error("[Duplicate Detection Error]", err.message);
    return { ...FALLBACK };
  }
}

module.exports = { check };
