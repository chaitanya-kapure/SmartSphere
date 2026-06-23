const geminiService = require("./geminiService");
const prompts = require("./prompts");

const PRIORITY_VALUES = ["low", "medium", "high", "critical"];
const FALLBACK = {
  priority: "medium",
  confidence: 0,
};

async function predict(title, description) {
  const prompt = prompts.PRIORITY_PROMPT(title, description);
  const result = await geminiService.execute(prompt, FALLBACK);

  const priority = PRIORITY_VALUES.includes(result?.priority)
    ? result.priority
    : FALLBACK.priority;

  return {
    priority,
    confidence: typeof result?.confidence === "number" ? result.confidence : 0,
  };
}

module.exports = { predict };
