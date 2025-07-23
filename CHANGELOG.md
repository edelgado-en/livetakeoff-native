# 📄 CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]
> Work in progress / upcoming changes

### ✨ Added
- Placeholder for upcoming features

### 🛠️ Fixed
- Placeholder for upcoming bug fixes

---

## [1.2.0] - 2025-07-22
### ✨ Added
- “Create Job” flow with 3-step form and floating labels
- Full-screen searchable dropdowns using `react-native-modalize`
- Support for light and dark themes with React Native Paper

### 🛠️ Fixed
- Login screen width issue on small devices
- Correctly display “On Site” and “TBD” badges with alignment

### ♻️ Changed
- Updated DatePicker to match Android behavior across platforms
- Enhanced service cards with short name and description

---

## [1.1.0] - 2025-07-15
### ✨ Added
- Internal TestFlight support with version tracking
- Image upload section in job completion

### 🛠️ Fixed
- Crashes when fetching job list with incomplete data
- UI alignment bugs on iPhone SE

---

## [1.0.0] - 2025-07-01
### 🚀 Initial Release
- User authentication (login/logout)
- Job listing screen with pagination
- Basic job creation form (tail, customer, aircraft type, airport)
- Dark mode support enabled

---

## How to Use

- Use `## [x.y.z] - YYYY-MM-DD` headers for each release
- Use categories like:
  - ✨ `Added`: new features
  - 🛠️ `Fixed`: bug fixes
  - ♻️ `Changed`: refactors or updates
  - 🔥 `Removed`: deprecated or removed features
- Keep `## [Unreleased]` at the top to track current WIP changes