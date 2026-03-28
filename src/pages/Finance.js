// ═════════════════════════════════════════════════
// FINANCE PAGE - Muhasebe
// ═════════════════════════════════════════════════
import { getState, addTransaction, deleteTransaction } from '../store/store.js';
import { icon } from '../components/icons.js';
import { formatCurrency, formatDate, escHtml } from '../utils/helpers.js';
import { openModal, closeModal, showConfirm } from '../components/modal.js';

export function renderFinance(navigate) {
  const state = getState();
  const now = new Date();
  const stats = calcStats(state, 'month');

  const html = `
    <div class="fade-in">
      <div class="page-header">
        <div>
          <h2>Muhasebe</h2>
          <p>Gelir takibi</p>
        </div>
        <button class="btn btn-primary" id="btn-add-transaction">${icon('plus', 14)} Manuel İşlem</button>
      </div>

      <!-- Period Tabs -->
      <div class="tabs" style="margin-bottom:20px;" id="period-tabs">
        <button class="tab-btn active" data-period="day">Bugün</button>
        <button class="tab-btn" data-period="week">Bu Hafta</button>
        <button class="tab-btn" data-period="month">Bu Ay</button>
        <button class="tab-btn" data-period="all">Tümü</button>
      </div>

      <!-- Banner -->
      <div class="finance-banner" style="margin-bottom:24px;">
        <div>
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:4px;">Aylık Toplam Gelir</div>
          <div class="finance-amount" id="net-display">${formatCurrency(stats.income)}</div>
          <div style="display:flex;gap:16px;margin-top:12px;">
            <div>
              <div style="font-size:11px;color:var(--text-muted);">Tahsil Edilen</div>
              <div style="font-size:18px;font-weight:700;color:var(--success);" id="income-display">${formatCurrency(stats.confirmed)}</div>
            </div>
            <div>
              <div style="font-size:11px;color:var(--text-muted);">Bekleyen</div>
              <div style="font-size:18px;font-weight:700;color:var(--warning);" id="expense-display">${formatCurrency(stats.estimated)}</div>
            </div>
          </div>
        </div>
        <div id="finance-chart" style="flex:1;max-width:200px; display:flex; align-items:center; justify-content:center;">
          <div style="text-align:center;">
            ${icon('trendUp', 40)}
          </div>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-2" style="margin-bottom:24px;">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(99,202,183,0.15);">${icon('trendUp', 20)}</div>
          <div>
            <div class="kpi-value" style="color:var(--warning);" id="display-estimated">${formatCurrency(stats.estimated)}</div>
            <div class="kpi-label">Tahmini Kazanç (Bekleyen)</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(46,213,115,0.15);">${icon('checkCircle', 20)}</div>
          <div>
            <div class="kpi-value" style="color:var(--success);" id="display-confirmed">${formatCurrency(stats.confirmed)}</div>
            <div class="kpi-label">Kesinleşen Kazanç (Tahsil Edilen)</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card" style="margin-bottom:24px; padding:16px;">
        <div style="display:flex; gap:16px; align-items:flex-end; flex-wrap:wrap;">
          <div class="form-group" style="margin:0; flex:1; min-width:200px;">
            <label style="font-size:11px; margin-bottom:4px;">İsim ile Ara</label>
            <input type="text" id="filter-search" placeholder="Öğrenci veya grup ismi..." style="padding:8px;">
          </div>
          <div class="form-group" style="margin:0; width:150px;">
            <label style="font-size:11px; margin-bottom:4px;">Durum</label>
            <select id="filter-status" style="padding:8px;">
              <option value="all">Tümü</option>
              <option value="estimated">Bekleyen (Tahmini)</option>
              <option value="confirmed">Tahsil Edilen (Kesin)</option>
            </select>
          </div>
          <div class="form-group" style="margin:0; width:150px;">
            <label style="font-size:11px; margin-bottom:4px;">Ay</label>
            <input type="month" id="filter-month" value="${new Date().toISOString().slice(0, 7)}" style="padding:7px;">
          </div>
          <button class="btn btn-secondary" id="btn-clear-filters" style="height:38px;">Sıfırla</button>
        </div>
      </div>

      <!-- Transaction list -->
      <div class="card">
        <div class="section-title" style="margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
          <h3>İşlem Geçmişi</h3>
          <div style="font-size:12px; color:var(--text-muted);" id="table-stats-info"></div>
        </div>
        <div class="table-wrapper" id="transactions-table">
          ${renderTransactionTable(state.transactions)}
        </div>
      </div>
    </div>
  `;

  return { html, init: (el, nav) => initFinance(el, nav) };
}

function renderTransactionTable(transactions) {
  const sorted = [...transactions].filter(t => t.type === 'income').sort((a, b) => b.date.localeCompare(a.date));
  
  if (sorted.length === 0) {
    return '<div class="empty-state"><p>İşlem bulunamadı</p></div>';
  }
  return `
    <table>
      <thead>
        <tr>
          <th>Tarih</th>
          <th>Detay</th>
          <th>İsim</th>
          <th>Durum</th>
          <th style="text-align:right;">Tutar</th>
          <th style="text-align:right;">İşlem</th>
        </tr>
      </thead>
      <tbody>
        ${sorted.map(t => {
          const isPending = t.status === 'estimated';
          return `
            <tr>
              <td style="font-size:12px;color:var(--text-muted);">${formatDate(t.date)}</td>
              <td>
                <div style="font-weight:600; font-size:13px;">${escHtml(t.description)}</div>
                <div style="font-size:10px; color:var(--text-muted);">Gelir</div>
              </td>
              <td style="font-size:12px;">${escHtml(t.refName || '-')}</td>
              <td>
                <span class="badge ${isPending ? 'badge-warning' : 'badge-success'}">
                  ${isPending ? '⏳ Bekliyor' : '✓ Tahsil Edildi'}
                </span>
              </td>
              <td style="text-align:right;font-weight:700;color:var(--success);">
                ${formatCurrency(t.amount)}
              </td>
              <td style="text-align:right;">
                <div style="display:flex; gap:8px; justify-content:flex-end;">
                  ${isPending ? `
                    <button class="btn btn-success btn-sm" data-confirm-transaction="${t.id}" title="Tahsilatı Onayla">
                      ${icon('check', 12)} Tahsil Et
                    </button>
                  ` : ''}
                  <button class="btn btn-ghost btn-sm btn-icon" data-delete-transaction="${t.id}" style="color:var(--danger);" title="Sil">
                    ${icon('trash', 13)}
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function polarToCart(cx, cy, r, angle) {
  const rad = (angle - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function calcStats(state, period, filters = {}) {
  let txs = [...state.transactions];

  // Apply basic period filters
  const now = new Date();
  let from, to = now.toISOString().split('T')[0];
  if (period === 'day') { from = to; }
  else if (period === 'week') {
    const d = new Date(now); d.setDate(d.getDate() - d.getDay() + 1);
    from = d.toISOString().split('T')[0];
  }
  else if (period === 'month') {
    from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  }

  if (period !== 'all') {
    txs = txs.filter(t => t.date >= from && t.date <= to);
  }

  // Apply advanced filters
  if (filters.search) {
    const q = filters.search.toLowerCase();
    txs = txs.filter(t => 
      t.description.toLowerCase().includes(q) || 
      (t.refName && t.refName.toLowerCase().includes(q))
    );
  }
  if (filters.status && filters.status !== 'all') {
    txs = txs.filter(t => t.status === filters.status);
  }
  if (filters.month) {
    txs = txs.filter(t => t.date?.startsWith(filters.month));
  }

  const confirmed = txs.filter(t => t.type === 'income' && t.status === 'confirmed').reduce((s, t) => s + t.amount, 0);
  const estimated = txs.filter(t => t.type === 'income' && t.status === 'estimated').reduce((s, t) => s + t.amount, 0);
  
  return { confirmed, estimated, income: confirmed + estimated, filteredTxs: txs };
}

function calcPendingIncome(state) {
  // Sum fees of upcoming lessons this month
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return state.lessons
    .filter(l => l.date?.startsWith(monthStr) && l.status === 'upcoming')
    .reduce((s, l) => {
      const ref = l.type === 'student'
        ? state.students.find(st => st.id === l.refId)
        : state.groups.find(g => g.id === l.refId);
      return s + (l.fee || ref?.rate || 0);
    }, 0);
}

function initFinance(el, navigate) {
  let period = 'month';
  const filters = {
    search: '',
    status: 'all',
    month: new Date().toISOString().slice(0, 7)
  };

  const updateView = () => {
    const state = getState();
    const stats = calcStats(state, period, filters);
    
    el.querySelector('#display-estimated').textContent = formatCurrency(stats.estimated);
    el.querySelector('#display-confirmed').textContent = formatCurrency(stats.confirmed);
    el.querySelector('#income-display').textContent = formatCurrency(stats.confirmed);
    el.querySelector('#expense-display').textContent = formatCurrency(stats.estimated);
    el.querySelector('#net-display').textContent = formatCurrency(stats.income);
    
    el.querySelector('#transactions-table').innerHTML = renderTransactionTable(stats.filteredTxs);
    el.querySelector('#table-stats-info').textContent = `${stats.filteredTxs.length} işlem listelendi`;
    
    initTransactionButtons(el, navigate);
  };

  // Period Tabs
  el.querySelectorAll('[data-period]').forEach(btn => {
    btn.addEventListener('click', () => {
      period = btn.dataset.period;
      el.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateView();
    });
  });

  // Filter Event Listeners
  el.querySelector('#filter-search').addEventListener('input', (e) => {
    filters.search = e.target.value;
    updateView();
  });

  el.querySelector('#filter-status').addEventListener('change', (e) => {
    filters.status = e.target.value;
    updateView();
  });

  el.querySelector('#filter-month').addEventListener('change', (e) => {
    filters.month = e.target.value;
    updateView();
  });

  el.querySelector('#btn-clear-filters').addEventListener('click', () => {
    el.querySelector('#filter-search').value = '';
    el.querySelector('#filter-status').value = 'all';
    el.querySelector('#filter-month').value = '';
    filters.search = '';
    filters.status = 'all';
    filters.month = '';
    updateView();
  });

  el.querySelector('#btn-add-transaction')?.addEventListener('click', () => {
    openAddTransactionModal(navigate);
  });

  // Initial update
  updateView();
}

function initTransactionButtons(el, navigate) {
  // Confirm Transaction
  el.querySelectorAll('[data-confirm-transaction]').forEach(btn => {
    btn.addEventListener('click', () => {
      import('../store/store.js').then(m => {
        m.confirmTransaction(btn.dataset.confirmTransaction);
        navigate('finance');
      });
    });
  });

  // Delete Transaction
  el.querySelectorAll('[data-delete-transaction]').forEach(btn => {
    btn.addEventListener('click', () => {
      showConfirm({
        title: 'İşlemi Sil',
        message: 'Bu işlem kaydı silinecek.',
        confirmText: 'Sil',
        type: 'danger',
        onConfirm: () => { 
          import('../store/store.js').then(m => {
            m.deleteTransaction(btn.dataset.deleteTransaction); 
            navigate('finance'); 
          });
        },
      });
    });
  });
}

function openAddTransactionModal(navigate) {
  openModal({
    title: 'Manuel İşlem Ekle',
    body: `
      <div class="form-group" style="display:none;">
        <label>İşlem Türü</label>
        <select id="tx-type">
          <option value="income" selected>Gelir</option>
        </select>
      </div>
      <div class="form-group">
        <label>Tutar (₺)</label>
        <input type="number" id="tx-amount" placeholder="0.00" min="0">
      </div>
      <div class="form-group">
        <label>Açıklama</label>
        <input type="text" id="tx-desc" placeholder="Açıklama girin">
      </div>
      <div class="form-group">
        <label>Tarih</label>
        <input type="date" id="tx-date" value="${new Date().toISOString().split('T')[0]}">
      </div>
    `,
    footer: `
      <button class="btn btn-secondary" id="tx-cancel">İptal</button>
      <button class="btn btn-primary" id="tx-save">Kaydet</button>
    `,
  });

  document.getElementById('tx-cancel')?.addEventListener('click', closeModal);
  document.getElementById('tx-save')?.addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('tx-amount').value);
    const desc = document.getElementById('tx-desc').value.trim();
    if (!amount || !desc) { alert('Tutar ve açıklama zorunludur.'); return; }
    addTransaction({
      type: document.getElementById('tx-type').value,
      amount,
      description: desc,
      date: document.getElementById('tx-date').value,
    });
    closeModal();
    navigate('finance');
  });
}
