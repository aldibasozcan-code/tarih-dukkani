// ═════════════════════════════════════════════════
// CALENDAR PAGE — Premium Fit-to-Screen & Modern Aesthetics
// ═════════════════════════════════════════════════
import { getState, getLessonStatus, getWeekLessons, getLessonsInRange } from '../store/store.js';
import { icon } from '../components/icons.js';
import { MONTHS_TR, DAYS_SHORT } from '../data/curriculum.js';
import { getMonthDays, addDays, getLocalDateStr, escHtml } from '../utils/helpers.js';

// Color palette per lesson status
const STATUS_COLORS = {
  completed:  { bg: '#10b981', light: 'rgba(16, 185, 129, 0.12)', text: '#065f46', label: 'Tamamlandı' },
  upcoming:   { bg: '#6366f1', light: 'rgba(99, 102, 241, 0.12)', text: '#3730a3', label: 'Planlandı' },
  ongoing:    { bg: '#f59e0b', light: 'rgba(245, 158, 11, 0.15)', text: '#92400e', label: 'Devam Ediyor' },
  postponed:  { bg: '#ef4444', light: 'rgba(239, 68, 68, 0.12)', text: '#991b1b', label: 'Ertelendi' },
  default:    { bg: '#8b5cf6', light: 'rgba(139, 92, 246, 0.12)', text: '#5b21b6', label: 'Diğer' },
};

function getStatusInfo(lesson) {
  const s = getLessonStatus(lesson);
  const colorData = STATUS_COLORS[s] || STATUS_COLORS.default;
  return {
    statusKey: s,
    ...colorData
  };
}

export async function renderCalendar(navigate) {
  const state = getState();
  const now = new Date();
  let viewYear  = now.getFullYear();
  let viewMonth = now.getMonth();
  let viewSelection = localStorage.getItem('_cal_view') || 'week';
  let density = localStorage.getItem('_cal_density') || 'fit';
  let monday = _getMonday(now);
  let lessons = [];

  if (viewSelection === 'month') {
    const days = getMonthDays(viewYear, viewMonth);
    lessons = await getLessonsInRange(days[0].date, days[days.length - 1].date);
  } else {
    lessons = await getWeekLessons(monday);
  }

  // KPI stats for current week
  const weekLessons = await getWeekLessons(_getMonday(now));
  const weekTotal   = weekLessons.length;
  const weekDone    = weekLessons.filter(l => l.status === 'completed').length;
  const weekUpcoming = weekLessons.filter(l => l.status === 'upcoming').length;
  const weekRate    = weekTotal > 0 ? Math.round(weekDone / weekTotal * 100) : 0;

  const weekEnd = addDays(monday, 6);
  const initialRangeTitle = viewSelection === 'month'
    ? `${MONTHS_TR[viewMonth]} ${viewYear}`
    : `${monday.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} – ${weekEnd.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const initialBadge = viewSelection === 'month'
    ? `${viewYear}`
    : `${MONTHS_TR[monday.getMonth()]} ${monday.getFullYear()}`;

  const html = `
    <div class="calendar-page-container fade-in">
      <!-- 1. Sleek Compact Header Toolbar -->
      <div class="cal-toolbar">
        <!-- Title & Active Range -->
        <div class="cal-title-section">
          <div class="cal-icon-box">
            ${icon('calendar', 20)}
          </div>
          <div>
            <div class="cal-page-title">
              Ders Takvimi
              <span class="cal-date-badge" id="cal-date-badge">${initialBadge}</span>
            </div>
            <div class="cal-range-text" id="cal-title">${initialRangeTitle}</div>
          </div>
        </div>

        <!-- Center Controls: Navigator & View Segment -->
        <div class="cal-nav-group">
          <!-- Prev / Today / Next -->
          <div class="cal-btn-group">
            <button class="cal-icon-btn hover-scale" id="cal-prev" title="Önceki (Hafta/Ay)">
              ${icon('chevronLeft', 16)}
            </button>
            <button class="cal-today-btn" id="cal-today" title="Bugüne Git">
              <span class="cal-today-dot"></span>
              Bugün
            </button>
            <button class="cal-icon-btn hover-scale" id="cal-next" title="Sonraki (Hafta/Ay)">
              ${icon('chevronRight', 16)}
            </button>
          </div>

          <!-- View Switch Tabs -->
          <div class="cal-view-tabs">
            <button class="cal-tab-btn ${viewSelection === 'week' ? 'active' : ''}" data-view="week" title="Haftalık Görünüm">
              ${icon('clock', 13)} Hafta
            </button>
            <button class="cal-tab-btn ${viewSelection === 'month' ? 'active' : ''}" data-view="month" title="Aylık Görünüm">
              ${icon('calendar', 13)} Ay
            </button>
          </div>
        </div>

        <!-- Right: Density Toggle & Add Lesson Action -->
        <div class="cal-actions-group">
          <button class="cal-density-btn" id="cal-density-toggle" title="Görünüm modu: Ekrana Sığdır veya Genişlet">
            <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              ${density === 'fit'
                ? '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>'
                : '<path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M10 4v6m0 0H4m6 0L3 3m10 7h6m-6 0V4m0 6l7-7"/>'}
            </svg>
            <span id="cal-density-label">${density === 'fit' ? 'Ekrana Sığdır' : 'Genişletilmiş'}</span>
          </button>

          <button class="btn btn-primary cal-add-btn hover-lift" id="btn-add-lesson">
            ${icon('plus', 16)} <span>Ders Ekle</span>
          </button>
        </div>
      </div>

      <!-- 2. Slim KPI & Quick Legend Ribbon -->
      <div class="cal-ribbon">
        <!-- KPI Pills -->
        <div class="cal-stats-pills">
          <div class="cal-stat-pill" title="Bu hafta planlanan toplam ders">
            <span class="cal-stat-dot" style="background:#004526;"></span>
            <span style="color:var(--text-muted);">Bu Hafta:</span>
            <strong id="kpi-total" style="color:var(--text-primary);">${weekTotal} Ders</strong>
          </div>
          <div class="cal-stat-pill pill-success" title="Bu hafta tamamlanan dersler">
            <span class="cal-stat-dot" style="background:#10b981;"></span>
            <span>Tamamlandı:</span>
            <strong id="kpi-done">${weekDone}</strong>
          </div>
          <div class="cal-stat-pill pill-upcoming" title="Bu hafta planlanan dersler">
            <span class="cal-stat-dot" style="background:#6366f1;"></span>
            <span>Planlandı:</span>
            <strong id="kpi-upcoming">${weekUpcoming}</strong>
          </div>
          <div class="cal-stat-pill pill-warning" title="Haftalık tamamlanma oranı">
            <span class="cal-stat-dot" style="background:#f59e0b;"></span>
            <span>Tamamlanma:</span>
            <strong id="kpi-rate">%${weekRate}</strong>
          </div>
        </div>

        <!-- Legend -->
        <div class="cal-legend-group">
          <div class="cal-legend-item"><span class="cal-legend-dot" style="background:#10b981;"></span> Tamamlandı</div>
          <div class="cal-legend-item"><span class="cal-legend-dot" style="background:#6366f1;"></span> Planlandı</div>
          <div class="cal-legend-item"><span class="cal-legend-dot" style="background:#f59e0b;"></span> Devam Eden</div>
          <div class="cal-legend-item"><span class="cal-legend-dot" style="background:#ef4444;"></span> Ertelendi</div>
          <div class="cal-legend-tip" title="Dersi taşımak için sürükleyip bırakabilirsiniz. Boş bir saate tıklayarak yeni ders oluşturabilirsiniz.">
            ${icon('alertCircle', 12)} <span style="font-weight:600;">Sürükle-bırak destekli</span>
          </div>
        </div>
      </div>

      <!-- 3. Main Calendar Body View -->
      <div id="calendar-view" class="cal-main-card">
        ${viewSelection === 'month'
          ? renderMonthView(getState(), viewYear, viewMonth, lessons)
          : renderWeekView(getState(), monday, lessons, density)
        }
      </div>
    </div>
  `;

  return {
    html,
    init: (el, nav) => {
      let _year = viewYear;
      let _month = viewMonth;
      let _view = viewSelection;
      let _density = density;
      let _weekStart = monday;

      // Add fit-to-screen class to page-content container
      el.classList.add('page-content-calendar');

      async function refresh() {
        const calView = el.querySelector('#calendar-view');
        const title   = el.querySelector('#cal-title');
        const badge   = el.querySelector('#cal-date-badge');

        if (!calView) return;

        // Smooth subtle loading fade
        calView.style.opacity = '0.6';
        calView.style.transition = 'opacity 0.15s ease';

        try {
          if (_view === 'month') {
            const days  = getMonthDays(_year, _month);
            const start = days[0].date;
            const end   = days[days.length - 1].date;
            const lessons = await getLessonsInRange(start, end);
            calView.innerHTML = renderMonthView(getState(), _year, _month, lessons);
            if (title) title.textContent = `${MONTHS_TR[_month]} ${_year}`;
            if (badge) badge.textContent = `${_year}`;
          } else {
            const lessons = await getWeekLessons(_weekStart);
            calView.innerHTML = renderWeekView(getState(), _weekStart, lessons, _density);
            const weekEnd = addDays(_weekStart, 6);
            if (title) {
              title.textContent = `${_weekStart.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} – ${weekEnd.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
            }
            if (badge) {
              badge.textContent = `${MONTHS_TR[_weekStart.getMonth()]} ${_weekStart.getFullYear()}`;
            }

            // Auto-scroll to current hour if expanded
            if (_density === 'expanded') {
              const currentHourCell = calView.querySelector('.cal-now-line')?.closest('.cal-hour-row');
              if (currentHourCell) {
                currentHourCell.scrollIntoView({ block: 'center', behavior: 'smooth' });
              }
            }
          }

          // Update KPI stats
          const currentWeekLessons = await getWeekLessons(_getMonday(new Date()));
          const total = currentWeekLessons.length;
          const done = currentWeekLessons.filter(l => l.status === 'completed').length;
          const upcoming = currentWeekLessons.filter(l => l.status === 'upcoming').length;
          const rate = total > 0 ? Math.round(done / total * 100) : 0;

          const kpiTotal = el.querySelector('#kpi-total');
          const kpiDone = el.querySelector('#kpi-done');
          const kpiUpcoming = el.querySelector('#kpi-upcoming');
          const kpiRate = el.querySelector('#kpi-rate');

          if (kpiTotal) kpiTotal.textContent = `${total} Ders`;
          if (kpiDone) kpiDone.textContent = `${done}`;
          if (kpiUpcoming) kpiUpcoming.textContent = `${upcoming}`;
          if (kpiRate) kpiRate.textContent = `%${rate}`;

          calView.style.opacity = '1';
          initCalendarEvents(el, nav);
          initCalendarDragDrop(el, nav);
        } catch (err) {
          console.error('Calendar refresh error:', err);
          calView.style.opacity = '1';
          calView.innerHTML = `
            <div class="empty-state" style="padding:48px; text-align:center;">
              ${icon('alertCircle', 40)}
              <h3 style="margin-top:16px; font-weight:800;">Takvim yüklenirken hata oluştu</h3>
              <p style="color:var(--text-secondary); margin-top:4px;">Lütfen sayfayı yenileyiniz</p>
              <button class="btn btn-secondary btn-sm" id="cal-reload-btn" style="margin-top:14px;">Sayfayı Yenile</button>
            </div>
          `;
          el.querySelector('#cal-reload-btn')?.addEventListener('click', () => refresh());
        }
      }

      // View toggle (Week / Month)
      el.querySelectorAll('[data-view]').forEach(btn => {
        btn.addEventListener('click', () => {
          _view = btn.dataset.view;
          localStorage.setItem('_cal_view', _view);
          el.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          refresh();
        });
      });

      // Density toggle (Fit to Screen / Expanded)
      el.querySelector('#cal-density-toggle')?.addEventListener('click', () => {
        _density = _density === 'fit' ? 'expanded' : 'fit';
        localStorage.setItem('_cal_density', _density);
        const label = el.querySelector('#cal-density-label');
        if (label) label.textContent = _density === 'fit' ? 'Ekrana Sığdır' : 'Genişletilmiş';
        refresh();
      });

      // Navigation: Prev
      el.querySelector('#cal-prev')?.addEventListener('click', () => {
        if (_view === 'month') {
          _month--;
          if (_month < 0) { _month = 11; _year--; }
        } else {
          _weekStart = addDays(_weekStart, -7);
        }
        refresh();
      });

      // Navigation: Next
      el.querySelector('#cal-next')?.addEventListener('click', () => {
        if (_view === 'month') {
          _month++;
          if (_month > 11) { _month = 0; _year++; }
        } else {
          _weekStart = addDays(_weekStart, 7);
        }
        refresh();
      });

      // Navigation: Today
      el.querySelector('#cal-today')?.addEventListener('click', () => {
        const n = new Date();
        _year = n.getFullYear();
        _month = n.getMonth();
        _weekStart = _getMonday(n);
        refresh();
      });

      // Add Lesson Button
      el.querySelector('#btn-add-lesson')?.addEventListener('click', () => {
        import('./modals/AddLessonModal.js').then(m => m.openAddLessonModal(() => nav('calendar', true)));
      });

      initCalendarDragDrop(el, nav);
      initCalendarEvents(el, nav);
      refresh();
    }
  };
}

function _getMonday(d) {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const mon = new Date(d);
  mon.setDate(mon.getDate() + diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

// ─── Month View ───────────────────────────────────────────────────────────────
function renderMonthView(state, year, month, lessons = []) {
  const today = getLocalDateStr();
  const days  = getMonthDays(year, month);
  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return `
    <div class="cal-month-wrap">
      <!-- Day Headers -->
      <div class="cal-month-headers">
        ${dayNames.map((d, i) => `
          <div class="cal-month-hdr-cell ${i >= 5 ? 'is-weekend' : ''}">${d}</div>
        `).join('')}
      </div>

      <!-- Day Grid -->
      <div class="cal-month-grid">
        ${days.map(({ date, currentMonth }) => {
          const dateStr = getLocalDateStr(date);
          const isToday = dateStr === today;
          const dayLessons = lessons.filter(l => l.date === dateStr);
          const visible = dayLessons.slice(0, 3);
          const more = dayLessons.length - visible.length;
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          return `
            <div class="cal-month-day cal-drop-zone ${isToday ? 'is-today' : ''} ${!currentMonth ? 'other-month' : ''} ${isWeekend ? 'is-weekend' : ''}"
                 data-date="${dateStr}">

              <!-- Day Number -->
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span class="cal-month-num ${isToday ? 'is-today' : ''}">
                  ${date.getDate()}
                </span>
                ${dayLessons.length > 0 ? `
                  <span style="font-size:9px; font-weight:700; color:var(--text-muted);">${dayLessons.length} ders</span>
                ` : ''}
              </div>

              <!-- Lesson Pills -->
              <div class="cal-month-pills">
                ${visible.map(l => {
                  const sInfo = getStatusInfo(l);
                  const isDone = l.status === 'completed';
                  const name = l.refName || l.title;
                  return `
                    <div class="cal-lesson-card status-${sInfo.statusKey} cal-month-pill"
                         draggable="true"
                         data-id="${l.id}"
                         data-start-time="${l.startTime}"
                         title="${escHtml(name)} — ${l.startTime} (${sInfo.label})">
                      <span style="width:5px; height:5px; border-radius:50%; background:${sInfo.bg}; flex-shrink:0;"></span>
                      <span style="opacity:0.85; font-size:9.5px;">${l.startTime}</span>
                      <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escHtml(name)}</span>
                    </div>
                  `;
                }).join('')}
                ${more > 0 ? `
                  <div style="font-size:9px; color:#004526; font-weight:800; padding-left:4px; margin-top:1px;">+${more} daha</div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ─── Week View ────────────────────────────────────────────────────────────────
function renderWeekView(state, weekStart, lessons = [], density = 'fit') {
  const today = getLocalDateStr();
  const now = new Date();
  const nowH = now.getHours();
  const nowM = now.getMinutes();

  // Smart hour range: covers all scheduled lessons, default 08:00 to 21:00
  let minH = 8;
  let maxH = 21;
  lessons.forEach(l => {
    if (l.startTime) {
      const sh = parseInt(l.startTime);
      if (!isNaN(sh) && sh < minH) minH = Math.max(0, sh);
    }
    if (l.endTime) {
      const eh = parseInt(l.endTime);
      if (!isNaN(eh) && eh > maxH) maxH = Math.min(23, eh);
    }
  });

  const hours = Array.from({ length: maxH - minH + 1 }, (_, i) => i + minH);
  const days  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const DAYS_TR_SHORT = ['PAZ', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT'];

  return `
    <div style="display:flex; flex-direction:column; height:100%; min-height:0; overflow:hidden;">
      <!-- Column Headers -->
      <div class="cal-week-header">
        <!-- Time column label -->
        <div class="cal-week-header-time-col">
          <span>Saat</span>
        </div>

        ${days.map(d => {
          const ds = getLocalDateStr(d);
          const isToday = ds === today;
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
          const dayLessonCount = lessons.filter(l => l.date === ds).length;

          return `
            <div class="cal-week-header-cell ${isToday ? 'is-today' : ''} ${isWeekend ? 'is-weekend' : ''}">
              <div class="cal-day-abbr">
                ${DAYS_TR_SHORT[d.getDay()]}
              </div>
              <div class="cal-day-date-circle ${isToday ? 'is-today' : ''}">
                ${d.getDate()}
              </div>
              ${dayLessonCount > 0 ? `
                <div style="line-height:1;">
                  <span class="cal-day-count-badge">${dayLessonCount} ders</span>
                </div>
              ` : ''}
              ${isToday ? `<div class="cal-week-today-bar"></div>` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <!-- Time Grid -->
      <div class="cal-week-body ${density === 'fit' ? 'density-fit' : 'density-expanded'}"
           ${density === 'fit' ? `style="grid-template-rows: repeat(${hours.length}, 1fr);"` : ''}>
        ${hours.map(h => `
          <div class="cal-hour-row">
            <!-- Hour Label -->
            <div class="cal-hour-label-cell">
              <span>${String(h).padStart(2, '0')}:00</span>
            </div>

            <!-- 7 Day Columns for this hour -->
            ${days.map(d => {
              const ds = getLocalDateStr(d);
              const isToday = ds === today;
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              const isCurrentHour = isToday && nowH === h;
              const dayHourLessons = lessons.filter(l => l.date === ds && parseInt(l.startTime) === h);
              const lessonCount = dayHourLessons.length;

              return `
                <div class="cal-drop-zone cal-drop-cell ${isToday ? 'is-today' : ''} ${isWeekend ? 'is-weekend' : ''}"
                     data-date="${ds}"
                     data-hour="${h}"
                     title="${ds} ${String(h).padStart(2,'0')}:00 — Yeni ders eklemek için tıklayın">

                  <!-- 30-minute guideline -->
                  <div class="cal-half-line"></div>

                  <!-- Live current time line -->
                  ${isCurrentHour ? `
                    <div class="cal-now-line" style="top: ${(nowM / 60) * 100}%;">
                      <span class="cal-now-dot"></span>
                      <span class="cal-now-tag">${String(nowH).padStart(2,'0')}:${String(nowM).padStart(2,'0')}</span>
                    </div>
                  ` : ''}

                  <!-- Lessons for this slot -->
                  ${dayHourLessons.map((l, idx) => {
                    const sInfo = getStatusInfo(l);
                    const name  = l.refName || l.title;

                    const [sH, sM] = (l.startTime || '00:00').split(':').map(Number);
                    const [eH, eM] = (l.endTime || `${sH+1}:00`).split(':').map(Number);
                    const rawDur = (eH * 60 + eM) - (sH * 60 + sM);
                    const duration = rawDur > 0 ? rawDur : 60;
                    const topPercent = (sM / 60) * 100;
                    const heightPercent = (duration / 60) * 100;

                    // Side-by-side positioning if multiple lessons at same hour
                    const widthPercent = 100 / lessonCount;
                    const leftPercent  = idx * widthPercent;

                    return `
                      <div class="cal-lesson-card status-${sInfo.statusKey}"
                           draggable="true"
                           data-id="${l.id}"
                           data-start-time="${l.startTime}"
                           title="${escHtml(name)} (${l.startTime} – ${l.endTime || ''}) — ${sInfo.label}"
                           style="top: ${topPercent}%;
                                  left: calc(${leftPercent}% + 2px);
                                  width: calc(${widthPercent}% - 4px);
                                  height: calc(${heightPercent}% - 3px);
                                  min-height: 24px;">

                        <div class="cal-card-inner">
                          <div class="cal-card-top">
                            <span class="cal-card-time">${l.startTime}–${l.endTime || ''}</span>
                            <span class="cal-card-drag-icon">${icon('dragHandle', 10)}</span>
                          </div>
                          <div class="cal-card-title">${escHtml(name)}</div>
                          ${l.subject ? `
                            <div class="cal-card-sub">
                              <span style="width:4px;height:4px;border-radius:50%;background:${sInfo.bg};flex-shrink:0;"></span>
                              <span>${escHtml(l.subject)}</span>
                            </div>
                          ` : ''}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `;
            }).join('')}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ─── Drag & Drop ──────────────────────────────────────────────────────────────
function initCalendarDragDrop(el, navigate) {
  let draggedLessonId = null;

  el.querySelectorAll('.cal-lesson-card').forEach(card => {
    card.addEventListener('dragstart', e => {
      draggedLessonId = card.dataset.id;
      card.style.opacity = '0.4';
      card.style.transform = 'scale(0.96)';
      e.dataTransfer.setData('text/plain', draggedLessonId);
      e.dataTransfer.setData('application/start-time', card.dataset.startTime || '14:00');
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
      card.style.transform = '';
      el.querySelectorAll('.cal-drop-zone').forEach(z => {
        z.style.background = '';
        z.style.boxShadow = '';
      });
    });
  });

  el.querySelectorAll('.cal-drop-zone').forEach(zone => {
    zone.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.style.background = 'rgba(0, 69, 38, 0.08)';
      zone.style.boxShadow = 'inset 0 0 0 2px rgba(5, 150, 105, 0.4)';
    });

    zone.addEventListener('dragleave', () => {
      zone.style.background = '';
      zone.style.boxShadow = '';
    });

    zone.addEventListener('drop', async e => {
      e.preventDefault();
      zone.style.background = '';
      zone.style.boxShadow = '';
      const id = e.dataTransfer.getData('text/plain');
      const originalStartTime = e.dataTransfer.getData('application/start-time') || '14:00';
      const newDate = zone.dataset.date;
      const newHour = zone.dataset.hour;
      const originalMins = originalStartTime.split(':')[1] || '00';
      const newStartTime = newHour !== undefined
        ? `${String(newHour).padStart(2, '0')}:${originalMins}`
        : originalStartTime;

      if (id && newDate && newStartTime) {
        const { updateLessonTime } = await import('../store/store.js');
        updateLessonTime(id, newDate, newStartTime);
        setTimeout(() => navigate('calendar', true), 100);
      }
    });
  });
}

// ─── Events ───────────────────────────────────────────────────────────────────
function initCalendarEvents(el, navigate) {
  // Lesson card click → detail modal
  el.querySelectorAll('.cal-lesson-card').forEach(card => {
    card.addEventListener('click', e => {
      e.stopPropagation();
      const id = card.dataset.id;
      if (id) {
        import('./modals/LessonEvalModal.js').then(m => m.openLessonEvalModal(id, navigate));
      }
    });
  });

  // Drop zone click → add lesson
  el.querySelectorAll('.cal-drop-zone').forEach(zone => {
    zone.addEventListener('click', e => {
      if (e.target.closest('.cal-lesson-card')) return;
      const date = zone.dataset.date;
      const hour = zone.dataset.hour;
      const startTime = hour !== undefined ? `${String(hour).padStart(2, '0')}:00` : '14:00';
      import('./modals/AddLessonModal.js').then(m => {
        m.openAddLessonModal(() => navigate('calendar', true), { date, startTime });
      });
    });
  });
}
