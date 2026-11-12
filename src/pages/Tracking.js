// ═════════════════════════════════════════════════
// TAKİP — grup ve öğrenci bazında haftalık / aylık ders ve konu takibi
// ═════════════════════════════════════════════════
import { getState, getLessonStatus } from '../store/store.js';
import { icon } from '../components/icons.js';
import { escHtml, todayStr, getAvatarColor } from '../utils/helpers.js';
import { flatTopics, nextTopic, progressCounts, isAssessment, STATUS } from '../lib/progress.js';

// ─── tarih yardımcıları (YYYY-MM-DD, saat dilimi kaymasız) ───
const D = (iso) => new Date(iso + 'T12:00:00Z');
const iso = (d) => d.toISOString().slice(0, 10);
const addDaysIso = (s, n) => iso(new Date(D(s).getTime() + n * 86400000));
const weekdayMon = (s) => { const w = D(s).getUTCDay(); return w === 0 ? 7 : w; }; // 1 = Pzt
const weekStartIso = (s) => addDaysIso(s, 1 - weekdayMon(s));
const monthStartIso = (s) => s.slice(0, 8) + '01';
const addMonthsIso = (s, n) => { const d = D(monthStartIso(s)); d.setUTCMonth(d.getUTCMonth() + n); return iso(d); };
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const fmt = (s, withMonth = true) => `${Number(s.slice(8, 10))}${withMonth ? ' ' + MONTHS[Number(s.slice(5, 7)) - 1] : ''}`;

// sayfa açıkken seçili görünüm
let view = 'hafta'; // 'hafta' | 'ay'
let anchor = null; // görünümün içindeki herhangi bir tarih
let audience = 'groups'; // 'groups' | 'students'

const CHIP = {
  done: { icon: '✓', bg: 'rgba(16,185,129,0.10)', color: '#047857', border: 'rgba(16,185,129,0.35)', label: 'tamamlandı' },
  waiting: { icon: '!', bg: 'rgba(245,158,11,0.12)', color: '#b45309', border: '#f59e0b', label: 'onay bekliyor', dashed: true },
  now: { icon: '●', bg: '#ef4444', color: '#fff', border: '#ef4444', label: 'şu an' },
  upcoming: { icon: '○', bg: 'var(--bg-card)', color: 'var(--text-muted)', border: 'var(--border)', label: 'yaklaşan' },
  postponed: { icon: '↷', bg: 'var(--bg-secondary)', color: 'var(--text-muted)', border: 'var(--border)', label: 'ertelendi', strike: true },
};

function lessonState(l) {
  if (l.status === 'completed') return 'done';
  if (l.status === 'postponed') return 'postponed';
  const s = getLessonStatus(l);
  if (s === 'waiting') return 'waiting';
  if (s === 'ongoing') return 'now';
  return 'upcoming';
}

function period() {
  const today = todayStr();
  const a = anchor || today;
  if (view === 'ay') {
    const start = monthStartIso(a);
    const end = addMonthsIso(start, 1);
    return { start, end, prev: addMonthsIso(start, -1), next: end, title: `${MONTHS[Number(start.slice(5, 7)) - 1]} ${start.slice(0, 4)}`, word: 'ay', gen: 'ayın' };
  }
  const start = weekStartIso(a);
  const end = addDaysIso(start, 7);
  const last = addDaysIso(end, -1);
  return {
    start, end, prev: addDaysIso(start, -7), next: end,
    title: `${fmt(start, start.slice(5, 7) !== last.slice(5, 7))} – ${fmt(last)} ${last.slice(0, 4)}`, word: 'hafta', gen: 'haftanın',
  };
}

// ─── bir grubun / öğrencinin dönem özeti ───
function entityRow(state, entity, type, p) {
  const lessons = state.lessons
    .filter((l) => l.type === type && l.refId === entity.id && l.status !== 'passive' && l.date >= p.start && l.date < p.end)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  const withState = lessons.map((l) => ({ l, st: lessonState(l) }));

  // dönemde işlenen konular (aynı konu birden çok kez geçtiyse son durumu)
  const flat = flatTopics(state, entity);
  const byKey = new Map(flat.map((t) => [t.key, t]));
  const covered = new Map();
  for (const { l } of withState) for (const c of l.coveredTopics || []) if (byKey.has(c.key)) covered.set(c.key, { ...byKey.get(c.key), s: c.s, note: c.note });
  const topics = [...covered.values()].sort((a, b) => a.index - b.index);

  const lastDone = state.lessons
    .filter((l) => l.type === type && l.refId === entity.id && l.status === 'completed')
    .reduce((m, l) => (l.date > m ? l.date : m), '');

  return { entity, type, lessons: withState, topics, lastDone, counts: progressCounts(state, entity), next: nextTopic(state, entity), multi: new Set(flat.map((t) => t.subject)).size > 1 };
}

function chipHtml({ l, st }, monthly) {
  const c = CHIP[st];
  const day = DAYS[weekdayMon(l.date) - 1];
  const when = monthly ? `${Number(l.date.slice(8, 10))} ${day} ${l.startTime}` : `${day} ${l.startTime}`;
  const extra = st === 'postponed' && l.newDate ? ` → ${fmt(l.newDate, false)} ${DAYS[weekdayMon(l.newDate) - 1]}` : '';
  return `<button type="button" data-open-lesson="${l.id}" title="${c.label}${st === 'waiting' ? ' — onaylamak için tıkla' : ''}"
    style="cursor:pointer;font-size:12px;font-weight:700;padding:4px 9px;border-radius:9px;background:${c.bg};color:${c.color};border:1px ${c.dashed ? 'dashed' : 'solid'} ${c.border};">
    ${c.icon} <span style="${c.strike ? 'text-decoration:line-through;' : ''}">${when}</span>${extra}
  </button>`;
}

function topicsHtml(row) {
  if (!row.topics.length) return '';
  let last = '';
  const out = [];
  for (const t of row.topics) {
    const unit = (row.multi ? t.subjectName + ' · ' : '') + t.unitName;
    if (unit !== last) {
      if (last) out.push('</ul>');
      out.push(`<div style="font-size:12px;font-weight:800;color:var(--text-primary);margin-top:8px;">${escHtml(unit)}</div><ul style="margin:2px 0 0;padding-left:10px;border-left:2px solid var(--border);list-style:none;">`);
      last = unit;
    }
    const assess = isAssessment(t.name);
    const color = t.s === 'done' ? STATUS.done.color : assess ? '#7c3aed' : STATUS.partial.color;
    out.push(`<li style="font-size:12px;color:${color};padding:1px 0;">${t.s === 'done' ? '✓' : '◐'} ${escHtml(t.name)}
      ${assess ? `<span style="font-size:10px;font-weight:700;background:${t.s === 'done' ? 'rgba(16,185,129,0.12)' : '#ede9fe'};color:${t.s === 'done' ? '#047857' : '#6d28d9'};padding:0 5px;border-radius:5px;">${t.s === 'done' ? 'değerlendirme' : 'değerlendirme · telafi'}</span>` : ''}
      ${t.s === 'partial' && !assess ? `<span style="font-size:10px;font-weight:700;">(yarım${t.note ? ': ' + escHtml(t.note) : ''})</span>` : ''}</li>`);
  }
  out.push('</ul>');
  return out.join('');
}

function rowHtml(row, p, monthly, today) {
  const { entity, counts, next } = row;
  const nDone = row.lessons.filter((x) => x.st === 'done').length;
  const nWait = row.lessons.filter((x) => x.st === 'waiting').length;
  const nPost = row.lessons.filter((x) => x.st === 'postponed').length;
  const active = row.lessons.length - nPost;
  const daysAgo = row.lastDone ? Math.round((D(today) - D(row.lastDone)) / 86400000) : null;
  return `
    <div style="display:grid;grid-template-columns:minmax(150px,180px) 1fr minmax(220px,1.1fr);gap:16px;padding:16px 20px;border-top:1px solid var(--border);" class="tracking-row">
      <div>
        <button type="button" data-open-entity="${entity.id}" data-type="${row.type}" style="background:none;border:none;padding:0;cursor:pointer;font-size:15px;font-weight:800;color:var(--text-primary);text-align:left;">${escHtml(entity.name)}</button>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">Son ders: ${daysAgo === null ? 'yok' : daysAgo === 0 ? 'bugün' : daysAgo === 1 ? 'dün' : `${daysAgo} gün önce`}</div>
        <div style="height:6px;background:var(--bg-secondary);border-radius:6px;overflow:hidden;margin-top:8px;display:flex;">
          <div style="width:${counts.total ? (counts.done / counts.total) * 100 : 0}%;background:${STATUS.done.color};"></div>
          <div style="width:${counts.total ? (counts.partial / counts.total) * 100 : 0}%;background:${STATUS.partial.color};"></div>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:3px;">${counts.done}/${counts.total} konu · %${counts.pct}</div>
      </div>
      <div>
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;color:var(--text-muted);margin-bottom:6px;">
          Bu ${p.gen} dersleri
          ${row.lessons.length ? `<span style="text-transform:none;letter-spacing:0;font-weight:600;"> · ${active} ders · <span style="color:${STATUS.done.color};">${nDone} ✓</span>${nWait ? ` · <span style="color:#b45309;">${nWait} onay bekliyor</span>` : ''}${nPost ? ` · ${nPost} ertelendi` : ''}</span>` : ''}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${row.lessons.length ? row.lessons.map((x) => chipHtml(x, monthly)).join('') : `<span style="font-size:13px;color:var(--text-muted);">Bu ${p.word} ders yok</span>`}
        </div>
        ${topicsHtml(row)}
      </div>
      <div style="border-radius:12px;padding:12px;background:${next?.s === 'partial' ? STATUS.partial.soft : 'var(--brand-green-soft)'};">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;color:${next?.s === 'partial' ? STATUS.partial.color : 'var(--brand-green-light)'};">
          ${next ? (next.s === 'partial' ? '◐ Devam edilecek' : '→ Sıradaki konu') : counts.total ? 'Müfredat tamamlandı 🎉' : 'Müfredat tanımlı değil'}
        </div>
        ${next ? `
          <div style="font-size:14px;font-weight:800;color:var(--text-primary);margin-top:2px;">${escHtml(next.name)}</div>
          <div style="font-size:12px;color:var(--text-muted);">${row.multi ? escHtml(next.subjectName) + ' · ' : ''}${escHtml(next.unitName)}</div>
          ${next.s === 'partial' && next.note ? `<div style="font-size:12px;margin-top:3px;"><b>Kaldığın yer:</b> ${escHtml(next.note)}</div>` : ''}` : ''}
      </div>
    </div>`;
}

function bodyHtml() {
  const state = getState();
  const p = period();
  const today = todayStr();
  const monthly = view === 'ay';
  const isCurrent = today >= p.start && today < p.end;

  const type = audience === 'students' ? 'student' : 'group';
  const list = (audience === 'students' ? state.students : state.groups).filter((e) => e.status !== 'passive');
  const rows = list.map((e) => entityRow(state, e, type, p));

  const all = rows.flatMap((r) => r.lessons);
  const tiles = [
    { v: all.filter((x) => x.st !== 'postponed').length, l: today >= p.end ? 'Programdaki ders' : 'Planlanan ders', c: 'var(--brand-green-light)', bg: 'var(--brand-green-soft)' },
    { v: all.filter((x) => x.st === 'done').length, l: 'Tamamlandı', c: '#047857', bg: 'rgba(16,185,129,0.10)' },
    { v: all.filter((x) => x.st === 'waiting').length, l: 'Onay bekliyor', c: '#b45309', bg: 'rgba(245,158,11,0.12)' },
    { v: all.filter((x) => x.st === 'postponed').length, l: 'Ertelendi', c: 'var(--text-secondary)', bg: 'var(--bg-secondary)' },
    { v: rows.reduce((n, r) => n + r.topics.filter((t) => t.s === 'done').length, 0), l: `Bu ${p.word} biten konu`, c: '#047857', bg: 'rgba(16,185,129,0.10)' },
  ];

  // sınıf düzeyine göre bölümler (7. Sınıf, 8. Sınıf, Mezun …)
  const byGrade = new Map();
  for (const r of rows) {
    const g = r.entity.grade || 'Diğer';
    if (!byGrade.has(g)) byGrade.set(g, []);
    byGrade.get(g).push(r);
  }
  const gradeOrder = (g) => (parseInt(g, 10) || (g === 'Mezun' ? 13 : 99));
  const sections = [...byGrade.entries()].sort((a, b) => gradeOrder(a[0]) - gradeOrder(b[0]));

  const nav = (label, attrs, active) =>
    `<button type="button" ${attrs} class="btn btn-sm" style="padding:7px 12px;border-radius:10px;font-weight:700;${active ? 'background:var(--brand-green);color:#fff;border-color:var(--brand-green);' : ''}">${label}</button>`;

  return `
    <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px;">
      <div>
        <h2>Takip</h2>
        <p>${p.title} · ${audience === 'students' ? 'öğrenci öğrenci' : 'grup grup'} ${isCurrent ? 'bu' : 'o'} ${p.gen} dersleri ve işlenen konular</p>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        <div style="display:flex;gap:4px;background:var(--bg-secondary);padding:4px;border-radius:12px;">
          ${nav('Gruplar', 'data-aud="groups"', audience === 'groups')}${nav('Öğrenciler', 'data-aud="students"', audience === 'students')}
        </div>
        <div style="display:flex;gap:4px;background:var(--bg-secondary);padding:4px;border-radius:12px;">
          ${nav('Haftalık', 'data-view="hafta"', view === 'hafta')}${nav('Aylık', 'data-view="ay"', view === 'ay')}
        </div>
        <div style="display:flex;gap:4px;background:var(--bg-secondary);padding:4px;border-radius:12px;">
          ${nav('←', `data-go="${p.prev}"`, false)}${nav(view === 'ay' ? 'Bu ay' : 'Bu hafta', 'data-go="today"', isCurrent)}${nav('→', `data-go="${p.next}"`, false)}
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px;">
      ${tiles.map((t) => `
        <div class="premium-card" style="padding:14px 16px;display:flex;align-items:center;gap:12px;">
          <span style="min-width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;background:${t.bg};color:${t.c};padding:0 8px;">${t.v}</span>
          <span style="font-size:13px;font-weight:700;color:var(--text-secondary);">${t.l}</span>
        </div>`).join('')}
    </div>

    ${today < p.start ? `<div class="premium-card" style="padding:12px 16px;margin-bottom:16px;font-size:13px;color:var(--text-secondary);">Bu dönem henüz gelmedi: planlanan dersler ve her ${type === 'group' ? 'grubun' : 'öğrencinin'} şu anki konusu görünüyor.</div>` : ''}

    ${sections.length === 0 ? `<div class="premium-card" style="padding:24px;text-align:center;color:var(--text-muted);">Henüz aktif ${type === 'group' ? 'grup' : 'öğrenci'} yok.</div>` : ''}

    <div style="display:flex;flex-direction:column;gap:18px;">
      ${sections.map(([grade, rs]) => {
        const lessons = rs.flatMap((r) => r.lessons).filter((x) => x.st !== 'postponed');
        const done = lessons.filter((x) => x.st === 'done').length;
        return `
          <section class="premium-card" style="padding:0;overflow:hidden;">
            <div style="display:flex;align-items:center;gap:10px;padding:14px 20px;background:var(--bg-secondary);flex-wrap:wrap;">
              <span style="width:12px;height:12px;border-radius:50%;background:${getAvatarColor(grade)};"></span>
              <h3 style="margin:0;font-size:16px;font-weight:800;">${escHtml(grade)}</h3>
              <span style="font-size:12px;color:var(--text-muted);">${rs.length} ${type === 'group' ? 'grup' : 'öğrenci'}</span>
              <span style="margin-left:auto;font-size:12px;font-weight:700;color:var(--text-secondary);">${lessons.length ? `${done}/${lessons.length} ders tamamlandı` : `bu ${p.word} ders yok`}</span>
            </div>
            ${rs.sort((a, b) => a.entity.name.localeCompare(b.entity.name, 'tr')).map((r) => rowHtml(r, p, monthly, today)).join('')}
          </section>`;
      }).join('')}
    </div>

    <div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:16px;font-size:12px;color:var(--text-muted);">
      <span><b style="color:#047857;">✓</b> tamamlandı</span>
      <span><b style="color:#b45309;">!</b> saati geçti, onay bekliyor (tıklayıp onayla)</span>
      <span><b style="color:#ef4444;">●</b> şu an</span>
      <span>○ yaklaşan</span>
      <span>↷ ertelendi</span>
      <span><b style="color:#7c3aed;">◐</b> yarım kalan değerlendirme (telafi) — sıradaki konu sayılmaz</span>
    </div>
    <style>@media (max-width: 900px) { .tracking-row { grid-template-columns: 1fr !important; } }</style>
  `;
}

export function renderTracking(navigate) {
  return {
    html: `<div class="fade-in" id="tracking-root">${bodyHtml()}</div>`,
    init: (el, nav) => {
      const root = el.querySelector('#tracking-root');
      const rerender = () => {
        root.innerHTML = bodyHtml();
        bind();
      };
      const bind = () => {
        root.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => { view = b.dataset.view; rerender(); }));
        root.querySelectorAll('[data-aud]').forEach((b) => b.addEventListener('click', () => { audience = b.dataset.aud; rerender(); }));
        root.querySelectorAll('[data-go]').forEach((b) =>
          b.addEventListener('click', () => { anchor = b.dataset.go === 'today' ? null : b.dataset.go; rerender(); }),
        );
        root.querySelectorAll('[data-open-lesson]').forEach((b) =>
          b.addEventListener('click', () => import('./modals/LessonEvalModal.js').then((m) => m.openLessonEvalModal(b.dataset.openLesson, nav || navigate))),
        );
        root.querySelectorAll('[data-open-entity]').forEach((b) =>
          b.addEventListener('click', () => {
            if (b.dataset.type === 'group') import('./modals/GroupDetailModal.js').then((m) => m.openGroupDetail(b.dataset.openEntity, nav || navigate));
            else import('./modals/StudentDetailModal.js').then((m) => m.openStudentDetail(b.dataset.openEntity, nav || navigate));
          }),
        );
      };
      bind();
    },
  };
}
