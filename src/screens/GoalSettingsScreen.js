import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useApp } from "../context/AppContext";
import { PrimaryButton, SecondaryButton } from "../components/UI";
import colors from "../theme/colors";
import {
  unitLabel,
  displayValueToMl,
  mlToDisplayValue,
  toNumber,
  mlToOz,
  roundOz,
  MAX_GOAL_ML,
  DEFAULT_GOAL_ML,
} from "../utils/format";

// Suggested presets in ml.
const PRESETS_ML = [1500, 2000, 2500, 3000];

export default function GoalSettingsScreen({ navigation }) {
  const { unit, dailyGoalMl, setGoalMl, resetGoal } = useApp();
  const u = unitLabel(unit);

  const [goalText, setGoalText] = useState(
    String(mlToDisplayValue(dailyGoalMl, unit))
  );
  const [error, setError] = useState("");

  const maxDisplay = unit === "oz" ? roundOz(mlToOz(MAX_GOAL_ML)) : MAX_GOAL_ML;

  const onSave = useCallback(() => {
    const raw = (goalText || "").trim().replace(",", ".");
    const value = toNumber(raw, NaN);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Goal must be greater than 0.");
      return;
    }
    const goalMl = displayValueToMl(value, unit);
    if (!(goalMl > 0)) {
      setError("Goal must be greater than 0.");
      return;
    }
    if (goalMl > MAX_GOAL_ML) {
      setError(`Goal cannot exceed ${maxDisplay} ${u}.`);
      return;
    }
    setGoalMl(goalMl);
    navigation.goBack();
  }, [goalText, unit, setGoalMl, navigation, maxDisplay, u]);

  const onReset = useCallback(() => {
    resetGoal();
    setGoalText(String(mlToDisplayValue(DEFAULT_GOAL_ML, unit)));
    setError("");
  }, [resetGoal, unit]);

  const applyPreset = useCallback(
    (ml) => {
      setGoalText(String(mlToDisplayValue(ml, unit)));
      setError("");
    },
    [unit]
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Daily water goal</Text>
        <Text style={styles.sub}>
          Set how much water you want to log each day.
        </Text>

        <Text style={styles.fieldLabel}>Goal ({u})</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={goalText}
            onChangeText={(t) => {
              setGoalText(t);
              if (error) setError("");
            }}
            keyboardType="numeric"
            placeholder={unit === "oz" ? "68" : "2000"}
            placeholderTextColor={colors.textSoft}
            maxLength={7}
          />
          <Text style={styles.inputUnit}>{u}</Text>
        </View>

        <View style={styles.presets}>
          {PRESETS_ML.map((ml) => (
            <TouchableOpacity
              key={ml}
              style={styles.preset}
              activeOpacity={0.8}
              onPress={() => applyPreset(ml)}
            >
              <Text style={styles.presetText}>
                {mlToDisplayValue(ml, unit)} {u}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.helper}>
          Goal must be between 1 and {maxDisplay} {u}. Default is{" "}
          {mlToDisplayValue(DEFAULT_GOAL_ML, unit)} {u}.
        </Text>

        <PrimaryButton title="Save Goal" onPress={onSave} style={styles.saveBtn} />
        <SecondaryButton
          title="Reset to default goal"
          onPress={onReset}
          style={styles.resetBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  sub: { fontSize: 14, color: colors.textSoft, marginTop: 6, marginBottom: 20 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSoft,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.chipBorder,
    borderRadius: 14,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    paddingVertical: 14,
  },
  inputUnit: { fontSize: 18, color: colors.accentDark, fontWeight: "700" },
  presets: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
  },
  preset: {
    backgroundColor: colors.panel,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 10,
  },
  presetText: { fontSize: 13.5, color: colors.accentDark, fontWeight: "700" },
  error: { color: colors.danger, fontSize: 13.5, marginTop: 8, fontWeight: "600" },
  helper: { color: colors.textSoft, fontSize: 12.5, marginTop: 8, lineHeight: 18 },
  saveBtn: { marginTop: 22 },
  resetBtn: { marginTop: 12 },
});
