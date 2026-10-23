# ✈️ LiveTakeOff – Mobile App

LiveTakeOff is a professional aircraft cleaning and detailing workflow management application. This repository contains the mobile app built with **React Native** and **Expo**, featuring real-time job tracking, role-based access, and seamless integration with a Django REST API backend.

---

## 📱 Tech Stack

- **React Native** (with Expo)
- **Expo Router** for app navigation
- **TypeScript** for type safety
- **Babel** and **Metro** bundler
- **EAS Build** & **Submit** for deployment

---

## 🚀 Getting Started

### 🔧 Install dependencies
```bash
npm install
```

### ▶️ Start development server
```bash
npx expo start --clear
```

---

## Android release workflow

### Launcher icon

`expo.android.icon` selects `assets/app_icon_android.png` for the legacy icon.
The adaptive icon uses `assets/app_icon_android_adaptive.png` over `#E52529`.
The legacy icon is an opaque 1024 × 1024 PNG. The adaptive foreground is a
1024 × 1024 transparent PNG using the supplied white LiveTakeoff emblem, with
the same asset used as the monochrome layer for supported themed launchers.
The adaptive foreground includes extra transparent padding so the emblem fits within the
central 66 dp safe circle of Android's 108 dp layer. Android supplies the launcher
mask; the image does not bake in rounded corners or an outer shadow.

These assets require a new native build. Google Play's listing icon is separate,
and an over-the-air JavaScript update does not replace the installed launcher icon.
Before release, use the preview APK workflow below to verify circle, squircle,
and rounded-square launcher masks on Android phones and tablets. Check the Home
Screen, app drawer, Settings, and themed-icon behavior, then smoke-test cold
launch, session restore, and sign-out/sign-in. Themed-icon appearance depends
on the Android version and launcher.
This artwork change does not change app versions or trigger a build or release.

Expo Go is useful for day-to-day JavaScript work, but it is not the native app
that is uploaded to Google Play. Before every Android release, install and test
the `preview` APK on a physical Android phone, then promote a separately built
production AAB through Google Play Internal Testing.

### 1. Validate the project

Use Node.js 20.19 or newer, then run:

```bash
npm ci
npx expo-doctor@latest
npm run check:android-bundle
```

`npm run typecheck` is also available. It currently reports the project's
existing TypeScript typing backlog and is not yet a clean release gate.

### 2. Sign in to EAS

```bash
npx eas-cli@latest login
npx eas-cli@latest whoami
```

The project is already configured for EAS. Do not run `eas build:configure`
for every release; it is a one-time setup command.

### 3. Build and test an installable Android APK

```bash
npx eas-cli@latest build --platform android --profile preview
```

Open the resulting build URL on the Android phone and install the APK. Test at
least: cold launch after force-stop, launch while offline, login/session restore,
job list and job details, create/edit flows, image and document uploads, push
notification permission and delivery, deep links, and sign out/sign in.

### 4. Build the Google Play AAB

Only after the preview APK passes:

```bash
npx eas-cli@latest build --platform android --profile production
```

The production profile creates an Android App Bundle (`.aab`). This project uses
EAS remote app versions with auto-increment, so EAS owns the Play Store
`versionCode`; `expo.version` in `app.json` remains the user-visible version.

Upload the AAB to [Google Play Console](https://play.google.com/console), create
an Internal Testing release, and install that Play-delivered build before rolling
out to production. The Internal Testing build is the closest validation of the
artifact, signing, and delivery path users will receive.

EAS can also submit the latest build after Play credentials are configured:

```bash
npx eas-cli@latest submit --platform android --latest
```

## Building for production (iOS)

### Home Screen icon

`expo.ios.icon` in `app.json` selects `assets/app_icon_ios.png` for iPhone and
iPad. It uses the enlarged white LiveTakeoff emblem on red, supplied as an opaque
1024 × 1024 PNG with square corners; iOS applies its own icon mask.

The shared fallback icon, splash screen, and in-app logos keep their existing assets.
Android uses the separate launcher assets documented above.
Expo generates the required iOS icon sizes during the native build.

An installed app's icon changes only after a new native build is installed; an
over-the-air JavaScript update does not apply it. For a future release, follow the
existing EAS remote-version workflow and check the current remote build number
before building. Do not withdraw or replace the pending 1.23.0 submission solely
for this artwork change.

Before release, verify the icon on iPhone and iPad using a TestFlight or internal
native build: Home Screen at normal and large sizes, Spotlight, Settings, and
light/dark/tinted appearances. Confirm the emblem remains legible and unclipped,
then smoke-test cold launch, session restore, and sign-out/sign-in. Expo Go alone
does not validate the installed icon. This configuration change does not itself
build, submit, or release an app.

See [Expo's app icon guidance](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/).

### 🛠️ Build iOS app with EAS
```bash
npx eas-cli@latest build --platform ios --profile production
```

### 📤 Submit to App Store
```bash
npx eas-cli@latest submit --platform ios
```

> Ensure that your Apple Developer credentials and provisioning profiles are properly configured before submission.

---

## 📁 Folder Structure (Highlights)

```
├── app/                   # Expo Router pages and navigation
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks (e.g., auth, push tokens)
├── services/              # API service wrappers
├── utils/                 # Text formatting and other utilities
├── assets/                # Icons, splash screens, images
├── app.json               # Expo configuration
```

---

## Status

- Android production configuration and release bundling are validated.
- The final APK/AAB must still pass physical-device and Play Internal Testing.
- iOS releases are tested through TestFlight.
- The app is integrated with the Django API and Expo push notifications.

---

## 👤 Author

Developed by Enrique Delgado
