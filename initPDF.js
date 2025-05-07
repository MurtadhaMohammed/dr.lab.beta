const electron = require("electron");
const isDev = require("electron-is-dev");
var { jsPDF } = require("jspdf");
var fs = require("fs");
const Jimp = require("jimp").default || require("jimp");
const { app } = require("electron");
require("jspdf-autotable");
const path = require("path");
var refFont = require("./Frutiger-normal");
const { shell } = electron;

const logoPath = path.join(__dirname, "src", "assets", "logo2.png");
const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });

function base64_encode(file) {
  return "data:image/png;base64," + fs.readFileSync(file, "base64");
}

async function getImageDimensions(filePath) {
  try {
    const image = await Jimp.read(filePath);
    return { width: image.bitmap.width, height: image.bitmap.height };
  } catch (error) {
    console.error("Error reading image:", error);
    throw error;
  }
}

const imgWidth = 210;
const imgUrl = app.getPath("userData") + "/head.png";

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear().toString();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

// The printReport function remains unchanged (as above)

async function createPDF(data, isView = true, cb) {
  const imgDimensions = await getImageDimensions(imgUrl);
  const aspectRatio = imgDimensions.width / imgDimensions.height;
  const imgHeight = imgWidth / aspectRatio + 20;

  try {
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const img = base64_encode(imgUrl);

    refFont;
    doc.getFontList();
    doc.setFont("Frutiger");
    doc.addImage(img, "PNG", 0, 0, imgWidth, imgHeight - 20);

    doc.setFontSize(14);
    doc.setTextColor(42, 58, 78);
    doc.setFont("Frutiger", "bold");
    doc.text("PATIENT INFORMATION", 105, 45, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(70, 70, 70);
    doc.setFont("Frutiger", "normal");

    const infoStartY = 55;
    const leftMargin = 20;
    const lineHeight = 8;

    doc.text("Name:", leftMargin, infoStartY);
    doc.text(`${data.patient || ""}`, leftMargin + 12, infoStartY);
    doc.text("Age:", leftMargin, infoStartY + lineHeight);
    doc.text(`${data.age || ""}`, leftMargin + 10, infoStartY + lineHeight);
    doc.text("Date:", leftMargin, infoStartY + lineHeight * 2);
    doc.text(
      `${data.date || ""}`,
      leftMargin + 10,
      infoStartY + lineHeight * 2
    );

    let elemInfo = [];

    data.tests.forEach((el, i) => {
      let results = el?.rows?.map((r) => ({ ...r, normal: r?.normal?.trim() }));
      const tableStartY =
        i === 0 ? infoStartY + lineHeight * 6 : doc.lastAutoTable.finalY + 20;

      if (i === 0) {
        doc.setFontSize(14);
        doc.setTextColor(42, 58, 78);
        doc.setFont("Frutiger", "bold");
        doc.text("TEST RESULTS", 105, infoStartY + lineHeight * 4, {
          align: "center",
        });
      }

      doc.autoTable({
        startY: tableStartY,
        styles: {
          fontSize: 9,
          cellWidth: "wrap",
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          font: "Frutiger",
          cellPadding: 3,
        },
        theme: "grid",
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [40, 40, 40],
          fontStyle: "bold",
          halign: "center",
          valign: "middle",
        },
        body: results,
        columns: [
          { header: "TEST", dataKey: "name" },
          { header: "RESULT", dataKey: "result" },
          { header: "REFERENCE RANGE", dataKey: "normal" },
        ],
        columnStyles: {
          name: { cellWidth: 55, fontStyle: "bold", halign: "left" },
          result: { cellWidth: 55, halign: "left" },
          normal: { cellWidth: 55, halign: "left" },
        },
        didParseCell: function (data) {
          if (data.column.dataKey === "result" && data.section === "body") {
            const result = data.cell.raw;
            const normal = data.row.cells.normal?.raw;
            const resultNum = parseFloat(
              String(result).replace(/[^\d.-]/g, "")
            );
            const normalStr = String(normal);

            if (normalStr && resultNum) {
              let isAbnormal = false;
              if (normalStr.includes("-")) {
                const [min, max] = normalStr
                  .split("-")
                  .map((v) => parseFloat(v.replace(/[^\d.-]/g, "")));
                if (!isNaN(min) && !isNaN(max) && !isNaN(resultNum)) {
                  isAbnormal = resultNum < min || resultNum > max;
                }
              } else if (normalStr.includes("<")) {
                const max = parseFloat(normalStr.replace(/[^\d.-]/g, ""));
                isAbnormal = resultNum >= max;
              } else if (normalStr.includes(">")) {
                const min = parseFloat(normalStr.replace(/[^\d.-]/g, ""));
                isAbnormal = resultNum <= min;
              }

              if (isAbnormal) {
                data.cell.styles.fontStyle = "bold";
                data.cell.styles.textColor = [0, 0, 0];
              }
            }
          }
        },
        didDrawPage: (data) => {
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();

          // Watermark
          const originalWidth = 2796;
          const originalHeight = 795;
          const maxLogoWidth = 180; // Desired max width
          const scale = maxLogoWidth / originalWidth;

          const logoWidth = originalWidth * scale;
          const logoHeight = originalHeight * scale;

          const centerX = (pageWidth - logoWidth) / 2 + 45;
          const centerY = (pageHeight - logoHeight) / 2 + 30;

          const rotateAngle = 45; // degrees

          if (doc.setGState) doc.setGState(new doc.GState({ opacity: 0.05 }));
          doc.addImage(
            `data:image/png;base64,${logoBase64}`,
            "PNG",
            centerX,
            centerY,
            logoWidth,
            logoHeight,
            undefined,
            "FAST",
            rotateAngle
          );
          if (doc.setGState) doc.setGState(new doc.GState({ opacity: 1 }));

          // Footer
          doc.setFillColor(245, 247, 250);
          doc.rect(0, pageHeight - 20, pageWidth, 20, "F");
          doc.setDrawColor(220, 220, 220);
          doc.line(10, pageHeight - 20, pageWidth - 10, pageHeight - 20);
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(
            ` ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
          );
          const today = new Date();
          doc.text(
            `Generated on: ${today.toLocaleDateString()}`,
            15,
            pageHeight - 10
          );
        },
      });
    });

    const outputPath = path.join(app.getPath("userData"), "report.pdf");
    doc.save(outputPath);
    if (isView) shell.openPath(outputPath);
    cb(null, outputPath);
  } catch (err) {
    cb(err, null);
  }
}

module.exports = { createPDF };
