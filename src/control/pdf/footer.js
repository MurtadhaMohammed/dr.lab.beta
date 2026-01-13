const { PDF_CFG } = require("./config");

function drawFooterWithPagination(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFontSize(10);
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.text(`${p} of ${pageCount}`, PDF_CFG.margin.left, pageHeight - 8, { align: "left" });
  }
}

module.exports = { drawFooterWithPagination };
