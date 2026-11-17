export const QUESTION_TYPES = {
  mc: "ÇOKTAN SEÇMELİ",
  tf: "DOĞRU / YANLIŞ",
  match: "EŞLEŞTİRME",
  multi: "ÇOKLU SEÇİM",
  order: "SIRALAMA",
  short: "KISA YANIT",
};
export const normalizeAnswer = (value) =>
  String(value ?? "")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/\s+/g, " ")
    .trim();
// Accept one finite number, an optional simple fraction and an explicitly allowed unit.
// Comma is a decimal separator, never an implicit thousands separator.
export function parseNumericAnswer(value, units = []) {
  if (typeof value !== "string" || value.length > 200) return null;
  const text = normalizeAnswer(value).replace(/−/g, "-");
  const match = text.match(
    /^([+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?)(?:\s*\/\s*([+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?))?\s*(.*?)$/i,
  );
  if (!match) return null;
  const suffix = match[3];
  if (suffix && !units.some((u) => normalizeAnswer(u) === suffix)) return null;
  const numerator = Number(match[1].replace(",", "."));
  const denominator = match[2] ? Number(match[2].replace(",", ".")) : 1;
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : null;
}
export function gradeAnswer(q, value) {
  if (q.type === "short") {
    if (typeof value !== "string") return false;
    if (q.numeric) {
      const number = parseNumericAnswer(value, q.numeric.units || []);
      return (
        number !== null &&
        Math.abs(number - q.numeric.value) <= (q.numeric.tolerance || 0) + 1e-10
      );
    }
    return q.answer.some((a) => normalizeAnswer(a) === normalizeAnswer(value));
  }
  if (q.type === "multi") {
    if (
      !Array.isArray(value) ||
      value.some((v) => !Number.isInteger(v)) ||
      new Set(value).size !== value.length
    )
      return false;
    return (
      value.length === q.answer.length &&
      q.answer.every((i) => value.includes(i))
    );
  }
  if (q.type === "order" || q.type === "match")
    return (
      Array.isArray(value) &&
      value.length === q.answer.length &&
      q.answer.every((a, i) => value[i] === a)
    );
  return (
    typeof value === "number" && Number.isInteger(value) && value === q.answer
  );
}
export function answerLabel(q) {
  if (q.type === "short") return q.answer[0];
  if (q.type === "multi") return q.answer.map((i) => q.options[i]).join(" · ");
  if (q.type === "order") return q.answer.join(" → ");
  if (q.type === "match")
    return q.options.map((v, i) => v + " → " + q.answer[i]).join(" · ");
  return q.options[q.answer];
}
export function validPayload(q, value) {
  if (q.type === "short")
    return typeof value === "string" && value.length <= 200;
  if (["multi", "order", "match"].includes(q.type))
    return (
      Array.isArray(value) &&
      value.length <= 20 &&
      value.every((v) =>
        typeof v === "string" ? v.length <= 500 : Number.isInteger(v),
      )
    );
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value < q.options.length
  );
}
export const rankPoints = (difficulty) => 5 + 5 * difficulty;

// Expose candidates without the answer mapping or learning-only hints.
export function publicQuestion(q) {
  const result = Object.fromEntries(
    [
      "id",
      "course",
      "topic",
      "difficulty",
      "type",
      "prompt",
      "options",
      "code",
      "source",
      "answerFormat",
    ]
      .filter((k) => q[k] !== undefined)
      .map((k) => [k, q[k]]),
  );
  if (q.type === "match") result.choices = [...q.answer].sort();
  return result;
}
