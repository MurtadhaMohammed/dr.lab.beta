/**
 * Format lab test reference text into simple multi-line string
 * - If plain string: return it
 * - If JSON array: each object on its own line
 * - If JSON object: each key/value on its own line
 * @param {string} ref_text
 * @returns {string}
 */
export function formatRefText(ref_text) {
  if (!ref_text) return "-";

  try {
    const parsed = JSON.parse(ref_text);

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item === "object" && item !== null) {
            return Object.entries(item)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ");
          }
          return String(item);
        })
        .join("\n"); // كل object بسطر جديد
    }

    if (typeof parsed === "object" && parsed !== null) {
      return Object.entries(parsed)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n"); // كل key/value بسطر جديد
    }
  } catch {
    // مو JSON → نرجع النص مثل ما هو
  }

  return String(ref_text).trim();
}
