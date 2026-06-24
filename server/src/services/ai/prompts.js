exports.CLASSIFY_PROMPT = (title, description) => `You are a municipal complaint classifier for a smart city system.
Classify the following citizen complaint into a category and suggest the responsible municipal department.

Title: "${title}"
Description: "${description}"

Respond with a JSON object only (no markdown, no backticks):
{
  "category": "short category name like Electrical, Sanitation, Roads, Water, Public Safety, Parks, etc.",
  "department": "full department name like Electrical Department, Sanitation Department, etc.",
  "confidence": <number between 0 and 1>
}`;

exports.PRIORITY_PROMPT = (title, description) => `You are a complaint priority assessor for a smart city system.
Assess the urgency of the following citizen complaint.

Title: "${title}"
Description: "${description}"

Priority levels:
- low: minor cosmetic issues, no safety risk
- medium: some inconvenience but not urgent
- high: significant disruption or safety concern
- critical: immediate danger to life or property

Respond with a JSON object only (no markdown, no backticks):
{
  "priority": "low" or "medium" or "high" or "critical",
  "confidence": <number between 0 and 1>
}`;

exports.DUPLICATE_PROMPT = (title, description, existing) => `You are a duplicate complaint detector for a smart city system.
Determine if the following new complaint is a duplicate of any existing complaint.

New complaint:
Title: "${title}"
Description: "${description}"

Existing complaints:
${existing.map((c, i) => `${i + 1}. ID: ${c.complaintId} | Title: "${c.title}" | Description: "${c.description?.substring(0, 200)}"`).join("\n")}

Consider semantic similarity, not just exact text match. Two complaints about the same issue at the same location are duplicates even if worded differently.

Respond with a JSON object only (no markdown, no backticks):
{
  "isDuplicate": true or false,
  "duplicateOf": "<complaintId of the matching existing complaint or null>",
  "reason": "brief explanation of why it is or isn't a duplicate",
  "confidence": <number between 0 and 1>
}`;

exports.SUMMARY_PROMPT = (title, description) => `You are a complaint summarizer for a smart city system.
Generate a concise one-line summary (max 15 words) of the following citizen complaint.

Title: "${title}"
Description: "${description}"

Respond with a JSON object only (no markdown, no backticks):
{
  "summary": "concise one-line summary, max 15 words"
}`;

exports.INSIGHTS_PROMPT = (aggregatedData) => `You are a municipal AI analyst. Review the following aggregated complaint data and provide strategic insights.

Data:
${JSON.stringify(aggregatedData, null, 2)}

Respond with a JSON object only (no markdown, no backticks):
{
  "topCategories": "brief description of most common complaint categories",
  "highRiskAreas": "areas with unusually high complaint density",
  "emergingTrends": "noticeable patterns or trends in recent complaints",
  "workloadPredictions": "predicted workload changes for departments based on trends"
}`;
