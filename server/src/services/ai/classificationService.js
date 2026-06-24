const geminiService = require("./geminiService");
const prompts = require("./prompts");

const FALLBACK = {
  category: "General",
  department: null,
  confidence: 0,
};

async function classify(title, description) {
  const prompt = prompts.CLASSIFY_PROMPT(title, description);
  const result = await geminiService.execute(prompt, FALLBACK);

  return {
    category: result.category || FALLBACK.category,
    department: result.department || null,
    confidence: typeof result.confidence === "number" ? result.confidence : 0,
  };
}

module.exports = { classify };
