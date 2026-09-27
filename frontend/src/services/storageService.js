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
 *  - sriSaiJewels_services
 *  - sriSaiJewels_svcCounter
 *  - sriSaiJewels_testingReports
 */

import {
  mockCustomers,
  mockInvoices,
  mockPurchases,
  mockProducts,
  mockMetalRates,
  mockSettings,
  mockServices,
  mockTestingReports,
} from '../data/mockData';

export const STORAGE_KEYS = {
  CUSTOMERS:        'sriSaiJewels_customers',
  INVOICES:         'sriSaiJewels_invoices',
  OLD_PURCHASES:    'sriSaiJewels_oldPurchases',
  PRODUCTS:         'sriSaiJewels_products',
  RATES:            'sriSaiJewels_metalRates',
  SETTINGS:         'sriSaiJewels_settings',
  SERVICES:         'sriSaiJewels_services',
  SVC_COUNTER:      'sriSaiJewels_svcCounter',
  TESTING_REPORTS:  'sriSaiJewels_testingReports',
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
    const rates = safeGet(STORAGE_KEYS.RATES, mockMetalRates);

    // ------------------------------------------------------------------
    // Migration Step 1: convert old "999 Silver" / "92.5 Silver" etc.
    // purity labels to the canonical short-form labels ("999", "92.5", …).
    // ------------------------------------------------------------------
    const SILVER_PURITY_RENAME = {
      '999 Silver':   '999',
      '92.5 Silver':  '92.5',
      '80 Silver':    '80',
      '70 Silver':    '70',
      '60 Silver':    '60',
      'Other Silver': 'Other',
    };
    let needsSave = false;
    let result = rates.map(r => {
      if (r.metal === 'Silver' && SILVER_PURITY_RENAME[r.purity]) {
        needsSave = true;
        return { ...r, purity: SILVER_PURITY_RENAME[r.purity] };
      }
      return r;
    });

    // ------------------------------------------------------------------
    // Migration Step 2: ensure all 6 required Silver purities exist.
    // If localStorage was saved with fewer Silver entries (e.g. only "999"),
    // the missing purities are inserted here with rate_per_gram: 0.
    // ------------------------------------------------------------------
    const REQUIRED_SILVER_PURITIES = ['999', '92.5', '80', '70', '60', 'Other'];
    const existingPurities = new Set(
      result.filter(r => r.metal === 'Silver').map(r => r.purity)
    );
    const maxId = result.reduce((m, r) => Math.max(m, r.id || 0), 0);
    let nextId = maxId + 1;
    REQUIRED_SILVER_PURITIES.forEach(purity => {
      if (!existingPurities.has(purity)) {
        needsSave = true;
        result.push({
          id: nextId++,
          metal: 'Silver',
          purity,
          rate_per_gram: 0,
          updated_at: new Date().toISOString().split('T')[0],
        });
      }
    });

    if (needsSave) {
      safeSet(STORAGE_KEYS.RATES, result);
    }
    return result;
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

  // ==================== SERVICES ====================
  getServices() {
    return safeGet(STORAGE_KEYS.SERVICES, mockServices);
  },

  saveServices(services) {
    safeSet(STORAGE_KEYS.SERVICES, services);
    return services;
  },

  addService(service) {
    const list = this.getServices();
    const newService = {
      ...service,
      id: service.id || Date.now(),
      createdAt: service.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newService, ...list];
    this.saveServices(updated);
    return newService;
  },

  updateService(service) {
    const list = this.getServices();
    const updated = list.map(s =>
      s.id === service.id ? { ...s, ...service, updatedAt: new Date().toISOString() } : s
    );
    this.saveServices(updated);
    return updated;
  },

  deleteService(id) {
    const list = this.getServices();
    const updated = list.filter(s => s.id !== id);
    this.saveServices(updated);
    return updated;
  },

  // ---- SVC Bill Number Counter ----
  getNextSvcNumber() {
    try {
      const current = parseInt(localStorage.getItem(STORAGE_KEYS.SVC_COUNTER) || '0', 10);
      const next = current + 1;
      localStorage.setItem(STORAGE_KEYS.SVC_COUNTER, String(next));
      return `SVC-${String(next).padStart(4, '0')}`;
    } catch (err) {
      console.warn('[storageService] Error generating SVC number:', err);
      return `SVC-${Date.now().toString().slice(-4)}`;
    }
  },

  // ==================== TESTING REPORTS ====================
  getTestingReports() {
    return safeGet(STORAGE_KEYS.TESTING_REPORTS, mockTestingReports);
  },

  saveTestingReports(reports) {
    safeSet(STORAGE_KEYS.TESTING_REPORTS, reports);
    return reports;
  },

  addTestingReport(report) {
    const list = this.getTestingReports();
    const newReport = {
      ...report,
      id: report.id || Date.now(),
      createdAt: report.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newReport, ...list];
    this.saveTestingReports(updated);
    return newReport;
  },

  updateTestingReport(report) {
    const list = this.getTestingReports();
    const updated = list.map(r =>
      r.id === report.id ? { ...r, ...report, updatedAt: new Date().toISOString() } : r
    );
    this.saveTestingReports(updated);
    return updated;
  },

  deleteTestingReport(id) {
    const list = this.getTestingReports();
    const updated = list.filter(r => r.id !== id);
    this.saveTestingReports(updated);
    return updated;
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
    this.saveServices(mockServices);
    this.saveTestingReports(mockTestingReports);
  }
};

export default storageService;

