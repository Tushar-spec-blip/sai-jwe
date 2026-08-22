const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'sri-sai-jewels.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db = null;

/**
 * Save the database to disk (sql.js is in-memory; we persist manually).
 */
function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, buffer);
}

/**
 * Initialize the SQLite database.
 * Loads from disk if it exists, otherwise creates fresh and seeds defaults.
 */
async function initDatabase() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('[DB] Loaded existing database from', DB_PATH);
  } else {
    db = new SQL.Database();
    console.log('[DB] Creating new database at', DB_PATH);

    // Run schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.run(schema);

    // Seed default settings
    seedDefaultSettings();

    // Seed default metal rates
    seedDefaultMetalRates();

    saveDatabase();
    console.log('[DB] Schema initialized and defaults seeded.');
  }

  return db;
}

function seedDefaultSettings() {
  const defaults = [
    ['shop_name', 'Sri Sai Jewels'],
    ['shop_address', 'Your Shop Address Here, City - PIN'],
    ['shop_phone', '+91 XXXXX XXXXX'],
    ['gstin', 'YOUR_GSTIN_HERE'],
    ['gst_rate', '3.0'],
    ['invoice_prefix', 'INV-'],
    ['currency', 'INR'],
    ['rounding_method', 'nearest'],
    ['making_charge_method', 'fixed'],
    ['wastage_method', 'percentage'],
    ['default_invoice_format', 'A4'],
  ];

  const stmt = db.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)"
  );
  for (const [key, value] of defaults) {
    stmt.run([key, value]);
  }
  stmt.free();
}

function seedDefaultMetalRates() {
  const rates = [
    ['Gold', '24K', 7100],
    ['Gold', '22K', 6500],
    ['Gold', '18K', 5300],
    ['Silver', '999', 85],
  ];

  const stmt = db.prepare(
    "INSERT OR IGNORE INTO metal_rates (metal, purity, rate_per_gram) VALUES (?, ?, ?)"
  );
  for (const [metal, purity, rate] of rates) {
    stmt.run([metal, purity, rate]);
  }
  stmt.free();
}

/**
 * Get the database instance.
 */
function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

/**
 * Helper: run a query and return all rows as objects.
 */
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Helper: run a query and return the first row as an object.
 */
function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Helper: run a write statement and return lastInsertRowid and changes.
 */
function run(sql, params = []) {
  db.run(sql, params);
  const info = db.exec("SELECT last_insert_rowid() as id, changes() as changes");
  if (info.length > 0 && info[0].values.length > 0) {
    saveDatabase();
    return {
      lastInsertRowid: info[0].values[0][0],
      changes: info[0].values[0][1],
    };
  }
  saveDatabase();
  return { lastInsertRowid: null, changes: 0 };
}

module.exports = { initDatabase, getDb, queryAll, queryOne, run, saveDatabase };
