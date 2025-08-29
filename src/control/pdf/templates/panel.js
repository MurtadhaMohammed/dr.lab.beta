require("jspdf-autotable");
const { PDF_CFG } = require("../config");
const { formatRef, getPanelResultRJ } = require("../utils");

function renderPanel(doc, yStart, item) {
  const meta = safeParse(item.meta_json);
  const rows = Array.isArray(meta?.items) ? meta.items : [];

  const body = rows.map((r) => {
    const refStr = formatRef(r.ref, r.unit);
    const result = getPanelResultRJ(item.result_json, r.code);
    return [
      r.name_en || r.code || "",
      String(result || ""),
      [refStr, r.unit ? ` ${r.unit}` : ""].join(""),
    ];
  });

  doc.autoTable({
    startY: yStart,
    theme: "grid",
    head: [[item.name_en || item.code, "Result", "Ref / Unit"]],
    body,
    styles: {
      font: PDF_CFG.font.family,
      fontSize: PDF_CFG.font.size,
      cellPadding: 3,
      lineColor: PDF_CFG.table.headLine,
    },
    headStyles: {
      fillColor: PDF_CFG.table.headFill,
      textColor: PDF_CFG.table.headText,
    },
    bodyStyles: {
      fillColor: PDF_CFG.table.bodyFill,
      textColor: PDF_CFG.table.bodyText,
    },
    margin: { left: PDF_CFG.margin.left, right: PDF_CFG.margin.right },
    tableWidth: "auto",
  });

  return doc.lastAutoTable.finalY + 10;
}

function safeParse(v) {
  try {
    return typeof v === "string" ? JSON.parse(v) : v;
  } catch {
    return null;
  }
}

module.exports = { renderPanel };
