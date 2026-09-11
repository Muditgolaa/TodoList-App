import { useState } from "react";
import { signIn, signUp } from "../lib/supabase";

export default function AuthScreen() {
  const [mode, setMode] = useState("in"); // "in" | "up"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setMsg(""); setBusy(true);
    const fn = mode === "in" ? signIn : signUp;
    const { data, error } = await fn(email, password);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    // If email confirmation is ON, sign-up returns no session yet.
    if (mode === "up" && !data.session) {
      setMsg("Account created. Check your email to confirm, then sign in.");
      setMode("in");
    }
    // Otherwise onAuthStateChange logs the user in automatically.
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7">
        <h1 className="font-display text-3xl font-extrabold text-[var(--text)]">TuDummmm</h1>
        <p className="text-sm text-[var(--muted)] mt-1 mb-6">
          {mode === "in" ? "Sign in to track your streaks." : "Create an account to get started."}
        </p>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--amber)]"
          />
          <input
            type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 chars)"
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--amber)]"
          />

          {err && <p className="text-sm" style={{ color: "var(--amber-2)" }}>{err}</p>}
          {msg && <p className="text-sm text-[var(--done)]">{msg}</p>}

          <button
            type="submit" disabled={busy}
            className="w-full rounded-lg py-2.5 text-sm font-bold disabled:opacity-50"
            style={{ background: "linear-gradient(180deg,var(--amber),var(--amber-2))", color: "#1a0f02" }}
          >
            {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === "in" ? "up" : "in"); setErr(""); setMsg(""); }}
          className="w-full text-center text-sm text-[var(--muted)] hover:text-[var(--text)] mt-4"
        >
          {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}