const { extractRequirements } = require("./extractRequirements");

function slugId(prefix, index) {
  return `${prefix}-${String(index).padStart(3, "0")}`;
}

function inferFeature(reqText) {
  const t = reqText.slice(0, 80).toLowerCase();
  if (/\b(login|auth|password|session|token|oauth)\b/.test(t)) return "Authentication";
  if (/\b(api|rest|endpoint|http|request)\b/.test(t)) return "API";
  if (/\b(ui|screen|page|button|form)\b/.test(t)) return "UI";
  if (/\b(email|notification|sms)\b/.test(t)) return "Notifications";
  if (/\b(report|export|csv|pdf)\b/.test(t)) return "Reporting";
  if (/\b(database|persist|store|save)\b/.test(t)) return "Data";
  return "General";
}

function cleanReqLine(reqText) {
  return reqText.replace(/\s+/g, " ").replace(/^[-*•]\s+/, "").trim();
}

function shortTitle(reqText, max = 72) {
  const one = cleanReqLine(reqText);
  if (one.length <= max) return one;
  return one.slice(0, max - 1).trim() + "…";
}

/**
 * @param {string} documentText
 * @returns {{ requirements: string[], testCases: object[] }}
 */
function generateFromDocument(documentText) {
  const requirements = extractRequirements(documentText);
  /** @type {object[]} */
  const testCases = [];

  let tcIndex = 1;

  requirements.forEach((req, rIdx) => {
    const feature = inferFeature(req);
    const ref = `REQ-${String(rIdx + 1).padStart(3, "0")}`;

    const positive = {
      id: slugId("TC", tcIndex++),
      title: `[Positive] ${shortTitle(req)}`,
      requirementRef: ref,
      feature,
      type: "Positive",
      priority: /\b(critical|must|shall)\b/i.test(req) ? "High" : "Medium",
      preconditions: "System is available; user has access as per test data.",
      steps: [
        "Identify the scenario described in the requirement.",
        "Execute the happy-path actions that satisfy the requirement.",
        "Observe system response and persisted state (if applicable).",
      ],
      expectedResult: "Behavior matches the requirement; no errors for valid use.",
      traceability: cleanReqLine(req).slice(0, 500),
    };
    testCases.push(positive);

    const negative = {
      id: slugId("TC", tcIndex++),
      title: `[Negative] Invalid input / failure path — ${shortTitle(req, 56)}`,
      requirementRef: ref,
      feature,
      type: "Negative",
      priority: "Medium",
      preconditions: "Same feature area as the positive case; use invalid or disallowed inputs per requirement.",
      steps: [
        "Attempt the same flow with invalid, missing, or out-of-range inputs.",
        "Attempt unauthorized or disallowed actions if the requirement implies constraints.",
        "Observe validation, error messages, and system stability.",
      ],
      expectedResult: "Invalid actions are rejected safely; clear feedback; no data corruption.",
      traceability: cleanReqLine(req).slice(0, 500),
    };
    testCases.push(negative);

    const boundary = {
      id: slugId("TC", tcIndex++),
      title: `[Boundary] Edge values — ${shortTitle(req, 56)}`,
      requirementRef: ref,
      feature,
      type: "Boundary",
      priority: "Low",
      preconditions: "Known limits from requirement (lengths, counts, ranges) or documented defaults.",
      steps: [
        "Test minimum and maximum allowed values where limits are stated or implied.",
        "Test empty/null where optional fields exist.",
        "Test one step beyond limits if applicable.",
      ],
      expectedResult: "Limits enforced consistently; behavior at edges is defined and stable.",
      traceability: cleanReqLine(req).slice(0, 500),
    };
    testCases.push(boundary);
  });

  return { requirements, testCases };
}

module.exports = { generateFromDocument };
