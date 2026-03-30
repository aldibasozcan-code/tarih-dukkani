// ═══════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════
import { getState, getTodayLessons, getPendingLessons, getMonthlyStats, getLessonStatus, completeLesson, postponeLesson, addNextWeekLesson, generateGoogleCalendarUrl } from '../store/store.js';
import { icon } from '../components/icons.js';
import { formatCurrency, formatDate, formatDateShort, formatTime, getLessonStatusInfo, getAvatarColor, getInitials } from '../utils/helpers.js';
import { openModal } from '../components/modal.js';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return 'İyi Geceler';
  if (hour < 12) return 'Günaydın';
  if (hour < 18) return 'İyi Günler';
  return 'İyi Akşamlar';
}

function getGreetingIcon() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 18) return icon('zap', 32); // Representing sun/energy
  return icon('moon', 32); // I need to make sure moon exists or use bell/star
}

function getRandomQuote() {
  const quotes = [
    "Eğitim, dünyayı değiştirmek için kullanabileceğiniz en güçlü silahtır.",
    "Bir öğretmenin etkilediği alanı kimse tam olarak ölçemez.",
    "Öğretmek, iki kez öğrenmektir.",
    "Gelecek, gençlerin, gençler ise öğretmenlerin eseridir.",
    "En iyi öğretmen, öğrencisine ne göreceğini değil, nereye bakacağını gösterendir."
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export function renderDashboard(navigate) {
  const state = getState();
  const today = new Date();
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
        <div class="pending-alert fade-in-up">
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="status-pulse-ring" style="background:var(--warning);width:8px;height:8px;border-radius:50%;"></div>
            <span class="pending-alert-text" style="font-weight:700;">${pendingLessons.length} ders onayınızı bekliyor!</span>
          </div>
          <button class="btn btn-warning btn-sm" id="show-pending-btn">Şimdi İncele</button>
        </div>
      ` : ''}

      <!-- Premium Welcome Banner -->
      <div class="welcome-banner-modern fade-in-up stagger-1" style="margin-bottom:32px;">
        <div class="welcome-text">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px; opacity:0.9;">
            <span style="background:rgba(255,255,255,0.2); padding:6px 12px; border-radius:20px; font-size:12px; font-weight:700;">${dateStr.toUpperCase()}</span>
          </div>
          <h2 style="font-size:42px;">${getGreeting()}, ${state.profile.name.split(' ')[0]}!</h2>
          <p style="font-size:18px; opacity:0.9; margin-top:8px;">Bugün ajandanızda ${todayLessons.length} ders planlanmış görünüyor.</p>
          
          <div class="quick-actions" style="margin-top:32px;">
            <button class="btn btn-primary glass" id="btn-add-lesson" style="background:white; color:var(--brand-green); font-weight:800; padding:12px 24px;">
              ${icon('plus', 16)} Yeni Ders Planla
            </button>
          </div>
        </div>
        
        <div style="position:relative; z-index:2; display:none; @media (min-width: 1024px) { display: block; }">
           <div style="width:120px; height:120px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:30px; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px);">
              ${icon('courses', 48)}
           </div>
        </div>
      </div>

      <!-- Bento Grid KPIs -->
      <div class="grid grid-4 fade-in-up stagger-2" style="margin-bottom:32px;">
        <div class="kpi-card hover-lift">
          <div class="kpi-icon" style="background:rgba(16,185,129,0.1); color:var(--success);">
            ${icon('trendUp', 24)}
          </div>
          <div>
            <div class="kpi-value">${formatCurrency(stats.income)}</div>
            <div class="kpi-label">Bu Ay Toplam</div>
          </div>
        </div>
        
        <div class="kpi-card hover-lift">
          <div class="kpi-icon" style="background:rgba(124,106,255,0.1); color:var(--accent2 || '#7c3aed');">
            ${icon('students', 24)}
          </div>
          <div>
            <div class="kpi-value">${state.students.filter(s => (s.status || 'active') === 'active').length}</div>
            <div class="kpi-label">Aktif Öğrenci</div>
          </div>
        </div>

        <div class="kpi-card hover-lift">
          <div class="kpi-icon" style="background:rgba(245,158,11,0.1); color:var(--warning);">
            ${icon('checkCircle', 24)}
          </div>
          <div>
            <div class="kpi-value">${completedThisMonth}</div>
            <div class="kpi-label">Tamamlanan Ders</div>
          </div>
        </div>

        <div class="kpi-card hover-lift" style="${pendingLessons.length > 0 ? 'border-left-color:var(--danger);' : ''}">
          <div class="kpi-icon" style="background:rgba(239,68,68,0.1); color:var(--danger);">
            ${icon('clock', 24)}
          </div>
          <div>
            <div class="kpi-value">${pendingLessons.length}</div>
            <div class="kpi-label">Onay Bekleyen</div>
          </div>
        </div>
      </div>

      <div class="grid grid-3 fade-in-up stagger-3" style="align-items:start; grid-template-columns: 1.2fr 1fr 0.8fr;">
        <!-- Left: Today's Lessons (Bigger) -->
        <div class="card glass-card hover-lift" style="min-height:400px; border-top:none; border-bottom:4px solid var(--brand-green);">
          <div class="section-title">
            <h3 class="text-gradient">${icon('calendar', 18)} Ajanda: Bugün</h3>
            <a data-nav="calendar" style="background:var(--brand-green-soft); color:var(--brand-green); padding:5px 12px; border-radius:20px; font-size:12px;">Tümü →</a>
          </div>
          <div style="margin-top:16px;">
            ${todayLessons.length === 0 ? `
              <div class="empty-state" style="padding:60px 20px; opacity:0.6;">
                ${icon('calendar', 48)}
                <p style="margin-top:12px; font-weight:600;">Bugün için planlanmış bir dersiniz bulunmuyor.</p>
              </div>
            ` : todayLessons.map(lesson => {
              const status = getLessonStatus(lesson);
              const si = getLessonStatusInfo(status);
              return `
                <div class="card card-sm hover-lift" style="margin-bottom:12px; border-left:4px solid ${si.badgeClass.includes('success') ? 'var(--success)' : si.badgeClass.includes('warning') ? 'var(--warning)' : 'var(--border)'}; background:rgba(255,255,255,0.5);" data-lesson-id="${lesson.id}">
                  <div style="display:flex;align-items:center;gap:16px;">
                    <div style="flex:1;">
                      <div style="font-weight:700;font-size:15px;color:var(--text-primary);">${lesson.title}</div>
                      <div style="display:flex; align-items:center; gap:4px; font-size:12px; color:var(--text-muted); margin-top:4px;">
                        ${icon('clock', 12)} ${lesson.startTime} – ${lesson.endTime}
                      </div>
                    </div>
                    <div style="text-align:right;">
                      <span class="badge ${si.badgeClass}" style="border-radius:20px;">${si.label}</span>
                      <div style="margin-top:8px; display:flex; gap:6px; justify-content:flex-end;">
                        ${status === 'waiting' || status === 'ongoing' ? `
                          <button class="btn btn-success btn-sm btn-icon" data-complete-lesson="${lesson.id}" title="Tamamla">${icon('check', 14)}</button>
                        ` : ''}
                        <a href="${generateGoogleCalendarUrl(lesson)}" target="_blank" class="btn btn-secondary btn-sm btn-icon" title="Takvime Ekle">${icon('externalLink', 14)}</a>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Middle: Revenue and Stats -->
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div class="card glass-card hover-lift" style="border-top:none; border-bottom:4px solid var(--brand-green-light);">
            <div class="section-title">
              <h3 class="text-gradient">${icon('trendUp', 18)} Haftalık Performans</h3>
            </div>
            ${renderMiniChart(state)}
            <div style="margin-top:20px; padding:16px; background:var(--brand-green-soft); border-radius:12px; display:flex; align-items:center; gap:12px;">
              <div style="width:40px;height:40px;background:white;border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--brand-green);">
                ${icon('finance', 20)}
              </div>
              <div>
                <div style="font-size:11px;color:var(--text-muted);font-weight:700;text-transform:uppercase;">Tahmini Kazanç</div>
                <div style="font-size:20px;font-weight:800;color:var(--brand-green);">${formatCurrency(stats.income)}</div>
              </div>
            </div>
          </div>

          <!-- Motivational Quote Card -->
          <div class="card" style="background:var(--brand-green); color:white; border:none; position:relative; overflow:hidden;">
            <div style="position:absolute; top:-10px; right:-10px; opacity:0.1; transform:rotate(20deg);">
              ${icon('chat', 80)}
            </div>
            <div style="position:relative; z-index:1;">
               <div style="font-size:11px; text-transform:uppercase; font-weight:800; letter-spacing:1px; margin-bottom:12px; opacity:0.7;">Günün İlhamı</div>
               <p style="font-style:italic; font-size:15px; line-height:1.6; font-weight:500;">"${getRandomQuote()}"</p>
            </div>
          </div>
        </div>

        <!-- Right: Small Sections -->
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div class="card glass-card" style="padding:20px; border-top:none;">
            <div class="section-title" style="margin-bottom:12px;">
               <h3 style="font-size:14px;">${icon('students', 14)} Son Öğrenciler</h3>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
               ${state.students.slice(0, 3).map(s => `
                 <div class="person-card" style="padding:10px; border:1px solid var(--border); border-radius:10px; background:white;">
                   <div class="person-avatar" style="width:32px; height:32px; font-size:10px; background:${getAvatarColor(s.name)}">${getInitials(s.name)}</div>
                   <div style="flex:1;">
                     <div class="person-name" style="font-size:12px;">${s.name}</div>
                     <div class="person-sub" style="font-size:10px;">${s.grade}</div>
                   </div>
                 </div>
               `).join('')}
            </div>
          </div>

          <div class="card glass-card" style="padding:20px; border-top:none;">
            <div class="section-title" style="margin-bottom:12px;">
               <h3 style="font-size:14px;">${icon('groups', 14)} Aktif Gruplar</h3>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
               ${state.groups.slice(0, 3).map(g => `
                 <div class="person-card" style="padding:10px; border:1px solid var(--border); border-radius:10px; background:white;">
                   <div class="person-avatar" style="width:32px; height:32px; font-size:10px; background:rgba(124,106,255,0.1); color:var(--accent2);">
                     ${getInitials(g.name)}
                   </div>
                   <div style="flex:1;">
                     <div class="person-name" style="font-size:12px;">${g.name}</div>
                     <div class="person-sub" style="font-size:10px;">${g.grade}</div>
                   </div>
                 </div>
               `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return { html, init: (el, nav) => initDashboard(el, nav) };
}

function renderMiniChart(state) {
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
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
    <div style="display:flex; align-items:flex-end; gap:8px; height:120px; margin:16px 0; padding-bottom:8px; border-bottom:1px dashed var(--border);">
      ${weekIncome.map((val, i) => {
        const h = Math.max((val / max) * 100, val > 0 ? 10 : 4);
        return `
          <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:6px; height:100%; justify-content:flex-end;" title="${days[i]}: ${formatCurrency(val)}">
            <div class="hover-lift" style="width:100%; height:${h}%; background:${val > 0 ? 'linear-gradient(to top, var(--brand-green), var(--brand-green-light))' : 'var(--bg-secondary)'}; border-radius:6px; transition:all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></div>
            <div style="font-size:10px; color:var(--text-muted); font-weight:700;">${days[i]}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function initDashboard(el, navigate) {
  const state = getState();
  
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
