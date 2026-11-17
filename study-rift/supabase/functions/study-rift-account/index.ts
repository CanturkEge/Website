import { createClient } from "npm:@supabase/supabase-js@2.119.0";
const url = Deno.env.get("SUPABASE_URL")!;
const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const allowed = new Set([
  "https://egecanturk.dev",
  "https://www.egecanturk.dev",
  "https://canturkege.github.io",
  "http://127.0.0.1:4173",
]);
Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "",
    headers = {
      "Access-Control-Allow-Origin": allowed.has(origin)
        ? origin
        : "https://egecanturk.dev",
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      Vary: "Origin",
    };
  const reply = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers });
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST" || (origin && !allowed.has(origin)))
    return reply({ error: "İstek kabul edilmedi." }, 403);
  try {
    const token =
      req.headers.get("authorization")?.replace(/^Bearer /i, "") || "";
    const {
      data: { user },
      error,
    } = await admin.auth.getUser(token);
    if (error || !user) return reply({ error: "Önce giriş yap." }, 401);
    const { data: profile, error: profileError } = await admin
      .from("study_rift_profiles")
      .select("username,display_name")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profileError || !profile)
      return reply({ error: "Study Rift hesabı bulunamadı." }, 403);
    const { data: allowedRequest, error: limitError } = await admin.rpc(
      "study_rift_consume_limit",
      { p_bucket: "account:" + user.id, p_limit: 20, p_seconds: 900 },
    );
    if (limitError || !allowedRequest)
      return reply(
        { error: "Çok fazla deneme. Biraz sonra tekrar dene." },
        429,
      );
    const raw = await req.text();
    if (raw.length > 4096) return reply({ error: "İstek çok büyük." }, 413);
    const body = JSON.parse(raw);
    if (body.action === "rename") {
      const name = String(body.displayName || "")
        .trim()
        .replace(/\s+/g, " ");
      if (
        [...name].length < 2 ||
        [...name].length > 24 ||
        /[\p{Cc}\p{Cf}<>]/u.test(name)
      )
        return reply(
          {
            error:
              "Görünen ad 2–24 karakter olmalı; kontrol karakteri içeremez.",
          },
          400,
        );
      const { error: writeError } = await admin
        .from("study_rift_profiles")
        .update({ display_name: name })
        .eq("user_id", user.id);
      if (writeError) throw writeError;
      return reply({ displayName: name, username: profile.username });
    }
    if (body.action !== "delete")
      return reply({ error: "Geçersiz işlem." }, 400);
    if (
      body.confirmation !== "SİL" ||
      typeof body.password !== "string" ||
      body.password.length > 128
    )
      return reply({ error: "Silme onayını ve mevcut şifreni gir." }, 400);
    const auth = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: verified, error: verifyError } =
      await auth.auth.signInWithPassword({
        email: user.email!,
        password: body.password,
      });
    if (verifyError || verified.user?.id !== user.id || !verified.session)
      return reply({ error: "Mevcut şifre hatalı." }, 401);
    await admin.auth.admin.signOut(verified.session.access_token, "local");
    if (user.email?.endsWith("@rift.invalid")) {
      const { error: revokeError } = await admin.auth.admin.signOut(
        token,
        "global",
      );
      if (revokeError) throw revokeError;
      const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
      if (deleteError) throw deleteError;
    } else {
      // Shared email identities can belong to other applications in this project.
      const { error: deleteError } = await admin.rpc(
        "study_rift_delete_profile",
        { p_user_id: user.id },
      );
      if (deleteError) throw deleteError;
      await admin.auth.admin.signOut(token, "local");
    }
    return reply({ deleted: true });
  } catch {
    return reply(
      {
        error:
          "İşlem tamamlanamadı. Yeniden denemeden önce hesabını kontrol et.",
      },
      503,
    );
  }
});
