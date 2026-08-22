const express = require('express');
const router = express.Router();
const svc = require('../services/customerService');

router.get('/', (req, res) => {
  try {
    const customers = svc.getAllCustomers(req.query.search);
    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const customer = svc.getCustomerById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
    const invoices = svc.getCustomerInvoices(req.params.id);
    res.json({ success: true, data: { ...customer, invoices } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const customer = svc.createCustomer(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const customer = svc.updateCustomer(req.params.id, req.body);
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    svc.deleteCustomer(req.params.id);
    res.json({ success: true, message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
