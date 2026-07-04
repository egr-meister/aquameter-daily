import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useApp } from "../context/AppContext";
import { Badge } from "../components/UI";
import colors from "../theme/colors";
import {
  formatAmountWithUnit,
  progressPercent,
  toNumber,
} from "../utils/format";
import { formatDateLabel, isToday } from "../utils/date";
import { historyDates, daySummary } from "../utils/water";

export default function HistoryScreen({ navigation }) {
  const { entries, unit, dailyGoalMl } = useApp();
  const goalMl = Math.max(1, toNumber(dailyGoalMl, 2000));

  const summaries = useMemo(() => {
    const dates = historyDates(entries);
    return dates.map((d) => daySummary(entries, d, goalMl));
  }, [entries, goalMl]);

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Past meter readings</Text>

      {summaries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No water history yet.</Text>
          <Text style={styles.emptySub}>
            Add water on the home screen to start your history.
          </Text>
        </View>
      ) : (
        summaries.map((s) => {
          const percent = progressPercent(s.totalMl, goalMl);
          return (
            <TouchableOpacity
              key={s.date}
              activeOpacity={0.85}
              style={styles.card}
              onPress={() => navigation.navigate("DayDetail", { date: s.date })}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardDate}>
                  {formatDateLabel(s.date)}
                  {isToday(s.date) ? "  •  Today" : ""}
                </Text>
                {s.goalReached ? (
                  <Badge text="Goal" tone="success" />
                ) : null}
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.cardTotal}>
                  {formatAmountWithUnit(s.totalMl, unit)}
                </Text>
                <Text style={styles.cardMeta}>
                  {percent}% · {s.entryCount}{" "}
                  {s.entryCount === 1 ? "entry" : "entries"}
                </Text>
              </View>
              <View style={styles.miniTrack}>
                <View
                  style={[
                    styles.miniFill,
                    { width: `${Math.min(100, percent)}%` },
                    s.goalReached && styles.miniFillReached,
                  ]}
                />
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 14 },
  empty: {
    backgroundColor: colors.panel,
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: { color: colors.text, fontSize: 16, fontWeight: "700" },
  emptySub: {
    color: colors.textSoft,
    fontSize: 13.5,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 19,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardDate: { fontSize: 14.5, fontWeight: "700", color: colors.text, flex: 1 },
  cardBottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
  cardTotal: { fontSize: 26, fontWeight: "800", color: colors.text },
  cardMeta: { fontSize: 13, color: colors.textSoft, marginBottom: 4 },
  miniTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.progressTrack,
    overflow: "hidden",
  },
  miniFill: {
    height: "100%",
    backgroundColor: colors.progress,
    borderRadius: 4,
  },
  miniFillReached: { backgroundColor: colors.success },
});
