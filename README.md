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

## 📦 Building for Production (iOS)

### 🛠️ Build iOS app with EAS
```bash
eas build --platform ios --profile production
```

### 📤 Submit to App Store
```bash
eas submit --platform ios
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

## ✅ Status

✅ Production-ready  
✅ Tested via TestFlight  
✅ Integrated with Django backend  
✅ Supports push notifications, infinite scroll, and tabbed navigation

---

## 👤 Author

Developed by Enrique Delgado  