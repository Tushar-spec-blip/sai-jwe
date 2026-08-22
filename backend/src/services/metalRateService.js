const { queryAll, queryOne, run } = require('../database/db');

function getAllMetalRates() {
  return queryAll('SELECT * FROM metal_rates ORDER BY metal, purity');
}

function getRateByMetalPurity(metal, purity) {
  return queryOne('SELECT * FROM metal_rates WHERE metal=? AND purity=?', [metal, purity]);
}

function upsertRate(metal, purity, rate_per_gram) {
  run(
    `INSERT INTO metal_rates (metal, purity, rate_per_gram, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(metal, purity) DO UPDATE SET rate_per_gram=excluded.rate_per_gram, updated_at=excluded.updated_at`,
    [metal, purity, rate_per_gram]
  );
  return getRateByMetalPurity(metal, purity);
}

module.exports = { getAllMetalRates, getRateByMetalPurity, upsertRate };
