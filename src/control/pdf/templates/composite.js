require("jspdf-autotable");
const { PDF_CFG } = require("../config");
const { getCompositeResultRJ } = require("../utils");

function renderComposite(doc, yStart, item) {
  const meta = safeParse(item.meta_json);
  const sections = Array.isArray(meta?.sections) ? meta.sections : [];
  let y = yStart;

  // 👉 أضف عنوان رئيسي للتحليل نفسه
  const title = item.name_en || item.name_ar || item.code;
  if (title) {
    doc.setFont(PDF_CFG.font.family, "bold");
    doc.setFontSize(PDF_CFG.font.size + 1);
    doc.text(title, PDF_CFG.margin.left, y);
    y += 4; // مسافة بعد العنوان
  }

  sections.forEach((sec, sIdx) => {
    const fields = Array.isArray(sec.fields) ? sec.fields : [];
    const body = fields.map((f) => {
      const val = getCompositeResultRJ(item.result_json, sec.code, f.code);
      const label = [f.label_en].filter(Boolean).join(" / ");
      return [label || f.code, String(val ?? "")];
    });

    doc.autoTable({
      startY: sIdx === 0 ? y : (doc.lastAutoTable?.finalY || y) + 8,
      theme: "grid",
      head: [
        [
          `${sec.name_en || sec.code}${
            sec.name_ar ? " / " + sec.name_ar : ""
          }`,
          "Value",
        ],
      ],
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
      margin: { left: PDF_CFG.margin.left, right: PDF_CFG.margin.right },
      tableWidth: "auto",
    });
  });

  return (doc.lastAutoTable?.finalY || yStart) + 10;
}

function safeParse(v) {
  try {
    return typeof v === "string" ? JSON.parse(v) : v;
  } catch {
    return null;
  }
}

module.exports = { renderComposite };
