# Sri Sai Jewels — Jewellery Billing Application

> **Offline-first jewellery billing application for Sri Sai Jewels.**

Current Version: **Phase 1.6 (Deployable Demo & Usability Testing)**

---

## 🌟 Application Architecture

The application is designed for an eventual **offline-first desktop environment** on shop billing counters:

```
[ Planned Production Architecture — Phase 2 ]
React UI  --->  Local Node.js / Express API  --->  Local SQLite Database
```

```
[ Current Phase 1.6 Demo Architecture ]
React UI  --->  Mock Data Service Layer (Browser-based Demo)
```

The Phase 1.6 browser demo operates entirely on fictional sample data, allowing non-technical shopkeepers to evaluate UI workflows, responsiveness, and invoice layouts without needing a backend server or database installation.

---

## ✨ Features Included in Demo

- 📊 **Dashboard**: Real-time sales statistics, quick actions, recent invoices, pending collections, and current metal rates.
- 👥 **Customer Management**: Search, add inline, view details, edit, and filter registered customers.
- 💎 **Jewellery Inventory**: Search and filter by category (Ring, Chain, Necklace, etc.), metal (Gold, Silver, Platinum), purity (24K, 22K, 18K), and status.
- 🧾 **New Bill & Billing Calculator**:
  - Live calculation of Net Weight, Metal Value, Wastage %, Making Charges, Stone Charges, Discounts, GST, and Grand Total.
  - Interactive Gold Rate and GST Rate adjustment.
  - Split payment options (Cash, UPI, Card, Bank Transfer).
  - Sticky mobile total bar for touch devices.
- 📄 **A4 & 80mm Invoice Previews**:
  - Full transparent billing breakdown in **A4 format**.
  - Monospace receipt layout in **80mm Thermal format**.
  - Direct browser print workflow (`window.print()`) without forced PDF saves.
- 📱 **Mobile & Tablet Responsive**:
  - Collapsible slide-out drawer menu with hamburger toggle (`< 1024px`).
  - Optimized touch targets (minimum 44px) and numeric keypads (`inputMode="decimal"`).
- 🏷️ **Shopkeeper Testing Indicator**: Prominent `TEST VERSION` badge in header to prevent confusing test data with store accounting.

---

## ⚠️ Demo Limitations & Safety

- 🔒 **Mock Data Only**: All customers (*Arun Kumar, Priya Sharma*), phone numbers (`98765 00001`), and invoices (`DEMO-1001`) are strictly fictional.
- 🔄 **Session Persistence**: Data added during a browser session is stored in temporary `localStorage` and may reset on browser clear.
- 🚫 **No External Server**: The demo does NOT connect to any cloud database or external server.
- 📌 **Do NOT Enter Real Customer Data**: Please do not input actual store financial data into this public demo.

---

## 🚀 Local Development Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### 1. Run Frontend Locally

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start Vite local dev server
npm run dev
```

The application will be accessible at: `http://localhost:5173`

### 2. Build Production Demo Bundle

```bash
cd frontend
npm run build
```

The optimized static bundle will be generated in `frontend/dist/`.

---

## 📋 Testing Guide

For non-technical shopkeeper testing instructions and a usability feedback checklist, please refer to [TESTING.md](./TESTING.md).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 + Vite |
| Icons | Lucide React |
| Typography | Google Fonts (Playfair Display + Inter) |
| Styling | Vanilla CSS with custom tokens & media queries |
| Demo Service Layer | `mockDataService.js` (Local State / localStorage) |
| Planned Backend (Phase 2) | Node.js + Express + SQLite |

---

## 📄 License & Attribution

Sri Sai Jewels — Confidential Shopkeeper Usability Testing Release.
