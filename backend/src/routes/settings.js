const express = require('express');
const router = express.Router();
const svc = require('../services/settingsService');

router.get('/', (req, res) => {
  try {
    res.json({ success: true, data: svc.getAllSettings() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/', (req, res) => {
  try {
    const updated = svc.updateSettings(req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
