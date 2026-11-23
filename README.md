# CareQueue 🏥

> Real-Time OPD Queue, Bed Availability & Hospital Admission Management System

CareQueue is a full-stack mobile solution developed for hospital crowd management, dynamic OPD queue prioritization, real-time bed tracking, and patient admissions, engineered for Delhi Government health infrastructure.

---

## 📱 Architecture & Tech Stack

- **Mobile Client (`/app`)**: React Native with Expo (JavaScript), React Navigation, Axios, Socket.io Client, AsyncStorage, NetInfo.
- **Backend Service (`/server`)**: Node.js, Express, Socket.io (WebSockets), MongoDB Atlas with Mongoose ODM, JWT Authentication.
- **Real-Time Communication**: Socket.io event-driven rooms (`session:*`, `hospital:*`, `admission:*`, `city`).
- **Offline Resilience**: AsyncStorage caching with NetInfo-driven synchronization.

---

## 🚀 Getting Started

### 1. Server Setup (`/server`)
```bash
cd server
npm install
cp .env.example .env
# Configure your MONGO_URI, JWT_SECRET, and PORT in .env
npm run dev
```

### 2. Mobile App Setup (`/app`)
```bash
cd app
npm install
# Configure your local network IP in src/config.js (e.g. http://192.168.x.x:5000)
npx expo start
```

---

## 📌 Phased Implementation Roadmap
- [x] **Phase 0**: Project Setup & Baseline Infrastructure (`chore: project setup`)
- [ ] **Phase 1**: Navigation Architecture & Screen Skeletons (`feat: navigation and screens`)
- [ ] **Phase 2**: Role-Based Auth & Patient Profile (`feat: role-based auth and patient profile`)
- [ ] **Phase 3**: Hospital Management & Admin Verification (`feat: hospital management and admin verification`)
- [ ] **Phase 4**: OPD Token Engine & Queuing Logic (`feat: opd token queue`)
- [ ] **Phase 5**: Bed Inventory & Nearby Hospital Locator (`feat: bed availability and nearby hospitals`)
- [ ] **Phase 6**: Admission Pipeline with Bed Assignment (`feat: admission workflow with bed assignment`)
- [ ] **Phase 7**: Real-Time WebSockets & Helpdesk Chat (`feat: realtime queue, beds and chat`)
- [ ] **Phase 8**: Smart Notifications & Queue Alerts (`feat: push notifications`)
- [ ] **Phase 9**: Medicine Dispensing & City-Wide Dashboard (`feat: medicine dispensing and city dashboard`)
- [ ] **Phase 10**: Offline-First Caching & Connection Recovery (`feat: offline support and connection recovery`)
- [ ] **Phase 11**: End-to-End Polish, Seed Data & Viva Docs (`docs: readme and release build`)
