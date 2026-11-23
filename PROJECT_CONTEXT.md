# CareQueue – Project Context

> Read this whole file before writing any code. It explains what we are building, why, how it is structured, and the rules to follow.

---

## 1. What is CareQueue? (simple explanation)

CareQueue is a **mobile app (React Native + Expo)** that makes hospital visits faster and less stressful by managing **OPD queues, bed availability and patient admissions** in real time.

Today, patients stand in long OPD lines without knowing when their turn will come, families go from hospital to hospital looking for a free bed in emergencies, and admissions are done on paper. CareQueue fixes this by putting everything in one app:

- **Patients** book an OPD token, watch their live position in the queue, get notified when their turn is near, check free beds at nearby hospitals, request admission, and chat with the hospital help desk.
- **Hospital staff** run the OPD queue (call next, skip, complete), update bed status, approve admissions, record medicines dispensed, and get low-stock alerts.
- **City admins** verify hospitals and see a city-wide view of beds and OPD load across all hospitals.

This is a **college major project** for a Mobile Application Development course (React Native). The code must stay **simple, readable, and easy to explain in a viva**. Prefer clarity over cleverness.

---

## 2. Problem statement (official, summarised)

**Queuing models in OPDs / availability of beds / admission of patients. A hospital-based solution is ideal which can be integrated with a city-wide module.**
(Government of NCT of Delhi, Department of IT — MedTech / HealthTech, Software)

Key areas from the statement:
- technological solution for queuing in OPDs,
- availability of beds and admission of patients,
- dispensation of medicines/consumables and inventory management at hospital level,
- a hospital-level solution that integrates with a city-wide module.

---

## 3. User roles

| Role | What they can do |
|---|---|
| **Patient** | Register, manage profile (age, gender, blood group, phone), find nearby hospitals, book OPD token for a department, see live queue position, check bed availability, request admission with referral/report photo, chat with help desk, receive notifications |
| **Staff** (belongs to one hospital) | Register their hospital, manage departments and OPD sessions, call next token / skip / complete, update beds (free/occupied/maintenance), approve/reject/admit/discharge, record medicine dispensing, manage a small stock list with low-stock alert, chat with patients |
| **Admin** (city level) | Verify or reject hospitals, view city dashboard (beds free per hospital, OPD waiting per hospital), view users and basic stats |

Only **verified** hospitals appear to patients.

---

## 4. Features (final scope)

### Core
1. **Auth + roles** – register/login with email & password, JWT, role decides which screens are shown.
2. **Patient profile** – name, age, gender, blood group, phone, location.
3. **Hospital management** – staff creates hospital (name, address, phone, location, departments). Admin verifies it.
4. **OPD queue (main feature)**
   - Each hospital has departments (General Medicine, Pediatrics, Orthopedics, ENT, Gynecology, etc.).
   - Staff opens an **OPD session** for a department for today (start/close).
   - Patient books a **token** → gets token number (e.g. `GM-017`).
   - Token status: `waiting → called → in_consultation → completed`, or `skipped` / `cancelled`.
   - Patient sees: current token being served, their position, and **estimated wait time** (`people ahead × avg consultation minutes`).
   - Staff screen: big "Call Next" button, skip, mark complete.
5. **Bed availability** – bed types: General, ICU, Oxygen, Ventilator, Pediatric. Each bed has status `free | occupied | maintenance`. Patients see free count per type per hospital.
6. **Admission workflow** – patient (or family) sends an admission request (bed type, reason, urgency: normal/urgent/critical, optional referral/report photo).
   Status flow: `pending → approved → admitted → discharged`, or `pending → rejected`. Patient can cancel while pending. When admitted, staff assigns a bed (bed becomes occupied); on discharge the bed becomes free.
7. **Medicine dispensing + stock (small module)** – staff keeps a simple stock list (name, quantity, minimum level). When a medicine is dispensed to a patient (OPD token or admission), quantity reduces. Low-stock alert when quantity < minimum level. *Keep this module small — the main focus is queue, beds and admissions.*
8. **City-wide module** – admin dashboard showing all verified hospitals with free beds per type and number of OPD patients waiting. Patients also get a "Hospitals near me" list sorted by distance with free beds and queue length.

### Mobile features
9. **Real-time updates** – Socket.io pushes queue changes ("now serving GM-015"), bed count changes and admission status instantly.
10. **Chat** – each admission request has a chat thread between patient and hospital help desk (text + optional image).
11. **Push notifications** – Expo push for: "Your turn is in 3 patients", "Your token is called", admission status change, new chat message, new admission request (to staff), low stock (to staff).
12. **Offline support + connection recovery** – using AsyncStorage:
    - cache current token, hospital list, admission requests, messages,
    - "You are offline" banner (NetInfo),
    - queue chat messages created offline and resend when online,
    - Socket.io auto-reconnects and the app refetches the live queue after reconnecting.
13. **Permissions** – location (nearby hospitals), camera/gallery (referral/report photos, chat images), notifications.

### Not in scope
- No SQLite (AsyncStorage only for local storage).
- No payments, no video consultation, no maps SDK screens (distance is calculated, an "Open in Maps" link is enough), no AI/ML.

---

## 5. Tech stack

### Mobile app (`/app`)
- React Native with **Expo** (JavaScript, not TypeScript)
- `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`
- `react-native-screens`, `react-native-safe-area-context`
- `axios` – REST API calls
- `socket.io-client` – real-time
- `@react-native-async-storage/async-storage` – token, user, cache, offline queue
- `@react-native-community/netinfo` – online/offline detection
- `expo-location` – location permission and coordinates
- `expo-image-picker` – camera/gallery
- `expo-notifications` + `expo-device` – push notifications
- Styling: React Native `StyleSheet` (no UI library needed)
- State: React Context (`AuthContext`, `SocketContext`) + `useState`/`useEffect`. No Redux.

### Server (`/server`)
- Node.js + Express
- MongoDB Atlas + **Mongoose**
- `jsonwebtoken`, `bcryptjs` – auth
- `socket.io` – real-time events
- `multer` – image upload (stored in `/server/uploads`, served statically)
- `node-cron` – daily job: auto-close yesterday's OPD sessions, low-stock check
- `expo-server-sdk` – sending push notifications
- `dotenv`, `cors`, `nodemon` (dev)

### Environment variables (`/server/.env`)
```
PORT=5000
MONGO_URI=<mongodb atlas connection string>
JWT_SECRET=<any long random string>
```
App side: put the server base URL in `app/src/config.js` (use the computer's local IP, e.g. `http://192.168.1.5:5000`, so the phone with Expo Go can reach it).

---

## 6. Architecture (how data flows)

```
 Phone (React Native app)
   ├── Screens
   ├── services/api.js      → REST (pull)  ──┐
   ├── services/socket.js   → Socket.io (push) ─┤
   └── services/storage.js  → AsyncStorage (local cache, token, queue)
                                              │
 Server (Express + Socket.io)  ◄──────────────┘
   ├── routes / controllers
   ├── socket handlers
   ├── cron jobs
   └── push notification helper
         │
 MongoDB Atlas (main database, shared by everyone)
```

- **Pull model**: app asks server for data (hospital list, beds, my token, admissions).
- **Push model**: server sends events to app (queue moved, token called, bed freed, status changed, new message) via Socket.io, plus push notifications when the app is in background/closed.

---

## 7. Folder structure

```
carequeue/
├── PROJECT_CONTEXT.md
├── README.md
├── app/
│   ├── App.js
│   ├── app.json
│   └── src/
│       ├── config.js
│       ├── navigation/
│       │   ├── RootNavigator.js      # decides Auth / Patient / Staff / Admin
│       │   ├── AuthStack.js
│       │   ├── PatientTabs.js
│       │   ├── StaffTabs.js
│       │   └── AdminStack.js
│       ├── screens/
│       │   ├── auth/       LoginScreen, RegisterScreen
│       │   ├── patient/    HomeScreen, HospitalsScreen, HospitalDetailScreen,
│       │   │               BookTokenScreen, MyTokenScreen (live queue),
│       │   │               AdmissionRequestScreen, MyAdmissionsScreen, ProfileScreen
│       │   ├── staff/      DashboardScreen, HospitalSetupScreen, OPDControlScreen,
│       │   │               BedsScreen, AdmissionsScreen, AssignBedScreen,
│       │   │               StockScreen, DispenseScreen
│       │   ├── admin/      HospitalsVerifyScreen, CityDashboardScreen
│       │   └── shared/     AdmissionDetailScreen (status + chat), NotificationsScreen
│       ├── components/     Button, Input, Card, StatusBadge, TokenCard, BedCountRow,
│       │                   QueueProgress, OfflineBanner, EmptyState, Loader
│       ├── context/        AuthContext.js, SocketContext.js
│       ├── services/       api.js, socket.js, storage.js, notifications.js,
│       │                   location.js, offlineQueue.js
│       └── utils/          distance.js, waitTime.js, constants.js
└── server/
    ├── index.js            # express + socket.io + cron start
    ├── config/db.js
    ├── models/             User.js, Hospital.js, OpdSession.js, Token.js, Bed.js,
    │                       Admission.js, Medicine.js, Dispense.js, Message.js,
    │                       Notification.js
    ├── middleware/         auth.js (verify JWT), role.js (allow roles), upload.js (multer)
    ├── routes/             auth, users, hospitals, opd, tokens, beds, admissions,
    │                       medicines, messages, notifications, admin
    ├── controllers/        one per route file
    ├── socket/index.js     # connection, rooms, events
    ├── jobs/               closeSessions.js, lowStock.js
    ├── utils/push.js       # send Expo push notification
    ├── utils/distance.js   # haversine
    ├── seed.js             # sample hospitals, departments, beds, medicines, users
    └── uploads/
```

---

## 8. Database models (Mongoose)

**User**
```
name, email (unique), password (hashed), phone,
role: 'patient' | 'staff' | 'admin',
age, gender, bloodGroup,
location: { lat, lng },
hospitalId (ref Hospital, only for staff),
pushToken, createdAt
```

**Hospital**
```
name, address, phone, location: { lat, lng },
departments: [{ code: 'GM', name: 'General Medicine', avgConsultMins: 8 }],
verified (bool, default false), createdBy (ref User), createdAt
```

**OpdSession** (one per department per day)
```
hospitalId, departmentCode, date (YYYY-MM-DD),
status: 'open' | 'closed',
currentTokenNo (number, default 0), lastTokenNo (number, default 0),
openedBy, createdAt
```

**Token**
```
sessionId (ref OpdSession), hospitalId, departmentCode,
patientId (ref User), tokenNo (number), displayNo ('GM-017'),
status: 'waiting' | 'called' | 'in_consultation' | 'completed' | 'skipped' | 'cancelled',
notifiedNear (bool),   # to avoid sending "your turn is near" twice
createdAt, calledAt, completedAt
```

**Bed**
```
hospitalId, bedNo ('ICU-03'),
type: 'general' | 'icu' | 'oxygen' | 'ventilator' | 'pediatric',
ward, status: 'free' | 'occupied' | 'maintenance',
admissionId (ref Admission, when occupied), updatedAt
```

**Admission**
```
patientId (ref User), hospitalId (ref Hospital),
bedType, reason, urgency: 'normal' | 'urgent' | 'critical',
reportUrl, note,
status: 'pending' | 'approved' | 'rejected' | 'admitted' | 'discharged' | 'cancelled',
bedId (ref Bed, set when admitted),
statusHistory: [{ status, at, by }],
createdAt, updatedAt
```

**Medicine** (small stock list per hospital)
```
hospitalId, name, quantity, unit ('tablets' | 'strips' | 'bottles' | 'units'),
minLevel, updatedAt
```

**Dispense**
```
hospitalId, medicineId, patientId,
tokenId or admissionId (one of them), quantity,
dispensedBy (ref User), createdAt
```

**Message**
```
admissionId (ref Admission), senderId (ref User),
text, imageUrl, createdAt
```

**Notification**
```
userId, title, body,
type: 'queue' | 'admission' | 'message' | 'stock' | 'system',
data (object), read (bool), createdAt
```

---

## 9. REST API

All routes start with `/api`. Protected routes need header `Authorization: Bearer <token>`.

| Method | Route | Who | Purpose |
|---|---|---|---|
| POST | /auth/register | public | create account (role patient or staff) |
| POST | /auth/login | public | returns `{ token, user }` |
| GET | /users/me | any | current user |
| PUT | /users/me | any | update profile, location |
| PUT | /users/push-token | any | save Expo push token |
| POST | /hospitals | staff | create own hospital with departments |
| GET | /hospitals/nearby?lat=&lng= | patient | verified hospitals sorted by distance, with free beds per type and waiting count per department |
| GET | /hospitals/:id | any | hospital detail + departments + bed summary + open sessions |
| PUT | /hospitals/:id | staff (owner) | update hospital / departments |
| POST | /opd/sessions | staff | open today's session for a department |
| PUT | /opd/sessions/:id/close | staff | close session |
| GET | /opd/sessions/:id | any | session with currentTokenNo and waiting count |
| POST | /opd/sessions/:id/next | staff | call next waiting token |
| POST | /tokens | patient | book token `{ sessionId }` (one active token per patient per session) |
| GET | /tokens/mine | patient | my active + past tokens with position and estimated wait |
| GET | /tokens/session/:sessionId | staff | all tokens in a session |
| PUT | /tokens/:id/status | staff (called/in_consultation/completed/skipped), patient (cancel) | change status |
| GET | /beds | staff | beds of my hospital |
| POST | /beds | staff | add bed |
| PUT | /beds/:id | staff | change status / details |
| POST | /admissions | patient | create request (multipart, optional report image) |
| GET | /admissions/mine | patient | my requests |
| GET | /admissions/incoming | staff | requests for my hospital |
| GET | /admissions/:id | owner/staff | detail |
| PUT | /admissions/:id/status | staff (approve/reject/admit with bedId/discharge), patient (cancel) | change status, update bed |
| GET | /medicines | staff | stock list with low-stock flag |
| POST | /medicines | staff | add medicine |
| PUT | /medicines/:id | staff | edit / restock |
| POST | /medicines/dispense | staff | `{ medicineId, patientId, quantity, tokenId?/admissionId? }` reduces stock |
| GET | /messages/:admissionId | owner/staff | chat history |
| POST | /messages/:admissionId | owner/staff | send message (multipart, optional image) |
| GET | /notifications | any | my notifications |
| PUT | /notifications/:id/read | any | mark as read |
| GET | /admin/hospitals | admin | all hospitals |
| PUT | /admin/hospitals/:id/verify | admin | `{ verified: true/false }` |
| GET | /admin/city-dashboard | admin | per hospital: free beds by type, waiting OPD patients, pending admissions |
| GET | /admin/users | admin | list users |
| GET | /admin/stats | admin | totals |

Response format: success → JSON data; error → `{ message: "..." }` with proper status code.

**Important logic**
- Token number = `session.lastTokenNo + 1` (update atomically with `findOneAndUpdate` + `$inc`).
- Position = count of tokens in the session with status `waiting` and `tokenNo` less than mine.
- Estimated wait = `position × department.avgConsultMins`.
- After every "call next", find waiting tokens whose position is now ≤ 3 and `notifiedNear = false` → send "Your turn is near" push and set `notifiedNear = true`.
- Admitting a patient requires a `free` bed of the requested type; the bed becomes `occupied`. Discharge frees it.

---

## 10. Socket.io events

Client connects with `auth: { token }`. Server verifies JWT and joins rooms:
- `user:<userId>` – every user
- `hospital:<hospitalId>` – staff of that hospital
- `session:<sessionId>` – joined when MyTokenScreen or OPDControlScreen opens (`join_session` / `leave_session`)
- `admission:<admissionId>` – joined when AdmissionDetail opens (`join_admission` / `leave_admission`)
- `city` – admins (city dashboard)

| Event | Direction | Payload | When |
|---|---|---|---|
| `join_session` / `leave_session` | client → server | `{ sessionId }` | open/leave queue screen |
| `join_admission` / `leave_admission` | client → server | `{ admissionId }` | open/leave admission detail |
| `queue:updated` | server → session room | `{ sessionId, currentTokenNo, waitingCount }` | token called / skipped / completed / booked |
| `token:called` | server → user room | `{ tokenId, displayNo }` | patient's token is called |
| `beds:updated` | server → hospital room + city room | `{ hospitalId, freeByType }` | bed status changes |
| `admission:new` | server → hospital room | admission | patient creates request |
| `admission:status` | server → user room + admission room | `{ admissionId, status }` | status changes |
| `message:new` | server → admission room | message | new chat message |
| `stock:low` | server → hospital room | medicine | quantity drops below minLevel |

Whenever an important socket event is sent (token called, turn near, admission status, new message, low stock), the server **also** sends an Expo push notification + saves a Notification document, so users get it even when the app is closed.

---

## 11. Screens and navigation

**RootNavigator** checks AuthContext:
- not logged in → `AuthStack` (Login, Register)
- role `patient` → `PatientTabs`
- role `staff` → `StaffTabs` (if staff has no hospital yet → HospitalSetupScreen first)
- role `admin` → `AdminStack`

**PatientTabs** (bottom tabs, each tab is a stack):
- Home – greeting, **active token card** (my number, now serving, position, est. wait), quick actions (Book Token, Find Bed)
- Hospitals – nearby list (distance, free beds, queue length) → HospitalDetail (departments with live waiting count, bed counts) → BookToken / AdmissionRequest
- My Visits – MyToken (live queue screen) and MyAdmissions list → AdmissionDetail (status timeline + chat)
- Profile – details, update location, notifications, logout

**StaffTabs**:
- Dashboard – today's waiting patients per department, free/occupied beds, pending admissions, low-stock count
- OPD – choose department → open/close session → OPDControl (current token, "Call Next", skip, complete, waiting list)
- Beds – FlatList grouped by type with status toggle, add bed
- Admissions – incoming list by status → AdmissionDetail (approve/reject, AssignBed, discharge, chat)
- Stock – medicine list with low-stock badge, add/restock, Dispense screen

**AdminStack**: CityDashboard (all hospitals with bed and queue numbers, live), HospitalsVerify (verify/reject buttons).

Data between screens is passed with `navigation.navigate('Screen', { id })` and read with `route.params`.

---

## 12. Offline & connection recovery (AsyncStorage)

Keys:
- `token`, `user`
- `cache:myToken`, `cache:hospitals`, `cache:admissions`, `cache:messages:<admissionId>`, `cache:staffDashboard`
- `offlineQueue` – array of `{ type: 'message', payload, createdAt }`

Rules:
1. Every list screen: show cached data immediately → fetch from server → update UI + cache.
2. If fetch fails and NetInfo says offline → keep cached data, show `OfflineBanner` with "last updated" time.
3. Sending a chat message while offline → add to `offlineQueue`, show it as "pending". Booking a token or admission requires internet (show a clear message) because they depend on live data.
4. When NetInfo changes to online → process queue in order, then refetch current screen.
5. Socket.io has `reconnection: true`; on `connect` event, re-join rooms and **refetch the live queue** so the token position is correct.
6. When the app comes back to foreground (`AppState` = active) → refetch (application lifecycle).

---

## 13. Build phases (one git commit + push per phase)

| # | Phase | What to build | Commit message |
|---|---|---|---|
| 0 | Setup | Expo app in `/app`, Express server in `/server`, MongoDB connection, `.gitignore` (node_modules, .env, uploads) | `chore: project setup` |
| 1 | Navigation + screens | All navigators and screens with placeholder UI and dummy data, shared components | `feat: navigation and screens` |
| 2 | Auth + roles + profile | User model, register/login, JWT middleware, AuthContext, token in AsyncStorage, role-based routing, profile editing | `feat: role-based auth and patient profile` |
| 3 | Hospitals + admin verify | Hospital model with departments, HospitalSetup for staff, admin verify screen | `feat: hospital management and admin verification` |
| 4 | OPD queue | OpdSession + Token models, open/close session, book token, call next/skip/complete, position + wait time | `feat: opd token queue` |
| 5 | Beds + nearby | Bed model + CRUD, free counts, location permission, nearby hospitals sorted by distance | `feat: bed availability and nearby hospitals` |
| 6 | Admissions | Admission model, request with report image (image picker + multer), approve/reject/admit (assign bed)/discharge | `feat: admission workflow with bed assignment` |
| 7 | Real-time + chat | Socket.io server + client, rooms, live queue, bed and admission events, chat in AdmissionDetail | `feat: realtime queue, beds and chat` |
| 8 | Push notifications | Expo push token registration, push helper, "turn is near" logic, notifications screen | `feat: push notifications` |
| 9 | Medicines + city dashboard | Medicine stock, dispense, low-stock alert + cron, admin city dashboard (live) | `feat: medicine dispensing and city dashboard` |
| 10 | Offline + recovery | Cache, OfflineBanner, offline message queue, reconnect + foreground refetch | `feat: offline support and connection recovery` |
| 11 | Polish + build | Seed script, loading/empty/error states, README with lecture mapping, EAS build APK | `docs: readme and release build` |

**Finish one phase completely and make sure the app runs before starting the next.**

---

## 14. Course topic mapping (for README and viva)

| Lecture topic | Where it is in CareQueue |
|---|---|
| Mobile platforms, cross-platform rendering | One Expo codebase for Android + iOS |
| Application lifecycle | AppState foreground refetch of live queue, background push notifications |
| Screen architecture, screens | Role-based navigators, screens folder per role |
| Screen communication | `route.params` (hospitalId, sessionId, admissionId), stack + tabs |
| List rendering | FlatList for hospitals, tokens, beds, admissions, medicines, messages, notifications |
| UI/UX | Live token card, queue progress, status badges, bed count rows, empty & loading states |
| Data storage, local persistence | AsyncStorage: auth token, user, cached token/hospitals/admissions |
| Interfaces, communication, network requests | Axios REST API with auth header |
| Pull and push models | REST fetching (pull) vs Socket.io live queue + push notifications (push) |
| Message architecture | Queue/bed/admission events with rooms, chat messages |
| Connection recovery | NetInfo, offline message queue, socket reconnect, queue refetch |
| Permissions, device permissions | Location, camera/gallery, notifications |
| Media, media persistence | Referral/report and chat images uploaded to server, URLs cached locally |
| Application runtime | Background notifications, foreground refresh |
| Application build | EAS build → APK |

---

## 15. Coding rules for the agent

- Use **JavaScript** (not TypeScript) and **functional components with hooks**.
- Keep files small; one screen per file; shared UI in `components/`.
- All API calls go through `services/api.js` (axios instance that adds the token automatically).
- All AsyncStorage access goes through `services/storage.js`.
- Use `StyleSheet.create` at the bottom of each file. Consistent colors in `utils/constants.js` (primary teal/blue `#00796B` for a hospital theme).
- Always handle loading, empty and error states on list screens.
- Validate inputs on both app and server (required fields, valid bed type, one active token per patient per session, quantity > 0).
- Never commit `.env`, `node_modules` or `uploads/`.
- Add short comments explaining *why* in non-obvious places — the student must be able to explain the code in a viva.
- Don't add libraries outside the stack above without asking.
- Work **phase by phase**; at the end of each phase, list the files changed and the git commit command.
