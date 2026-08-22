const { queryAll, queryOne, run } = require('../database/db');
const { getSetting } = require('./settingsService');

function generateInvoiceNumber() {
  const prefix = getSetting('invoice_prefix') || 'INV-';
  const last = queryOne(
    "SELECT invoice_number FROM invoices ORDER BY id DESC LIMIT 1"
  );
  if (!last) return `${prefix}0001`;
  const lastNum = parseInt(last.invoice_number.replace(prefix, ''), 10) || 0;
  return `${prefix}${String(lastNum + 1).padStart(4, '0')}`;
}

function getAllInvoices(filters = {}) {
  let sql = `
    SELECT i.*, c.name as customer_name, c.phone as customer_phone 
    FROM invoices i
    LEFT JOIN customers c ON c.id = i.customer_id
    WHERE 1=1
  `;
  const params = [];

  if (filters.search) {
    sql += ' AND (i.invoice_number LIKE ? OR c.name LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  if (filters.status) {
    sql += ' AND i.payment_status = ?';
    params.push(filters.status);
  }
  if (filters.date_from) {
    sql += ' AND i.invoice_date >= ?';
    params.push(filters.date_from);
  }
  if (filters.date_to) {
    sql += ' AND i.invoice_date <= ?';
    params.push(filters.date_to);
  }

  sql += ' ORDER BY i.created_at DESC';
  return queryAll(sql, params);
}

function getInvoiceById(id) {
  const invoice = queryOne(
    `SELECT i.*, c.name as customer_name, c.phone as customer_phone, c.address as customer_address, c.gstin as customer_gstin
     FROM invoices i LEFT JOIN customers c ON c.id = i.customer_id WHERE i.id = ?`,
    [id]
  );
  if (!invoice) return null;

  invoice.items = queryAll(
    'SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id ASC',
    [id]
  );
  invoice.payments = queryAll(
    'SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date ASC',
    [id]
  );
  return invoice;
}

function createInvoice(data) {
  const {
    customer_id, invoice_date, items = [], payments = [],
    discount = 0, gst_rate, notes = '',
  } = data;

  // Calculate totals
  let subtotal = 0;
  const processedItems = items.map((item) => {
    const net_weight = (item.gross_weight || 0) - (item.stone_weight || 0);
    const metal_value = net_weight * (item.gold_rate || 0);
    const wastage_amount = metal_value * ((item.wastage_percent || 0) / 100);
    const item_total =
      metal_value + wastage_amount + (item.making_charge || 0) + (item.stone_charge || 0) - (item.discount || 0);
    subtotal += item_total;
    return { ...item, net_weight, metal_value, wastage_amount, item_total };
  });

  const taxable = subtotal - (discount || 0);
  const gstAmount = taxable * ((gst_rate || 3) / 100);
  const grand_total = Math.round(taxable + gstAmount);
  const paid_amount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const balance_amount = grand_total - paid_amount;
  const payment_status =
    paid_amount <= 0 ? 'PENDING' : paid_amount >= grand_total ? 'PAID' : 'PARTIAL';

  const invoice_number = generateInvoiceNumber();

  const result = run(
    `INSERT INTO invoices 
     (invoice_number, customer_id, invoice_date, subtotal, discount, gst_rate, gst_amount, grand_total, paid_amount, balance_amount, payment_status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [invoice_number, customer_id || null, invoice_date || new Date().toISOString().split('T')[0],
     subtotal, discount, gst_rate || 3, gstAmount, grand_total, paid_amount, balance_amount, payment_status, notes]
  );

  const invoiceId = result.lastInsertRowid;

  // Insert items
  for (const item of processedItems) {
    run(
      `INSERT INTO invoice_items 
       (invoice_id, product_id, item_code, description, metal, purity, gross_weight, stone_weight, net_weight, gold_rate, metal_value, making_charge, wastage_percent, wastage_amount, stone_charge, discount, item_total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [invoiceId, item.product_id || null, item.item_code || '', item.description,
       item.metal, item.purity, item.gross_weight, item.stone_weight || 0, item.net_weight,
       item.gold_rate, item.metal_value, item.making_charge || 0, item.wastage_percent || 0,
       item.wastage_amount, item.stone_charge || 0, item.discount || 0, item.item_total]
    );
  }

  // Insert payments
  for (const payment of payments) {
    run(
      'INSERT INTO payments (invoice_id, payment_method, amount, reference_number, payment_date, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [invoiceId, payment.payment_method, payment.amount, payment.reference_number || '', payment.payment_date || new Date().toISOString().split('T')[0], payment.notes || '']
    );
  }

  return getInvoiceById(invoiceId);
}

function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0];

  const todaySales = queryOne(
    'SELECT COALESCE(SUM(grand_total), 0) as total FROM invoices WHERE invoice_date = ?',
    [today]
  );
  const todayBills = queryOne(
    'SELECT COUNT(*) as count FROM invoices WHERE invoice_date = ?',
    [today]
  );
  const totalCustomers = queryOne('SELECT COUNT(*) as count FROM customers');
  const pendingPayments = queryOne(
    "SELECT COALESCE(SUM(balance_amount), 0) as total FROM invoices WHERE payment_status IN ('PENDING', 'PARTIAL')"
  );
  const todayGst = queryOne(
    'SELECT COALESCE(SUM(gst_amount), 0) as total FROM invoices WHERE invoice_date = ?',
    [today]
  );

  return {
    todaySales: todaySales?.total || 0,
    todayBills: todayBills?.count || 0,
    totalCustomers: totalCustomers?.count || 0,
    pendingPayments: pendingPayments?.total || 0,
    todayGst: todayGst?.total || 0,
  };
}

module.exports = { getAllInvoices, getInvoiceById, createInvoice, getDashboardStats };
