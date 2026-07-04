import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useApp } from "../context/AppContext";
import colors from "../theme/colors";

const OPTIONS = [
  { key: "ml", title: "Milliliters (ml)", sub: "Whole numbers, e.g. 250 ml" },
  { key: "oz", title: "Fluid ounces (oz)", sub: "One decimal, e.g. 8.5 oz" },
];

export default function UnitSettingsScreen() {
  const { unit, setUnit } = useApp();

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Display unit</Text>

      {OPTIONS.map((opt) => {
        const active = unit === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            activeOpacity={0.85}
            style={[styles.option, active && styles.optionActive]}
            onPress={() => setUnit(opt.key)}
          >
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>
                {opt.title}
              </Text>
              <Text style={styles.optionSub}>{opt.sub}</Text>
            </View>
            <View style={[styles.radio, active && styles.radioActive]}>
              {active ? <View style={styles.radioDot} /> : null}
            </View>
          </TouchableOpacity>
        );
      })}

      <View style={styles.noteBox}>
        <Text style={styles.noteText}>
          Values are stored internally in ml. Switching units only changes
          display. Your entries are never changed or lost when you switch.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  title: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 16 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.divider,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  optionActive: { borderColor: colors.accent, backgroundColor: colors.panelAlt },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  optionTitleActive: { color: colors.accentDark },
  optionSub: { fontSize: 12.5, color: colors.textSoft, marginTop: 3 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.tick,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: colors.accent },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  noteBox: {
    backgroundColor: colors.panel,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  noteText: { fontSize: 13.5, color: colors.text, lineHeight: 20 },
});
