// ═════════════════════════════════════════════════
// KONU SEÇİCİ — "Bu derste hangi konular işlendi?"
// Her konu için: İşlenmedi / Yarım kaldı / Bitti (+ "nerede kaldım?" notu)
// ═════════════════════════════════════════════════
import { escHtml } from '../utils/helpers.js';
import { nextTopic, STATUS, topicsWithState } from '../lib/progress.js';

const WINDOW = 4; // başta gösterilen konu sayısı

/**
 * @param state  uygulama durumu
 * @param entity grup ya da öğrenci
 * @param opts   { preselect?: {topicId, subject}, existing?: [{key, s, note}] }  existing: daha önce bu derse kaydedilmiş konular
 */
export function renderTopicPicker(state, entity, opts = {}) {
  const topics = topicsWithState(state, entity);
  if (topics.length === 0) return '';

  const next = nextTopic(state, entity);
  const existing = new Map((opts.existing || []).filter((x) => x.key).map((x) => [x.key, x]));
  const planned = opts.preselect?.topicId
    ? topics.find((t) => t.topicId === opts.preselect.topicId && (!opts.preselect.subject || t.subject === opts.preselect.subject))
    : null;
  const preKey = planned ? planned.key : next?.key;
  const startIdx = Math.max(0, topics.findIndex((t) => t.key === preKey));

  const inWin = (t) => (t.index >= startIdx && t.index < startIdx + WINDOW) || existing.has(t.key);
  // bir ünitenin en az bir konusu görünürse başlığı da görünür
  const visibleUnits = new Set(topics.filter(inWin).map((t) => t.subject + t.unitId));
  const multi = new Set(topics.map((t) => t.subject)).size > 1;

  let lastUnit = '';
  const rows = topics
    .map((t) => {
      const ex = existing.get(t.key);
      const sel = ex ? ex.s : existing.size === 0 && t.key === preKey ? 'done' : 'none';
      const note = ex?.note || (t.s === 'partial' ? t.note : '');
      const inWindow = inWin(t);
      const unitVisible = visibleUnits.has(t.subject + t.unitId);
      const header =
        t.subject + t.unitId !== lastUnit
          ? `<div class="tp-unit" data-tp-extra="${unitVisible ? '0' : '1'}" style="font-size:11px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin:12px 0 6px;${unitVisible ? '' : 'display:none;'}">${multi ? `${escHtml(t.subjectName)} · ` : ''}${escHtml(t.unitName)}</div>`
          : '';
      lastUnit = t.subject + t.unitId;
      const was =
        t.s === 'done'
          ? `<span style="font-size:11px;color:${STATUS.done.color};font-weight:600;">(önceden bitti)</span>`
          : t.s === 'partial'
            ? `<span style="font-size:11px;color:${STATUS.partial.color};font-weight:600;">(yarım kalmıştı)</span>`
            : '';
      return `${header}
        <div class="tp-row" data-key="${escHtml(t.key)}" data-orig="${t.s}" data-sel="${sel}" data-tp-extra="${inWindow ? '0' : '1'}"
             style="${inWindow ? '' : 'display:none;'}border:1px solid var(--border);border-radius:12px;padding:10px 12px;margin-bottom:8px;transition:background .15s;">
          <div style="font-size:13px;font-weight:600;color:var(--text-primary);display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
            ${escHtml(t.name)} ${was}
            ${t.assessment ? `<span style="font-size:10px;font-weight:700;background:#ede9fe;color:#6d28d9;padding:1px 6px;border-radius:6px;">değerlendirme</span>` : ''}
          </div>
          <div style="display:flex;gap:6px;margin-top:8px;">
            ${['none', 'partial', 'done']
              .map(
                (s) => `<button type="button" class="btn btn-sm tp-btn" data-st="${s}" style="flex:1;padding:6px 8px;font-size:12px;border-radius:8px;">${
                  s === 'done' ? '✓ ' : s === 'partial' ? '◐ ' : ''
                }${STATUS[s].label}</button>`,
              )
              .join('')}
          </div>
          <input type="text" class="tp-note" placeholder="Nerede kaldım? (örn. Sevr'in maddelerinde)" value="${escHtml(note)}"
                 style="margin-top:8px;width:100%;${sel === 'partial' ? '' : 'display:none;'}">
        </div>`;
    })
    .join('');

  const nextBox = next
    ? `<div style="background:${next.s === 'partial' ? STATUS.partial.soft : 'var(--brand-green-soft)'};border-radius:12px;padding:10px 12px;margin-bottom:12px;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;color:${next.s === 'partial' ? STATUS.partial.color : 'var(--brand-green-light)'};">
          ${next.s === 'partial' ? '◐ Devam edilecek' : '→ Sıradaki konu'}
        </div>
        <div style="font-size:14px;font-weight:700;color:var(--text-primary);">${escHtml(next.name)}</div>
        <div style="font-size:12px;color:var(--text-muted);">${escHtml(next.unitName)}</div>
        ${next.s === 'partial' && next.note ? `<div style="font-size:12px;margin-top:2px;"><b>Kaldığın yer:</b> ${escHtml(next.note)}</div>` : ''}
      </div>`
    : `<div style="background:var(--brand-green-soft);border-radius:12px;padding:10px 12px;margin-bottom:12px;font-weight:700;color:var(--brand-green-light);">Müfredat tamamlandı 🎉</div>`;

  return `
    <div class="topic-picker">
      <label style="display:block;font-size:13px;font-weight:700;margin-bottom:8px;">Bu derste işlenen konular</label>
      ${nextBox}
      <div class="tp-list">${rows}</div>
      <button type="button" class="tp-toggle" style="background:none;border:none;color:var(--accent-light);font-weight:600;font-size:13px;cursor:pointer;padding:4px 0;">
        Tüm konuları göster (geri dönüş / tekrar için)
      </button>
    </div>`;
}

/** Olayları bağlar; seçilen konuları döndüren bir fonksiyon verir */
export function initTopicPicker(root) {
  const picker = root.querySelector('.topic-picker');
  if (!picker) return () => [];

  const paint = (row) => {
    const sel = row.dataset.sel;
    row.style.background = STATUS[sel].soft;
    row.style.borderColor = sel === 'none' ? 'var(--border)' : STATUS[sel].color;
    row.querySelectorAll('.tp-btn').forEach((b) => {
      const on = b.dataset.st === sel;
      b.style.background = on ? STATUS[sel].color : 'var(--bg-secondary)';
      b.style.color = on ? '#fff' : 'var(--text-secondary)';
      b.style.borderColor = on ? STATUS[sel].color : 'var(--border)';
    });
    const note = row.querySelector('.tp-note');
    if (note) note.style.display = sel === 'partial' ? '' : 'none';
  };

  picker.querySelectorAll('.tp-row').forEach((row) => {
    paint(row);
    row.querySelectorAll('.tp-btn').forEach((b) =>
      b.addEventListener('click', () => {
        row.dataset.sel = b.dataset.st;
        row.dataset.touched = '1';
        paint(row);
        if (b.dataset.st === 'partial') row.querySelector('.tp-note')?.focus();
      }),
    );
  });

  let showAll = false;
  picker.querySelector('.tp-toggle')?.addEventListener('click', (e) => {
    showAll = !showAll;
    picker.querySelectorAll('[data-tp-extra="1"]').forEach((el) => (el.style.display = showAll ? '' : 'none'));
    e.currentTarget.textContent = showAll ? 'Sadece sıradaki konuları göster' : 'Tüm konuları göster (geri dönüş / tekrar için)';
  });

  return () =>
    [...picker.querySelectorAll('.tp-row')]
      .filter((r) => r.dataset.sel !== 'none' || (r.dataset.touched && r.dataset.orig !== 'none'))
      .map((r) => ({ key: r.dataset.key, s: r.dataset.sel, note: r.querySelector('.tp-note')?.value || '' }));
}
