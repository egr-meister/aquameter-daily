# ProGuard / R8 rules for AquaMeter Daily.
# This file is copied to android/app/proguard-rules.pro after `expo prebuild`.
# Keep rules are intentionally minimal — the app uses only Expo + React Native +
# React Navigation + AsyncStorage, all of which ship their own consumer rules.

# --- React Native core ---
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class * { *; }
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}

# --- Hermes ---
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# --- React Native bridge / JNI ---
-keepclassmembers,includedescriptorclasses class * { native <methods>; }

# --- AsyncStorage ---
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Suppress notes about optional/absent classes referenced by libraries.
-dontwarn com.facebook.**
-dontwarn okio.**
-dontwarn okhttp3.**
