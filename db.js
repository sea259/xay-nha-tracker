// db.js - IndexedDB wrapper for Xay Nha Tracker
const DB_NAME = 'XayNhaTracker';
const DB_VERSION = 1;

const STORES = {
    payments: 'payments',
    expenses: 'expenses',
    progress: 'progress',
    finance: 'finance',
    settings: 'settings'
};

let dbInstance = null;

function openDB() {
    if (dbInstance) return Promise.resolve(dbInstance);
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            dbInstance = request.result;
            resolve(dbInstance);
        };
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            // payments: { id, contractType, installment, amount, description, status, paidAmount, paidDate, paymentMethod, notes }
            if (!db.objectStoreNames.contains(STORES.payments)) {
                const ps = db.createObjectStore(STORES.payments, { keyPath: 'id' });
                ps.createIndex('contractType', 'contractType', { unique: false });
                ps.createIndex('status', 'status', { unique: false });
            }
            // expenses: { id, name, amount, date, category, notes, createdAt }
            if (!db.objectStoreNames.contains(STORES.expenses)) {
                const es = db.createObjectStore(STORES.expenses, { keyPath: 'id' });
                es.createIndex('category', 'category', { unique: false });
                es.createIndex('date', 'date', { unique: false });
            }
            // progress: { id, date, title, description, phase, photos[], createdAt }
            if (!db.objectStoreNames.contains(STORES.progress)) {
                const pr = db.createObjectStore(STORES.progress, { keyPath: 'id' });
                pr.createIndex('date', 'date', { unique: false });
                pr.createIndex('phase', 'phase', { unique: false });
            }
            // finance: { id, type('loan_disbursement'|'gold_sale'|'loan_payment'), date, amount, notes, createdAt }
            if (!db.objectStoreNames.contains(STORES.finance)) {
                const fi = db.createObjectStore(STORES.finance, { keyPath: 'id' });
                fi.createIndex('type', 'type', { unique: false });
                fi.createIndex('date', 'date', { unique: false });
            }
            // settings: key-value store
            if (!db.objectStoreNames.contains(STORES.settings)) {
                db.createObjectStore(STORES.settings, { keyPath: 'key' });
            }
        };
    });
}

function tx(storeName, mode = 'readonly') {
    return dbInstance.transaction(storeName, mode).objectStore(storeName);
}

function promisify(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

const DB = {
    async init() {
        await openDB();
    },

    // Generic CRUD
    async getAll(storeName) {
        await openDB();
        return promisify(tx(storeName).getAll());
    },

    async get(storeName, id) {
        await openDB();
        return promisify(tx(storeName).get(id));
    },

    async put(storeName, data) {
        await openDB();
        return promisify(tx(storeName, 'readwrite').put(data));
    },

    async delete(storeName, id) {
        await openDB();
        return promisify(tx(storeName, 'readwrite').delete(id));
    },

    async clear(storeName) {
        await openDB();
        return promisify(tx(storeName, 'readwrite').clear());
    },

    async getAllByIndex(storeName, indexName, value) {
        await openDB();
        return promisify(tx(storeName).index(indexName).getAll(value));
    },

    // Payment specific
    async getPayments(contractType) {
        if (contractType) {
            return this.getAllByIndex(STORES.payments, 'contractType', contractType);
        }
        return this.getAll(STORES.payments);
    },

    async updatePayment(id, updates) {
        const payment = await this.get(STORES.payments, id);
        if (!payment) throw new Error('Payment not found');
        Object.assign(payment, updates);
        return this.put(STORES.payments, payment);
    },

    // Expenses
    async addExpense(expense) {
        expense.id = expense.id || 'exp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        expense.createdAt = expense.createdAt || new Date().toISOString();
        return this.put(STORES.expenses, expense);
    },

    async getExpenses() {
        const all = await this.getAll(STORES.expenses);
        return all.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    },

    // Progress
    async addProgress(entry) {
        entry.id = entry.id || 'prog_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        entry.createdAt = entry.createdAt || new Date().toISOString();
        entry.photos = entry.photos || [];
        return this.put(STORES.progress, entry);
    },

    async getProgress() {
        const all = await this.getAll(STORES.progress);
        return all.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    },

    // Finance
    async addFinance(entry) {
        entry.id = entry.id || 'fin_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        entry.createdAt = entry.createdAt || new Date().toISOString();
        return this.put(STORES.finance, entry);
    },

    async getFinance(type) {
        if (type) {
            return this.getAllByIndex(STORES.finance, 'type', type);
        }
        const all = await this.getAll(STORES.finance);
        return all.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    },

    // Settings
    async getSetting(key) {
        const result = await this.get(STORES.settings, key);
        return result ? result.value : null;
    },

    async setSetting(key, value) {
        return this.put(STORES.settings, { key, value });
    },

    // Export all data as JSON
    async exportAll() {
        const [payments, expenses, progress, finance] = await Promise.all([
            this.getAll(STORES.payments),
            this.getAll(STORES.expenses),
            this.getAll(STORES.progress),
            this.getAll(STORES.finance)
        ]);
        return {
            version: 1,
            exportDate: new Date().toISOString(),
            data: { payments, expenses, progress, finance }
        };
    },

    // Import from JSON
    async importAll(jsonData) {
        if (!jsonData || !jsonData.data) throw new Error('Invalid backup data');
        const { payments, expenses, progress, finance } = jsonData.data;

        // Clear all stores first
        await Promise.all([
            this.clear(STORES.payments),
            this.clear(STORES.expenses),
            this.clear(STORES.progress),
            this.clear(STORES.finance)
        ]);

        // Insert all data
        const ops = [];
        if (payments) payments.forEach(p => ops.push(this.put(STORES.payments, p)));
        if (expenses) expenses.forEach(e => ops.push(this.put(STORES.expenses, e)));
        if (progress) progress.forEach(p => ops.push(this.put(STORES.progress, p)));
        if (finance) finance.forEach(f => ops.push(this.put(STORES.finance, f)));
        await Promise.all(ops);
    },

    STORES
};
