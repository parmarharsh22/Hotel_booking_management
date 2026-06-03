# 🏨 Hotel Booking Management System (HBMS) — SaaS Edition

> A multi-tenant SaaS platform for hotel management. A **Super Admin** onboards hotels (tenants). Each hotel gets its own **Hotel Admin** who manages staff, rooms, and operations. Guests book rooms across any hotel on the platform.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Libraries](#2-tech-stack--libraries)
3. [Folder Structure](#3-folder-structure)
4. [Database Schema](#4-database-schema)
   - [Tenant & Auth Tables](#tenant--auth-tables)
   - [Room & Inventory Tables](#room--inventory-tables)
   - [Booking & Transaction Tables](#booking--transaction-tables)
   - [Operations Tables](#operations-tables)
   - [Lookup Tables](#lookup-tables)
   - [Audit Tables](#audit-tables)
   - [Entity Relationship Overview](#entity-relationship-overview)
5. [Multi-Tenant Architecture](#5-multi-tenant-architecture)
6. [Build Order — What to Build First](#6-build-order--what-to-build-first)
7. [Module Breakdown & Routes](#7-module-breakdown--routes)
   - [Phase 1 — Super Admin & Tenant Setup](#phase-1--super-admin--tenant-setup)
   - [Phase 2 — Auth & Session](#phase-2--auth--session)
   - [Phase 3 — Room Search & Discovery](#phase-3--room-search--discovery)
   - [Phase 4 — Booking Holds](#phase-4--booking-holds)
   - [Phase 5 — Reservations & Bookings](#phase-5--reservations--bookings)
   - [Phase 6 — Payments](#phase-6--payments)
   - [Phase 7 — Front Desk Operations](#phase-7--front-desk-operations)
   - [Phase 8 — Invoice & Billing](#phase-8--invoice--billing)
   - [Phase 9 — Housekeeping](#phase-9--housekeeping)
   - [Phase 10 — Hotel Admin Panel](#phase-10--hotel-admin-panel)
   - [Phase 11 — Super Admin Panel](#phase-11--super-admin-panel)
   - [Phase 12 — Reports & Logs](#phase-12--reports--logs)
8. [Full API Route Reference](#8-full-api-route-reference)
9. [Activity Logging System](#9-activity-logging-system)
10. [2-Week Sprint Plan](#10-2-week-sprint-plan)
11. [GitLab Workflow](#11-gitlab-workflow)
12. [Environment Setup](#12-environment-setup)
13. [Team & Roles](#13-team--roles)

---

## 1. Project Overview

HBMS is a **multi-tenant** hotel management SaaS. A single deployment serves many hotels. Each hotel is an isolated tenant — its data is never visible to other hotels.

### User Roles

| Role | Scope | Access |
|------|-------|--------|
| **Super Admin** | Platform-wide | Onboard hotels, manage tenants, view all logs, platform reports |
| **Hotel Admin** | Single hotel | Rooms, staff, pricing, policies, hotel-level reports |
| **Front Desk Staff** | Single hotel | Check-in/out, billing, housekeeping, reservation search |
| **Guest (Auth)** | Cross-hotel | Book, modify, cancel reservations, view history |
| **Guest (Unauth)** | Cross-hotel | Search rooms across all hotels, register |

### Tenant Isolation Strategy

- Every core table has a `hotel_id` foreign key (shared-schema, row-level isolation).
- All middleware reads `req.session.user.hotel_id` and injects it into every query.
- Super Admin bypasses `hotel_id` filtering — sees the full platform.
- A `tenant.middleware.ts` guard ensures staff cannot touch another hotel's data even if they manipulate the URL.

---

## 2. Tech Stack & Libraries

### Core Stack

| Layer | Technology |
|-------|-----------|
| Language | **TypeScript** (strict mode) |
| Templating | EJS |
| Backend | Node.js + Express.js |
| Database | MySQL |
| Styling | Tailwind CSS |

### Libraries

| Library | Purpose | Install |
|---------|---------|---------|
| `express` | HTTP server & routing | `npm i express` |
| `@types/express` | TypeScript types | `npm i -D @types/express` |
| `ejs` + `@types/ejs` | Templating | `npm i ejs && npm i -D @types/ejs` |
| `mysql2` | MySQL driver (promise) | `npm i mysql2` |
| `bcryptjs` + `@types/bcryptjs` | Password hashing | `npm i bcryptjs && npm i -D @types/bcryptjs` |
| `express-session` + `@types/express-session` | Session auth | `npm i express-session && npm i -D @types/express-session` |
| `connect-flash` + `@types/connect-flash` | Flash messages | `npm i connect-flash && npm i -D @types/connect-flash` |
| `nodemailer` + `@types/nodemailer` | Emails | `npm i nodemailer && npm i -D @types/nodemailer` |
| `dotenv` | Env vars | `npm i dotenv` |
| `method-override` + `@types/method-override` | PUT/DELETE from forms | `npm i method-override && npm i -D @types/method-override` |
| `express-validator` | Input validation | `npm i express-validator` |
| `multer` + `@types/multer` | File uploads | `npm i multer && npm i -D @types/multer` |
| `node-cron` + `@types/node-cron` | Expire holds cron | `npm i node-cron && npm i -D @types/node-cron` |
| `dayjs` | Date math | `npm i dayjs` |
| `morgan` + `@types/morgan` | HTTP logging | `npm i morgan && npm i -D @types/morgan` |
| `uuid` + `@types/uuid` | Booking reference IDs | `npm i uuid && npm i -D @types/uuid` |
| `ts-node` | Run TS in dev | `npm i -D ts-node` |
| `typescript` | TS compiler | `npm i -D typescript` |
| `nodemon` | Auto-restart | `npm i -D nodemon` |
| `tailwindcss` | CSS framework | `npm i -D tailwindcss` |
| `razorpay` | Payments | `npm i razorpay` |

> **TypeScript Config:** `"strict": true`, `"module": "CommonJS"`, `"target": "ES2020"`, output to `dist/`.

---

## 3. Folder Structure

```
hbms/
├── src/
│   │
│   ├── config/
│   │   ├── db.ts                          # MySQL connection pool (mysql2/promise)
│   │   ├── mailer.ts                      # Nodemailer transporter
│   │   └── session.ts                     # express-session config
│   │
│   ├── controllers/
│   │   │
│   │   ├── superadmin/
│   │   │   ├── superadmin.controller.ts   # Login/logout for super admin
│   │   │   ├── tenant.controller.ts       # CRUD for hotels (tenants)
│   │   │   └── platform.controller.ts     # Platform-wide reports & logs
│   │   │
│   │   ├── auth.controller.ts             # Guest/staff register, login, logout, password reset
│   │   ├── room.controller.ts             # Room listing, search, availability
│   │   ├── hold.controller.ts             # Create/release 10-min booking holds
│   │   ├── booking.controller.ts          # Create, modify, cancel bookings
│   │   ├── payment.controller.ts          # Razorpay + manual payment recording
│   │   ├── invoice.controller.ts          # Invoice generation & download
│   │   ├── checkin.controller.ts          # Front desk: check-in / check-out
│   │   ├── housekeeping.controller.ts     # Task assignment & status updates
│   │   ├── admin.controller.ts            # Hotel admin: rooms, staff, policies
│   │   ├── report.controller.ts           # Occupancy & revenue reports (hotel-scoped)
│   │   └── log.controller.ts              # Activity log viewer
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts             # isLoggedIn, isSuperAdmin, isHotelAdmin, isFrontDesk
│   │   ├── tenant.middleware.ts           # Inject hotel_id; block cross-tenant access
│   │   └── validate.middleware.ts         # express-validator rule sets per route
│   │
│   ├── models/
│   │   ├── hotel.model.ts                 # Queries: hotels
│   │   ├── user.model.ts                  # Queries: users, user_roles
│   │   ├── room.model.ts                  # Queries: rooms, room_types, amenities
│   │   ├── availability.model.ts          # Queries: room_availability, availability_statuses
│   │   ├── hold.model.ts                  # Queries: booking_holds, booking_hold_rooms
│   │   ├── booking.model.ts               # Queries: bookings, booking_rooms
│   │   ├── payment.model.ts               # Queries: payments, payment_methods/types/statuses
│   │   ├── refund.model.ts                # Queries: refunds
│   │   ├── invoice.model.ts               # Queries: invoices
│   │   ├── incidental.model.ts            # Queries: incidental_charges
│   │   ├── guestId.model.ts               # Queries: guest_identifications, id_types
│   │   ├── housekeeping.model.ts          # Queries: housekeeping_tasks, task_statuses
│   │   ├── cancellation.model.ts          # Queries: cancellation_policies
│   │   └── log.model.ts                   # Queries: activity_logs, log_actions
│   │
│   ├── routes/
│   │   ├── index.routes.ts                # Public routes: home, search
│   │   ├── superadmin.routes.ts           # /superadmin/* (platform owner only)
│   │   ├── auth.routes.ts                 # /auth/*
│   │   ├── room.routes.ts                 # /rooms/*
│   │   ├── hold.routes.ts                 # /holds/*
│   │   ├── booking.routes.ts              # /bookings/*
│   │   ├── payment.routes.ts              # /payments/*
│   │   ├── frontdesk.routes.ts            # /frontdesk/*
│   │   ├── housekeeping.routes.ts         # /housekeeping/*
│   │   └── admin.routes.ts                # /admin/*
│   │
│   ├── types/
│   │   ├── express.d.ts                   # Extend Request: req.user, req.hotelId
│   │   ├── hotel.types.ts                 # Hotel, TenantStatus interfaces
│   │   ├── user.types.ts                  # User, UserRole interfaces
│   │   ├── room.types.ts                  # Room, RoomType, Amenity interfaces
│   │   ├── booking.types.ts               # Booking, BookingRoom, Hold interfaces
│   │   └── payment.types.ts               # Payment, Refund, Invoice interfaces
│   │
│   ├── utils/
│   │   ├── logger.ts                      # log() helper — writes to activity_logs
│   │   ├── referenceId.ts                 # Generate unique booking reference (uuid)
│   │   ├── dateHelpers.ts                 # dayjs wrappers for date range calculations
│   │   └── emailTemplates.ts              # HTML email strings for nodemailer
│   │
│   ├── constants/
│   │   ├── logActions.ts                  # Maps LOG action names → DB IDs
│   │   └── lookupIds.ts                   # Maps status/role names → DB IDs (loaded at startup)
│   │
│   ├── jobs/
│   │   └── expireHolds.ts                 # node-cron: release expired holds every minute
│   │
│   ├── views/
│   │   ├── layouts/
│   │   │   ├── main.ejs                   # Public / guest layout
│   │   │   ├── admin.ejs                  # Hotel admin layout
│   │   │   ├── frontdesk.ejs              # Front desk layout
│   │   │   └── superadmin.ejs             # Super admin layout
│   │   ├── partials/
│   │   │   ├── navbar.ejs
│   │   │   ├── footer.ejs
│   │   │   ├── flash.ejs
│   │   │   └── roomCard.ejs
│   │   ├── superadmin/
│   │   │   ├── login.ejs
│   │   │   ├── dashboard.ejs
│   │   │   ├── hotels.ejs                 # All tenants list
│   │   │   ├── hotel-new.ejs              # Add new hotel form
│   │   │   ├── hotel-edit.ejs             # Edit hotel details
│   │   │   ├── platform-reports.ejs
│   │   │   └── platform-logs.ejs
│   │   ├── auth/
│   │   │   ├── login.ejs
│   │   │   ├── register.ejs
│   │   │   └── forgotPassword.ejs
│   │   ├── rooms/
│   │   │   ├── search.ejs
│   │   │   ├── listing.ejs
│   │   │   └── detail.ejs
│   │   ├── bookings/
│   │   │   ├── checkout.ejs
│   │   │   ├── confirmation.ejs
│   │   │   ├── history.ejs
│   │   │   └── modify.ejs
│   │   ├── frontdesk/
│   │   │   ├── dashboard.ejs
│   │   │   ├── checkin.ejs
│   │   │   ├── checkout.ejs
│   │   │   └── billing.ejs
│   │   └── admin/
│   │       ├── dashboard.ejs
│   │       ├── rooms.ejs
│   │       ├── staff.ejs                  # Staff management (replaces plain users)
│   │       ├── reports.ejs
│   │       └── logs.ejs
│   │
│   ├── app.ts                             # Express app: middleware, routes, view engine
│   └── server.ts                          # Entry point — starts server + cron jobs
│
├── public/
│   ├── css/output.css                     # Tailwind compiled output
│   ├── js/main.js                         # Client-side JS
│   └── images/
│       ├── rooms/                         # Room photos (per hotel, uploaded via multer)
│       └── hotels/                        # Hotel logo / cover photos
│
├── sql/
│   ├── schema.sql                         # Full DB schema (run once to set up)
│   └── seed.sql                           # Sample data: 1 super admin + 2 demo hotels
│
├── dist/                                  # Compiled JS output (gitignored)
├── .env.example
├── .gitignore
├── tsconfig.json
├── tailwind.config.js
├── nodemon.json
└── package.json
```

---

## 4. Database Schema

> **Design rule:** No ENUMs anywhere. All statuses, types, and roles live in lookup tables connected via foreign keys. Adding a new room type or payment method is just an `INSERT`.

---

### Tenant & Auth Tables

```sql
-- ─────────────────────────────────────────────
-- HOTELS (one row = one tenant)
-- ─────────────────────────────────────────────
CREATE TABLE tenant_statuses (
  tenant_status_id  INT PRIMARY KEY AUTO_INCREMENT,
  status_name       VARCHAR(50) UNIQUE NOT NULL  -- ACTIVE, SUSPENDED, PENDING
);

CREATE TABLE hotels (
  hotel_id          INT PRIMARY KEY AUTO_INCREMENT,
  tenant_status_id  INT NOT NULL DEFAULT 1,
  name              VARCHAR(150) NOT NULL,
  slug              VARCHAR(100) UNIQUE NOT NULL,  -- url-safe identifier e.g. "grand-palace"
  address           TEXT,
  city              VARCHAR(100),
  state             VARCHAR(100),
  country           VARCHAR(100),
  phone             VARCHAR(20),
  email             VARCHAR(150),
  logo_url          VARCHAR(255),
  cover_url         VARCHAR(255),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (tenant_status_id) REFERENCES tenant_statuses (tenant_status_id)
);

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
CREATE TABLE user_roles (
  user_role_id  INT PRIMARY KEY AUTO_INCREMENT,
  role_name     VARCHAR(50) UNIQUE NOT NULL  -- SUPER_ADMIN, HOTEL_ADMIN, FRONT_DESK, GUEST
);

CREATE TABLE users (
  user_id       BIGINT PRIMARY KEY AUTO_INCREMENT,
  hotel_id      INT NULL,           -- NULL for SUPER_ADMIN and GUEST (guest is cross-hotel)
  user_role_id  INT NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  phone         VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  photo_url     VARCHAR(255),
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (hotel_id)     REFERENCES hotels     (hotel_id),
  FOREIGN KEY (user_role_id) REFERENCES user_roles (user_role_id)
);

CREATE TABLE password_reset_tokens (
  token_id    BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT NOT NULL,
  token       VARCHAR(255) UNIQUE NOT NULL,
  expires_at  DATETIME NOT NULL,
  used        TINYINT(1) DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users (user_id)
);
```

---

### Room & Inventory Tables

```sql
-- ─────────────────────────────────────────────
-- ROOM TYPES (hotel-scoped)
-- ─────────────────────────────────────────────
CREATE TABLE room_types (
  room_type_id    INT PRIMARY KEY AUTO_INCREMENT,
  hotel_id        INT NOT NULL,
  type_name       VARCHAR(100) NOT NULL,
  description     TEXT,
  base_price      DECIMAL(10,2) NOT NULL,
  max_occupancy   INT NOT NULL DEFAULT 2,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (hotel_id) REFERENCES hotels (hotel_id)
);

-- ─────────────────────────────────────────────
-- AMENITIES (shared lookup — any hotel can use any amenity)
-- ─────────────────────────────────────────────
CREATE TABLE amenities (
  amenity_id    INT PRIMARY KEY AUTO_INCREMENT,
  amenity_name  VARCHAR(100) UNIQUE NOT NULL  -- WiFi, AC, Pool, Gym, …
);

CREATE TABLE room_type_amenities (
  room_type_id  INT NOT NULL,
  amenity_id    INT NOT NULL,
  PRIMARY KEY (room_type_id, amenity_id),
  FOREIGN KEY (room_type_id) REFERENCES room_types (room_type_id),
  FOREIGN KEY (amenity_id)   REFERENCES amenities  (amenity_id)
);

-- ─────────────────────────────────────────────
-- ROOMS
-- ─────────────────────────────────────────────
CREATE TABLE room_statuses (
  room_status_id  INT PRIMARY KEY AUTO_INCREMENT,
  status_name     VARCHAR(50) UNIQUE NOT NULL  -- AVAILABLE, OCCUPIED, DIRTY, MAINTENANCE
);

CREATE TABLE rooms (
  room_id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  hotel_id        INT NOT NULL,
  room_type_id    INT NOT NULL,
  room_status_id  INT NOT NULL,
  room_number     VARCHAR(20) NOT NULL,
  floor           INT,
  photo_url       VARCHAR(255),
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_hotel_room (hotel_id, room_number),
  FOREIGN KEY (hotel_id)       REFERENCES hotels       (hotel_id),
  FOREIGN KEY (room_type_id)   REFERENCES room_types   (room_type_id),
  FOREIGN KEY (room_status_id) REFERENCES room_statuses(room_status_id)
);

-- ─────────────────────────────────────────────
-- ROOM AVAILABILITY (one row per room per date)
-- ─────────────────────────────────────────────
CREATE TABLE availability_statuses (
  availability_status_id  INT PRIMARY KEY AUTO_INCREMENT,
  status_name             VARCHAR(50) UNIQUE NOT NULL  -- AVAILABLE, BOOKED, HELD, MAINTENANCE
);

CREATE TABLE room_availability (
  availability_id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  hotel_id                INT NOT NULL,
  room_id                 BIGINT NOT NULL,
  availability_status_id  INT NOT NULL,
  date                    DATE NOT NULL,
  price_override          DECIMAL(10,2) NULL,   -- NULL = use room_type base_price

  UNIQUE KEY uq_room_date (room_id, date),
  FOREIGN KEY (hotel_id)               REFERENCES hotels              (hotel_id),
  FOREIGN KEY (room_id)                REFERENCES rooms               (room_id),
  FOREIGN KEY (availability_status_id) REFERENCES availability_statuses(availability_status_id)
);

CREATE INDEX idx_avail_hotel_date ON room_availability (hotel_id, date);
```

---

### Booking & Transaction Tables

```sql
-- ─────────────────────────────────────────────
-- BOOKING HOLDS (10-min pre-booking lock)
-- ─────────────────────────────────────────────
CREATE TABLE booking_holds (
  hold_id     BIGINT PRIMARY KEY AUTO_INCREMENT,
  hotel_id    INT NOT NULL,
  user_id     BIGINT NOT NULL,
  adults      INT NOT NULL DEFAULT 1,
  children    INT NOT NULL DEFAULT 0,
  checkin_date  DATE NOT NULL,
  checkout_date DATE NOT NULL,
  expires_at  DATETIME NOT NULL,
  is_active   TINYINT(1) DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (hotel_id) REFERENCES hotels (hotel_id),
  FOREIGN KEY (user_id)  REFERENCES users  (user_id)
);

CREATE TABLE booking_hold_rooms (
  hold_room_id  BIGINT PRIMARY KEY AUTO_INCREMENT,
  hold_id       BIGINT NOT NULL,
  room_type_id  INT NOT NULL,

  FOREIGN KEY (hold_id)      REFERENCES booking_holds (hold_id),
  FOREIGN KEY (room_type_id) REFERENCES room_types    (room_type_id)
);

-- ─────────────────────────────────────────────
-- BOOKINGS
-- ─────────────────────────────────────────────
CREATE TABLE booking_statuses (
  booking_status_id  INT PRIMARY KEY AUTO_INCREMENT,
  status_name        VARCHAR(50) UNIQUE NOT NULL  -- PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED
);

CREATE TABLE booking_sources (
  booking_source_id  INT PRIMARY KEY AUTO_INCREMENT,
  source_name        VARCHAR(50) UNIQUE NOT NULL  -- ONLINE, WALK_IN, PHONE
);

CREATE TABLE bookings (
  booking_id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  hotel_id            INT NOT NULL,
  user_id             BIGINT NOT NULL,
  booking_status_id   INT NOT NULL,
  booking_source_id   INT NOT NULL,
  booking_reference   VARCHAR(20) UNIQUE NOT NULL,  -- e.g. HBMS-A3F2K9
  checkin_date        DATE NOT NULL,
  checkout_date       DATE NOT NULL,
  adults              INT NOT NULL DEFAULT 1,
  children            INT NOT NULL DEFAULT 0,
  total_amount        DECIMAL(10,2) NOT NULL,
  special_requests    TEXT,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (hotel_id)           REFERENCES hotels          (hotel_id),
  FOREIGN KEY (user_id)            REFERENCES users           (user_id),
  FOREIGN KEY (booking_status_id)  REFERENCES booking_statuses(booking_status_id),
  FOREIGN KEY (booking_source_id)  REFERENCES booking_sources (booking_source_id)
);

CREATE INDEX idx_bookings_hotel_checkin ON bookings (hotel_id, checkin_date);

CREATE TABLE booking_rooms (
  booking_room_id  BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id       BIGINT NOT NULL,
  room_id          BIGINT NOT NULL,
  rate_per_night   DECIMAL(10,2) NOT NULL,

  FOREIGN KEY (booking_id) REFERENCES bookings (booking_id),
  FOREIGN KEY (room_id)    REFERENCES rooms    (room_id)
);

-- ─────────────────────────────────────────────
-- GUEST IDENTIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE id_types (
  id_type_id  INT PRIMARY KEY AUTO_INCREMENT,
  type_name   VARCHAR(50) UNIQUE NOT NULL  -- PASSPORT, DRIVING_LICENSE, AADHAR, OTHER
);

CREATE TABLE guest_identifications (
  guest_id_id    BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id     BIGINT NOT NULL,
  user_id        BIGINT NOT NULL,
  id_type_id     INT NOT NULL,
  id_number      VARCHAR(100),
  document_url   VARCHAR(255),
  uploaded_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (booking_id) REFERENCES bookings  (booking_id),
  FOREIGN KEY (user_id)    REFERENCES users      (user_id),
  FOREIGN KEY (id_type_id) REFERENCES id_types   (id_type_id)
);

-- ─────────────────────────────────────────────
-- CANCELLATION POLICIES
-- ─────────────────────────────────────────────
CREATE TABLE cancellation_policies (
  policy_id                  INT PRIMARY KEY AUTO_INCREMENT,
  hotel_id                   INT NOT NULL,
  room_type_id               INT NOT NULL,
  free_cancellation_hours    INT NOT NULL DEFAULT 24,
  refund_percentage          DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  created_at                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_hotel_roomtype_policy (hotel_id, room_type_id),
  FOREIGN KEY (hotel_id)     REFERENCES hotels     (hotel_id),
  FOREIGN KEY (room_type_id) REFERENCES room_types (room_type_id)
);

-- ─────────────────────────────────────────────
-- PAYMENTS
-- ─────────────────────────────────────────────
CREATE TABLE payment_methods (
  payment_method_id  INT PRIMARY KEY AUTO_INCREMENT,
  method_name        VARCHAR(50) UNIQUE NOT NULL  -- CARD, UPI, NETBANKING, WALLET, CASH
);

CREATE TABLE payment_types (
  payment_type_id  INT PRIMARY KEY AUTO_INCREMENT,
  type_name        VARCHAR(50) UNIQUE NOT NULL  -- ONLINE, OFFLINE
);

CREATE TABLE payment_statuses (
  payment_status_id  INT PRIMARY KEY AUTO_INCREMENT,
  status_name        VARCHAR(50) UNIQUE NOT NULL  -- PENDING, SUCCESS, FAILED, REFUNDED
);

CREATE TABLE payments (
  payment_id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  hotel_id            INT NOT NULL,
  booking_id          BIGINT NOT NULL,
  payment_method_id   INT NOT NULL,
  payment_type_id     INT NOT NULL,
  payment_status_id   INT NOT NULL,
  amount              DECIMAL(10,2) NOT NULL,
  razorpay_order_id   VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  razorpay_signature  VARCHAR(255),
  paid_at             TIMESTAMP NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (hotel_id)           REFERENCES hotels          (hotel_id),
  FOREIGN KEY (booking_id)         REFERENCES bookings        (booking_id),
  FOREIGN KEY (payment_method_id)  REFERENCES payment_methods (payment_method_id),
  FOREIGN KEY (payment_type_id)    REFERENCES payment_types   (payment_type_id),
  FOREIGN KEY (payment_status_id)  REFERENCES payment_statuses(payment_status_id)
);

CREATE TABLE refunds (
  refund_id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  hotel_id           INT NOT NULL,
  payment_id         BIGINT NOT NULL,
  booking_id         BIGINT NOT NULL,
  amount             DECIMAL(10,2) NOT NULL,
  reason             TEXT,
  razorpay_refund_id VARCHAR(100),
  refunded_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (hotel_id)   REFERENCES hotels   (hotel_id),
  FOREIGN KEY (payment_id) REFERENCES payments (payment_id),
  FOREIGN KEY (booking_id) REFERENCES bookings (booking_id)
);
```

---

### Operations Tables

```sql
-- ─────────────────────────────────────────────
-- INCIDENTAL CHARGES
-- ─────────────────────────────────────────────
CREATE TABLE incidental_charges (
  incidental_id  BIGINT PRIMARY KEY AUTO_INCREMENT,
  hotel_id       INT NOT NULL,
  booking_id     BIGINT NOT NULL,
  added_by       BIGINT NOT NULL,          -- user_id of front desk staff
  description    VARCHAR(255) NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  added_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (hotel_id)  REFERENCES hotels   (hotel_id),
  FOREIGN KEY (booking_id)REFERENCES bookings (booking_id),
  FOREIGN KEY (added_by)  REFERENCES users    (user_id)
);

-- ─────────────────────────────────────────────
-- INVOICES
-- ─────────────────────────────────────────────
CREATE TABLE invoices (
  invoice_id      BIGINT PRIMARY KEY AUTO_INCREMENT,
  hotel_id        INT NOT NULL,
  booking_id      BIGINT NOT NULL,
  room_charges    DECIMAL(10,2) NOT NULL,
  incidentals     DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount      DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount    DECIMAL(10,2) NOT NULL,
  generated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_booking_invoice (booking_id),
  FOREIGN KEY (hotel_id)  REFERENCES hotels   (hotel_id),
  FOREIGN KEY (booking_id)REFERENCES bookings (booking_id)
);

-- ─────────────────────────────────────────────
-- HOUSEKEEPING
-- ─────────────────────────────────────────────
CREATE TABLE task_statuses (
  task_status_id  INT PRIMARY KEY AUTO_INCREMENT,
  status_name     VARCHAR(50) UNIQUE NOT NULL  -- PENDING, IN_PROGRESS, COMPLETED
);

CREATE TABLE housekeeping_tasks (
  task_id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  hotel_id        INT NOT NULL,
  room_id         BIGINT NOT NULL,
  booking_id      BIGINT NULL,             -- NULL for manual/ad-hoc tasks
  assigned_to     BIGINT NULL,             -- user_id of staff member
  task_status_id  INT NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at    TIMESTAMP NULL,

  FOREIGN KEY (hotel_id)       REFERENCES hotels       (hotel_id),
  FOREIGN KEY (room_id)        REFERENCES rooms        (room_id),
  FOREIGN KEY (booking_id)     REFERENCES bookings     (booking_id),
  FOREIGN KEY (assigned_to)    REFERENCES users        (user_id),
  FOREIGN KEY (task_status_id) REFERENCES task_statuses(task_status_id)
);
```

---

### Audit Tables

```sql
-- ─────────────────────────────────────────────
-- ACTIVITY LOGS
-- ─────────────────────────────────────────────
CREATE TABLE log_actions (
  log_action_id  INT PRIMARY KEY AUTO_INCREMENT,
  action_name    VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE activity_logs (
  log_id           BIGINT PRIMARY KEY AUTO_INCREMENT,
  hotel_id         INT NULL,              -- NULL for super admin actions
  log_action_id    INT NOT NULL,
  user_id          BIGINT NULL,           -- NULL for system/cron actions
  target_type      VARCHAR(50),           -- 'booking' | 'room' | 'user' | 'hotel' | 'payment'
  target_id        BIGINT,
  http_method      VARCHAR(10),
  endpoint         VARCHAR(255),
  ip_address       VARCHAR(45),
  user_agent       VARCHAR(255),
  payload          JSON,                  -- sanitized request body (no passwords)
  response_status  INT,
  message          TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (hotel_id)      REFERENCES hotels     (hotel_id),
  FOREIGN KEY (log_action_id) REFERENCES log_actions(log_action_id),
  FOREIGN KEY (user_id)       REFERENCES users      (user_id)
);

CREATE INDEX idx_logs_hotel       ON activity_logs (hotel_id);
CREATE INDEX idx_logs_created_at  ON activity_logs (created_at);
CREATE INDEX idx_logs_action      ON activity_logs (log_action_id);
CREATE INDEX idx_logs_user        ON activity_logs (user_id);
CREATE INDEX idx_logs_target      ON activity_logs (target_type, target_id);
```

---

### Lookup Tables

| Table | Seed Values |
|-------|------------|
| `tenant_statuses` | ACTIVE, SUSPENDED, PENDING |
| `user_roles` | SUPER_ADMIN, HOTEL_ADMIN, FRONT_DESK, GUEST |
| `room_statuses` | AVAILABLE, OCCUPIED, DIRTY, MAINTENANCE |
| `availability_statuses` | AVAILABLE, BOOKED, HELD, MAINTENANCE |
| `booking_sources` | ONLINE, WALK_IN, PHONE |
| `booking_statuses` | PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED |
| `id_types` | PASSPORT, DRIVING_LICENSE, AADHAR, OTHER |
| `payment_methods` | CARD, UPI, NETBANKING, WALLET, CASH |
| `payment_types` | ONLINE, OFFLINE |
| `payment_statuses` | PENDING, SUCCESS, FAILED, REFUNDED |
| `task_statuses` | PENDING, IN_PROGRESS, COMPLETED |
| `log_actions` | see Activity Logging section |

---

### Entity Relationship Overview

```
hotels ──────────────────────────────────────────────────────────────────────┐
  │                                                                           │
  ├──< users (hotel_id NULL for SUPER_ADMIN / GUEST)                         │
  │                                                                           │
  ├──< room_types ──< room_type_amenities >── amenities                      │
  │       │                                                                   │
  │       └──< rooms ──< room_availability >── availability_statuses         │
  │               │                                                           │
  │               └──< housekeeping_tasks >── task_statuses                  │
  │                                                                           │
  ├──< bookings (hotel_id + user_id)                                         │
  │       │                                                                   │
  │       ├──< booking_rooms >── rooms                                       │
  │       ├──< guest_identifications >── id_types                            │
  │       ├──< incidental_charges                                             │
  │       ├──< payments >── refunds                                          │
  │       └──< invoices                                                       │
  │                                                                           │
  ├──< booking_holds ──< booking_hold_rooms >── room_types                   │
  ├──< cancellation_policies >── room_types                                  │
  └──< activity_logs (hotel_id NULL for platform-wide)                       │
                                                                              │
tenant_statuses ─────────────────────────────────────────────────────────────┘
```

---

## 5. Multi-Tenant Architecture

### How `hotel_id` Flows Through Every Request

```
Browser Request
      │
      ▼
auth.middleware.ts       ← sets req.user = session user (has hotel_id + role)
      │
      ▼
tenant.middleware.ts      ← for /admin/*, /frontdesk/*, /housekeeping/*:
                            verifies req.user.hotel_id matches the resource's hotel_id
      │
      ▼
Controller               ← always passes req.user.hotel_id into model queries
      │
      ▼
Model (e.g. booking.model.ts)  ← every SELECT/INSERT/UPDATE includes WHERE hotel_id = ?
```

### `src/middleware/tenant.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

// Attach hotel_id from session to req for easy use in controllers
export function attachHotel(req: Request, res: Response, next: NextFunction) {
  if (req.session?.user?.hotel_id) {
    req.hotelId = req.session.user.hotel_id;
  }
  next();
}

// Block staff from accessing a different hotel's resource
export function guardTenant(req: Request, res: Response, next: NextFunction) {
  const user = req.session?.user;
  if (!user) return res.redirect('/auth/login');

  // Super Admin bypasses tenant check
  if (user.role === 'SUPER_ADMIN') return next();

  const requestedHotelId = parseInt(req.params.hotelId || '0');
  if (requestedHotelId && requestedHotelId !== user.hotel_id) {
    return res.status(403).render('error', { message: 'Access denied' });
  }
  next();
}
```

### Session Shape

```typescript
// src/types/express.d.ts
declare module 'express-session' {
  interface SessionData {
    user: {
      user_id:    number;
      hotel_id:   number | null;  // null for SUPER_ADMIN, null for GUEST
      role:       'SUPER_ADMIN' | 'HOTEL_ADMIN' | 'FRONT_DESK' | 'GUEST';
      first_name: string;
      email:      string;
    };
  }
}

declare global {
  namespace Express {
    interface Request {
      hotelId?: number;
    }
  }
}
```

---

## 6. Build Order — What to Build First

Build in this exact order. Each phase depends on the one before it.

```
PHASE 1  →  Super Admin + Tenant Setup
            Reason: hotels must exist before any hotel-scoped data can be created.

PHASE 2  →  Auth & Session (Register / Login / Logout / Password Reset)
            Reason: users must exist and be authenticated before any action.

PHASE 3  →  Room Search & Discovery (Public)
            Reason: foundational read-only data — rooms, types, availability.
            Guests and staff both rely on this.

PHASE 4  →  Booking Holds (10-min lock)
            Reason: holds must exist before a booking can be confirmed.

PHASE 5  →  Reservations & Bookings (Create / Modify / Cancel)
            Reason: core business flow — hold → book.

PHASE 6  →  Payments (Razorpay + Manual)
            Reason: booking is only confirmed after payment.

PHASE 7  →  Front Desk (Check-in / Check-out / Incidentals)
            Reason: operates on confirmed bookings and payments.

PHASE 8  →  Invoice & Billing
            Reason: generated during check-out, depends on payments + incidentals.

PHASE 9  →  Housekeeping
            Reason: tasks are auto-created on check-out (Phase 7).

PHASE 10 →  Hotel Admin Panel (Rooms, Staff, Policies, Room Types)
            Reason: admin panel manages the data that all above phases read.
            (Can be done in parallel with Phases 3–9 by a separate team member.)

PHASE 11 →  Super Admin Panel (Tenant CRUD, Platform Reports)
            Reason: wraps everything — needs hotels, users, bookings to exist.

PHASE 12 →  Reports & Activity Logs
            Reason: pure read — queries across all phases, built last.
```

### Route Files to Create — In Order

```
1.  superadmin.routes.ts     ← Phase 1
2.  auth.routes.ts           ← Phase 2
3.  index.routes.ts          ← Phase 3 (public home + search)
4.  room.routes.ts           ← Phase 3
5.  hold.routes.ts           ← Phase 4
6.  booking.routes.ts        ← Phase 5
7.  payment.routes.ts        ← Phase 6
8.  frontdesk.routes.ts      ← Phase 7
9.  housekeeping.routes.ts   ← Phase 9
10. admin.routes.ts          ← Phase 10
```

---

## 7. Module Breakdown & Routes

---

### Phase 1 — Super Admin & Tenant Setup

**Controllers:** `superadmin/superadmin.controller.ts`, `superadmin/tenant.controller.ts`  
**Route file:** `superadmin.routes.ts`  
**Tables:** `hotels`, `tenant_statuses`, `users` (SUPER_ADMIN role)

> Super Admin has a **separate login page** at `/superadmin/login`. Their session has `hotel_id: null` and `role: SUPER_ADMIN`. The `isSuperAdmin` middleware guards all `/superadmin/*` routes.

#### Super Admin Auth

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/superadmin/login` | `showSuperLogin` | Super admin login form |
| POST | `/superadmin/login` | `superLogin` | Authenticate super admin |
| POST | `/superadmin/logout` | `superLogout` | Destroy super admin session |
| GET | `/superadmin/dashboard` | `dashboard` | Platform overview: total hotels, bookings, revenue |

#### Tenant (Hotel) Management

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/superadmin/hotels` | `listHotels` | All hotels with status, created date |
| GET | `/superadmin/hotels/new` | `showNewHotel` | New hotel form |
| POST | `/superadmin/hotels` | `createHotel` | Create hotel + seed Hotel Admin user |
| GET | `/superadmin/hotels/:hotelId` | `getHotel` | Hotel detail + stats |
| GET | `/superadmin/hotels/:hotelId/edit` | `showEditHotel` | Edit hotel form |
| PUT | `/superadmin/hotels/:hotelId` | `updateHotel` | Update hotel details |
| PUT | `/superadmin/hotels/:hotelId/status` | `updateHotelStatus` | Activate / Suspend hotel |
| DELETE | `/superadmin/hotels/:hotelId` | `deleteHotel` | Delete hotel (soft delete) |

> When a hotel is **created**, the system:
> 1. Inserts a row into `hotels`
> 2. Creates a default `HOTEL_ADMIN` user for that hotel
> 3. Sends a welcome email with login credentials to the hotel admin

---

### Phase 2 — Auth & Session

**Controller:** `auth.controller.ts`  
**Route file:** `auth.routes.ts`  
**Tables:** `users`, `user_roles`, `password_reset_tokens`

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/auth/register` | `showRegister` | Guest registration form |
| POST | `/auth/register` | `register` | Create GUEST user, hash password |
| GET | `/auth/login` | `showLogin` | Login form |
| POST | `/auth/login` | `login` | Authenticate, create session |
| POST | `/auth/logout` | `logout` | Destroy session |
| GET | `/auth/forgot-password` | `showForgotPassword` | Forgot password form |
| POST | `/auth/forgot-password` | `sendResetEmail` | Insert token, send email |
| GET | `/auth/reset-password/:token` | `showResetPassword` | Reset form |
| POST | `/auth/reset-password/:token` | `resetPassword` | Validate token, update hash |
| GET | `/auth/profile` | `showProfile` | View own profile |
| POST | `/auth/profile` | `updateProfile` | Update name / phone / photo |

---

### Phase 3 — Room Search & Discovery

**Controller:** `room.controller.ts`  
**Route files:** `index.routes.ts`, `room.routes.ts`  
**Tables:** `rooms`, `room_types`, `room_type_amenities`, `amenities`, `room_availability`, `room_statuses`, `hotels`

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/` | `home` | Landing page with search form (search across all hotels) |
| GET | `/rooms/search` | `searchRooms` | Filter by hotel, dates, guests, room type |
| GET | `/rooms` | `listRooms` | All rooms with filter/sort (requires `?hotelId=`) |
| GET | `/rooms/:roomId` | `getRoomDetail` | Room detail, amenities, availability calendar |
| GET | `/rooms/types` | `listRoomTypes` | All room types for a hotel (requires `?hotelId=`) |
| GET | `/rooms/availability` | `checkAvailability` | Date-range availability check (AJAX, `?hotelId=&roomId=`) |

---

### Phase 4 — Booking Holds

**Controller:** `hold.controller.ts`  
**Route file:** `hold.routes.ts`  
**Tables:** `booking_holds`, `booking_hold_rooms`, `room_availability`, `availability_statuses`

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| POST | `/holds` | `createHold` | Place 10-min hold, mark dates HELD in `room_availability` |
| DELETE | `/holds/:holdId` | `releaseHold` | Manually release hold, revert availability to AVAILABLE |
| GET | `/holds/:holdId` | `getHold` | Check hold status and expiry countdown |

> `jobs/expireHolds.ts` — cron runs every minute. Finds holds where `expires_at < NOW() AND is_active = 1`, sets `is_active = 0`, resets `room_availability` to AVAILABLE.

---

### Phase 5 — Reservations & Bookings

**Controller:** `booking.controller.ts`  
**Route file:** `booking.routes.ts`  
**Tables:** `bookings`, `booking_rooms`, `booking_statuses`, `booking_sources`, `room_availability`, `cancellation_policies`

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/bookings/new` | `showNewBooking` | Checkout form (requires active hold) |
| POST | `/bookings` | `createBooking` | Convert hold → booking, send confirmation email |
| GET | `/bookings` | `listMyBookings` | Guest's own booking history (all hotels) |
| GET | `/bookings/:bookingId` | `getBookingDetail` | Booking detail and status |
| GET | `/bookings/:bookingId/modify` | `showModifyBooking` | Modify booking form |
| PUT | `/bookings/:bookingId` | `modifyBooking` | Update dates/rooms (min 24hr before check-in) |
| DELETE | `/bookings/:bookingId` | `cancelBooking` | Cancel, trigger refund per `cancellation_policies` |
| GET | `/bookings/:bookingId/invoice` | `getInvoice` | View invoice for booking |

---

### Phase 6 — Payments

**Controller:** `payment.controller.ts`  
**Route file:** `payment.routes.ts`  
**Tables:** `payments`, `payment_methods`, `payment_types`, `payment_statuses`, `refunds`

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| POST | `/payments/online/initiate` | `initiateOnlinePayment` | Create Razorpay order |
| POST | `/payments/online/verify` | `verifyOnlinePayment` | Verify Razorpay signature, record payment |
| POST | `/payments/manual` | `recordManualPayment` | Front desk records CASH / CARD payment |
| POST | `/payments/refund/:bookingId` | `processRefund` | Calculate refund per policy, create `refunds` row |
| GET | `/payments/:bookingId` | `getPaymentStatus` | Payment status for a booking |

---

### Phase 7 — Front Desk Operations

**Controller:** `checkin.controller.ts`  
**Route file:** `frontdesk.routes.ts`  
**Tables:** `bookings`, `booking_rooms`, `guest_identifications`, `id_types`, `rooms`, `room_statuses`, `incidental_charges`

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/frontdesk` | `dashboard` | Today's arrivals and departures for this hotel |
| GET | `/frontdesk/search` | `searchReservation` | Search by booking reference or guest name |
| GET | `/frontdesk/checkin/:bookingId` | `showCheckIn` | Check-in form (ID upload + room assignment) |
| POST | `/frontdesk/checkin/:bookingId` | `processCheckIn` | Save guest ID, assign room, set CHECKED_IN + room OCCUPIED |
| GET | `/frontdesk/checkout/:bookingId` | `showCheckOut` | Checkout review with charges |
| POST | `/frontdesk/checkout/:bookingId` | `processCheckOut` | Mark CHECKED_OUT, generate invoice, auto-create housekeeping task |
| POST | `/frontdesk/incidentals/:bookingId` | `addIncidental` | Add incidental charge |
| GET | `/frontdesk/billing/:bookingId` | `getBilling` | Full billing summary with all charges |

---

### Phase 8 — Invoice & Billing

**Controller:** `invoice.controller.ts`  
**Route file:** registered inside `booking.routes.ts` and `frontdesk.routes.ts`  
**Tables:** `invoices`, `incidental_charges`, `payments`, `bookings`, `booking_rooms`

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/invoices/:bookingId` | `generateInvoice` | Compile room charges + tax + incidentals → upsert invoice row |
| GET | `/invoices/:bookingId/download` | `downloadInvoice` | Render invoice as printable HTML page |

---

### Phase 9 — Housekeeping

**Controller:** `housekeeping.controller.ts`  
**Route file:** `housekeeping.routes.ts`  
**Tables:** `housekeeping_tasks`, `task_statuses`, `rooms`, `room_statuses`

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/housekeeping` | `listTasks` | All PENDING / IN_PROGRESS tasks for this hotel |
| POST | `/housekeeping` | `createTask` | Create ad-hoc task (also auto-called on checkout) |
| PUT | `/housekeeping/:taskId` | `updateTaskStatus` | Mark IN_PROGRESS or COMPLETED |
| GET | `/housekeeping/room/:roomId` | `getTasksByRoom` | All tasks for a specific room |

> When task marked **COMPLETED**: `room_status_id` automatically flips back to AVAILABLE.

---

### Phase 10 — Hotel Admin Panel

**Controllers:** `admin.controller.ts`, `report.controller.ts`  
**Route file:** `admin.routes.ts`  
**Middleware:** `isHotelAdmin` — tenant-scoped

#### Room Management

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/admin/rooms` | `listRooms` | All rooms for this hotel with status |
| GET | `/admin/rooms/new` | `showNewRoom` | New room form |
| POST | `/admin/rooms` | `createRoom` | Create room (hotel_id from session) |
| GET | `/admin/rooms/:roomId/edit` | `showEditRoom` | Edit room form |
| PUT | `/admin/rooms/:roomId` | `updateRoom` | Update room details |
| DELETE | `/admin/rooms/:roomId` | `deleteRoom` | Delete room |
| PUT | `/admin/rooms/:roomId/status` | `updateRoomStatus` | Manually change room status |

#### Room Types & Amenities

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/admin/room-types` | `listRoomTypes` | Room types for this hotel |
| GET | `/admin/room-types/new` | `showNewRoomType` | New room type form |
| POST | `/admin/room-types` | `createRoomType` | Add room type |
| PUT | `/admin/room-types/:typeId` | `updateRoomType` | Update pricing/description |
| DELETE | `/admin/room-types/:typeId` | `deleteRoomType` | Delete room type |
| POST | `/admin/room-types/:typeId/amenities` | `addAmenity` | Link amenity to room type |
| DELETE | `/admin/room-types/:typeId/amenities/:amenityId` | `removeAmenity` | Unlink amenity |

#### Staff Management

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/admin/staff` | `listStaff` | All staff for this hotel (HOTEL_ADMIN + FRONT_DESK) |
| GET | `/admin/staff/new` | `showNewStaff` | Add staff form |
| POST | `/admin/staff` | `createStaff` | Create FRONT_DESK or HOTEL_ADMIN user for this hotel |
| GET | `/admin/staff/:userId/edit` | `showEditStaff` | Edit staff form |
| PUT | `/admin/staff/:userId` | `updateStaff` | Update staff details |
| PUT | `/admin/staff/:userId/role` | `updateStaffRole` | Change role |
| DELETE | `/admin/staff/:userId` | `deleteStaff` | Deactivate staff |

#### Cancellation Policies

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/admin/policies` | `listPolicies` | Policies per room type for this hotel |
| POST | `/admin/policies` | `createPolicy` | Set free_cancellation_hours + refund_percentage |
| PUT | `/admin/policies/:policyId` | `updatePolicy` | Update policy |

#### Hotel Settings

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/admin/settings` | `showSettings` | Hotel profile (name, address, logo) |
| PUT | `/admin/settings` | `updateSettings` | Update hotel profile |

---

### Phase 11 — Super Admin Panel

**Controller:** `superadmin/platform.controller.ts`  
**Route file:** `superadmin.routes.ts` (already registered in Phase 1)

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/superadmin/reports` | `platformReports` | Total bookings, revenue, occupancy across all hotels |
| GET | `/superadmin/logs` | `platformLogs` | Activity logs across all tenants (filterable) |
| GET | `/superadmin/logs/export` | `exportLogs` | Export filtered logs as CSV |
| GET | `/superadmin/users` | `listAllUsers` | All users across all hotels |

---

### Phase 12 — Reports & Logs

**Controllers:** `report.controller.ts`, `log.controller.ts`  
**Route file:** `admin.routes.ts`

#### Hotel-Level Reports (Hotel Admin only)

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/admin/reports/occupancy` | `occupancyReport` | Room occupancy % by date range |
| GET | `/admin/reports/revenue` | `revenueReport` | Revenue by room type |
| GET | `/admin/reports/bookings` | `bookingReport` | Booking counts by source/status |

#### Hotel-Level Activity Logs

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/admin/logs` | `listLogs` | Paginated, filterable log table (this hotel only) |
| GET | `/admin/logs/export` | `exportLogs` | Export filtered logs as CSV |

---

## 8. Full API Route Reference

All routes organised by access level and build order.

### Public (No Auth)

```
GET  /                                        → Home / search form
GET  /rooms/search                            → Search rooms (cross-hotel)
GET  /rooms?hotelId=                          → Room listing for hotel
GET  /rooms/types?hotelId=                    → Room types for hotel
GET  /rooms/:roomId                           → Room detail
GET  /rooms/availability?hotelId=&roomId=     → Availability check (AJAX)
GET  /auth/register                           → Registration form
POST /auth/register                           → Register guest account
GET  /auth/login                              → Login form
POST /auth/login                              → Login
GET  /auth/forgot-password                    → Forgot password form
POST /auth/forgot-password                    → Send reset email
GET  /auth/reset-password/:token              → Reset form
POST /auth/reset-password/:token              → Update password
GET  /superadmin/login                        → Super admin login form
POST /superadmin/login                        → Super admin authenticate
```

### Guest (Auth Required — isLoggedIn)

```
POST   /auth/logout                               → Logout
GET    /auth/profile                              → View profile
POST   /auth/profile                              → Update profile

POST   /holds                                     → Create booking hold
DELETE /holds/:holdId                             → Release hold
GET    /holds/:holdId                             → Hold status

GET    /bookings/new                              → Checkout form
POST   /bookings                                  → Confirm booking
GET    /bookings                                  → My booking history
GET    /bookings/:bookingId                       → Booking detail
GET    /bookings/:bookingId/modify                → Modify form
PUT    /bookings/:bookingId                       → Update booking
DELETE /bookings/:bookingId                       → Cancel booking
GET    /bookings/:bookingId/invoice               → View invoice

POST   /payments/online/initiate                  → Start Razorpay payment
POST   /payments/online/verify                    → Verify payment
GET    /payments/:bookingId                       → Payment status
```

### Front Desk (isFrontDesk + attachHotel)

```
GET    /frontdesk                                 → Dashboard (today's arrivals/departures)
GET    /frontdesk/search                          → Search reservation
GET    /frontdesk/checkin/:bookingId              → Check-in form
POST   /frontdesk/checkin/:bookingId              → Process check-in
GET    /frontdesk/checkout/:bookingId             → Checkout form
POST   /frontdesk/checkout/:bookingId             → Process checkout
POST   /frontdesk/incidentals/:bookingId          → Add incidental charge
GET    /frontdesk/billing/:bookingId              → Billing summary

POST   /payments/manual                           → Record manual payment
POST   /payments/refund/:bookingId                → Process refund

GET    /housekeeping                              → Task list
POST   /housekeeping                              → Create task
PUT    /housekeeping/:taskId                      → Update task status
GET    /housekeeping/room/:roomId                 → Room tasks

GET    /invoices/:bookingId                       → Generate invoice
GET    /invoices/:bookingId/download              → Download invoice
```

### Hotel Admin (isHotelAdmin + attachHotel)

```
GET    /admin/rooms                                        → All rooms
GET    /admin/rooms/new                                    → New room form
POST   /admin/rooms                                        → Create room
GET    /admin/rooms/:roomId/edit                           → Edit room form
PUT    /admin/rooms/:roomId                                → Update room
DELETE /admin/rooms/:roomId                                → Delete room
PUT    /admin/rooms/:roomId/status                         → Change room status

GET    /admin/room-types                                   → Room types list
GET    /admin/room-types/new                               → New room type form
POST   /admin/room-types                                   → Create room type
PUT    /admin/room-types/:typeId                           → Update room type
DELETE /admin/room-types/:typeId                           → Delete room type
POST   /admin/room-types/:typeId/amenities                 → Add amenity
DELETE /admin/room-types/:typeId/amenities/:amenityId      → Remove amenity

GET    /admin/staff                                        → All staff
GET    /admin/staff/new                                    → Add staff form
POST   /admin/staff                                        → Create staff
GET    /admin/staff/:userId/edit                           → Edit staff form
PUT    /admin/staff/:userId                                → Update staff
PUT    /admin/staff/:userId/role                           → Change role
DELETE /admin/staff/:userId                                → Deactivate staff

GET    /admin/policies                                     → Cancellation policies
POST   /admin/policies                                     → Create policy
PUT    /admin/policies/:policyId                           → Update policy

GET    /admin/settings                                     → Hotel settings
PUT    /admin/settings                                     → Update hotel settings

GET    /admin/reports/occupancy                            → Occupancy report
GET    /admin/reports/revenue                              → Revenue report
GET    /admin/reports/bookings                             → Booking stats

POST   /housekeeping                                       → Create task (admin)

GET    /admin/logs                                         → Activity logs (this hotel)
GET    /admin/logs/export                                  → Export logs CSV
```

### Super Admin (isSuperAdmin)

```
POST   /superadmin/logout                                  → Logout

GET    /superadmin/dashboard                               → Platform overview

GET    /superadmin/hotels                                  → All hotels
GET    /superadmin/hotels/new                              → New hotel form
POST   /superadmin/hotels                                  → Create hotel
GET    /superadmin/hotels/:hotelId                         → Hotel detail
GET    /superadmin/hotels/:hotelId/edit                    → Edit hotel form
PUT    /superadmin/hotels/:hotelId                         → Update hotel
PUT    /superadmin/hotels/:hotelId/status                  → Activate/Suspend hotel
DELETE /superadmin/hotels/:hotelId                         → Delete hotel

GET    /superadmin/users                                   → All users (cross-hotel)

GET    /superadmin/reports                                 → Platform-wide reports
GET    /superadmin/logs                                    → Platform-wide activity logs
GET    /superadmin/logs/export                             → Export logs CSV
```

---

## 9. Activity Logging System

Every meaningful action is recorded to `activity_logs` via the `log()` utility. It is fire-and-forget — a logging failure **never** crashes the main request.

### `src/utils/logger.ts`

```typescript
import db from '../config/db';

interface LogOptions {
  actionId:    number;
  hotelId?:    number | null;
  userId?:     number | null;
  targetType?: string | null;
  targetId?:   number | null;
  req?:        any;
  status?:     number | null;
  message?:    string | null;
  payload?:    Record<string, unknown> | null;
}

export async function log(opts: LogOptions): Promise<void> {
  try {
    const {
      actionId, hotelId = null, userId = null,
      targetType = null, targetId = null,
      req = null, status = null, message = null, payload = null
    } = opts;

    await db.query(
      `INSERT INTO activity_logs
        (hotel_id, log_action_id, user_id, target_type, target_id,
         http_method, endpoint, ip_address, user_agent,
         payload, response_status, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hotelId, actionId, userId, targetType, targetId,
        req?.method        ?? null,
        req?.originalUrl   ?? null,
        req?.ip            ?? null,
        req?.headers?.['user-agent'] ?? null,
        payload ? JSON.stringify(payload) : null,
        status,
        message,
      ]
    );
  } catch (err: any) {
    console.error('[Logger Error]', err.message);
  }
}
```

### `src/constants/logActions.ts`

```typescript
export const LOG = {
  // Auth
  USER_REGISTERED:             1,
  USER_LOGIN:                  2,
  USER_LOGOUT:                 3,
  PASSWORD_RESET_REQUESTED:    4,
  PROFILE_UPDATED:             5,
  // Holds
  HOLD_CREATED:                6,
  HOLD_EXPIRED:                7,
  HOLD_RELEASED:               8,
  // Bookings
  BOOKING_CREATED:             9,
  BOOKING_MODIFIED:            10,
  BOOKING_CANCELLED:           11,
  // Front Desk
  CHECKIN_COMPLETED:           12,
  CHECKOUT_COMPLETED:          13,
  INCIDENTAL_ADDED:            14,
  // Payments
  PAYMENT_RECORDED:            15,
  PAYMENT_REFUNDED:            16,
  INVOICE_GENERATED:           17,
  // Rooms (Hotel Admin)
  ROOM_CREATED:                18,
  ROOM_UPDATED:                19,
  ROOM_STATUS_CHANGED:         20,
  // Housekeeping
  HOUSEKEEPING_TASK_CREATED:   21,
  HOUSEKEEPING_TASK_UPDATED:   22,
  // Admin
  STAFF_ROLE_CHANGED:          23,
  STAFF_CREATED:               24,
  STAFF_DELETED:               25,
  // Super Admin
  HOTEL_CREATED:               26,
  HOTEL_UPDATED:               27,
  HOTEL_STATUS_CHANGED:        28,
  HOTEL_DELETED:               29,
} as const;
```

### Usage Example

```typescript
// Inside booking.controller.ts → createBooking()
await log({
  actionId:   LOG.BOOKING_CREATED,
  hotelId:    req.session.user.hotel_id,
  userId:     req.session.user.user_id,
  targetType: 'booking',
  targetId:   newBooking.booking_id,
  req,
  status:     201,
  message:    `Booking ${newBooking.booking_reference} created`,
  payload:    { roomIds, checkInDate, checkOutDate, adults, children },
});
```

---

## 10. 2-Week Sprint Plan

> Team of 5. Rotating daily captain. Each person works on their own feature branch; captain merges to `main` at end of day.

### Week 1 — Foundation

| Day | Captain | Focus | Members & Tasks |
|-----|---------|-------|-----------------|
| **Day 1** | Person A | Project Setup | **All:** Repo init, `tsconfig.json`, folder structure, `schema.sql` run, `.env` setup, Tailwind build, base EJS layouts, `db.ts` pool, `app.ts` skeleton |
| **Day 2** | Person B | Super Admin + Tenant | **A:** `superadmin.routes.ts` + `isSuperAdmin` middleware · **B:** `tenant.controller.ts` (hotel CRUD) · **C:** `superadmin.controller.ts` (login/logout) · **D:** Super admin EJS views · **E:** `hotel.model.ts` queries |
| **Day 3** | Person C | Auth (Backend) | **B:** Register + login routes/controller · **C:** Session middleware + auth guards + `tenant.middleware.ts` · **D:** bcryptjs + express-validator · **E:** `user.model.ts` DB queries · **A:** Flash messages |
| **Day 4** | Person D | Auth (Frontend + Email) | **C:** Forgot/reset password + nodemailer · **B:** EJS views (login, register, forgotPassword) · **D:** Profile view + update · **E:** `express.d.ts` types · **A:** End-to-end auth test |
| **Day 5** | Person E | Room Search | **D:** `room.model.ts` + `availability.model.ts` · **C:** Search route + availability SQL · **B:** Room type + amenity queries · **E:** `search.ejs` + `listing.ejs` + `detail.ejs` · **A:** `room.routes.ts` wiring + integration test |

### Week 2 — Features + Integration

| Day | Captain | Focus | Members & Tasks |
|-----|---------|-------|-----------------|
| **Day 6** | Person A | Holds + Booking Create | **A:** `hold.controller.ts` + 10-min hold + room_availability update · **B:** `booking.controller.ts` createBooking · **C:** `hold.model.ts` + `booking.model.ts` · **D:** uuid booking reference + confirmation email · **E:** `checkout.ejs` view |
| **Day 7** | Person B | Booking Modify/Cancel + Cron | **B:** Modify booking flow · **C:** Cancel + refund calc using cancellation_policies · **D:** `jobs/expireHolds.ts` cron job · **E:** booking history EJS · **A:** method-override PUT/DELETE wiring |
| **Day 8** | Person C | Payments + Front Desk | **D:** Razorpay initiate + verify · **C:** Manual payment recording + `processCheckIn` · **B:** `payment.model.ts` + `refund.model.ts` · **E:** `checkin.ejs` + billing EJS · **A:** `frontdesk.routes.ts` wiring |
| **Day 9** | Person D | Checkout + Invoice + Housekeeping | **D:** `processCheckOut` + auto housekeeping task · **C:** Invoice compilation + `invoice.model.ts` · **B:** `incidental.model.ts` + `addIncidental` · **E:** Housekeeping task flow + status transitions · **A:** `housekeeping.routes.ts` wiring |
| **Day 10** | Person E | Hotel Admin Panel | **E:** Room CRUD + photo upload · **D:** Room type + amenity management · **C:** Cancellation policy management · **B:** Staff management (create/role/delete) · **A:** Hotel settings page |
| **Day 11** | Person A | Super Admin Panel + Reports | **A:** Platform reports + platform logs view · **B:** `report.controller.ts` (occupancy + revenue) · **C:** `log.controller.ts` + `logs.ejs` with filters + pagination · **D & E:** Bug fixes + edge cases |
| **Day 12** | Person B | Testing | **All:** End-to-end: super admin creates hotel → hotel admin sets up rooms → guest searches → holds → books → pays → front desk checks in → checks out → invoice → housekeeping |
| **Day 13** | Person C | Final Integration | **All:** Cross-module fixes, `seed.sql` with 1 super admin + 2 demo hotels, full walkthrough |
| **Day 14** | Person D | Demo Ready | **All:** Final bug fixes, README update, `.env.example` cleanup, demo rehearsal |

---

## 11. GitLab Workflow

### Branch Strategy

```
main                          ← Protected. Only captains merge here (end of day).
└── feature branches
    ├── feature/superadmin-tenant
    ├── feature/auth-login
    ├── feature/room-search
    ├── feature/booking-holds
    ├── feature/booking-create
    ├── feature/payments-razorpay
    ├── feature/frontdesk-checkin
    ├── feature/housekeeping
    ├── feature/hotel-admin-panel
    └── feature/super-admin-panel
```

### Daily Git Workflow

```bash
# 1. Pull latest main
git checkout main && git pull origin main

# 2. Checkout or create your feature branch
git checkout -b feature/your-feature-name
# OR
git checkout feature/your-feature-name && git merge main

# 3. Work and commit often
git add .
git commit -m "feat: add hotel CRUD in tenant.controller.ts"

# 4. Push and open MR targeting main
git push origin feature/your-feature-name
```

### Commit Message Convention

```
feat:     new feature
fix:      bug fix
style:    UI/CSS only
refactor: code restructure, no behavior change
chore:    config, package updates
docs:     README or comment updates
types:    TypeScript interface/type changes
tenant:   multi-tenant isolation changes

Examples:
  feat: add createHotel + seed hotel admin user
  fix:  correct hotel_id filter in booking.model.ts
  tenant: add guardTenant middleware to frontdesk routes
  types: add Hotel and TenantStatus interfaces
```

### MR Rules

- **Never push directly to `main`** — every change goes through a Merge Request
- Every MR needs the day's captain as Reviewer before merging
- MR description must include: what was built + how to test it
- Resolve conflicts on your feature branch — not in `main`

---

## 12. Environment Setup

```bash
git clone https://gitlab.com/your-group/hbms.git
cd hbms
npm install
cp .env.example .env
```

**`.env.example`**
```env
PORT=3000
SESSION_SECRET=change_this_to_a_long_random_string

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=hbms_db

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your@gmail.com
MAIL_PASS=your_app_password

RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Super Admin seed credentials (used in seed.sql only)
SUPER_ADMIN_EMAIL=superadmin@hbms.com
SUPER_ADMIN_PASSWORD=change_this_immediately
```

**`tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**`nodemon.json`**
```json
{
  "watch": ["src"],
  "ext": "ts,ejs",
  "exec": "ts-node src/server.ts"
}
```

**`package.json` scripts**
```json
{
  "scripts": {
    "dev":       "nodemon",
    "build":     "tsc",
    "start":     "node dist/server.js",
    "db:setup":  "mysql -u root -p < sql/schema.sql",
    "db:seed":   "mysql -u root -p hbms_db < sql/seed.sql",
    "css:watch": "npx tailwindcss -i ./public/css/input.css -o ./public/css/output.css --watch",
    "css:build": "npx tailwindcss -i ./public/css/input.css -o ./public/css/output.css --minify"
  }
}
```

```bash
# Set up database
npm run db:setup
npm run db:seed

# Tailwind watcher (separate terminal)
npm run css:watch

# Dev server
npm run dev
```

---

## 13. Team & Roles

| Person | Primary Modules | GitLab Handle |
|--------|----------------|---------------|
| Person A | Project setup, Holds, Booking core, Reports, Super admin panel | @person_a |
| Person B | Auth, Booking modify/cancel, Hotel admin UI, Staff management | @person_b |
| Person C | Auth email, Front desk, Logs, Housekeeping | @person_c |
| Person D | Room search, Payments, Room types, Tenant setup | @person_d |
| Person E | Room frontend, Hotel admin panel, Housekeeping UI, Super admin views | @person_e |

> **Captain rotation (Days 1–14):** A → B → C → D → E → A → B → C → D → E → A → B → C → D  
> The captain reviews all MRs and merges them to `main` at end of their day.

---

*Built with ❤️ by a team of 5 — HBMS v2.0 SaaS · TypeScript + Node.js + EJS + MySQL + Tailwind*