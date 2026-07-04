// Small reusable presentational building blocks.
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import colors from "../theme/colors";

export function Panel({ children, style }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

// Primary filled button (aqua).
export function PrimaryButton({ title, onPress, disabled, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={disabled ? undefined : onPress}
      style={[
        styles.primaryBtn,
        disabled && styles.btnDisabled,
        style,
      ]}
    >
      <Text style={styles.primaryBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

// Secondary outline button.
export function SecondaryButton({ title, onPress, disabled, tone, style }) {
  const danger = tone === "danger";
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={disabled ? undefined : onPress}
      style={[
        styles.secondaryBtn,
        danger && styles.secondaryDanger,
        disabled && styles.btnDisabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.secondaryBtnText,
          danger && styles.secondaryDangerText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

// A tappable list row used across settings/history.
export function Row({ title, subtitle, right, onPress, tone }) {
  const danger = tone === "danger";
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.row}
    >
      <View style={styles.rowTextWrap}>
        <Text style={[styles.rowTitle, danger && styles.rowTitleDanger]}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.rowRight}>{right}</View> : null}
    </Container>
  );
}

// Thin horizontal progress / meter strip.
export function MeterStrip({ ratio, reached }) {
  const clamped = Math.max(0, Math.min(1, Number(ratio) || 0));
  return (
    <View style={styles.meterTrack}>
      <View
        style={[
          styles.meterFill,
          { width: `${Math.round(clamped * 100)}%` },
          reached && styles.meterFillReached,
        ]}
      />
    </View>
  );
}

export function SectionLabel({ children, style }) {
  return <Text style={[styles.sectionLabel, style]}>{children}</Text>;
}

export function Badge({ text, tone }) {
  const ok = tone === "success";
  return (
    <View style={[styles.badge, ok ? styles.badgeOk : styles.badgeNeutral]}>
      <Text style={[styles.badgeText, ok ? styles.badgeTextOk : styles.badgeTextNeutral]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.panelAlt,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 8,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  secondaryBtnText: {
    color: colors.accentDark,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryDanger: {
    borderColor: colors.danger,
    backgroundColor: colors.white,
  },
  secondaryDangerText: {
    color: colors.danger,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  rowTextWrap: { flex: 1, paddingRight: 10 },
  rowTitle: { fontSize: 15.5, color: colors.text, fontWeight: "600" },
  rowTitleDanger: { color: colors.danger },
  rowSubtitle: { fontSize: 12.5, color: colors.textSoft, marginTop: 3, lineHeight: 17 },
  rowRight: { marginLeft: 8 },
  meterTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.progressTrack,
    overflow: "hidden",
    width: "100%",
  },
  meterFill: {
    height: "100%",
    backgroundColor: colors.progress,
    borderRadius: 6,
  },
  meterFillReached: {
    backgroundColor: colors.success,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.textSoft,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  badge: {
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  badgeOk: { backgroundColor: colors.successBg },
  badgeNeutral: { backgroundColor: colors.panel },
  badgeText: { fontSize: 12, fontWeight: "700" },
  badgeTextOk: { color: colors.success },
  badgeTextNeutral: { color: colors.textSoft },
});

export default {
  Panel,
  Divider,
  PrimaryButton,
  SecondaryButton,
  Row,
  MeterStrip,
  SectionLabel,
  Badge,
};
