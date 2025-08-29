const {jsPDF} = require("jspdf");
require("jspdf-autotable");
const dayjs = require("dayjs");

const { PDF_CFG } = require("./config");
const { addFontIfNeeded } = require("./utils");
const { drawHeader } = require("./header");
const { drawFooterWithPagination } = require("./footer");
const { drawWatermark } = require("./watermark");

const { renderSingle } = require("./templates/single");
const { renderPanel } = require("./templates/panel");
const { renderComposite } = require("./templates/composite");
const electron = require("electron");

async function createPDFForVisit({
  visit,
  isView = true,
  headerDataUrl,
  watermarkBase64,
}) {
  const { app, shell, LocalFileData } = electron || {};
  try {
    const doc = new jsPDF(PDF_CFG.page);
    addFontIfNeeded(doc);

    let headerImgWidth = headerDataUrl ? doc.internal.pageSize.getWidth() : 0;

    const startY = drawHeader(doc, {
      logoDataUrl: headerDataUrl,
      headerImgWidth,
      patient: visit?.patient?.name,
      dateText: dayjs(visit?.created_at || new Date()).format("YYYY/MM/DD"),
      ageText: visit?.patient?.birth ? calcAgeText(visit.patient.birth) : "-",
    });

    if (watermarkBase64) drawWatermark(doc, { logoBase64: watermarkBase64 });

    let y = startY + 6;
    const tests = Array.isArray(visit?.tests) ? visit.tests : [];
    for (let i = 0; i < tests.length; i++) {
      const t = tests[i];
      if (i > 0) y = (doc.lastAutoTable?.finalY || y) + 10;
      if (t.type === "single") y = renderSingle(doc, y, t);
      else if (t.type === "panel") y = renderPanel(doc, y, t);
      else if (t.type === "composite") y = renderComposite(doc, y, t);
      else {
        doc.autoTable(doc, {
          startY: y,
          head: [["Test", "Value"]],
          body: [[t.name_en || t.code, ""]],
        });
        y = doc.lastAutoTable.finalY + 8;
      }

      // 🔹 Divider line after each test (except last one)
      if (i < tests.length - 1) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const lineY = (doc.lastAutoTable?.finalY || y) + 4;
        // doc.setDrawColor(180); // light gray
        // doc.setLineWidth(0.2);
        // doc.line(PDF_CFG.margin.left, lineY, pageWidth - PDF_CFG.margin.right, lineY);
        y = lineY + 10;
      }
    }

    drawFooterWithPagination(doc);

    const filePath = (app ? app.getPath("userData") : ".") + "/visit.pdf";
    await doc.save(filePath);
    if (isView && shell) shell.openPath(filePath);
    const file = LocalFileData ? new LocalFileData(filePath) : null;

    return { success: true, filePath, file };
  } catch (err) {
    return { success: false, error: err };
  }
}

function calcAgeText(isoBirth) {
  const b = dayjs(isoBirth);
  if (!b.isValid()) return "-";
  const years = dayjs().diff(b, "year");
  return `${years} سنة`;
}

module.exports = { createPDFForVisit };
