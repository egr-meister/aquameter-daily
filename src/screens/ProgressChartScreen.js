import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useApp } from "../context/AppContext";
import colors from "../theme/colors";
import {
  formatAmountWithUnit,
  toNumber,
} from "../utils/format";
import { formatWeekday, formatShortDate } from "../utils/date";
import { chartData, chartStats } from "../utils/water";

export default function ProgressChartScreen() {
  const { entries, unit, dailyGoalMl } = useApp();
  const goalMl = Math.max(1, toNumber(dailyGoalMl, 2000));
  const [range, setRange] = useState(7);

  const data = useMemo(
    () => chartData(entries, range, goalMl),
    [entries, range, goalMl]
  );
  const stats = useMemo(() => chartStats(data, goalMl), [data, goalMl]);

  const maxMl = Math.max(1, stats.maxMl);
  const CHART_HEIGHT = 160;
  const showEveryLabel = range <= 7;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
    >
      {/* Range toggle */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, range === 7 && styles.toggleActive]}
          activeOpacity={0.8}
          onPress={() => setRange(7)}
        >
          <Text style={[styles.toggleText, range === 7 && styles.toggleTextActive]}>
            Last 7 days
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, range === 30 && styles.toggleActive]}
          activeOpacity={0.8}
          onPress={() => setRange(30)}
        >
          <Text style={[styles.toggleText, range === 30 && styles.toggleTextActive]}>
            Last 30 days
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chart card */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Meter trend</Text>
        <View style={[styles.chartArea, { height: CHART_HEIGHT + 34 }]}>
          {/* goal marker line */}
          <View
            style={[
              styles.goalMarker,
              { bottom: 26 + (Math.min(goalMl, maxMl) / maxMl) * CHART_HEIGHT },
            ]}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.barsRow}
          >
            {data.map((d, idx) => {
              const h = Math.max(
                2,
                Math.round((Math.min(d.totalMl, maxMl) / maxMl) * CHART_HEIGHT)
              );
              return (
                <View key={d.date} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        { height: h },
                        d.goalReached && styles.barReached,
                        range > 7 && styles.barThin,
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel} numberOfLines={1}>
                    {showEveryLabel
                      ? formatWeekday(d.date)
                      : idx % 5 === 0
                      ? formatShortDate(d.date)
                      : ""}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.progress }]} />
            <Text style={styles.legendText}>Below goal</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={styles.legendText}>Goal reached</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendLine} />
            <Text style={styles.legendText}>Goal</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <Text style={styles.rangeLabel}>
        {range === 7 ? "Last 7 days" : "Last 30 days"}
      </Text>
      <View style={styles.statsGrid}>
        <StatCell
          label="Daily average"
          value={formatAmountWithUnit(stats.averageMl, unit)}
        />
        <StatCell
          label="Best day"
          value={formatAmountWithUnit(stats.bestMl, unit)}
        />
        <StatCell
          label="Goal days"
          value={`${stats.goalDays} of ${stats.totalDays}`}
        />
        <StatCell
          label="Daily goal"
          value={formatAmountWithUnit(goalMl, unit)}
        />
      </View>

      <Text style={styles.note}>
        Missing days are counted as 0. Data is calculated only from your local
        entries.
      </Text>
    </ScrollView>
  );
}

function StatCell({ label, value }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  toggle: {
    flexDirection: "row",
    backgroundColor: colors.panel,
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: "center",
  },
  toggleActive: { backgroundColor: colors.white },
  toggleText: { fontSize: 14, color: colors.textSoft, fontWeight: "700" },
  toggleTextActive: { color: colors.accentDark },
  chartCard: {
    backgroundColor: colors.panelAlt,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSoft,
    marginBottom: 10,
  },
  chartArea: { justifyContent: "flex-end" },
  goalMarker: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 0,
    borderTopWidth: 1.5,
    borderTopColor: colors.accent,
    borderStyle: "dashed",
    zIndex: 1,
  },
  barsRow: { alignItems: "flex-end", paddingRight: 4 },
  barCol: { alignItems: "center", width: 34 },
  barTrack: {
    height: 160,
    justifyContent: "flex-end",
  },
  bar: {
    width: 18,
    backgroundColor: colors.progress,
    borderRadius: 5,
  },
  barThin: { width: 8, borderRadius: 3 },
  barReached: { backgroundColor: colors.success },
  barLabel: {
    fontSize: 10.5,
    color: colors.textSoft,
    marginTop: 8,
    height: 14,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 5 },
  legendLine: {
    width: 14,
    height: 0,
    borderTopWidth: 1.5,
    borderTopColor: colors.accent,
    borderStyle: "dashed",
    marginRight: 5,
  },
  legendText: { fontSize: 11.5, color: colors.textSoft },
  rangeLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginTop: 22,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCell: {
    width: "48%",
    backgroundColor: colors.panel,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  statValue: { fontSize: 18, fontWeight: "800", color: colors.text },
  statLabel: { fontSize: 12.5, color: colors.textSoft, marginTop: 4 },
  note: {
    fontSize: 12.5,
    color: colors.textSoft,
    marginTop: 6,
    lineHeight: 18,
  },
});
