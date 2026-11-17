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
  const origin = req.headers.get("origin") || "";
  const cors = {
    "Access-Control-Allow-Origin": allowed.has(origin)
      ? origin
      : "https://egecanturk.dev",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
    Vary: "Origin",
  };
  const response = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: cors });
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST" || (origin && !allowed.has(origin)))
    return response({ error: "İstek kabul edilmedi." }, 403);
  try {
    const raw = await req.text();
    if (raw.length > 4096) return response({ error: "İstek çok büyük." }, 413);
    const body = JSON.parse(raw),
      action = String(body.action || "");
    if (!["register", "login", "recover", "claim"].includes(action))
      return response({ error: "Geçersiz işlem." }, 400);
    const username = String(body.username || "")
      .trim()
      .toLowerCase();
    if (!/^[a-z0-9_]{3,24}$/.test(username))
      return response(
        {
          error: "Kullanıcı adı 3–24 karakter; a-z, 0-9 ve alt çizgi içermeli.",
        },
        400,
      );
    const ip = (
      req.headers.get("x-forwarded-for") ||
      req.headers.get("cf-connecting-ip") ||
      "unknown"
    ).split(",")[0];
    const hash = async (text: string) =>
      Array.from(
        new Uint8Array(
          await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)),
        ),
      )
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");
    const lim = action === "register" ? 8 : action === "recover" ? 5 : 40;
    const { data: permitted, error: limitError } = await admin.rpc(
      "study_rift_consume_limit",
      {
        p_bucket: action + ":ip:" + (await hash(ip)),
        p_limit: lim,
        p_seconds: 900,
      },
    );
    const { data: accountAllowed, error: accountLimitError } = await admin.rpc(
      "study_rift_consume_limit",
      {
        p_bucket: action + ":user:" + (await hash(username)),
        p_limit: action === "login" ? 12 : 5,
        p_seconds: 900,
      },
    );
    if (limitError || accountLimitError) throw Error("LIMIT");
    if (!permitted || !accountAllowed)
      return response(
        { error: "Çok fazla deneme. 15 dakika sonra tekrar dene." },
        429,
      );
    const auth = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    if (action === "claim") {
      const bearer =
        req.headers.get("authorization")?.replace(/^Bearer /i, "") || "";
      const {
        data: { user },
        error,
      } = await admin.auth.getUser(bearer);
      if (error || !user)
        return response({ error: "Önce mevcut hesabına giriş yap." }, 401);
      const { error: insertError } = await admin
        .from("study_rift_profiles")
        .insert({
          user_id: user.id,
          username,
          recovery_enabled: !user.email?.endsWith("@rift.invalid"),
        });
      if (insertError)
        return response(
          {
            error:
              "Bu kullanıcı adı alınmış veya hesabının zaten kullanıcı adı var.",
          },
          409,
        );
      return response({ username });
    }
    const { data: profile, error: profileError } = await admin
      .from("study_rift_profiles")
      .select("user_id,recovery_enabled")
      .eq("username", username)
      .maybeSingle();
    if (profileError) throw Error("PROFILE");
    if (action === "register") {
      const password = String(body.password || ""),
        email = String(body.email || "")
          .trim()
          .toLowerCase();
      if (password.length < 8 || password.length > 128)
        return response({ error: "Şifre 8–128 karakter olmalı." }, 400);
      if (
        email &&
        (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
          email.length > 254 ||
          email.endsWith("@rift.invalid"))
      )
        return response(
          { error: "Geçerli bir kurtarma e-postası yaz veya alanı boş bırak." },
          400,
        );
      if (profile)
        return response({ error: "Bu kullanıcı adı kullanılamıyor." }, 409);
      const accountEmail = email || `${crypto.randomUUID()}@rift.invalid`;
      const { data, error } = await admin.auth.admin.createUser({
        email: accountEmail,
        password,
        email_confirm: true,
        user_metadata: { hunter_name: username },
      });
      if (error || !data.user)
        return response(
          {
            error:
              "Hesap oluşturulamadı. Kullanıcı adı veya kurtarma adresi kullanılıyor olabilir.",
          },
          409,
        );
      const { error: insertError } = await admin
        .from("study_rift_profiles")
        .insert({ user_id: data.user.id, username, recovery_enabled: !!email });
      if (insertError) {
        await admin.auth.admin.deleteUser(data.user.id);
        return response({ error: "Kullanıcı adı kullanılamıyor." }, 409);
      }
      const { data: login, error: loginError } =
        await auth.auth.signInWithPassword({ email: accountEmail, password });
      if (loginError)
        return response(
          {
            error: "Hesabın oluşturuldu. Kullanıcı adı ve şifrenle giriş yap.",
          },
          503,
        );
      return response({ session: login.session, username });
    }
    let email = "";
    if (profile) {
      const { data, error } = await admin.auth.admin.getUserById(
        profile.user_id,
      );
      if (!error) email = data.user?.email || "";
    }
    if (action === "recover") {
      if (email && profile?.recovery_enabled) {
        await auth.auth.resetPasswordForEmail(email, {
          redirectTo: "https://egecanturk.dev/study-rift/",
        });
      }
      return response({
        message:
          "Hesaba kurtarma adresi eklenmişse sıfırlama bağlantısı gönderilir. Kurtarma adresi eklemediysen bu yöntem kullanılamaz.",
      });
    }
    if (!email) {
      await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(String(body.password || "")),
      );
      return response({ error: "Kullanıcı adı veya şifre hatalı." }, 401);
    }
    const password = String(body.password || "");
    if (password.length > 128)
      return response({ error: "Kullanıcı adı veya şifre hatalı." }, 401);
    const { data, error } = await auth.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.session)
      return response({ error: "Kullanıcı adı veya şifre hatalı." }, 401);
    return response({ session: data.session, username });
  } catch {
    return response(
      { error: "Bağlantı kurulamadı. Biraz sonra tekrar dene." },
      503,
    );
  }
});
