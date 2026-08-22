const { queryAll, queryOne, run } = require('../database/db');

function getAllSettings() {
  const rows = queryAll('SELECT key, value FROM settings');
  const result = {};
  for (const row of rows) result[row.key] = row.value;
  return result;
}

function getSetting(key) {
  const row = queryOne('SELECT value FROM settings WHERE key = ?', [key]);
  return row ? row.value : null;
}

function setSetting(key, value) {
  run(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
    [key, String(value)]
  );
  return getSetting(key);
}

function updateSettings(updates) {
  for (const [key, value] of Object.entries(updates)) {
    setSetting(key, value);
  }
  return getAllSettings();
}

module.exports = { getAllSettings, getSetting, setSetting, updateSettings };
