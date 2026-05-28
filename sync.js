// sync.js - Google Sheets sync module for Xay Nha Tracker

const Sync = {
    GAS_URL_KEY: 'gas_sync_url',
    LAST_SYNC_KEY: 'last_sync_time',
    SYNC_STATUS_KEY: 'sync_status',

    async getGasUrl() {
        return DB.getSetting(this.GAS_URL_KEY);
    },

    async setGasUrl(url) {
        await DB.setSetting(this.GAS_URL_KEY, url.trim());
    },

    async getLastSync() {
        return DB.getSetting(this.LAST_SYNC_KEY);
    },

    async setLastSync(time) {
        await DB.setSetting(this.LAST_SYNC_KEY, time);
    },

    isConfigured() {
        return this._cachedUrl && this._cachedUrl.startsWith('https://script.google.com/');
    },

    async init() {
        this._cachedUrl = await this.getGasUrl();
    },

    // ==================== PUSH ====================
    async push() {
        const url = await this.getGasUrl();
        if (!url) throw new Error('Chua cai dat URL Google Apps Script');

        const [payments, expenses, progress, finance] = await Promise.all([
            DB.getAll(DB.STORES.payments),
            DB.getAll(DB.STORES.expenses),
            DB.getAll(DB.STORES.progress),
            DB.getAll(DB.STORES.finance)
        ]);

        // Strip photos from progress (too large for network/sheets)
        const progressClean = progress.map(p => ({
            ...p,
            photos: undefined,
            photoCount: (p.photos || []).length
        }));

        const payload = {
            action: 'push',
            data: {
                payments,
                expenses,
                progress: progressClean,
                finance
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' }, // GAS requires text/plain for CORS
            body: JSON.stringify(payload),
            redirect: 'follow'
        });

        if (!response.ok) throw new Error('HTTP ' + response.status);

        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Sync failed');

        const syncTime = new Date().toISOString();
        await this.setLastSync(syncTime);
        return { syncTime, recordCount: payments.length + expenses.length + progress.length + finance.length };
    },

    // ==================== PULL ====================
    async pull() {
        const url = await this.getGasUrl();
        if (!url) throw new Error('Chua cai dat URL Google Apps Script');

        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow'
        });

        if (!response.ok) throw new Error('HTTP ' + response.status);

        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Pull failed');

        const data = result.data;
        let importCount = 0;

        // Merge payments (update existing, status from sheets wins)
        if (data.payments && data.payments.length > 0) {
            for (const p of data.payments) {
                const local = await DB.get(DB.STORES.payments, p.id);
                if (local) {
                    // Only update payment status fields from sheets
                    if (p.status === 'paid' && local.status !== 'paid') {
                        await DB.updatePayment(p.id, {
                            status: p.status,
                            paidAmount: p.paidAmount || 0,
                            paidDate: p.paidDate,
                            paymentMethod: p.paymentMethod,
                            notes: p.notes || ''
                        });
                        importCount++;
                    }
                }
            }
        }

        // Merge expenses (add missing, update existing)
        if (data.expenses && data.expenses.length > 0) {
            const localExpenses = await DB.getAll(DB.STORES.expenses);
            const localIds = new Set(localExpenses.map(e => e.id));
            for (const e of data.expenses) {
                if (!localIds.has(e.id)) {
                    await DB.put(DB.STORES.expenses, e);
                    importCount++;
                }
            }
        }

        // Merge progress (add missing, preserve local photos)
        if (data.progress && data.progress.length > 0) {
            const localProgress = await DB.getAll(DB.STORES.progress);
            const localIds = new Set(localProgress.map(p => p.id));
            for (const p of data.progress) {
                if (!localIds.has(p.id)) {
                    p.photos = p.photos || [];
                    await DB.put(DB.STORES.progress, p);
                    importCount++;
                }
            }
        }

        // Merge finance (add missing)
        if (data.finance && data.finance.length > 0) {
            const localFinance = await DB.getAll(DB.STORES.finance);
            const localIds = new Set(localFinance.map(f => f.id));
            for (const f of data.finance) {
                if (!localIds.has(f.id)) {
                    await DB.put(DB.STORES.finance, f);
                    importCount++;
                }
            }
        }

        const syncTime = new Date().toISOString();
        await this.setLastSync(syncTime);
        return { syncTime, importCount };
    }
};
