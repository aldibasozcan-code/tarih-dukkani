// ═════════════════════════════════════════════════
// CALENDAR PAGE — Enhanced
// ═════════════════════════════════════════════════
import { getState, getLessonStatus, getWeekLessons, getLessonsInRange } from '../store/store.js';
import { icon } from '../components/icons.js';
import { MONTHS_TR, DAYS_SHORT } from '../data/curriculum.js';
import { getMonthDays, addDays, getLocalDateStr, escHtml } from '../utils/helpers.js';

// Color palette per lesson status
const STATUS_COLORS = {
  completed:  { bg: '#10b981', light: '#d1fae5', text: '#065f46', label: 'Tamamlandı' },
  upcoming:   { bg: '#6366f1', light: '#e0e7ff', text: '#3730a3', label: 'Planlandı' },
  ongoing:    { bg: '#f59e0b', light: '#fef3c7', text: '#92400e', label: 'Devam Ediyor' },
  postponed:  { bg: '#ef4444', light: '#fee2e2', text: '#991b1b', label: 'Ertelendi' },
  default:    { bg: '#8b5cf6', light: '#ede9fe', text: '#5b21b6', label: 'Diğer' },
};

function getStatusColor(lesson) {
  const s = getLessonStatus(lesson);
  return STATUS_COLORS[s] || STATUS_COLORS.default;
}

export async function renderCalendar(navigate) {
  const state = getState();
  const now = new Date();
  let viewYear  = now.getFullYear();
  let viewMonth = now.getMonth();
  let viewSelection = localStorage.getItem('_cal_view') || 'week';
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

  const html = `
    <div class="fade-in">
      <!-- Premium Header -->
      <div class="page-header" style="background: linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(16,185,129,0.04) 100%); padding: 32px 24px; border-radius: 20px; margin-bottom: 28px; border: 1px solid rgba(99,102,241,0.12); box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
        <div>
          <h2 style="font-size: 32px; font-weight: 800; color: #6366f1; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; letter-spacing: -0.5px;">
            ${icon('calendar', 32)} Takvim
          </h2>
          <p style="color: var(--text-secondary); font-size: 16px; font-weight: 500;">Ders takvimini görüntüleyin, düzenleyin ve yönetin</p>
        </div>
        <div style="display:flex;gap:10px; align-items: center; flex-wrap: wrap;">
          <!-- View Toggle -->
          <div class="tabs" style="padding: 4px; background: var(--bg-secondary); border-radius: var(--radius-md); display:inline-flex;">
            <button class="tab-btn ${viewSelection === 'month' ? 'active' : ''}" data-view="month" style="padding: 6px 16px; font-size: 13px; font-weight: 700; border-radius: 8px; display:flex; align-items:center; gap:5px;">
              ${icon('calendar', 13)} Ay
            </button>
            <button class="tab-btn ${viewSelection === 'week' ? 'active' : ''}" data-view="week" style="padding: 6px 16px; font-size: 13px; font-weight: 700; border-radius: 8px; display:flex; align-items:center; gap:5px;">
              ${icon('clock', 13)} Hafta
            </button>
          </div>
          <!-- Navigation -->
          <div style="display:flex; align-items:center; gap:6px; background: var(--bg-secondary); padding: 4px; border-radius: 12px;">
            <button class="btn btn-ghost btn-sm btn-icon hover-scale" id="cal-prev" style="width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center;">${icon('chevronLeft', 16)}</button>
            <span id="cal-title" style="font-weight:700; min-width:160px; text-align:center; font-size:14px; color:var(--text-primary);">Haftalık Görünüm</span>
            <button class="btn btn-ghost btn-sm btn-icon hover-scale" id="cal-next" style="width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center;">${icon('chevronRight', 16)}</button>
          </div>
          <button class="btn btn-secondary hover-lift" id="cal-today" style="font-weight:700; font-size:13px; padding:7px 16px; border-radius:10px;">Bugün</button>
          <button class="btn btn-primary hover-lift" id="btn-add-lesson" style="box-shadow: 0 8px 20px rgba(99,102,241,0.3); padding: 9px 20px; font-weight: 700; font-size: 14px; background: #6366f1; border-color: #6366f1;">
            ${icon('plus', 16)} Ders Ekle
          </button>
        </div>
      </div>

      <!-- KPI Stats Row -->
      <div class="grid grid-4 fade-in-up stagger-1" style="margin-bottom: 28px; gap: 16px;">
        <div class="kpi-card hover-lift" style="border-left: 4px solid #6366f1; background: rgba(255,255,255,0.8); padding: 16px 20px;">
          <div class="kpi-icon" style="background: rgba(99,102,241,0.1); color:#6366f1; width:42px; height:42px; border-radius:10px;">${icon('calendar', 20)}</div>
          <div>
            <div class="kpi-value" style="font-size:24px;">${weekTotal}</div>
            <div class="kpi-label" style="font-size:12px;">Bu Hafta Ders</div>
          </div>
        </div>
        <div class="kpi-card hover-lift" style="border-left: 4px solid var(--brand-green); background: rgba(255,255,255,0.8); padding: 16px 20px;">
          <div class="kpi-icon" style="background: rgba(16,185,129,0.1); color:var(--brand-green); width:42px; height:42px; border-radius:10px;">${icon('checkCircle', 20)}</div>
          <div>
            <div class="kpi-value" style="font-size:24px;">${weekDone}</div>
            <div class="kpi-label" style="font-size:12px;">Tamamlandı</div>
          </div>
        </div>
        <div class="kpi-card hover-lift" style="border-left: 4px solid #6366f1; background: rgba(255,255,255,0.8); padding: 16px 20px;">
          <div class="kpi-icon" style="background: rgba(99,102,241,0.1); color:#6366f1; width:42px; height:42px; border-radius:10px;">${icon('clock', 20)}</div>
          <div>
            <div class="kpi-value" style="font-size:24px;">${weekUpcoming}</div>
            <div class="kpi-label" style="font-size:12px;">Planlandı</div>
          </div>
        </div>
        <div class="kpi-card hover-lift" style="border-left: 4px solid #f59e0b; background: rgba(255,255,255,0.8); padding: 16px 20px;">
          <div class="kpi-icon" style="background: rgba(245,158,11,0.1); color:#f59e0b; width:42px; height:42px; border-radius:10px;">${icon('zap', 20)}</div>
          <div>
            <div class="kpi-value" style="font-size:24px;">${weekTotal > 0 ? Math.round(weekDone / weekTotal * 100) : 0}%</div>
            <div class="kpi-label" style="font-size:12px;">Tamamlanma Oranı</div>
          </div>
        </div>
      </div>

      <!-- Calendar View -->
      <div id="calendar-view" class="fade-in-up stagger-2">
        ${viewSelection === 'month'
          ? renderMonthView(getState(), viewYear, viewMonth, lessons)
          : renderWeekView(getState(), monday, lessons)
        }
      </div>
    </div>
  `;

  return {
    html,
    init: (el, nav) => {
      let _year = viewYear, _month = viewMonth, _view = viewSelection;
      let _weekStart = monday;

      async function refresh() {
        const calView = el.querySelector('#calendar-view');
        const title   = el.querySelector('#cal-title');

        // Add loading shimmer
        calView.style.opacity = '0.5';
        calView.style.transition = 'opacity 0.2s';

        try {
          if (_view === 'month') {
            const days  = getMonthDays(_year, _month);
            const start = days[0].date;
            const end   = days[days.length - 1].date;
            const lessons = await getLessonsInRange(start, end);
            calView.innerHTML = renderMonthView(getState(), _year, _month, lessons);
            title.textContent = `${MONTHS_TR[_month]} ${_year}`;
          } else {
            const lessons = await getWeekLessons(_weekStart);
            calView.innerHTML = renderWeekView(getState(), _weekStart, lessons);
            const weekEnd = addDays(_weekStart, 6);
            title.textContent = `${_weekStart.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} – ${weekEnd.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
          }
          calView.style.opacity = '1';
          initCalendarEvents(el, nav);
          initCalendarDragDrop(el, nav);
        } catch (err) {
          console.error('Calendar refresh error:', err);
          calView.style.opacity = '1';
          calView.innerHTML = `
            <div class="empty-state" style="padding:48px;">
              ${icon('alertCircle', 48)}
              <h3 style="margin-top:16px;">Takvim yüklenirken hata oluştu</h3>
              <p>Lütfen sayfayı yenileyiniz</p>
              <button class="btn btn-secondary btn-sm" onclick="location.reload()" style="margin-top:12px;">Sayfayı Yenile</button>
            </div>
          `;
        }
      }

      // View toggle
      el.querySelectorAll('[data-view]').forEach(btn => {
        btn.addEventListener('click', () => {
          _view = btn.dataset.view;
          localStorage.setItem('_cal_view', _view);
          el.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          refresh();
        });
      });

      // Navigation
      el.querySelector('#cal-prev')?.addEventListener('click', () => {
        if (_view === 'month') { _month--; if (_month < 0) { _month = 11; _year--; } }
        else { _weekStart = addDays(_weekStart, -7); }
        refresh();
      });

      el.querySelector('#cal-next')?.addEventListener('click', () => {
        if (_view === 'month') { _month++; if (_month > 11) { _month = 0; _year++; } }
        else { _weekStart = addDays(_weekStart, 7); }
        refresh();
      });

      el.querySelector('#cal-today')?.addEventListener('click', () => {
        const n = new Date();
        _year = n.getFullYear(); _month = n.getMonth();
        _weekStart = _getMonday(n);
        refresh();
      });

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
    <div class="card" style="padding: 0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
      <!-- Day Headers -->
      <div style="display:grid; grid-template-columns: repeat(7,1fr); background: linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(16,185,129,0.03) 100%); border-bottom: 1px solid var(--border);">
        ${dayNames.map((d, i) => `
          <div style="padding: 14px 0; text-align:center; font-size: 12px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase; color: ${i >= 5 ? '#ef4444' : 'var(--text-secondary)'};">${d}</div>
        `).join('')}
      </div>

      <!-- Day Grid -->
      <div class="calendar-grid" style="gap:0; border:none; border-radius:0; box-shadow:none; background: var(--bg-card);">
        ${days.map(({ date, currentMonth }) => {
          const dateStr = getLocalDateStr(date);
          const isToday = dateStr === today;
          const dayLessons = lessons.filter(l => l.date === dateStr);
          const visible = dayLessons.slice(0, 3);
          const more = dayLessons.length - visible.length;
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          return `
            <div class="cal-day cal-drop-zone ${isToday ? 'today' : ''} ${!currentMonth ? 'other-month' : ''}"
                 data-date="${dateStr}"
                 style="min-height: 110px; padding: 10px; border-right: 1px solid var(--border-light); border-bottom: 1px solid var(--border-light); background: ${!currentMonth ? '#f8fafc' : isWeekend ? '#fafbff' : '#ffffff'}; transition: background 0.2s; position: relative;">

              <!-- Day Number -->
              <div style="margin-bottom: 6px;">
                <span style="
                  display: inline-flex; align-items: center; justify-content: center;
                  width: ${isToday ? '28px' : 'auto'}; height: ${isToday ? '28px' : 'auto'};
                  border-radius: ${isToday ? '50%' : '0'};
                  background: ${isToday ? '#6366f1' : 'transparent'};
                  color: ${isToday ? '#ffffff' : !currentMonth ? '#9ca3af' : isWeekend ? '#ef4444' : 'var(--text-primary)'};
                  font-size: 13px; font-weight: ${isToday ? '800' : currentMonth ? '700' : '500'};
                  padding: ${isToday ? '0' : '0'};">
                  ${date.getDate()}
                </span>
              </div>

              <!-- Lesson Pills -->
              <div style="display: flex; flex-direction: column; gap: 2px;">
                ${visible.map(l => {
                  const sc = getStatusColor(l);
                  const isDone = l.status === 'completed';
                  const name = l.refName || l.title;
                  return `
                    <div class="cal-lesson-card" draggable="true" data-id="${l.id}" data-start-time="${l.startTime}"
                         title="${escHtml(name)} — ${l.startTime}"
                         style="font-size: 10px; padding: 3px 6px; border-radius: 5px;
                                background: ${isDone ? sc.bg : sc.light};
                                color: ${isDone ? '#ffffff' : sc.text};
                                border-left: 3px solid ${sc.bg};
                                cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                                font-weight: 700; line-height: 1.4; transition: all 0.15s;">
                      <span style="opacity: 0.85;">${l.startTime}</span> ${escHtml(name)}
                    </div>
                  `;
                }).join('')}
                ${more > 0 ? `
                  <div style="font-size: 9px; color: #6366f1; font-weight: 700; padding-left: 3px; margin-top: 1px;">+${more} daha</div>
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
function renderWeekView(state, weekStart, lessons = []) {
  const today = getLocalDateStr();
  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 to 22:00
  const days  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const DAYS_TR_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

  return `
    <div class="card" style="padding:0; border-radius: 20px; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
      <!-- Column Headers -->
      <div style="display:grid; grid-template-columns: 72px repeat(7, 1fr); background: linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(16,185,129,0.03) 100%); border-bottom: 2px solid var(--border); position: sticky; top: 0; z-index: 20;">
        <!-- Time column label -->
        <div style="padding: 16px 8px; border-right: 1px solid var(--border); display:flex; align-items:center; justify-content:center; background: linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(16,185,129,0.03) 100%);">
          <span style="font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Saat</span>
        </div>
        ${days.map(d => {
          const ds = getLocalDateStr(d);
          const isToday = ds === today;
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
          const dayLessonCount = lessons.filter(l => l.date === ds).length;
          return `
            <div style="padding: 14px 8px; text-align: center; border-right: 1px solid var(--border); position:relative;
                        background: ${isToday ? 'rgba(99,102,241,0.08)' : 'transparent'};">
              <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; color: ${isToday ? '#6366f1' : isWeekend ? '#ef4444' : 'var(--text-muted)'}; margin-bottom: 4px;">
                ${DAYS_TR_SHORT[d.getDay()]}
              </div>
              <div style="font-size: 22px; font-weight: 800; color: ${isToday ? '#6366f1' : 'var(--text-primary)'}; line-height: 1;">
                ${d.getDate()}
              </div>
              ${dayLessonCount > 0 ? `
                <div style="margin-top: 4px;">
                  <span style="display: inline-block; background: ${isToday ? '#6366f1' : 'var(--border)'}; color: ${isToday ? '#fff' : 'var(--text-secondary)'}; border-radius: 10px; font-size: 9px; font-weight: 700; padding: 1px 6px;">${dayLessonCount} ders</span>
                </div>
              ` : ''}
              ${isToday ? `<div style="position:absolute; bottom:0; left:20%; right:20%; height:3px; background:#6366f1; border-radius:3px 3px 0 0;"></div>` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <!-- Time Grid -->
      <div style="background: var(--bg-card); position:relative;">
        ${hours.map(h => `
          <div style="display:grid; grid-template-columns: 72px repeat(7, 1fr); min-height: 80px; border-bottom: 1px solid var(--border-light);">
            <!-- Hour Label -->
            <div style="padding: 10px 6px; border-right: 1px solid var(--border); display:flex; align-items:flex-start; justify-content:flex-end; flex-shrink:0;">
              <span style="font-size: 11px; font-weight: 700; color: var(--text-muted);">${String(h).padStart(2,'0')}:00</span>
            </div>
            ${days.map(d => {
              const ds = getLocalDateStr(d);
              const isToday = ds === today;
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              const dayHourLessons = lessons.filter(l => l.date === ds && parseInt(l.startTime) === h);
              return `
                <div class="cal-drop-zone" data-date="${ds}" data-hour="${h}"
                     style="border-right: 1px solid var(--border-light); position:relative; overflow:visible;
                            background: ${isToday ? 'rgba(99,102,241,0.02)' : isWeekend ? 'rgba(239,68,68,0.01)' : 'transparent'};
                            cursor: pointer; transition: background 0.15s;">
                  ${dayHourLessons.map(l => {
                    const sc = getStatusColor(l);
                    const isDone = l.status === 'completed';
                    const name   = l.refName || l.title;

                    const [sH, sM] = l.startTime.split(':').map(Number);
                    const [eH, eM] = (l.endTime || `${sH+1}:00`).split(':').map(Number);
                    const duration = (eH * 60 + eM) - (sH * 60 + sM);
                    const topOffset = (sM / 60) * 80;
                    const heightVal = Math.max((duration / 60) * 80 - 8, 28);

                    return `
                      <div class="cal-lesson-card" draggable="true"
                           data-id="${l.id}" data-start-time="${l.startTime}"
                           style="position:absolute; left:4px; right:4px; top:${topOffset}px; height:${heightVal}px;
                                  z-index:5; background:${isDone ? sc.bg : sc.light};
                                  border-left: 4px solid ${sc.bg}; border-radius: 8px; padding: 7px 8px;
                                  cursor:pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.07); overflow:hidden;
                                  transition: all 0.2s;">
                        <div style="font-size:10px; font-weight:800; color:${isDone ? 'rgba(255,255,255,0.9)' : sc.bg}; margin-bottom:2px; display:flex; justify-content:space-between; align-items:center;">
                          <span>${l.startTime}–${l.endTime || ''}</span>
                          <span style="color:${isDone ? 'rgba(255,255,255,0.7)' : sc.bg}; opacity:0.7;">${icon('dragHandle', 10)}</span>
                        </div>
                        <div style="font-size: 12px; font-weight:800; color:${isDone ? '#ffffff' : 'var(--text-primary)'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.3;">
                          ${escHtml(name)}
                        </div>
                        ${heightVal > 44 ? `
                          <div style="font-size:10px; color:${isDone ? 'rgba(255,255,255,0.75)' : sc.text}; margin-top:3px; display:flex; gap:3px; align-items:center; white-space:nowrap; overflow:hidden;">
                            ${icon('book', 9)} ${escHtml(l.subject || '')}
                          </div>
                        ` : ''}
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
      card.style.opacity = '0.45';
      card.style.transform = 'scale(0.95)';
      e.dataTransfer.setData('text/plain', draggedLessonId);
      e.dataTransfer.setData('application/start-time', card.dataset.startTime);
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
      card.style.transform = 'scale(1)';
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
      zone.style.background = 'rgba(99,102,241,0.08)';
      zone.style.boxShadow = 'inset 0 0 0 2px rgba(99,102,241,0.3)';
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
      const originalStartTime = e.dataTransfer.getData('application/start-time');
      const newDate = zone.dataset.date;
      const newHour = zone.dataset.hour;
      const originalMins = originalStartTime.split(':')[1] || '00';
      const newStartTime = newHour
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
      import('./modals/LessonEvalModal.js').then(m => m.openLessonEvalModal(id, navigate));
    });

    // Hover glow effect
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-1px)';
      card.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
      card.style.zIndex = '20';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
      card.style.zIndex = '';
    });
  });

  // Drop zone click → add lesson
  el.querySelectorAll('.cal-drop-zone').forEach(zone => {
    zone.addEventListener('click', e => {
      if (e.target !== zone) return;
      const date = zone.dataset.date;
      const hour = zone.dataset.hour;
      const startTime = hour ? `${String(hour).padStart(2, '0')}:00` : '14:00';
      import('./modals/AddLessonModal.js').then(m => {
        m.openAddLessonModal(() => navigate('calendar', true), { date, startTime });
      });
    });

    // Hover style on empty zones
    zone.addEventListener('mouseenter', e => {
      if (e.target !== zone) return;
      zone.style.background = 'rgba(99,102,241,0.04)';
    });
    zone.addEventListener('mouseleave', () => {
      zone.style.background = '';
    });
  });
}
