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

async function createPDF(data, isView = true, cb) {
  const imgDimensions = await getImageDimensions(imgUrl);
  const aspectRatio = imgDimensions.width / imgDimensions.height;
  const imgHeight = imgWidth / aspectRatio + 20;
  try {
    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    var img = base64_encode(imgUrl);
    refFont;
    doc.getFontList();
    doc.setFont("Frutiger");

    doc.addImage(img, "PNG", 0, 0, imgWidth, imgHeight - 20);

    doc.setFontSize(12);

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

    doc.setTextColor(42, 58, 78);
    doc.setFont("Frutiger", "normal");
    doc.text("Name:", leftMargin, infoStartY);
    doc.setFont("Frutiger", "normal");
    doc.text(`${data.patient || ""}`, leftMargin + 12, infoStartY);

    doc.setFont("Frutiger", "normal");
    doc.text("Age:", leftMargin, infoStartY + lineHeight);
    doc.setFont("Frutiger", "normal");
    doc.text(`${data.age || ""}`, leftMargin + 10, infoStartY + lineHeight);

    doc.setFont("Frutiger", "normal");
    doc.text("Date:", leftMargin, infoStartY + lineHeight * 2);
    doc.setFont("Frutiger", "normal");
    doc.text(
      `${data.date || ""}`,
      leftMargin + 10,
      infoStartY + lineHeight * 2
    );

    let elemInfo = [];

    data.tests.map((el, i) => {
      let results = el?.rows?.map((el) => {
        return {
          ...el,
          normal: el?.normal?.trim(),
        };
      });
      var header = function (tableDoc) {
        let currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        let lastTableY = tableDoc?.doc?.lastAutoTable?.finalY;
        let textY = 0;

        elemInfo.push({
          title: el?.title,
          y: lastTableY || 0,
          page: currentPage,
        });

        if (
          i > 0 &&
          elemInfo[i].y > elemInfo[i - 1].y &&
          elemInfo[i].page > elemInfo[i - 1].page
        ) {
          textY = 17;
        } else if (i === 0) {
          textY = imgHeight + 4;
        } else {
          textY = lastTableY + 13;
        }

        if (data?.tests?.length > 1) {
          doc.setFillColor(220, 220, 220);
          doc.roundedRect(
            5,
            textY - 10,
            doc.internal.pageSize.getWidth() - 10,
            14,
            1,
            1,
            "F"
          );
          doc.setFont("Frutiger", "bold");
          doc.setFontSize(12);
          doc.setTextColor(40, 40, 40);
          doc.text(el.title, 105, textY - 2, { align: "center" });
          doc.setFont("Frutiger", "normal");
        }
      };

      if (i === 0) {
        doc.setFontSize(14);
        doc.setTextColor(42, 58, 78);
        doc.setFont("Frutiger", "bold");
        doc.text("TEST RESULTS", 105, infoStartY + lineHeight * 4, {
          align: "center",
        });
      }

      doc.autoTable({
        startY:
          i === 0 ? infoStartY + lineHeight * 6 : doc.lastAutoTable.finalY + 20,
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
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          minCellHeight: 8,
          cellPadding: 2,
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: [60, 60, 60],
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        margin: {
          top: 15,
          left: 20,
          right: 20,
          bottom: 15,
        },
        body: results,
        columns: [
          { header: "TEST", dataKey: "name" },
          { header: "RESULT", dataKey: "result" },
          { header: "REFERENCE RANGE", dataKey: "normal" },
        ],
        columnStyles: {
          name: {
            cellWidth: 55,
            fontStyle: "bold",
            halign: "left",
          },
          result: {
            cellWidth: 55,
            halign: "left",
          },
          normal: {
            cellWidth: 55,
            halign: "left",
          },
        },
        didParseCell: function (data) {
          if (data.column.dataKey === "result" && data.section === "body") {
            const result = data.cell.raw;
            const normal = data.row.cells.normal?.raw;

            if (normal && result) {
              const normalStr = String(normal);
              const resultNum = parseFloat(
                String(result).replace(/[^\d.-]/g, "")
              );

              if (/\d/.test(normalStr)) {
                let isAbnormal = false;

                if (normalStr.includes("-")) {
                  const [min, max] = normalStr
                    .split("-")
                    .map((v) => parseFloat(v.replace(/[^\d.-]/g, "")));
                  if (!isNaN(min) && !isNaN(max) && !isNaN(resultNum)) {
                    if (resultNum < min || resultNum > max) {
                      isAbnormal = true;
                    }
                  }
                } else if (normalStr.includes("<")) {
                  const max = parseFloat(normalStr.replace(/[^\d.-]/g, ""));
                  if (!isNaN(max) && !isNaN(resultNum) && resultNum >= max) {
                    isAbnormal = true;
                  }
                } else if (normalStr.includes(">")) {
                  const min = parseFloat(normalStr.replace(/[^\d.-]/g, ""));
                  if (!isNaN(min) && !isNaN(resultNum) && resultNum <= min) {
                    isAbnormal = true;
                  }
                }

                if (isAbnormal) {
                  data.cell.styles.fontStyle = "bold";
                  data.cell.styles.textColor = [0, 0, 0];
                }
              }
            }
          }
        },
        pageBreak: data?.tests?.length === 1 ? "auto" : "avoid",
        didDrawPage: header,
      });
    });

    const pages = doc.internal.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.getWidth();

    for (let j = 1; j < pages + 1; j++) {
      doc.setPage(j);

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const pageText = `${j} of ${pages}`;
      const textWidth =
        (doc.getStringUnitWidth(pageText) * doc.getFontSize()) /
        doc.internal.scaleFactor;
      doc.text(pageText, (pageWidth - textWidth) / 2, pageHeight - 10);
    }

    await doc.save(app.getPath("userData") + "a4.pdf");
    isView && shell.openPath(app.getPath("userData") + "a4.pdf");

    let file = new LocalFileData(app.getPath("userData") + "a4.pdf");

    pdf = new jsPDF({
      orientation: "landscape",
    });

    cb(null, true, file);
  } catch (error) {
    cb(error, null, null);
  }
}

async function createFreePDF(data, isView = true, cb) {
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

function printReport(data, cb) {
  try {
    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });
    refFont;
    doc.getFontList();
    doc.setFont("Frutiger");

    doc.setFillColor(42, 58, 78);
    doc.rect(0, 0, 210, 35, "F");

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont("Frutiger");
    doc.text("Financial Report", 105, 15, { align: "center" });

    const fromDate =
      data.date && data.date[0] ? formatDate(data.date[0]) : "N/A";
    const toDate = data.date && data.date[1] ? formatDate(data.date[1]) : "N/A";
    doc.setFontSize(12);
    doc.text(`Period: ${fromDate} - ${toDate}`, 105, 25, { align: "center" });

    doc.setFontSize(12);

    doc.setFillColor(245, 247, 250);
    doc.roundedRect(5, 45, 200, 30, 3, 3, "F");
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(5, 45, 200, 30, 3, 3, "S");

    doc.setFontSize(12);
    doc.setTextColor(42, 58, 78);
    doc.setFont("Frutiger");
    doc.text("FINANCIAL SUMMARY", 10, 55);

    doc.setFontSize(11);
    doc.setTextColor(70, 70, 70);
    doc.setFont("Frutiger");

    doc.text(`Sub Total:`, 15, 65);
    doc.text(`Discount:`, 70, 65);
    doc.text(`Total Amount:`, 125, 65);

    doc.text(`${data.subTotal || 0}`, 34, 65, { align: "left" });
    doc.text(`${data.discount || 0}`, 88, 65, { align: "left" });
    doc.text(`${data.total || 0}`, 152, 65, { align: "left" });

    const transformedRecords = data.records.map((record) => {
      const testsString = record.tests
        .split(",")
        .map((test) => test.trim())
        .join("\n");

      return {
        name: record.name,
        tests: testsString,
        price: record.price,
        endPrice: record.endPrice,
        discount: record.discount,
        createdAt: record.createdAt,
      };
    });

    doc.autoTable({
      startY: 85,
      styles: {
        fontSize: 9,
        cellWidth: "wrap",
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
        font: "Frutiger",
        cellPadding: 3,
      },
      theme: "grid",
      headStyles: {
        fillColor: [42, 58, 78],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        lineColor: [42, 58, 78],
        lineWidth: 0.1,
        minCellHeight: 8,
        cellPadding: 2,
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [70, 70, 70],
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [42, 58, 78],
        fontStyle: "bold",
      },
      margin: {
        top: 15,
        left: 5,
        right: 5,
        bottom: 15,
      },
      body: transformedRecords,
      columnStyles: {
        name: {
          cellWidth: 50,
          halign: "center",
        },
        tests: {
          cellWidth: 50,
          halign: "left",
        },
        price: {
          cellWidth: 20,
          halign: "left",
        },
        endPrice: {
          cellWidth: 20,
          halign: "left",
          fontStyle: "bold",
        },
        discount: {
          cellWidth: 30,
          halign: "left",
        },
        createdAt: {
          cellWidth: 30,
          halign: "left",
        },
      },
      columns: [
        { header: "Patient", dataKey: "name" },
        { header: "Tests", dataKey: "tests" },
        { header: "Price", dataKey: "price" },
        { header: "End price", dataKey: "endPrice" },
        { header: "Discount", dataKey: "discount" },
        { header: "Created at", dataKey: "createdAt" },
      ],
      didParseCell: function (data) {
        if (
          ["price", "endPrice", "discount"].includes(data.column.dataKey) &&
          data.section === "body"
        ) {
          if (data.cell.raw !== undefined && data.cell.raw !== null) {
            data.cell.text = [`${data.cell.raw}`];
          }
        }
      },
      pageBreak: "auto",
    });

    const pages = doc.internal.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.getWidth();

    for (let j = 1; j < pages + 1; j++) {
      doc.setPage(j);

      doc.setFillColor(245, 247, 250);
      doc.rect(0, pageHeight - 20, pageWidth, 20, "F");
      doc.setDrawColor(220, 220, 220);
      doc.line(10, pageHeight - 20, pageWidth - 10, pageHeight - 20);

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(` ${j} of ${pages}`, pageWidth / 2, pageHeight - 10, {
        align: "center",
      });

      const today = new Date();
      doc.text(
        `Generated on: ${today.toLocaleDateString()}`,
        15,
        pageHeight - 10
      );
    }

    doc.save(app.getPath("userData") + "a4.pdf");
    shell.openPath(app.getPath("userData") + "a4.pdf");

    pdf = new jsPDF({
      orientation: "landscape",
    });

    const pdfBlob = doc.output("blob");

    cb(null, JSON.parse(pdfBlob));
  } catch (error) {
    cb(error, true);
  }
}

module.exports = { createFreePDF, createPDF, printReport };
