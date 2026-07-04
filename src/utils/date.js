// Simple, stable date/time handling.
// Dates:  YYYY-MM-DD strings.  Times: HH:mm strings.

function pad2(n) {
  const s = String(Math.abs(Math.trunc(Number(n) || 0)));
  return s.length >= 2 ? s : "0" + s;
}

// Today's local date as YYYY-MM-DD.
export function todayString() {
  return dateToString(new Date());
}

// Current local time as HH:mm.
export function nowTimeString() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// Convert a Date object to YYYY-MM-DD (local).
export function dateToString(d) {
  try {
    if (!(d instanceof Date) || isNaN(d.getTime())) return todayStringFallback();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  } catch (e) {
    return todayStringFallback();
  }
}

function todayStringFallback() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// Validate a YYYY-MM-DD string strictly.
export function isValidDateString(value) {
  if (typeof value !== "string") return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return false;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const dt = new Date(year, month - 1, day);
  return (
    dt.getFullYear() === year &&
    dt.getMonth() === month - 1 &&
    dt.getDate() === day
  );
}

// Validate an HH:mm string.
export function isValidTimeString(value) {
  if (typeof value !== "string") return false;
  const m = /^(\d{2}):(\d{2})$/.exec(value);
  if (!m) return false;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h >= 0 && h <= 23 && min >= 0 && min <= 59;
}

// Human-friendly date label, e.g. "Fri, Jul 3, 2026". Falls back to the raw string.
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDateLabel(dateStr) {
  if (!isValidDateString(dateStr)) return String(dateStr ?? "");
  const [y, mo, d] = dateStr.split("-").map((x) => Number(x));
  const dt = new Date(y, mo - 1, d);
  if (isNaN(dt.getTime())) return dateStr;
  return `${WEEKDAYS[dt.getDay()]}, ${MONTHS[mo - 1]} ${d}, ${y}`;
}

// Short label for chart columns, e.g. "Jul 3" or weekday.
export function formatShortDate(dateStr) {
  if (!isValidDateString(dateStr)) return "";
  const [y, mo, d] = dateStr.split("-").map((x) => Number(x));
  return `${MONTHS[mo - 1]} ${d}`;
}

export function formatWeekday(dateStr) {
  if (!isValidDateString(dateStr)) return "";
  const [y, mo, d] = dateStr.split("-").map((x) => Number(x));
  const dt = new Date(y, mo - 1, d);
  if (isNaN(dt.getTime())) return "";
  return WEEKDAYS[dt.getDay()];
}

// Is the given date string today?
export function isToday(dateStr) {
  return dateStr === todayString();
}

// Return an array of YYYY-MM-DD for the last `count` days ending today (oldest first).
export function lastNDates(count) {
  const n = Math.max(1, Math.min(365, Math.trunc(Number(count) || 7)));
  const out = [];
  const base = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() - i);
    out.push(dateToString(d));
  }
  return out;
}
