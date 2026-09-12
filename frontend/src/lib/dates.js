// Local-date helpers. Dates are keyed as "YYYY-MM-DD" in local time so "today" always matches the calendar the user sees.

export function ymd(d) {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export function parseYmd(s) {
  const [y, m, day] = s.split("-").map(Number);
  return new Date(y, m - 1, day);
}

export function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function today() {
  return ymd(new Date());
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

export function prettyDate(d) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function weekdayName(d) {
  return DAYS[d.getDay()].slice(0, 3);
}

export function monthShort(i) {
  return MONTHS[i];
}

export function fmtMinutes(m) {
  if (!m) return "0m";
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h && mm) return `${h}h ${mm}m`;
  if (h) return `${h}h`;
  return `${mm}m`;
}