import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AppProvider, useApp } from "./src/context/AppContext";
import navigationTheme from "./src/theme/navigationTheme";
import colors from "./src/theme/colors";

import OnboardingScreen from "./src/screens/OnboardingScreen";
import HomeScreen from "./src/screens/HomeScreen";
import CustomInputScreen from "./src/screens/CustomInputScreen";
import EntryScreen from "./src/screens/EntryScreen";
import DayDetailScreen from "./src/screens/DayDetailScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import ProgressChartScreen from "./src/screens/ProgressChartScreen";
import UnitSettingsScreen from "./src/screens/UnitSettingsScreen";
import GoalSettingsScreen from "./src/screens/GoalSettingsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: "700", color: colors.text },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

function RootNavigator() {
  const { ready, settings } = useApp();

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const showOnboarding = settings?.onboardingCompleted !== true;

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName={showOnboarding ? "Onboarding" : "Home"}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CustomInput"
        component={CustomInputScreen}
        options={{ title: "Custom Amount" }}
      />
      <Stack.Screen
        name="Entry"
        component={EntryScreen}
        options={{ title: "Water Entry" }}
      />
      <Stack.Screen
        name="DayDetail"
        component={DayDetailScreen}
        options={{ title: "Day Detail" }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: "History" }}
      />
      <Stack.Screen
        name="ProgressChart"
        component={ProgressChartScreen}
        options={{ title: "Progress" }}
      />
      <Stack.Screen
        name="UnitSettings"
        component={UnitSettingsScreen}
        options={{ title: "Units" }}
      />
      <Stack.Screen
        name="GoalSettings"
        component={GoalSettingsScreen}
        options={{ title: "Daily Goal" }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
