const geminiService = require("./geminiService");
const prompts = require("./prompts");

async function summarize(title, description) {
  const prompt = prompts.SUMMARY_PROMPT(title, description);
  const result = await geminiService.execute(prompt, { summary: title });

  return {
    summary: result?.summary || title,
  };
}

module.exports = { summarize };
