import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useApp } from "../context/AppContext";
import { PrimaryButton } from "../components/UI";
import colors from "../theme/colors";
import {
  unitLabel,
  displayValueToMl,
  toNumber,
  mlToOz,
  roundOz,
  MAX_ENTRY_ML,
} from "../utils/format";
import { todayString, nowTimeString, isValidDateString } from "../utils/date";

export default function CustomInputScreen({ navigation, route }) {
  const { unit, addEntry } = useApp();
  const paramDate = route?.params?.date;
  const date = isValidDateString(paramDate) ? paramDate : todayString();

  const [amountText, setAmountText] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");

  const u = unitLabel(unit);
  const maxDisplay =
    unit === "oz" ? roundOz(mlToOz(MAX_ENTRY_ML)) : MAX_ENTRY_ML;

  const onAdd = useCallback(() => {
    const raw = (amountText || "").trim().replace(",", ".");
    const value = toNumber(raw, NaN);

    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    const amountMl = displayValueToMl(value, unit);
    if (!(amountMl > 0)) {
      setError("Enter an amount greater than 0.");
      return;
    }
    if (amountMl > MAX_ENTRY_ML) {
      setError(`Single entry cannot exceed ${maxDisplay} ${u}.`);
      return;
    }

    const created = addEntry({
      amountMl,
      date,
      time: nowTimeString(),
      label: (label || "").trim(),
      source: "custom",
    });
    if (created) {
      navigation.goBack();
    } else {
      setError("Could not add that amount. Please try again.");
    }
  }, [amountText, label, unit, date, addEntry, navigation, maxDisplay, u]);

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
        <Text style={styles.heading}>Custom amount</Text>
        <Text style={styles.subheading}>
          Add water manually to {date}. Values are stored internally in ml.
        </Text>

        <Text style={styles.fieldLabel}>Amount ({u})</Text>
        <View style={styles.amountRow}>
          <TextInput
            style={styles.amountInput}
            value={amountText}
            onChangeText={(t) => {
              setAmountText(t);
              if (error) setError("");
            }}
            keyboardType="numeric"
            placeholder={unit === "oz" ? "e.g. 12" : "e.g. 200"}
            placeholderTextColor={colors.textSoft}
            maxLength={7}
          />
          <Text style={styles.amountUnit}>{u}</Text>
        </View>

        <Text style={styles.fieldLabel}>Label (optional)</Text>
        <TextInput
          style={styles.labelInput}
          value={label}
          onChangeText={setLabel}
          placeholder="e.g. Morning glass"
          placeholderTextColor={colors.textSoft}
          maxLength={40}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.helper}>
          Max {maxDisplay} {u} per single entry.
        </Text>

        <PrimaryButton
          title={`Add ${amountText ? amountText + " " + u : "Amount"}`}
          onPress={onAdd}
          style={styles.addBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  heading: { fontSize: 22, fontWeight: "800", color: colors.text },
  subheading: {
    fontSize: 14,
    color: colors.textSoft,
    marginTop: 6,
    marginBottom: 22,
    lineHeight: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSoft,
    marginBottom: 8,
    marginTop: 14,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.chipBorder,
    borderRadius: 14,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
  },
  amountInput: {
    flex: 1,
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
    paddingVertical: 14,
  },
  amountUnit: { fontSize: 20, color: colors.accentDark, fontWeight: "700" },
  labelInput: {
    borderWidth: 1.5,
    borderColor: colors.chipBorder,
    borderRadius: 14,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  error: {
    color: colors.danger,
    fontSize: 13.5,
    marginTop: 14,
    fontWeight: "600",
  },
  helper: { color: colors.textSoft, fontSize: 12.5, marginTop: 14 },
  addBtn: { marginTop: 22 },
});
