const express = require('express');
const router = express.Router();
const svc = require('../services/metalRateService');

router.get('/', (req, res) => {
  try {
    res.json({ success: true, data: svc.getAllMetalRates() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/', (req, res) => {
  try {
    const { metal, purity, rate_per_gram } = req.body;
    const rate = svc.upsertRate(metal, purity, rate_per_gram);
    res.json({ success: true, data: rate });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
