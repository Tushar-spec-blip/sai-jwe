-- Sri Sai Jewels - SQLite Database Schema
-- Phase 1

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS metal_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metal TEXT NOT NULL,
  purity TEXT NOT NULL,
  rate_per_gram REAL NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(metal, purity)
);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT DEFAULT '',
  gstin TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  metal TEXT NOT NULL DEFAULT 'Gold',
  purity TEXT NOT NULL DEFAULT '22K',
  gross_weight REAL NOT NULL DEFAULT 0,
  stone_weight REAL NOT NULL DEFAULT 0,
  net_weight REAL NOT NULL DEFAULT 0,
  making_charge REAL NOT NULL DEFAULT 0,
  wastage_percent REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'AVAILABLE',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_id INTEGER,
  invoice_date TEXT NOT NULL DEFAULT (date('now')),
  subtotal REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  gst_rate REAL NOT NULL DEFAULT 3.0,
  gst_amount REAL NOT NULL DEFAULT 0,
  rounding REAL NOT NULL DEFAULT 0,
  grand_total REAL NOT NULL DEFAULT 0,
  paid_amount REAL NOT NULL DEFAULT 0,
  balance_amount REAL NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'PENDING',
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  product_id INTEGER,
  item_code TEXT DEFAULT '',
  description TEXT NOT NULL,
  metal TEXT NOT NULL DEFAULT 'Gold',
  purity TEXT NOT NULL DEFAULT '22K',
  gross_weight REAL NOT NULL DEFAULT 0,
  stone_weight REAL NOT NULL DEFAULT 0,
  net_weight REAL NOT NULL DEFAULT 0,
  gold_rate REAL NOT NULL DEFAULT 0,
  metal_value REAL NOT NULL DEFAULT 0,
  making_charge REAL NOT NULL DEFAULT 0,
  wastage_percent REAL NOT NULL DEFAULT 0,
  wastage_amount REAL NOT NULL DEFAULT 0,
  stone_charge REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  item_total REAL NOT NULL DEFAULT 0,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  amount REAL NOT NULL DEFAULT 0,
  reference_number TEXT DEFAULT '',
  payment_date TEXT NOT NULL DEFAULT (date('now')),
  notes TEXT DEFAULT '',
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);
