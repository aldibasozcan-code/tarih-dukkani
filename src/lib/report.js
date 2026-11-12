// ═════════════════════════════════════════════════
// DURUM RAPORU — seçilen grup/öğrenciler için A4 rapor (HTML + SVG grafikler)
// PDF, tarayıcının yazdırma özelliğiyle üretilir: Türkçe karakterler ve renkler bozulmaz.
// ═════════════════════════════════════════════════
import { escHtml, todayStr } from '../utils/helpers.js';
import { topicsWithState, isAssessment } from './progress.js';

// ─── tarih yardımcıları ───
const D = (s) => new Date(s + 'T12:00:00Z');
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (s, n) => iso(new Date(D(s).getTime() + n * 86400000));
const weekStart = (s) => { const w = D(s).getUTCDay() || 7; return addDays(s, 1 - w); };
const daysBetween = (a, b) => Math.round((D(b) - D(a)) / 86400000);
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const short = (s) => `${s.slice(8, 10)}.${s.slice(5, 7)}.${s.slice(0, 4)}`;
const dm = (s) => `${s.slice(8, 10)}.${s.slice(5, 7)}`;
const longDate = (s) => `${Number(s.slice(8, 10))} ${MONTHS[Number(s.slice(5, 7)) - 1]} ${s.slice(0, 4)}`;

const C = { done: '#16a34a', partial: '#dc2626', none: '#2563eb', noneSoft: '#dbe6fd', ink: '#1c1a2e', muted: '#6c6880', line: '#e6e3ef', brand: '#004526' };
const BG = { done: '#f0fdf4', partial: '#fef2f2', none: '#ffffff' };
const WEEKS = 8;

// ─── SVG parçaları ───
export function statusIcon(s, size = 18) {
  if (s === 'done')
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="flex-shrink:0"><circle cx="12" cy="12" r="11" fill="${C.done}"/><path d="M7 12.5l3.2 3.2L17.2 8.6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  if (s === 'partial')
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="flex-shrink:0"><circle cx="12" cy="12" r="10" fill="#fff" stroke="${C.partial}" stroke-width="2.2"/><path d="M12 4a8 8 0 0 0 0 16z" fill="${C.partial}"/></svg>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="flex-shrink:0"><circle cx="12" cy="12" r="10" fill="#fff" stroke="${C.none}" stroke-width="2.2"/><circle cx="12" cy="12" r="3" fill="${C.none}" opacity=".35"/></svg>`;
}

function donut(k, size = 120, th = 18, label = '') {
  const total = k.done + k.partial + k.none || 1;
  const r = (size - th) / 2;
  const circ = 2 * Math.PI * r;
  let off = 0;
  const segs = ['done', 'partial', 'none'].map((s) => {
    const len = (k[s] / total) * circ;
    const seg = len > 0 ? `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${s === 'none' ? C.noneSoft : C[s]}" stroke-width="${th}" stroke-dasharray="${len} ${circ - len}" stroke-dashoffset="${-off}"/>` : '';
    off += len;
    return seg;
  }).join('');
  const pct = Math.round((k.done / total) * 100);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="flex-shrink:0">
    <g transform="rotate(-90 ${size / 2} ${size / 2})"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${C.line}" stroke-width="${th}"/>${segs}</g>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-weight="700" font-size="${size * 0.2}" fill="${C.ink}">%${pct}</text>
    ${label ? `<text x="50%" y="${size / 2 + size * 0.17}" text-anchor="middle" font-size="${size * 0.085}" fill="${C.muted}">${label}</text>` : ''}
  </svg>`;
}

function donutLegend(k) {
  const total = k.done + k.partial + k.none || 1;
  return `<div class="rp-legend-col">${[['done', 'Tamamlandı'], ['partial', 'Yarım kaldı'], ['none', 'İşlenmedi']]
    .map(([s, l]) => `<div class="rp-lrow">${statusIcon(s, 14)}<span style="width:76px">${l}</span><b style="color:${C[s]}">${k[s]}</b><span style="color:${C.muted}">(%${Math.round((k[s] / total) * 100)})</span></div>`)
    .join('')}</div>`;
}

function stackBar(k, h = 10, pct = true) {
  const total = k.done + k.partial + k.none || 1;
  const w = (n) => `${(n / total) * 100}%`;
  return `<div class="rp-bar"><div class="rp-bar-track" style="height:${h}px"><div style="width:${w(k.done)};background:${C.done}"></div><div style="width:${w(k.partial)};background:${C.partial}"></div></div>${pct ? `<span class="rp-bar-pct">%${Math.round((k.done / total) * 100)}</span>` : ''}</div>`;
}

function columnChart(data, h = 110) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return `<div class="rp-cols" style="height:${h}px">${data
    .map((d) => `<div class="rp-col"><span style="color:${d.value ? C.ink : C.muted}">${d.value}</span><div style="height:${(d.value / max) * (h - 18)}px;background:${d.value ? '#059669' : C.line}"></div></div>`)
    .join('')}</div><div class="rp-col-labels">${data.map((d) => `<span>${d.label}</span>`).join('')}</div>`;
}

const kpi = (v, l, color = C.ink, sub = '') => `<div class="rp-kpi"><div class="rp-kpi-v" style="color:${color}">${v}</div><div class="rp-kpi-l">${l}</div>${sub ? `<div class="rp-kpi-s">${sub}</div>` : ''}</div>`;
const panel = (title, body) => `<div class="rp-panel"><div class="rp-panel-t">${title}</div>${body}</div>`;
const legend = () => `<div class="rp-legend">${[['done', 'Tamamlandı'], ['partial', 'Yarım kaldı (telafi)'], ['none', 'Henüz işlenmedi']].map(([s, l]) => `<span style="color:${C[s]}">${statusIcon(s, 16)} ${l}</span>`).join('')}</div>`;

// ─── istatistikler ───
function statsFor(state, entity, type, today, weekStarts) {
  const topics = topicsWithState(state, entity);
  const k = { done: topics.filter((t) => t.s === 'done').length, partial: topics.filter((t) => t.s === 'partial').length };
  k.none = topics.length - k.done - k.partial;
  const lessons = state.lessons.filter((l) => l.type === type && l.refId === entity.id && l.status === 'completed').map((l) => l.date).sort();
  const activity = [...lessons, ...topics.filter((t) => t.s !== 'none' && t.date).map((t) => t.date)].sort();
  const first = activity[0] || null;
  const weeksSince = first ? Math.max(1, daysBetween(first, today) / 7) : 0;
  const pace = weeksSince ? k.done / weeksSince : 0;
  const enough = first && daysBetween(first, today) >= 14;
  const etaWeeks = enough && pace > 0 ? Math.ceil((k.none + k.partial * 0.5) / pace) : null;
  return {
    topics, k,
    pct: topics.length ? Math.round((k.done / topics.length) * 100) : 0,
    lessons: lessons.length,
    lastLesson: lessons[lessons.length - 1] || null,
    perWeek: weeksSince ? lessons.length / weeksSince : 0,
    pace, etaWeeks, eta: etaWeeks != null ? addDays(today, etaWeeks * 7) : null,
    weekly: weekStarts.map((ws) => ({ label: dm(ws), value: lessons.filter((d) => d >= ws && d < addDays(ws, 7)).length })),
  };
}

/**
 * @param items [{ entity, type: 'group'|'student' }]
 * @param mode  'ikisi' | 'bar' | 'pasta'
 * @returns HTML gövdesi (REPORT_CSS ile birlikte kullanılır)
 */
export function buildReport(state, items, mode = 'ikisi') {
  const showBar = mode !== 'pasta';
  const showPie = mode !== 'bar';
  const today = todayStr();
  const ws0 = weekStart(today);
  const weekStarts = Array.from({ length: WEEKS }, (_, i) => addDays(ws0, -7 * (WEEKS - 1 - i)));
  const rows = items.map((it) => ({ ...it, s: statsFor(state, it.entity, it.type, today, weekStarts) }));

  const tot = rows.reduce((a, r) => ({ done: a.done + r.s.k.done, partial: a.partial + r.s.k.partial, none: a.none + r.s.k.none }), { done: 0, partial: 0, none: 0 });
  const totalTopics = tot.done + tot.partial + tot.none;
  const allDates = rows.flatMap((r) => state.lessons.filter((l) => l.type === r.type && l.refId === r.entity.id && l.status === 'completed').map((l) => l.date));
  const thisWeek = allDates.filter((d) => d >= ws0).length;
  const weeklyAll = weekStarts.map((ws) => ({ label: dm(ws), value: allDates.filter((d) => d >= ws && d < addDays(ws, 7)).length }));

  const byGrade = new Map();
  for (const r of rows) {
    const g = r.entity.grade || 'Diğer';
    const c = byGrade.get(g) || { done: 0, partial: 0, none: 0 };
    c.done += r.s.k.done; c.partial += r.s.k.partial; c.none += r.s.k.none;
    byGrade.set(g, c);
  }
  const partials = rows.flatMap((r) => r.s.topics.filter((t) => t.s === 'partial').map((t) => ({ r, t })));

  // ─── özet sayfası ───
  let html = `
  <header class="rp-head"><div><div class="rp-brand">${escHtml(state.settings?.appName || 'Bitig.app')}</div><h1>Ders Durum Raporu</h1></div>
    <div class="rp-head-r"><b>${longDate(today)}</b><div>${rows.length} grup / öğrenci</div>${state.profile?.name ? `<div>${escHtml(state.profile.name)}</div>` : ''}</div></header>
  ${legend()}
  <div class="rp-kpis">
    ${kpi(rows.length, 'Grup / öğrenci')}
    ${kpi(totalTopics, 'Toplam konu')}
    ${kpi(tot.done, 'Tamamlanan', C.done, `%${totalTopics ? Math.round((tot.done / totalTopics) * 100) : 0}`)}
    ${kpi(tot.partial, 'Yarım kalan', C.partial, 'telafi bekliyor')}
    ${kpi(allDates.length, 'Tamamlanan ders', C.ink, `bu hafta ${thisWeek}`)}
  </div>
  <div class="rp-grid ${showPie && showBar ? 'rp-g-auto' : ''} rp-avoid">
    ${showPie ? panel('Genel dağılım', `<div class="rp-flex">${donut(tot, 130, 18, 'tamamlandı')}${donutLegend(tot)}</div>`) : ''}
    ${showBar ? panel('Grup / öğrenci bazında ilerleme', rows.map((r) => `<div class="rp-brow"><span>${escHtml(r.entity.name)}</span>${stackBar(r.s.k, 9)}</div>`).join('')) : ''}
  </div>
  <div class="rp-grid rp-g-2 rp-avoid">
    ${panel(`Son ${WEEKS} haftada tamamlanan ders`, columnChart(weeklyAll))}
    ${panel('Sınıf düzeyine göre tamamlanma', showPie && !showBar
      ? `<div class="rp-flex rp-wrap">${[...byGrade.entries()].map(([g, k]) => `<div class="rp-mini">${donut(k, 64, 10)}<span>${escHtml(g)}</span></div>`).join('')}</div>`
      : [...byGrade.entries()].map(([g, k]) => `<div class="rp-brow"><span>${escHtml(g)}</span>${stackBar(k, 9)}</div>`).join(''))}
  </div>
  <table class="rp-table"><thead><tr><th>Grup / öğrenci</th><th class="c">${statusIcon('done', 14)}</th><th class="c">${statusIcon('partial', 14)}</th><th class="c">${statusIcon('none', 14)}</th><th class="c">Ders</th><th class="c">Hafta/ort.</th><th>Tahmini bitiş</th><th class="r">Son ders</th></tr></thead><tbody>
    ${rows.map((r) => `<tr><td><b>${escHtml(r.entity.name)}</b></td><td class="c" style="color:${C.done}">${r.s.k.done}</td><td class="c" style="color:${C.partial}">${r.s.k.partial}</td><td class="c" style="color:${C.none}">${r.s.k.none}</td><td class="c">${r.s.lessons}</td><td class="c">${r.s.perWeek ? r.s.perWeek.toFixed(1) : '—'}</td><td>${r.s.eta ? `${short(r.s.eta)} (≈${r.s.etaWeeks} hf)` : `<span style="color:${C.muted}">veri yetersiz</span>`}</td><td class="r" style="color:${C.muted}">${r.s.lastLesson ? short(r.s.lastLesson) : '—'}</td></tr>`).join('')}
  </tbody></table>
  <p class="rp-note">Tahmini bitiş: şimdiye kadarki konu bitirme hızına göre kaba tahmindir; en az 2 haftalık kayıt biriktiğinde hesaplanır.</p>
  ${partials.length ? `<div class="rp-telafi rp-avoid"><div class="rp-telafi-t">${statusIcon('partial', 18)} Yarım kalan konular — telafi listesi (${partials.length})</div><ul>${partials.map(({ r, t }) => `<li><b>${escHtml(r.entity.name)}</b> · ${escHtml(t.name)} <span style="color:${C.muted}">(${escHtml(t.unitName)})</span>${t.note ? `<span style="color:${C.partial}"> — kaldığın yer: ${escHtml(t.note)}</span>` : ''}</li>`).join('')}</ul></div>` : ''}`;

  // ─── her grup/öğrenci ayrı sayfa ───
  for (const r of rows) {
    const s = r.s;
    const multi = new Set(s.topics.map((t) => t.subject)).size > 1;
    const units = [];
    for (const t of s.topics) {
      const title = (multi ? t.subjectName + ' · ' : '') + t.unitName;
      if (units[units.length - 1]?.title !== title) units.push({ title, topics: [] });
      units[units.length - 1].topics.push(t);
    }
    const uk = (u) => { const d = u.topics.filter((t) => t.s === 'done').length; const p = u.topics.filter((t) => t.s === 'partial').length; return { done: d, partial: p, none: u.topics.length - d - p }; };
    html += `
    <section class="rp-page">
      <div class="rp-head rp-head-sm"><div><h2>${escHtml(r.entity.name)}</h2><div class="rp-sub">${r.type === 'group' ? 'Grup' : 'Öğrenci'} · ${escHtml(r.entity.grade || '')}</div></div>
        <div class="rp-head-r">Son ders: <b>${s.lastLesson ? short(s.lastLesson) : 'kayıt yok'}</b></div></div>
      <div class="rp-flex rp-avoid" style="gap:18px;margin-top:12px">
        ${showPie ? `<div class="rp-flex">${donut(s.k, 104, 15, 'tamamlandı')}${donutLegend(s.k)}</div>` : ''}
        <div class="rp-kpis ${showPie ? 'rp-k2' : 'rp-k4'}" style="flex:1;margin:0">
          ${kpi(s.lessons, 'Tamamlanan ders', C.ink, s.perWeek ? `haftada ort. ${s.perWeek.toFixed(1)}` : '')}
          ${kpi(s.pace ? s.pace.toFixed(1) : '—', 'Konu / hafta', C.ink, 'bitirme hızı')}
          ${!showPie ? kpi(`%${s.pct}`, 'Tamamlanma', C.done, `${s.k.done}/${s.topics.length} konu`) : ''}
          ${kpi(s.eta ? dm(s.eta) : '—', 'Tahmini bitiş', C.brand, s.etaWeeks != null ? `≈ ${s.etaWeeks} hafta` : 'veri yetersiz')}
          ${kpi(s.k.partial, 'Telafi bekleyen', C.partial, 'yarım kalan konu')}
        </div>
      </div>
      ${showBar ? `<div style="margin-top:12px">${stackBar(s.k, 12)}</div>` : ''}
      <div class="rp-grid rp-g-unit rp-avoid">
        ${panel('Ünite bazında ilerleme', showBar
          ? units.map((u) => `<div class="rp-urow"><div>${escHtml(u.title)}</div>${stackBar(uk(u), 7)}</div>`).join('')
          : `<div class="rp-flex rp-wrap">${units.map((u, i) => `<div class="rp-mini" title="${escHtml(u.title)}">${donut(uk(u), 52, 8)}<span>${i + 1}. ünite</span></div>`).join('')}</div>`)}
        ${panel(`Son ${WEEKS} hafta ders sayısı`, columnChart(s.weekly, 90))}
      </div>
      <div class="rp-units">
        ${units.map((u) => { const k = uk(u); return `
          <div class="rp-avoid"><div class="rp-uhead"><span>${escHtml(u.title)}</span><span>${k.done}/${u.topics.length}</span></div>
            <ul class="rp-topics">${u.topics.map((t) => `
              <li style="background:${BG[t.s]}">${statusIcon(t.s, 18)}<span class="rp-tname" style="color:${t.s === 'none' ? C.none : t.s === 'partial' ? C.partial : C.ink}">${escHtml(t.name)}${isAssessment(t.name) ? ' <i class="rp-tag">değerlendirme</i>' : ''}${t.s === 'partial' && t.note ? `<small> — kaldığın yer: ${escHtml(t.note)}</small>` : ''}</span>
              <span class="rp-tdate">${t.s === 'done' && t.date ? short(t.date) : t.s === 'partial' ? 'yarım' : ''}</span></li>`).join('')}</ul></div>`; }).join('')}
      </div>
    </section>`;
  }
  return html;
}

export const REPORT_CSS = `
.bt-report{color:${C.ink};font-family:Inter,'Plus Jakarta Sans',system-ui,sans-serif;font-size:13px;line-height:1.35;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.bt-report *{box-sizing:border-box}
.bt-report h1{font-size:24px;margin:0;font-weight:800}
.bt-report h2{font-size:20px;margin:0;font-weight:800}
.bt-report .rp-head{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid ${C.ink};padding-bottom:10px}
.bt-report .rp-brand{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.brand}}
.bt-report .rp-head-r{text-align:right;font-size:12px;color:${C.muted}}
.bt-report .rp-head-r b{color:${C.ink}}
.bt-report .rp-sub{font-size:12px;color:${C.muted}}
.bt-report .rp-legend{display:flex;flex-wrap:wrap;gap:18px;margin-top:10px;font-size:12px;font-weight:700}
.bt-report .rp-legend span{display:inline-flex;align-items:center;gap:6px}
.bt-report .rp-kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:14px}
.bt-report .rp-k2{grid-template-columns:repeat(2,1fr)}
.bt-report .rp-k4{grid-template-columns:repeat(4,1fr)}
.bt-report .rp-kpi{border:1px solid ${C.line};border-radius:8px;padding:8px 10px}
.bt-report .rp-kpi-v{font-size:20px;font-weight:800;line-height:1.1}
.bt-report .rp-kpi-l{font-size:11px;font-weight:700}
.bt-report .rp-kpi-s{font-size:10px;color:${C.muted}}
.bt-report .rp-grid{display:grid;gap:14px;margin-top:14px}
.bt-report .rp-g-auto{grid-template-columns:auto 1fr}
.bt-report .rp-g-2{grid-template-columns:1fr 1fr}
.bt-report .rp-g-unit{grid-template-columns:1.4fr 1fr}
.bt-report .rp-panel{border:1px solid ${C.line};border-radius:8px;padding:10px 12px}
.bt-report .rp-panel-t{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:#4b4763;margin-bottom:8px}
.bt-report .rp-flex{display:flex;align-items:center;gap:14px}
.bt-report .rp-wrap{flex-wrap:wrap;gap:10px}
.bt-report .rp-legend-col{display:flex;flex-direction:column;gap:5px;font-size:12px}
.bt-report .rp-lrow{display:flex;align-items:center;gap:6px}
.bt-report .rp-bar{display:flex;align-items:center;gap:8px}
.bt-report .rp-bar-track{flex:1;display:flex;overflow:hidden;border-radius:99px;background:${C.noneSoft}}
.bt-report .rp-bar-pct{width:36px;text-align:right;font-size:11px;font-weight:700}
.bt-report .rp-brow{display:flex;align-items:center;gap:8px;font-size:12px;margin-bottom:5px}
.bt-report .rp-brow>span{width:110px;flex-shrink:0;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-report .rp-brow>.rp-bar{flex:1}
.bt-report .rp-urow{font-size:11px;margin-bottom:5px}
.bt-report .rp-urow>div:first-child{color:${C.muted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bt-report .rp-mini{display:flex;flex-direction:column;align-items:center;font-size:10px;font-weight:700;width:68px;text-align:center}
.bt-report .rp-cols{display:flex;align-items:flex-end;gap:2%}
.bt-report .rp-col{flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;font-size:10px;font-weight:700}
.bt-report .rp-col div{width:100%;border-radius:5px 5px 0 0;min-height:2px}
.bt-report .rp-col-labels{display:flex;gap:2%;border-top:1px solid ${C.line};margin-top:3px;padding-top:3px}
.bt-report .rp-col-labels span{flex:1;text-align:center;font-size:9px;color:${C.muted}}
.bt-report .rp-table{width:100%;border-collapse:collapse;margin-top:16px;font-size:12px}
.bt-report .rp-table th{text-align:left;color:${C.muted};border-bottom:1px solid ${C.line};padding:6px 6px 6px 0}
.bt-report .rp-table td{border-bottom:1px solid #f0eef6;padding:6px 6px 6px 0}
.bt-report .rp-table .c{text-align:center}.bt-report .rp-table .r{text-align:right}
.bt-report .rp-table th svg{vertical-align:middle}
.bt-report .rp-note{font-size:10px;color:${C.muted};margin:4px 0 0}
.bt-report .rp-telafi{margin-top:14px;border:1px solid ${C.partial};background:${BG.partial};border-radius:8px;padding:10px 12px}
.bt-report .rp-telafi-t{display:flex;align-items:center;gap:6px;font-weight:800;color:${C.partial};margin-bottom:6px}
.bt-report .rp-telafi ul{margin:0;padding-left:18px;font-size:12px}
.bt-report .rp-page{padding-top:28px}
.bt-report .rp-head-sm{padding-bottom:8px}
.bt-report .rp-units{margin-top:14px;display:flex;flex-direction:column;gap:12px}
.bt-report .rp-uhead{display:flex;justify-content:space-between;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;color:#4b4763;border-bottom:1px solid ${C.line};padding-bottom:2px;margin-bottom:3px}
.bt-report .rp-topics{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}
.bt-report .rp-topics li{display:flex;align-items:center;gap:8px;border-radius:6px;padding:4px 6px}
.bt-report .rp-tname{flex:1}
.bt-report .rp-tname small{font-size:11px}
.bt-report .rp-tdate{font-size:11px;color:${C.muted};flex-shrink:0}
.bt-report .rp-tag{font-style:normal;font-size:10px;font-weight:700;background:#ede9fe;color:#6d28d9;padding:0 5px;border-radius:5px}
@media print{
  @page{size:A4;margin:12mm}
  .bt-report .rp-page{break-before:page;padding-top:0}
  .bt-report .rp-avoid{break-inside:avoid}
}`;

/** Raporu ayrı bir belgede yazdırır (PDF olarak kaydet) */
export function printReport(bodyHtml, title) {
  const doc = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${escHtml(title)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>html,body{margin:0;background:#fff}${REPORT_CSS}</style></head>
    <body><div class="bt-report">${bodyHtml}</div></body></html>`;
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(frame);
  const w = frame.contentWindow;
  w.document.open();
  w.document.write(doc);
  w.document.close();
  const go = () => {
    w.focus();
    w.print();
    setTimeout(() => frame.remove(), 1500);
  };
  // yazı tipi yüklensin
  (w.document.fonts?.ready || Promise.resolve()).then(() => setTimeout(go, 200));
}
