import { getState, getPendingLessons, getMonthlyStats } from '../../store/store.js';
import { openModal } from '../../components/modal.js';
import { icon } from '../../components/icons.js';
import { formatCurrency, escHtml, getAvatarColor, getInitials } from '../../utils/helpers.js';

export function openDashboardStatsModal(type) {
  const state = getState();
  
  const modalConfigs = {
    income: {
      title: 'Aylık Gelir Detayı',
      body: renderIncomeDetails(state),
      size: 'lg'
    },
    students: {
      title: 'Aktif Öğrenciler',
      body: renderStudentsList(state),
      size: 'md'
    },
    groups: {
      title: 'Aktif Gruplar',
      body: renderGroupsList(state),
      size: 'md'
    },
    completed: {
      title: 'Tamamlanan Dersler',
      body: renderCompletedLessons(state),
      size: 'lg'
    },
    pending: {
      title: 'Onay Bekleyen Dersler',
      body: renderPendingDetails(state),
      size: 'lg'
    }
  };

  const config = modalConfigs[type];
  if (config) {
    openModal(config);
  }
}

function renderIncomeDetails(state) {
  const stats = getMonthlyStats();
  const m = new Date().getMonth();
  const y = new Date().getFullYear();
  const monthStart = `${y}-${String(m + 1).padStart(2, '0')}-01`;
  
  const transactions = state.transactions
    .filter(t => t.type === 'income' && t.date >= monthStart)
    .sort((a, b) => b.date.localeCompare(a.date));

  return `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div style="background:var(--brand-green-soft); padding:24px; border-radius:16px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:14px; color:var(--text-secondary); font-weight:600;">Bu Ayki Toplam Gelir</div>
          <div style="font-size:32px; font-weight:800; color:var(--brand-green); margin-top:4px;">${formatCurrency(stats.income)}</div>
        </div>
        <div style="background:white; padding:12px; border-radius:12px; color:var(--brand-green);">
          ${icon('finance', 32)}
        </div>
      </div>

      <div class="table-wrapper" style="max-height:400px; overflow-y:auto;">
        <table>
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Açıklama</th>
              <th style="text-align:right;">Tutar</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.length === 0 ? '<tr><td colspan="3" style="text-align:center; padding:40px;">Bu ay henüz gelir kaydı bulunmuyor.</td></tr>' : ''}
            ${transactions.map(t => `
              <tr>
                <td style="font-size:13px; color:var(--text-secondary);">${t.date}</td>
                <td style="font-weight:600;">${escHtml(t.description)}</td>
                <td style="text-align:right; font-weight:800; color:var(--success);">${formatCurrency(t.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderStudentsList(state) {
  const students = state.students.filter(s => (s.status || 'active') === 'active');
  
  return `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div style="background:rgba(124,106,255,0.05); color:var(--accent2); padding:20px; border-radius:12px; border:1px solid rgba(124,106,255,0.1); display:flex; align-items:center; gap:12px;">
        <div style="width:48px; height:48px; background:white; border-radius:12px; display:flex; align-items:center; justify-content:center; color:var(--accent2); box-shadow:0 4px 10px rgba(124,106,255,0.1);">
          ${icon('students', 24)}
        </div>
        <div>
          <div style="font-size:13px; color:var(--text-secondary); font-weight:600;">Aktif Öğrenci Sayısı</div>
          <div style="font-size:24px; font-weight:800; color:var(--accent2);">${students.length} Öğrenci</div>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:12px; max-height:400px; overflow-y:auto; padding-right:4px;">
        ${students.map(s => `
          <div class="card card-sm" style="display:flex; align-items:center; gap:12px; padding:12px 16px; border:1px solid var(--border); background:white;">
            <div class="avatar" style="background:${getAvatarColor(s.name)}; width:44px; height:44px; font-size:14px;">
              ${getInitials(s.name)}
            </div>
            <div style="flex:1;">
              <div style="font-weight:700; font-size:15px; color:var(--text-primary);">${escHtml(s.name)}</div>
              <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">${s.grade}</div>
            </div>
            <span class="badge badge-success" style="font-size:10px; padding:4px 10px;">Aktif</span>
          </div>
        `).join('')}
        ${students.length === 0 ? '<div style="text-align:center; padding:40px; color:var(--text-muted);">Aktif öğrenci bulunmuyor.</div>' : ''}
      </div>
    </div>
  `;
}

function renderGroupsList(state) {
  const groups = state.groups.filter(g => (g.status || 'active') === 'active');
  
  return `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div style="background:rgba(124,106,255,0.05); color:var(--accent2); padding:20px; border-radius:12px; border:1px solid rgba(124,106,255,0.1); display:flex; align-items:center; gap:12px;">
        <div style="width:48px; height:48px; background:white; border-radius:12px; display:flex; align-items:center; justify-content:center; color:var(--accent2); box-shadow:0 4px 10px rgba(124,106,255,0.1);">
          ${icon('groups', 24)}
        </div>
        <div>
          <div style="font-size:13px; color:var(--text-secondary); font-weight:600;">Aktif Grup Sayısı</div>
          <div style="font-size:24px; font-weight:800; color:var(--accent2);">${groups.length} Grup</div>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:12px; max-height:400px; overflow-y:auto; padding-right:4px;">
        ${groups.map(g => `
          <div class="card card-sm" style="display:flex; align-items:center; gap:12px; padding:12px 16px; border:1px solid var(--border); background:white;">
            <div class="avatar" style="background:var(--brand-green-soft); color:var(--brand-green); width:44px; height:44px; font-size:14px;">
              ${getInitials(g.name)}
            </div>
            <div style="flex:1;">
              <div style="font-weight:700; font-size:15px; color:var(--text-primary);">${escHtml(g.name)}</div>
              <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">${g.grade}</div>
            </div>
            <span class="badge badge-success" style="font-size:10px; padding:4px 10px;">Aktif</span>
          </div>
        `).join('')}
        ${groups.length === 0 ? '<div style="text-align:center; padding:40px; color:var(--text-muted);">Aktif grup bulunmuyor.</div>' : ''}
      </div>
    </div>
  `;
}

function renderCompletedLessons(state) {
  const m = new Date().getMonth();
  const y = new Date().getFullYear();
  const monthStart = `${y}-${String(m + 1).padStart(2, '0')}-01`;

  const completed = state.lessons
    .filter(l => l.status === 'completed' && l.date >= monthStart)
    .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));

  return `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div style="background:var(--brand-green-soft); padding:20px; border-radius:12px; display:flex; align-items:center; gap:12px;">
        <div style="width:48px; height:48px; background:white; border-radius:12px; display:flex; align-items:center; justify-content:center; color:var(--brand-green);">
          ${icon('checkCircle', 24)}
        </div>
        <div>
          <div style="font-size:13px; color:var(--text-secondary); font-weight:600;">Bu Ay Tamamlanan</div>
          <div style="font-size:24px; font-weight:800; color:var(--brand-green);">${completed.length} Ders</div>
        </div>
      </div>

      <div class="table-wrapper" style="max-height:400px; overflow-y:auto;">
        <table>
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Ders / Öğrenci</th>
              <th>Süre</th>
              <th style="text-align:right;">Durum</th>
            </tr>
          </thead>
          <tbody>
            ${completed.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding:40px;">Bu ay henüz tamamlanmış ders bulunmuyor.</td></tr>' : ''}
            ${completed.map(l => `
              <tr>
                <td style="font-size:13px;">${l.date}</td>
                <td>
                  <div style="font-weight:700;">${escHtml(l.title)}</div>
                  <div style="font-size:11px; color:var(--text-muted);">${l.subject || ''}</div>
                </td>
                <td style="font-size:13px;">${l.startTime} - ${l.endTime}</td>
                <td style="text-align:right;"><span class="badge badge-success">✓ Tamamlandı</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderPendingDetails(state) {
  // We use the same logic as Dashboard.js for consistency
  const today = new Date().toISOString().split('T')[0];
  const pending = state.lessons.filter(l => {
    if (l.status === 'passive') return false;
    if (l.status !== 'upcoming') return false;
    // Basic 'waiting' check: date is today or in the past
    return l.date <= today;
  });

  return `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div style="background:rgba(245,158,11,0.05); color:var(--warning); padding:20px; border-radius:12px; border:1px solid rgba(245,158,11,0.1); display:flex; align-items:center; gap:12px;">
        <div style="width:48px; height:48px; background:white; border-radius:12px; display:flex; align-items:center; justify-content:center; color:var(--warning); box-shadow:0 4px 10px rgba(245,158,11,0.1);">
          ${icon('clock', 24)}
        </div>
        <div>
          <div style="font-size:13px; color:var(--text-secondary); font-weight:600;">Bekleyen Onay</div>
          <div style="font-size:24px; font-weight:800; color:var(--warning);">${pending.length} Ders</div>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:12px; max-height:400px; overflow-y:auto; padding-right:4px;">
        ${pending.length === 0 ? '<div style="text-align:center; padding:40px; color:var(--text-muted);">Onay bekleyen ders bulunmuyor.</div>' : ''}
        ${pending.map(l => `
          <div class="card card-sm" style="display:flex; align-items:center; justify-content:space-between; border-left:4px solid var(--warning); padding:16px;">
            <div>
              <div style="font-weight:700; font-size:15px; color:var(--text-primary);">${escHtml(l.title)}</div>
              <div style="font-size:12px; color:var(--text-muted); margin-top:4px; display:flex; align-items:center; gap:6px;">
                ${icon('calendar', 12)} ${l.date} • ${icon('clock', 12)} ${l.startTime} - ${l.endTime}
              </div>
            </div>
            <button class="btn btn-success btn-sm" onclick="window._openLessonEval('${l.id}')" style="padding:8px 16px; border-radius:8px; font-weight:700;">
              ✓ Onayla
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
