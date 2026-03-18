# AeroBAC - Precision Blood Alcohol Content Tracker

![AeroBAC Logo](./assets/images/AreeBAC_Icon.png)

**AeroBAC** is a darkly-themed React Native (Expo) application designed for accurately tracking estimated Blood Alcohol Content (BAC) using clinical physiological formulas. 

Licensed under the **GPLv3** (Copyleft / Free as in Freedom).

## 🚀 Key Features
- **Clinical Accuracy:** Uses the **Watson Formula (1980)** to calculate Total Body Water (TBW) for precise distribution volume.
- **Dynamic Simulation:** Real-time metabolic decay simulation (0.015% per hour) synced across both a dashboard visualizer and a history graph.
- **Bio-Tech Aesthetic:** High-contrast "Pure Black" (#000000) and "Neon Green" (#00FF00) interface with interactive charting.
- **Drunk-Lock Security:** Integrated alphanumeric CAPTCHA challenge before session resets or data edits.
- **Persistent Logic:** Hybrid storage using **MMKV** for lightning-fast UI state and **SQLite** for long-term relational drink logs and presets.
- **Auto-Maintenance:** Built-in background job that automatically prunes drink logs older than 30 days to optimize storage.

## 🧬 Physiological Engine
AeroBAC calculates BAC based on individual user metrics:
- **Weight (kg)**
- **Height (cm)**
- **Age (years)**
- **Biological Sex**

The engine implements retrograde extrapolation using a standard elimination rate of **0.015% per hour** and a blood-water fraction of **0.80**.

## 🛠 Tech Stack
- **Framework:** React Native (Expo Router)
- **State Management:** Zustand with MMKV Persistence
- **Database:** SQLite (`expo-sqlite`)
- **UI Components:** Gluestack-UI (v1)
- **Animations:** React Native Reanimated
- **Charts:** React Native Gifted Charts

## 📦 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Development Build (Recommended)
Because AeroBAC uses high-performance native modules (MMKV), you must use a **Development Build** instead of standard Expo Go.

**Build your custom APK:**
```bash
npx eas build --profile development --platform android
```
Install the generated APK on your phone.

**Start the dev server:**
```bash
npx expo start --dev-client
```

### 3. Running Tests
AeroBAC includes a comprehensive test suite for the physiological engine and graph simulation logic.
```bash
npm test
```

## ⚖️ License
Copyright © 2026 **Swapnamay Halder**.

This program is free software: you can redistribute it and/or modify it under the terms of the **GNU General Public License** as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

---
*Disclaimer: AeroBAC is a tracking tool based on mathematical models and is not a substitute for clinical grade breathalyzers or blood tests. Never drink and drive.*
