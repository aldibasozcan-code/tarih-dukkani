// ═════════════════════════════════════════════════
// CALENDAR PAGE
// ═════════════════════════════════════════════════
import { getState, getLessonStatus, generateGoogleCalendarUrl } from '../store/store.js';
import { icon } from '../components/icons.js';
import { MONTHS_TR, DAYS_SHORT } from '../data/curriculum.js';
import { getMonthDays, addDays, getLessonStatusInfo } from '../utils/helpers.js';

export function renderCalendar(navigate) {
  const now = new Date();
  let viewYear = now.getFullYear();
  let viewMonth = now.getMonth();
  let view = 'month';

  const html = `
    <div class="fade-in">
      <div class="page-header">
        <div>
          <h2>Takvim</h2>
          <p>Ders takvimini görüntüleyin ve yönetin</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <div class="tabs">
            <button class="tab-btn ${view === 'month' ? 'active' : ''}" data-view="month">Ay</button>
            <button class="tab-btn ${view === 'week' ? 'active' : ''}" data-view="week">Hafta</button>
          </div>
          <button class="btn btn-secondary" id="cal-prev">${icon('chevronLeft', 14)}</button>
          <span id="cal-title" style="font-weight:700;min-width:140px;text-align:center;">${MONTHS_TR[viewMonth]} ${viewYear}</span>
          <button class="btn btn-secondary" id="cal-next">${icon('chevronRight', 14)}</button>
          <button class="btn btn-ghost btn-sm" id="cal-today">Bugün</button>
          <button class="btn btn-primary" id="btn-add-lesson">${icon('plus', 14)} Ders Ekle</button>
        </div>
      </div>

      <div id="calendar-view">
        ${renderMonthView(getState(), viewYear, viewMonth)}
      </div>
    </div>
  `;

  return {
    html,
    init: (el, nav) => {
      let _year = viewYear, _month = viewMonth, _view = 'month';
      let _weekStart = _getMonday(now);

      function refresh() {
        const calView = el.querySelector('#calendar-view');
        const title = el.querySelector('#cal-title');
        if (_view === 'month') {
          calView.innerHTML = renderMonthView(getState(), _year, _month);
          title.textContent = `${MONTHS_TR[_month]} ${_year}`;
        } else {
          calView.innerHTML = renderWeekView(getState(), _weekStart);
          const weekEnd = addDays(_weekStart, 6);
          title.textContent = `${_weekStart.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} – ${weekEnd.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
        }
        initCalendarEvents(el, nav);
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
        import('./modals/AddLessonModal.js').then(m => m.openAddLessonModal(() => nav('calendar')));
      });

      initCalendarEvents(el, nav);
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

function renderMonthView(state, year, month) {
  const today = new Date().toISOString().split('T')[0];
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
          const dateStr = date.toISOString().split('T')[0];
          const isToday = dateStr === today;
          const dayLessons = state.lessons.filter(l => l.date === dateStr).slice(0, 3);
          return `
            <div class="cal-day ${isToday ? 'today' : ''} ${!currentMonth ? 'other-month' : ''}">
              <div class="cal-day-num">${date.getDate()}</div>
              ${dayLessons.map(l => {
                const status = getLessonStatus(l);
                let colorClass = 'cal-event-purple';
                if (status === 'completed') colorClass = 'cal-event-blue';
                else if (status === 'waiting') colorClass = 'cal-event-orange';
                else if (status === 'ongoing') colorClass = 'cal-event-blue';
                
                const gcalUrl = generateGoogleCalendarUrl(l);
                return `<a href="${gcalUrl}" target="_blank" class="cal-event ${colorClass}" title="${l.title} - Google Takvim'e Ekle" style="display:block; text-decoration:none;">${l.startTime} ${l.title}</a>`;
              }).join('')}
              ${state.lessons.filter(l => l.date === dateStr).length > 3 ? `<div style="font-size:9px;color:var(--text-muted);">+${state.lessons.filter(l => l.date === dateStr).length - 3} daha</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderWeekView(state, weekStart) {
  const today = new Date().toISOString().split('T')[0];
  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 to 20:00
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return `
    <div class="card" style="padding:0;overflow:auto;max-height:70vh;">
      <div style="display:grid;grid-template-columns:60px repeat(7,1fr);position:sticky;top:0;z-index:2;background:var(--bg-secondary);">
        <div style="border-right:1px solid var(--border);border-bottom:1px solid var(--border);"></div>
        ${days.map(d => {
          const ds = d.toISOString().split('T')[0];
          const isToday = ds === today;
          return `
            <div class="week-col-header ${isToday ? 'today-col' : ''}">
              <div class="day-name">${DAYS_SHORT[(d.getDay() + 6) % 7]}</div>
              <div class="day-num">${d.getDate()}</div>
            </div>
          `;
        }).join('')}
      </div>
      ${hours.map(h => `
        <div style="display:grid;grid-template-columns:60px repeat(7,1fr);min-height:48px;">
          <div class="week-hour-label">${h}:00</div>
          ${days.map(d => {
            const ds = d.toISOString().split('T')[0];
            const lessons = state.lessons.filter(l => l.date === ds && parseInt(l.startTime) === h);
            return `
              <div class="week-cell">
                ${lessons.map(l => {
                  const status = getLessonStatus(l);
                  const color = status === 'completed' ? 'var(--accent)' : status === 'waiting' ? 'var(--warning)' : 'var(--accent2)';
                  const gcalUrl = generateGoogleCalendarUrl(l);
                  return `<a href="${gcalUrl}" target="_blank" style="display:block; text-decoration:none; background:${color}22;border-left:3px solid ${color};border-radius:3px;padding:3px 6px;margin:2px;font-size:10px;font-weight:600;color:${color};" title="Google Takvim'e Ekle">
                    ${l.startTime} ${l.title}
                  </a>`;
                }).join('')}
              </div>
            `;
          }).join('')}
        </div>
      `).join('')}
    </div>
  `;
}

function initCalendarEvents(el, navigate) {
  el.querySelectorAll('.cal-event').forEach(ev => {
    ev.addEventListener('click', (e) => { e.stopPropagation(); });
  });
}
