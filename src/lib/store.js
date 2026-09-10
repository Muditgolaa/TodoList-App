import { useSyncExternalStore } from "react";
import { v4 as uuidv4 } from "uuid";
import { ymd, today, addDays } from "./dates";

const KEY = "ember-state-v1";
const COLORS = ["#f6a13d","#37d29a","#5aa2f6","#c98bff","#f97316","#e05a8a","#4bd0d0","#f2c94c"];

// ---------- shape helpers ----------
function blank() {
  return {
    habits: [
      { id: uuidv4(), name: "DSA practice", color: COLORS[0] },
      { id: uuidv4(), name: "Aptitude", color: COLORS[1] },
      { id: uuidv4(), name: "Core subject revision", color: COLORS[2] },
      { id: uuidv4(), name: "Reading / notes", color: COLORS[3] },
    ],
    logs: {},
    todos: [],
    settings: {},
    isDemo: false,
    updatedAt: Date.now(),
  };
}

// Seed ~9 weeks of believable history so a first-time visitor sees the
// dashboard alive. Marked isDemo — cleared on their first real action.
function demo() {
  const s = blank();
  s.isDemo = true;
  const ids = s.habits.map((h) => h.id);
  for (let i = 62; i >= 0; i--) {
    const d = ymd(addDays(new Date(), -i));
    let seed = Math.sin(i * 12.9898) * 43758.5453;
    seed = seed - Math.floor(seed);
    let active = i <= 6 ? true : seed > 0.32; // last week strong
    if (i === 9 || i === 16 || i === 23) active = false; // honest gaps
    if (!active) continue;
    const log = { done: {}, minutes: 0, note: "" };
    let howMany = i <= 6 ? 2 + Math.floor(seed * 3) : 1 + Math.floor(((seed * 7) % 1) * ids.length);
    howMany = Math.max(1, Math.min(ids.length, howMany));
    for (let j = 0; j < howMany; j++) log.done[ids[j]] = true;
    log.minutes = 20 * howMany + Math.floor(seed * 40);
    s.logs[d] = log;
  }
  return s;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }

  // First run: pull in any todos from the old app so nothing is lost.
  let migrated = [];
  try {
    const old = localStorage.getItem("todos");
    if (old) migrated = JSON.parse(old);
  } catch { /* ignore */ }
  if (migrated.length) return { ...blank(), todos: migrated };

  return demo();
}

// ---------- external store plumbing ----------
let state = load();
const listeners = new Set();

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function commit(next) {
  state = { ...next, updatedAt: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    localStorage.setItem("todos", JSON.stringify(state.todos)); // keep old key in sync
  } catch { /* ignore */ }
  for (const l of listeners) l();
}

// React hook — any component calling this re-renders on every change.
export function useStore() {
  return useSyncExternalStore(subscribe, () => state);
}

// ---------- small internal helpers ----------
function leaveDemo(next) {
  if (next.isDemo) return { ...next, logs: {}, isDemo: false };
  return next;
}
function withTodayLog(logs) {
  const t = today();
  const log = logs[t] ? { ...logs[t] } : { done: {}, minutes: 0, note: "" };
  if (!log.done) log.done = {};
  return { logs: { ...logs, [t]: log }, log, t };
}

// ---------- actions (the only way to change state) ----------
export const actions = {
  toggleHabit(id) {
    let next = leaveDemo({ ...state });
    const { logs, log, t } = withTodayLog(next.logs);
    log.done = { ...log.done, [id]: !log.done[id] };
    logs[t] = log;
    commit({ ...next, logs });
  },
  addHabit(name) {
    const clean = name.trim();
    if (!clean) return;
    const next = leaveDemo({ ...state });
    const used = next.habits.map((h) => h.color);
    const color = COLORS.find((c) => !used.includes(c)) || COLORS[next.habits.length % COLORS.length];
    commit({ ...next, habits: [...next.habits, { id: uuidv4(), name: clean, color }] });
  },
  removeHabit(id) {
    commit({ ...state, habits: state.habits.filter((h) => h.id !== id) });
  },
  addMinutes(n) {
    let next = leaveDemo({ ...state });
    const { logs, log, t } = withTodayLog(next.logs);
    log.minutes = n === 0 ? 0 : (log.minutes || 0) + n;
    logs[t] = log;
    commit({ ...next, logs });
  },
  setNote(text) {
    let next = leaveDemo({ ...state });
    const { logs, log, t } = withTodayLog(next.logs);
    log.note = text;
    logs[t] = log;
    commit({ ...next, logs });
  },
  startFresh() {
    commit({ ...state, logs: {}, isDemo: false });
  },
  // ---- todos (Tasks page uses these in Step 6) ----
  addTodo(text) {
    const clean = text.trim();
    if (!clean) return;
    commit({ ...state, todos: [...state.todos, { id: uuidv4(), todo: clean, isCompleted: false }] });
  },
  toggleTodo(id) {
    commit({
      ...state,
      todos: state.todos.map((x) => (x.id === id ? { ...x, isCompleted: !x.isCompleted } : x)),
    });
  },
  deleteTodo(id) {
    commit({ ...state, todos: state.todos.filter((x) => x.id !== id) });
  },
};
