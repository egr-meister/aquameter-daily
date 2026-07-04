// AsyncStorage wrapper. This is the ONLY place that touches persistent storage.
// Everything is defensive: corrupted JSON, missing fields, and empty storage
// all resolve to safe defaults and never throw.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_GOAL_ML, clamp, toNumber } from "../utils/format";
import { isValidDateString, isValidTimeString } from "../utils/date";

export const STORAGE_KEY = "@aquameter_daily/app_data_v1";

export const defaultSettings = {
  onboardingCompleted: false,
  dailyGoalMl: DEFAULT_GOAL_ML,
  unit: "ml",
  compactMode: false,
};

export const defaultAppData = {
  version: 1,
  entries: [],
  settings: { ...defaultSettings },
};

// Sanitize one entry into a known-good shape. Returns null if unusable.
function sanitizeEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = typeof raw.id === "string" && raw.id ? raw.id : null;
  if (!id) return null;

  const date = isValidDateString(raw.date) ? raw.date : null;
  if (!date) return null;

  const time = isValidTimeString(raw.time) ? raw.time : "00:00";
  const amountMl = Math.max(0, Math.round(toNumber(raw.amountMl, 0)));
  const label = typeof raw.label === "string" ? raw.label.slice(0, 60) : "";
  const source = raw.source === "custom" ? "custom" : "quick";
  const createdAt =
    typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString();
  const updatedAt =
    typeof raw.updatedAt === "string" ? raw.updatedAt : createdAt;

  return { id, date, time, amountMl, label, source, createdAt, updatedAt };
}

// Merge loaded (untrusted) data with defaults, sanitizing everything.
export function normalizeAppData(raw) {
  const safe = raw && typeof raw === "object" ? raw : {};
  const rawEntries = Array.isArray(safe.entries) ? safe.entries : [];
  const entries = rawEntries
    .map(sanitizeEntry)
    .filter((e) => e !== null);

  const rawSettings =
    safe.settings && typeof safe.settings === "object" ? safe.settings : {};

  const settings = {
    onboardingCompleted: rawSettings.onboardingCompleted === true,
    dailyGoalMl: clamp(
      toNumber(rawSettings.dailyGoalMl, DEFAULT_GOAL_ML),
      1,
      10000
    ),
    unit: rawSettings.unit === "oz" ? "oz" : "ml",
    compactMode: rawSettings.compactMode === true,
  };
  // If goal came in as 0 / invalid, clamp already forced >= 1, but keep a sane
  // default rather than 1 ml when clearly missing.
  if (!Number.isFinite(toNumber(rawSettings.dailyGoalMl, NaN))) {
    settings.dailyGoalMl = DEFAULT_GOAL_ML;
  }

  return { version: 1, entries, settings };
}

// Load app data. Never throws.
export async function loadAppData() {
  try {
    const rawStr = await AsyncStorage.getItem(STORAGE_KEY);
    if (!rawStr) {
      return { version: 1, entries: [], settings: { ...defaultSettings } };
    }
    let parsed = null;
    try {
      parsed = JSON.parse(rawStr);
    } catch (parseErr) {
      // Corrupted JSON -> safe fallback.
      return { version: 1, entries: [], settings: { ...defaultSettings } };
    }
    return normalizeAppData(parsed);
  } catch (e) {
    return { version: 1, entries: [], settings: { ...defaultSettings } };
  }
}

// Save app data. Never throws; returns true on success, false otherwise.
export async function saveAppData(appData) {
  try {
    const normalized = normalizeAppData(appData);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return true;
  } catch (e) {
    return false;
  }
}

// Remove everything AquaMeter stores.
export async function clearAllData() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    return false;
  }
}
