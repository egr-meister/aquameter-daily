import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { PrimaryButton, SecondaryButton } from "../components/UI";
import colors from "../theme/colors";

export default function OnboardingScreen({ navigation }) {
  const { setOnboardingCompleted } = useApp();

  const finish = () => {
    setOnboardingCompleted(true);
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Simple water-meter mark: drop + strip. No mascot. */}
        <View style={styles.markWrap}>
          <View style={styles.drop} />
          <View style={styles.strip}>
            <View style={styles.stripFill} />
          </View>
        </View>

        <Text style={styles.title}>AquaMeter Daily</Text>
        <Text style={styles.subtitle}>A simple daily counter for water.</Text>

        <View style={styles.points}>
          <Text style={styles.point}>
            Add water manually and watch today's meter grow.
          </Text>
          <Text style={styles.point}>
            Tap a quick amount or enter a custom one — every tap adds an entry.
          </Text>
          <Text style={styles.point}>
            No sensors. No Health Connect. No account. Works offline.
          </Text>
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            AquaMeter Daily is a manual water counter. It does not detect
            drinking automatically and does not connect to Health Connect,
            Google Fit, sensors, or wearable devices.
          </Text>
        </View>

        <Text style={styles.privacy}>
          Everything is stored only on this device.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="Start Counter" onPress={finish} />
        <SecondaryButton title="Skip" onPress={finish} style={styles.skip} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingBottom: 12, flexGrow: 1 },
  markWrap: { alignItems: "center", marginTop: 20, marginBottom: 22 },
  drop: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderTopLeftRadius: 4,
    backgroundColor: colors.accent,
    transform: [{ rotate: "45deg" }],
    marginBottom: 18,
  },
  strip: {
    width: 160,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.progressTrack,
    overflow: "hidden",
  },
  stripFill: {
    width: "64%",
    height: "100%",
    backgroundColor: colors.progress,
    borderRadius: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSoft,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  points: { marginBottom: 20 },
  point: {
    fontSize: 15.5,
    color: colors.text,
    lineHeight: 23,
    marginBottom: 14,
    paddingLeft: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  noteBox: {
    backgroundColor: colors.panel,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  noteText: { fontSize: 13.5, color: colors.text, lineHeight: 20 },
  privacy: {
    fontSize: 13,
    color: colors.textSoft,
    textAlign: "center",
    marginBottom: 8,
  },
  footer: { padding: 20, paddingTop: 6 },
  skip: { marginTop: 12 },
});
