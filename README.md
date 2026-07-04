# AquaMeter Daily

AquaMeter Daily is a simple, offline, manual water tracker for Android, built with React Native and Expo. It shows one large daily water meter that answers a single question at a glance: **how much water have I logged today?**

Everything is stored locally on the device. There is no backend, no account, no ads, no analytics, and no internet permission. The app works fully in airplane mode.

---

## Features

- Large daily water counter as the main screen element (ml or oz).
- Set a daily water goal (default 2000 ml).
- Quick add buttons for common amounts (150 / 250 / 330 / 500 ml).
- Custom amount input with an optional label.
- Undo the last entry.
- Reset the selected day with a confirmation dialog.
- History of past days as meter-reading cards.
- Day detail screen with full entry list, edit, and delete.
- Simple 7-day and 30-day progress chart built from plain React Native views.
- Unit switching between ml and oz (internal storage is always ml).
- Compact mode, onboarding replay, and full local-data reset in Settings.
- 100% local storage using AsyncStorage.

---

## Manual tracking disclaimer

**AquaMeter Daily is a manual water counter. It does not detect drinking automatically and does not connect to Health Connect, Google Fit, sensors, or wearable devices.**

Water entries are always added manually by tapping a quick amount or entering a custom amount. This note appears in onboarding, in Settings, and here in the README.

---

## Non-medical disclaimer

This is a practical, offline, wellness-style manual tracking utility. It is **not** a medical app, treatment app, diagnostic app, sports-performance app, children's app, or game. It does not provide medical advice, does not diagnose dehydration, and makes no medical claims.

---

## Offline-first / privacy

- **Offline-first:** all features work with no network connection, including airplane mode.
- **No internet / no permissions:** the app requests no runtime permissions and the Android manifest does not include the `INTERNET` permission.
- **No sensors:** the app reads no device sensors.
- **No Google Fit:** no Google Fit SDK or integration.
- **No Health Connect:** no Health Connect SDK or integration.
- **No wearable integration:** no smartwatch or wearable connection.
- **No automatic water detection:** entries are only ever added manually.

**Privacy note:** AquaMeter Daily stores water entries, goals, units, history, and progress data only on this device. No account, no ads, no analytics, no internet connection, no sensors, no Google Fit, no Health Connect, and no notification permission.

---

## Units: ml / oz

The app supports two display units: milliliters (`ml`) and fluid ounces (`oz`).

- **Internal storage is always in ml.** ml is the single source of truth.
- When the unit is `oz`, stored ml values are converted for display only.
- Conversion factor: `1 oz ≈ 29.5735 ml`.
- ml values are shown as whole numbers; oz values are rounded to one decimal place.
- Switching units never changes or corrupts stored values — it only changes what you see.

Examples: `250 ml`, `8.5 oz`, `500 ml`, `16.9 oz`.

---

## Daily water counter

The home screen is a **Daily Water Meter**. It shows:

- Today's total in the selected unit.
- The daily goal.
- Remaining amount.
- Progress percentage.
- A "Goal reached" state when the total meets or exceeds the goal.

The counter is the visual center of the screen. The chart and history are intentionally kept smaller and below the meter.

---

## Daily goal

- Default goal is `2000 ml`.
- Progress = `dailyTotalMl / dailyGoalMl`.
- If the goal is missing or 0, the app falls back to `2000 ml`.
- Progress is capped visually at 100%, but the real total is always shown.
- Validation: the goal must be greater than 0 and must not exceed `10000 ml` (or the oz equivalent). Invalid input shows friendly validation text and never crashes the app.

---

## Quick add buttons

The home screen includes quick add controls for `150 / 250 / 330 / 500 ml`. When the unit is oz, the buttons show converted oz values while still storing ml internally. Every tap creates a water entry with `source: "quick"`.

---

## Custom input

The Custom Amount screen lets you enter any amount with an optional label. Validation: the amount must be greater than 0 and must not exceed `5000 ml` (or the oz equivalent) per single entry. Invalid input shows friendly text and never crashes. Custom entries use `source: "custom"`.

---

## Undo last entry

After adding water you can tap **Undo last** on the home screen to remove the most recent entry for the selected day. Undo recalculates the counter, goal progress, history, and chart. It is safe when there is no last entry, when the entry was already deleted, when the day was reset, or when storage is empty.

---

## Reset day confirmation

Resetting a day removes all water entries for that date after a confirmation dialog:

- "Reset this day?"
- "This will remove all water entries for the selected day."

Reset keeps your goal, unit setting, history for other days, and app settings. It is safe even when the day has no entries.

---

## History

The History screen lists daily summaries in reverse chronological order. Each card shows the date, total amount, goal-reached state, and entry count. Tapping a card opens the Day Detail screen where you can edit entries, delete entries, or reset that day after confirmation. History is fully local.

---

## Progress chart

The Progress screen shows a simple meter trend for the last 7 days (with an optional 30-day view). It is built from plain React Native views — compact vertical bars with a thin dashed goal marker — with **no heavy chart library**. Missing days are treated as 0. The screen also shows the daily average, best day, and goal days (for example "Goal days: 4 of 7"). The chart never crashes when there is no data.

---

## Local storage

All app data is stored with AsyncStorage under a single key. The stored shape is:

```js
{
  version: 1,
  entries: WaterEntry[],
  settings: Settings
}
```

Data survives app restarts. The storage layer is defensive: it merges loaded data with defaults, handles empty storage, handles missing fields, recovers from corrupted JSON with a safe fallback, and never crashes on empty arrays, missing goals, missing unit settings, or invalid dates/times.

### Data models

```js
WaterEntry = {
  id: string,
  date: string,        // "YYYY-MM-DD"
  time: string,        // "HH:mm"
  amountMl: number,    // always stored in ml
  label: string,
  source: "quick" | "custom",
  createdAt: string,   // ISO timestamp
  updatedAt: string    // ISO timestamp
}

Settings = {
  onboardingCompleted: boolean,
  dailyGoalMl: number,
  unit: "ml" | "oz",
  compactMode: boolean
}
```

---

## Screens

1. Welcome / Onboarding
2. AquaMeter Home (the daily meter)
3. Custom Input
4. Add / Edit Water Entry
5. Day Detail
6. History
7. Progress Chart
8. Unit Settings
9. Goal Settings
10. Settings

Navigation uses `@react-navigation/native` and `@react-navigation/native-stack`. The navigation theme extends the built-in `DefaultTheme`, so `theme.fonts` (including `theme.fonts.regular`) is always present — the theme is never built from scratch. The app renders correctly with empty or default AsyncStorage.

---

## App icon concept

A custom icon (no default Expo icon): a rounded square on a pale-aqua background, with an aqua water drop above a thin teal meter strip and a small percentage reading. Clean daily-tracker look, no medical symbols, readable at small sizes. Files: `assets/icon.png` and `assets/adaptive-icon.png`.

## Splash screen concept

A custom splash (no default Expo splash): a centered water-meter mark — a small drop above a short teal meter strip — with the app name "AquaMeter Daily" on a clean pale-aqua background. No heavy image assets. File: `assets/splash.png`.

## Visual style concept

"AquaMeter Clean Daily Counter": clean white background, deep blue-gray text, aqua accent, pale-cyan panels, a muted-teal progress strip, and light-gray dividers. Simple, minimal, fresh, non-medical, and non-sport.

## Daily Water Meter layout uniqueness

The main screen is deliberately **not** a bottle tracker, drop-grid, glass shelf, timeline, three-part journal, spreadsheet logbook, mascot-centered header, or an overloaded dashboard. Instead it is a focused meter: a compact header with a settings icon, one very large numeric counter with the unit attached, small meter labels for goal and remaining, a thin segmented meter strip with tick marks, compact quick-add chips, secondary custom/undo/reset controls, and history/chart shortcuts kept below. There is no large vertical stack of identical buttons.

---

## Environment and Expo rules

- Do not hand-edit dependency versions. The versions in `package.json` are a starting point; CI runs `npx expo install --fix` to align them to the current Expo SDK.
- Install every package through `npx expo install <package-name>` so each is a direct dependency.
- Never rely on transitive dependencies.

### Scaffold (reference)

This project was structured to match an Expo app created with:

```bash
npx create-expo-app aquameter-daily
```

### Install dependencies

```bash
cd aquameter-daily
npm install
# Align to the installed Expo SDK:
npx expo install --fix
```

Core modules and libraries are declared as direct dependencies. To (re)install them explicitly through Expo:

```bash
npx expo install expo-asset expo-constants expo-font expo-modules-core expo-splash-screen expo-status-bar
npx expo install @react-native-async-storage/async-storage
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

Commit the resulting `package-lock.json` from a full `npm install`.

---

## Run locally

```bash
npm install
npx expo install --fix
npx expo-doctor
npx expo install --check
npx expo start
```

Then launch on an Android device or emulator from the Expo CLI (press `a`), or use a development build. The app works offline; you can enable airplane mode and it will still function.

---

## Build Android

Generate the native Android project and build with Gradle:

```bash
# 1. Generate the android/ project
npx expo prebuild --platform android --clean

# 2. Copy the ProGuard rules into the generated project
cp android-proguard-rules.pro android/app/proguard-rules.pro

# 3. Build a release APK
cd android
./gradlew :app:assembleRelease

# 4. Build a release AAB
./gradlew :app:bundleRelease
```

Outputs:

- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

### Signing during local builds

Pass the signing values as Gradle properties (AGP injected signing), so you never edit files:

```bash
./gradlew :app:assembleRelease \
  -Pandroid.injected.signing.store.file=/absolute/path/aquameter-daily-release-key.p12 \
  -Pandroid.injected.signing.store.password=YOUR_PASSWORD \
  -Pandroid.injected.signing.key.alias=aquameter_daily_key \
  -Pandroid.injected.signing.key.password=YOUR_PASSWORD
```

---

## Generate a PKCS12 keystore

Use a PKCS12 keystore. Use the **same password** for the keystore and the key.

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore aquameter-daily-release-key.p12 -alias aquameter_daily_key -keyalg RSA -keysize 2048 -validity 10000
```

Never commit the keystore or its passwords to the repository (the `.gitignore` already excludes `*.p12`, `*.keystore`, and `*.jks`).

---

## GitHub Secrets

Add these repository secrets (Settings → Secrets and variables → Actions):

```text
ANDROID_KEYSTORE_BASE64     # base64 of the .p12 file
ANDROID_KEYSTORE_PASSWORD
ANDROID_KEY_ALIAS           # aquameter_daily_key
ANDROID_KEY_PASSWORD        # same as keystore password
```

Create the base64 value with:

```bash
base64 -w0 aquameter-daily-release-key.p12 > keystore.b64   # Linux
# macOS: base64 -i aquameter-daily-release-key.p12 -o keystore.b64
```

Paste the contents of `keystore.b64` into `ANDROID_KEYSTORE_BASE64`.

---

## GitHub Actions

The workflow at `.github/workflows/android-build.yml` runs on push to `main` and:

1. Checks out the repo and sets up Node.js 20 and JDK 17.
2. Installs the Android SDK, Platform 35, and Build Tools 35.0.0 (`sdkmanager "platforms;android-35" "build-tools;35.0.0"`).
3. Runs `npm install`.
4. Runs `npx expo install --fix`.
5. Runs `npx expo-doctor` and `npx expo install --check`.
6. Runs `npx expo prebuild --platform android --clean` and copies the ProGuard rules.
7. Decodes the keystore from `ANDROID_KEYSTORE_BASE64`.
8. Builds the signed release APK and AAB using AGP injected signing.
9. Uploads the APK and AAB as build artifacts.

CI is responsible for a fast, stable APK/AAB build and signing only. There is no mandatory emulator smoke-test on free runners.

---

## Google Play compatibility notes

- **Android API 35:** the app targets `compileSdkVersion 35` and `targetSdkVersion 35` (not 34), as required for new/updated Play submissions.
- **minSdkVersion:** compatible with the React Native version in use (24 or higher for RN 0.79).
- **16 KB page size:** the app builds against the current Expo SDK / React Native that supports Android 15+ 16 KB memory page sizes, and adds no old native libraries. The final AAB supports 16 KB pages.
- **No disallowed SDKs:** no Firebase, ads, analytics, payment, Google Fit, Health Connect, sensor, wearable, notification, or background-task SDKs.

---

## Release optimization notes

Use standard Android R8/ProGuard only (no risky third-party obfuscation). Verify a non-minified release first, then enable minify/shrink and re-test:

```gradle
// First verify:
minifyEnabled false
shrinkResources false

// Then enable in android/app/build.gradle:
minifyEnabled true
shrinkResources true
proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
```

Re-test app launch after enabling minify/shrink.

---

## Local launch verification checklist

A green CI build is **not** proof that the app launches. Before release:

```bash
adb install app-release.apk
adb logcat
```

Confirm there are no errors such as: "Cannot find native module", "Module has not been registered", "Invariant Violation", "theme.fonts.regular is undefined", AsyncStorage JSON parse crash, missing route params crash, invalid date/time crash, invalid number crash, unit conversion crash, or undo target crash.

Test the full flow:

- First launch with empty storage.
- Add a quick amount and a custom amount.
- Switch ml → oz and oz → ml.
- Undo the last entry.
- Reset the selected day.
- Edit and delete an entry.
- Change the daily goal.
- Open History and the Progress chart.
- Reset all local data, then relaunch.
- Launch in airplane mode.
- Confirm no sensor, Google Fit, Health Connect, wearable, notification, or internet permission is requested.

---

## Permissions

The app requests **no** runtime permissions and does not require internet, location, camera, microphone, contacts, storage/gallery, files, notifications, calendar, alarms, activity recognition, body sensors, physical activity, Google Fit, Health Connect, or wearable access. The Android manifest does not include the `INTERNET` permission.

---

## License

Provided as-is for personal use. No warranty. This app does not provide medical advice.
