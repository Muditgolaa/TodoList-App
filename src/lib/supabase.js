// Cloud + auth layer. Activates only when both env vars are present.
import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const cloudEnabled = Boolean(URL && ANON);
export const supabase = cloudEnabled ? createClient(URL, ANON) : null;

// ---------- auth ----------
export async function getUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
export function onAuthChange(cb) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session?.user ?? null));
  return () => data.subscription.unsubscribe();
}
export function signUp(email, password) {
  return supabase.auth.signUp({ email, password });
}
export function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}
export function signOut() {
  return supabase.auth.signOut();
}

// ---------- per-user data ----------
export async function cloudLoad(userId) {
  if (!supabase || !userId) return null;
  try {
    const { data, error } = await supabase
      .from("tudum_state")
      .select("state")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data ? data.state : null;
  } catch (e) {
    console.warn("[tudum] cloud load failed:", e.message || e);
    return null;
  }
}
export async function cloudSave(userId, state) {
  if (!supabase || !userId) return false;
  try {
    const { error } = await supabase
      .from("tudum_state")
      .upsert({ user_id: userId, state, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) throw error;
    return true;
  } catch (e) {
    console.warn("[tudum] cloud save failed:", e.message || e);
    return false;
  }
}
export function cloudSubscribe(userId, onState) {
  if (!supabase || !userId) return () => {};
  const channel = supabase
    .channel("tudum_state_" + userId)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tudum_state", filter: `user_id=eq.${userId}` },
      (payload) => {
        if (payload.new && payload.new.state) onState(payload.new.state);
      }
    )
    .subscribe();
  return () => {
    try { supabase.removeChannel(channel); } catch { /* ignore */ }
  };
}