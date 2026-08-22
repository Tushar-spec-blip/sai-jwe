const express = require('express');
const router = express.Router();
const invoiceSvc = require('../services/invoiceService');

router.get('/dashboard-stats', (req, res) => {
  try {
    const stats = invoiceSvc.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/', (req, res) => {
  try {
    const invoices = invoiceSvc.getAllInvoices(req.query);
    res.json({ success: true, data: invoices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const invoice = invoiceSvc.getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const invoice = invoiceSvc.createInvoice(req.body);
    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
