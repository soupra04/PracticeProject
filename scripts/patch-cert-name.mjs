import fs from "fs";
import zlib from "zlib";

const pdfPath = "c:/Ddrive/Coursera/PracticeProject/Coursera ABA9TPCXVWD8.pdf";
const backupPath = "c:/Ddrive/Coursera/PracticeProject/Coursera ABA9TPCXVWD8.backup.pdf";

const OLD = `BT
/F21 32 Tf
1 0 0 -1 105.59375 308 Tm
<0024> Tj
24.880001 0 Td <0045> Tj
19.880001 0 Td <004B> Tj
21.879997 0 Td <004C> Tj
12.8799973 0 Td <0051> Tj
22.879997 0 Td <004C> Tj
12.8799973 0 Td <004F> Tj
11.8799973 0 Td <0003> Tj
ET
BT
/F21 32 Tf
1 0 0 -1 243.625 308 Tm
<0030> Tj
31.880001 0 Td <0052> Tj
19.880001 0 Td <0051> Tj
22.879997 0 Td <0047> Tj
20.880005 0 Td <0044> Tj
19.880005 0 Td <004F> Tj
ET`;

const NEW = `BT
/F21 32 Tf
1 0 0 -1 105.59375 308 Tm
<0036> Tj
24.880001 0 Td <0052> Tj
19.880001 0 Td <0058> Tj
20.880005 0 Td <0053> Tj
12.8799973 0 Td <0055> Tj
22.879997 0 Td <0044> Tj
ET`;

function patchLengthInPreStream(preStream, newLen) {
  const tail = preStream.slice(-1200);
  const re = /\/Length\s+(\d+)/g;
  let m;
  let lastStart = -1;
  let lastEnd = -1;
  while ((m = re.exec(tail)) !== null) {
    lastStart = m.index;
    lastEnd = m.index + m[0].length;
  }
  if (lastStart < 0) return null;
  const absStart = preStream.length - tail.length + lastStart;
  const absEnd = preStream.length - tail.length + lastEnd;
  return (
    preStream.slice(0, absStart) +
    `/Length ${newLen}` +
    preStream.slice(absEnd)
  );
}

const s = fs.readFileSync(pdfPath, "latin1");
const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;

let m;
let out = "";
let cursor = 0;
let patched = false;

while ((m = streamRe.exec(s)) !== null) {
  const streamWordAt = m.index;
  const inner = m[1];
  const matchEnd = streamRe.lastIndex;
  const preStream = s.slice(cursor, streamWordAt);

  let inflated;
  try {
    inflated = zlib.inflateSync(Buffer.from(inner, "binary"));
  } catch {
    out += s.slice(cursor, matchEnd);
    cursor = matchEnd;
    continue;
  }

  if (inflated.length < 500000 || patched) {
    out += s.slice(cursor, matchEnd);
    cursor = matchEnd;
    continue;
  }

  const u = inflated.toString("latin1");
  if (!u.includes(OLD)) {
    console.error("OLD block not found in large stream");
    process.exit(1);
  }

  const newU = u.replace(OLD, NEW);
  const newCompressed = zlib.deflateSync(Buffer.from(newU, "binary"));
  const newInner = newCompressed.toString("binary");

  const newPre = patchLengthInPreStream(preStream, newInner.length);
  if (!newPre) {
    console.error("Could not find /Length before stream");
    process.exit(1);
  }

  out += newPre;
  out += "stream\n";
  out += newInner;
  out += "\nendstream";
  cursor = matchEnd;
  patched = true;
}

out += s.slice(cursor);

if (!patched) {
  console.error("Large stream not patched");
  process.exit(1);
}

fs.copyFileSync(pdfPath, backupPath);
fs.writeFileSync(pdfPath, out, "latin1");
console.log("OK:", pdfPath, "backup:", backupPath);
