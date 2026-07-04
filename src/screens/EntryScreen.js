import React, { useState, useCallback, useMemo, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
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
  MAX_ENTRY_ML,
} from "../utils/format";
import {
  todayString,
  nowTimeString,
  isValidDateString,
  isValidTimeString,
} from "../utils/date";

export default function EntryScreen({ navigation, route }) {
  const { entries, unit, addEntry, updateEntry, deleteEntry } = useApp();

  const editId = route?.params?.id ?? null;
  const existing = useMemo(() => {
    const list = Array.isArray(entries) ? entries : [];
    return list.find((e) => e?.id === editId) ?? null;
  }, [entries, editId]);

  const isEdit = !!existing;
  const u = unitLabel(unit);

  const initialDate = isValidDateString(route?.params?.date)
    ? route.params.date
    : todayString();

  const [date, setDate] = useState(
    isEdit ? existing.date : initialDate
  );
  const [time, setTime] = useState(
    isEdit ? existing.time : nowTimeString()
  );
  const [amountText, setAmountText] = useState(
    isEdit ? String(mlToDisplayValue(existing.amountMl, unit)) : ""
  );
  const [label, setLabel] = useState(isEdit ? existing.label || "" : "");
  const [error, setError] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEdit ? "Edit Entry" : "Add Entry" });
  }, [navigation, isEdit]);

  const maxDisplay =
    unit === "oz" ? roundOz(mlToOz(MAX_ENTRY_ML)) : MAX_ENTRY_ML;

  const validate = useCallback(() => {
    if (!isValidDateString(date)) {
      setError("Enter a valid date as YYYY-MM-DD.");
      return null;
    }
    if (!isValidTimeString(time)) {
      setError("Enter a valid time as HH:mm (24-hour).");
      return null;
    }
    const raw = (amountText || "").trim().replace(",", ".");
    const value = toNumber(raw, NaN);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter an amount greater than 0.");
      return null;
    }
    const amountMl = displayValueToMl(value, unit);
    if (!(amountMl > 0)) {
      setError("Enter an amount greater than 0.");
      return null;
    }
    if (amountMl > MAX_ENTRY_ML) {
      setError(`Single entry cannot exceed ${maxDisplay} ${u}.`);
      return null;
    }
    return amountMl;
  }, [date, time, amountText, unit, maxDisplay, u]);

  const onSave = useCallback(() => {
    const amountMl = validate();
    if (amountMl == null) return;

    if (isEdit) {
      updateEntry(existing.id, {
        date,
        time,
        amountMl,
        label: (label || "").trim(),
      });
    } else {
      addEntry({
        date,
        time,
        amountMl,
        label: (label || "").trim(),
        source: "custom",
      });
    }
    navigation.goBack();
  }, [validate, isEdit, existing, date, time, amountText, label, updateEntry, addEntry, navigation, unit]);

  const onDelete = useCallback(() => {
    if (!isEdit) return;
    Alert.alert(
      "Delete entry?",
      "This will remove this water entry.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteEntry(existing.id);
            navigation.goBack();
          },
        },
      ],
      { cancelable: true }
    );
  }, [isEdit, existing, deleteEntry, navigation]);

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
        <Text style={styles.fieldLabel}>Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={(t) => {
            setDate(t);
            if (error) setError("");
          }}
          placeholder="2026-07-03"
          placeholderTextColor={colors.textSoft}
          autoCapitalize="none"
          maxLength={10}
        />

        <Text style={styles.fieldLabel}>Time (HH:mm)</Text>
        <TextInput
          style={styles.input}
          value={time}
          onChangeText={(t) => {
            setTime(t);
            if (error) setError("");
          }}
          placeholder="08:30"
          placeholderTextColor={colors.textSoft}
          maxLength={5}
        />

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
            placeholder={unit === "oz" ? "12" : "250"}
            placeholderTextColor={colors.textSoft}
            maxLength={7}
          />
          <Text style={styles.amountUnit}>{u}</Text>
        </View>

        <Text style={styles.fieldLabel}>Label (optional)</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder="e.g. Water bottle"
          placeholderTextColor={colors.textSoft}
          maxLength={40}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.helper}>
          Stored internally in ml. Max {maxDisplay} {u} per entry.
        </Text>

        <PrimaryButton title="Save Entry" onPress={onSave} style={styles.saveBtn} />
        {isEdit ? (
          <SecondaryButton
            title="Delete Entry"
            tone="danger"
            onPress={onDelete}
            style={styles.deleteBtn}
          />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSoft,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.chipBorder,
    borderRadius: 14,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
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
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    paddingVertical: 12,
  },
  amountUnit: { fontSize: 18, color: colors.accentDark, fontWeight: "700" },
  error: {
    color: colors.danger,
    fontSize: 13.5,
    marginTop: 14,
    fontWeight: "600",
  },
  helper: { color: colors.textSoft, fontSize: 12.5, marginTop: 12 },
  saveBtn: { marginTop: 22 },
  deleteBtn: { marginTop: 12 },
});
