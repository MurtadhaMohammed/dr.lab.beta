/**
 * Format lab test reference ranges into a plain string
 * @param {string} ref_text - The stored ref_text (string or JSON)
 * @param {string} fallbackUnit - optional unit if not included in JSON
 * @returns {string}
 */
export function formatRefText(ref_text, fallbackUnit = "") {
  if (!ref_text) return "-";

  // 1) حاول JSON parse
  try {
    const parsed = JSON.parse(ref_text);

    if (parsed && !Array.isArray(parsed) && typeof parsed === "object") {
      return renderRangeRowString(parsed, fallbackUnit);
    }

    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return "-";
      return parsed.map((r) => renderRangeRowString(r, fallbackUnit)).join(" | ");
    }
  } catch {
    // مو JSON → نكمل
  }

  const text = String(ref_text).trim();

  // 2) سترنك M / F
  const mfMatch = text.match(/^\s*([^/]+?)\s*M\s*\/\s*([^/]+?)\s*F\s*$/i);
  if (mfMatch) {
    const male = mfMatch[1].trim();
    const female = mfMatch[2].trim();
    return `M: ${male}${fallbackUnit ? " " + fallbackUnit : ""} / F: ${female}${fallbackUnit ? " " + fallbackUnit : ""}`;
  }

  // 3) سترنك شكل "low-high"
  const rangeMatch = text.match(/^\s*([<>]=?)?\s*([\d.]+)\s*(?:-|to|–|—)\s*([<>]=?)?\s*([\d.]+)\s*$/i);
  if (rangeMatch) {
    const [, op1, low, , high] = rangeMatch;
    const unit = fallbackUnit ? ` ${fallbackUnit}` : "";
    return `${op1 || ""}${low} - ${high}${unit}`;
  }

  // 4) سترنك "<6" أو ">40"
  const oneSide = text.match(/^\s*([<>]=?)\s*([\d.]+)\s*$/);
  if (oneSide) {
    const [, op, val] = oneSide;
    return `${op}${val}${fallbackUnit ? ` ${fallbackUnit}` : ""}`;
  }

  // 5) نص ثابت مثل Negative / Positive
  return text;
}

/* Helper: render row for JSON ranges → string */
function renderRangeRowString(r = {}, fallbackUnit = "") {
  const {
    sex, age_min, age_max, low, high, unit, note, op, value
  } = r;

  const tags = [];
  if (sex) tags.push(`Sex:${String(sex).toUpperCase()}`);
  if (isFiniteNumber(age_min) || isFiniteNumber(age_max)) {
    const ageText =
      (isFiniteNumber(age_min) ? `${age_min}` : "—") +
      "–" +
      (isFiniteNumber(age_max) ? `${age_max}` : "—") +
      "y";
    tags.push(`Age:${ageText}`);
  }

  const u = unit || fallbackUnit || "";

  let valueText = null;

  if (isFiniteNumber(low) && isFiniteNumber(high)) {
    valueText = `${low} - ${high}${u ? ` ${u}` : ""}`;
  } else if ((op && value !== undefined)) {
    valueText = `${op}${value}${u ? ` ${u}` : ""}`;
  } else if (value !== undefined) {
    valueText = `${value}${u ? ` ${u}` : ""}`;
  } else if (low !== undefined || high !== undefined) {
    const left = isFiniteNumber(low) ? `${low}` : "";
    const right = isFiniteNumber(high) ? `${high}` : "";
    const dash = left && right ? " - " : "";
    valueText = `${left}${dash}${right}${u ? ` ${u}` : ""}`.trim();
  }

  const prefix = tags.length > 0 ? `[${tags.join(", ")}] ` : "";
  const notePart = note ? ` (Note: ${note})` : "";

  return `${prefix}${valueText || "-"}` + notePart;
}

function isFiniteNumber(n) {
  return typeof n === "number" && Number.isFinite(n);
}
