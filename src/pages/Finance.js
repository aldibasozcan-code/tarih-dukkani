// ═════════════════════════════════════════════════
// FINANCE PAGE - Muhasebe
// ═════════════════════════════════════════════════
import { getState, addTransaction, deleteTransaction, confirmTransaction } from '../store/store.js';
import { icon } from '../components/icons.js';
import { formatCurrency, formatDate, escHtml, todayStr, getLocalDateStr } from '../utils/helpers.js';
import { openModal, closeModal, showConfirm } from '../components/modal.js';

export function renderFinance(navigate) {
  const state = getState();
  const stats = calcStats(state, 'month');

  const html = `
    <div class="fade-in">
      <div class="page-header" style="background: linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(99,102,241,0.02) 100%); padding: 32px 24px; border-radius: 20px; margin-bottom: 32px; border: 1px solid rgba(16,185,129,0.15); box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
        <div>
          <h2 style="font-size: 32px; font-weight: 800; color: var(--brand-green); margin-bottom: 8px; display: flex; align-items: center; gap: 12px; letter-spacing: -0.5px;">
            ${icon('finance', 32)} Muhasebe
          </h2>
          <p style="color: var(--text-secondary); font-size: 16px; font-weight: 500;">Gelir/gider takibi ve öğrenci cari bakiye analizi</p>
        </div>
        <div style="display:flex;gap:10px; align-items: center;">
          <button class="btn btn-primary hover-lift" id="btn-add-transaction" style="box-shadow: 0 8px 20px rgba(16,185,129,0.3); padding: 10px 20px; font-weight: 700; font-size: 15px;">
            ${icon('plus', 16)} Manuel İşlem
          </button>
        </div>
      </div>

      <!-- Period Tabs -->
      <div class="tabs" style="margin-bottom:24px; padding: 4px; background: var(--bg-secondary); border-radius: var(--radius-md); display: inline-flex;" id="period-tabs">
        <button class="tab-btn" data-period="day" style="padding: 6px 16px; font-size: 13px; font-weight: 700; border-radius: 8px;">Bugün</button>
        <button class="tab-btn" data-period="week" style="padding: 6px 16px; font-size: 13px; font-weight: 700; border-radius: 8px;">Bu Hafta</button>
        <button class="tab-btn active" data-period="month" style="padding: 6px 16px; font-size: 13px; font-weight: 700; border-radius: 8px;">Bu Ay</button>
        <button class="tab-btn" data-period="all" style="padding: 6px 16px; font-size: 13px; font-weight: 700; border-radius: 8px;">Tümü</button>
      </div>

      <!-- Banner -->
      <div class="finance-banner" style="margin-bottom:24px; background: linear-gradient(135deg, var(--brand-green) 0%, #10b981 100%); border-radius: 20px; padding: 28px; color: white; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 25px rgba(16,185,129,0.2); position: relative; overflow: hidden;">
        <div style="z-index: 1;">
          <div style="font-size:14px; opacity: 0.9; margin-bottom:4px; font-weight: 600;">Net Dönem Kazancı</div>
          <div class="finance-amount" id="net-display" style="font-size: 36px; font-weight: 800; letter-spacing: -1px; margin-bottom: 12px;">${formatCurrency(stats.netProfit)}</div>
          <div style="display:flex; gap:24px; margin-top:16px;">
            <div>
              <div style="font-size:11px; opacity: 0.8; margin-bottom: 2px;">Tahsil Edilen (Kesin)</div>
              <div style="font-size:20px; font-weight:800; color: #ffffff;" id="income-display">${formatCurrency(stats.confirmedIncome)}</div>
            </div>
            <div>
              <div style="font-size:11px; opacity: 0.8; margin-bottom: 2px;">Bekleyen (Tahmini)</div>
              <div style="font-size:20px; font-weight:800; color: rgba(255,255,255,0.85);" id="expense-display">${formatCurrency(stats.estimatedIncome)}</div>
            </div>
          </div>
        </div>
        
        <!-- SVG Progress Donut -->
        <div id="finance-chart" style="flex:1; max-width:200px; display:flex; align-items:center; justify-content:center; position: relative; z-index: 1;">
          <div style="position: relative; width: 110px; height: 110px; display: flex; align-items: center; justify-content: center;">
            <svg width="110" height="110" viewBox="0 0 100 100" style="transform: rotate(-90deg); width: 100%; height: 100%;">
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="rgba(255,255,255,0.2)" stroke-width="8" />
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ffffff" stroke-width="8"
                      stroke-dasharray="238.76" stroke-dashoffset="238.76"
                      stroke-linecap="round" id="donut-progress" style="transition: stroke-dashoffset 0.5s ease-in-out;" />
            </svg>
            <div style="position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
              <span style="font-size: 20px; font-weight: 800; color: #ffffff;" id="donut-percent">0%</span>
              <span style="font-size: 9px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Tahsilat</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bento Grid Stats -->
      <div class="grid grid-4 fade-in-up stagger-1" style="margin-bottom: 32px; gap: 16px;">
        <div class="kpi-card hover-lift" style="border-left: 4px solid #7c6aff; background: rgba(255, 255, 255, 0.7); padding: 16px 20px;">
          <div class="kpi-icon" style="background: rgba(124, 106, 255, 0.1); color: #7c6aff; width: 42px; height: 42px; border-radius: 10px;">
            ${icon('trendUp', 20)}
          </div>
          <div>
            <div class="kpi-value" id="display-net" style="font-size: 20px; font-weight:800;">${formatCurrency(stats.netProfit)}</div>
            <div class="kpi-label" style="font-size: 12px;">Net Dönem Kazancı</div>
          </div>
        </div>
        <div class="kpi-card hover-lift" style="border-left: 4px solid var(--brand-green); background: rgba(255, 255, 255, 0.7); padding: 16px 20px;">
          <div class="kpi-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--brand-green); width: 42px; height: 42px; border-radius: 10px;">
            ${icon('checkCircle', 20)}
          </div>
          <div>
            <div class="kpi-value" id="display-confirmed" style="font-size: 20px; font-weight:800;">${formatCurrency(stats.confirmedIncome)}</div>
            <div class="kpi-label" style="font-size: 12px;">Tahsil Edilen (Gelir)</div>
          </div>
        </div>
        <div class="kpi-card hover-lift" style="border-left: 4px solid #ff9f43; background: rgba(255, 255, 255, 0.7); padding: 16px 20px;">
          <div class="kpi-icon" style="background: rgba(255, 159, 67, 0.1); color: #ff9f43; width: 42px; height: 42px; border-radius: 10px;">
            ${icon('clock', 20)}
          </div>
          <div>
            <div class="kpi-value" id="display-estimated" style="font-size: 20px; font-weight:800;">${formatCurrency(stats.estimatedIncome)}</div>
            <div class="kpi-label" style="font-size: 12px;">Bekleyen Tahsilat</div>
          </div>
        </div>
        <div class="kpi-card hover-lift" style="border-left: 4px solid #ff5a65; background: rgba(255, 255, 255, 0.7); padding: 16px 20px;">
          <div class="kpi-icon" style="background: rgba(255, 90, 101, 0.1); color: #ff5a65; width: 42px; height: 42px; border-radius: 10px;">
            ${icon('trash', 20)}
          </div>
          <div>
            <div class="kpi-value" id="display-expenses" style="font-size: 20px; font-weight:800;">${formatCurrency(stats.expenses)}</div>
            <div class="kpi-label" style="font-size: 12px;">Toplam Gider</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card" style="margin-bottom:24px; padding:20px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.01);">
        <div style="display:flex; gap:16px; align-items:flex-end; flex-wrap:wrap;">
          <div class="form-group" style="margin:0; flex:1; min-width:200px;">
            <label style="font-size:11px; margin-bottom:6px; font-weight: 700; color: var(--text-secondary);">İsim / Detay ile Ara</label>
            <div style="position:relative; display:flex; align-items:center;">
              <span style="position:absolute; left:12px; display:flex; align-items:center; color: var(--text-secondary);">${icon('search', 16)}</span>
              <input type="text" id="filter-search" placeholder="Öğrenci, grup veya işlem..." style="padding:10px 10px 10px 36px; border-radius:10px; font-weight:600;">
            </div>
          </div>
          <div class="form-group" style="margin:0; width:180px;">
            <label style="font-size:11px; margin-bottom:6px; font-weight: 700; color: var(--text-secondary);">Durum</label>
            <select id="filter-status" style="padding:10px; border-radius:10px; font-weight:600;">
              <option value="all">Tümü</option>
              <option value="estimated">Bekleyen (Gelir)</option>
              <option value="confirmed">Tahsil Edilen (Gelir)</option>
              <option value="expense">Gider</option>
            </select>
          </div>
          <div class="form-group" style="margin:0; width:180px;">
            <label style="font-size:11px; margin-bottom:6px; font-weight: 700; color: var(--text-secondary);">Ay</label>
            <input type="month" id="filter-month" value="${new Date().toISOString().slice(0, 7)}" style="padding:9px; border-radius:10px; font-weight:600;">
          </div>
          <button class="btn btn-secondary hover-lift" id="btn-clear-filters" style="height:42px; padding:0 20px; font-weight:700; border-radius:10px;">Temizle</button>
        </div>
      </div>

      <!-- Dashboard Subtabs Switcher -->
      <div style="margin-bottom: 20px; display: flex; justify-content: flex-start;">
        <div class="tabs" style="padding: 4px; background: var(--bg-secondary); border-radius: var(--radius-md); display: inline-flex;" id="dashboard-tabs">
          <button class="tab-btn active dashboard-tab" data-dash-tab="transactions" style="padding: 8px 18px; font-size: 13px; font-weight: 700; border-radius: 8px; display:flex; align-items:center; gap:6px;">
            ${icon('fileText', 15)} İşlem Geçmişi
          </button>
          <button class="tab-btn dashboard-tab" data-dash-tab="balances" style="padding: 8px 18px; font-size: 13px; font-weight: 700; border-radius: 8px; display:flex; align-items:center; gap:6px;">
            ${icon('user', 15)} Öğrenci & Grup Carileri
          </button>
        </div>
      </div>

      <!-- Tab Content 1: Transactions -->
      <div id="tab-content-transactions" class="card" style="padding: 24px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); display: block;">
        <div class="section-title" style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0; font-size: 18px; font-weight: 800; color: var(--text-primary);">İşlem Geçmişi</h3>
          <div style="font-size:12px; color:var(--text-secondary); font-weight: 700;" id="table-stats-info"></div>
        </div>
        <div class="table-wrapper" id="transactions-table">
          ${renderTransactionTable(stats.filteredTxs)}
        </div>
      </div>

      <!-- Tab Content 2: Student Balances -->
      <div id="tab-content-balances" class="card" style="padding: 24px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); display: none;">
        <div class="section-title" style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0; font-size: 18px; font-weight: 800; color: var(--text-primary);">Cari Hesap Durumu</h3>
          <div style="font-size:12px; color:var(--text-secondary); font-weight: 700;" id="balances-stats-info"></div>
        </div>
        <div class="table-wrapper" id="balances-table">
          ${renderBalancesTable(state)}
        </div>
      </div>
    </div>
  `;

  return { html, init: (el, nav) => initFinance(el, nav) };
}

function renderTransactionTable(transactions) {
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  
  if (sorted.length === 0) {
    return '<div class="empty-state"><p>İşlem bulunamadı</p></div>';
  }
  return `
    <table>
      <thead>
        <tr>
          <th>Tarih</th>
          <th>Tür</th>
          <th>Detay</th>
          <th>İlişkili İsim</th>
          <th>Durum</th>
          <th style="text-align:right;">Tutar</th>
          <th style="text-align:right;">İşlem</th>
        </tr>
      </thead>
      <tbody>
        ${sorted.map(t => {
          const isIncome = t.type === 'income';
          const isPending = t.status === 'estimated';
          
          let amountColor = 'var(--success)';
          let amountPrefix = '+';
          if (!isIncome) {
            amountColor = '#ef4444';
            amountPrefix = '-';
          }
          
          let typeBadge = `<span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--brand-green); font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight:700;">Gelir</span>`;
          if (!isIncome) {
            typeBadge = `<span class="badge" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight:700;">Gider</span>`;
          }
          
          let statusBadge = '';
          if (isIncome) {
            statusBadge = `
              <span class="badge ${isPending ? 'badge-warning' : 'badge-success'}" style="font-size: 11px; padding: 4px 8px; border-radius:6px;">
                ${isPending ? '⏳ Bekliyor' : '✓ Tahsil Edildi'}
              </span>
            `;
          } else {
            statusBadge = `
              <span class="badge badge-success" style="font-size: 11px; padding: 4px 8px; border-radius:6px;">
                ✓ Ödendi
              </span>
            `;
          }

          return `
            <tr style="transition: background-color 0.2s;">
              <td style="font-size:12px;color:var(--text-secondary);font-weight:600;">${formatDate(t.date)}</td>
              <td>${typeBadge}</td>
              <td>
                <div style="font-weight:700; font-size:13px; color: var(--text-primary);">${escHtml(t.description)}</div>
              </td>
              <td style="font-size:12px; color: var(--text-secondary); font-weight:600;">${escHtml(t.refName || '-')}</td>
              <td>${statusBadge}</td>
              <td style="text-align:right;font-weight:800;color:${amountColor};font-size:14px;">
                ${amountPrefix} ${formatCurrency(t.amount)}
              </td>
              <td style="text-align:right;">
                <div style="display:flex; gap:8px; justify-content:flex-end;">
                  ${isIncome && isPending ? `
                    <button class="btn btn-success btn-sm hover-scale" data-confirm-transaction="${t.id}" title="Tahsilatı Onayla" style="padding: 4px 10px; font-size:11px; font-weight:700; border-radius:6px; display:inline-flex; align-items:center; gap:4px;">
                      ${icon('check', 12)} Tahsil Et
                    </button>
                  ` : ''}
                  <button class="btn btn-ghost btn-sm btn-icon hover-scale" data-delete-transaction="${t.id}" style="color:#ef4444; border-radius: 6px; width: 28px; height: 28px; border: 1px solid var(--border); background: white; display:flex; align-items:center; justify-content:center;" title="Sil">
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

function renderBalancesTable(state) {
  const students = state.students;
  const groups = state.groups;

  const list = [];

  students.forEach(s => {
    const sTxs = state.transactions.filter(t => t.type === 'income' && (t.refId === s.id || (t.refName && t.refName.toLowerCase() === s.name.toLowerCase())));
    const accrued = sTxs.reduce((sum, t) => sum + t.amount, 0);
    const paid = sTxs.filter(t => t.status === 'confirmed').reduce((sum, t) => sum + t.amount, 0);
    const debt = sTxs.filter(t => t.status === 'estimated').reduce((sum, t) => sum + t.amount, 0);

    list.push({
      id: s.id,
      name: s.name,
      type: 'student',
      grade: s.grade,
      accrued,
      paid,
      debt,
      status: s.status || 'active'
    });
  });

  groups.forEach(g => {
    const gTxs = state.transactions.filter(t => t.type === 'income' && (t.refId === g.id || (t.refName && t.refName.toLowerCase() === g.name.toLowerCase())));
    const accrued = gTxs.reduce((sum, t) => sum + t.amount, 0);
    const paid = gTxs.filter(t => t.status === 'confirmed').reduce((sum, t) => sum + t.amount, 0);
    const debt = gTxs.filter(t => t.status === 'estimated').reduce((sum, t) => sum + t.amount, 0);

    list.push({
      id: g.id,
      name: g.name,
      type: 'group',
      grade: g.grade,
      accrued,
      paid,
      debt,
      status: g.status || 'active'
    });
  });

  // Sort by debt (largest first), then alphabetically
  list.sort((a, b) => b.debt - a.debt || a.name.localeCompare(b.name));

  if (list.length === 0) {
    return '<div class="empty-state"><p>Kayıtlı öğrenci veya grup bulunamadı</p></div>';
  }

  return `
    <table>
      <thead>
        <tr>
          <th>Öğrenci / Grup</th>
          <th>Seviye</th>
          <th style="text-align:right;">Toplam Hakediş</th>
          <th style="text-align:right;">Tahsil Edilen</th>
          <th style="text-align:right;">Kalan Borç</th>
          <th>Durum</th>
          <th style="text-align:right;">İşlem</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(item => {
          const hasDebt = item.debt > 0;
          const isGroup = item.type === 'group';
          const typeBadge = isGroup 
            ? `<span class="badge" style="background: rgba(124, 106, 255, 0.1); color: #7c6aff; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight:700;">Grup</span>`
            : `<span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--brand-green); font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight:700;">Bireysel</span>`;
          
          return `
            <tr>
              <td>
                <div style="display:flex; align-items:center; gap:8px;">
                  <div style="font-weight:700; font-size:13px; color: var(--text-primary);">${escHtml(item.name)}</div>
                  ${typeBadge}
                </div>
              </td>
              <td style="font-size:12px; color: var(--text-secondary); font-weight:600;">${escHtml(item.grade || '-')}</td>
              <td style="text-align:right; font-weight:600;">${formatCurrency(item.accrued)}</td>
              <td style="text-align:right; font-weight:700; color: var(--success);">${formatCurrency(item.paid)}</td>
              <td style="text-align:right; font-weight:700; color: ${hasDebt ? '#ff9f43' : 'var(--success)'};">
                ${formatCurrency(item.debt)}
              </td>
              <td>
                <span class="badge ${hasDebt ? 'badge-warning' : 'badge-success'}" style="font-size:11px; padding: 4px 8px; border-radius:6px;">
                  ${hasDebt ? '⏳ Ödeme Bekliyor' : '✓ Borçsuz'}
                </span>
              </td>
              <td style="text-align:right;">
                ${hasDebt ? `
                  <button class="btn btn-primary btn-sm hover-scale" data-collect-debt-id="${item.id}" data-collect-debt-type="${item.type}" data-collect-debt-name="${escHtml(item.name)}" style="font-size:11px; font-weight:700; padding: 5px 12px; border-radius: 6px; display:inline-flex; align-items:center; gap:4px; box-shadow: 0 4px 10px rgba(16,185,129,0.15);">
                    ${icon('check', 11)} Ödeme Al
                  </button>
                ` : `
                  <span style="font-size: 12px; color: var(--text-secondary); font-weight: 700;">-</span>
                `}
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function calcStats(state, period, filters = {}) {
  let txs = [...state.transactions];

  // Apply basic period filters
  const now = new Date();
  let from, to = todayStr();
  if (period === 'day') { from = to; }
  else if (period === 'week') {
    const d = new Date(now); d.setDate(d.getDate() - d.getDay() + 1);
    from = getLocalDateStr(d);
  }
  else if (period === 'month') {
    if (filters.month) {
       from = `${filters.month}-01`;
       const [y, m] = filters.month.split('-');
       const lastDay = new Date(y, m, 0).getDate();
       to = `${filters.month}-${String(lastDay).padStart(2, '0')}`;
    } else {
       from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    }
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
    if (filters.status === 'expense') {
      txs = txs.filter(t => t.type === 'expense');
    } else {
      txs = txs.filter(t => t.type === 'income' && t.status === filters.status);
    }
  }
  if (filters.month) {
    txs = txs.filter(t => t.date?.startsWith(filters.month));
  }

  const confirmedIncome = txs.filter(t => t.type === 'income' && t.status === 'confirmed').reduce((s, t) => s + t.amount, 0);
  const estimatedIncome = txs.filter(t => t.type === 'income' && t.status === 'estimated').reduce((s, t) => s + t.amount, 0);
  const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  
  const totalIncome = confirmedIncome + estimatedIncome;
  const netProfit = totalIncome - expenses;

  return { confirmedIncome, estimatedIncome, totalIncome, expenses, netProfit, filteredTxs: txs };
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
    
    el.querySelector('#display-net').textContent = formatCurrency(stats.netProfit);
    el.querySelector('#display-confirmed').textContent = formatCurrency(stats.confirmedIncome);
    el.querySelector('#display-estimated').textContent = formatCurrency(stats.estimatedIncome);
    el.querySelector('#display-expenses').textContent = formatCurrency(stats.expenses);

    el.querySelector('#net-display').textContent = formatCurrency(stats.netProfit);
    el.querySelector('#income-display').textContent = formatCurrency(stats.confirmedIncome);
    el.querySelector('#expense-display').textContent = formatCurrency(stats.estimatedIncome);
    
    // SVG Donut calculation & rendering
    const collectionRate = stats.totalIncome > 0 ? (stats.confirmedIncome / stats.totalIncome) * 100 : 0;
    const offset = 238.76 - (collectionRate / 100) * 238.76;
    const donutProgress = el.querySelector('#donut-progress');
    if (donutProgress) {
      donutProgress.setAttribute('stroke-dashoffset', offset);
    }
    const donutPercent = el.querySelector('#donut-percent');
    if (donutPercent) {
      donutPercent.textContent = `${Math.round(collectionRate)}%`;
    }

    el.querySelector('#transactions-table').innerHTML = renderTransactionTable(stats.filteredTxs);
    el.querySelector('#table-stats-info').textContent = `${stats.filteredTxs.length} işlem listelendi`;
    
    el.querySelector('#balances-table').innerHTML = renderBalancesTable(state);
    const balanceCount = state.students.length + state.groups.length;
    el.querySelector('#balances-stats-info').textContent = `${balanceCount} cari hesap listelendi`;
    
    initTransactionButtons(el, navigate, updateView);
  };

  // Period Tabs
  el.querySelectorAll('[data-period]').forEach(btn => {
    btn.addEventListener('click', () => {
      period = btn.dataset.period;
      if (period !== 'month') {
        filters.month = '';
        const monthInput = el.querySelector('#filter-month');
        if (monthInput) monthInput.value = '';
      } else {
        if (!filters.month) {
           filters.month = new Date().toISOString().slice(0, 7);
           const monthInput = el.querySelector('#filter-month');
           if (monthInput) monthInput.value = filters.month;
        }
      }
      el.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateView();
    });
  });

  // Dashboard Subtabs
  el.querySelectorAll('.dashboard-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.dashboard-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const tab = btn.dataset.dashTab;
      const txContent = el.querySelector('#tab-content-transactions');
      const balContent = el.querySelector('#tab-content-balances');
      
      if (tab === 'transactions') {
        if (txContent) txContent.style.display = 'block';
        if (balContent) balContent.style.display = 'none';
      } else {
        if (txContent) txContent.style.display = 'none';
        if (balContent) balContent.style.display = 'block';
      }
    });
  });

  // Filters
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
    period = 'month';
    el.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
    el.querySelector('[data-period="month"]')?.classList.add('active');
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
    openAddTransactionModal(navigate, updateView);
  });

  // Initial update
  updateView();
}

function initTransactionButtons(el, navigate, updateView) {
  // Confirm Transaction
  el.querySelectorAll('[data-confirm-transaction]').forEach(btn => {
    btn.addEventListener('click', () => {
      confirmTransaction(btn.dataset.confirmTransaction);
      updateView();
    });
  });

  // Delete Transaction
  el.querySelectorAll('[data-delete-transaction]').forEach(btn => {
    btn.addEventListener('click', () => {
      showConfirm({
        title: 'İşlemi Sil',
        message: 'Bu işlem kaydı kalıcı olarak silinecek.',
        confirmText: 'Sil',
        type: 'danger',
        onConfirm: () => { 
          deleteTransaction(btn.dataset.deleteTransaction); 
          updateView();
        },
      });
    });
  });

  // Collect Student Payment (Cari Bakiye)
  el.querySelectorAll('[data-collect-debt-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.collectDebtId;
      const type = btn.dataset.collectDebtType;
      const name = btn.dataset.collectDebtName;
      openCollectStudentPaymentModal(id, type, name, updateView, navigate);
    });
  });
}

function openAddTransactionModal(navigate, updateView) {
  const state = getState();
  
  openModal({
    title: 'Manuel İşlem Ekle',
    body: `
      <div class="form-group">
        <label style="font-weight:700; font-size:12px;">İşlem Türü</label>
        <select id="tx-type" style="width:100%; padding:10px; border-radius:8px; font-weight:600;">
          <option value="income" selected>Gelir (Elde Edilen Kazanç)</option>
          <option value="expense">Gider (Harcama / Maliyet)</option>
        </select>
      </div>
      <div class="form-group">
        <label style="font-weight:700; font-size:12px;">Tutar (₺)</label>
        <input type="number" id="tx-amount" placeholder="0.00" min="0" style="padding:10px; border-radius:8px; font-weight:600;">
      </div>
      <div class="form-group">
        <label style="font-weight:700; font-size:12px;">Açıklama</label>
        <input type="text" id="tx-desc" placeholder="Açıklama girin" style="padding:10px; border-radius:8px; font-weight:600;">
      </div>
      <div class="form-group">
        <label style="font-weight:700; font-size:12px;">Tarih</label>
        <input type="date" id="tx-date" value="${todayStr()}" style="padding:10px; border-radius:8px; font-weight:600;">
      </div>
      <div class="form-group">
        <label style="font-weight:700; font-size:12px;">İlişkili Öğrenci / Grup (İsteğe Bağlı)</label>
        <select id="tx-ref" style="width:100%; padding:10px; border-radius:8px; font-weight:600;">
          <option value="">İlişkilendirme Yok</option>
          <optgroup label="Öğrenciler">
            ${state.students.map(s => `<option value="student:${s.id}">${escHtml(s.name)}</option>`).join('')}
          </optgroup>
          <optgroup label="Gruplar">
            ${state.groups.map(g => `<option value="group:${g.id}">${escHtml(g.name)}</option>`).join('')}
          </optgroup>
        </select>
      </div>
    `,
    footer: `
      <button class="btn btn-secondary" id="tx-cancel" style="padding: 8px 16px; border-radius:8px; font-weight:700;">İptal</button>
      <button class="btn btn-primary" id="tx-save" style="padding: 8px 16px; border-radius:8px; font-weight:700; box-shadow: 0 4px 12px rgba(16,185,129,0.2);">Kaydet</button>
    `,
  });

  document.getElementById('tx-cancel')?.addEventListener('click', closeModal);
  document.getElementById('tx-save')?.addEventListener('click', () => {
    const type = document.getElementById('tx-type').value;
    const amount = parseFloat(document.getElementById('tx-amount').value);
    const desc = document.getElementById('tx-desc').value.trim();
    const date = document.getElementById('tx-date').value;
    const refVal = document.getElementById('tx-ref').value;
    
    if (!amount || !desc) { alert('Tutar ve açıklama zorunludur.'); return; }
    
    let refId = '';
    let refType = '';
    let refName = '';
    
    if (refVal) {
      const parts = refVal.split(':');
      refType = parts[0];
      refId = parts[1];
      
      if (refType === 'student') {
        refName = state.students.find(s => s.id === refId)?.name || '';
      } else if (refType === 'group') {
        refName = state.groups.find(g => g.id === refId)?.name || '';
      }
    }
    
    addTransaction({
      type,
      amount,
      description: desc,
      date,
      status: 'confirmed',
      refId,
      refType,
      refName
    });
    
    closeModal();
    if (updateView) updateView();
    else navigate('finance');
  });
}

function openCollectStudentPaymentModal(refId, refType, name, updateView, navigate) {
  const state = getState();
  const pendingTxs = state.transactions.filter(t => t.type === 'income' && t.status === 'estimated' && (t.refId === refId || (t.refName && t.refName.toLowerCase() === name.toLowerCase())));

  if (pendingTxs.length === 0) {
    alert("Bu öğrenciye ait bekleyen ders tahsilatı bulunmamaktadır.");
    return;
  }

  const totalPending = pendingTxs.reduce((sum, t) => sum + t.amount, 0);

  openModal({
    title: `Ödeme Tahsilatı - ${escHtml(name)}`,
    body: `
      <div style="margin-bottom:16px;">
        <p style="font-size:13px; color:var(--text-secondary); margin:0 0 12px 0; font-weight:600; line-height:1.5;">Öğrencinin tamamlanmış ancak tahsil edilmemiş dersleri aşağıda listelenmiştir. Tahsil ettiğiniz dersleri seçerek onaylayın:</p>
        <div style="font-size:15px; font-weight:700; color:var(--brand-green); background:rgba(16,185,129,0.08); padding:12px 16px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
          <span>Toplam Bekleyen Tutar:</span>
          <span style="font-size:18px; font-weight:800;">${formatCurrency(totalPending)}</span>
        </div>
      </div>
      <div style="max-height:240px; overflow-y:auto; border:1px solid var(--border); border-radius:12px; padding:6px; background: #fafafa;">
        ${pendingTxs.map(t => `
          <label style="display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:8px; margin:0 0 6px 0; cursor:pointer; background:white; border: 1px solid var(--border); transition:all 0.2s;" class="hover-lift">
            <input type="checkbox" class="tx-collect-check" value="${t.id}" checked style="width:18px; height:18px; accent-color:var(--brand-green); cursor:pointer;">
            <div style="flex:1; min-width:0;">
              <div style="font-size:13px; font-weight:800; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escHtml(t.description)}</div>
              <div style="font-size:11px; color:var(--text-secondary); font-weight:700; margin-top:2px;">${formatDate(t.date)}</div>
            </div>
            <div style="font-size:14px; font-weight:800; color:var(--brand-green); font-family:monospace; margin-left:8px;">${formatCurrency(t.amount)}</div>
          </label>
        `).join('')}
      </div>
    `,
    footer: `
      <button class="btn btn-secondary" id="btn-collect-cancel" style="padding: 8px 16px; border-radius:8px; font-weight:700;">İptal</button>
      <button class="btn btn-primary" id="btn-collect-confirm" style="padding: 8px 16px; border-radius:8px; font-weight:700; box-shadow: 0 4px 12px rgba(16,185,129,0.25);">Seçilenleri Tahsil Et</button>
    `,
  });

  document.getElementById('btn-collect-cancel')?.addEventListener('click', closeModal);
  document.getElementById('btn-collect-confirm')?.addEventListener('click', () => {
    const checkedBoxes = document.querySelectorAll('.tx-collect-check:checked');
    if (checkedBoxes.length === 0) {
      alert("Lütfen tahsil edilecek en az bir ders seçin.");
      return;
    }

    checkedBoxes.forEach(box => {
      confirmTransaction(box.value);
    });
    
    closeModal();
    updateView();
  });
}
