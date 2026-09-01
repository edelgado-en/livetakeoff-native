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
