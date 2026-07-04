import React, { useMemo, useCallback, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useApp } from "../context/AppContext";
import { MeterStrip, SecondaryButton, Badge } from "../components/UI";
import colors from "../theme/colors";
import {
  formatAmount,
  formatAmountWithUnit,
  unitLabel,
  progressPercent,
  progressRatio,
  toNumber,
} from "../utils/format";
import {
  todayString,
  formatDateLabel,
  isValidDateString,
} from "../utils/date";
import {
  sortedEntriesForDate,
  totalMlForDate,
} from "../utils/water";

export default function DayDetailScreen({ navigation, route }) {
  const { entries, unit, dailyGoalMl, resetDay } = useApp();

  const paramDate = route?.params?.date;
  const date = isValidDateString(paramDate) ? paramDate : todayString();

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Day Detail" });
  }, [navigation]);

  const dayEntries = useMemo(
    () => sortedEntriesForDate(entries, date),
    [entries, date]
  );
  const totalMl = useMemo(
    () => totalMlForDate(entries, date),
    [entries, date]
  );

  const goalMl = Math.max(1, toNumber(dailyGoalMl, 2000));
  const percent = progressPercent(totalMl, goalMl);
  const ratio = progressRatio(totalMl, goalMl);
  const reached = totalMl >= goalMl;
  const u = unitLabel(unit);

  const onReset = useCallback(() => {
    Alert.alert(
      "Reset this day?",
      "This will remove all water entries for the selected day.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => resetDay(date),
        },
      ],
      { cancelable: true }
    );
  }, [resetDay, date]);

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.date}>{formatDateLabel(date)}</Text>

      <View style={styles.summaryCard}>
        <View style={styles.totalRow}>
          <Text style={styles.total}>{formatAmount(totalMl, unit)}</Text>
          <Text style={styles.totalUnit}>{u}</Text>
        </View>
        <View style={styles.badgeRow}>
          <Text style={styles.percent}>{percent}% of goal</Text>
          {reached ? <Badge text="Goal reached" tone="success" /> : null}
        </View>
        <MeterStrip ratio={ratio} reached={reached} />
        <Text style={styles.goalLine}>
          Goal: {formatAmountWithUnit(goalMl, unit)}
        </Text>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>
          Entries ({dayEntries.length})
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Entry", { date })}
        >
          <Text style={styles.addLink}>+ Add entry</Text>
        </TouchableOpacity>
      </View>

      {dayEntries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No water entries for this day.</Text>
        </View>
      ) : (
        dayEntries.map((entry) => (
          <TouchableOpacity
            key={entry.id}
            activeOpacity={0.8}
            style={styles.entryRow}
            onPress={() => navigation.navigate("Entry", { id: entry.id })}
          >
            <View style={styles.entryLeft}>
              <Text style={styles.entryTime}>{entry.time}</Text>
              <View
                style={[
                  styles.sourceDot,
                  entry.source === "custom" && styles.sourceDotCustom,
                ]}
              />
            </View>
            <View style={styles.entryMid}>
              <Text style={styles.entryAmount}>
                {formatAmountWithUnit(entry.amountMl, unit)}
              </Text>
              {entry.label ? (
                <Text style={styles.entryLabel} numberOfLines={1}>
                  {entry.label}
                </Text>
              ) : (
                <Text style={styles.entrySource}>
                  {entry.source === "custom" ? "Custom" : "Quick add"}
                </Text>
              )}
            </View>
            <Text style={styles.entryChevron}>Edit</Text>
          </TouchableOpacity>
        ))
      )}

      <SecondaryButton
        title="Reset This Day"
        tone="danger"
        onPress={onReset}
        style={styles.resetBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  date: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 14 },
  summaryCard: {
    backgroundColor: colors.panelAlt,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  totalRow: { flexDirection: "row", alignItems: "flex-end" },
  total: {
    fontSize: 46,
    fontWeight: "800",
    color: colors.text,
    lineHeight: 50,
  },
  totalUnit: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.accentDark,
    marginLeft: 6,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 12,
  },
  percent: { fontSize: 14, color: colors.textSoft, fontWeight: "600" },
  goalLine: { fontSize: 13, color: colors.textSoft, marginTop: 12 },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 10,
  },
  listHeaderText: { fontSize: 16, fontWeight: "800", color: colors.text },
  addLink: { fontSize: 14, color: colors.accentDark, fontWeight: "700" },
  empty: {
    backgroundColor: colors.panel,
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
  },
  emptyText: { color: colors.textSoft, fontSize: 14.5 },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  entryLeft: { flexDirection: "row", alignItems: "center", width: 64 },
  entryTime: { fontSize: 14, fontWeight: "700", color: colors.text },
  sourceDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginLeft: 6,
  },
  sourceDotCustom: { backgroundColor: colors.progress },
  entryMid: { flex: 1, paddingHorizontal: 12 },
  entryAmount: { fontSize: 16, fontWeight: "700", color: colors.text },
  entryLabel: { fontSize: 12.5, color: colors.textSoft, marginTop: 2 },
  entrySource: { fontSize: 12.5, color: colors.textSoft, marginTop: 2 },
  entryChevron: { fontSize: 13.5, color: colors.accentDark, fontWeight: "700" },
  resetBtn: { marginTop: 22 },
});
