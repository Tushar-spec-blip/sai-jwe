# Sri Sai Jewels — Jewellery Billing Application
## Phase 1

A desktop-first, offline jewellery billing application built for Windows.

---

## How to Run

### Step 1: Start the Backend API Server

Open a terminal in the `backend` folder:

```
cd backend
npm run dev
```

The server starts at: http://localhost:3001

### Step 2: Start the Frontend

Open another terminal in the `frontend` folder:

```
cd frontend
npm run dev
```

The application opens at: http://localhost:5173

---

## Project Structure

```
sri-sai-jewels/
├── frontend/          ← React + Vite UI
│   └── src/
│       ├── assets/        ← Logo
│       ├── components/
│       │   ├── layout/    ← Sidebar, Header
│       │   ├── common/    ← Modal, Badge
│       │   └── invoice/   ← A4, Thermal80, PrintPreview
│       ├── pages/         ← All 10 pages
│       ├── data/          ← Mock data
│       └── utils/         ← billingCalculator.js
│
├── backend/           ← Node.js + Express API
│   ├── server.js
│   └── src/
│       ├── database/  ← db.js, schema.sql
│       ├── routes/    ← customers, products, invoices, metalRates, settings
│       └── services/  ← Business logic layer
│
└── README.md
```

---

## Phase 1 Features

- ✅ Sri Sai Jewels branding and logo
- ✅ Sidebar navigation with all sections
- ✅ Dashboard with stats, recent invoices, pending payments, metal rates, quick actions
- ✅ Customer Management (add, edit, view, delete, search)
- ✅ Jewellery Inventory (add, edit, view, delete, filter by category/metal/purity/status)
- ✅ New Bill — full billing workflow with live calculations
- ✅ Bills / Invoices history with search and filters
- ✅ Payments page with method breakdown
- ✅ Reports page with sales and GST summary
- ✅ Metal Rates — editable rates
- ✅ Settings — Shop Details, Billing, GST, Printing
- ✅ Backup & Restore UI
- ✅ A4 Invoice Template (professional, full transparent breakdown)
- ✅ 80mm Thermal Receipt Template (compact, monospace, separate from A4)
- ✅ Direct Print workflow (window.print — no PDF saving)
- ✅ Isolated billing calculator (billingCalculator.js)
- ✅ SQLite schema (sql.js — no native compilation required)

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| UI Icons | Lucide React |
| Fonts | Google Fonts (Playfair Display + Inter) |
| Backend | Node.js + Express |
| Database | SQLite via sql.js (pure JavaScript) |
| Styling | Vanilla CSS with design tokens |

---

## Phase 1 Limitations (To be addressed in Phase 2)

- Mock data is used on frontend (no live API connection yet)
- Backup/Restore is UI only (no file operations)
- Invoice number generation is temporary (uses timestamp)
- No data persistence on refresh (mock state only)
- Printing opens a new window (no Electron integration yet)
- No Electron packaging yet (will need Electron for true Windows .exe)
