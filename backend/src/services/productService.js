const { queryAll, queryOne, run } = require('../database/db');

function getAllProducts(filters = {}) {
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (filters.search) {
    sql += ' AND (name LIKE ? OR item_code LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  if (filters.category) {
    sql += ' AND category = ?';
    params.push(filters.category);
  }
  if (filters.metal) {
    sql += ' AND metal = ?';
    params.push(filters.metal);
  }
  if (filters.purity) {
    sql += ' AND purity = ?';
    params.push(filters.purity);
  }
  if (filters.status) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }

  sql += ' ORDER BY item_code ASC';
  return queryAll(sql, params);
}

function getProductById(id) {
  return queryOne('SELECT * FROM products WHERE id = ?', [id]);
}

function getProductByCode(code) {
  return queryOne('SELECT * FROM products WHERE item_code = ?', [code]);
}

function createProduct(data) {
  const {
    item_code, name, category, metal, purity,
    gross_weight, stone_weight, net_weight,
    making_charge, wastage_percent, status = 'AVAILABLE',
  } = data;
  const result = run(
    `INSERT INTO products 
     (item_code, name, category, metal, purity, gross_weight, stone_weight, net_weight, making_charge, wastage_percent, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [item_code, name, category, metal, purity, gross_weight, stone_weight, net_weight, making_charge, wastage_percent, status]
  );
  return getProductById(result.lastInsertRowid);
}

function updateProduct(id, data) {
  const {
    item_code, name, category, metal, purity,
    gross_weight, stone_weight, net_weight,
    making_charge, wastage_percent, status,
  } = data;
  run(
    `UPDATE products SET item_code=?, name=?, category=?, metal=?, purity=?,
     gross_weight=?, stone_weight=?, net_weight=?, making_charge=?, wastage_percent=?,
     status=?, updated_at=datetime('now') WHERE id=?`,
    [item_code, name, category, metal, purity, gross_weight, stone_weight, net_weight, making_charge, wastage_percent, status, id]
  );
  return getProductById(id);
}

function deleteProduct(id) {
  return run('DELETE FROM products WHERE id = ?', [id]);
}

module.exports = {
  getAllProducts, getProductById, getProductByCode,
  createProduct, updateProduct, deleteProduct,
};
