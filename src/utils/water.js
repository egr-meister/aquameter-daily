// Pure calculation helpers over the entries array. All defensive.
import { toNumber } from "./format";
import { lastNDates } from "./date";

// All entries for a given date (safe if entries missing/empty).
export function entriesForDate(entries, date) {
  const list = Array.isArray(entries) ? entries : [];
  return list.filter?.((item) => item?.date === date) ?? [];
}

// Total ml logged on a date.
export function totalMlForDate(entries, date) {
  const forDay = entriesForDate(entries, date);
  return (
    forDay?.reduce?.(
      (sum, item) => sum + Math.max(0, toNumber(item?.amountMl, 0)),
      0
    ) ?? 0
  );
}

// The most recently created entry for a date, or null.
export function lastEntryForDate(entries, date) {
  const forDay = entriesForDate(entries, date);
  if (!forDay.length) return null;
  let latest = forDay[0];
  for (let i = 1; i < forDay.length; i++) {
    const a = String(forDay[i]?.createdAt ?? "");
    const b = String(latest?.createdAt ?? "");
    if (a >= b) latest = forDay[i];
  }
  return latest ?? null;
}

// Entries for a date sorted by time then createdAt (ascending).
export function sortedEntriesForDate(entries, date) {
  const forDay = [...entriesForDate(entries, date)];
  forDay.sort((a, b) => {
    const ta = String(a?.time ?? "");
    const tb = String(b?.time ?? "");
    if (ta !== tb) return ta < tb ? -1 : 1;
    const ca = String(a?.createdAt ?? "");
    const cb = String(b?.createdAt ?? "");
    return ca < cb ? -1 : ca > cb ? 1 : 0;
  });
  return forDay;
}

// Unique dates that have entries, newest first.
export function historyDates(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const set = {};
  for (const e of list) {
    if (e?.date) set[e.date] = true;
  }
  return Object.keys(set).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
}

// Summary object for a date.
export function daySummary(entries, date, goalMl) {
  const forDay = entriesForDate(entries, date);
  const totalMl = totalMlForDate(entries, date);
  const goal = Math.max(1, toNumber(goalMl, 2000));
  return {
    date,
    totalMl,
    entryCount: forDay.length,
    goalReached: totalMl >= goal,
  };
}

// Chart data for the last N days (oldest first). Missing days => 0.
export function chartData(entries, days, goalMl) {
  const dates = lastNDates(days);
  const goal = Math.max(1, toNumber(goalMl, 2000));
  return dates.map((date) => {
    const totalMl = totalMlForDate(entries, date);
    return { date, totalMl, goalReached: totalMl >= goal };
  });
}

// Aggregate stats over a chart-data array.
export function chartStats(data, goalMl) {
  const list = Array.isArray(data) ? data : [];
  const goal = Math.max(1, toNumber(goalMl, 2000));
  if (!list.length) {
    return { averageMl: 0, bestMl: 0, goalDays: 0, totalDays: 0, maxMl: goal };
  }
  let sum = 0;
  let best = 0;
  let goalDays = 0;
  for (const d of list) {
    const t = Math.max(0, toNumber(d?.totalMl, 0));
    sum += t;
    if (t > best) best = t;
    if (t >= goal) goalDays += 1;
  }
  const averageMl = Math.round(sum / list.length);
  return {
    averageMl,
    bestMl: best,
    goalDays,
    totalDays: list.length,
    maxMl: Math.max(best, goal),
  };
}
