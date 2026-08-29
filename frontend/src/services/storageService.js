/**
 * Sri Sai Jewels — Storage Service Layer (Demo Persistence)
 * 
 * Provides local persistence using browser localStorage for Phase 1 testing.
 * Namespaced keys:
 *  - sriSaiJewels_customers
 *  - sriSaiJewels_invoices
 *  - sriSaiJewels_oldPurchases
 *  - sriSaiJewels_products
 *  - sriSaiJewels_metalRates
 *  - sriSaiJewels_settings
 */

import {
  mockCustomers,
  mockInvoices,
  mockPurchases,
  mockProducts,
  mockMetalRates,
  mockSettings,
} from '../data/mockData';

export const STORAGE_KEYS = {
  CUSTOMERS: 'sriSaiJewels_customers',
  INVOICES: 'sriSaiJewels_invoices',
  OLD_PURCHASES: 'sriSaiJewels_oldPurchases',
  PRODUCTS: 'sriSaiJewels_products',
  RATES: 'sriSaiJewels_metalRates',
  SETTINGS: 'sriSaiJewels_settings',
};

function safeGet(key, defaultData) {
  try {
    const item = localStorage.getItem(key);
    if (item === null || item === undefined) {
      // First visit / not stored yet: persist the default mock data so it's initialized
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(item);
  } catch (err) {
    console.warn(`[storageService] Error reading ${key} from localStorage:`, err);
    return defaultData;
  }
}

function safeSet(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`[storageService] Error writing ${key} to localStorage:`, err);
  }
}

export const storageService = {
  // ==================== CUSTOMERS ====================
  getCustomers() {
    return safeGet(STORAGE_KEYS.CUSTOMERS, mockCustomers);
  },

  saveCustomers(customers) {
    safeSet(STORAGE_KEYS.CUSTOMERS, customers);
    return customers;
  },

  addCustomer(customer) {
    const list = this.getCustomers();
    const newCust = {
      ...customer,
      id: customer.id || Date.now(),
      created_at: customer.created_at || new Date().toISOString().split('T')[0],
    };
    const updated = [newCust, ...list];
    this.saveCustomers(updated);
    return newCust;
  },

  updateCustomer(customer) {
    const list = this.getCustomers();
    const updated = list.map(c => (c.id === customer.id ? { ...c, ...customer } : c));
    this.saveCustomers(updated);
    return updated;
  },

  deleteCustomer(id) {
    const list = this.getCustomers();
    const updated = list.filter(c => c.id !== id);
    this.saveCustomers(updated);
    return updated;
  },

  // ==================== INVOICES (SALES) ====================
  getInvoices() {
    return safeGet(STORAGE_KEYS.INVOICES, mockInvoices);
  },

  saveInvoices(invoices) {
    safeSet(STORAGE_KEYS.INVOICES, invoices);
    return invoices;
  },

  addInvoice(invoice) {
    const list = this.getInvoices();
    const newInv = {
      ...invoice,
      id: invoice.id || Date.now(),
      created_at: invoice.created_at || new Date().toISOString().split('T')[0],
    };
    const updated = [newInv, ...list];
    this.saveInvoices(updated);
    return newInv;
  },

  // ==================== OLD PURCHASES ====================
  getOldPurchases() {
    return safeGet(STORAGE_KEYS.OLD_PURCHASES, mockPurchases);
  },

  saveOldPurchases(purchases) {
    safeSet(STORAGE_KEYS.OLD_PURCHASES, purchases);
    return purchases;
  },

  addOldPurchase(purchase) {
    const list = this.getOldPurchases();
    const newPurchase = {
      ...purchase,
      id: purchase.id || `PUR-${Date.now().toString().slice(-4)}`,
      created_at: purchase.created_at || new Date().toISOString().split('T')[0],
    };
    const updated = [newPurchase, ...list];
    this.saveOldPurchases(updated);
    return newPurchase;
  },

  // ==================== PRODUCTS ====================
  getProducts() {
    return safeGet(STORAGE_KEYS.PRODUCTS, mockProducts);
  },

  saveProducts(products) {
    safeSet(STORAGE_KEYS.PRODUCTS, products);
    return products;
  },

  // ==================== METAL RATES ====================
  getMetalRates() {
    return safeGet(STORAGE_KEYS.RATES, mockMetalRates);
  },

  saveMetalRates(rates) {
    safeSet(STORAGE_KEYS.RATES, rates);
    return rates;
  },

  // ==================== SETTINGS ====================
  getSettings() {
    return safeGet(STORAGE_KEYS.SETTINGS, mockSettings);
  },

  saveSettings(settings) {
    safeSet(STORAGE_KEYS.SETTINGS, settings);
    return settings;
  },

  // ==================== RESET DEMO DATA ====================
  resetDemoData() {
    // Only remove Sri Sai Jewels demo keys
    Object.values(STORAGE_KEYS).forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch (err) {
        console.warn(`Error removing ${k}:`, err);
      }
    });

    // Re-initialize with original mock data
    this.saveCustomers(mockCustomers);
    this.saveInvoices(mockInvoices);
    this.saveOldPurchases(mockPurchases);
    this.saveProducts(mockProducts);
    this.saveMetalRates(mockMetalRates);
    this.saveSettings(mockSettings);
  }
};

export default storageService;
