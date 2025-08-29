require("jspdf-autotable");
const { PDF_CFG } = require("../config");
const { formatRef, getSingleResultRJ } = require("../utils");

function renderSingle(doc, yStart, item) {
  const unit = item.unit || "";
  const refStr = formatRef(item.ref_text, unit);
  const result = getSingleResultRJ(item.result_json);

  doc.autoTable({
    startY: yStart,
    theme: "grid",
    head: [["Test", "Result", "Normal Value"]],
    body: [
      [item.name_en || item.name_ar || item.code, `${result} ${unit}`, refStr],
    ],
    styles: {
      font: PDF_CFG.font.family,
      fontSize: PDF_CFG.font.size,
      cellPadding: 3,
      lineColor: PDF_CFG.table.headLine,
      overflow: "linebreak",
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

  return doc.lastAutoTable.finalY + 8;
}

module.exports = { renderSingle };
