/**
 * Split raw document text into discrete requirement-like chunks.
 */
function normalizeText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .trim();
}

function extractRequirements(raw) {
  const text = normalizeText(raw);
  if (!text) return [];

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  /** @type {string[]} */
  const chunks = [];

  const isBullet = (line) =>
    /^[-*•]\s+/.test(line) ||
    /^\d+[\.)]\s+/.test(line) ||
    /^(FR|REQ|REQ-|UC|BR|NFR)[-_]?\d+/i.test(line) ||
    /\b(shall|must|should)\b/i.test(line);

  let buffer = [];
  const flush = () => {
    const joined = buffer.join(" ").replace(/\s+/g, " ").trim();
    if (joined.length >= 12) chunks.push(joined);
    buffer = [];
  };

  for (const line of lines) {
    if (isBullet(line) && buffer.length) {
      flush();
    }
    buffer.push(line);
  }
  flush();

  if (chunks.length === 0) {
    const paragraphs = text.split(/\n\n+/).map((p) => p.replace(/\s+/g, " ").trim());
    for (const p of paragraphs) {
      if (p.length >= 20) chunks.push(p);
    }
  }

  if (chunks.length === 0 && text.length >= 12) {
    return [text];
  }

  return chunks.slice(0, 80);
}

module.exports = { extractRequirements, normalizeText };
