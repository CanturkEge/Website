import { createClient } from "npm:@supabase/supabase-js@2.119.0";
import {
  gradeAnswer,
  validPayload,
  rankPoints,
  publicQuestion,
} from "./question-utils.js";
import bank from "./bank.json" with { type: "json" };
const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const allowed = new Set([
  "https://egecanturk.dev",
  "https://www.egecanturk.dev",
  "https://canturkege.github.io",
  "http://127.0.0.1:4173",
]);
const day = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
const mix = (array: any[]) => {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const summary = (a: any) => ({
  id: a.id,
  course: a.course,
  date: a.exam_date,
  cursor: a.cursor,
  score: a.score,
  correct: a.correct,
  total: 10,
  maxScore: 200,
  completed: a.completed,
});
Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "";
  const headers = {
    "Access-Control-Allow-Origin": allowed.has(origin)
      ? origin
      : "https://egecanturk.dev",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
  const response = (body: any, status = 200) =>
    new Response(JSON.stringify(body), { status, headers });
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST" || (origin && !allowed.has(origin)))
    return response({ error: "İstek kabul edilmedi." }, 403);
  try {
    const bearer =
      req.headers.get("authorization")?.replace(/^Bearer /i, "") || "";
    const {
      data: { user },
      error: userError,
    } = await admin.auth.getUser(bearer);
    if (userError || !user)
      return response({ error: "Ustalık tablosu için giriş yap." }, 401);
    const { data: profile, error: profileError } = await admin
      .from("study_rift_profiles")
      .select("username")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profileError || !profile)
      return response({ error: "Önce kullanıcı adını tamamla." }, 403);
    const { data: allowedRequest, error: limitError } = await admin.rpc(
      "study_rift_consume_limit",
      { p_bucket: "mastery:" + user.id, p_limit: 150, p_seconds: 900 },
    );
    if (limitError || !allowedRequest)
      return response(
        { error: "Çok fazla istek. Biraz sonra tekrar dene." },
        429,
      );
    const raw = await req.text();
    if (raw.length > 10000) return response({ error: "İstek çok büyük." }, 413);
    const body = JSON.parse(raw),
      course = String(body.course || "oop"),
      today = day();
    if (!bank.some((q: any) => q.course === course))
      return response(
        { error: "Bu dersin Ustalık kapısı henüz açık değil." },
        400,
      );
    if (body.action === "board") {
      const { data: rows, error } = await admin
        .from("study_rift_attempts")
        .select("user_id,score,correct")
        .eq("course", course)
        .eq("exam_date", today)
        .eq("completed", true)
        .order("score", { ascending: false })
        .order("correct", { ascending: false })
        .order("user_id")
        .limit(100);
      if (error) throw error;
      const ids = (rows || []).map((r) => r.user_id);
      const names = new Map();
      if (ids.length) {
        const { data: p, error: pError } = await admin
          .from("study_rift_profiles")
          .select("user_id,username")
          .in("user_id", ids);
        if (pError) throw pError;
        for (const row of p || []) names.set(row.user_id, row.username);
      }
      let rank = 0,
        key = "";
      const entries = (rows || []).map((r) => {
        const next = r.score + ":" + r.correct;
        if (next !== key) {
          rank++;
          key = next;
        }
        return {
          rank,
          username: names.get(r.user_id) || "Avcı",
          score: r.score,
          correct: r.correct,
          total: 10,
          isMe: r.user_id === user.id,
        };
      });
      const { data: own, error: ownError } = await admin
        .from("study_rift_attempts")
        .select("*")
        .eq("user_id", user.id)
        .eq("course", course)
        .eq("exam_date", today)
        .maybeSingle();
      if (ownError) throw ownError;
      return response({
        date: today,
        course,
        entries,
        own: own ? summary(own) : null,
        rules:
          "Aynı günlük set · 10 soru · 200 puan · ekipman/sınıf/XP/zaman bonusu yok · eşit puan ve doğruda aynı sıra",
      });
    }
    let attempt: any;
    if (body.action === "start" || body.action === "resume") {
      let { data: exam, error: examError } = await admin
        .from("study_rift_exams")
        .select("*")
        .eq("course", course)
        .eq("exam_date", today)
        .maybeSingle();
      if (examError) throw examError;
      if (!exam) {
        const selected = [];
        for (let d = 1; d <= 5; d++) {
          const pool = bank.filter(
            (q: any) => q.course === course && q.difficulty === d,
          );
          if (pool.length < 2)
            return response(
              { error: "Dersin sınav havuzu henüz yeterli değil." },
              400,
            );
          selected.push(...mix(pool).slice(0, 2));
        }
        const { error: createError } = await admin
          .from("study_rift_exams")
          .insert({ course, exam_date: today, questions: mix(selected) });
        if (createError && createError.code !== "23505") throw createError;
        const result = await admin
          .from("study_rift_exams")
          .select("*")
          .eq("course", course)
          .eq("exam_date", today)
          .single();
        if (result.error) throw result.error;
        exam = result.data;
      }
      const { error: createAttemptError } = await admin
        .from("study_rift_attempts")
        .insert({ user_id: user.id, course, exam_date: today });
      if (createAttemptError && createAttemptError.code !== "23505")
        throw createAttemptError;
      const result = await admin
        .from("study_rift_attempts")
        .select("*")
        .eq("user_id", user.id)
        .eq("course", course)
        .eq("exam_date", today)
        .single();
      if (result.error) throw result.error;
      attempt = result.data;
      return response({
        attempt: summary(attempt),
        question: attempt.completed
          ? null
          : publicQuestion(exam.questions[attempt.cursor]),
        review: attempt.completed
          ? exam.questions.map((q: any, i: number) => ({
              ...publicQuestion(q),
              answer: q.answer,
              explanation: q.explanation,
              result: attempt.answers[i],
            }))
          : null,
      });
    }
    if (body.action !== "answer")
      return response({ error: "Geçersiz işlem." }, 400);
    const { data: a, error: aError } = await admin
      .from("study_rift_attempts")
      .select("*")
      .eq("id", body.attemptId)
      .eq("user_id", user.id)
      .eq("course", course)
      .single();
    if (aError || !a)
      return response({ error: "Bu sınav kaydı sana ait değil." }, 403);
    attempt = a;
    if (
      attempt.completed ||
      attempt.exam_date !== today ||
      body.cursor !== attempt.cursor
    )
      return response(
        {
          error: "Sınav durumu değişti. Kaydı yeniden yükle.",
          code: "cursor_changed",
        },
        409,
      );
    const { data: exam, error: examError } = await admin
      .from("study_rift_exams")
      .select("questions")
      .eq("course", course)
      .eq("exam_date", attempt.exam_date)
      .single();
    if (examError) throw examError;
    const q = exam.questions[attempt.cursor];
    if (body.questionId !== q.id || !validPayload(q, body.value))
      return response(
        { error: "Yanıt biçimi veya soru kimliği geçersiz." },
        400,
      );
    const correct = gradeAnswer(q, body.value),
      points = correct ? rankPoints(q.difficulty) : 0,
      cursor = attempt.cursor + 1;
    const { data: updated, error: writeError } = await admin
      .from("study_rift_attempts")
      .update({
        cursor,
        score: attempt.score + points,
        correct: attempt.correct + (correct ? 1 : 0),
        answers: [
          ...attempt.answers,
          { questionId: q.id, value: body.value, correct, points },
        ],
        completed: cursor === 10,
        finished_at: cursor === 10 ? new Date().toISOString() : null,
      })
      .eq("id", attempt.id)
      .eq("cursor", attempt.cursor)
      .select()
      .maybeSingle();
    if (writeError) throw writeError;
    if (!updated)
      return response(
        {
          error: "Yanıt başka sekmede kaydedildi. Sınavı yeniden yükle.",
          code: "cursor_changed",
        },
        409,
      );
    return response({
      attempt: summary(updated),
      question: {
        ...publicQuestion(q),
        answer: q.answer,
        explanation: q.explanation,
      },
      feedback: { correct, value: body.value, points, xp: 0, damage: 0 },
      next: cursor < 10,
    });
  } catch {
    return response(
      {
        error:
          "Ustalık sunucusuna ulaşılamadı. Yanıtını tekrar göndermeden önce kaydı yenile.",
      },
      503,
    );
  }
});
