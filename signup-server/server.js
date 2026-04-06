const path = require("path");
const express = require("express");
const { DatabaseSync } = require("node:sqlite");

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "signup.db");
const PUBLIC_DIR = path.join(__dirname, "..");

const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    phone TEXT NOT NULL,
    username TEXT NOT NULL,
    is_demo INTEGER NOT NULL DEFAULT 0,
    hidden INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const DEMO_SEED = [
  ["Jane", "Doe", "jane.doe@example.com", "+1 555 100 0001", "jdoe"],
  ["Marcus", "Smith", "marcus.smith@example.com", "+1 555 100 0002", "msmith"],
  ["Kim", "Lee", "kim.lee@example.com", "+1 555 100 0003", "klee"],
  ["Alex", "Rivera", "alex.rivera@example.com", "+1 555 100 0004", "adev"],
];

const insertDemo = db.prepare(`
  INSERT OR IGNORE INTO users (first_name, last_name, email, phone, username, is_demo, hidden)
  VALUES (?, ?, ?, ?, ?, 1, 0)
`);

for (const row of DEMO_SEED) {
  insertDemo.run(...row);
}

const app = express();
app.use(express.json({ limit: "32kb" }));

function isUniqueConstraintError(err) {
  if (!err) return false;
  const msg = String(err.message || "");
  return msg.includes("UNIQUE constraint failed") || msg.includes("SQLITE_CONSTRAINT_UNIQUE");
}

app.get("/api/users", (req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT id, first_name AS firstName, last_name AS lastName, email, phone, username,
                is_demo AS isDemo
         FROM users
         WHERE hidden = 0
         ORDER BY is_demo DESC, id ASC`
      )
      .all();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load users" });
  }
});

app.post("/api/users", (req, res) => {
  const { firstName, lastName, email, phone, username } = req.body || {};

  if (
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    typeof username !== "string"
  ) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const fn = firstName.trim();
  const ln = lastName.trim();
  const em = email.trim();
  const ph = phone.trim();
  const un = username.trim();

  if (!fn || !ln || !em || !ph || !un) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (un.length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters" });
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRe = /^[\d\s\-+().]{10,20}$/;
  if (!emailRe.test(em)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (!phoneRe.test(ph)) {
    return res.status(400).json({ error: "Invalid phone" });
  }

  try {
    const info = db
      .prepare(
        `INSERT INTO users (first_name, last_name, email, phone, username, is_demo, hidden)
         VALUES (?, ?, ?, ?, ?, 0, 0)`
      )
      .run(fn, ln, em, ph, un);

    const id = Number(info.lastInsertRowid);
    const row = db
      .prepare(
        `SELECT id, first_name AS firstName, last_name AS lastName, email, phone, username,
                is_demo AS isDemo
         FROM users WHERE id = ?`
      )
      .get(id);

    res.status(201).json(row);
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return res.status(409).json({ error: "This email is already registered." });
    }
    console.error(err);
    res.status(500).json({ error: "Could not create user" });
  }
});

app.post("/api/users/remove", (req, res) => {
  const ids = req.body && Array.isArray(req.body.ids) ? req.body.ids : [];
  const numericIds = ids.map((n) => Number(n)).filter((n) => Number.isInteger(n) && n > 0);
  if (!numericIds.length) {
    return res.status(400).json({ error: "ids array required" });
  }

  const hideDemo = db.prepare(
    `UPDATE users SET hidden = 1 WHERE id = ? AND is_demo = 1 AND hidden = 0`
  );
  const deleteReal = db.prepare(`DELETE FROM users WHERE id = ? AND is_demo = 0`);

  try {
    for (const id of numericIds) {
      const row = db.prepare(`SELECT is_demo FROM users WHERE id = ?`).get(id);
      if (!row) continue;
      if (row.is_demo) hideDemo.run(id);
      else deleteReal.run(id);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Remove failed" });
  }
});

app.use(express.static(PUBLIC_DIR));

app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT}/index.html`);
});
