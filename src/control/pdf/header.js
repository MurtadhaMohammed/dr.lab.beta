// header.js
const fs = require("fs");
const path = require("path");
const electron = require("electron");
const { PDF_CFG } = require("./config");

/**
 * Draws a full-width header image (auto height) from userData/head.png,
 * then writes patient/date/age on the next line.
 * Returns the Y position to continue drawing.
 */
function drawHeader(doc, { patient, dateText, ageText }) {
  const { margin } = PDF_CFG;

  // get userData path safely (renderer or main)
  const app =
    (electron && electron.app) ||
    (electron && electron.remote && electron.remote.app) ||
    null;

  const userData = app ? app.getPath("userData") : process.cwd();
  const imgPath = path.join(userData, "head.png");

  let headerHeight = 0;

  if (fs.existsSync(imgPath)) {
    try {
      const ext = path.extname(imgPath).toLowerCase();
      const format = ext === ".jpg" || ext === ".jpeg" ? "JPEG" : "PNG";
      const base64 = fs.readFileSync(imgPath).toString("base64");
      const dataUrl = `data:image/${format.toLowerCase()};base64,${base64}`;

      // scale to full page width, auto height
      const pageWidth = doc.internal.pageSize.getWidth();
      const props = doc.getImageProperties(dataUrl);
      if (props && props.width && props.height) {
        headerHeight = pageWidth * (props.height / props.width);
      } else {
        // fallback height if props missing
        headerHeight = 28;
      }

      doc.addImage(dataUrl, format, 0, 0, pageWidth, headerHeight);
    } catch (err) {
      // if image fails, just skip it and keep texts higher
      headerHeight = 0;
      console.error("Header image load error:", err);
    }
  }

  const topY = headerHeight > 0 ? headerHeight + 5 : margin.top + 5;

  doc.setFont(undefined, "normal");
  doc.text(`التاريخ : ${dateText || "-"}`, margin.left, topY, { lang: "ar" });
  doc.text(`العمر : ${ageText || "-"}`, 90, topY, { lang: "ar" });
  doc.text(
    `الاسم : ${patient || "-"}`,
    doc.internal.pageSize.getWidth() - margin.right,
    topY,
    { lang: "ar", align: "right" }
  );

  return topY + 6;
}

module.exports = { drawHeader };
