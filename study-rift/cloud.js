import { createClient } from "./vendor/supabase.js";
import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
export const cloud = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storageKey: "study-rift-auth-v1",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
export class SaveStore {
  constructor(onStatus) {
    this.user = null;
    this.revision = 0;
    this.pending = null;
    this.running = false;
    this.blocked = false;
    this.onStatus = onStatus;
  }
  async load(user) {
    this.user = user;
    this.blocked = false;
    this.pending = null;
    const { data, error } = await cloud
      .from("study_rift_saves")
      .select("state,revision")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    this.revision = data?.revision || 0;
    return data?.state || null;
  }
  enqueue(state) {
    if (!this.user || this.blocked) return;
    this.pending = JSON.parse(JSON.stringify(state));
    this.onStatus("saving");
    this.flush();
  }
  async flush() {
    if (this.running || !this.pending || this.blocked) return;
    this.running = true;
    try {
      while (this.pending) {
        const state = this.pending;
        this.pending = null;
        let query;
        if (this.revision === 0) {
          query = cloud
            .from("study_rift_saves")
            .insert({
              user_id: this.user.id,
              state,
              revision: 1,
              updated_at: new Date().toISOString(),
            })
            .select("revision");
        } else {
          query = cloud
            .from("study_rift_saves")
            .update({
              state,
              revision: this.revision + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", this.user.id)
            .eq("revision", this.revision)
            .select("revision");
        }
        const { data, error } = await query;
        if (error) {
          if (error.code === "23505") {
            this.blocked = true;
            this.onStatus("conflict");
            break;
          }
          this.pending = this.pending || state;
          this.onStatus("error");
          break;
        }
        if (!data?.length) {
          this.blocked = true;
          this.onStatus("conflict");
          break;
        }
        this.revision = data[0].revision;
        if (!this.pending) this.onStatus("saved");
      }
    } finally {
      this.running = false;
    }
  }
}
export async function authRequest(action, fields = {}) {
  const {
    data: { session },
  } = await cloud.auth.getSession();
  const res = await fetch(SUPABASE_URL + "/functions/v1/study-rift-auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      ...(session ? { Authorization: "Bearer " + session.access_token } : {}),
    },
    body: JSON.stringify({ action, ...fields }),
  });
  const body = await res.json();
  if (!res.ok || body.error) throw Error(body.error || "Bağlantı kurulamadı.");
  if (body.session) {
    const { error } = await cloud.auth.setSession(body.session);
    if (error) throw error;
  }
  return body;
}
export async function masteryRequest(action, fields = {}) {
  const {
    data: { session },
    error,
  } = await cloud.auth.getSession();
  if (error || !session) throw Error("Ustalık sınavı için giriş yap.");
  const res = await fetch(SUPABASE_URL + "/functions/v1/study-rift-mastery", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: "Bearer " + session.access_token,
    },
    body: JSON.stringify({ action, ...fields }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || "Ustalık sunucusuna ulaşılamadı.");
    err.code = data.code;
    throw err;
  }
  return data;
}
