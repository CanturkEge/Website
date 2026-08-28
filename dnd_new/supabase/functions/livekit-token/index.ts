import { AccessToken } from "npm:livekit-server-sdk@2.18.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const sha256 = async (value: string) => {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const dbGet = async (supabaseUrl: string, serviceKey: string, path: string) => {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!response.ok) throw new Error(`Database lookup failed: ${response.status}`);
  return response.json();
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { campaignId, sessionToken } = await request.json();
    if (!campaignId || !sessionToken) return json({ error: "Eksik oturum bilgisi" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const livekitUrl = Deno.env.get("LIVEKIT_URL");
    const livekitKey = Deno.env.get("LIVEKIT_API_KEY");
    const livekitSecret = Deno.env.get("LIVEKIT_API_SECRET");
    if (!supabaseUrl || !serviceKey || !livekitUrl || !livekitKey || !livekitSecret) {
      console.error("Required voice environment variables are missing");
      return json({ error: "Ses sunucusu yapılandırılmamış" }, 503);
    }

    const tokenHash = await sha256(sessionToken);
    const sessionQuery = `account_sessions_v54?select=user_id&token_hash=eq.${tokenHash}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&limit=1`;
    const [session] = await dbGet(supabaseUrl, serviceKey, sessionQuery);
    if (!session) return json({ error: "Oturum doğrulanamadı" }, 401);

    const membershipQuery = `campaign_members?select=role&campaign_id=eq.${encodeURIComponent(campaignId)}&user_id=eq.${encodeURIComponent(session.user_id)}&limit=1`;
    const [membership] = await dbGet(supabaseUrl, serviceKey, membershipQuery);
    if (!membership) return json({ error: "Bu kampanyanın üyesi değilsin" }, 403);

    const [account] = await dbGet(supabaseUrl, serviceKey, `accounts?select=display_name&id=eq.${encodeURIComponent(session.user_id)}&limit=1`);
    if (!account) return json({ error: "Hesap bulunamadı" }, 401);

    const accessToken = new AccessToken(livekitKey, livekitSecret, {
      identity: `user:${session.user_id}`,
      name: account.display_name,
      ttl: "10m",
    });
    accessToken.addGrant({
      roomJoin: true,
      room: `campaign-${campaignId}`,
      canPublish: true,
      canSubscribe: true,
      canPublishData: false,
    });

    return json({
      serverUrl: livekitUrl,
      participantToken: await accessToken.toJwt(),
      participantName: account.display_name,
      role: membership.role,
    });
  } catch (error) {
    console.error("Voice token error", error instanceof Error ? error.message : "unknown");
    return json({ error: "Ses bağlantısı hazırlanamadı" }, 500);
  }
});
