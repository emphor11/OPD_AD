# CareQueue 🏥
### Real-Time Hospital OPD Queuing, Bed Availability & Patient Admission System
*Developed for Government of NCT of Delhi — Department of Information Technology (MedTech / HealthTech)*

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![React Native](https://img.shields.io/badge/React_Native-Expo_v51-blue.svg)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_v4-green.svg)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/WebSockets-Socket.io_v4-orange.svg)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-brightgreen.svg)](https://www.mongodb.com/)

---

## 📌 Executive Summary

Large government hospitals across Delhi (e.g., LNJP, Safdarjung, GTB) face immense crowd congestion, unpredictable OPD wait times, and a lack of transparency regarding emergency bed vacancies. 

**CareQueue** is a full-stack, cross-platform mobile solution that digitizes hospital crowd management:
1. **Patients** book virtual tokens (`GM-014`), observe live queue progress in real time, receive proximity notifications when their turn approaches, locate nearby hospitals by Haversine distance, and submit emergency admission requests with attached medical reports.
2. **Hospital Staff** run digital OPD consultation rooms (Call Next, Skip, Complete), toggle bed census across wards, admit patients with atomic bed assignment, dispense medications, and monitor low-stock warnings.
3. **City Administrators (Delhi Govt)** monitor a single unified dashboard showing real-time bed heatmaps and queue loads across all verified health facilities in Delhi.

---

## 🏛️ System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │    Delhi Central Health Grid (City Administration)     │
                    │   - Aggregated Bed Heatmaps  - Real-Time Queue Loads   │
                    └───────────────────────────▲────────────────────────────┘
                                                │ (Secure REST + Sockets)
  ┌─────────────────────────────────────────────┴─────────────────────────────────────────────┐
  │                           Hospital-Level System (Node.js + Express)                       │
  │                                                                                           │
  │   1. OPD Queuing Engine          2. Bed Management & Triage       3. Pharmacy Dispensary  │
  │   - Atomic Token Generation      - Ward Census (ICU/Oxy/Gen)      - Stock Threshold Flags │
  │   - Dynamic Wait Estimation      - Atomic Admission Assignment    - Low-Stock Push Alerts │
  │   - Smart Proximity Alerts       - Bed Release on Discharge       - Dispensation Logs     │
  └─────────────────────────────────────────────▲─────────────────────────────────────────────┘
                                                │ (Socket.io Push + Axios Pull)
  ┌─────────────────────────────────────────────┴─────────────────────────────────────────────┐
  │                      Mobile Application (React Native + Expo Client)                      │
  │                                                                                           │
  │   - Role-Based Stacks (Patient / Staff / Admin)    - Offline-First AsyncStorage Cache    │
  │   - Real-Time Live Queue Progress Bar             - Background Reconnect & Replay Queue  │
  │   - In-App Help Desk Two-Way Chat                  - Device Permissions & Push Alerts     │
  └───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎓 Course Topic Mapping (For Viva & Technical Defense)

This project has been deliberately architected to demonstrate core Mobile Application Development principles:

| Course Lecture Topic | Implementation in CareQueue |
|---|---|
| **Cross-Platform Rendering** | Unified React Native + Expo codebase supporting Android and iOS seamlessly. |
| **Application Lifecycle** | `AppState` event subscription triggers silent queue refetching upon resuming to the foreground (`active`). |
| **Screen Architecture & Navigation** | Role-gated hierarchy via React Navigation: `RootNavigator` switches between `AuthStack`, `PatientTabs`, `StaffTabs`, and `AdminStack`. |
| **Inter-Screen Communication** | Route parameter passing (`route.params`) for `hospitalId`, `sessionId`, and `admissionId`. |
| **Efficient List Rendering** | Optimized `FlatList` components with key extraction and empty/loading states for hospitals, beds, tokens, and chats. |
| **UI/UX Design Tokens** | Hospital teal theme (`#00796B`), token cards, status badges, and queue progress indicators styled via `StyleSheet`. |
| **Local Persistence** | `AsyncStorage` securely persists JWT auth tokens, user profiles, and offline cache keys (`cache:myToken`, `cache:hospitals`). |
| **Network Interfaces (Pull Model)** | Axios REST API client with request interceptors for automatic Bearer token injection. |
| **Real-Time Streaming (Push Model)** | Socket.io event-driven rooms (`session:*`, `hospital:*`, `admission:*`, `city`) combined with background Expo Push Notifications. |
| **Connection Recovery & Offline Resilience** | `NetInfo` connectivity detection, `OfflineBanner` displaying cached timestamps, and FIFO offline message queuing with automatic replay. |
| **Device Permissions** | `expo-location` for GPS proximity, `expo-image-picker` for report uploads, and `expo-notifications` for device alerts. |
| **Media Persistence** | Multer multi-part form parser for uploading referral letters/prescriptions stored statically on the server. |
| **Production Build Configuration** | `eas.json` profile configured to compile standalone Android APKs. |

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB Atlas URI (or local MongoDB running on `mongodb://127.0.0.1:27017/carequeue`)

### 1. Server Setup
```bash
cd server
npm install
cp .env.example .env
# Optional: Seed realistic Delhi healthcare data (hospitals, beds, queues, users)
node seed.js
# Start development server
npm run dev
```
*The server will run on `http://localhost:5001` with Socket.io enabled.*

### 2. Mobile App Setup
```bash
cd app
npm install
# Set your machine's local Wi-Fi IP in src/config.js (e.g. http://192.168.1.5:5001)
npx expo start
```
*Scan the QR code with **Expo Go** on Android/iOS or press `w` to run in a web browser.*

---

## 👥 Demo Credentials (For Testing & Viva Evaluation)

| Role | Email | Password | Preloaded Context |
|---|---|---|---|
| **Patient** | `rahul@carequeue.org` | `password123` | Active token `GM-014`, assigned ICU bed request, proximity alerts |
| **Hospital Staff** | `staff@lnjp.gov.in` | `password123` | LNJP Hospital OPD consultation room, bed census, dispensary stock |
| **City Admin** | `admin@health.delhi.gov.in` | `password123` | Delhi Central Health Grid monitoring LNJP, Safdarjung, and GTB |

*Note: In the mobile app, you can also use the **Quick Demo Switcher** bar at the bottom of the screens to switch roles instantly.*

---

## 🌐 REST API Reference

All protected endpoints require the `Authorization: Bearer <token>` header.

### Authentication & Users
| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new patient or hospital staff account |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT + user object |
| `GET` | `/api/users/me` | Authenticated | Retrieve authenticated user profile |
| `PUT` | `/api/users/me` | Authenticated | Update patient demographics and medical info |
| `PUT` | `/api/users/push-token` | Authenticated | Register device Expo push notification token |

### Hospital Management & Verification
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/hospitals/nearby?lat=...&lng=...` | Public | Verified hospitals sorted by Haversine distance with live free bed counts |
| `GET` | `/api/hospitals/:id` | Public | Facility details, active OPD sessions, and bed availability |
| `POST` | `/api/hospitals` | Staff / Admin | Create hospital facility with departments |
| `GET` | `/api/admin/hospitals` | Admin | Review all pending and verified hospitals |
| `PUT` | `/api/admin/hospitals/:id/verify` | Admin | Approve or reject a hospital facility |

### OPD Queue Engine
| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/api/opd/sessions` | Staff | Open department consultation session for today |
| `PUT` | `/api/opd/sessions/:id/close` | Staff | Close OPD session |
| `POST` | `/api/opd/sessions/:id/next` | Staff | Call next waiting token and trigger proximity alerts |
| `POST` | `/api/tokens` | Patient | Book token with atomic increment (`lastTokenNo + 1`) |
| `GET` | `/api/tokens/mine` | Patient | Active & past tokens with live queue position and estimated wait |
| `PUT` | `/api/tokens/:id/status` | Patient / Staff | Update token status (`completed`, `skipped`, `cancelled`) |

### Bed Inventory & Admissions
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/beds` | Staff / Admin | Hospital bed census filterable by type and status |
| `POST` | `/api/beds` | Staff / Admin | Add new bed to hospital inventory |
| `PUT` | `/api/beds/:id` | Staff / Admin | Toggle bed status (`free`, `occupied`, `maintenance`) |
| `POST` | `/api/admissions` | Patient | Submit admission request with optional report image |
| `GET` | `/api/admissions/mine` | Patient | Patient's admission requests and assigned beds |
| `GET` | `/api/admissions/incoming` | Staff | Hospital triage incoming requests |
| `PUT` | `/api/admissions/:id/status` | Staff / Patient | Approve, reject, admit (with bed assignment), or discharge |

### Pharmacy & City Dashboard
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/medicines` | Staff | Hospital medicine inventory with low-stock flags |
| `POST` | `/api/medicines/dispense` | Staff | Record dispensation and deduct stock |
| `GET` | `/api/admin/city-dashboard` | Admin | Aggregated city-wide bed heatmaps and active queues |

---

## 📡 WebSocket Event Architecture

| Event Name | Direction | Room | Trigger / Description |
|---|---|---|---|
| `queue:updated` | Server $\rightarrow$ Client | `session:<id>` | Fired when a token is called, skipped, completed, or booked |
| `token:called` | Server $\rightarrow$ Client | `user:<id>` | Priority event to patient when their token is called |
| `beds:updated` | Server $\rightarrow$ Client | `hospital:<id>`, `city` | Fired when bed status changes; updates city and hospital dashboards |
| `admission:new` | Server $\rightarrow$ Client | `hospital:<id>` | Alerts hospital staff of an incoming admission request |
| `admission:status`| Server $\rightarrow$ Client | `user:<id>`, `admission:<id>` | Alerts patient when admission is approved, admitted, or discharged |
| `message:new` | Server $\rightarrow$ Client | `admission:<id>` | Real-time chat message in admission thread |
| `stock:low` | Server $\rightarrow$ Client | `hospital:<id>` | Warning alert when a medicine falls below minimum safe level |

---

## 📦 Standalone Mobile Build (APK)

To build a standalone Android APK using EAS:
```bash
npm install -g eas-cli
eas login
cd app
eas build -p android --profile preview
```

---

## 📄 License
This project is open-source and developed for the Government of NCT of Delhi HealthTech initiative under the MIT License.
