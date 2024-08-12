const electron = require("electron");

const isDev = require("electron-is-dev");
var { jsPDF } = require("jspdf");
var fs = require("fs");
const Jimp = require("jimp");
const { app } = require("electron");
require("jspdf-autotable");

const path = require("path");
var refFont = require("./Frutiger-normal");
const { LocalFileData } = require("get-file-object-from-local-path");

const { shell } = electron;

function base64_encode(file) {
  return "data:image/gif;base64," + fs.readFileSync(file, "base64");
}

async function getImageDimensions(filePath) {
  const image = await Jimp.read(filePath);
  return { width: image.bitmap.width, height: image.bitmap.height };
}
// const imgHeight = 65; // 245.66929134 px
const imgWidth = 210; // 793.7007874 px
const imgUrl = app.getPath("userData") + "/head.png";

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

    doc.text(
      `Report detials at : ${String(data.date[0])} - ${String(data.date[1])}`,
      10,
      10,
      { lang: "ar" }
    );
    doc.setFontSize(12);

    doc.text(`Sub Total : ${data.subTotal || 0}`, 10, 23, { lang: "ar" });
    doc.text(`Discount : ${data.discount || 0}`, 80, 23, {
      lang: "ar",
    });
    doc.text(`Total Amount : ${data.total || 0}`, 200, 23, {
      lang: "ar",
      align: "right",
    });

    doc.autoTable({
      startY: 30,
      styles: {
        fontSize: 12,
        cellWidth: "wrap",
        overflow: "linebreak",
        font: "Frutiger",
      },
      theme: "grid",
      headStyles: {
        fillColor: "#eee",
        textColor: "#000",
        lineColor: "#ccc",
        lineWidth: 0.2,
      },
      bodyStyles: { fillColor: "#fff", textColor: "#000" },
      margin: {
        top: 10,
        left: 10,
        right: 10,
      },
      body: data?.records,
      columnStyles: {
        1: { cellWidth: 60 },
        // etc
      },
      columns: [
        { header: "Patient", dataKey: "name" },
        { header: "Tests", dataKey: "tests" },
        { header: "Price", dataKey: "price" },
        { header: "End Price", dataKey: "endPrice" },
        { header: "Discount", dataKey: "discount" },
        { header: "Created At", dataKey: "createdAt" },
      ],
      pageBreak: "auto",
    });

    const pages = doc.internal.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.height; //Optional
    doc.setFontSize(10); //Optional

    for (let j = 1; j < pages + 1; j++) {
      let horizontalPos = 10; //Can be fixed number
      let verticalPos = pageHeight - 10; //Can be fixed number
      doc.setPage(j);
      doc.text(`${j} of ${pages}`, horizontalPos, verticalPos, {
        align: "left",
      });
    }

    // doc.save("a4.pdf");
    // shell.openPath(path.join(__dirname, isDev ? "a4.pdf" : "../../a4.pdf"));
    doc.save(app.getPath("userData") + "a4.pdf");
    shell.openPath(app.getPath("userData") + "a4.pdf");

    pdf = new jsPDF({
      orientation: "landscape",
    });
    cb(null, true);
  } catch (error) {
    cb(error, true);
  }
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

    doc.addImage(img, "PNG", 0, 0, imgWidth, 0);
    // doc.addImage(img, "PNG", 0, 0, doc.internal.pageSize.getWidth(), 0);
    doc.text(`التاريخ : ${data.date}`, 10, imgHeight - 8, { lang: "ar" });
    doc.text(`العمر : ${data.age} سنة`, 90, imgHeight - 8, { lang: "ar" });
    doc.text(`الاسم : ${data.patient}`, 200, imgHeight - 8, {
      lang: "ar",
      align: "right",
    });

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

        data?.tests?.length > 1 && doc.text(el.title, 10, textY);
      };

      doc.autoTable({
        startY: i === 0 ? imgHeight + 7 : doc.lastAutoTable.finalY + 16,
        styles: {
          fontSize: data?.fontSize,
          cellWidth: "wrap",
          overflow: "hidden",
          font: "Frutiger",
        },
        theme: "grid",
        headStyles: {
          fillColor: "#eee",
          textColor: "#000",
          lineColor: "#ccc",
          // fontWeight: "bold",
          lineWidth: 0.2,
        },
        bodyStyles: { fillColor: "#fff", textColor: "#000" },
        margin: {
          top: data?.tests?.length > 1 ? 20 : 10,
          left: 10,
          right: 10,
        },
        body: results,
        columns: [
          { header: "Test", dataKey: "name" },
          { header: "Result", dataKey: "result" },
          { header: "Normal Value", dataKey: "normal" },
        ],

        pageBreak: data?.tests?.length === 1 ? "auto" : "avoid",
        didDrawPage: header,
      });
    });

    const pages = doc.internal.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.height; //Optional
    doc.setFontSize(10); //Optional

    for (let j = 1; j < pages + 1; j++) {
      let horizontalPos = 10; //Can be fixed number
      let verticalPos = pageHeight - 10; //Can be fixed number
      doc.setPage(j);
      doc.text(`${j} of ${pages}`, horizontalPos, verticalPos, {
        align: "left",
      });
    }

    doc.save(app.getPath("userData") + "a4.pdf");
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

module.exports = { createPDF, printReport };
