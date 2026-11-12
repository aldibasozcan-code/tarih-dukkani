// ═════════════════════════════════════════════════
// RAPORLAR — grup/öğrenci seçimi, A4 önizleme, PDF
// ═════════════════════════════════════════════════
import { getState } from '../store/store.js';
import { icon } from '../components/icons.js';
import { escHtml, todayStr } from '../utils/helpers.js';
import { progressCounts } from '../lib/progress.js';
import { buildReport, printReport, REPORT_CSS } from '../lib/report.js';

let selected = null; // Set<"group:id" | "student:id">; null = hepsi seçili
let mode = 'ikisi'; // 'ikisi' | 'bar' | 'pasta'
let stage = 'pick'; // 'pick' | 'preview'

const gradeOrder = (g) => parseInt(g, 10) || (g === 'Mezun' ? 13 : 99);

function entities(state) {
  const byGradeName = (a, b) => gradeOrder(a.entity.grade || '') - gradeOrder(b.entity.grade || '') || a.entity.name.localeCompare(b.entity.name, 'tr');
  return [
    ...state.groups.filter((g) => g.status !== 'passive').map((e) => ({ id: `group:${e.id}`, entity: e, type: 'group' })).sort(byGradeName),
    ...state.students.filter((s) => s.status !== 'passive').map((e) => ({ id: `student:${e.id}`, entity: e, type: 'student' })).sort(byGradeName),
  ];
}

function pickHtml(state) {
  const all = entities(state);
  if (!selected) selected = new Set(all.map((x) => x.id));
  const block = (type, title) => {
    const list = all.filter((x) => x.type === type);
    if (!list.length) return '';
    const byGrade = new Map();
    for (const x of list) {
      const g = x.entity.grade || 'Diğer';
      if (!byGrade.has(g)) byGrade.set(g, []);
      byGrade.get(g).push(x);
    }
    return `
      <div style="margin-bottom:24px;">
        <h3 style="font-size:15px;font-weight:800;margin:0 0 10px;">${title}</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;">
          ${[...byGrade.entries()].sort((a, b) => gradeOrder(a[0]) - gradeOrder(b[0])).map(([g, xs]) => {
            const n = xs.filter((x) => selected.has(x.id)).length;
            return `
              <div class="premium-card" style="padding:0;overflow:hidden;">
                <label style="text-transform:none;letter-spacing:0;display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--bg-secondary);font-weight:800;cursor:pointer;">
                  <input type="checkbox" data-grade-toggle="${escHtml(type + '|' + g)}" ${n === xs.length ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--brand-green);">
                  ${escHtml(g)} <span style="margin-left:auto;font-size:12px;font-weight:600;color:var(--text-muted);">${n}/${xs.length}</span>
                </label>
                ${xs.sort((a, b) => a.entity.name.localeCompare(b.entity.name, 'tr')).map((x) => {
                  const c = progressCounts(state, x.entity);
                  return `
                    <label style="text-transform:none;letter-spacing:0;display:flex;align-items:center;gap:10px;padding:8px 14px;font-size:13px;cursor:pointer;border-top:1px solid var(--border);">
                      <input type="checkbox" data-pick="${escHtml(x.id)}" ${selected.has(x.id) ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--brand-green);">
                      <span style="font-weight:700;">${escHtml(x.entity.name)}</span>
                      <span style="margin-left:auto;font-size:12px;display:flex;gap:8px;">
                        <span style="color:#16a34a;">✓ ${c.done}</span>${c.partial ? `<span style="color:#dc2626;">◐ ${c.partial}</span>` : ''}<span style="color:#2563eb;">○ ${c.none}</span>
                      </span>
                    </label>`;
                }).join('')}
              </div>`;
          }).join('')}
        </div>
      </div>`;
  };
  const allOn = all.length > 0 && all.every((x) => selected.has(x.id));
  return `
    <div class="page-header">
      <h2>Durum Raporu</h2>
      <p>Hangi gruplar ve öğrenciler için rapor hazırlamak istiyorsun? Aktif olanların hepsi hazır seçili; istemediklerinin işaretini kaldır.
        Rapor her birinin müfredatını sırasıyla listeler: <b style="color:#16a34a;">✓ tamamlananlar yeşil</b>, <b style="color:#dc2626;">◐ yarım kalanlar kırmızı</b>, <b style="color:#2563eb;">○ işlenmeyenler mavi</b>.</p>
    </div>
    <div class="premium-card" style="display:flex;flex-wrap:wrap;align-items:center;gap:14px;padding:14px 18px;margin-bottom:20px;position:sticky;top:0;z-index:5;">
      <label style="text-transform:none;letter-spacing:0;display:flex;align-items:center;gap:8px;font-weight:800;cursor:pointer;">
        <input type="checkbox" id="rp-all" ${allOn ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--brand-green);"> Tümü
      </label>
      <span style="font-size:13px;color:var(--text-muted);">${selected.size} / ${all.length} seçili</span>
      <label style="text-transform:none;letter-spacing:0;margin-left:auto;display:flex;align-items:center;gap:8px;font-size:13px;">
        <span style="color:var(--text-muted);">Grafikler</span>
        <select id="rp-mode" style="padding:6px 10px;border-radius:8px;">
          <option value="ikisi" ${mode === 'ikisi' ? 'selected' : ''}>Bar + Pasta</option>
          <option value="bar" ${mode === 'bar' ? 'selected' : ''}>Sadece bar</option>
          <option value="pasta" ${mode === 'pasta' ? 'selected' : ''}>Sadece pasta</option>
        </select>
      </label>
      <button class="btn btn-primary" id="rp-make" ${selected.size ? '' : 'disabled'} style="background:var(--brand-green);color:#fff;">
        ${icon('fileText', 15)} Raporu hazırla
      </button>
    </div>
    ${all.length ? block('group', 'Gruplar') + block('student', 'Öğrenciler') : `<div class="premium-card" style="padding:24px;text-align:center;color:var(--text-muted);">Henüz aktif grup ya da öğrenci yok.</div>`}`;
}

function previewHtml(state) {
  const items = entities(state).filter((x) => selected.has(x.id));
  const tab = (m, l) => `<button type="button" data-mode="${m}" class="btn btn-sm" style="padding:7px 12px;border-radius:10px;font-weight:700;${mode === m ? 'background:var(--brand-green);color:#fff;' : ''}">${l}</button>`;
  return `
    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:16px;">
      <button class="btn btn-secondary" id="rp-back">${icon('arrowLeft', 14)} Seçime dön</button>
      <div style="display:flex;gap:4px;background:var(--bg-secondary);padding:4px;border-radius:12px;">${tab('ikisi', 'Bar + Pasta')}${tab('bar', 'Sadece bar')}${tab('pasta', 'Sadece pasta')}</div>
      <button class="btn btn-primary" id="rp-print" style="background:var(--brand-green);color:#fff;">${icon('download', 15)} PDF olarak indir</button>
      <span style="font-size:12px;color:var(--text-muted);">Açılan pencerede hedef olarak “PDF olarak kaydet”i seç.</span>
    </div>
    <style>${REPORT_CSS}</style>
    <div style="overflow-x:auto;">
      <div class="bt-report" id="rp-sheet" style="background:#fff;width:210mm;min-width:210mm;margin:0 auto;padding:12mm;border-radius:14px;box-shadow:var(--shadow-premium);">
        ${buildReport(state, items, mode)}
      </div>
    </div>`;
}

export function renderReports(navigate) {
  return {
    html: `<div class="fade-in" id="reports-root"></div>`,
    init: (el) => {
      const root = el.querySelector('#reports-root');
      const render = () => {
        const state = getState();
        root.innerHTML = stage === 'preview' ? previewHtml(state) : pickHtml(state);
        bind();
      };
      const bind = () => {
        const state = getState();
        const all = entities(state);
        root.querySelector('#rp-all')?.addEventListener('change', (e) => {
          selected = new Set(e.target.checked ? all.map((x) => x.id) : []);
          render();
        });
        root.querySelectorAll('[data-pick]').forEach((cb) =>
          cb.addEventListener('change', () => {
            cb.checked ? selected.add(cb.dataset.pick) : selected.delete(cb.dataset.pick);
            render();
          }),
        );
        root.querySelectorAll('[data-grade-toggle]').forEach((cb) =>
          cb.addEventListener('change', () => {
            const [type, g] = cb.dataset.gradeToggle.split('|');
            all.filter((x) => x.type === type && (x.entity.grade || 'Diğer') === g).forEach((x) => (cb.checked ? selected.add(x.id) : selected.delete(x.id)));
            render();
          }),
        );
        root.querySelector('#rp-mode')?.addEventListener('change', (e) => (mode = e.target.value));
        root.querySelector('#rp-make')?.addEventListener('click', () => { stage = 'preview'; render(); });
        root.querySelector('#rp-back')?.addEventListener('click', () => { stage = 'pick'; render(); });
        root.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => { mode = b.dataset.mode; render(); }));
        root.querySelector('#rp-print')?.addEventListener('click', () => {
          const t = todayStr();
          printReport(root.querySelector('#rp-sheet').innerHTML, `Durum Raporu ${t.slice(8, 10)}.${t.slice(5, 7)}.${t.slice(0, 4)}`);
        });
      };
      render();
    },
  };
}
