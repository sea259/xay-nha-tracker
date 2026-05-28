// app.js - Main application logic for Xay Nha Tracker

// ======================== DATA ========================

const ABK_CONTRACT = {
    name: 'ABK',
    fullName: 'Hợp đồng xây dựng ABK',
    total: 1_940_000_000,
    installments: [
        { num: 1,  amount: 50_000_000,  desc: 'Sau khi ký HĐ (thiết kế hồ sơ)' },
        { num: 2,  amount: 100_000_000, desc: 'Sau 5 ngày vận chuyển máy móc, VL về công trình' },
        { num: 3,  amount: 194_000_000, desc: 'Đổ BT xong phần móng' },
        { num: 4,  amount: 194_000_000, desc: 'Đổ BT sàn Lầu 1' },
        { num: 5,  amount: 194_000_000, desc: 'Đổ BT sàn Lầu 2' },
        { num: 6,  amount: 194_000_000, desc: 'Đổ BT sàn Lầu 3' },
        { num: 7,  amount: 194_000_000, desc: 'Đổ BT sàn Lầu Thượng' },
        { num: 8,  amount: 135_000_000, desc: 'Đổ BT sàn Mái' },
        { num: 9,  amount: 105_000_000, desc: 'Xây tô tường mái + tháo coppa trệt + điện trệt' },
        { num: 10, amount: 105_000_000, desc: 'Tháo coppa L1,L2 + điện L1,L2 + xây tô L1,L2' },
        { num: 11, amount: 105_000_000, desc: 'Tháo coppa L3,LT + điện L3,LT + xây tô L3,LT' },
        { num: 12, amount: 135_000_000, desc: 'Ống nước + chống thấm + kéo dây điện + ống đồng ML + trần thạch cao + sơn 50% + ốp lát 50%' },
        { num: 13, amount: 135_000_000, desc: 'Ốp lát 100% + đá cầu thang + sơn 95% + cửa 70% + lan can 70%' },
        { num: 14, amount: 50_000_000,  desc: 'TBVS + chiếu sáng + sơn 100% + tủ bếp + cửa 100% + vệ sinh bàn giao' },
        { num: 15, amount: 25_000_000,  desc: 'Bảo hành 6 tháng' },
        { num: 16, amount: 25_000_000,  desc: 'Bảo hành 12 tháng' },
    ]
};

const TM_CONTRACT = {
    name: 'TM',
    fullName: 'Hợp đồng thang máy Fuji Lift',
    total: 510_000_000,
    installments: [
        { num: 1, amount: 204_000_000, desc: 'Ký HĐ' },
        { num: 2, amount: 204_000_000, desc: 'Hàng về + bắt đầu lắp đặt' },
        { num: 3, amount: 102_000_000, desc: 'Nghiệm thu + kiểm định + bàn giao' },
    ]
};

const TOTAL_BUDGET = ABK_CONTRACT.total + TM_CONTRACT.total; // 2,450,000,000
const LOAN_AMOUNT = 1_700_000_000;
const GOLD_BARS = 7;
const GOLD_PRICE_EST = 161_000_000;

const EXPENSE_CATEGORIES = [
    'Cửa cuốn', 'Điện 3 pha', 'Hoàn công', 'Nội thất', 'Thiết bị', 'Khác'
];

// ======================== UTILS ========================

function formatVND(amount) {
    if (amount == null || isNaN(amount)) return '0 VNĐ';
    const sign = amount < 0 ? '-' : '';
    const abs = Math.abs(Math.round(amount));
    const str = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return sign + str + ' VNĐ';
}

function formatVNDShort(amount) {
    if (amount == null || isNaN(amount)) return '0';
    const abs = Math.abs(amount);
    if (abs >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(2).replace('.', ',') + ' tỷ';
    if (abs >= 1_000_000) return (amount / 1_000_000).toFixed(0) + ' tr';
    return formatVND(amount);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateInput(dateStr) {
    if (!dateStr) {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }
    return new Date(dateStr).toISOString().split('T')[0];
}

function parseVNDInput(str) {
    if (!str) return 0;
    const cleaned = str.toString().replace(/[.\s]/g, '').replace(/,/g, '').replace(/VNĐ/gi, '').trim();
    return parseInt(cleaned, 10) || 0;
}

function generateId(prefix) {
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

function debounce(fn, ms = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

// ======================== APP STATE ========================

let currentTab = 'dashboard';

// ======================== INIT ========================

async function initApp() {
    await DB.init();
    await Sync.init();
    await seedPayments();
    setupTabs();
    setupModals();
    await loadTab('dashboard');
}

async function seedPayments() {
    const existing = await DB.getPayments();
    if (existing.length > 0) return;

    const ops = [];
    for (const inst of ABK_CONTRACT.installments) {
        ops.push(DB.put(DB.STORES.payments, {
            id: `abk_${inst.num}`,
            contractType: 'ABK',
            installment: inst.num,
            amount: inst.amount,
            description: inst.desc,
            status: 'pending',
            paidAmount: 0,
            paidDate: null,
            paymentMethod: null,
            notes: ''
        }));
    }
    for (const inst of TM_CONTRACT.installments) {
        ops.push(DB.put(DB.STORES.payments, {
            id: `tm_${inst.num}`,
            contractType: 'TM',
            installment: inst.num,
            amount: inst.amount,
            description: inst.desc,
            status: 'pending',
            paidAmount: 0,
            paidDate: null,
            paymentMethod: null,
            notes: ''
        }));
    }
    await Promise.all(ops);
}

// ======================== TAB NAVIGATION ========================

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            loadTab(tab);
        });
    });
}

async function loadTab(tabName) {
    currentTab = tabName;
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    // Show/hide pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.toggle('active', p.id === 'page-' + tabName);
    });
    // Update FAB visibility
    updateFAB(tabName);
    // Load page data
    switch (tabName) {
        case 'dashboard': await loadDashboard(); break;
        case 'payments': await loadPayments(); break;
        case 'expenses': await loadExpenses(); break;
        case 'progress': await loadProgress(); break;
        case 'finance': await loadFinance(); break;
    }
}

function updateFAB(tabName) {
    const fab = document.getElementById('fab');
    const showOn = ['expenses', 'progress', 'finance'];
    fab.style.display = showOn.includes(tabName) ? 'flex' : 'none';
    fab.onclick = () => {
        switch (tabName) {
            case 'expenses': showAddExpenseModal(); break;
            case 'progress': showAddProgressModal(); break;
            case 'finance': showAddFinanceModal(); break;
        }
    };
}

// ======================== MODALS ========================

function setupModals() {
    // Close modal on backdrop click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeAllModals();
        });
    });
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

function showModal(id) {
    document.getElementById(id).classList.add('active');
}

// ======================== DASHBOARD ========================

async function loadDashboard() {
    const payments = await DB.getPayments();
    const expenses = await DB.getExpenses();
    const financeEntries = await DB.getFinance();

    const totalPaid = payments.reduce((s, p) => s + (p.paidAmount || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const totalSpent = totalPaid + totalExpenses;

    // Tính tổng HĐ thực tế từ DB (cho phép user sửa số tiền đợt)
    const abkPayments = payments.filter(p => p.contractType === 'ABK');
    const tmPayments = payments.filter(p => p.contractType === 'TM');
    const abkTotal = abkPayments.reduce((s, p) => s + (p.amount || 0), 0);
    const tmTotal = tmPayments.reduce((s, p) => s + (p.amount || 0), 0);
    const actualBudget = abkTotal + tmTotal;

    const remaining = actualBudget - totalPaid;
    const paidPercent = actualBudget > 0 ? (totalPaid / actualBudget * 100) : 0;

    const abkPaid = abkPayments.reduce((s, p) => s + (p.paidAmount || 0), 0);
    const abkPercent = abkTotal > 0 ? (abkPaid / abkTotal * 100) : 0;

    const tmPaid = tmPayments.reduce((s, p) => s + (p.paidAmount || 0), 0);
    const tmPercent = tmTotal > 0 ? (tmPaid / tmTotal * 100) : 0;

    // Next payment (sort by installment to avoid IndexedDB string key order bug)
    const nextABK = [...abkPayments].sort((a, b) => a.installment - b.installment).find(p => p.status === 'pending');
    const nextTM = [...tmPayments].sort((a, b) => a.installment - b.installment).find(p => p.status === 'pending');

    // Finance
    const disbursements = financeEntries.filter(f => f.type === 'loan_disbursement');
    const goldSales = financeEntries.filter(f => f.type === 'gold_sale');
    const totalDisbursed = disbursements.reduce((s, f) => s + (f.amount || 0), 0);
    const goldSold = goldSales.length;
    const totalGoldReceived = goldSales.reduce((s, f) => s + (f.amount || 0), 0);

    const container = document.getElementById('page-dashboard');
    container.innerHTML = `
        <div class="dashboard-header">
            <h2>Xây Nhà Q12, TPHCM</h2>
            <p class="subtitle">Tổng ngân sách: ${formatVND(actualBudget)}</p>
        </div>

        <div class="progress-section">
            <div class="progress-label">
                <span>Tiến độ thanh toán</span>
                <span class="progress-pct">${paidPercent.toFixed(1)}%</span>
            </div>
            <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width:${Math.min(paidPercent, 100)}%"></div>
            </div>
            <div class="progress-sub">
                ${formatVNDShort(totalPaid)} / ${formatVNDShort(actualBudget)}
            </div>
        </div>

        <div class="card-grid">
            <div class="stat-card stat-paid">
                <div class="stat-icon">${SVG_ICONS.wallet}</div>
                <div class="stat-info">
                    <span class="stat-label">Đã thanh toán HĐ</span>
                    <span class="stat-value">${formatVNDShort(totalPaid)}</span>
                </div>
            </div>
            <div class="stat-card stat-remaining">
                <div class="stat-icon">${SVG_ICONS.clock}</div>
                <div class="stat-info">
                    <span class="stat-label">Còn lại HĐ</span>
                    <span class="stat-value">${formatVNDShort(remaining)}</span>
                </div>
            </div>
            <div class="stat-card stat-extra">
                <div class="stat-icon">${SVG_ICONS.plus}</div>
                <div class="stat-info">
                    <span class="stat-label">Phát sinh</span>
                    <span class="stat-value">${formatVNDShort(totalExpenses)}</span>
                </div>
            </div>
            <div class="stat-card stat-total">
                <div class="stat-icon">${SVG_ICONS.chart}</div>
                <div class="stat-info">
                    <span class="stat-label">Tổng đã chi</span>
                    <span class="stat-value">${formatVNDShort(totalSpent)}</span>
                </div>
            </div>
        </div>

        <div class="section-card">
            <h3>Hợp đồng ABK</h3>
            <div class="mini-progress">
                <div class="progress-bar-track">
                    <div class="progress-bar-fill bg-blue" style="width:${Math.min(abkPercent, 100)}%"></div>
                </div>
                <span class="mini-pct">${abkPercent.toFixed(1)}% - ${formatVNDShort(abkPaid)} / ${formatVNDShort(abkTotal)}</span>
            </div>
            ${nextABK ? `<div class="next-payment">
                <span class="next-label">Đợt kế tiếp:</span>
                <span class="next-detail">Đợt ${nextABK.installment} - ${formatVND(nextABK.amount)}</span>
                <span class="next-desc">${nextABK.description}</span>
            </div>` : '<div class="next-payment done">Hoàn tất thanh toán ABK</div>'}
        </div>

        <div class="section-card">
            <h3>Thang máy Fuji Lift</h3>
            <div class="mini-progress">
                <div class="progress-bar-track">
                    <div class="progress-bar-fill bg-green" style="width:${Math.min(tmPercent, 100)}%"></div>
                </div>
                <span class="mini-pct">${tmPercent.toFixed(1)}% - ${formatVNDShort(tmPaid)} / ${formatVNDShort(tmTotal)}</span>
            </div>
            ${nextTM ? `<div class="next-payment">
                <span class="next-label">Đợt kế tiếp:</span>
                <span class="next-detail">Đợt ${nextTM.installment} - ${formatVND(nextTM.amount)}</span>
                <span class="next-desc">${nextTM.description}</span>
            </div>` : '<div class="next-payment done">Hoàn tất thanh toán TM</div>'}
        </div>

        <div class="section-card">
            <h3>Nguồn tài chính</h3>
            <div class="finance-summary">
                <div class="fin-row">
                    <span>Vay NH đã giải ngân</span>
                    <span>${formatVNDShort(totalDisbursed)} / ${formatVNDShort(LOAN_AMOUNT)}</span>
                </div>
                <div class="fin-row">
                    <span>Vàng đã bán</span>
                    <span>${goldSold} / ${GOLD_BARS} cây (${formatVNDShort(totalGoldReceived)})</span>
                </div>
            </div>
        </div>

        <div class="section-card">
            <h3>${SVG_ICONS.sync} Google Sheets Sync</h3>
            <div id="sync-status"></div>
            <div class="sync-actions">
                ${Sync.isConfigured() ? `
                    <button class="btn btn-primary btn-block" onclick="doSyncPush()">
                        ${SVG_ICONS.upload} Đẩy lên Sheets
                    </button>
                    <button class="btn btn-outline btn-block" onclick="doSyncPull()">
                        ${SVG_ICONS.download} Kéo từ Sheets
                    </button>
                ` : `
                    <p class="sync-note">Chưa cài đặt. Nhấn nút bên dưới để kết nối Google Sheets.</p>
                `}
                <button class="btn btn-outline btn-block btn-sm" onclick="showSyncSettingsModal()">
                    ${SVG_ICONS.settings} Cài đặt Sync
                </button>
            </div>
        </div>

        <div class="section-card">
            <div class="backup-actions">
                <button class="btn btn-outline" onclick="exportBackup()">
                    ${SVG_ICONS.download} Sao lưu JSON
                </button>
                <button class="btn btn-outline" onclick="document.getElementById('import-file').click()">
                    ${SVG_ICONS.upload} Khôi phục JSON
                </button>
                <input type="file" id="import-file" accept=".json" style="display:none" onchange="importBackup(event)">
            </div>
        </div>
    `;
    updateSyncStatus();
}

// ======================== PAYMENTS ========================

async function loadPayments() {
    const payments = await DB.getPayments();
    const abk = payments.filter(p => p.contractType === 'ABK').sort((a, b) => a.installment - b.installment);
    const tm = payments.filter(p => p.contractType === 'TM').sort((a, b) => a.installment - b.installment);

    const abkPaid = abk.reduce((s, p) => s + (p.paidAmount || 0), 0);
    const tmPaid = tm.reduce((s, p) => s + (p.paidAmount || 0), 0);
    const abkTotal = abk.reduce((s, p) => s + (p.amount || 0), 0);
    const tmTotal = tm.reduce((s, p) => s + (p.amount || 0), 0);

    const container = document.getElementById('page-payments');
    container.innerHTML = `
        <div class="payments-header">
            <h2>Thanh toán hợp đồng</h2>
        </div>

        <div class="contract-section">
            <div class="contract-header" onclick="toggleContract('abk-list')">
                <div>
                    <h3>ABK - Xây dựng</h3>
                    <span class="contract-sub">${formatVNDShort(abkPaid)} / ${formatVNDShort(abkTotal)} (${(abkTotal > 0 ? (abkPaid / abkTotal * 100) : 0).toFixed(1)}%)</span>
                </div>
                <span class="chevron">${SVG_ICONS.chevron}</span>
            </div>
            <div id="abk-list" class="installment-list expanded">
                ${abk.map(p => renderPaymentItem(p)).join('')}
                <div class="add-installment-btn" onclick="showAddInstallment('ABK', ${abk.length})">
                    <span>＋ Thêm đợt ${abk.length + 1}</span>
                </div>
            </div>
        </div>

        <div class="contract-section">
            <div class="contract-header" onclick="toggleContract('tm-list')">
                <div>
                    <h3>TM - Thang máy Fuji</h3>
                    <span class="contract-sub">${formatVNDShort(tmPaid)} / ${formatVNDShort(tmTotal)} (${(tmTotal > 0 ? (tmPaid / tmTotal * 100) : 0).toFixed(1)}%)</span>
                </div>
                <span class="chevron">${SVG_ICONS.chevron}</span>
            </div>
            <div id="tm-list" class="installment-list expanded">
                ${tm.map(p => renderPaymentItem(p)).join('')}
                <div class="add-installment-btn" onclick="showAddInstallment('TM', ${tm.length})">
                    <span>＋ Thêm đợt ${tm.length + 1}</span>
                </div>
            </div>
        </div>
    `;
}

function renderPaymentItem(p) {
    const isPaid = p.status === 'paid';
    const isFirst = !isPaid && p.status === 'pending';
    let statusClass = 'status-pending';
    let statusText = 'Chưa TT';
    if (isPaid) {
        statusClass = 'status-paid';
        statusText = 'Đã TT';
    }

    return `
        <div class="payment-item ${statusClass}" onclick="showPaymentModal('${p.id}')">
            <div class="payment-left">
                <div class="payment-num">Đợt ${p.installment}</div>
                <div class="payment-desc">${p.description}</div>
                ${isPaid && p.paidDate ? `<div class="payment-date">${formatDate(p.paidDate)} - ${p.paymentMethod || ''}</div>` : ''}
                ${p.notes ? `<div class="payment-notes">${p.notes}</div>` : ''}
            </div>
            <div class="payment-right">
                <div class="payment-amount ${isPaid ? 'paid' : ''}">${formatVND(p.amount)}</div>
                ${isPaid && p.paidAmount !== p.amount ? `<div class="payment-actual">TT: ${formatVND(p.paidAmount)}</div>` : ''}
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
        </div>
    `;
}

function toggleContract(id) {
    const el = document.getElementById(id);
    el.classList.toggle('expanded');
}

async function showPaymentModal(paymentId) {
    const payment = await DB.get(DB.STORES.payments, paymentId);
    if (!payment) return;

    const modal = document.getElementById('modal-payment');
    const isPaid = payment.status === 'paid';

    modal.querySelector('.modal-content').innerHTML = `
        <div class="modal-header">
            <h3>${payment.contractType} - Đợt ${payment.installment}</h3>
            <button class="modal-close" onclick="closeAllModals()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="detail-row">
                <span class="detail-label">Hạng mục</span>
                <span class="detail-value">${payment.description}</span>
            </div>
            <div class="form-group">
                <label>Số tiền HĐ</label>
                <input type="text" id="pay-contract-amount" value="${formatInputVND(String(payment.amount))}"
                    inputmode="numeric" onfocus="this.select()"
                    oninput="this.value = formatInputVND(this.value)">
            </div>

            <div class="form-group">
                <label>Trạng thái</label>
                <select id="pay-status">
                    <option value="pending" ${!isPaid ? 'selected' : ''}>Chưa thanh toán</option>
                    <option value="paid" ${isPaid ? 'selected' : ''}>Đã thanh toán</option>
                </select>
            </div>
            <div id="paid-fields" class="${isPaid ? '' : 'hidden'}">
                <div class="form-group">
                    <label>Số tiền thực TT</label>
                    <input type="text" id="pay-amount" value="${formatInputVND(String(isPaid ? payment.paidAmount : payment.amount))}"
                        inputmode="numeric" onfocus="this.select()"
                        oninput="this.value = formatInputVND(this.value)">
                </div>
                <div class="form-group">
                    <label>Ngày thanh toán</label>
                    <input type="date" id="pay-date" value="${formatDateInput(payment.paidDate)}">
                </div>
                <div class="form-group">
                    <label>Phương thức</label>
                    <select id="pay-method">
                        <option value="CK" ${payment.paymentMethod === 'CK' ? 'selected' : ''}>Chuyển khoản (CK)</option>
                        <option value="TM" ${payment.paymentMethod === 'TM' ? 'selected' : ''}>Tiền mặt (TM)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Ghi chú</label>
                    <textarea id="pay-notes" rows="2" placeholder="Ghi chú thêm...">${payment.notes || ''}</textarea>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            ${isPaid ? `<button class="btn btn-danger" onclick="undoPayment('${payment.id}')">Hủy thanh toán</button>` : ''}
            <button class="btn btn-primary" onclick="savePayment('${payment.id}')">Lưu</button>
        </div>
    `;

    // Toggle paid fields on status change
    const statusSel = document.getElementById('pay-status');
    statusSel.addEventListener('change', () => {
        const show = statusSel.value === 'paid';
        document.getElementById('paid-fields').classList.toggle('hidden', !show);
        if (show && !document.getElementById('pay-amount').value) {
            document.getElementById('pay-amount').value = formatInputVND(String(payment.amount));
        }
    });

    showModal('modal-payment');
}

async function savePayment(paymentId) {
    const status = document.getElementById('pay-status').value;
    const newAmount = parseVNDInput(document.getElementById('pay-contract-amount').value);
    const updates = { status, amount: newAmount };

    if (status === 'paid') {
        updates.paidAmount = parseVNDInput(document.getElementById('pay-amount').value);
        updates.paidDate = document.getElementById('pay-date').value;
        updates.paymentMethod = document.getElementById('pay-method').value;
        updates.notes = document.getElementById('pay-notes').value.trim();
    } else {
        updates.paidAmount = 0;
        updates.paidDate = null;
        updates.paymentMethod = null;
        updates.notes = '';
    }

    await DB.updatePayment(paymentId, updates);
    closeAllModals();
    await loadPayments();
    showToast('Đã cập nhật thanh toán');
}

async function undoPayment(paymentId) {
    if (!confirm('Bạn chắc muốn hủy thanh toán đợt này?')) return;
    await DB.updatePayment(paymentId, {
        status: 'pending',
        paidAmount: 0,
        paidDate: null,
        paymentMethod: null,
        notes: ''
    });
    closeAllModals();
    await loadPayments();
    showToast('Đã hủy thanh toán');
}

function showAddInstallment(contractType, currentCount) {
    const nextNum = currentCount + 1;
    const label = contractType === 'ABK' ? 'ABK - Xây dựng' : 'TM - Thang máy';
    const modal = document.getElementById('modal-payment');

    modal.querySelector('.modal-content').innerHTML = `
        <div class="modal-header">
            <h3>${label} - Thêm đợt ${nextNum}</h3>
            <button class="modal-close" onclick="closeAllModals()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Số tiền</label>
                <input type="text" id="new-inst-amount" placeholder="VD: 50,000,000"
                    inputmode="numeric" onfocus="this.select()"
                    oninput="this.value = formatInputVND(this.value)">
            </div>
            <div class="form-group">
                <label>Mô tả</label>
                <input type="text" id="new-inst-desc" placeholder="VD: Bổ sung do điều chỉnh HĐ">
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-primary" onclick="saveNewInstallment('${contractType}', ${nextNum})">Thêm đợt</button>
        </div>
    `;

    showModal('modal-payment');
}

async function saveNewInstallment(contractType, installmentNum) {
    const amountStr = document.getElementById('new-inst-amount').value;
    const desc = document.getElementById('new-inst-desc').value.trim();
    const amount = parseVNDInput(amountStr);

    if (!amount || amount <= 0) {
        showToast('Vui lòng nhập số tiền');
        return;
    }
    if (!desc) {
        showToast('Vui lòng nhập mô tả');
        return;
    }

    const prefix = contractType.toLowerCase();
    await DB.put(DB.STORES.payments, {
        id: `${prefix}_${installmentNum}`,
        contractType,
        installment: installmentNum,
        amount,
        description: desc,
        status: 'pending',
        paidAmount: 0,
        paidDate: null,
        paymentMethod: null,
        notes: ''
    });

    closeAllModals();
    await loadPayments();
    showToast(`Đã thêm đợt ${installmentNum} cho ${contractType}`);
}

// ======================== EXPENSES ========================

async function loadExpenses() {
    const expenses = await DB.getExpenses();
    const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);

    const container = document.getElementById('page-expenses');
    container.innerHTML = `
        <div class="page-header">
            <h2>Chi phí phát sinh</h2>
            <div class="total-badge">Tổng: ${formatVND(total)}</div>
        </div>
        ${expenses.length === 0 ? `
            <div class="empty-state">
                <div class="empty-icon">${SVG_ICONS.plus}</div>
                <p>Chưa có chi phí phát sinh</p>
                <p class="empty-sub">Nhấn nút + để thêm</p>
            </div>
        ` : `
            <div class="expense-list">
                ${expenses.map(e => `
                    <div class="expense-item" onclick="showEditExpenseModal('${e.id}')">
                        <div class="expense-left">
                            <div class="expense-cat">${e.category || 'Khác'}</div>
                            <div class="expense-name">${e.name}</div>
                            ${e.date ? `<div class="expense-date">${formatDate(e.date)}</div>` : ''}
                            ${e.notes ? `<div class="expense-notes">${e.notes}</div>` : ''}
                        </div>
                        <div class="expense-amount">${formatVND(e.amount)}</div>
                    </div>
                `).join('')}
            </div>

            <div class="expense-summary section-card">
                <h3>Theo danh mục</h3>
                ${renderExpenseSummary(expenses)}
            </div>
        `}
    `;
}

function renderExpenseSummary(expenses) {
    const byCategory = {};
    expenses.forEach(e => {
        const cat = e.category || 'Khác';
        byCategory[cat] = (byCategory[cat] || 0) + (e.amount || 0);
    });
    return Object.entries(byCategory)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, amt]) => `
            <div class="summary-row">
                <span>${cat}</span>
                <span>${formatVND(amt)}</span>
            </div>
        `).join('');
}

function showAddExpenseModal() {
    const modal = document.getElementById('modal-expense');
    modal.querySelector('.modal-content').innerHTML = `
        <div class="modal-header">
            <h3>Thêm chi phí phát sinh</h3>
            <button class="modal-close" onclick="closeAllModals()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Tên chi phí *</label>
                <input type="text" id="exp-name" placeholder="VD: Cửa cuốn garage">
            </div>
            <div class="form-group">
                <label>Số tiền *</label>
                <input type="text" id="exp-amount" placeholder="0" inputmode="numeric"
                    oninput="this.value = formatInputVND(this.value)">
            </div>
            <div class="form-group">
                <label>Danh mục</label>
                <select id="exp-category">
                    ${EXPENSE_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Ngày</label>
                <input type="date" id="exp-date" value="${formatDateInput()}">
            </div>
            <div class="form-group">
                <label>Ghi chú</label>
                <textarea id="exp-notes" rows="2" placeholder="Ghi chú thêm..."></textarea>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeAllModals()">Hủy</button>
            <button class="btn btn-primary" onclick="saveExpense()">Lưu</button>
        </div>
    `;
    showModal('modal-expense');
    document.getElementById('exp-name').focus();
}

async function saveExpense(existingId) {
    const name = document.getElementById('exp-name').value.trim();
    const amount = parseVNDInput(document.getElementById('exp-amount').value);
    const category = document.getElementById('exp-category').value;
    const date = document.getElementById('exp-date').value;
    const notes = document.getElementById('exp-notes').value.trim();

    if (!name) { showToast('Vui lòng nhập tên chi phí', 'error'); return; }
    if (!amount) { showToast('Vui lòng nhập số tiền', 'error'); return; }

    const expense = { name, amount, category, date, notes };
    if (existingId) {
        expense.id = existingId;
        const existing = await DB.get(DB.STORES.expenses, existingId);
        expense.createdAt = existing.createdAt;
    }
    await DB.addExpense(expense);
    closeAllModals();
    await loadExpenses();
    showToast(existingId ? 'Đã cập nhật' : 'Đã thêm chi phí');
}

async function showEditExpenseModal(id) {
    const exp = await DB.get(DB.STORES.expenses, id);
    if (!exp) return;

    const modal = document.getElementById('modal-expense');
    modal.querySelector('.modal-content').innerHTML = `
        <div class="modal-header">
            <h3>Sửa chi phí</h3>
            <button class="modal-close" onclick="closeAllModals()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Tên chi phí *</label>
                <input type="text" id="exp-name" value="${exp.name}">
            </div>
            <div class="form-group">
                <label>Số tiền *</label>
                <input type="text" id="exp-amount" value="${formatInputVND(String(exp.amount))}" inputmode="numeric"
                    oninput="this.value = formatInputVND(this.value)">
            </div>
            <div class="form-group">
                <label>Danh mục</label>
                <select id="exp-category">
                    ${EXPENSE_CATEGORIES.map(c => `<option value="${c}" ${c === exp.category ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Ngày</label>
                <input type="date" id="exp-date" value="${formatDateInput(exp.date)}">
            </div>
            <div class="form-group">
                <label>Ghi chú</label>
                <textarea id="exp-notes" rows="2">${exp.notes || ''}</textarea>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-danger" onclick="deleteExpense('${id}')">Xóa</button>
            <button class="btn btn-primary" onclick="saveExpense('${id}')">Lưu</button>
        </div>
    `;
    showModal('modal-expense');
}

async function deleteExpense(id) {
    if (!confirm('Xóa chi phí này?')) return;
    await DB.delete(DB.STORES.expenses, id);
    closeAllModals();
    await loadExpenses();
    showToast('Đã xóa');
}

// ======================== PROGRESS ========================

async function loadProgress() {
    const entries = await DB.getProgress();

    const container = document.getElementById('page-progress');
    container.innerHTML = `
        <div class="page-header">
            <h2>Tiến độ thi công</h2>
        </div>
        ${entries.length === 0 ? `
            <div class="empty-state">
                <div class="empty-icon">${SVG_ICONS.camera}</div>
                <p>Chưa có ghi nhận tiến độ</p>
                <p class="empty-sub">Nhấn nút + để thêm</p>
            </div>
        ` : `
            <div class="timeline">
                ${entries.map(e => `
                    <div class="timeline-item" onclick="showEditProgressModal('${e.id}')">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <div class="timeline-date">${formatDate(e.date)}</div>
                            <div class="timeline-title">${e.title}</div>
                            ${e.description ? `<div class="timeline-desc">${e.description}</div>` : ''}
                            ${e.phase ? `<span class="phase-badge">${e.phase}</span>` : ''}
                            ${e.photos && e.photos.length > 0 ? `
                                <div class="photo-grid">
                                    ${e.photos.map((ph, i) => `
                                        <img src="${ph}" class="photo-thumb" onclick="event.stopPropagation(); showPhoto('${e.id}', ${i})" loading="lazy">
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `}
    `;
}

function showAddProgressModal() {
    const modal = document.getElementById('modal-progress');
    modal.querySelector('.modal-content').innerHTML = `
        <div class="modal-header">
            <h3>Ghi nhận tiến độ</h3>
            <button class="modal-close" onclick="closeAllModals()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Tiêu đề *</label>
                <input type="text" id="prog-title" placeholder="VD: Đổ bê tông móng">
            </div>
            <div class="form-group">
                <label>Ngày</label>
                <input type="date" id="prog-date" value="${formatDateInput()}">
            </div>
            <div class="form-group">
                <label>Giai đoạn</label>
                <select id="prog-phase">
                    <option value="">-- Chọn --</option>
                    ${ABK_CONTRACT.installments.map(i => `<option value="Đợt ${i.num}: ${i.desc}">Đợt ${i.num}: ${i.desc}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Mô tả</label>
                <textarea id="prog-desc" rows="3" placeholder="Mô tả chi tiết..."></textarea>
            </div>
            <div class="form-group">
                <label>Hình ảnh</label>
                <div class="photo-upload-area">
                    <div id="photo-preview" class="photo-preview-grid"></div>
                    <div class="photo-buttons">
                        <button class="btn btn-outline btn-sm" onclick="capturePhoto()">
                            ${SVG_ICONS.camera} Chụp ảnh
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="pickPhoto()">
                            ${SVG_ICONS.image} Chọn ảnh
                        </button>
                    </div>
                    <input type="file" id="photo-input" accept="image/*" multiple style="display:none" onchange="handlePhotos(event)">
                    <input type="file" id="camera-input" accept="image/*" capture="environment" style="display:none" onchange="handlePhotos(event)">
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeAllModals()">Hủy</button>
            <button class="btn btn-primary" onclick="saveProgress()">Lưu</button>
        </div>
    `;
    window._pendingPhotos = [];
    showModal('modal-progress');
    document.getElementById('prog-title').focus();
}

async function showEditProgressModal(id) {
    const entry = await DB.get(DB.STORES.progress, id);
    if (!entry) return;

    const modal = document.getElementById('modal-progress');
    modal.querySelector('.modal-content').innerHTML = `
        <div class="modal-header">
            <h3>Sửa tiến độ</h3>
            <button class="modal-close" onclick="closeAllModals()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Tiêu đề *</label>
                <input type="text" id="prog-title" value="${entry.title}">
            </div>
            <div class="form-group">
                <label>Ngày</label>
                <input type="date" id="prog-date" value="${formatDateInput(entry.date)}">
            </div>
            <div class="form-group">
                <label>Giai đoạn</label>
                <select id="prog-phase">
                    <option value="">-- Chọn --</option>
                    ${ABK_CONTRACT.installments.map(i => {
                        const val = `Đợt ${i.num}: ${i.desc}`;
                        return `<option value="${val}" ${entry.phase === val ? 'selected' : ''}>${val}</option>`;
                    }).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Mô tả</label>
                <textarea id="prog-desc" rows="3">${entry.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Hình ảnh</label>
                <div class="photo-upload-area">
                    <div id="photo-preview" class="photo-preview-grid">
                        ${(entry.photos || []).map((ph, i) => `
                            <div class="photo-preview-item">
                                <img src="${ph}" class="photo-thumb-preview">
                                <button class="photo-remove" onclick="removeExistingPhoto(${i})">&times;</button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="photo-buttons">
                        <button class="btn btn-outline btn-sm" onclick="capturePhoto()">
                            ${SVG_ICONS.camera} Chụp ảnh
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="pickPhoto()">
                            ${SVG_ICONS.image} Chọn ảnh
                        </button>
                    </div>
                    <input type="file" id="photo-input" accept="image/*" multiple style="display:none" onchange="handlePhotos(event)">
                    <input type="file" id="camera-input" accept="image/*" capture="environment" style="display:none" onchange="handlePhotos(event)">
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-danger" onclick="deleteProgress('${id}')">Xóa</button>
            <button class="btn btn-primary" onclick="saveProgress('${id}')">Lưu</button>
        </div>
    `;
    window._pendingPhotos = [];
    window._existingPhotos = [...(entry.photos || [])];
    showModal('modal-progress');
}

function capturePhoto() {
    document.getElementById('camera-input').click();
}

function pickPhoto() {
    document.getElementById('photo-input').click();
}

function handlePhotos(event) {
    const files = event.target.files;
    if (!files.length) return;

    Array.from(files).forEach(file => {
        compressImage(file, 800, 0.7).then(dataUrl => {
            window._pendingPhotos.push(dataUrl);
            updatePhotoPreview();
        });
    });
    event.target.value = '';
}

function compressImage(file, maxDim, quality) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                if (w > maxDim || h > maxDim) {
                    if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
                    else { w = Math.round(w * maxDim / h); h = maxDim; }
                }
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function updatePhotoPreview() {
    const preview = document.getElementById('photo-preview');
    const existing = (window._existingPhotos || []).map((ph, i) => `
        <div class="photo-preview-item">
            <img src="${ph}" class="photo-thumb-preview">
            <button class="photo-remove" onclick="removeExistingPhoto(${i})">&times;</button>
        </div>
    `).join('');
    const pending = window._pendingPhotos.map((ph, i) => `
        <div class="photo-preview-item">
            <img src="${ph}" class="photo-thumb-preview">
            <button class="photo-remove" onclick="removePendingPhoto(${i})">&times;</button>
        </div>
    `).join('');
    preview.innerHTML = existing + pending;
}

function removeExistingPhoto(index) {
    window._existingPhotos.splice(index, 1);
    updatePhotoPreview();
}

function removePendingPhoto(index) {
    window._pendingPhotos.splice(index, 1);
    updatePhotoPreview();
}

async function saveProgress(existingId) {
    const title = document.getElementById('prog-title').value.trim();
    const date = document.getElementById('prog-date').value;
    const phase = document.getElementById('prog-phase').value;
    const description = document.getElementById('prog-desc').value.trim();

    if (!title) { showToast('Vui lòng nhập tiêu đề', 'error'); return; }

    const photos = [...(window._existingPhotos || []), ...window._pendingPhotos];
    const entry = { title, date, phase, description, photos };

    if (existingId) {
        entry.id = existingId;
        const existing = await DB.get(DB.STORES.progress, existingId);
        entry.createdAt = existing.createdAt;
    }
    await DB.addProgress(entry);
    closeAllModals();
    await loadProgress();
    showToast(existingId ? 'Đã cập nhật' : 'Đã ghi nhận tiến độ');
}

async function deleteProgress(id) {
    if (!confirm('Xóa ghi nhận này?')) return;
    await DB.delete(DB.STORES.progress, id);
    closeAllModals();
    await loadProgress();
    showToast('Đã xóa');
}

function showPhoto(entryId, photoIndex) {
    // Simple fullscreen photo viewer
    DB.get(DB.STORES.progress, entryId).then(entry => {
        if (!entry || !entry.photos[photoIndex]) return;
        const viewer = document.createElement('div');
        viewer.className = 'photo-viewer';
        viewer.innerHTML = `
            <img src="${entry.photos[photoIndex]}">
            <button class="photo-viewer-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        viewer.addEventListener('click', (e) => { if (e.target === viewer) viewer.remove(); });
        document.body.appendChild(viewer);
    });
}

// ======================== FINANCE ========================

async function loadFinance() {
    const financeEntries = await DB.getFinance();
    const payments = await DB.getPayments();
    const expenses = await DB.getExpenses();

    const disbursements = financeEntries.filter(f => f.type === 'loan_disbursement').sort((a, b) => new Date(a.date) - new Date(b.date));
    const goldSales = financeEntries.filter(f => f.type === 'gold_sale').sort((a, b) => new Date(a.date) - new Date(b.date));
    const loanPayments = financeEntries.filter(f => f.type === 'loan_payment').sort((a, b) => new Date(a.date) - new Date(b.date));
    const interestPayments = financeEntries.filter(f => f.type === 'loan_interest').sort((a, b) => new Date(a.date) - new Date(b.date));

    const totalDisbursed = disbursements.reduce((s, f) => s + (f.amount || 0), 0);
    const totalGoldReceived = goldSales.reduce((s, f) => s + (f.amount || 0), 0);
    const totalPrincipalPaid = loanPayments.reduce((s, f) => s + (f.amount || 0), 0);
    const totalInterestPaid = interestPayments.reduce((s, f) => s + (f.amount || 0), 0);
    const totalLoanPaid = totalPrincipalPaid + totalInterestPaid;
    const totalPaidContract = payments.reduce((s, p) => s + (p.paidAmount || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const totalSpent = totalPaidContract + totalExpenses;
    const totalFunded = totalDisbursed + totalGoldReceived;
    const balance = totalFunded - totalSpent;

    // Tính dư nợ + lãi lũy kế từng đợt giải ngân
    const now = new Date();
    const disbDetail = disbursements.map((d, i) => {
        const paymentsForThis = loanPayments.filter(p => p.disbursementId === d.id).sort((a, b) => new Date(a.date) - new Date(b.date));
        const principalPaidForThis = paymentsForThis.reduce((s, p) => s + (p.amount || 0), 0);
        const remaining = d.amount - principalPaidForThis;
        const rate = d.interestRate || 0;
        const monthlyInterest = remaining * rate / 100 / 12;

        // Tính lãi lũy kế: từ ngày giải ngân → hôm nay, trừ gốc đã trả theo thời điểm
        let accruedInterest = 0;
        const disbDate = new Date(d.date);
        const events = [{ date: disbDate, balance: d.amount }];
        let bal = d.amount;
        for (const p of paymentsForThis) {
            bal -= (p.amount || 0);
            events.push({ date: new Date(p.date), balance: bal });
        }
        for (let e = 0; e < events.length; e++) {
            const from = events[e].date;
            const to = e + 1 < events.length ? events[e + 1].date : now;
            const months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()) + (to.getDate() - from.getDate()) / 30;
            if (months > 0) {
                accruedInterest += events[e].balance * rate / 100 / 12 * months;
            }
        }
        const totalMonths = (now.getFullYear() - disbDate.getFullYear()) * 12 + (now.getMonth() - disbDate.getMonth());

        return { ...d, idx: i + 1, principalPaid: principalPaidForThis, remaining, rate, monthlyInterest, accruedInterest: Math.round(accruedInterest), totalMonths };
    });
    const totalRemaining = disbDetail.reduce((s, d) => s + d.remaining, 0);
    const totalMonthlyInterest = disbDetail.reduce((s, d) => s + d.monthlyInterest, 0);
    const totalAccruedInterest = disbDetail.reduce((s, d) => s + d.accruedInterest, 0);
    const interestBalance = totalAccruedInterest - totalInterestPaid; // >0 = còn thiếu lãi

    // Bán vàng: tính tổng số cây
    const totalGoldSold = goldSales.reduce((s, g) => s + (g.goldBars || 1), 0);

    const container = document.getElementById('page-finance');
    container.innerHTML = `
        <div class="page-header">
            <h2>Quản lý tài chính</h2>
        </div>

        <div class="finance-cards">
            <div class="fin-card">
                <div class="fin-card-title">Tổng nguồn vốn</div>
                <div class="fin-card-value">${formatVNDShort(totalFunded)}</div>
                <div class="fin-card-sub">Vay: ${formatVNDShort(totalDisbursed)} + Vàng: ${formatVNDShort(totalGoldReceived)}</div>
            </div>
            <div class="fin-card">
                <div class="fin-card-title">Tổng đã chi</div>
                <div class="fin-card-value">${formatVNDShort(totalSpent)}</div>
                <div class="fin-card-sub">HĐ: ${formatVNDShort(totalPaidContract)} + PS: ${formatVNDShort(totalExpenses)}</div>
            </div>
            <div class="fin-card ${balance >= 0 ? 'fin-positive' : 'fin-negative'}">
                <div class="fin-card-title">${balance >= 0 ? 'Còn dư' : 'Thiếu'}</div>
                <div class="fin-card-value">${formatVNDShort(Math.abs(balance))}</div>
            </div>
            <div class="fin-card">
                <div class="fin-card-title">Dư nợ gốc</div>
                <div class="fin-card-value">${formatVNDShort(totalRemaining)}</div>
                <div class="fin-card-sub">Gốc đã trả: ${formatVNDShort(totalPrincipalPaid)}</div>
            </div>
            <div class="fin-card">
                <div class="fin-card-title">Lãi / tháng</div>
                <div class="fin-card-value">${formatVNDShort(Math.round(totalMonthlyInterest))}</div>
                <div class="fin-card-sub">Lãi đã trả: ${formatVNDShort(totalInterestPaid)}</div>
            </div>
            <div class="fin-card ${interestBalance > 0 ? 'fin-negative' : 'fin-positive'}">
                <div class="fin-card-title">Lãi lũy kế → nay</div>
                <div class="fin-card-value">${formatVNDShort(totalAccruedInterest)}</div>
                <div class="fin-card-sub">${interestBalance > 0 ? 'Còn thiếu: ' + formatVNDShort(interestBalance) : interestBalance < 0 ? 'Trả dư: ' + formatVNDShort(Math.abs(interestBalance)) : 'Đã trả đủ'}</div>
            </div>
        </div>

        <div class="section-card">
            <div class="section-header">
                <h3>Giải ngân ngân hàng</h3>
                <span class="section-total">${formatVNDShort(totalDisbursed)} / ${formatVNDShort(LOAN_AMOUNT)}</span>
            </div>
            <div class="mini-progress">
                <div class="progress-bar-track">
                    <div class="progress-bar-fill bg-blue" style="width:${Math.min(totalDisbursed / LOAN_AMOUNT * 100, 100)}%"></div>
                </div>
            </div>
            ${disbursements.length === 0 ? '<p class="empty-text">Chưa có giải ngân</p>' : `
                <div class="fin-list">
                    ${disbDetail.map(d => `
                        <div class="fin-item disb-item" onclick="showEditFinanceModal('${d.id}')">
                            <div class="disb-header">
                                <span class="disb-label">Đợt ${d.idx} - ${formatDate(d.date)}</span>
                                <span class="fin-item-amount">${formatVND(d.amount)}</span>
                            </div>
                            <div class="disb-detail">
                                <span>Lãi ${d.rate}%/năm</span>
                                <span>Dư nợ: ${formatVNDShort(d.remaining)}</span>
                                <span>Lãi/tháng: ${formatVNDShort(Math.round(d.monthlyInterest))}</span>
                            </div>
                            <div class="disb-detail">
                                <span>${d.totalMonths} tháng</span>
                                <span>Lãi lũy kế: ${formatVNDShort(d.accruedInterest)}</span>
                            </div>
                            ${d.notes ? `<div class="disb-notes">${d.notes}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
                <div class="disb-total">
                    <span>Tổng lãi/tháng:</span>
                    <span class="text-red">${formatVND(Math.round(totalMonthlyInterest))}</span>
                </div>
                <div class="disb-total">
                    <span>Lãi lũy kế → nay:</span>
                    <span class="text-red">${formatVND(totalAccruedInterest)}</span>
                </div>
            `}
        </div>

        <div class="section-card">
            <div class="section-header">
                <h3>Bán vàng nhẫn 9999</h3>
                <span class="section-total">${totalGoldSold} / ${GOLD_BARS} cây</span>
            </div>
            <div class="gold-indicator">
                ${Array.from({length: GOLD_BARS}, (_, i) => `
                    <div class="gold-bar ${i < totalGoldSold ? 'sold' : ''}">
                        <span class="gold-icon">${SVG_ICONS.gold}</span>
                    </div>
                `).join('')}
            </div>
            ${goldSales.length > 0 ? `
                <div class="fin-list">
                    ${goldSales.map(g => `
                        <div class="fin-item" onclick="showEditFinanceModal('${g.id}')">
                            <div>${g.goldBars || 1} cây - ${formatDate(g.date)} ${g.notes ? '- ' + g.notes : ''}</div>
                            <div class="fin-item-amount">${formatVND(g.amount)}</div>
                        </div>
                    `).join('')}
                </div>
            ` : '<p class="empty-text">Chưa bán vàng</p>'}
        </div>

        <div class="section-card">
            <div class="section-header">
                <h3>Trả gốc ngân hàng</h3>
                <span class="section-total">Đã trả: ${formatVNDShort(totalPrincipalPaid)}</span>
            </div>
            ${loanPayments.length === 0 ? '<p class="empty-text">Chưa trả gốc</p>' : `
                <div class="fin-list">
                    ${loanPayments.map(l => {
                        const disb = disbDetail.find(d => d.id === l.disbursementId);
                        const disbLabel = disb ? `Đợt ${disb.idx}` : '';
                        return `
                        <div class="fin-item" onclick="showEditFinanceModal('${l.id}')">
                            <div>${formatDate(l.date)} ${disbLabel ? '→ ' + disbLabel : ''} ${l.notes ? '- ' + l.notes : ''}</div>
                            <div class="fin-item-amount text-red">-${formatVND(l.amount)}</div>
                        </div>`;
                    }).join('')}
                </div>
            `}
        </div>

        <div class="section-card">
            <div class="section-header">
                <h3>Trả lãi ngân hàng</h3>
                <span class="section-total">Đã trả: ${formatVNDShort(totalInterestPaid)}</span>
            </div>
            ${interestPayments.length === 0 ? '<p class="empty-text">Chưa trả lãi</p>' : `
                <div class="fin-list">
                    ${interestPayments.map(l => `
                        <div class="fin-item" onclick="showEditFinanceModal('${l.id}')">
                            <div>${formatDate(l.date)} ${l.notes ? '- ' + l.notes : ''}</div>
                            <div class="fin-item-amount text-red">-${formatVND(l.amount)}</div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

function showAddFinanceModal() {
    const modal = document.getElementById('modal-finance');
    modal.querySelector('.modal-content').innerHTML = `
        <div class="modal-header">
            <h3>Thêm giao dịch tài chính</h3>
            <button class="modal-close" onclick="closeAllModals()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Loại giao dịch *</label>
                <select id="fin-type" onchange="toggleFinanceFields()">
                    <option value="loan_disbursement">Giải ngân ngân hàng</option>
                    <option value="gold_sale">Bán vàng</option>
                    <option value="loan_payment">Trả gốc ngân hàng</option>
                    <option value="loan_interest">Trả lãi ngân hàng</option>
                </select>
            </div>
            <div class="form-group">
                <label>Số tiền *</label>
                <input type="text" id="fin-amount" placeholder="0" inputmode="numeric"
                    oninput="this.value = formatInputVND(this.value)">
            </div>
            <div id="fin-rate-group" class="form-group">
                <label>Lãi suất (%/năm) *</label>
                <input type="number" id="fin-rate" step="0.01" placeholder="VD: 6.5" inputmode="decimal">
            </div>
            <div id="fin-disb-group" class="form-group hidden">
                <label>Trừ vào đợt giải ngân *</label>
                <select id="fin-disb-target"></select>
            </div>
            <div id="fin-gold-group" class="form-group hidden">
                <label>Số cây *</label>
                <input type="number" id="fin-gold-bars" min="1" max="20" value="1" inputmode="numeric">
            </div>
            <div class="form-group">
                <label>Ngày</label>
                <input type="date" id="fin-date" value="${formatDateInput()}">
            </div>
            <div class="form-group">
                <label>Ghi chú</label>
                <textarea id="fin-notes" rows="2" placeholder="VD: Đợt giải ngân 1..."></textarea>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeAllModals()">Hủy</button>
            <button class="btn btn-primary" onclick="saveFinance()">Lưu</button>
        </div>
    `;
    toggleFinanceFields();
    showModal('modal-finance');
}

async function toggleFinanceFields() {
    const type = document.getElementById('fin-type').value;
    const rateGroup = document.getElementById('fin-rate-group');
    const disbGroup = document.getElementById('fin-disb-group');
    const goldGroup = document.getElementById('fin-gold-group');

    rateGroup.classList.toggle('hidden', type !== 'loan_disbursement');
    disbGroup.classList.toggle('hidden', type !== 'loan_payment');
    goldGroup.classList.toggle('hidden', type !== 'gold_sale');

    if (type === 'loan_payment') {
        await populateDisbursementSelect('fin-disb-target');
    }
}

async function populateDisbursementSelect(selectId, selectedDisbId) {
    const financeEntries = await DB.getFinance();
    const disbursements = financeEntries.filter(f => f.type === 'loan_disbursement').sort((a, b) => new Date(a.date) - new Date(b.date));
    const allPayments = financeEntries.filter(f => f.type === 'loan_payment');

    const sel = document.getElementById(selectId);
    sel.innerHTML = '<option value="">-- Chọn đợt --</option>';
    disbursements.forEach((d, i) => {
        const paidForThis = allPayments.filter(p => p.disbursementId === d.id).reduce((s, p) => s + (p.amount || 0), 0);
        const remaining = d.amount - paidForThis;
        if (remaining > 0 || d.id === selectedDisbId) {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = `Đợt ${i + 1} - ${formatVNDShort(d.amount)} (${d.interestRate || 0}%/năm) — Dư nợ: ${formatVNDShort(remaining)}`;
            if (d.id === selectedDisbId) opt.selected = true;
            sel.appendChild(opt);
        }
    });
}

async function showEditFinanceModal(id) {
    const entry = await DB.get(DB.STORES.finance, id);
    if (!entry) return;

    const modal = document.getElementById('modal-finance');
    modal.querySelector('.modal-content').innerHTML = `
        <div class="modal-header">
            <h3>Sửa giao dịch</h3>
            <button class="modal-close" onclick="closeAllModals()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Loại giao dịch</label>
                <select id="fin-type" onchange="toggleFinanceFields()">
                    <option value="loan_disbursement" ${entry.type === 'loan_disbursement' ? 'selected' : ''}>Giải ngân ngân hàng</option>
                    <option value="gold_sale" ${entry.type === 'gold_sale' ? 'selected' : ''}>Bán vàng</option>
                    <option value="loan_payment" ${entry.type === 'loan_payment' ? 'selected' : ''}>Trả gốc ngân hàng</option>
                    <option value="loan_interest" ${entry.type === 'loan_interest' ? 'selected' : ''}>Trả lãi ngân hàng</option>
                </select>
            </div>
            <div class="form-group">
                <label>Số tiền</label>
                <input type="text" id="fin-amount" value="${formatInputVND(String(entry.amount))}" inputmode="numeric"
                    oninput="this.value = formatInputVND(this.value)">
            </div>
            <div id="fin-rate-group" class="form-group ${entry.type === 'loan_disbursement' ? '' : 'hidden'}">
                <label>Lãi suất (%/năm)</label>
                <input type="number" id="fin-rate" step="0.01" value="${entry.interestRate || ''}" inputmode="decimal">
            </div>
            <div id="fin-disb-group" class="form-group ${entry.type === 'loan_payment' ? '' : 'hidden'}">
                <label>Trừ vào đợt giải ngân</label>
                <select id="fin-disb-target"></select>
            </div>
            <div id="fin-gold-group" class="form-group ${entry.type === 'gold_sale' ? '' : 'hidden'}">
                <label>Số cây</label>
                <input type="number" id="fin-gold-bars" min="1" max="20" value="${entry.goldBars || 1}" inputmode="numeric">
            </div>
            <div class="form-group">
                <label>Ngày</label>
                <input type="date" id="fin-date" value="${formatDateInput(entry.date)}">
            </div>
            <div class="form-group">
                <label>Ghi chú</label>
                <textarea id="fin-notes" rows="2">${entry.notes || ''}</textarea>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-danger" onclick="deleteFinance('${id}')">Xóa</button>
            <button class="btn btn-primary" onclick="saveFinance('${id}')">Lưu</button>
        </div>
    `;
    if (entry.type === 'loan_payment') {
        await populateDisbursementSelect('fin-disb-target', entry.disbursementId);
    }
    showModal('modal-finance');
}

async function saveFinance(existingId) {
    const type = document.getElementById('fin-type').value;
    const amount = parseVNDInput(document.getElementById('fin-amount').value);
    const date = document.getElementById('fin-date').value;
    const notes = document.getElementById('fin-notes').value.trim();

    if (!amount) { showToast('Vui lòng nhập số tiền', 'error'); return; }

    const entry = { type, amount, date, notes };

    if (type === 'loan_disbursement') {
        const rate = parseFloat(document.getElementById('fin-rate').value);
        if (!rate || rate <= 0) { showToast('Vui lòng nhập lãi suất', 'error'); return; }
        entry.interestRate = rate;
    }

    if (type === 'loan_payment') {
        const disbId = document.getElementById('fin-disb-target').value;
        if (!disbId) { showToast('Vui lòng chọn đợt giải ngân', 'error'); return; }
        entry.disbursementId = disbId;
    }

    if (type === 'gold_sale') {
        const bars = parseInt(document.getElementById('fin-gold-bars').value) || 1;
        entry.goldBars = bars;
    }

    if (existingId) {
        entry.id = existingId;
        const existing = await DB.get(DB.STORES.finance, existingId);
        entry.createdAt = existing.createdAt;
    }
    await DB.addFinance(entry);
    closeAllModals();
    await loadFinance();
    showToast(existingId ? 'Đã cập nhật' : 'Đã thêm giao dịch');
}

async function deleteFinance(id) {
    if (!confirm('Xóa giao dịch này?')) return;
    await DB.delete(DB.STORES.finance, id);
    closeAllModals();
    await loadFinance();
    showToast('Đã xóa');
}

// ======================== BACKUP / RESTORE ========================

async function exportBackup() {
    try {
        const data = await DB.exportAll();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `xay-nha-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Đã sao lưu dữ liệu');
    } catch (e) {
        showToast('Lỗi sao lưu: ' + e.message, 'error');
    }
}

async function importBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!confirm('Dữ liệu hiện tại sẽ bị ghi đè. Tiếp tục?')) {
        event.target.value = '';
        return;
    }

    try {
        const text = await file.text();
        const data = JSON.parse(text);
        await DB.importAll(data);
        event.target.value = '';
        await loadTab(currentTab);
        showToast('Đã khôi phục dữ liệu');
    } catch (e) {
        showToast('Lỗi: File không hợp lệ', 'error');
        event.target.value = '';
    }
}

// ======================== GOOGLE SHEETS SYNC ========================

async function updateSyncStatus() {
    const el = document.getElementById('sync-status');
    if (!el) return;
    const lastSync = await Sync.getLastSync();
    if (lastSync) {
        const d = new Date(lastSync);
        el.innerHTML = `<span class="sync-time">Sync gần nhất: ${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</span>`;
    } else {
        el.innerHTML = '<span class="sync-time">Chưa sync lần nào</span>';
    }
}

async function doSyncPush() {
    const btn = event.target.closest('button');
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = SVG_ICONS.sync + ' Đang đẩy...';

    try {
        const result = await Sync.push();
        showToast(`Đã đẩy ${result.recordCount} bản ghi lên Sheets`);
        await updateSyncStatus();
    } catch (err) {
        showToast('Lỗi sync: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = origText;
    }
}

async function doSyncPull() {
    const btn = event.target.closest('button');
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = SVG_ICONS.sync + ' Đang kéo...';

    try {
        const result = await Sync.pull();
        showToast(`Đã kéo ${result.importCount} bản ghi mới từ Sheets`);
        await updateSyncStatus();
        await loadTab(currentTab); // Refresh current view
    } catch (err) {
        showToast('Lỗi sync: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = origText;
    }
}

function showSyncSettingsModal() {
    const modal = document.getElementById('modal-sync');
    Sync.getGasUrl().then(currentUrl => {
        modal.querySelector('.modal-content').innerHTML = `
            <div class="modal-header">
                <h3>Cài đặt Google Sheets Sync</h3>
                <button class="modal-close" onclick="closeAllModals()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="sync-guide">
                    <p><strong>Hướng dẫn:</strong></p>
                    <ol>
                        <li>Tạo Google Sheet mới</li>
                        <li>Vào <strong>Extensions > Apps Script</strong></li>
                        <li>Paste code từ file <code>gas_sync.js</code></li>
                        <li>Thay <code>SHEET_ID</code> bằng ID Sheet của bạn</li>
                        <li><strong>Deploy > New deployment > Web app</strong></li>
                        <li>Execute as: <strong>Me</strong></li>
                        <li>Who has access: <strong>Anyone</strong></li>
                        <li>Copy URL và dán vào ô bên dưới</li>
                    </ol>
                </div>
                <div class="form-group">
                    <label>Google Apps Script Web App URL</label>
                    <input type="url" id="sync-url" value="${currentUrl || ''}"
                        placeholder="https://script.google.com/macros/s/AKf.../exec">
                </div>
                <div class="form-group">
                    <label>Trạng thái</label>
                    <div id="sync-test-result" class="sync-test-result">
                        ${currentUrl ? '✅ Đã cài đặt URL' : '⚠️ Chưa cài đặt'}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="testSyncConnection()">Test kết nối</button>
                <button class="btn btn-primary" onclick="saveSyncSettings()">Lưu</button>
            </div>
        `;
        showModal('modal-sync');
    });
}

async function saveSyncSettings() {
    const url = document.getElementById('sync-url').value.trim();
    if (url && !url.startsWith('https://script.google.com/')) {
        showToast('URL không hợp lệ. Phải bắt đầu bằng https://script.google.com/', 'error');
        return;
    }
    await Sync.setGasUrl(url);
    Sync._cachedUrl = url;
    closeAllModals();
    await loadTab('dashboard');
    showToast(url ? 'Đã lưu URL sync' : 'Đã xóa cài đặt sync');
}

async function testSyncConnection() {
    const url = document.getElementById('sync-url').value.trim();
    const resultEl = document.getElementById('sync-test-result');
    if (!url) {
        resultEl.innerHTML = '⚠️ Vui lòng nhập URL';
        return;
    }

    resultEl.innerHTML = '⏳ Đang test...';
    try {
        const response = await fetch(url, { method: 'GET', redirect: 'follow' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        if (data.success) {
            const counts = Object.values(data.data || {}).map(arr => (arr || []).length);
            const total = counts.reduce((a, b) => a + b, 0);
            resultEl.innerHTML = `✅ Kết nối thành công! Sheet có ${total} bản ghi.`;
        } else {
            resultEl.innerHTML = '❌ Lỗi: ' + (data.error || 'Unknown error');
        }
    } catch (err) {
        resultEl.innerHTML = '❌ Không kết nối được: ' + err.message;
    }
}

// ======================== HELPERS ========================

function formatInputVND(value) {
    const num = value.replace(/[^\d]/g, '');
    if (!num) return '';
    return parseInt(num, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function showToast(msg, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// ======================== SVG ICONS ========================

const SVG_ICONS = {
    dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    payment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
    expense: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    timeline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    finance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><circle cx="18" cy="14" r="1"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>',
    gold: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 20h14l3-8H2l3 8zM8 4h8l4 8H4l4-8z"/></svg>',
    sync: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
};

// ======================== PWA ========================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    });
}

// Install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

// ======================== START ========================

document.addEventListener('DOMContentLoaded', initApp);
