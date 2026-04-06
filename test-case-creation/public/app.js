const fileInput = document.getElementById("fileInput");
const fileName = document.getElementById("fileName");
const reqText = document.getElementById("reqText");
const generateBtn = document.getElementById("generateBtn");
const statusEl = document.getElementById("status");
const summary = document.getElementById("summary");
const tableWrap = document.getElementById("tableWrap");
const tbody = document.getElementById("tbody");
const emptyMsg = document.getElementById("emptyMsg");
const exportBtns = document.getElementById("exportBtns");
const exportJson = document.getElementById("exportJson");
const exportCsv = document.getElementById("exportCsv");
const detail = document.getElementById("detail");
const detailTitle = document.getElementById("detailTitle");
const dRef = document.getElementById("dRef");
const dTrace = document.getElementById("dTrace");
const dPre = document.getElementById("dPre");
const dSteps = document.getElementById("dSteps");
const dExp = document.getElementById("dExp");

/** @type {{ requirements: string[], testCases: object[] } | null} */
let lastResult = null;
/** @type {number | null} */
let selectedIndex = null;

fileInput.addEventListener("change", () => {
  const f = fileInput.files && fileInput.files[0];
  fileName.textContent = f ? f.name : "No file selected";
});

function setStatus(msg, isError) {
  statusEl.textContent = msg || "";
  statusEl.classList.toggle("error", !!isError);
}

function typeClass(type) {
  const t = (type || "").toLowerCase();
  if (t === "positive") return "type-positive";
  if (t === "negative") return "type-negative";
  if (t === "boundary") return "type-boundary";
  return "";
}

function showDetail(tc, index) {
  selectedIndex = index;
  detail.hidden = false;
  detailTitle.textContent = tc.title;
  dRef.textContent = tc.requirementRef;
  dTrace.textContent = tc.traceability;
  dPre.textContent = tc.preconditions;
  dExp.textContent = tc.expectedResult;
  dSteps.innerHTML = "";
  (tc.steps || []).forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s;
    dSteps.appendChild(li);
  });

  [...tbody.querySelectorAll("tr")].forEach((row, i) => {
    row.classList.toggle("selected", i === index);
  });
}

function render(result) {
  lastResult = result;
  const { requirements, testCases } = result;

  if (!testCases.length) {
    emptyMsg.hidden = false;
    emptyMsg.textContent = "No test cases produced. Add more structured requirement text.";
    summary.hidden = true;
    tableWrap.hidden = true;
    exportBtns.hidden = true;
    detail.hidden = true;
    return;
  }

  emptyMsg.hidden = true;
  summary.hidden = false;
  summary.textContent = `${requirements.length} requirement block(s) → ${testCases.length} test case(s) (positive, negative, boundary per block).`;

  tbody.innerHTML = "";
  testCases.forEach((tc, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="mono">${escapeHtml(tc.id)}</td>
      <td class="${typeClass(tc.type)}">${escapeHtml(tc.type)}</td>
      <td>${escapeHtml(tc.priority)}</td>
      <td>${escapeHtml(tc.title)}</td>
      <td>${escapeHtml(tc.feature)}</td>
    `;
    tr.addEventListener("click", () => showDetail(tc, i));
    tbody.appendChild(tr);
  });

  tableWrap.hidden = false;
  exportBtns.hidden = false;
  showDetail(testCases[0], 0);
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

generateBtn.addEventListener("click", async () => {
  setStatus("Generating…");
  detail.hidden = true;

  const fd = new FormData();
  const file = fileInput.files && fileInput.files[0];
  if (file) fd.append("document", file);
  const text = reqText.value.trim();
  if (!file && text) fd.append("text", text);

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || "Request failed", true);
      return;
    }
    setStatus("Done.");
    render(data);
  } catch (e) {
    setStatus(e.message || "Network error", true);
  }
});

function downloadBlob(filename, mime, body) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([body], { type: mime }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

exportJson.addEventListener("click", () => {
  if (!lastResult) return;
  downloadBlob(
    "test-cases.json",
    "application/json",
    JSON.stringify(lastResult, null, 2)
  );
});

exportCsv.addEventListener("click", () => {
  if (!lastResult || !lastResult.testCases.length) return;
  const rows = lastResult.testCases;
  const headers = [
    "id",
    "title",
    "requirementRef",
    "feature",
    "type",
    "priority",
    "preconditions",
    "steps",
    "expectedResult",
    "traceability",
  ];
  const esc = (v) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((tc) =>
      headers
        .map((h) => {
          if (h === "steps") return esc(Array.isArray(tc.steps) ? tc.steps.join(" | ") : "");
          return esc(tc[h]);
        })
        .join(",")
    ),
  ];
  downloadBlob("test-cases.csv", "text/csv;charset=utf-8", lines.join("\n"));
});
