// ═════════════════════════════════════════════════
// ADD GROUP MODAL — Premium Redesign
// ═════════════════════════════════════════════════
import { getState, addGroup, updateGroup } from '../../store/store.js';
import { ALL_GRADES, DAYS_TR } from '../../data/curriculum.js';
import { openModal, closeModal } from '../../components/modal.js';
import { escHtml, todayStr, getLocalDateStr, addDays } from '../../utils/helpers.js';
import { icon } from '../../components/icons.js';

const SHARED_STYLES = `
<style>
  .pm-overlay { margin: -32px; }
  .pm-header {
    padding: 26px 30px 22px;
    position: relative; overflow: hidden;
  }
  .pm-header::before {
    content:''; position:absolute; top:-40px; right:-40px;
    width:180px; height:180px; background:rgba(255,255,255,0.08); border-radius:50%;
  }
  .pm-header::after {
    content:''; position:absolute; bottom:-25px; left:20px;
    width:100px; height:100px; background:rgba(255,255,255,0.05); border-radius:50%;
  }
  .pm-header-inner { position:relative; z-index:1; }
  .pm-header h2 { font-size:21px; font-weight:800; color:#fff; margin:0 0 3px; letter-spacing:-0.4px; display:flex; align-items:center; gap:10px; }
  .pm-header p { font-size:13px; color:rgba(255,255,255,0.7); margin:0; font-weight:500; }
  .pm-body { padding: 24px 30px; }
  .pm-sec { margin-bottom:18px; background:#fafafa; border:1px solid #f0f0f0; border-radius:14px; overflow:hidden; }
  .pm-sec-hdr { display:flex; align-items:center; gap:8px; padding:11px 16px; background:white; border-bottom:1px solid #f0f0f0; }
  .pm-sec-ico { width:26px; height:26px; border-radius:7px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .pm-sec-ttl { font-size:11px; font-weight:800; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px; }
  .pm-sec-body { padding:15px; }
  .pm-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .pm-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }
  .pm-field { display:flex; flex-direction:column; gap:5px; }
  .pm-label { font-size:11px; font-weight:700; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.4px; }
  .pm-req { color:#ef4444; }
  .pm-input, .pm-select, .pm-textarea {
    width:100%; padding:9px 12px; border:1.5px solid var(--border); border-radius:9px;
    font-size:13px; font-weight:600; color:var(--text-primary); background:white;
    transition:all 0.2s; outline:none; font-family:inherit; box-sizing:border-box;
    -webkit-appearance:none;
  }
  .pm-input:focus, .pm-select:focus, .pm-textarea:focus { border-color:var(--brand-green); box-shadow:0 0 0 3px rgba(16,185,129,0.1); }
  .pm-select { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 10px center; background-size:14px; padding-right:34px; cursor:pointer; }
  .pm-textarea { resize:vertical; min-height:64px; }
  .pm-fmt-btns { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
  .pm-fmt-btn { display:flex; flex-direction:column; align-items:center; gap:5px; padding:10px 6px; border:2px solid var(--border); border-radius:11px; background:white; cursor:pointer; font-size:11px; font-weight:700; color:var(--text-secondary); transition:all 0.2s; }
  .pm-fmt-btn:hover { border-color:var(--brand-green); color:var(--brand-green); background:rgba(16,185,129,0.04); }
  .pm-fmt-btn.active { border-color:var(--brand-green); color:var(--brand-green); background:rgba(16,185,129,0.1); }
  .pm-fmt-icon { font-size:20px; }
  .pm-status-btns { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .pm-status-btn { display:flex; align-items:center; justify-content:center; gap:7px; padding:9px 12px; border:2px solid var(--border); border-radius:10px; background:white; cursor:pointer; font-size:13px; font-weight:700; color:var(--text-secondary); transition:all 0.2s; }
  .pm-status-btn.active-status { border-color:var(--brand-green); color:var(--brand-green); background:rgba(16,185,129,0.08); }
  .pm-status-btn.passive-status { border-color:#94a3b8; color:#64748b; background:#f8fafc; }
  .pm-info-box { display:flex; gap:10px; align-items:flex-start; padding:12px 14px; border-radius:11px; font-size:12px; font-weight:600; line-height:1.5; }
  .pm-footer { display:flex; gap:10px; justify-content:flex-end; padding:18px 30px; border-top:1px solid var(--border); background:#fafafa; margin:0 -30px -30px; }
  .pm-btn-cancel { padding:10px 20px; border-radius:9px; border:1.5px solid var(--border); background:white; color:var(--text-secondary); font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:inherit; }
  .pm-btn-cancel:hover { background:#f5f5f5; }
  .pm-btn-save { padding:10px 26px; border-radius:9px; border:none; color:white; font-size:13px; font-weight:800; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; gap:7px; font-family:inherit; }
  .pm-btn-save:hover { transform:translateY(-1px); }
  .pm-btn-save:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
  .pm-dur-chips { display:flex; gap:5px; flex-wrap:wrap; margin-top:7px; }
  .pm-dur-chip { padding:3px 10px; border-radius:20px; border:1.5px solid var(--border); background:white; font-size:11px; font-weight:700; color:var(--text-secondary); cursor:pointer; transition:all 0.15s; }
  .pm-dur-chip:hover { border-color:var(--brand-green); color:var(--brand-green); }
  .pm-dur-chip.active { border-color:var(--brand-green); color:var(--brand-green); background:rgba(16,185,129,0.1); }
  .pm-error-banner { display:none; padding:11px 14px; background:rgba(239,68,68,0.06); border:1.5px solid rgba(239,68,68,0.2); border-radius:10px; font-size:13px; font-weight:700; color:#ef4444; margin-bottom:16px; }
  .pm-day-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:5px; }
  .pm-day-btn { padding:7px 2px; border:2px solid var(--border); border-radius:9px; background:white; cursor:pointer; font-size:11px; font-weight:700; color:var(--text-secondary); text-align:center; transition:all 0.15s; }
  .pm-day-btn:hover { border-color:var(--brand-green); color:var(--brand-green); }
  .pm-day-btn.active { border-color:var(--brand-green); color:white; background:var(--brand-green); }
</style>
`;

const DAY_SHORT = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];

export function openAddGroupModal(onSave, editId = null) {
  const state = getState();
  const group = editId ? state.groups.find(g => g.id === editId) : null;
  const isEdit = !!group;
  const currentFormat = group?.lessonFormat || (group?.zoomLink ? 'zoom' : 'meet');
  const currentStatus = group?.status || 'active';
  const currentDay = group?.dayOfWeek ?? 1;

  openModal({
    title: '',
    size: 'lg',
    body: `
      ${SHARED_STYLES}
      <div class="pm-overlay">

        <!-- HEADER -->
        <div class="pm-header" style="background:linear-gradient(135deg,#1e1b4b 0%,#3730a3 60%,#4f46e5 100%);">
          <div class="pm-header-inner">
            <h2>${icon('group', 22)} ${isEdit ? 'Grubu Düzenle' : 'Yeni Grup Ekle'}</h2>
            <p>${isEdit ? `"${escHtml(group.name)}" grubunu düzenleyin` : 'Grubu tanımlayın, dersler otomatik takvime işlenecek'}</p>
          </div>
        </div>

        <div class="pm-body">

          <div class="pm-error-banner" id="g-error-alert"></div>

          <!-- TEMEL BİLGİLER -->
          <div class="pm-sec">
            <div class="pm-sec-hdr">
              <div class="pm-sec-ico" style="background:rgba(79,70,229,0.1);color:#4f46e5;">${icon('group', 14)}</div>
              <span class="pm-sec-ttl">Temel Bilgiler</span>
            </div>
            <div class="pm-sec-body">
              <div class="pm-grid-2">
                <div class="pm-field" style="grid-column:1/-1;">
                  <label class="pm-label">Grup Adı <span class="pm-req">*</span></label>
                  <input type="text" id="g-name" class="pm-input" value="${escHtml(group?.name || '')}" placeholder="Örn: KPSS Lisans Grubu, 9. Sınıf TYT…">
                </div>
                <div class="pm-field">
                  <label class="pm-label">Sınıf / Seviye <span class="pm-req">*</span></label>
                  <select id="g-grade" class="pm-select">
                    <option value="" disabled ${!group ? 'selected' : ''}>Sınıf seçin…</option>
                    ${ALL_GRADES.map(g => `<option value="${g}" ${group?.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
                  </select>
                </div>
                <div class="pm-field">
                  <label class="pm-label">Durum</label>
                  <div class="pm-status-btns">
                    <div class="pm-status-btn ${currentStatus === 'active' ? 'active-status' : ''}" data-status="active">
                      ${icon('checkCircle', 14)} Aktif
                    </div>
                    <div class="pm-status-btn ${currentStatus === 'passive' ? 'passive-status' : ''}" data-status="passive">
                      ${icon('x', 14)} Pasif
                    </div>
                  </div>
                  <input type="hidden" id="g-status" value="${currentStatus}">
                </div>
              </div>
            </div>
          </div>

          <!-- PROGRAM -->
          <div class="pm-sec">
            <div class="pm-sec-hdr">
              <div class="pm-sec-ico" style="background:rgba(79,70,229,0.1);color:#4f46e5;">${icon('clock', 14)}</div>
              <span class="pm-sec-ttl">Ders Programı <span class="pm-req">*</span></span>
            </div>
            <div class="pm-sec-body">
              <div class="pm-field" style="margin-bottom:12px;">
                <label class="pm-label">Gün Seçimi</label>
                <div class="pm-day-grid" id="g-day-grid">
                  ${DAY_SHORT.map((d, i) => `
                    <div class="pm-day-btn ${currentDay === i ? 'active' : ''}" data-day="${i}">${d}</div>
                  `).join('')}
                </div>
                <input type="hidden" id="g-day" value="${currentDay}">
              </div>
              <div class="pm-grid-3" style="margin-bottom:10px;">
                <div class="pm-field" style="grid-column:1/3;">
                  <label class="pm-label">Ders Saati <span class="pm-req">*</span></label>
                  <input type="time" id="g-time" class="pm-input" value="${group?.time || '14:00'}">
                </div>
                <div class="pm-field">
                  <label class="pm-label">Süre (dk)</label>
                  <input type="number" id="g-duration" class="pm-input" value="${group?.duration || 60}" min="10" step="5">
                </div>
              </div>
              <div class="pm-dur-chips" id="g-dur-chips">
                <span class="pm-dur-chip" data-min="30">30 dk</span>
                <span class="pm-dur-chip" data-min="60">60 dk</span>
                <span class="pm-dur-chip" data-min="90">90 dk</span>
                <span class="pm-dur-chip" data-min="120">2 saat</span>
              </div>
              <div class="pm-grid-2" style="margin-top:12px;">
                <div class="pm-field">
                  <label class="pm-label">${icon('calendar', 11)} Başlangıç <span class="pm-req">*</span></label>
                  <input type="date" id="g-start" class="pm-input" value="${group?.startDate || todayStr()}">
                </div>
                <div class="pm-field">
                  <label class="pm-label">${icon('calendar', 11)} Bitiş <span class="pm-req">*</span></label>
                  <input type="date" id="g-end" class="pm-input" value="${group?.endDate || getLocalDateStr(addDays(new Date(), 240))}">
                </div>
              </div>
            </div>
          </div>

          <!-- ÜCRET & FORMAT -->
          <div class="pm-sec">
            <div class="pm-sec-hdr">
              <div class="pm-sec-ico" style="background:rgba(255,159,67,0.1);color:#ff9f43;">${icon('finance', 14)}</div>
              <span class="pm-sec-ttl">Ücret &amp; Ders Ortamı</span>
            </div>
            <div class="pm-sec-body">
              <div class="pm-grid-2" style="margin-bottom:14px;">
                <div class="pm-field">
                  <label class="pm-label">Saatlik Ücret (₺)</label>
                  <div style="position:relative;">
                    <span style="position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:15px;font-weight:800;color:var(--text-muted);">₺</span>
                    <input type="number" id="g-rate" class="pm-input" style="padding-left:28px;" value="${group?.rate || 300}" min="0" step="50">
                  </div>
                </div>
                <div class="pm-field">
                  <label class="pm-label" id="g-link-label">Ders Linki / Konumu</label>
                  <input type="text" id="g-link" class="pm-input" value="${escHtml(group?.lessonLink || group?.zoomLink || '')}" placeholder="https://...">
                </div>
              </div>
              <div class="pm-field">
                <label class="pm-label">Ders Ortamı</label>
                <div class="pm-fmt-btns" id="g-fmt-btns">
                  <div class="pm-fmt-btn ${currentFormat === 'zoom' ? 'active' : ''}" data-fmt="zoom">
                    <div class="pm-fmt-icon">🎥</div><span>Zoom</span>
                  </div>
                  <div class="pm-fmt-btn ${currentFormat === 'meet' ? 'active' : ''}" data-fmt="meet">
                    <div class="pm-fmt-icon">📹</div><span>Google Meet</span>
                  </div>
                  <div class="pm-fmt-btn ${currentFormat === 'face' ? 'active' : ''}" data-fmt="face">
                    <div class="pm-fmt-icon">🏠</div><span>Yüz Yüze</span>
                  </div>
                </div>
                <input type="hidden" id="g-format" value="${currentFormat}">
              </div>
            </div>
          </div>

          <!-- NOT -->
          <div class="pm-sec">
            <div class="pm-sec-hdr">
              <div class="pm-sec-ico" style="background:rgba(239,68,68,0.08);color:#ef4444;">${icon('fileText', 14)}</div>
              <span class="pm-sec-ttl">Notlar</span>
            </div>
            <div class="pm-sec-body">
              <textarea id="g-notes" class="pm-textarea" placeholder="Grup hakkında notlar, ortak hedefler...">${escHtml(group?.notes || '')}</textarea>
            </div>
          </div>

          <!-- INFO -->
          ${!isEdit ? `
            <div class="pm-info-box" style="background:rgba(79,70,229,0.05);border:1px solid rgba(79,70,229,0.15);color:#4f46e5;">
              ${icon('checkCircle', 16)}
              <div>Grup oluşturulduğunda belirlenen gün ve saat bilgisine göre haftalık dersler <strong>otomatik takvime işlenecek</strong>.</div>
            </div>
          ` : ''}

        </div>

        <!-- FOOTER -->
        <div class="pm-footer">
          <button class="pm-btn-cancel" id="g-cancel">İptal</button>
          <button class="pm-btn-save" id="g-save" style="background:linear-gradient(135deg,#1e1b4b,#4f46e5);box-shadow:0 4px 14px rgba(79,70,229,0.35);">
            ${icon('check', 14)} ${isEdit ? 'Güncelle' : 'Grubu Ekle'}
          </button>
        </div>

      </div>
    `,
  });

  // ─── STATUS BUTTONS ───
  document.querySelectorAll('[data-status]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-status]').forEach(b => b.classList.remove('active-status', 'passive-status'));
      const s = btn.dataset.status;
      btn.classList.add(s === 'active' ? 'active-status' : 'passive-status');
      document.getElementById('g-status').value = s;
    });
  });

  // ─── DAY BUTTONS ───
  const dayHidden = document.getElementById('g-day');
  document.querySelectorAll('.pm-day-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pm-day-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      dayHidden.value = btn.dataset.day;
    });
  });

  // ─── FORMAT BUTTONS ───
  const fmtHidden = document.getElementById('g-format');
  const linkLabel = document.getElementById('g-link-label');
  const linkInp = document.getElementById('g-link');
  document.querySelectorAll('[data-fmt]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-fmt]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      fmtHidden.value = btn.dataset.fmt;
      const isFace = btn.dataset.fmt === 'face';
      linkLabel.textContent = isFace ? 'Ders Konumu' : 'Ders Linki';
      linkInp.placeholder = isFace ? 'Örn: Kadıköy Ofis' : 'https://...';
    });
  });

  // ─── DURATION CHIPS ───
  const durInput = document.getElementById('g-duration');
  document.querySelectorAll('#g-dur-chips .pm-dur-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#g-dur-chips .pm-dur-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      durInput.value = chip.dataset.min;
    });
  });
  durInput.addEventListener('input', () => {
    const v = parseInt(durInput.value);
    document.querySelectorAll('#g-dur-chips .pm-dur-chip').forEach(c => c.classList.toggle('active', parseInt(c.dataset.min) === v));
  });
  // Sync initial chip
  const initDur = parseInt(durInput.value);
  document.querySelectorAll('#g-dur-chips .pm-dur-chip').forEach(c => c.classList.toggle('active', parseInt(c.dataset.min) === initDur));

  const errorAlert = document.getElementById('g-error-alert');
  const saveBtn = document.getElementById('g-save');

  document.getElementById('g-cancel')?.addEventListener('click', closeModal);

  saveBtn?.addEventListener('click', async () => {
    const name = document.getElementById('g-name').value.trim();
    const grade = document.getElementById('g-grade').value;
    const start = document.getElementById('g-start').value;
    const end = document.getElementById('g-end').value;

    if (!name || !grade || !start || !end) {
      errorAlert.style.display = 'block';
      errorAlert.textContent = 'Lütfen tüm zorunlu alanları (*) doldurun.';
      return;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<div class="spinner-sm"></div> Kaydediliyor...';

    const formatVal = fmtHidden.value;
    const linkVal = linkInp.value.trim();

    const data = {
      name, grade,
      dayOfWeek: parseInt(dayHidden.value),
      time: document.getElementById('g-time').value,
      duration: parseInt(durInput.value) || 60,
      rate: parseFloat(document.getElementById('g-rate').value) || 0,
      lessonFormat: formatVal,
      lessonLink: linkVal,
      zoomLink: formatVal === 'zoom' ? linkVal : '',
      notes: document.getElementById('g-notes').value.trim(),
      status: document.getElementById('g-status').value,
      startDate: start,
      endDate: end,
    };

    try {
      if (group) {
        await updateGroup(editId, data);
      } else {
        await addGroup(data);
      }
      closeModal();
      if (onSave) onSave();
    } catch (err) {
      console.error('Grup kaydetme hatası:', err);
      saveBtn.disabled = false;
      saveBtn.innerHTML = `${icon('check', 14)} ${isEdit ? 'Güncelle' : 'Grubu Ekle'}`;
      errorAlert.style.display = 'block';
      errorAlert.textContent = 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
  });
}
