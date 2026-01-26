# Backend Implementation Plan: Modular Express Architecture

This plan outlines the creation of a robust, modular Node.js/Express backend to support the offline-first Pharmacy System. It uses a "Module" pattern (similar to NestJS) to organize Controllers, Services, and Models, ensuring scalability and maintainability.

## User Review Required
> [!NOTE]
> **Architecture Choice**: I have chosen a **Modular Express** architecture (Controllers, Services, Routes per module) instead of NestJS to save disk space and reduce complexity while meeting your request for "modules and controllers".
> **Database**: I am assuming **MongoDB** (with Mongoose) as the backend database because it maps naturally to RxDB (JSON documents) and is excellent for synchronization.

## Proposed Changes

### Backend Structure (`d:/pharmacy/backend`)

#### [NEW] Infrastructure
- **package.json**: Dependencies (`express`, `mongoose`, `cors`, `dotenv`, `zod`, `helmet`, `morgan`).
- **server.js**: Entry point.
- **config**: Database connection and environment variables.

#### [NEW] Modules
Each module will contain `routes`, `controller`, `service`, and `model`.

1.  **Auth Module**
    - `auth.controller.js`: Login, register, refresh token.
    - `auth.service.js`: User verification, JWT generation.
    - `auth.routes.js`: `/api/auth/login`, `/api/auth/register`.

2.  **User Module** (RBAC)
    - `user.model.js`: Schema with roles (Admin, Pharmacist, Cashier).
    - `user.controller.js`: CRUD for users.

3.  **Inventory Module**
    - `product.model.js`: Medicine/Supply details, stock levels, batch numbers.
    - `inventory.controller.js`: Stock updates, low stock alerts.

4.  **Sales Module**
    - `sale.model.js`: Transaction records, items sold, total amount, payment method (Orange Money, Afrimoney).
    - `sales.controller.js`: Process sales, generate receipts.

5.  **Sync Module** (Offline-First Support)
    - `sync.controller.js`: Endpoints for RxDB replication (pull/push changes).
    - `sync.service.js`: Logic to handle diffs and conflict resolution.

## Verification Plan

### Automated Tests
- **Server Start**: Verify `npm start` launches the server on port 5000 (or configured port).
- **Health Check**: `GET /health` returns status 200.
- **Database Connection**: Verify MongoDB connection on startup.

### Manual Verification
- **API Testing**: Use `curl` or a script to hit `/api/auth/register` and confirm user creation.
