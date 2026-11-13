// ═══════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════
import { getState, subscribe, getTodayLessons, getPendingLessons, getMonthlyStats, getLessonStatus, completeLesson, postponeLesson, addNextWeekLesson } from '../store/store.js';
import { icon } from '../components/icons.js';
import { formatCurrency, formatDate, formatDateShort, formatTime, getLessonStatusInfo, getAvatarColor, getInitials, getLocalDateStr, escHtml } from '../utils/helpers.js';
import { openModal } from '../components/modal.js';
import { nextTopic, progressCounts, STATUS } from '../lib/progress.js';

// ─── Ana sayfa istatistik yardımcıları ───
const minutesOf = (l) => {
  const [sh, sm] = String(l.startTime || '0:0').split(':').map(Number);
  const [eh, em] = String(l.endTime || '0:0').split(':').map(Number);
  return Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
};
const fmtHours = (min) => {
  const h = Math.floor(min / 60), m = min % 60;
  return h && m ? `${h} sa ${m} dk` : h ? `${h} saat` : `${m} dk`;
};
const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
function relDay(dateStr, todayStr) {
  if (!dateStr) return '—';
  const d = daysBetween(todayStr, dateStr);
  if (d === 0) return 'bugün';
  if (d === 1) return 'yarın';
  if (d === -1) return 'dün';
  return d > 0 ? `${d} gün sonra` : `${-d} gün önce`;
}
function entityOf(state, lesson) {
  if (lesson.type === 'group') return state.groups.find(g => g.id === lesson.refId) || null;
  if (lesson.type === 'student') return state.students.find(x => x.id === lesson.refId) || null;
  return null;
}
/** Bir grubun/öğrencinin son yapılan ve sıradaki dersi */
function lessonTimeline(state, type, id, todayStr) {
  const mine = state.lessons.filter(l => l.type === type && l.refId === id && l.status !== 'passive');
  const last = mine.filter(l => l.status === 'completed' && l.date <= todayStr).sort((a, b) => b.date.localeCompare(a.date))[0] || null;
  const next = mine.filter(l => l.status === 'upcoming' && l.date >= todayStr).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))[0] || null;
  return { last, next };
}
function computeDashStats(state, today) {
  const todayStr = getLocalDateStr(today);
  const y = today.getFullYear(), m = today.getMonth();
  const monthPrefix = `${y}-${String(m + 1).padStart(2, '0')}`;
  const prev = new Date(y, m - 1, 1);
  const prevPrefix = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
  // geçen ayın aynı gününe kadarki gelir (adil karşılaştırma)
  const dayOfMonth = String(today.getDate()).padStart(2, '0');
  const income = (pref, uptoDay) => state.transactions
    .filter(t => t.type === 'income' && t.date?.startsWith(pref) && (!uptoDay || t.date.slice(8, 10) <= uptoDay))
    .reduce((a, t) => a + (Number(t.amount) || 0), 0);
  const incomeNow = income(monthPrefix);
  const incomePrevSamePeriod = income(prevPrefix, dayOfMonth);
  const incomeDelta = incomePrevSamePeriod > 0 ? Math.round(((incomeNow - incomePrevSamePeriod) / incomePrevSamePeriod) * 100) : null;

  // bu hafta (Pazartesi–Pazar)
  const ws = new Date(today); const wd = ws.getDay();
  ws.setDate(ws.getDate() - (wd === 0 ? 6 : wd - 1));
  const weekStart = getLocalDateStr(ws);
  const we = new Date(ws); we.setDate(ws.getDate() + 6);
  const weekEnd = getLocalDateStr(we);
  const weekLessons = state.lessons.filter(l => l.date >= weekStart && l.date <= weekEnd && l.status !== 'passive' && l.status !== 'postponed' && l.refId);
  const groupMinutesWeek = weekLessons.filter(l => l.type === 'group').reduce((a, l) => a + minutesOf(l), 0);
  const studentLessonsWeek = weekLessons.filter(l => l.type === 'student').length;
  const weekDone = weekLessons.filter(l => l.status === 'completed').length;

  // bu ay: bugüne kadar planlanan derslerin kaçı tamamlandı
  const monthDue = state.lessons.filter(l => l.date?.startsWith(monthPrefix) && l.date <= todayStr && l.refId && !['passive', 'postponed'].includes(l.status));
  const monthDone = monthDue.filter(l => l.status === 'completed').length;
  const completionRate = monthDue.length ? Math.round((monthDone / monthDue.length) * 100) : null;

  return { todayStr, incomeNow, incomeDelta, weekLessons, weekDone, groupMinutesWeek, studentLessonsWeek, monthDue: monthDue.length, completionRate };
}

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
    // Antik Yunan & Roma
    "Devletin temeli gençlerin eğitimidir. - Aristoteles",
    "Sadece eğitimli olanlar özgürdür. - Epiktetos",
    "Eğitimli bir zihin, düşünceleri kabul etmeden de onları anlayabilme yeteneğine sahiptir. - Aristoteles",
    "Bir insanın eğitimli olduğunun kanıtı, bir başkasının fikrine saygı göstermesidir. - Marcus Aurelius",
    "Eğitim bir meşaleyi yakmaktır, bir kabı doldurmak değil. - Sokrates",
    "Eğitimin kökleri acı, fakat meyveleri tatlıdır. - Aristo",

    // Antik Çin & Hint
    "Öğrenmek akıntıya karşı kürek çekmek gibidir, durduğunuz an geriye gidersiniz. - Çin Atasözü",
    "Bilgi sahibi olup da uygulamamak, hiç bilmemekle eşdeğerdir. - Konfüçyüs",
    "Bir yıllık refah için tahıl ek, on yıllık refah için ağaç dik, yüz yıllık refah için insan eğit. - Guanzi",
    "Bilgi, paylaşıldıkça çoğalan tek hazinedir. - Hint Atasözü",
    "Gerçek bilgelik, neyi bildiğini ve neyi bilmediğini bilmektir. - Konfüçyüs",

    // Antik Mısır & Mezopotamya
    "Bilgelik bir kuyu gibidir; her gün içilir ama asla bitmez. - Antik Mısır Atasözü",
    "Bilgi yoluyla özgürlüğe ulaşılır. - Antik Tablet Yazıtı",

    // Ortaçağ Doğu & Batı
    "İlim, amelsiz bir ağaç gibidir; meyvesi olmaz. - İbn-i Sina",
    "Cahilliğin tek ilacı eğitimdir. - Farabi",
    "İlim meclislerinde sükût etmek, bin rekat namazdan hayırlıdır. - İbn-i Sina",
    "Aklı olanın her şeye gücü yeter. - Yusuf Has Hacib",
    "Bilgi sevgisi, bilgeliğin başlangıcıdır. - Thomas Aquinas",

    // Modern Pedagoji & Düşünürler
    "Eğitim hayata hazırlık değil, hayatın kendisidir. - John Dewey",
    "Çocuk, insanlığın babasıdır. - Maria Montessori",
    "Eğitimin asıl amacı, karakteri şekillendirmektir. - Herbert Spencer",
    "Dünyayı değiştirmek için kullanabileceğiniz en güçlü silah eğitimdir. - Nelson Mandela",
    "Öğretmek, iki kez öğrenmektir. - Joseph Joubert",
    "Bana bir harf öğretenin kırk yıl kölesi olurum. - Hz. Ali"
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

let dashWeekOffset = 0;

export async function renderDashboard(navigate) {
  dashWeekOffset = 0;
  const state = getState();
  const today = new Date();
  const dateStr = today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  const todayLessons = await getTodayLessons();
  const pendingLessons = await getPendingLessons();
  const stats = getMonthlyStats();
  
  const todayDateStr = getLocalDateStr(today);
  const pastPendingLessons = pendingLessons.filter(l => l.date < todayDateStr);
  const combinedLessons = [...pastPendingLessons, ...todayLessons];

  const ds = computeDashStats(state, today);
  const nextUp = todayLessons.find(l => getLessonStatus(l) === 'upcoming') || null;
  const nextUpIn = nextUp ? Math.max(0, Math.round((new Date(`${nextUp.date}T${nextUp.startTime}:00`) - today) / 60000)) : null;

  const completedThisMonth = state.lessons.filter(l => {
    const m = new Date().getMonth();
    const y = new Date().getFullYear();
    return l.date?.startsWith(`${y}-${String(m + 1).padStart(2, '0')}`) && l.status === 'completed';
  }).length;

  // Tomorrow's lessons
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowDateStr = getLocalDateStr(tomorrow);
  const tomorrowLessons = state.lessons.filter(l => l.date === tomorrowDateStr && l.status !== 'passive');

  // Recent income transactions
  const recentTransactions = state.transactions
    .filter(t => t.type === 'income')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  // Recent homework checklists
  const recentHomeworks = state.students
    .flatMap(s => (s.homework || []).map(hw => ({ ...hw, studentName: s.name })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

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
          <p style="font-size:18px; opacity:0.9; margin-top:8px;" id="dashboard-lesson-count">
            Bugün ajandanızda <strong style="color:white;">${todayLessons.length} ders</strong> planlanmış, <strong style="color:white;">${todayLessons.filter(l => l.status === 'upcoming').length} ders</strong> kalmış görünüyor.
          </p>
          ${nextUp ? `
            <div data-lesson-id="${nextUp.id}" style="margin-top:16px; display:inline-flex; align-items:center; gap:10px; background:rgba(255,255,255,0.16); border:1px solid rgba(255,255,255,0.25); padding:10px 14px; border-radius:14px; cursor:pointer;">
              ${icon('clock', 16)}
              <span style="font-size:14px;">Sıradaki ders <strong>${nextUp.startTime}</strong> · ${escHtml(nextUp.refName || nextUp.title || '')}
                <span style="opacity:0.8;">(${nextUpIn < 60 ? `${nextUpIn} dk sonra` : `${Math.floor(nextUpIn / 60)} sa ${nextUpIn % 60} dk sonra`})</span>
              </span>
            </div>
          ` : ''}
          <button class="btn btn-primary" id="btn-add-lesson-banner" style="margin-top:24px; background:white; color:var(--brand-green); border:none; font-weight:700; padding:12px 24px; border-radius:12px; display:flex; align-items:center; gap:8px; box-shadow: 0 10px 20px rgba(0,0,0,0.15);">
            ${icon('plus', 18)} Yeni Ders Ekle
          </button>
        </div>
        
        <div class="banner-quote-container" style="max-width: 450px;">
           <div style="font-size:11px; text-transform:uppercase; font-weight:800; letter-spacing:1px; margin-bottom:12px; opacity:0.7;">
             Günün İlhamı
           </div>
           <p style="font-style:italic; font-size:15px; line-height:1.6; font-weight:500; margin:0;">
             "${getRandomQuote()}"
           </p>
        </div>
      </div>

      <!-- Bento Grid KPIs -->
      <div class="grid grid-5 fade-in-up stagger-2" style="margin-bottom:32px;">
        <div class="kpi-card hover-lift" id="kpi-income" style="cursor:pointer;">
          <div class="kpi-icon" style="background:rgba(16,185,129,0.1); color:var(--success);">
            ${icon('trendUp', 24)}
          </div>
          <div>
            <div class="kpi-value">${formatCurrency(stats.income)}</div>
            <div class="kpi-label">Bu Ay Toplam</div>
            <div style="font-size:10px; color:${ds.incomeDelta == null ? 'var(--text-muted)' : ds.incomeDelta >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight:700; margin-top:4px;">${ds.incomeDelta == null ? 'Geçen ay aynı dönemde kayıt yok' : `${ds.incomeDelta >= 0 ? '▲' : '▼'} Geçen ayın aynı dönemine göre ${ds.incomeDelta >= 0 ? '+' : ''}${ds.incomeDelta}%`}</div>
          </div>
        </div>
        
        <div class="kpi-card hover-lift" id="kpi-students" style="cursor:pointer;">
          <div class="kpi-icon" style="background:rgba(124,106,255,0.1); color:var(--accent2 || '#7c3aed');">
            ${icon('students', 24)}
          </div>
          <div>
            <div class="kpi-value">${state.students.filter(s => (s.status || 'active') === 'active').length}</div>
            <div class="kpi-label">Aktif Öğrenci</div>
            <div style="font-size:10px; color:var(--text-muted); font-weight:600; margin-top:4px;">Bu hafta ${ds.studentLessonsWeek} özel ders</div>
          </div>
        </div>

        <div class="kpi-card hover-lift" id="kpi-groups" style="cursor:pointer;">
          <div class="kpi-icon" style="background:rgba(124,106,255,0.1); color:var(--accent2 || '#7c3aed');">
            ${icon('groups', 24)}
          </div>
          <div>
            <div class="kpi-value">${state.groups.filter(g => (g.status || 'active') === 'active').length}</div>
            <div class="kpi-label">Aktif Grup</div>
            <div style="font-size:10px; color:var(--text-muted); font-weight:600; margin-top:4px;">Bu hafta ${ds.groupMinutesWeek ? fmtHours(ds.groupMinutesWeek) : 'grup dersi yok'}${ds.groupMinutesWeek ? ' grup dersi' : ''}</div>
          </div>
        </div>

        <div class="kpi-card hover-lift" id="kpi-completed" style="cursor:pointer;">
          <div class="kpi-icon" style="background:rgba(245,158,11,0.1); color:var(--warning);">
            ${icon('checkCircle', 24)}
          </div>
          <div>
            <div class="kpi-value">${completedThisMonth}</div>
            <div class="kpi-label">Bu Ay Tamamlanan</div>
            <div style="font-size:10px; color:${ds.completionRate == null ? 'var(--text-muted)' : ds.completionRate >= 85 ? 'var(--success)' : 'var(--warning)'}; font-weight:700; margin-top:4px;">${ds.completionRate == null ? 'Bu ay henüz ders yok' : `Bu ayki ${ds.monthDue} dersin %${ds.completionRate}'i`}</div>
          </div>
        </div>

        <div class="kpi-card hover-lift" id="kpi-pending" style="cursor:pointer; ${pendingLessons.length > 0 ? 'border-left-color:var(--danger);' : ''}">
          <div class="kpi-icon" style="background:rgba(239,68,68,0.1); color:var(--danger);">
            ${icon('clock', 24)}
          </div>
          <div>
            <div class="kpi-value">${pendingLessons.length}</div>
            <div class="kpi-label">Onay Bekleyen</div>
            <div style="font-size:10px; color:${pendingLessons.length > 0 ? 'var(--danger)' : 'var(--text-muted)'}; font-weight:700; margin-top:4px;">
              ${pendingLessons.length > 0 ? 'İnceleme bekliyor' : 'Tümü onaylandı'}
            </div>
          </div>
        </div>
      </div>

      <!-- Parse layout from localStorage with dynamic fallback -->
      ${(() => {
        let layout = [['agenda'], ['progress', 'performance', 'transactions'], ['students', 'groups', 'homework']];
        try {
          const saved = localStorage.getItem('dashboard_layout');
          if (saved) {
            layout = JSON.parse(saved);
          }
        } catch (e) {
          console.error('Failed to parse dashboard layout from localStorage', e);
        }

        if (!Array.isArray(layout) || layout.length !== 3) {
          layout = [['agenda'], ['progress', 'performance', 'transactions'], ['students', 'groups', 'homework']];
        }
        // yeni eklenen "Konu İlerlemesi" kartı, kayıtlı eski düzenlerde orta sütunun başına gelsin
        if (!layout.flat().includes('progress')) layout[1] = ['progress', ...(layout[1] || [])];

        const allWidgets = ['agenda', 'progress', 'performance', 'transactions', 'students', 'groups', 'homework'];
        const flattened = layout.flat();
        const missing = allWidgets.filter(w => !flattened.includes(w));
        if (missing.length > 0) {
          layout[2] = [...(layout[2] || []), ...missing];
        }

        const widgetBuilders = {
          agenda: () => renderAgendaWidget(combinedLessons, todayDateStr, tomorrowLessons, state),
          progress: () => renderProgressWidget(state),
          performance: () => renderPerformanceWidget(state, dashWeekOffset),
          transactions: () => renderTransactionsWidget(recentTransactions),
          students: () => renderStudentsWidget(state, ds.todayStr),
          groups: () => renderGroupsWidget(state, ds.todayStr),
          homework: () => renderHomeworkWidget(recentHomeworks),
        };

        const colHtmls = layout.map((colWidgets, colIdx) => {
          const widgetsHtml = colWidgets
            .map(wId => widgetBuilders[wId] ? widgetBuilders[wId]() : '')
            .join('');
          
          let minHeight = '200px';
          if (colIdx === 0) minHeight = '400px';
          
          return `
            <div class="dashboard-col" data-col-index="${colIdx}" style="display:flex; flex-direction:column; gap:16px; min-height:${minHeight};">
              ${widgetsHtml}
            </div>
          `;
        });

        return `
          <div class="grid grid-3 fade-in-up stagger-3" id="dashboard-grid-container" style="align-items:start; grid-template-columns: 1.2fr 1fr 0.8fr;">
            ${colHtmls[0]}
            ${colHtmls[1]}
            ${colHtmls[2]}
          </div>
        `;
      })()}
    </div>
  `;

  return { html, init: (el, nav) => initDashboard(el, nav) };
}

function renderMiniChart(state, weekOffset = 0) {
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const now = new Date();
  
  const startOfWeek = new Date(now);
  const currentDay = startOfWeek.getDay();
  const diffStart = startOfWeek.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  startOfWeek.setDate(diffStart + weekOffset * 7);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const dateRangeStr = `${startOfWeek.getDate()} ${startOfWeek.toLocaleString('tr-TR', {month:'short'})} - ${endOfWeek.getDate()} ${endOfWeek.toLocaleString('tr-TR', {month:'short'})}`;

  const weekIncome = days.map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dStr = getLocalDateStr(d);
    return state.transactions
      .filter(t => t.date === dStr && t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
  });
  
  const max = Math.max(...weekIncome, 1);
  const weeklyTotal = weekIncome.reduce((a,b) => a+b, 0);

  return `
    <div style="font-size:12px; color:var(--text-muted); font-weight:600; margin-bottom:8px;">${dateRangeStr}</div>
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
    <div style="margin-top:20px; padding:16px; background:var(--brand-green-soft); border-radius:12px; display:flex; align-items:center; gap:12px;">
      <div style="width:40px;height:40px;background:white;border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--brand-green);">
        ${icon('finance', 20)}
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-muted);font-weight:700;text-transform:uppercase;">Seçili Hafta Kazancı</div>
        <div style="font-size:20px;font-weight:800;color:var(--brand-green);">${formatCurrency(weeklyTotal)}</div>
      </div>
    </div>
  `;
}

function initDashboard(el, navigate) {
  const state = getState();
  
  // Pending lessons
  el.querySelector('#show-pending-btn')?.addEventListener('click', () => {
    openPendingModal(navigate);
  });

  // Add lesson (Banner)
  el.querySelector('#btn-add-lesson-banner')?.addEventListener('click', () => {
    import('./modals/AddLessonModal.js').then(m => m.openAddLessonModal(() => navigate('dashboard')));
  });

  // State subscription for live updates
  const unsubscribe = subscribe(async () => {
    if (document.getElementById('app')._currentPage !== 'dashboard') {
      unsubscribe();
      return;
    }
    
    const todayLessons = await getTodayLessons();
    const pendingLessons = await getPendingLessons();
    const remainingCount = todayLessons.filter(l => l.status === 'upcoming').length;
    
    const countEl = el.querySelector('#dashboard-lesson-count');
    if (countEl) {
      countEl.innerHTML = `Bugün ajandanızda <strong style="color:white;">${todayLessons.length} ders</strong> planlanmış, <strong style="color:white;">${remainingCount} ders</strong> kalmış görünüyor.`;
    }

    // Dynamic Pending Alert
    let alertContainer = el.querySelector('.pending-alert');
    if (pendingLessons.length > 0) {
      const alertHtml = `
        <div style="display:flex;align-items:center;gap:8px;">
          <div class="status-pulse-ring" style="background:var(--warning);width:8px;height:8px;border-radius:50%;"></div>
          <span class="pending-alert-text" style="font-weight:700;">${pendingLessons.length} ders onayınızı bekliyor!</span>
        </div>
        <button class="btn btn-warning btn-sm" id="show-pending-btn">Şimdi İncele</button>
      `;
      if (alertContainer) {
        alertContainer.innerHTML = alertHtml;
        alertContainer.style.display = 'flex';
      } else {
        // Prepend to the first card or at the top of fade-in div
        const newAlert = document.createElement('div');
        newAlert.className = 'pending-alert fade-in-up';
        newAlert.innerHTML = alertHtml;
        el.querySelector('.fade-in').prepend(newAlert);
        alertContainer = newAlert;
      }
      alertContainer.querySelector('#show-pending-btn')?.addEventListener('click', () => {
        openPendingModal(navigate);
      });
    } else if (alertContainer) {
      alertContainer.style.display = 'none';
    }
  });

  // Lesson Card Click
  el.querySelectorAll('[data-lesson-id]').forEach(card => {
    card.addEventListener('click', () => {
      const lessonId = card.dataset.lessonId;
      openLessonEvalModal(lessonId, navigate);
    });
    card.style.cursor = 'pointer';
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

  // Grup/öğrenci ayrıntısı
  el.querySelectorAll('[data-open-group]').forEach(n => n.addEventListener('click', () => {
    import('./modals/GroupDetailModal.js').then(m => m.openGroupDetail(n.dataset.openGroup, navigate));
  }));
  el.querySelectorAll('[data-open-student]').forEach(n => n.addEventListener('click', () => {
    import('./modals/StudentDetailModal.js').then(m => m.openStudentDetail(n.dataset.openStudent, navigate));
  }));

  // Performance card click
  el.querySelector('#dash-perf-title')?.addEventListener('click', () => {
    import('./modals/WeeklyPerformanceModal.js').then(m => m.openWeeklyPerformanceModal());
  });
  el.querySelector('#dashboard-mini-chart-container')?.addEventListener('click', () => {
    import('./modals/WeeklyPerformanceModal.js').then(m => m.openWeeklyPerformanceModal());
  });

  const updateChart = () => {
    const container = el.querySelector('#dashboard-mini-chart-container');
    if (container) {
      container.innerHTML = renderMiniChart(getState(), dashWeekOffset);
      const nextBtn = el.querySelector('#dash-next-week');
      if (nextBtn) {
        if (dashWeekOffset >= 0) {
          nextBtn.style.opacity = '0.5';
          nextBtn.style.pointerEvents = 'none';
        } else {
          nextBtn.style.opacity = '1';
          nextBtn.style.pointerEvents = 'auto';
        }
      }
    }
  };

  el.querySelector('#dash-prev-week')?.addEventListener('click', (e) => {
    e.stopPropagation();
    dashWeekOffset--;
    updateChart();
  });

  el.querySelector('#dash-next-week')?.addEventListener('click', (e) => {
    e.stopPropagation();
    dashWeekOffset++;
    updateChart();
  });

  updateChart();

  // KPI Cards clicks
  const openStats = (type) => import('./modals/DashboardStatsModal.js').then(m => m.openDashboardStatsModal(type));
  
  el.querySelector('#kpi-income')?.addEventListener('click', () => openStats('income'));
  el.querySelector('#kpi-students')?.addEventListener('click', () => openStats('students'));
  el.querySelector('#kpi-groups')?.addEventListener('click', () => openStats('groups'));
  el.querySelector('#kpi-completed')?.addEventListener('click', () => openStats('completed'));
  el.querySelector('#kpi-pending')?.addEventListener('click', () => openStats('pending'));

  // Global helper for modal clicks if needed
  window._openLessonEval = (id) => openLessonEvalModal(id, navigate);

  // Season Review
  el.querySelector('#show-season-review-btn')?.addEventListener('click', () => {
    import('./modals/SeasonReviewModal.js').then(m => m.openSeasonReviewModal());
  });

  // Drag & drop initialization
  initWidgetDragAndDrop(el);
}

async function openPendingModal(navigate) {
  const pending = await getPendingLessons();
  import('../components/modal.js').then(m => m.openModal({
    title: 'Onay Bekleyen Dersler',
    body: renderPendingLessons(pending, navigate),
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

function renderPendingLessons(pending, navigate) {
  if (pending.length === 0) {
    return `<div class="empty-state" style="padding:40px;">Onay bekleyen ders bulunmuyor.</div>`;
  }
  
  return `
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${pending.map(lesson => {
        const displayTitle = lesson.refName ? `${lesson.refName}${lesson.title ? ' - ' + lesson.title : ''}` : lesson.title;
        return `
          <div class="card card-sm" style="display:flex;align-items:center;justify-content:space-between;border-left:4px solid var(--warning);">
            <div>
              <div style="font-weight:700;font-size:14px;color:var(--text-primary);">${escHtml(displayTitle)}</div>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">
                ${lesson.date} • ${lesson.startTime} - ${lesson.endTime}
              </div>
            </div>
            <button class="btn btn-success btn-sm" data-complete-lesson-modal="${lesson.id}">
              ✓ Onayla
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function openLessonEvalModal(lessonId, navigate) {
  import('./modals/LessonEvalModal.js').then(m => m.openLessonEvalModal(lessonId, navigate));
}

// ═══════════════════════════════════════════════════
// WIDGET RENDERERS & DRAG-AND-DROP HELPERS
// ═══════════════════════════════════════════════════

function topicLine(state, lesson) {
  const ent = entityOf(state, lesson);
  if (!ent) return '';
  const nt = nextTopic(state, ent);
  if (!nt) return '';
  const partial = nt.s === 'partial';
  return `<div style="font-size:12px; margin-top:4px; color:${partial ? STATUS.partial.color : 'var(--brand-green-light)'}; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escHtml(nt.unitName)} › ${escHtml(nt.name)}">
    ${partial ? '◐ Devam' : '→ Sıradaki'}: ${escHtml(nt.name)}${partial && nt.note ? ` <span style="color:var(--text-muted); font-weight:500;">(${escHtml(nt.note)})</span>` : ''}
  </div>`;
}

function renderAgendaWidget(combinedLessons, todayDateStr, tomorrowLessons, state) {
  return `
    <div class="dashboard-widget" data-widget-id="agenda" style="width: 100%;">
      <div class="card glass-card hover-lift" style="min-height:400px; border-top:none; border-bottom:4px solid var(--brand-green);">
        <div class="section-title">
          <h3 class="text-gradient">${icon('calendar', 18)} Ajanda: Bugün</h3>
          <div style="display:flex; gap:8px;">
            <a data-nav="calendar" style="background:var(--brand-green-soft); color:var(--brand-green); padding:5px 12px; border-radius:20px; font-size:12px; cursor:pointer;">Tümü →</a>
          </div>
        </div>
        <div style="margin-top:16px;">
          ${combinedLessons.length === 0 ? `
            <div class="empty-state" style="padding:60px 20px; opacity:0.6;">
              ${icon('calendar', 48)}
              <p style="margin-top:12px; font-weight:600;">Bugün için planlanmış veya onay bekleyen bir kayıt bulunmuyor.</p>
            </div>
          ` : combinedLessons.map(lesson => {
            const status = getLessonStatus(lesson);
            const si = getLessonStatusInfo(status);
            
            const borderColor = si.badgeClass.includes('success') ? 'var(--success)' : si.badgeClass.includes('warning') ? 'var(--warning)' : 'var(--border)';
            
            const badgeLabel = si.label;
            const badgeClass = si.badgeClass;
            const displayTitle = lesson.refName ? `${lesson.refName} ${lesson.title ? ' - ' + lesson.title : ''}` : lesson.title;
            const isPast = lesson.date < todayDateStr;

            return `
              <div class="card card-sm hover-lift" style="margin-bottom:12px; border-left:4px solid ${borderColor}; background:rgba(255,255,255,0.5); padding: 12px 16px;" data-lesson-id="${lesson.id}">
                <div style="display:flex;align-items:center;gap:12px;">
                  ${lesson.refId ? `
                    <div class="avatar" style="width:36px; height:36px; font-size:12px; background:${getAvatarColor(lesson.refName)}">
                      ${getInitials(lesson.refName)}
                    </div>
                  ` : ''}
                  <div style="flex:1;">
                    <div style="font-weight:700;font-size:15px;color:var(--text-primary);">
                      ${isPast ? `<span style="font-size:10px; padding:2px 6px; background:var(--danger); color:white; border-radius:4px; margin-right:6px; vertical-align:middle;">Önceki Gün</span>` : ''}
                      <span style="vertical-align:middle;">${escHtml(displayTitle)}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:4px; font-size:12px; color:var(--text-muted); margin-top:4px;">
                      ${icon('clock', 12)} ${isPast ? formatDateShort(lesson.date) + ' • ' : ''}${lesson.startTime} – ${lesson.endTime}
                    </div>
                    ${status === 'completed' ? '' : topicLine(state, lesson)}
                  </div>
                  <div style="text-align:right;">
                    <span class="badge ${badgeClass}" style="border-radius:20px; font-size:10px;">${badgeLabel}</span>
                      <div style="margin-top:8px; display:flex; gap:6px; justify-content:flex-end;">
                        ${(status === 'waiting' || status === 'ongoing') ? `
                          <button class="btn btn-success btn-sm btn-icon" data-complete-lesson="${lesson.id}" title="Tamamla">${icon('check', 14)}</button>
                        ` : ''}
                      </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Tomorrow's Lessons Section -->
        <div style="margin-top:24px; border-top: 1px dashed var(--border); padding-top:20px;">
          <div class="section-title" style="margin-bottom:12px;">
            <h3 style="font-size:14px; color:var(--text-secondary);">${icon('calendar', 14)} Ajanda: Yarın</h3>
          </div>
          ${tomorrowLessons.length === 0 ? `
            <p style="font-size:13px; color:var(--text-muted); font-style:italic;">Yarın için planlanmış bir dersiniz bulunmuyor.</p>
          ` : tomorrowLessons.map(lesson => {
            const displayTitle = lesson.refName ? `${lesson.refName} ${lesson.title ? ' - ' + lesson.title : ''}` : lesson.title;
            return `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:rgba(255,255,255,0.3); border-radius:8px; margin-bottom:6px; border:1px solid var(--border);">
                <div style="min-width:0; flex:1;">
                  <div style="font-size:13px; font-weight:700; color:var(--text-primary);">${escHtml(displayTitle)}</div>
                  ${topicLine(state, lesson)}
                </div>
                <div style="font-size:12px; color:var(--text-muted); font-weight:600; margin-left:8px;">${lesson.startTime}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderPerformanceWidget(state, dashWeekOffset) {
  return `
    <div class="dashboard-widget" data-widget-id="performance" style="width: 100%;">
      <div class="card glass-card" id="performance-card-wrapper" style="border-top:none; border-bottom:4px solid var(--brand-green-light);">
        <div class="section-title" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h3 class="text-gradient" style="cursor:pointer;" id="dash-perf-title">${icon('trendUp', 18)} Haftalık Performans</h3>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-icon btn-sm" id="dash-prev-week" style="background:var(--brand-green-soft); color:var(--brand-green); border-radius:50%;">${icon('chevronLeft', 14)}</button>
            <button class="btn btn-icon btn-sm" id="dash-next-week" style="background:var(--brand-green-soft); color:var(--brand-green); border-radius:50%;">${icon('chevronRight', 14)}</button>
          </div>
        </div>
        <div id="dashboard-mini-chart-container" style="cursor:pointer;">
          ${renderMiniChart(state, dashWeekOffset)}
        </div>
      </div>
    </div>
  `;
}

function renderTransactionsWidget(recentTransactions) {
  return `
    <div class="dashboard-widget" data-widget-id="transactions" style="width: 100%;">
      <div class="card glass-card" style="border-top:none; padding:20px; border-bottom:4px solid var(--success);">
        <div class="section-title" style="margin-bottom:12px;">
          <h3 style="font-size:14px; color:var(--success);">${icon('creditCard', 14)} Son Tahsilatlar</h3>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${recentTransactions.length === 0 ? `
            <p style="font-size:13px; color:var(--text-muted); font-style:italic;">Henüz tahsilat kaydı bulunmuyor.</p>
          ` : recentTransactions.map(t => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:white; border-radius:10px; border:1px solid var(--border);">
              <div>
                <div style="font-size:12px; font-weight:700; color:var(--text-primary);">${escHtml(t.description)}</div>
                <div style="font-size:10px; color:var(--text-muted); font-weight:600; margin-top:2px;">${formatDateShort(t.date)}</div>
              </div>
              <div style="font-size:13px; font-weight:800; color:var(--success);">${formatCurrency(t.amount)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// Grup/öğrenci müfredat ilerlemesi: en az ilerleyen üstte
function renderProgressWidget(state) {
  const rows = [
    ...state.groups.filter(g => (g.status || 'active') === 'active').map(g => ({ type: 'group', e: g })),
    ...state.students.filter(x => (x.status || 'active') === 'active').map(x => ({ type: 'student', e: x })),
  ].map(r => ({ ...r, c: progressCounts(state, r.e), nt: nextTopic(state, r.e) }))
    .filter(r => r.c.total > 0)
    .sort((a, b) => a.c.pct - b.c.pct);
  const shown = rows.slice(0, 6);
  return `
    <div class="dashboard-widget" data-widget-id="progress" style="width: 100%;">
      <div class="card glass-card" style="border-top:none; padding:20px; border-bottom:4px solid var(--brand-green);">
        <div class="section-title" style="margin-bottom:12px;">
          <h3 class="text-gradient" style="font-size:16px;">${icon('layers', 16)} Konu İlerlemesi</h3>
          <a data-nav="tracking" style="background:var(--brand-green-soft); color:var(--brand-green); padding:5px 12px; border-radius:20px; font-size:12px; cursor:pointer;">Takip →</a>
        </div>
        ${shown.length === 0 ? `<p style="font-size:13px; color:var(--text-muted); font-style:italic;">Müfredatı tanımlı aktif grup ya da öğrenci yok.</p>` : `
        <div style="display:flex; flex-direction:column; gap:12px;">
          ${shown.map(r => `
            <div data-open-${r.type}="${r.e.id}" class="list-item-hover" style="cursor:pointer; padding:8px; border-radius:10px;">
              <div style="display:flex; justify-content:space-between; align-items:baseline; gap:8px;">
                <div style="font-size:13px; font-weight:700; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${escHtml(r.e.name)} <span style="font-size:10px; font-weight:700; color:var(--text-muted);">${r.type === 'group' ? 'GRUP' : 'ÖĞRENCİ'}</span>
                </div>
                <div style="font-size:12px; font-weight:800; color:var(--brand-green); white-space:nowrap;">${r.c.done}/${r.c.total} · %${r.c.pct}</div>
              </div>
              <div style="height:8px; background:var(--bg-secondary); border-radius:6px; overflow:hidden; margin:6px 0 4px; display:flex;">
                <div style="width:${r.c.total ? (r.c.done / r.c.total) * 100 : 0}%; background:${STATUS.done.color};"></div>
                <div style="width:${r.c.total ? (r.c.partial / r.c.total) * 100 : 0}%; background:${STATUS.partial.color};"></div>
              </div>
              <div style="font-size:11px; color:${r.nt?.s === 'partial' ? STATUS.partial.color : 'var(--text-muted)'}; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${r.nt ? `${r.nt.s === 'partial' ? '◐ Devam' : '→ Sıradaki'}: ${escHtml(r.nt.name)}` : '✓ Müfredat tamamlandı'}
              </div>
            </div>
          `).join('')}
          ${rows.length > shown.length ? `<div style="text-align:center; font-size:11px; color:var(--text-muted);">+${rows.length - shown.length} daha — tümü Takip sayfasında</div>` : ''}
        </div>`}
      </div>
    </div>
  `;
}

// Öğrenci/grup kartı: son ders ve sıradaki ders; uzun süredir ders yapılmayanlar uyarılı
function personRow(state, type, e, todayStr) {
  const { last, next } = lessonTimeline(state, type, e.id, todayStr);
  const idle = last ? daysBetween(last.date, todayStr) : null;
  const warn = !next && (idle == null || idle >= 14);
  return `
    <div class="person-card" data-open-${type}="${e.id}" style="padding:10px; border:1px solid ${warn ? 'rgba(245,158,11,0.5)' : 'var(--border)'}; border-radius:10px; background:white; cursor:pointer;">
      <div class="person-avatar" style="width:32px; height:32px; font-size:10px; ${type === 'group' ? 'background:rgba(124,106,255,0.1); color:var(--accent2);' : `background:${getAvatarColor(e.name)};`}">${getInitials(e.name)}</div>
      <div style="flex:1; min-width:0;">
        <div class="person-name" style="font-size:12px;">${escHtml(e.name)}</div>
        <div class="person-sub" style="font-size:10px;">
          ${next ? `Sıradaki: ${relDay(next.date, todayStr)} ${next.startTime}` : '<span style="color:var(--warning); font-weight:700;">Planlı ders yok</span>'}
          ${last ? ` · Son: ${relDay(last.date, todayStr)}` : ''}
        </div>
      </div>
    </div>`;
}
function sortPeople(state, type, list, todayStr) {
  // önce planlı dersi olmayanlar (dikkat), sonra en yakın dersi olanlar
  return list.map(e => ({ e, t: lessonTimeline(state, type, e.id, todayStr) }))
    .sort((a, b) => (!!a.t.next - !!b.t.next) || ((a.t.next?.date || '') + (a.t.next?.startTime || '')).localeCompare((b.t.next?.date || '') + (b.t.next?.startTime || '')))
    .map(x => x.e);
}

function renderStudentsWidget(state, todayStr) {
  const active = state.students.filter(x => (x.status || 'active') === 'active');
  const list = sortPeople(state, 'student', active, todayStr);
  return `
    <div class="dashboard-widget" data-widget-id="students" style="width: 100%;">
      <div class="card glass-card" style="padding:20px; border-top:none;">
        <div class="section-title" style="margin-bottom:12px;">
           <h3 style="font-size:14px;">${icon('students', 14)} Öğrenciler</h3>
           <a data-nav="studentsAndGroups" style="font-size:12px; color:var(--brand-green); cursor:pointer;">Tümü →</a>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
           ${list.length === 0 ? '<p style="font-size:13px; color:var(--text-muted); font-style:italic;">Aktif öğrenci yok.</p>' : list.slice(0, 4).map(e => personRow(state, 'student', e, todayStr)).join('')}
           ${list.length > 4 ? `<div style="text-align:center; font-size:11px; color:var(--text-muted);">+${list.length - 4} öğrenci daha</div>` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderGroupsWidget(state, todayStr) {
  const active = state.groups.filter(g => (g.status || 'active') === 'active');
  const list = sortPeople(state, 'group', active, todayStr);
  return `
    <div class="dashboard-widget" data-widget-id="groups" style="width: 100%;">
      <div class="card glass-card" style="padding:20px; border-top:none;">
        <div class="section-title" style="margin-bottom:12px;">
           <h3 style="font-size:14px;">${icon('groups', 14)} Aktif Gruplar</h3>
           <a data-nav="studentsAndGroups" style="font-size:12px; color:var(--brand-green); cursor:pointer;">Tümü →</a>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
           ${list.length === 0 ? '<p style="font-size:13px; color:var(--text-muted); font-style:italic;">Aktif grup yok.</p>' : list.slice(0, 4).map(e => personRow(state, 'group', e, todayStr)).join('')}
           ${list.length > 4 ? `<div style="text-align:center; font-size:11px; color:var(--text-muted);">+${list.length - 4} grup daha</div>` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderHomeworkWidget(recentHomeworks) {
  const state = getState();
  const assignments = state.assignments || [];
  const pending = assignments.filter(a => a.status === 'pending');
  
  return `
    <div class="dashboard-widget" data-widget-id="homework" style="width: 100%;">
      <div class="card glass-card hover-lift" style="padding:20px; border-top:none; border-bottom:4px solid var(--warning); cursor:pointer;" onclick="document.querySelector('[data-nav=\'assignments\']')?.click()">
        <div class="section-title" style="margin-bottom:12px;">
           <h3 style="font-size:14px; color:var(--warning);">${icon('book', 14)} Ödev Hatırlatmaları</h3>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
           ${pending.length === 0 ? `
             <p style="font-size:13px; color:var(--text-muted); font-style:italic;">Hatırlatma bulunmuyor.</p>
           ` : pending.slice(0, 3).map(a => {
             let entityName = 'Bilinmiyor';
             if (a.type === 'student') entityName = state.students.find(x => x.id === a.refId)?.name || 'Bilinmiyor';
             if (a.type === 'group') entityName = state.groups.find(x => x.id === a.refId)?.name || 'Bilinmiyor';
             return `
             <div style="padding:10px; border:1px solid var(--border); border-radius:10px; background:white; display:flex; flex-direction:column; gap:4px;">
               <div style="display:flex; justify-content:space-between; align-items:center;">
                 <span style="font-size:11px; font-weight:800; color:var(--brand-green);">${escHtml(entityName)}</span>
                 <span style="font-size:10px; color:var(--text-muted); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:80px;">${escHtml(a.unit || '')}</span>
               </div>
               <div style="font-size:12px; font-weight:600; color:var(--warning);">Ödev verilmesi bekleniyor</div>
             </div>
             `;
           }).join('')}
           ${pending.length > 3 ? `<div style="text-align:center; font-size:11px; color:var(--text-muted); margin-top:4px;">+${pending.length - 3} hatırlatma daha</div>` : ''}
        </div>
      </div>
    </div>
  `;
}

function initWidgetDragAndDrop(el) {
  const columns = el.querySelectorAll('.dashboard-col');
  const widgets = el.querySelectorAll('.dashboard-widget');
  
  let longPressTimeout = null;
  let dragReadyWidget = null;
  
  const clearLongPress = () => {
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      longPressTimeout = null;
    }
  };
  
  widgets.forEach(widget => {
    widget.setAttribute('draggable', 'false');
    
    const startPress = (e) => {
      if (e.type === 'mousedown' && e.button !== 0) return;
      
      const target = e.target;
      if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('select') || target.closest('textarea')) {
        return;
      }
      
      clearLongPress();
      dragReadyWidget = widget;
      
      longPressTimeout = setTimeout(() => {
        el.querySelectorAll('.widget-drag-ready').forEach(w => {
          w.classList.remove('widget-drag-ready');
          w.setAttribute('draggable', 'false');
        });
        
        widget.classList.add('widget-drag-ready');
        widget.setAttribute('draggable', 'true');
        
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 600);
    };
    
    const cancelPress = () => {
      clearLongPress();
    };
    
    widget.addEventListener('mousedown', startPress);
    widget.addEventListener('touchstart', startPress, { passive: true });
    
    let startX = 0, startY = 0;
    widget.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      startY = e.clientY;
    });
    widget.addEventListener('mousemove', (e) => {
      if (longPressTimeout) {
        const diffX = Math.abs(e.clientX - startX);
        const diffY = Math.abs(e.clientY - startY);
        if (diffX > 5 || diffY > 5) {
          cancelPress();
        }
      }
    });
    
    widget.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    }, { passive: true });
    widget.addEventListener('touchmove', (e) => {
      if (longPressTimeout) {
        const touch = e.touches[0];
        const diffX = Math.abs(touch.clientX - startX);
        const diffY = Math.abs(touch.clientY - startY);
        if (diffX > 10 || diffY > 10) {
          cancelPress();
        }
      }
    }, { passive: true });
    
    window.addEventListener('mouseup', cancelPress);
    window.addEventListener('touchend', cancelPress);
    window.addEventListener('touchcancel', cancelPress);
    
    widget.addEventListener('dragstart', (e) => {
      if (!widget.classList.contains('widget-drag-ready')) {
        e.preventDefault();
        return;
      }
      widget.classList.add('widget-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', widget.dataset.widgetId);
    });
    
    widget.addEventListener('dragend', () => {
      widget.classList.remove('widget-dragging');
      widget.classList.remove('widget-drag-ready');
      widget.setAttribute('draggable', 'false');
      
      el.querySelectorAll('.widget-drop-over').forEach(item => {
        item.classList.remove('widget-drop-over');
      });
      
      saveDashboardLayout(el);
    });
  });
  
  columns.forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      const draggingWidget = el.querySelector('.widget-dragging');
      if (!draggingWidget) return;
      
      const afterElement = getDragAfterElement(col, e.clientY);
      
      el.querySelectorAll('.widget-drop-over').forEach(item => {
        item.classList.remove('widget-drop-over');
      });
      
      if (afterElement == null) {
        col.appendChild(draggingWidget);
        col.classList.add('widget-drop-over');
      } else {
        col.insertBefore(draggingWidget, afterElement);
        afterElement.classList.add('widget-drop-over');
      }
    });
    
    col.addEventListener('dragleave', (e) => {
      if (!col.contains(e.relatedTarget)) {
        col.classList.remove('widget-drop-over');
      }
    });
    
    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('widget-drop-over');
      el.querySelectorAll('.widget-drop-over').forEach(item => {
        item.classList.remove('widget-drop-over');
      });
      
      saveDashboardLayout(el);
    });
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.dashboard-widget:not(.widget-dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function saveDashboardLayout(el) {
  const layout = [];
  const columns = el.querySelectorAll('.dashboard-col');
  columns.forEach(col => {
    const colWidgets = [];
    const widgets = col.querySelectorAll('.dashboard-widget');
    widgets.forEach(w => {
      const id = w.dataset.widgetId;
      if (id) colWidgets.push(id);
    });
    layout.push(colWidgets);
  });
  localStorage.setItem('dashboard_layout', JSON.stringify(layout));
}
