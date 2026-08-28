const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { action, username, password, campaignId } = await request.json();
    if (!username || !password || !["login", "list", "delete"].includes(action)) {
      return json({ error: "Eksik veya geçersiz admin isteği" }, 400);
    }
    if (action === "delete" && !campaignId) return json({ error: "Kampanya kimliği eksik" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) return json({ error: "Admin sunucusu yapılandırılmamış" }, 503);

    const rpc = action === "login" ? "kadim_admin_valid" : action === "list" ? "kadim_admin_campaign_list" : "kadim_admin_campaign_delete";
    const body = action === "delete"
      ? { p_username: username, p_password: password, p_campaign: campaignId }
      : { p_username: username, p_password: password };
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${rpc}`, {
      method: "POST",
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      const denied = response.status === 400 && String(detail.message || "").includes("reddedildi");
      return json({ error: denied ? "Admin kullanıcı adı veya şifre yanlış" : "Admin işlemi tamamlanamadı" }, denied ? 401 : 500);
    }
    const data = await response.json();
    if (action === "login" && data !== true) return json({ error: "Admin kullanıcı adı veya şifre yanlış" }, 401);
    return json({ data });
  } catch (error) {
    console.error("Admin gateway error", error instanceof Error ? error.message : "unknown");
    return json({ error: "Admin sunucusuna ulaşılamadı" }, 500);
  }
});
