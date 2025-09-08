const { PDF_CFG } = require("./config");

function drawWatermark(doc, { logoBase64 }) {
  if (!logoBase64) return;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxLogoWidth = PDF_CFG.brand.watermarkMaxWidth;
  const logoWidth = maxLogoWidth;
  const logoHeight = maxLogoWidth * 0.28;
  const x = (pageWidth - logoWidth) / 2;
  const y = (pageHeight - logoHeight) / 2;

  if (doc.setGState)
    doc.setGState(new doc.GState({ opacity: PDF_CFG.brand.watermarkOpacity }));
  doc.addImage(
    `data:image/png;base64,${logoBase64}`,
    "PNG",
    x,
    y,
    logoWidth,
    logoHeight,
    undefined,
    "FAST"
  );
  if (doc.setGState) doc.setGState(new doc.GState({ opacity: 1 }));
}

module.exports = { drawWatermark };
