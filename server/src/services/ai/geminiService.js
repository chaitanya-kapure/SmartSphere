const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require("../../config/env");

let genAI = null;

function getClient() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
  }
  return genAI;
}

async function execute(promptText, fallback) {
  try {
    const model = getClient().getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(promptText);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("[AI Service Error]", err.message);
    return fallback;
  }
}

module.exports = { execute };
