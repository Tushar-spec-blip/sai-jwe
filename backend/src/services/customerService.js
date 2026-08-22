const { queryAll, queryOne, run } = require('../database/db');

// GET all customers
function getAllCustomers(search = '') {
  if (search) {
    return queryAll(
      `SELECT * FROM customers 
       WHERE name LIKE ? OR phone LIKE ? OR CAST(id AS TEXT) LIKE ?
       ORDER BY name ASC`,
      [`%${search}%`, `%${search}%`, `%${search}%`]
    );
  }
  return queryAll('SELECT * FROM customers ORDER BY name ASC');
}

// GET one customer by id
function getCustomerById(id) {
  return queryOne('SELECT * FROM customers WHERE id = ?', [id]);
}

// CREATE customer
function createCustomer({ name, phone, address = '', gstin = '' }) {
  const result = run(
    'INSERT INTO customers (name, phone, address, gstin) VALUES (?, ?, ?, ?)',
    [name, phone, address, gstin]
  );
  return getCustomerById(result.lastInsertRowid);
}

// UPDATE customer
function updateCustomer(id, { name, phone, address = '', gstin = '' }) {
  run(
    `UPDATE customers SET name=?, phone=?, address=?, gstin=?, updated_at=datetime('now') WHERE id=?`,
    [name, phone, address, gstin, id]
  );
  return getCustomerById(id);
}

// DELETE customer
function deleteCustomer(id) {
  return run('DELETE FROM customers WHERE id = ?', [id]);
}

// GET customer purchase history
function getCustomerInvoices(customerId) {
  return queryAll(
    `SELECT i.*, c.name as customer_name 
     FROM invoices i 
     LEFT JOIN customers c ON c.id = i.customer_id
     WHERE i.customer_id = ? 
     ORDER BY i.invoice_date DESC`,
    [customerId]
  );
}

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerInvoices,
};
