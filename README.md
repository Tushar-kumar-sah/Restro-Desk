# RestoDesk - Enterprise Restaurant Management Platform (POS & ERP)

> **RestoDesk** is a production-grade Restaurant Management OS & Point-of-Sale (POS) designed as a feature-complete alternative to PetPooja. Built with Next.js 14 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, PostgreSQL (Supabase), Prisma ORM (62 relational models), and full Indian restaurant localization (₹, DD/MM/YYYY, Lakh/Crore grouping, SAC 9963, 5%/12%/18% GST).

---

## 🌟 Platform Highlights & Tech Stack

- **Framework**: Next.js 14 App Router + React 18 + TypeScript (Strict mode)
- **Database & Auth**: PostgreSQL + Prisma ORM (62 Relational Models) + **Supabase Cloud & Supabase Auth**
- **Design System**: Tailwind CSS + shadcn/ui + Lucide Icons + Responsive Tablet-First POS
- **State Management**: Zustand + TanStack Query
- **Charts & Dashboards**: Recharts (Hourly rush peaks, tender shares, category sales)
- **Printing**: Monospaced thermal receipt & KOT printing CSS (58mm / 80mm roll width, ESC/POS formatting, dynamic UPI QR on bill)
- **PWA & Offline Capability**: Progressive Web App with Service Worker (`sw.js`), local IndexedDB/localStorage queue, and automatic cloud synchronization on reconnect
- **Multi-Tenancy**: 1 Brand account $\to$ Unlimited physical outlets with per-outlet pricing, inventory, tax, and printer profiles

---

## 📦 15 Core Modules Implemented

1. **Authentication & Multi-Tenant Onboarding** (`/login`, `/setup`)
   - Role-Based Access Control (RBAC): `OWNER`, `MANAGER`, `CASHIER`, `WAITER`, `KITCHEN`, `MARKETING`.
   - Dual-mode Auth: Direct database credentials verification + Supabase Auth integration (`/api/auth/supabase`).
   - Setup wizard for brand identity, outlets, GSTIN, FSSAI, printer config.

2. **Executive Dashboard** (`/dashboard`)
   - Real-time KPIs: Today's Gross Sales, Net Sales, Avg Ticket Value, Active Tables, Void count.
   - Interactive Recharts AreaChart (rush hour curves 11 AM – 11 PM) and PieChart (payment tender breakdown).
   - Live top 10 dishes by revenue and food cost %.

3. **POS Touch Billing Counter** (`/pos`)
   - Order types: Dine-In, Takeaway, Parcel Delivery, Online Aggregator.
   - Fast keyboard shortcuts (F2 Item Search, F4 Settle, F8 Hold/Resume).
   - GST calculation (5% AC dining, 12% outdoor, 18% liquor), packaging charges, round-off.
   - Hold / Resume bills, move items between tables, void order with manager approval notes.
   - Instant customer phone attach: reveals loyalty points, wallet balance, and coupons.
   - Thermal bill slip printing modal (58mm/80mm) with dynamic UPI QR code.

4. **Table Management & Floor Layout** (`/tables`)
   - Section views (Main Dining, AC Family Hall, Open Rooftop Terrace).
   - Real-time status indicators: `VACANT`, `RUNNING`, `BILLED`, `RESERVED`.
   - Table merging, splitting, transfers, and reservations calendar.

5. **Kitchen Display System (KDS)** (`/kitchen`)
   - Live order tickets routed by station (Tandoor, Curries, Bar, Desserts).
   - Status transitions: `NEW` $\to$ `PREPARING` $\to$ `READY` $\to$ `SERVED`.
   - Delay highlights (> 20 mins) with item cancellation and reprint.

6. **Menu Management & Pricing** (`/menu`, `/menu/modifiers`, `/menu/combos`)
   - Categories, items, variants (Half / Full), add-on groups, combos.
   - Per-outlet pricing, item availability toggle, HSN/SAC classification.
   - Bulk Excel/CSV upload (`/api/menu/bulk-upload`).

7. **Inventory, BOM Recipes & Purchase** (`/inventory`, `/inventory/recipes`, `/inventory/purchase`, `/inventory/suppliers`)
   - Raw materials catalog with units of measure (KG, LTR, GM, ML, PCS).
   - Recipe Bill of Materials (BOM) with automatic stock deduction on POS sale.
   - Purchase orders (PO) $\to$ Goods Received Note (GRN) $\to$ Supplier Ledger.
   - Wastage log entries and physical stock audit count reconciliation.

8. **CRM & Customer Database** (`/crm`, `/crm/segments`)
   - Guest profiles with lifetime spend, visit count, visit gap, favorite dishes.
   - Dynamic customer segments (VIP, Regular, At-Risk, Lapsed 30/60/90 days).

9. **Loyalty Program, Wallet & Coupons** (`/loyalty`, `/coupons`)
   - Earn rules (1 point per ₹100), redeem rules, minimum bill thresholds.
   - Tier multipliers: Silver (1x), Gold (1.25x), Platinum (1.5x).
   - Coupons engine: flat ₹ off, percentage %, free item, min-bill conditions.

10. **Campaigns & Marketing Automation** (`/campaigns`)
    - Pluggable messaging adapter (`MockMessagingAdapter`, Twilio, Gupshup, Fast2SMS).
    - 4-step campaign wizard: Audience $\to$ Template $\to$ Voucher $\to$ Schedule/Blast.
    - 6 Automated customer journeys: Welcome series, Birthday greeting, Anniversary invite, Post-visit feedback, Win-back lapsed, Points expiry.

11. **Guest Feedback & Reputation Management** (`/feedback`, `/review`)
    - Executive feedback dashboard with Net Promoter Score (NPS) promoter/passive/detractor gauges.
    - Critical escalation banner for ratings $\le 3$ stars with Manager Resolution drawer.
    - Public mobile-first guest review page (`/review` and `/review/[id]`) with 5-star rating, category scores, and automatic Google Review redirection for happy diners.

12. **Aggregators & Online Orders Hub** (`/online-orders`)
    - Bi-directional Zomato & Swiggy aggregator layer with live store toggles (Online/Offline) and catalog sync.
    - Incoming order audio/visual alert banner.
    - Contextual actions: Accept with kitchen prep time (15m, 25m, 35m) or Reject with reason broadcast.

13. **Delivery Management & In-House Fleet** (`/delivery`)
    - Dispatch board: assign available riders to direct web orders.
    - Delivery fleet roster with vehicle numbers, trip counters, and ratings.
    - Coverage zones with distance radius (km), minimum order values, and delivery fees.

14. **Reports & Day-End Z-Report** (`/reports/sales`, `/reports/day-end`, `/reports/tax`)
    - Daily timeline, item profitability, category shares, and void cancellations audit.
    - **Indian Currency Denomination Counter** (₹500, ₹200, ₹100, ₹50, ₹20, ₹10 notes) with live cash variance alerts.
    - Printable thermal 80mm Day-End Z-Report slip modal.
    - Indian GST compliance filing report (SAC 9963, 5% rate slab, CGST/SGST split, GSTR-1 CSV export).

15. **Settings, Admin & Audit Logs** (`/settings`, `/audit-logs`)
    - Brand profiles, outlet profiles, thermal printer paper configuration (58mm/80mm), bill header/footer.
    - Staff directory and RBAC permissions matrix.
    - Developer API keys and webhook management.
    - Immutable security audit logs tracking voids, manual discounts, cash drawer events, and price edits.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js `v18+` or `v20+` (LTS recommended)
- PostgreSQL database (or your connected Supabase project)

### 2. Environment Configuration
Create or update `.env` in the root directory:

```env
# Database Connection (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?connection_limit=10&pool_timeout=10"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase Auth & Storage Keys
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="[YOUR-PUBLISHABLE-KEY]"
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_PUBLISHABLE_KEY="[YOUR-PUBLISHABLE-KEY]"
SUPABASE_SECRET_KEY="[YOUR-SECRET-KEY]"
SUPABASE_JWKS_URL="https://[YOUR-PROJECT-REF].supabase.co/auth/v1/.well-known/jwks.json"

# Authentication
JWT_SECRET="super-secret-jwt-key-restodesk-2026-production-grade"
JWT_EXPIRES_IN="7d"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="RestoDesk"

# Notification Adapters (mock | twilio | fast2sms | sendgrid)
SMS_ADAPTER="mock"
WHATSAPP_ADAPTER="mock"
EMAIL_ADAPTER="mock"
```

### 3. Install Dependencies & Setup Database
```powershell
# 1. Install all npm dependencies
npm install

# 2. Push schema to Supabase PostgreSQL (creates all 62 tables)
npx prisma db push

# 3. Seed demo Brand, Outlets, Roles, Menu, Tables, and Customers
npx prisma db seed

# 4. Start local development server
npm run dev
```

Visit [`http://localhost:3000`](http://localhost:3000) in your browser.

---

## 🔑 Default Demo Credentials

All accounts are pre-seeded with password: `Password@123`

| Role | Email | Capabilities |
| :--- | :--- | :--- |
| **Owner** | `owner@restodesk.com` | Full master access, all outlets, financial reports, settings |
| **Manager** | `manager@restodesk.com` | Day-end Z-reports, discounts, voids, menu pricing, staff |
| **Cashier** | `cashier@restodesk.com` | POS billing, payments, cash drawer, customer search |
| **Waiter** | `waiter@restodesk.com` | Table orders, KOT punching, reservations |
| **Kitchen** | `kitchen@restodesk.com` | KDS screen, food preparation status, item stock status |
| **Marketing**| `marketing@restodesk.com` | Campaigns, customer segments, loyalty rules, coupons |

---

## 📱 PWA & Offline Billing Mode

RestoDesk is a certified Progressive Web App:
- **Offline Billing**: If your restaurant internet fails, billing continues uninterrupted. Orders are queued locally in `localStorage` / IndexedDB.
- **Auto-Sync**: When internet is restored, the `PwaConnectivityBar` automatically drains and posts queued bills to `/api/pos/orders`.
- **Installable**: Click **Install App** on desktop Chrome or mobile Safari/Android to install RestoDesk as a native desktop/tablet app.

---

## 🚢 Production Deployment Guide

### Deploying to Vercel
1. Push your repository to GitHub / GitLab.
2. Import project into [Vercel](https://vercel.com).
3. Add the environment variables from `.env` in the Vercel Dashboard.
4. Set Build Command: `npm run build`
5. Output Directory: `.next`
6. Click **Deploy**.

### Deploying with Docker
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🛡️ License
Proprietary design & code crafted for **RestoDesk**. Built for high-volume Indian restaurant dining and cloud kitchen operations.
