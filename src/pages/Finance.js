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
          <p>Gelir ve gider takibi</p>
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
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:4px;">Net Kazanç (Bu Ay)</div>
          <div class="finance-amount" id="net-display">${formatCurrency(stats.net)}</div>
          <div style="display:flex;gap:16px;margin-top:12px;">
            <div>
              <div style="font-size:11px;color:var(--text-muted);">Gelir</div>
              <div style="font-size:18px;font-weight:700;color:var(--success);" id="income-display">${formatCurrency(stats.income)}</div>
            </div>
            <div>
              <div style="font-size:11px;color:var(--text-muted);">Gider</div>
              <div style="font-size:18px;font-weight:700;color:var(--danger);" id="expense-display">${formatCurrency(stats.expense)}</div>
            </div>
          </div>
        </div>
        <div id="finance-chart" style="flex:1;max-width:200px;">
          ${renderDonutChart(stats)}
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-3" style="margin-bottom:24px;">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(99,202,183,0.15);">${icon('trendUp', 20)}</div>
          <div>
            <div class="kpi-value" id="pending-income">${formatCurrency(calcPendingIncome(state))}</div>
            <div class="kpi-label">Beklenen Gelir</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(46,213,115,0.15);">${icon('checkCircle', 20)}</div>
          <div>
            <div class="kpi-value" id="confirmed-income">${formatCurrency(stats.income)}</div>
            <div class="kpi-label">Kesinleşen Gelir (Bu Ay)</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(255,90,101,0.15);">${icon('finance', 20)}</div>
          <div>
            <div class="kpi-value">${formatCurrency(stats.expense)}</div>
            <div class="kpi-label">Toplam Gider (Bu Ay)</div>
          </div>
        </div>
      </div>

      <!-- Transaction list -->
      <div class="card">
        <div class="section-title" style="margin-bottom:16px;">
          <h3>İşlem Geçmişi</h3>
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
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  if (sorted.length === 0) {
    return '<div class="empty-state"><p>İşlem yok</p></div>';
  }
  return `
    <table>
      <thead>
        <tr>
          <th>Tarih</th>
          <th>Açıklama</th>
          <th>Tür</th>
          <th style="text-align:right;">Tutar</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${sorted.map(t => `
          <tr>
            <td style="font-size:12px;color:var(--text-muted);">${formatDate(t.date)}</td>
            <td>${escHtml(t.description)}</td>
            <td><span class="badge ${t.type === 'income' ? 'badge-success' : 'badge-danger'}">${t.type === 'income' ? '↑ Gelir' : '↓ Gider'}</span></td>
            <td style="text-align:right;font-weight:700;color:${t.type === 'income' ? 'var(--success)' : 'var(--danger)'};">
              ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
            </td>
            <td>
              <button class="btn btn-ghost btn-sm btn-icon" data-delete-transaction="${t.id}" style="color:var(--danger);">${icon('trash', 13)}</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderDonutChart(stats) {
  const total = stats.income + stats.expense || 1;
  const incomeAngle = (stats.income / total) * 360;
  const r = 45;
  const cx = 55; const cy = 55;
  const incomeArc = describeArc(cx, cy, r, 0, incomeAngle);
  return `
    <svg viewBox="0 0 110 110" style="width:100%;height:100px;">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="14"/>
      ${stats.expense > 0 ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--danger)" stroke-width="14" stroke-dasharray="${2 * Math.PI * r}" stroke-dashoffset="${2 * Math.PI * r * (stats.income / total)}" transform="rotate(-90 ${cx} ${cy})"/>` : ''}
      ${stats.income > 0 ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--success)" stroke-width="14" stroke-dasharray="${2 * Math.PI * r}" stroke-dashoffset="${2 * Math.PI * r * (stats.expense / total)}" transform="rotate(-90 ${cx} ${cy}) rotate(${360 * (stats.expense / total)} ${cx} ${cy})"/>` : ''}
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--text-primary)">${Math.round((stats.income / total) * 100)}%</text>
      <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="9" fill="var(--text-muted)">Gelir</text>
    </svg>
  `;
}

function describeArc(x, y, r, start, end) {
  const s = polarToCart(x, y, r, start);
  const e = polarToCart(x, y, r, end);
  const large = end - start <= 180 ? 0 : 1;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}
function polarToCart(cx, cy, r, angle) {
  const rad = (angle - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function calcStats(state, period) {
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

  const txs = period === 'all' ? state.transactions : state.transactions.filter(t => t.date >= from && t.date <= to);
  const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { income, expense, net: income - expense };
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

  el.querySelectorAll('[data-period]').forEach(btn => {
    btn.addEventListener('click', () => {
      period = btn.dataset.period;
      el.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const state = getState();
      const stats = calcStats(state, period);
      el.querySelector('#net-display').textContent = formatCurrency(stats.net);
      el.querySelector('#income-display').textContent = formatCurrency(stats.income);
      el.querySelector('#expense-display').textContent = formatCurrency(stats.expense);
      // Update table
      let txs = state.transactions;
      const now = new Date();
      if (period === 'day') {
        const t = now.toISOString().split('T')[0];
        txs = txs.filter(x => x.date === t);
      } else if (period === 'week') {
        const d = new Date(now); d.setDate(d.getDate() - d.getDay() + 1);
        const from = d.toISOString().split('T')[0];
        txs = txs.filter(x => x.date >= from);
      } else if (period === 'month') {
        const m = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        txs = txs.filter(x => x.date?.startsWith(m));
      }
      el.querySelector('#transactions-table').innerHTML = renderTransactionTable(txs);
      initTransactionButtons(el, navigate);
    });
  });

  el.querySelector('#btn-add-transaction')?.addEventListener('click', () => {
    openAddTransactionModal(navigate);
  });

  initTransactionButtons(el, navigate);
}

function initTransactionButtons(el, navigate) {
  el.querySelectorAll('[data-delete-transaction]').forEach(btn => {
    btn.addEventListener('click', () => {
      showConfirm({
        title: 'İşlemi Sil',
        message: 'Bu işlem kaydı silinecek.',
        confirmText: 'Sil',
        type: 'danger',
        onConfirm: () => { deleteTransaction(btn.dataset.deleteTransaction); navigate('finance'); },
      });
    });
  });
}

function openAddTransactionModal(navigate) {
  openModal({
    title: 'Manuel İşlem Ekle',
    body: `
      <div class="form-group">
        <label>İşlem Türü</label>
        <select id="tx-type">
          <option value="income">Gelir</option>
          <option value="expense">Gider</option>
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
