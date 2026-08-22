/**
 * Sri Sai Jewels — Mock Data Service Layer (Phase 1.6 Demo Architecture)
 * 
 * Provides an isolated service layer interface for mock/demo data.
 * In Phase 2, this service module will be replaced with real SQLite API calls
 * without needing to rewrite UI components.
 */

import {
  mockCustomers,
  mockProducts,
  mockMetalRates,
  mockInvoices,
  mockDashboardStats,
  mockSettings,
  mockPendingPayments,
} from '../data/mockData';

// Storage keys for demo session caching
const STORAGE_KEYS = {
  CUSTOMERS: 'ssj_demo_customers',
  PRODUCTS: 'ssj_demo_products',
  INVOICES: 'ssj_demo_invoices',
  RATES: 'ssj_demo_rates',
  SETTINGS: 'ssj_demo_settings',
};

function getStoredOrDefault(key, defaultData) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultData;
  } catch (e) {
    console.warn('localStorage error, using default mock data', e);
    return defaultData;
  }
}

function setStored(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage write error', e);
  }
}

export const mockDataService = {
  // Customers
  async getCustomers() {
    return getStoredOrDefault(STORAGE_KEYS.CUSTOMERS, mockCustomers);
  },

  async saveCustomer(customer) {
    const list = await this.getCustomers();
    let updated;
    if (customer.id) {
      updated = list.map(c => c.id === customer.id ? { ...c, ...customer } : c);
    } else {
      const newCust = { ...customer, id: Date.now(), created_at: new Date().toISOString().split('T')[0] };
      updated = [newCust, ...list];
    }
    setStored(STORAGE_KEYS.CUSTOMERS, updated);
    return updated;
  },

  async deleteCustomer(id) {
    const list = await this.getCustomers();
    const updated = list.filter(c => c.id !== id);
    setStored(STORAGE_KEYS.CUSTOMERS, updated);
    return updated;
  },

  // Products / Inventory
  async getProducts() {
    return getStoredOrDefault(STORAGE_KEYS.PRODUCTS, mockProducts);
  },

  async saveProduct(product) {
    const list = await this.getProducts();
    let updated;
    if (product.id) {
      updated = list.map(p => p.id === product.id ? { ...p, ...product } : p);
    } else {
      const newProd = { ...product, id: Date.now(), created_at: new Date().toISOString().split('T')[0] };
      updated = [newProd, ...list];
    }
    setStored(STORAGE_KEYS.PRODUCTS, updated);
    return updated;
  },

  async deleteProduct(id) {
    const list = await this.getProducts();
    const updated = list.filter(p => p.id !== id);
    setStored(STORAGE_KEYS.PRODUCTS, updated);
    return updated;
  },

  // Invoices
  async getInvoices() {
    return getStoredOrDefault(STORAGE_KEYS.INVOICES, mockInvoices);
  },

  async saveInvoice(invoice) {
    const list = await this.getInvoices();
    const newInv = {
      ...invoice,
      id: invoice.id || Date.now(),
      created_at: new Date().toISOString().split('T')[0],
    };
    const updated = [newInv, ...list];
    setStored(STORAGE_KEYS.INVOICES, updated);
    return newInv;
  },

  // Metal Rates
  async getMetalRates() {
    return getStoredOrDefault(STORAGE_KEYS.RATES, mockMetalRates);
  },

  async updateMetalRate(id, newRate) {
    const list = await this.getMetalRates();
    const updated = list.map(r => r.id === id ? { ...r, rate_per_gram: parseFloat(newRate) || r.rate_per_gram, updated_at: new Date().toISOString().split('T')[0] } : r);
    setStored(STORAGE_KEYS.RATES, updated);
    return updated;
  },

  // Settings
  async getSettings() {
    return getStoredOrDefault(STORAGE_KEYS.SETTINGS, mockSettings);
  },

  async updateSettings(newSettings) {
    const current = await this.getSettings();
    const updated = { ...current, ...newSettings };
    setStored(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // Stats & Dashboard
  async getDashboardStats() {
    return mockDashboardStats;
  },

  async getPendingPayments() {
    return mockPendingPayments;
  },

  // Reset Demo Session Data
  resetDemoData() {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  }
};
