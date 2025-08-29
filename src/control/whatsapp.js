// whatsapp.js
const { shell } = require("electron");

// Normalize phone like "0790 123 4567" -> "9647901234567" (default Iraq +964; change if needed)
function normalizePhone(phone, defaultCountryCode = "964") {
  if (!phone) return "";
  let d = String(phone).replace(/\D+/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = defaultCountryCode + d.slice(1);
  return d;
}

/**
 * Send a WhatsApp message (or link) via WhatsApp Desktop if installed, else via web.
 * @param {Object} opts
 * @param {string} [opts.phone]    - recipient phone (any format). If omitted, opens a generic composer.
 * @param {string} [opts.text]     - message text
 * @param {string} [opts.link]     - a URL to append to the message
 * @param {string} [opts.cc]       - default country code (e.g. "964")
 * @returns {Promise<{success:boolean, usedUrl:string}>}
 */

async function sendWhatsApp({ phone, text = "", link = "", cc = "964" } = {}) {
  const msg = [text, link].filter(Boolean).join("\n\n").trim();
  const encMsg = encodeURIComponent(msg);
  let normalized = phone ? phone.replace(/\D+/g, "") : "";

  if (normalized.startsWith("0")) {
    normalized = cc + normalized.slice(1);
  }

  const deepUrl = normalized
    ? `whatsapp://send?phone=${normalized}&text=${encMsg}`
    : `whatsapp://send?text=${encMsg}`;

  await shell.openExternal(deepUrl);
}
// Example usages:
// await sendWhatsApp({ phone: "07901234567", text: "Your results are ready", link: "https://example.com/r/ABC123" });
// await sendWhatsApp({ text: "General broadcast link", link: "https://example.com" }); // no phone -> opens composer

module.exports = { sendWhatsApp, normalizePhone };
