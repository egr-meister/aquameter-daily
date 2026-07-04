// All numeric helpers are defensive: they never throw on bad input.
// Internal source of truth for volume is ALWAYS milliliters (ml).

export const ML_PER_OZ = 29.5735;

// Per-entry and goal safety limits (in ml).
export const MAX_ENTRY_ML = 5000;
export const MAX_GOAL_ML = 10000;
export const DEFAULT_GOAL_ML = 2000;

export function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// Clamp a value into a range, safely.
export function clamp(value, min, max) {
  const n = toNumber(value, min);
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

// Convert ml -> oz (number).
export function mlToOz(ml) {
  const n = Math.max(0, toNumber(ml, 0));
  return n / ML_PER_OZ;
}

// Convert oz -> ml (number).
export function ozToMl(oz) {
  const n = Math.max(0, toNumber(oz, 0));
  return n * ML_PER_OZ;
}

// Round oz to 1 decimal place, cleanly.
export function roundOz(oz) {
  const n = Math.max(0, toNumber(oz, 0));
  return Math.round(n * 10) / 10;
}

// Whole-number ml.
export function roundMl(ml) {
  return Math.round(Math.max(0, toNumber(ml, 0)));
}

// Format an amount stored in ml for display in the current unit.
// Returns just the number as a string (no unit suffix).
export function formatAmount(ml, unit) {
  const safeMl = Math.max(0, toNumber(ml, 0));
  if (unit === "oz") {
    return String(roundOz(mlToOz(safeMl)));
  }
  return String(roundMl(safeMl));
}

// Format amount WITH unit label, e.g. "750 ml" or "25.4 oz".
export function formatAmountWithUnit(ml, unit) {
  const u = unit === "oz" ? "oz" : "ml";
  return `${formatAmount(ml, u)} ${u}`;
}

export function unitLabel(unit) {
  return unit === "oz" ? "oz" : "ml";
}

// Convert a user-entered display value (in the current unit) into ml for storage.
export function displayValueToMl(value, unit) {
  const n = Math.max(0, toNumber(value, 0));
  if (unit === "oz") {
    return roundMl(ozToMl(n));
  }
  return roundMl(n);
}

// Convert a stored ml value into the display unit value (number) for editing fields.
export function mlToDisplayValue(ml, unit) {
  const safeMl = Math.max(0, toNumber(ml, 0));
  if (unit === "oz") {
    return roundOz(mlToOz(safeMl));
  }
  return roundMl(safeMl);
}

// Resolve a usable goal: missing / 0 / invalid falls back to the default (2000 ml).
export function resolveGoalMl(goalMl) {
  const g = toNumber(goalMl, DEFAULT_GOAL_ML);
  return g > 0 ? g : DEFAULT_GOAL_ML;
}

// Percentage 0..100+ (integer) of total vs goal. Not capped (real value).
export function progressPercent(totalMl, goalMl) {
  const g = resolveGoalMl(goalMl);
  const t = Math.max(0, toNumber(totalMl, 0));
  return Math.round((t / g) * 100);
}

// Progress ratio capped at 1 for visual bars.
export function progressRatio(totalMl, goalMl) {
  const g = resolveGoalMl(goalMl);
  const t = Math.max(0, toNumber(totalMl, 0));
  return Math.min(t / g, 1);
}
