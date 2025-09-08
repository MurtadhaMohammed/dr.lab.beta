const { PDF_CFG } = require("./config");

// ---- helpers ----
async function getImageDimensionsFromDataUrl(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.src = dataUrl;
  });
}

function addFontIfNeeded(doc, fontSize = 10) {
  doc.setFont(PDF_CFG.font.family);
  doc.setFontSize(fontSize);
}

function fmtNum(n) {
  if (n === null || n === undefined || n === "") return "";
  const v = Number(n);
  return Number.isFinite(v) ? v.toLocaleString("en") : String(n);
}

function formatRef(ref_text, fallbackUnit = "") {
  if (!ref_text) return "";
  try {
    const parsed = JSON.parse(ref_text);
    if (Array.isArray(parsed)) {
      return parsed.map(objToLine).join(" | ");
    }
    if (parsed && typeof parsed === "object") {
      return objToLine(parsed);
    }
  } catch {}
  return String(ref_text).trim();

  function objToLine(o = {}) {
    const parts = [];
    if (o.sex) parts.push(`Sex:${String(o.sex).toUpperCase()}`);
    if (o.age_min || o.age_max) {
      parts.push(`Age:${o.age_min ?? "—"}–${o.age_max ?? "—"}y`);
    }
    let val = "";
    if (o.low != null && o.high != null) val = `${o.low}–${o.high}`;
    else if (o.op && o.value != null) val = `${o.op}${o.value}`;
    else if (o.value != null) val = `${o.value}`;
    const unit = o.unit || fallbackUnit || "";
    return (
      (parts.length ? `[${parts.join(", ")}] ` : "") +
      (val ? `${val}${unit ? " " + unit : ""}` : "")
    );
  }
}

function getSingleResultRJ(rj) {
  if (rj && typeof rj === "object") return rj.result ?? "";
  return "";
}
function getPanelResultRJ(rj, code) {
  if (!rj || typeof rj !== "object") return "";
  return rj.items?.[code]?.result ?? "";
}
function getCompositeResultRJ(rj, sectCode, fieldCode) {
  if (!rj || typeof rj !== "object") return "";
  return rj.sections?.[sectCode]?.[fieldCode] ?? "";
}

module.exports = {
  getImageDimensionsFromDataUrl,
  addFontIfNeeded,
  fmtNum,
  formatRef,
  getSingleResultRJ,
  getPanelResultRJ,
  getCompositeResultRJ,
};
