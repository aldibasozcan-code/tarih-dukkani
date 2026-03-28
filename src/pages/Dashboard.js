// ═══════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════
import { getState, getTodayLessons, getPendingLessons, getMonthlyStats, getLessonStatus, completeLesson, postponeLesson, addNextWeekLesson, generateGoogleCalendarUrl } from '../store/store.js';
import { icon } from '../components/icons.js';
import { formatCurrency, formatDate, formatDateShort, formatTime, getLessonStatusInfo, getAvatarColor, getInitials } from '../utils/helpers.js';
import { openModal } from '../components/modal.js';

export function renderDashboard(navigate) {
  const state = getState();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const dayName = dayNames[today.getDay()];
  const dateStr = today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  const todayLessons = getTodayLessons();
  const pendingLessons = getPendingLessons();
  const stats = getMonthlyStats();
  const completedThisMonth = state.lessons.filter(l => {
    const m = new Date().getMonth();
    const y = new Date().getFullYear();
    return l.date?.startsWith(`${y}-${String(m + 1).padStart(2, '0')}`) && l.status === 'completed';
  }).length;

  const html = `
    <div class="fade-in">
      ${pendingLessons.length > 0 ? `
        <div class="pending-alert">
          <div style="display:flex;align-items:center;gap:8px;">
            ${icon('alertCircle', 16)}
            <span class="pending-alert-text">${pendingLessons.length} ders onay bekliyor!</span>
          </div>
          <button class="btn btn-warning btn-sm" id="show-pending-btn">İncele</button>
        </div>
      ` : ''}

      ${state.showSeasonReview ? `
        <div class="pending-alert" style="background:rgba(124,106,255,0.1); border-color:rgba(124,106,255,0.3); color:var(--accent2);">
          <div style="display:flex;align-items:center;gap:8px;">
            ${icon('calendar', 16)}
            <span class="pending-alert-text">Yeni dönem hazırlığı! Öğrenci listeni güncellemek ister misin?</span>
          </div>
          <button class="btn btn-primary btn-sm" id="show-season-review-btn">Şimdi İncele</button>
        </div>
      ` : ''}

      <!-- Welcome Banner -->
      <div class="welcome-banner" style="margin-bottom:24px;">
        <div class="welcome-text">
          <h2>Merhaba, ${state.profile.name.split(' ')[0]}! 👋</h2>
          <p>${dayName}, ${dateStr} • Bugün ${todayLessons.length} dersiniz var</p>
        </div>
        <div class="quick-actions">
          <button class="btn btn-primary" id="btn-add-lesson">${icon('plus', 14)} Ders Ekle</button>
          <button class="btn btn-secondary" data-nav="calendar">${icon('calendar', 14)} Takvim</button>
          <button class="btn btn-secondary" data-nav="students">${icon('students', 14)} Öğrenciler</button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-4" style="margin-bottom:24px;">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(99,202,183,0.15);">
            ${icon('trendUp', 20)}
          </div>
          <div>
            <div class="kpi-value">${formatCurrency(stats.income)}</div>
            <div class="kpi-label">Aylık Gelir</div>
            <div class="kpi-trend up">+${formatCurrency(stats.net)} net</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(124,106,255,0.15);">
            ${icon('students', 20)}
          </div>
          <div>
            <div class="kpi-value">${state.students.filter(s => (s.status || 'active') === 'active').length}</div>
            <div class="kpi-label">Aktif Öğrenci</div>
            <div class="kpi-trend" style="color:var(--accent2);">${state.groups.filter(g => (g.status || 'active') === 'active').length} aktif grup</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(246,201,14,0.15);">
            ${icon('checkCircle', 20)}
          </div>
          <div>
            <div class="kpi-value">${completedThisMonth}</div>
            <div class="kpi-label">Bu Ay Tamamlanan</div>
            <div class="kpi-trend up">${todayLessons.length} bugün</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(255,159,67,0.15);">
            ${icon('clock', 20)}
          </div>
          <div>
            <div class="kpi-value">${pendingLessons.length}</div>
            <div class="kpi-label">Onay Bekliyor</div>
            <div class="kpi-trend ${pendingLessons.length > 0 ? 'down' : ''}">${pendingLessons.length > 0 ? 'Dikkat!' : 'Temiz ✓'}</div>
          </div>
        </div>
      </div>

      <div class="grid grid-2" style="align-items:start;">
        <!-- Today's Lessons -->
        <div class="card">
          <div class="section-title">
            <h3>${icon('calendar', 15)} Bugünkü Dersler</h3>
            <a data-nav="calendar">Takvimi Aç →</a>
          </div>
          ${todayLessons.length === 0 ? `
            <div class="empty-state" style="padding:30px 20px;">
              ${icon('calendar', 32)}
              <p>Bugün ders yok</p>
            </div>
          ` : todayLessons.map(lesson => {
            const status = getLessonStatus(lesson);
            const si = getLessonStatusInfo(status);
            return `
              <div class="card card-sm" style="margin-bottom:8px;cursor:pointer;" data-lesson-id="${lesson.id}">
                <div style="display:flex;align-items:center;gap:12px;">
                  <div style="width:4px;height:48px;border-radius:2px;background:${status === 'ongoing' ? 'var(--success)' : status === 'waiting' ? 'var(--warning)' : 'var(--border)'}; flex-shrink:0;"></div>
                  <div style="flex:1;">
                    <div style="font-weight:600;font-size:13px;">${lesson.title}</div>
                    <div style="font-size:12px;color:var(--text-muted);">${lesson.startTime} – ${lesson.endTime}</div>
                  </div>
                  <div>
                    <span class="badge ${si.badgeClass}">${si.label}</span>
                    <a href="${generateGoogleCalendarUrl(lesson)}" target="_blank" class="btn btn-secondary btn-sm" title="Google Takvim'e Ekle" style="margin-top:4px; margin-right:4px; padding: 4px 8px;">
                      ${icon('calendar', 14)}
                    </a>
                    ${status === 'waiting' || status === 'ongoing' ? `
                      <button class="btn btn-success btn-sm" style="margin-top:4px;" data-complete-lesson="${lesson.id}">✓ Tamamla</button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Revenue Chart -->
        <div class="card">
          <div class="section-title">
            <h3>${icon('trendUp', 15)} Bu Hafta Gelir</h3>
          </div>
          ${renderMiniChart(state)}
          <hr class="divider">
          <div class="grid grid-2">
            <div>
              <div style="font-size:11px;color:var(--text-muted);">Tamamlanan Gelir</div>
              <div style="font-size:18px;font-weight:700;color:var(--success);">${formatCurrency(stats.income)}</div>
            </div>
            <div>
              <div style="font-size:11px;color:var(--text-muted);">Gider</div>
              <div style="font-size:18px;font-weight:700;color:var(--danger);">${formatCurrency(stats.expense)}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Students + Pending -->
      <div class="grid grid-2" style="margin-top:16px;align-items:start;">
        <div class="card">
          <div class="section-title">
            <h3>${icon('students', 15)} Son Öğrenciler</h3>
            <a data-nav="students">Tümü →</a>
          </div>
          ${state.students.slice(0, 5).map(s => `
            <div class="person-card" style="margin-bottom:8px;" data-nav="students">
              <div class="person-avatar" style="background:${getAvatarColor(s.name)}">${getInitials(s.name)}</div>
              <div style="flex:1;">
                <div class="person-name">${s.name}</div>
                <div class="person-sub">${s.grade}</div>
              </div>
              <span class="badge badge-info">${formatCurrency(s.rate)}/s</span>
            </div>
          `).join('')}
          ${state.students.length === 0 ? '<div style="text-align:center;color:var(--text-muted);padding:20px;">Öğrenci yok</div>' : ''}
        </div>

        <div class="card">
          <div class="section-title">
            <h3>${icon('groups', 15)} Gruplar</h3>
            <a data-nav="groups">Tümü →</a>
          </div>
          ${state.groups.slice(0, 4).map(g => `
            <div class="person-card" style="margin-bottom:8px;" data-nav="groups">
              <div class="person-avatar" style="background:var(--accent2-glow);border:1px solid var(--accent2);">
                <span style="color:var(--accent2);">${getInitials(g.name)}</span>
              </div>
              <div style="flex:1;">
                <div class="person-name">${g.name}</div>
                <div class="person-sub">${['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'][g.dayOfWeek]} ${g.time}</div>
              </div>
              <span class="badge badge-purple">${g.grade}</span>
            </div>
          `).join('')}
          ${state.groups.length === 0 ? '<div style="text-align:center;color:var(--text-muted);padding:20px;">Grup yok</div>' : ''}
        </div>
      </div>
    </div>
  `;

  return { html, init: (el, nav) => initDashboard(el, nav) };
}

function renderMiniChart(state) {
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  // Get week start
  const now = new Date();
  const weekIncome = days.map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay() + i + 1);
    const dStr = d.toISOString().split('T')[0];
    return state.transactions
      .filter(t => t.date === dStr && t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
  });
  const max = Math.max(...weekIncome, 1);

  return `
    <div style="display:flex;align-items:flex-end;gap:6px;height:80px;margin-bottom:12px;">
      ${weekIncome.map((val, i) => {
        const h = Math.max((val / max) * 70, val > 0 ? 8 : 2);
        return `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
            <div style="width:100%;height:${h}px;background:${val > 0 ? 'linear-gradient(to top,var(--accent-dark),var(--accent))' : 'var(--border)'};border-radius:3px 3px 0 0;transition:height 0.3s;"></div>
            <div style="font-size:9px;color:var(--text-muted);">${days[i]}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function initDashboard(el, navigate) {
  // Pending lessons
  el.querySelector('#show-pending-btn')?.addEventListener('click', () => {
    openPendingModal(navigate);
  });

  // Add lesson
  el.querySelector('#btn-add-lesson')?.addEventListener('click', () => {
    import('./modals/AddLessonModal.js').then(m => m.openAddLessonModal(() => navigate('dashboard')));
  });

  // Complete lesson buttons
  el.querySelectorAll('[data-complete-lesson]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const lessonId = btn.dataset.completeLesson;
      openLessonEvalModal(lessonId, navigate);
    });
  });

  // Nav links
  el.querySelectorAll('[data-nav]').forEach(el2 => {
    el2.addEventListener('click', () => navigate(el2.dataset.nav));
  });

  // Season Review
  el.querySelector('#show-season-review-btn')?.addEventListener('click', () => {
    import('./modals/SeasonReviewModal.js').then(m => m.openSeasonReviewModal());
  });
}

function openPendingModal(navigate) {
  import('../components/modal.js').then(m => m.openModal({
    title: 'Onay Bekleyen Dersler',
    body: renderPendingLessons(navigate),
    size: 'lg',
  }));

  // After modal renders, attach events
  setTimeout(() => {
    document.querySelectorAll('[data-complete-lesson-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lessonId = btn.dataset.completeLessonModal;
        import('../components/modal.js').then(m => m.closeModal());
        openLessonEvalModal(lessonId, navigate);
      });
    });
  }, 50);
}

function renderPendingLessons(navigate) {
  const pending = getPendingLessons();
  if (pending.length === 0) {
    return `<div class="empty-state" style="padding:40px;">Onay bekleyen ders bulunmuyor.</div>`;
  }
  
  return `
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${pending.map(lesson => `
        <div class="card card-sm" style="display:flex;align-items:center;justify-content:space-between;border-left:4px solid var(--warning);">
          <div>
            <div style="font-weight:700;font-size:14px;color:var(--text-primary);">${lesson.title}</div>
            <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">${lesson.date} • ${lesson.startTime} - ${lesson.endTime}</div>
          </div>
          <button class="btn btn-success btn-sm" data-complete-lesson-modal="${lesson.id}">
            ✓ Dersi Tamamla
          </button>
        </div>
      `).join('')}
    </div>
  `;
}

function openLessonEvalModal(lessonId, navigate) {
  import('./modals/LessonEvalModal.js').then(m => m.openLessonEvalModal(lessonId, navigate));
}
