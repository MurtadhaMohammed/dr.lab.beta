// Basic design tokens (tweak to your brand)
const PDF_CFG = {
  page: { unit: "mm", format: "a4", orientation: "p", compress: true },
  margin: { left: 12, right: 12, top: 12, bottom: 16 },
  table: {
    headFill: [238, 238, 238], // #EEE
    headText: [0, 0, 0],
    headLine: [204, 204, 204],
    bodyFill: [255, 255, 255],
    bodyText: [0, 0, 0],
  },
  font: {
    family: "Frutiger",
    size: 10, // Default size, will be overridden
  },
  brand: {
    watermarkOpacity: 0.06,
    watermarkMaxWidth: 180, // mm
  },
};

// Function to get dynamic font size configuration
function getPDFConfig(fontSize = 10) {
  return {
    ...PDF_CFG,
    font: {
      ...PDF_CFG.font,
      size: fontSize,
    },
  };
}

module.exports = { PDF_CFG, getPDFConfig };
