// FNF account registration and one-time migration of existing email accounts.
// Deploy with verify_jwt=false: register validates an invite; claim validates a user JWT.
import { createClient } from 'npm:@supabase/supabase-js@2.95.0';

const siteOrigin = 'https://egecanturk.dev';
const cors = {
  'Access-Control-Allow-Origin': siteOrigin,
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};
const reply = (data: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: cors });
const canonical = (value: unknown) => String(value ?? '').trim().toLowerCase();
const validName = (value: string) => /^[a-z0-9_]{3,20}$/.test(value);
const emailFor = (username: string) => `fnf-${username}@users.fnf.invalid`;

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return reply({ error: 'Geçersiz istek.' }, 405);

  let payload: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 1200) return reply({ error: 'İstek çok uzun.' }, 413);
    payload = JSON.parse(raw);
    if (!payload || Array.isArray(payload) || typeof payload !== 'object') throw Error();
  } catch {
    return reply({ error: 'Geçersiz istek.' }, 400);
  }

  const username = canonical(payload.username);
  if (!validName(username)) {
    return reply({ error: 'Kullanıcı adı 3–20 karakter olmalı; yalnızca İngilizce harf, rakam ve _ kullan.' }, 400);
  }

  const url = Deno.env.get('SUPABASE_URL');
  const secretMap = Deno.env.get('SUPABASE_SECRET_KEYS');
  const key = (secretMap && JSON.parse(secretMap).default) || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return reply({ error: 'Kayıt servisi hazır değil.' }, 503);
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  if (payload.action === 'register') {
    const password = payload.password;
    const access = payload.access;
    if (typeof password !== 'string' || password.length < 8 || password.length > 128 ||
        typeof access !== 'string' || access.length < 10 || access.length > 128) {
      return reply({ error: 'Şifre en az 8 karakter olmalı; geçerli bir oda kodu veya kurucu şifresi gir.' }, 400);
    }
    const { data: allowed, error: accessError } = await admin.rpc('fnf_signup_access', { p_access: access.trim() });
    if (accessError) return reply({ error: 'Davet kontrolü yapılamadı.' }, 503);
    if (!allowed) return reply({ error: 'Oda kodu veya kurucu şifresi yanlış.' }, 403);

    const { error } = await admin.auth.admin.createUser({
      email: emailFor(username), password, email_confirm: true,
      user_metadata: { fnf_username: username },
    });
    if (error) {
      if (/already|registered|exists|duplicate/i.test(error.message))
        return reply({ error: 'Bu kullanıcı adı alınmış.' }, 409);
      return reply({ error: 'Hesap oluşturulamadı. Başka bir şifreyle tekrar dene.' }, 400);
    }
    return reply({ ok: true });
  }

  if (payload.action === 'claim') {
    const token = request.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];
    if (!token) return reply({ error: 'Önce eski hesabına giriş yap.' }, 401);
    const { data: auth, error: authError } = await admin.auth.getUser(token);
    if (authError || !auth.user) return reply({ error: 'Oturum geçersiz.' }, 401);
    if (auth.user.email?.endsWith('@users.fnf.invalid'))
      return reply({ error: 'Bu hesabın zaten kullanıcı adı var.' }, 409);

    const { error } = await admin.auth.admin.updateUserById(auth.user.id, {
      email: emailFor(username), email_confirm: true,
      user_metadata: { ...auth.user.user_metadata, fnf_username: username },
    });
    if (error) {
      if (/already|registered|exists|duplicate/i.test(error.message))
        return reply({ error: 'Bu kullanıcı adı alınmış.' }, 409);
      return reply({ error: 'Kullanıcı adı atanamadı. Tekrar dene.' }, 400);
    }
    return reply({ ok: true, username });
  }

  return reply({ error: 'Geçersiz işlem.' }, 400);
});
