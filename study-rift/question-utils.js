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
export function gradeAnswer(q, value) {
  if (q.type === "short")
    return (
      typeof value === "string" &&
      q.answer.some((a) => normalizeAnswer(a) === normalizeAnswer(value))
    );
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
    ]
      .filter((k) => q[k] !== undefined)
      .map((k) => [k, q[k]]),
  );
  if (q.type === "match") result.choices = [...q.answer].sort();
  return result;
}
