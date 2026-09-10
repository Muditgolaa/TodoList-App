import { useState } from "react";
import { useStore, actions } from "../lib/store";
import {
  currentStreak, longestStreak, habitStreak, level,
  weekSummary, totalActiveDays, doneCount, isActive,
} from "../lib/streaks";
import { ymd, addDays, today, weekdayName, monthShort, fmtMinutes, prettyDate } from "../lib/dates";

// Small inline flame for the hero.
function Flame() {
  return (
    <svg viewBox="0 0 24 24" width="46" height="46" fill="none" aria-hidden="true"
      style={{ filter: "drop-shadow(0 2px 8px rgba(249,115,22,.45))" }}>
      <path d="M12 2c1.2 3.2-.9 4.6-2.2 6.2C8.3 9.9 8 11.4 8 12.5 8 15 9.8 17 12 17s4-2 4-4.5c0-1.6-.7-3.3-1.8-4.6 1 2.5-.4 3.6-1 3.6-1 0-1.1-1-1-2.4C12.3 6.6 13 4.2 12 2Z" fill="var(--amber)"/>
      <path d="M12 22c3.9 0 7-2.6 7-6.4 0-2-.9-4-2.3-5.6.2 3.1-1.6 4.4-2.3 4.4.6-2 .1-4.6-1.4-6.4C13.4 6 11 7.6 9.6 9.6 8.6 11 8 12.7 8 14.4 8 18.5 9.9 22 12 22Z" fill="var(--amber-2)"/>
    </svg>
  );
}

function heroCopy(streak, todayActive) {
  if (streak === 0) return ["Light the first day.", "Finish at least one habit today to begin your streak. Consistency compounds — one day at a time."];
  if (!todayActive) return ["Keep it alive today.", `You're on a ${streak}-day run, but today isn't logged yet. Finish one habit to carry the chain forward.`];
  if (streak < 3) return ["It's catching.", "Two or three days in a row is where the habit starts to hold. Show up again tomorrow."];
  if (streak < 7) return ["The chain is holding.", `A ${streak}-day streak — momentum is real now. Don't break it.`];
  if (streak < 21) return ["You're on fire.", `${streak} days straight. This is what consistent looks like.`];
  return ["Unstoppable.", `${streak} days of showing up. This isn't motivation anymore — it's who you are.`];
}

export default function Dashboard() {
  const state = useStore();
  const { habits, logs, isDemo } = state;
  const [habitName, setHabitName] = useState("");

  const tdy = today();
  const todayLog = logs[tdy] || { done: {}, minutes: 0, note: "" };

  const cur = currentStreak(logs);
  const best = longestStreak(logs);
  const { activeDays, minutes } = weekSummary(logs);
  const doneToday = doneCount(logs, tdy);
  const hrs = minutes / 60;
  const [lead, sub] = heroCopy(cur, isActive(logs, tdy));

  const tiles = [
    { k: "Current streak", v: cur, s: "days", accent: true },
    { k: "Longest streak", v: best, s: "days" },
    { k: "Active this week", v: activeDays, s: "/ 7 days" },
    { k: "Focus this week", v: hrs < 10 ? hrs.toFixed(1) : Math.round(hrs), s: "hours" },
  ];

  // ---- weekly focus bars (last 7 days) ----
  const bars = [];
  let maxMin = 1;
  for (let i = 6; i >= 0; i--) {
    const d = addDays(new Date(), -i);
    const m = logs[ymd(d)]?.minutes || 0;
    if (m > maxMin) maxMin = m;
    bars.push({ d, m });
  }

  // ---- heatmap: 26 weeks, Sunday-aligned columns ----
  const weeks = 26;
  let start = addDays(new Date(), -(weeks * 7 - 1));
  start = addDays(start, -start.getDay());
  const now = new Date();
  const columns = [];
  let lastMonth = -1;
  for (let w = 0; w <= weeks; w++) {
    const weekStart = addDays(start, w * 7);
    let label = "";
    if (weekStart.getMonth() !== lastMonth && weekStart <= now) {
      label = monthShort(weekStart.getMonth());
      lastMonth = weekStart.getMonth();
    }
    const days = [];
    for (let r = 0; r < 7; r++) {
      const d = addDays(start, w * 7 + r);
      const ds = ymd(d);
      const future = d > now;
      days.push({ ds, future, lvl: future ? 0 : level(logs, ds, habits.length), isToday: ds === tdy, count: doneCount(logs, ds), min: logs[ds]?.minutes || 0 });
    }
    columns.push({ label, days });
  }

  const addHabit = (e) => {
    e.preventDefault();
    actions.addHabit(habitName);
    setHabitName("");
  };
  const removeHabit = (h) => {
    if (confirm(`Remove "${h.name}"? Past history stays but it leaves your list.`)) actions.removeHabit(h.id);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      {/* demo banner */}
      {isDemo && (
        <div className="flex items-center gap-4 flex-wrap rounded-2xl px-4 py-3 border"
          style={{ background: "var(--amber-soft)", borderColor: "var(--amber)" }}>
          <p className="flex-1 min-w-[200px] text-sm text-[var(--text)]">
            <b className="font-display">You're viewing demo data</b> — sample habits and history so you can see how it works. Clear it and start logging your own.
          </p>
          <button onClick={() => actions.startFresh()}
            className="rounded-lg px-4 py-2 text-sm font-bold"
            style={{ background: "linear-gradient(180deg,var(--amber),var(--amber-2))", color: "#1a0f02" }}>
            Start fresh
          </button>
        </div>
      )}

      {/* hero */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 md:p-7 grid md:grid-cols-[auto_1fr] gap-6 items-center">
        <div className="flex items-center gap-3">
          <Flame />
          <div className="flex items-baseline gap-2">
            <span className="font-display font-extrabold leading-none font-mono-nums" style={{ fontSize: "72px", background: "linear-gradient(160deg,var(--amber),var(--amber-2))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              {cur}
            </span>
            <span className="font-display font-bold text-lg text-[var(--muted)]">day{cur === 1 ? "" : "s"}</span>
          </div>
        </div>
        <div>
          <p className="font-display font-bold text-lg text-[var(--text)] m-0">{lead}</p>
          <p className="text-sm text-[var(--muted)] mt-1 max-w-[46ch]">{sub}</p>
          <div className="flex gap-2 mt-4">
            {Array.from({ length: 7 }).map((_, idx) => {
              const d = addDays(new Date(), -(6 - idx));
              const ds = ymd(d);
              const on = isActive(logs, ds);
              return (
                <div key={ds} className="flex flex-col items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg grid place-items-center text-xs"
                    style={{
                      background: on ? "linear-gradient(180deg,var(--amber),var(--amber-2))" : "var(--h0)",
                      color: on ? "#1a0f02" : "transparent",
                      boxShadow: ds === tdy ? "0 0 0 2px var(--bg),0 0 0 3.5px var(--amber)" : "none",
                    }}>
                    {on ? "✓" : ""}
                  </div>
                  <small className="text-[10px] text-[var(--faint)] font-mono-nums">{weekdayName(d).charAt(0)}</small>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* stat tiles */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map((t) => (
          <div key={t.k} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--faint)]">{t.k}</div>
            <div className="font-display font-bold text-3xl mt-2 flex items-baseline gap-1.5" style={{ color: t.accent ? "var(--amber)" : "var(--text)" }}>
              <span className="font-mono-nums">{t.v}</span>
              <span className="text-sm font-normal text-[var(--muted)]" style={{ fontFamily: "var(--font-b)" }}>{t.s}</span>
            </div>
          </div>
        ))}
      </section>

      {/* two columns */}
      <section className="grid lg:grid-cols-[1.15fr_0.85fr] gap-4">
        {/* today */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-[var(--text)]">Today</h2>
            <span className="font-mono-nums text-xs text-[var(--muted)]">{habits.length ? `${doneToday} / ${habits.length} done` : ""}</span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 mb-4">Tap a habit to mark it done. Your streak counts any day you finish at least one.</p>

          <div className="space-y-2">
            {habits.length === 0 && <p className="text-sm text-[var(--faint)]">No habits yet — add your first below.</p>}
            {habits.map((h) => {
              const done = !!todayLog.done[h.id];
              const stk = habitStreak(logs, h.id);
              return (
                <div key={h.id}
                  onClick={() => actions.toggleHabit(h.id)}
                  className="group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors"
                  style={{ background: done ? "var(--done-soft)" : "var(--surface-2)", borderColor: done ? "transparent" : "var(--border)" }}>
                  <div className="w-6 h-6 rounded-full grid place-items-center flex-none border-2 transition-colors"
                    style={{ borderColor: done ? "var(--done)" : "var(--border-strong)", background: done ? "var(--done)" : "transparent", color: done ? "#04140d" : "transparent" }}>
                    ✓
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ background: h.color }} />
                  <span className="flex-1 font-semibold text-sm text-[var(--text)]">{h.name}</span>
                  <span className="font-mono-nums text-xs text-[var(--muted)]">{stk > 0 ? `🔥 ${stk}` : ""}</span>
                  <button onClick={(e) => { e.stopPropagation(); removeHabit(h); }}
                    className="opacity-0 group-hover:opacity-100 text-[var(--faint)] hover:text-[var(--amber-2)] w-6 h-6 rounded-md grid place-items-center transition-opacity"
                    aria-label={`Remove ${h.name}`}>✕</button>
                </div>
              );
            })}
          </div>

          <form onSubmit={addHabit} className="flex gap-2 mt-4">
            <input value={habitName} onChange={(e) => setHabitName(e.target.value)} maxLength={40}
              placeholder="Add a habit — e.g. DSA practice, Revision…"
              className="flex-1 bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--amber)]" />
            <button type="submit" className="rounded-lg px-4 text-sm font-semibold border border-[var(--border-strong)] text-[var(--text)] hover:border-[var(--amber)]">Add</button>
          </form>

          {/* focus time */}
          <div className="mt-5 border-t border-[var(--border)] pt-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-[var(--muted)]">Focus time today</span>
              <b className="font-display text-lg text-[var(--text)]">{fmtMinutes(todayLog.minutes || 0)}</b>
            </div>
            <div className="flex gap-2">
              {[15, 30, 60].map((m) => (
                <button key={m} onClick={() => actions.addMinutes(m)}
                  className="flex-1 bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] rounded-lg py-2 text-sm font-mono-nums hover:border-[var(--amber)]">
                  +{m === 60 ? "1h" : `${m}m`}
                </button>
              ))}
              <button onClick={() => actions.addMinutes(0)} title="Reset"
                className="bg-[var(--surface-2)] border border-[var(--border)] text-[var(--faint)] rounded-lg py-2 px-3 text-sm hover:border-[var(--amber)]">✕</button>
            </div>
            <textarea value={todayLog.note || ""} onChange={(e) => actions.setNote(e.target.value)} maxLength={280}
              placeholder="A quick note on today — what you studied, how it felt…"
              className="w-full mt-3 bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--amber)] resize-y min-h-[52px]" />
          </div>
        </div>

        {/* habit streaks + bars */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
          <h2 className="font-display font-bold text-base text-[var(--text)]">Habit streaks</h2>
          <p className="text-xs text-[var(--muted)] mt-1 mb-4">Your current run on each habit, and the last two weeks.</p>
          <div className="space-y-3">
            {habits.length === 0 && <p className="text-sm text-[var(--faint)]">Add a habit to see its streak.</p>}
            {habits.map((h) => {
              const stk = habitStreak(logs, h.id);
              return (
                <div key={h.id}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ background: h.color }} />
                    <span className="flex-1 font-semibold text-sm text-[var(--text)]">{h.name}</span>
                    <span className="font-mono-nums text-xs" style={{ color: "var(--amber)" }}>{stk > 0 ? `${stk}-day` : "—"}</span>
                  </div>
                  <div className="flex gap-[3px]">
                    {Array.from({ length: 14 }).map((_, i) => {
                      const d = addDays(new Date(), -(13 - i));
                      const on = !!logs[ymd(d)]?.done?.[h.id];
                      return <div key={i} className="flex-1 h-2.5 rounded-[3px]" style={{ background: on ? h.color : "var(--h0)" }} />;
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[var(--border)] mt-5 pt-4">
            <h2 className="font-display font-bold text-[15px] text-[var(--text)]">Focus this week</h2>
            <p className="text-xs text-[var(--muted)] mt-1 mb-3">Minutes logged each day, last 7 days.</p>
            <div className="flex items-end gap-2 h-28">
              {bars.map(({ d, m }, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full">
                  <div className="flex-1 w-full flex items-end">
                    <div className="w-full rounded-t-md" title={`${fmtMinutes(m)} on ${prettyDate(d)}`}
                      style={{ height: m ? `${Math.max((m / maxMin) * 100, 4)}%` : "3px", minHeight: "3px", background: m ? "linear-gradient(180deg,var(--amber),var(--amber-2))" : "var(--h0)" }} />
                  </div>
                  <b className="text-[11px] font-mono-nums text-[var(--muted)]">{m ? (m >= 60 ? `${(m / 60).toFixed(1)}h` : `${m}m`) : ""}</b>
                  <small className="text-[10px] text-[var(--faint)] font-mono-nums">{weekdayName(d).charAt(0)}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* heatmap */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-base text-[var(--text)]">Consistency map</h2>
          <span className="font-mono-nums text-xs text-[var(--muted)]">{totalActiveDays(logs)} active days</span>
        </div>
        <p className="text-xs text-[var(--muted)] mt-1 mb-4">Every day of the last 26 weeks. The warmer the square, the more you finished that day.</p>

        <div className="overflow-x-auto pb-1">
          <div className="inline-flex flex-col gap-1.5 min-w-min">
            <div className="flex gap-[3px] ml-[22px] h-3.5">
              {columns.map((c, i) => (
                <span key={i} className="text-[10px] text-[var(--faint)] font-mono-nums" style={{ width: "17px", flex: "none" }}>{c.label}</span>
              ))}
            </div>
            <div className="flex">
              <div className="flex flex-col gap-[3px] mr-1.5">
                {["", "Mon", "", "Wed", "", "Fri", ""].map((l, i) => (
                  <span key={i} className="h-3.5 text-[9px] text-[var(--faint)] font-mono-nums flex items-center">{l}</span>
                ))}
              </div>
              <div className="flex gap-[3px]">
                {columns.map((c, i) => (
                  <div key={i} className="flex flex-col gap-[3px]">
                    {c.days.map((day, r) => (
                      <div key={r} className="w-3.5 h-3.5 rounded-[3px]"
                        title={day.future ? "" : `${prettyDate(addDays(start, i * 7 + r))} — ${day.count ? `${day.count} habit${day.count > 1 ? "s" : ""}` : "nothing"}${day.min ? `, ${fmtMinutes(day.min)} focus` : ""}`}
                        style={{
                          visibility: day.future ? "hidden" : "visible",
                          background: `var(--h${day.lvl})`,
                          boxShadow: day.isToday ? "0 0 0 1.5px var(--amber)" : "none",
                          border: "1px solid rgba(0,0,0,.15)",
                        }} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end mt-3 text-[11px] text-[var(--faint)] font-mono-nums">
          Less
          {[0, 1, 2, 3, 4].map((l) => <span key={l} className="w-3 h-3 rounded-[3px]" style={{ background: `var(--h${l})` }} />)}
          More
        </div>
      </section>
    </div>
  );
}