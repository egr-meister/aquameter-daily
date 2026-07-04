import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import Constants from "expo-constants";
import { useApp } from "../context/AppContext";
import { Row, Divider, SectionLabel } from "../components/UI";
import colors from "../theme/colors";
import { unitLabel, formatAmountWithUnit } from "../utils/format";
import { todayString } from "../utils/date";

export default function SettingsScreen({ navigation }) {
  const {
    unit,
    dailyGoalMl,
    settings,
    setCompactMode,
    setOnboardingCompleted,
    resetDay,
    deleteAllRecords,
    resetAllData,
  } = useApp();

  const compact = settings?.compactMode === true;
  const version =
    Constants?.expoConfig?.version ||
    Constants?.manifest?.version ||
    "1.0.0";

  const chevron = <Text style={styles.chevron}>›</Text>;

  const onResetToday = useCallback(() => {
    const today = todayString();
    Alert.alert(
      "Reset today?",
      "This will remove all water entries for today.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => resetDay(today),
        },
      ],
      { cancelable: true }
    );
  }, [resetDay]);

  const onDeleteAllRecords = useCallback(() => {
    Alert.alert(
      "Delete all water records?",
      "This removes every water entry from all days. Your goal and unit settings are kept.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete all",
          style: "destructive",
          onPress: () => deleteAllRecords(),
        },
      ],
      { cancelable: true }
    );
  }, [deleteAllRecords]);

  const onResetAll = useCallback(() => {
    Alert.alert(
      "Reset all local data?",
      "This erases every water entry and restores default goal and unit settings on this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset everything",
          style: "destructive",
          onPress: async () => {
            await resetAllData();
          },
        },
      ],
      { cancelable: true }
    );
  }, [resetAllData]);

  const onShowOnboarding = useCallback(() => {
    setOnboardingCompleted(false);
    navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] });
  }, [setOnboardingCompleted, navigation]);

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <SectionLabel>Counter</SectionLabel>
      <View style={styles.group}>
        <Row
          title="Daily goal"
          subtitle={`Currently ${formatAmountWithUnit(dailyGoalMl, unit)}`}
          right={chevron}
          onPress={() => navigation.navigate("GoalSettings")}
        />
        <Divider style={styles.rowDivider} />
        <Row
          title="Units"
          subtitle={`Currently ${unitLabel(unit)}`}
          right={chevron}
          onPress={() => navigation.navigate("UnitSettings")}
        />
        <Divider style={styles.rowDivider} />
        <Row
          title="Compact mode"
          subtitle="Smaller counter and meter card"
          right={
            <Switch
              value={compact}
              onValueChange={(v) => setCompactMode(v)}
              trackColor={{ true: colors.accent, false: colors.progressTrack }}
              thumbColor={colors.white}
            />
          }
        />
        <Divider style={styles.rowDivider} />
        <Row
          title="Show onboarding again"
          subtitle="View the welcome screens next launch"
          right={chevron}
          onPress={onShowOnboarding}
        />
      </View>

      <SectionLabel style={styles.sectionSpace}>Data</SectionLabel>
      <View style={styles.group}>
        <Row
          title="Reset selected day"
          subtitle="Remove all entries for today"
          right={chevron}
          onPress={onResetToday}
          tone="danger"
        />
        <Divider style={styles.rowDivider} />
        <Row
          title="Delete all water records"
          subtitle="Keep settings, remove every entry"
          right={chevron}
          onPress={onDeleteAllRecords}
          tone="danger"
        />
        <Divider style={styles.rowDivider} />
        <Row
          title="Reset all local data"
          subtitle="Erase entries and restore defaults"
          right={chevron}
          onPress={onResetAll}
          tone="danger"
        />
      </View>

      <SectionLabel style={styles.sectionSpace}>About</SectionLabel>
      <View style={styles.group}>
        <Row title="App" subtitle={`AquaMeter Daily · v${version}`} />
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>Manual tracking</Text>
        <Text style={styles.noteText}>
          AquaMeter Daily is a manual water counter. It does not detect drinking
          automatically and does not connect to Health Connect, Google Fit,
          sensors, or wearable devices.
        </Text>
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>Privacy</Text>
        <Text style={styles.noteText}>
          AquaMeter Daily stores water entries, goals, units, history, and
          progress data only on this device. No account, no ads, no analytics,
          no internet connection, no sensors, no Google Fit, no Health Connect,
          and no notification permission.
        </Text>
      </View>

      <Text style={styles.footerNote}>
        Not a medical app. It does not provide medical advice or diagnose any
        condition.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  sectionSpace: { marginTop: 22 },
  group: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: "hidden",
  },
  rowDivider: { marginVertical: 0, marginHorizontal: 16 },
  chevron: { fontSize: 24, color: colors.tick, fontWeight: "400" },
  noteBox: {
    backgroundColor: colors.panel,
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 6,
  },
  noteText: { fontSize: 13, color: colors.text, lineHeight: 19 },
  footerNote: {
    fontSize: 12,
    color: colors.textSoft,
    marginTop: 18,
    textAlign: "center",
    lineHeight: 17,
  },
});
