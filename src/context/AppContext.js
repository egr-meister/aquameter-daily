// Central app state. Owns the entries + settings, persists to AsyncStorage,
// and exposes safe mutation helpers used by every screen.

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  loadAppData,
  saveAppData,
  clearAllData,
  defaultSettings,
} from "../storage/storage";
import { clamp, toNumber, DEFAULT_GOAL_ML } from "../utils/format";
import { isValidDateString, isValidTimeString, todayString, nowTimeString } from "../utils/date";
import { makeId } from "../utils/id";
import { lastEntryForDate } from "../utils/water";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState({ ...defaultSettings });
  const saveTimer = useRef(null);

  // Initial load.
  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await loadAppData();
      if (!mounted) return;
      setEntries(Array.isArray(data?.entries) ? data.entries : []);
      setSettings({ ...defaultSettings, ...(data?.settings ?? {}) });
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Persist (debounced) whenever data changes after initial load.
  useEffect(() => {
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveAppData({ version: 1, entries, settings });
    }, 250);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [entries, settings, ready]);

  // ---- Settings mutations ----

  const setUnit = useCallback((unit) => {
    setSettings((s) => ({ ...s, unit: unit === "oz" ? "oz" : "ml" }));
  }, []);

  const setGoalMl = useCallback((goalMl) => {
    const clamped = clamp(toNumber(goalMl, DEFAULT_GOAL_ML), 1, 10000);
    setSettings((s) => ({ ...s, dailyGoalMl: clamped }));
  }, []);

  const resetGoal = useCallback(() => {
    setSettings((s) => ({ ...s, dailyGoalMl: DEFAULT_GOAL_ML }));
  }, []);

  const setCompactMode = useCallback((value) => {
    setSettings((s) => ({ ...s, compactMode: value === true }));
  }, []);

  const setOnboardingCompleted = useCallback((value) => {
    setSettings((s) => ({ ...s, onboardingCompleted: value === true }));
  }, []);

  // ---- Entry mutations ----

  // Add an entry. Returns the created entry (or null on invalid input).
  const addEntry = useCallback(
    ({ amountMl, date, time, label, source }) => {
      const amount = Math.round(toNumber(amountMl, 0));
      if (!(amount > 0)) return null;

      const safeDate = isValidDateString(date) ? date : todayString();
      const safeTime = isValidTimeString(time) ? time : nowTimeString();
      const nowIso = new Date().toISOString();

      const entry = {
        id: makeId(),
        date: safeDate,
        time: safeTime,
        amountMl: amount,
        label: typeof label === "string" ? label.slice(0, 60) : "",
        source: source === "custom" ? "custom" : "quick",
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setEntries((list) => [...(Array.isArray(list) ? list : []), entry]);
      return entry;
    },
    []
  );

  // Update an existing entry by id. No-op if it no longer exists.
  const updateEntry = useCallback((id, changes) => {
    if (!id) return;
    setEntries((list) => {
      const arr = Array.isArray(list) ? list : [];
      const idx = arr.findIndex((e) => e?.id === id);
      if (idx === -1) return arr; // gone -> safe no-op
      const prev = arr[idx];
      const next = { ...prev };

      if (changes?.date !== undefined && isValidDateString(changes.date)) {
        next.date = changes.date;
      }
      if (changes?.time !== undefined && isValidTimeString(changes.time)) {
        next.time = changes.time;
      }
      if (changes?.amountMl !== undefined) {
        const amount = Math.round(toNumber(changes.amountMl, prev?.amountMl ?? 0));
        if (amount > 0) next.amountMl = amount;
      }
      if (changes?.label !== undefined && typeof changes.label === "string") {
        next.label = changes.label.slice(0, 60);
      }
      next.updatedAt = new Date().toISOString();

      const copy = [...arr];
      copy[idx] = next;
      return copy;
    });
  }, []);

  // Delete an entry by id. Safe if missing.
  const deleteEntry = useCallback((id) => {
    if (!id) return;
    setEntries((list) => {
      const arr = Array.isArray(list) ? list : [];
      return arr.filter((e) => e?.id !== id);
    });
  }, []);

  // Undo (delete) the most recent entry for a date. Safe if none.
  const undoLastForDate = useCallback((date) => {
    setEntries((list) => {
      const arr = Array.isArray(list) ? list : [];
      const last = lastEntryForDate(arr, date);
      if (!last) return arr; // nothing to undo
      return arr.filter((e) => e?.id !== last.id);
    });
  }, []);

  // Reset a day: delete all entries for that date. Safe if none.
  const resetDay = useCallback((date) => {
    setEntries((list) => {
      const arr = Array.isArray(list) ? list : [];
      return arr.filter((e) => e?.date !== date);
    });
  }, []);

  // Delete every water record but keep settings.
  const deleteAllRecords = useCallback(() => {
    setEntries([]);
  }, []);

  // Full wipe: entries + settings back to defaults, and clear storage.
  const resetAllData = useCallback(async () => {
    setEntries([]);
    setSettings({ ...defaultSettings });
    await clearAllData();
  }, []);

  const value = useMemo(
    () => ({
      ready,
      entries,
      settings,
      unit: settings?.unit ?? "ml",
      dailyGoalMl: Math.max(1, toNumber(settings?.dailyGoalMl, DEFAULT_GOAL_ML)),
      // settings
      setUnit,
      setGoalMl,
      resetGoal,
      setCompactMode,
      setOnboardingCompleted,
      // entries
      addEntry,
      updateEntry,
      deleteEntry,
      undoLastForDate,
      resetDay,
      deleteAllRecords,
      resetAllData,
    }),
    [
      ready,
      entries,
      settings,
      setUnit,
      setGoalMl,
      resetGoal,
      setCompactMode,
      setOnboardingCompleted,
      addEntry,
      updateEntry,
      deleteEntry,
      undoLastForDate,
      resetDay,
      deleteAllRecords,
      resetAllData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    // Defensive fallback so screens never crash if used outside provider.
    return {
      ready: false,
      entries: [],
      settings: { ...defaultSettings },
      unit: "ml",
      dailyGoalMl: DEFAULT_GOAL_ML,
      setUnit: () => {},
      setGoalMl: () => {},
      resetGoal: () => {},
      setCompactMode: () => {},
      setOnboardingCompleted: () => {},
      addEntry: () => null,
      updateEntry: () => {},
      deleteEntry: () => {},
      undoLastForDate: () => {},
      resetDay: () => {},
      deleteAllRecords: () => {},
      resetAllData: async () => {},
    };
  }
  return ctx;
}

export default AppContext;
