// ═════════════════════════════════════════════════
// CALENDAR PAGE
// ═════════════════════════════════════════════════
import { getState, getLessonStatus, getWeekLessons, getLessonsInRange } from '../store/store.js';
import { icon } from '../components/icons.js';
import { MONTHS_TR, DAYS_SHORT } from '../data/curriculum.js';
import { getMonthDays, addDays, getLessonStatusInfo, getLocalDateStr, escHtml } from '../utils/helpers.js';

export async function renderCalendar(navigate) {
  const state = getState();
  const now = new Date();
  let viewYear = now.getFullYear();
  let viewMonth = now.getMonth();
  let viewSelection = localStorage.getItem('_cal_view') || 'week';
  let monday = _getMonday(now);
  let lessons = [];

  if (viewSelection === 'month') {
    const days = getMonthDays(viewYear, viewMonth);
    lessons = await getLessonsInRange(days[0].date, days[days.length - 1].date);
  } else if (viewSelection === 'week') {
    lessons = await getWeekLessons(monday);
  }

  const html = `
    <div class="fade-in">
      <div class="page-header">
        <div>
          <h2>Takvim</h2>
          <p>Ders takvimini görüntüleyin ve yönetin</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <div class="tabs">
            <button class="tab-btn ${viewSelection === 'month' ? 'active' : ''}" data-view="month">Ay</button>
            <button class="tab-btn ${viewSelection === 'week' ? 'active' : ''}" data-view="week">Hafta</button>
          </div>
          <button class="btn btn-secondary" id="cal-prev">${icon('chevronLeft', 14)}</button>
          <span id="cal-title" style="font-weight:700;min-width:140px;text-align:center;">Haftalık Görünüm</span>
          <button class="btn btn-secondary" id="cal-next">${icon('chevronRight', 14)}</button>
          <button class="btn btn-ghost btn-sm" id="cal-today">Bugün</button>
          <button class="btn btn-primary" id="btn-add-lesson">${icon('plus', 14)} Ders Ekle</button>
        </div>
      </div>

      <div id="calendar-view">
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
      let _isFirst = true;

      async function refresh() {
        const calView = el.querySelector('#calendar-view');
        const title = el.querySelector('#cal-title');
        const prevBtn = el.querySelector('#cal-prev');
        const nextBtn = el.querySelector('#cal-next');
        const todayBtn = el.querySelector('#cal-today');
        
        try {
          prevBtn.style.display = 'flex';
          nextBtn.style.display = 'flex';
          todayBtn.style.display = 'inline-flex';

          if (_view === 'month') {
            const days = getMonthDays(_year, _month);
            const start = days[0].date;
            const end = days[days.length-1].date;
            const lessons = await getLessonsInRange(start, end);
            
            calView.innerHTML = renderMonthView(getState(), _year, _month, lessons);
            title.textContent = `${MONTHS_TR[_month]} ${_year}`;
          } else {
            const lessons = await getWeekLessons(_weekStart);
            calView.innerHTML = renderWeekView(getState(), _weekStart, lessons);
            const weekEnd = addDays(_weekStart, 6);
            title.textContent = `${_weekStart.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} – ${weekEnd.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
          }
          initCalendarEvents(el, nav);
          initCalendarDragDrop(el, nav);
        } catch (err) {
          console.error("Calendar refresh error:", err);
          calView.innerHTML = `
            <div class="empty-state">
              ${icon('alertCircle', 40)}
              <p>Takvim yüklenirken bir hata oluştu.</p>
              <button class="btn btn-secondary btn-sm" onclick="location.reload()">Sayfayı Yenile</button>
            </div>
          `;
        }
      }

      el.querySelectorAll('[data-view]').forEach(btn => {
        btn.addEventListener('click', () => {
          _view = btn.dataset.view;
          el.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          refresh();
        });
      });

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
      
      // Auto-refresh to sync title and load gcal if needed
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

function renderMonthView(state, year, month, lessons = []) {
  const today = getLocalDateStr();
  const days = getMonthDays(year, month);

  return `
    <div class="card" style="padding:12px;">
      <div class="calendar-grid" style="margin-bottom:4px;">
        ${['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => `
          <div class="cal-day-header">${d}</div>
        `).join('')}
      </div>
      <div class="calendar-grid">
        ${days.map(({ date, currentMonth }) => {
          const dateStr = getLocalDateStr(date);
          const isToday = dateStr === today;
          const dayLessons = lessons.filter(l => l.date === dateStr).slice(0, 4);
          return `
            <div class="cal-day cal-drop-zone ${isToday ? 'today' : ''} ${!currentMonth ? 'other-month' : ''}" data-date="${dateStr}">
              <div class="cal-day-num">${date.getDate()}</div>
              <div style="display:flex; flex-direction:column; gap:2px; margin-top:4px;">
                ${dayLessons.map(l => {
                  const status = getLessonStatus(l);
                  const isDone = l.status === 'completed';
                  const color = status === 'completed' ? 'var(--success)' : status === 'waiting' ? 'var(--warning)' : 'var(--accent)';
                  const displayTitle = l.refName ? `${l.refName}${l.title ? ' - ' + l.title : ''}` : l.title;
                  
                  return `
                    <div class="cal-lesson-card" 
                         draggable="true" 
                         data-id="${l.id}" 
                         data-is-google="false"
                         data-start-time="${l.startTime}"
                         title="${escHtml(displayTitle)}"
                         style="font-size:10px; padding:2px 4px; border-radius:4px; background:${isDone ? color : color + '15'}; border-left:2px solid ${color}; color:${isDone ? '#fff' : 'var(--text-primary)'}; cursor:pointer; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      <strong>${l.startTime}</strong> ${escHtml(displayTitle)}
                    </div>
                  `;
                }).join('')}
              </div>
              ${lessons.filter(l => l.date === dateStr).length > 4 ? `<div style="font-size:9px;color:var(--text-muted);margin-top:2px;">+${lessons.filter(l => l.date === dateStr).length - 4} daha</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderWeekView(state, weekStart, lessons = []) {
  const today = getLocalDateStr();
  const hours = Array.from({ length: 17 }, (_, i) => i + 7); // 07:00 to 23:00
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return `
    <div class="card" style="padding:0; overflow:hidden; border-radius:var(--radius-lg);">
      <div style="display:grid; grid-template-columns:80px repeat(7, 1fr); background:var(--bg-secondary); border-bottom:1px solid var(--border); sticky-top:0; z-index:10;">
        <div style="padding:15px; border-right:1px solid var(--border); font-size:11px; color:var(--text-muted); display:flex; align-items:center; justify-content:center;">Saat</div>
        ${days.map(d => {
          const ds = getLocalDateStr(d);
          const isToday = ds === today;
          return `
            <div style="padding:12px; text-align:center; border-right:1px solid var(--border); position:relative; ${isToday ? 'background:var(--accent-glow);' : ''}">
              <div style="font-size:11px; font-weight:700; color:${isToday ? 'var(--accent)' : 'var(--text-muted)'}; text-transform:uppercase; letter-spacing:0.5px;">${DAYS_SHORT[d.getDay()]}</div>
              <div style="font-size:18px; font-weight:800; color:${isToday ? 'var(--accent)' : 'var(--text-primary)'};">${d.getDate()}</div>
              ${isToday ? `<div style="position:absolute; bottom:0; left:15%; right:15%; height:3px; background:var(--accent); border-radius:3px 3px 0 0;"></div>` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <div style="overflow-y:auto; max-height:calc(100vh - 300px); position:relative; background:var(--bg-card);">
        ${hours.map(h => `
          <div style="display:grid; grid-template-columns:80px repeat(7, 1fr); min-height:80px; border-bottom:1px solid var(--border-light);">
            <div style="padding:10px; border-right:1px solid var(--border); font-size:12px; font-weight:600; color:var(--text-muted); display:flex; align-items:flex-start; justify-content:center;">
              ${String(h).padStart(2, '0')}:00
            </div>
              ${days.map(d => {
                const ds = getLocalDateStr(d);
              const dayHourLessons = lessons.filter(l => l.date === ds && parseInt(l.startTime) === h);
              return `
                <div class="cal-drop-zone" data-date="${ds}" data-hour="${h}" style="border-right:1px solid var(--border-light); position:relative; transition:background 0.2s;">
                  ${dayHourLessons.map(l => {
                    const status = getLessonStatus(l);
                    const isDone = l.status === 'completed';
                    const color = status === 'completed' ? 'var(--success)' : status === 'waiting' ? 'var(--warning)' : 'var(--accent)';
                    const displayTitle = l.refName ? `${l.refName}${l.title ? ' - ' + l.title : ''}` : l.title;

                    return `
                      <div class="cal-lesson-card" 
                           draggable="true"
                           data-id="${l.id}"
                           data-is-google="false"
                           data-start-time="${l.startTime}"
                           style="position:absolute; left:4px; right:4px; top:4px; bottom:4px; z-index:5; background:${isDone ? color : color + '15'}; border-left:4px solid ${color}; border-radius:6px; padding:8px; cursor:pointer; box-shadow:var(--shadow-sm); overflow:hidden;">
                        <div style="font-size:10px; font-weight:700; color:${isDone ? '#fff' : color}; margin-bottom:2px; display:flex; justify-content:space-between;">
                          <span>${l.startTime} - ${l.endTime}</span>
                          ${icon('dragHandle', 12)}
                        </div>
                        <div style="font-size:12px; font-weight:700; color:${isDone ? '#fff' : 'var(--text-primary)'}; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                          ${escHtml(displayTitle)}
                        </div>
                        <div style="font-size:10px; color:${isDone ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)'}; display:flex; gap:4px; align-items:center;">
                          ${icon('book', 10)} ${l.subject.charAt(0).toUpperCase() + l.subject.slice(1)}
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

function initCalendarDragDrop(el, navigate) {
  let draggedLessonId = null;

  el.querySelectorAll('.cal-lesson-card').forEach(card => {
    card.addEventListener('dragstart', (e) => {
      draggedLessonId = card.dataset.id;
      const startTime = card.dataset.startTime;
      card.style.opacity = '0.5';
      card.style.transform = 'scale(0.95)';
      e.dataTransfer.setData('text/plain', draggedLessonId);
      e.dataTransfer.setData('application/start-time', startTime);
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
      card.style.transform = 'scale(1)';
      el.querySelectorAll('.cal-drop-zone').forEach(z => z.style.background = '');
    });
  });

  el.querySelectorAll('.cal-drop-zone').forEach(zone => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.style.background = 'var(--accent-glow)';
    });

    zone.addEventListener('dragleave', () => {
      zone.style.background = '';
    });

    zone.addEventListener('drop', async (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain');
      const originalStartTime = e.dataTransfer.getData('application/start-time');
      const newDate = zone.dataset.date;
      const newHour = zone.dataset.hour;
      
      // If hour is present (Week View), use it. Otherwise keep original time (Month View).
      const newStartTime = newHour 
        ? `${String(newHour).padStart(2, '0')}:00` 
        : originalStartTime;

      if (id && newDate && newStartTime) {
        const { updateLessonTime } = await import('../store/store.js');
        updateLessonTime(id, newDate, newStartTime);
        setTimeout(() => navigate('calendar', true), 100);
      }
    });
  });
}

function initCalendarEvents(el, navigate) {
  el.querySelectorAll('.cal-lesson-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = card.dataset.id;
      import('./modals/LessonEvalModal.js').then(m => m.openLessonEvalModal(id, navigate));
    });
  });

  el.querySelectorAll('.cal-drop-zone').forEach(zone => {
    zone.addEventListener('click', (e) => {
      if (e.target !== zone) return; // Only trigger if clicking the empty area
      const date = zone.dataset.date;
      const hour = zone.dataset.hour;
      const startTime = hour ? `${String(hour).padStart(2, '0')}:00` : '14:00';
      
      import('./modals/AddLessonModal.js').then(m => {
        m.openAddLessonModal(() => navigate('calendar', true), { date, startTime });
      });
    });
    zone.style.cursor = 'pointer';
  });
}
