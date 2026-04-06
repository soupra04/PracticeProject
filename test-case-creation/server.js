const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { generateFromDocument } = require("./lib/generateTestCases");
const { normalizeText } = require("./lib/extractRequirements");

const app = express();
const PORT = process.env.PORT || 3847;

app.use(cors());
app.use(express.json({ limit: "4mb" }));
app.use(express.static(path.join(__dirname, "public")));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

async function textFromUpload(file) {
  if (!file || !file.buffer) return "";
  const name = (file.originalname || "").toLowerCase();

  if (name.endsWith(".pdf")) {
    const data = await pdfParse(file.buffer);
    return normalizeText(data.text || "");
  }

  if (
    name.endsWith(".txt") ||
    name.endsWith(".md") ||
    name.endsWith(".csv") ||
    name.endsWith(".log")
  ) {
    return normalizeText(file.buffer.toString("utf8"));
  }

  try {
    return normalizeText(file.buffer.toString("utf8"));
  } catch {
    return "";
  }
}

app.post("/api/generate", upload.single("document"), async (req, res) => {
  try {
    let documentText = "";

    if (req.file) {
      documentText = await textFromUpload(req.file);
    }

    if (!documentText && req.body && typeof req.body.text === "string") {
      documentText = normalizeText(req.body.text);
    }

    if (!documentText || documentText.length < 10) {
      return res.status(400).json({
        error:
          "No readable requirement text. Paste text (10+ characters) or upload .txt / .md / .pdf.",
      });
    }

    const result = generateFromDocument(documentText);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Generation failed" });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "test-case-creation" });
});

app.listen(PORT, () => {
  console.log(`Test Case Creation running at http://localhost:${PORT}`);
});
