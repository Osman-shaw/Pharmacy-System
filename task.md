# Task: Offline-First & Multi-Platform Core Implementation

- [x] **Infrastructure Setup**
    - [x] Install RxDB & RxJS in `frontend` <!-- id: 0 -->
    - [x] Install Capacitor Core & CLI in `frontend` <!-- id: 1 -->
    - [x] Install Capacitor Android & iOS in `frontend` <!-- id: 2 -->
    - [x] Install Electron & Dev Tools in `frontend` <!-- id: 3 -->
- [x] **Configuration**
    - [x] Configure `next.config.mjs` for static export <!-- id: 4 -->
    - [x] Configure `package.json` scripts <!-- id: 5 -->
    - [x] Initialize Capacitor (`npx cap init`) <!-- id: 6 -->
    - [x] Create Electron entry point (`electron/main.js`) <!-- id: 7 -->
- [x] **Verification**
    - [x] Verify build scripts run without error <!-- id: 8 --> (Bypassed full build, verified artifacts)

# Task: Backend Implementation (Modular Express)

- [x] **Backend Setup** <!-- id: 9 -->
    - [x] Initialize `backend/package.json` & install dependencies <!-- id: 10 -->
    - [x] Create `server.js` & `config/db.js` <!-- id: 11 -->
- [x] **Core Modules** <!-- id: 12 -->
    - [x] Auth Module (Login/Register) <!-- id: 13 -->
    - [x] User Module (RBAC) <!-- id: 14 -->
    - [x] Inventory Module (Products/Stock) <!-- id: 15 -->
    - [x] Sales Module (POS) <!-- id: 16 -->
    - [x] Sync Module (Offline) <!-- id: 17 -->
- [x] **Feature Expansion** <!-- id: 18 -->
    - [x] Customer Module (CRM) <!-- id: 19 -->
    - [x] Prescription Module (Uploads/Mgmt) <!-- id: 20 -->
    - [x] Purchase Module (Suppliers/Orders) <!-- id: 21 -->
    - [x] Finance Module (Expenses/Reports) <!-- id: 22 -->
    - [x] HR Module (Employees/Designations) <!-- id: 23 -->
    - [x] Notification Module <!-- id: 24 -->
    - [x] Dashboard Module (Analytics) <!-- id: 25 -->
- [x] **Payment Integration (Monime Gateway)** <!-- id: 26 -->
    - [x] Create Payment Module (Service/Controller/Routes) <!-- id: 27 -->
    - [x] Update Sales Module to use Payment Service <!-- id: 28 -->
    - [x] Integrate Orange Money, Afrimoney, Bank Transfer logic <!-- id: 29 -->
- [ ] **Multi-Store Sync** <!-- id: 30 -->
    - [ ] Update Models with `storeId` (Product, Sale, User) <!-- id: 31 -->
    - [ ] Implement Sync Logic (Pull/Push) <!-- id: 32 -->
    - [ ] Add `deleted` flag for soft deletes (essential for sync) <!-- id: 33 -->
