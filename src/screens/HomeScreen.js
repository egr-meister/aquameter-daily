import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import colors from "../theme/colors";
import {
  formatAmount,
  formatAmountWithUnit,
  unitLabel,
  mlToOz,
  roundOz,
  roundMl,
  progressPercent,
  progressRatio,
  toNumber,
} from "../utils/format";
import { todayString, formatDateLabel, nowTimeString } from "../utils/date";
import { totalMlForDate, lastEntryForDate } from "../utils/water";

// Quick amounts are defined in ml (source of truth).
const QUICK_AMOUNTS_ML = [150, 250, 330, 500];

export default function HomeScreen({ navigation }) {
  const {
    entries,
    unit,
    dailyGoalMl,
    compactMode,
    settings,
    addEntry,
    undoLastForDate,
    resetDay,
  } = useApp();

  const [notice, setNotice] = useState("");
  const [canUndoJustAdded, setCanUndoJustAdded] = useState(false);

  const today = todayString();

  const totalMl = useMemo(
    () => totalMlForDate(entries, today),
    [entries, today]
  );

  const lastEntry = useMemo(
    () => lastEntryForDate(entries, today),
    [entries, today]
  );

  const goalMl = Math.max(1, toNumber(dailyGoalMl, 2000));
  const percent = progressPercent(totalMl, goalMl);
  const ratio = progressRatio(totalMl, goalMl);
  const remainingMl = Math.max(0, goalMl - totalMl);
  const reached = totalMl >= goalMl;
  const compact = settings?.compactMode === true;

  const showNotice = useCallback((msg) => {
    setNotice(msg);
  }, []);

  const handleQuickAdd = useCallback(
    (amountMl) => {
      const created = addEntry({
        amountMl,
        date: today,
        time: nowTimeString(),
        label: "",
        source: "quick",
      });
      if (created) {
        setCanUndoJustAdded(true);
        showNotice(`Added ${formatAmountWithUnit(amountMl, unit)}`);
      }
    },
    [addEntry, today, unit, showNotice]
  );

  const handleUndo = useCallback(() => {
    const last = lastEntryForDate(entries, today);
    if (!last) {
      showNotice("Nothing to undo for today.");
      setCanUndoJustAdded(false);
      return;
    }
    undoLastForDate(today);
    showNotice("Last entry removed.");
    setCanUndoJustAdded(false);
  }, [entries, today, undoLastForDate, showNotice]);

  const handleReset = useCallback(() => {
    navigation.navigate("DayDetail", { date: today, confirmReset: false });
  }, [navigation, today]);

  const displayTotal = formatAmount(totalMl, unit);
  const u = unitLabel(unit);

  const goalDisplay = formatAmountWithUnit(goalMl, unit);
  const remainingDisplay = formatAmountWithUnit(remainingMl, unit);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Compact header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>AquaMeter Daily</Text>
          <Text style={styles.headerDate}>{formatDateLabel(today)}</Text>
        </View>
        <TouchableOpacity
          style={styles.gearBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Settings")}
          accessibilityLabel="Settings"
        >
          <View style={styles.gearOuter}>
            <View style={styles.gearInner} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Manual counter tag */}
        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>MANUAL COUNTER</Text>
          </View>
        </View>

        {/* The big meter — visual center of the screen */}
        <View style={[styles.meterCard, compact && styles.meterCardCompact]}>
          <View style={styles.counterRow}>
            <Text style={[styles.counter, compact && styles.counterCompact]}>
              {displayTotal}
            </Text>
            <Text style={styles.counterUnit}>{u}</Text>
          </View>

          {totalMl <= 0 ? (
            <Text style={styles.emptyToday}>No water added today.</Text>
          ) : (
            <Text style={styles.subCounter}>
              {reached ? "Goal reached" : `${remainingDisplay} left`}
            </Text>
          )}

          {/* Thin meter strip with tick marks */}
          <View style={styles.meterStripWrap}>
            <View style={styles.meterTrack}>
              <View
                style={[
                  styles.meterFill,
                  { width: `${Math.round(ratio * 100)}%` },
                  reached && styles.meterFillReached,
                ]}
              />
            </View>
            <View style={styles.ticks} pointerEvents="none">
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={styles.tick} />
              ))}
            </View>
          </View>

          {/* small reading labels */}
          <View style={styles.readings}>
            <View style={styles.reading}>
              <Text style={styles.readingValue}>{percent}%</Text>
              <Text style={styles.readingLabel}>complete</Text>
            </View>
            <View style={styles.readingDivider} />
            <View style={styles.reading}>
              <Text style={styles.readingValue}>{goalDisplay}</Text>
              <Text style={styles.readingLabel}>goal</Text>
            </View>
            <View style={styles.readingDivider} />
            <View style={styles.reading}>
              <Text style={styles.readingValue}>
                {reached ? "0 " + u : remainingDisplay}
              </Text>
              <Text style={styles.readingLabel}>remaining</Text>
            </View>
          </View>

          {reached ? (
            <View style={styles.reachedBanner}>
              <Text style={styles.reachedText}>Goal reached for today</Text>
            </View>
          ) : null}
        </View>

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        {/* Quick add controls */}
        <Text style={styles.controlsHint}>Tap an amount to add water</Text>
        <View style={styles.chipsRow}>
          {QUICK_AMOUNTS_ML.map((amt) => (
            <TouchableOpacity
              key={amt}
              style={styles.chip}
              activeOpacity={0.8}
              onPress={() => handleQuickAdd(amt)}
            >
              <Text style={styles.chipValue}>
                {unit === "oz" ? roundOz(mlToOz(amt)) : roundMl(amt)}
              </Text>
              <Text style={styles.chipUnit}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Secondary controls */}
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            style={styles.secondaryCtrl}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("CustomInput", { date: today })}
          >
            <Text style={styles.secondaryCtrlText}>+ Custom</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryCtrl, !lastEntry && styles.ctrlMuted]}
            activeOpacity={0.8}
            onPress={handleUndo}
          >
            <Text
              style={[
                styles.secondaryCtrlText,
                !lastEntry && styles.ctrlMutedText,
              ]}
            >
              Undo last
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryCtrl, styles.ctrlDanger]}
            activeOpacity={0.8}
            onPress={handleReset}
          >
            <Text style={[styles.secondaryCtrlText, styles.ctrlDangerText]}>
              Reset day
            </Text>
          </TouchableOpacity>
        </View>

        {/* Below-meter shortcuts */}
        <View style={styles.shortcutsRow}>
          <TouchableOpacity
            style={styles.shortcut}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("History")}
          >
            <Text style={styles.shortcutTitle}>History</Text>
            <Text style={styles.shortcutSub}>Past meter readings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shortcut}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("ProgressChart")}
          >
            <Text style={styles.shortcutTitle}>Progress</Text>
            <Text style={styles.shortcutSub}>7-day meter trend</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate("DayDetail", { date: today })}
          style={styles.detailLink}
        >
          <Text style={styles.detailLinkText}>
            View today's entries ({totalMlForDate(entries, today) > 0
              ? lastEntry
                ? entriesCountLabel(entries, today)
                : "0 entries"
              : "0 entries"})
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function entriesCountLabel(entries, date) {
  const list = Array.isArray(entries) ? entries : [];
  const n = list.filter((e) => e?.date === date).length;
  return `${n} ${n === 1 ? "entry" : "entries"}`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  appTitle: { fontSize: 19, fontWeight: "800", color: colors.text },
  headerDate: { fontSize: 12.5, color: colors.textSoft, marginTop: 2 },
  gearBtn: { padding: 4 },
  gearOuter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2.5,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  gearInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 34 },
  tagRow: { alignItems: "center", marginTop: 2, marginBottom: 10 },
  tag: {
    backgroundColor: colors.panel,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: colors.accentDark,
  },
  meterCard: {
    backgroundColor: colors.panelAlt,
    borderRadius: 22,
    paddingVertical: 26,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
  },
  meterCardCompact: { paddingVertical: 18 },
  counterRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  counter: {
    fontSize: 78,
    fontWeight: "800",
    color: colors.text,
    lineHeight: 84,
    letterSpacing: -2,
  },
  counterCompact: { fontSize: 60, lineHeight: 64 },
  counterUnit: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.accentDark,
    marginBottom: 12,
    marginLeft: 8,
  },
  emptyToday: { fontSize: 15, color: colors.textSoft, marginTop: 2 },
  subCounter: {
    fontSize: 16,
    color: colors.accentDark,
    fontWeight: "700",
    marginTop: 2,
  },
  meterStripWrap: { width: "100%", marginTop: 20, marginBottom: 6 },
  meterTrack: {
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.progressTrack,
    overflow: "hidden",
    width: "100%",
  },
  meterFill: {
    height: "100%",
    backgroundColor: colors.progress,
    borderRadius: 7,
  },
  meterFillReached: { backgroundColor: colors.success },
  ticks: {
    position: "absolute",
    top: -4,
    left: "20%",
    right: "20%",
    height: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tick: { width: 2, height: 6, backgroundColor: colors.tick, borderRadius: 1 },
  readings: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 18,
  },
  reading: { flex: 1, alignItems: "center" },
  readingValue: { fontSize: 15, fontWeight: "700", color: colors.text },
  readingLabel: { fontSize: 11.5, color: colors.textSoft, marginTop: 3 },
  readingDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.divider,
  },
  reachedBanner: {
    marginTop: 18,
    backgroundColor: colors.successBg,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  reachedText: { color: colors.success, fontWeight: "700", fontSize: 13.5 },
  notice: {
    textAlign: "center",
    color: colors.accentDark,
    fontSize: 13,
    marginTop: 12,
  },
  controlsHint: {
    fontSize: 13,
    color: colors.textSoft,
    marginTop: 22,
    marginBottom: 10,
    fontWeight: "600",
  },
  chipsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chip: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.chipBorder,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  chipValue: { fontSize: 20, fontWeight: "800", color: colors.accentDark },
  chipUnit: { fontSize: 12, color: colors.textSoft, marginTop: 2 },
  secondaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  secondaryCtrl: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: colors.panelAlt,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.divider,
  },
  secondaryCtrlText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: colors.accentDark,
  },
  ctrlMuted: { opacity: 0.5 },
  ctrlMutedText: { color: colors.textSoft },
  ctrlDanger: { borderColor: colors.dangerBg },
  ctrlDangerText: { color: colors.danger },
  shortcutsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  shortcut: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: colors.panel,
    borderRadius: 16,
    padding: 16,
  },
  shortcutTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
  shortcutSub: { fontSize: 12.5, color: colors.textSoft, marginTop: 4 },
  detailLink: { marginTop: 18, alignItems: "center" },
  detailLinkText: {
    fontSize: 14,
    color: colors.accentDark,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
