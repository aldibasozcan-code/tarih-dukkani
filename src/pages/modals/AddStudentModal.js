// ═════════════════════════════════════════════════
// ADD STUDENT MODAL — Premium Redesign
// ═════════════════════════════════════════════════
import { getState, addStudent, updateStudent, syncStudentCurriculum } from '../../store/store.js';
import { ALL_GRADES } from '../../data/curriculum.js';
import { openModal, closeModal } from '../../components/modal.js';
import { escHtml, todayStr, getLocalDateStr, addDays } from '../../utils/helpers.js';
import { icon } from '../../components/icons.js';

const DAYS = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];

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
  .pm-sync-box { display:flex; gap:12px; align-items:flex-start; padding:13px 15px; background:rgba(255,159,67,0.05); border:1.5px dashed rgba(255,159,67,0.4); border-radius:11px; cursor:pointer; transition:all 0.2s; }
  .pm-sync-box:hover { background:rgba(255,159,67,0.09); }
  .pm-chk { width:20px; height:20px; border-radius:5px; border:2px solid var(--border); background:white; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s; color:white; margin-top:2px; }
  .pm-chk.on { background:#ff9f43; border-color:#ff9f43; }
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
</style>
`;

export function openAddStudentModal(onSave, editId = null) {
  const student = editId ? getState().students.find(s => s.id === editId) : null;
  const isEdit = !!student;
  const currentFormat = student?.lessonFormat || (student?.meetLink ? 'meet' : 'meet');
  const currentStatus = student?.status || 'active';

  openModal({
    title: '',
    size: 'lg',
    body: `
      ${SHARED_STYLES}
      <div class="pm-overlay">

        <!-- HEADER -->
        <div class="pm-header" style="background:linear-gradient(135deg,#004526 0%,#047857 60%,#10b981 100%);">
          <div class="pm-header-inner">
            <h2>${icon('students', 22)} ${isEdit ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Ekle'}</h2>
            <p>${isEdit ? `"${escHtml(student.name)}" için bilgileri güncelleyin` : 'Öğrenciyi sisteme kaydedin, müfredat otomatik atanacak'}</p>
          </div>
        </div>

        <div class="pm-body">

          <!-- KİMLİK -->
          <div class="pm-sec">
            <div class="pm-sec-hdr">
              <div class="pm-sec-ico" style="background:rgba(16,185,129,0.1);color:var(--brand-green);">${icon('user', 14)}</div>
              <span class="pm-sec-ttl">Kimlik Bilgileri</span>
            </div>
            <div class="pm-sec-body">
              <div class="pm-grid-2" style="margin-bottom:12px;">
                <div class="pm-field" style="grid-column:1/-1;">
                  <label class="pm-label">Ad Soyad <span class="pm-req">*</span></label>
                  <input type="text" id="s-name" class="pm-input" value="${escHtml(student?.name || '')}" placeholder="Örn: Ahmet Yılmaz">
                </div>
              </div>
              <div class="pm-grid-2">
                <div class="pm-field">
                  <label class="pm-label">Sınıf / Seviye <span class="pm-req">*</span></label>
                  <select id="s-grade" class="pm-select">
                    <option value="">Sınıf seçin</option>
                    ${ALL_GRADES.map(g => `<option value="${g}" ${student?.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
                  </select>
                </div>
                <div class="pm-field">
                  <label class="pm-label">Durum</label>
                  <div class="pm-status-btns" id="s-status-btns">
                    <div class="pm-status-btn ${currentStatus === 'active' ? 'active-status' : ''}" data-status="active">
                      ${icon('checkCircle', 14)} Aktif
                    </div>
                    <div class="pm-status-btn ${currentStatus === 'passive' ? 'passive-status' : ''}" data-status="passive">
                      ${icon('x', 14)} Pasif
                    </div>
                  </div>
                  <input type="hidden" id="s-status" value="${currentStatus}">
                </div>
              </div>
            </div>
          </div>

          <!-- İLETİŞİM -->
          <div class="pm-sec">
            <div class="pm-sec-hdr">
              <div class="pm-sec-ico" style="background:rgba(124,106,255,0.1);color:#7c6aff;">${icon('phone', 14)}</div>
              <span class="pm-sec-ttl">İletişim Bilgileri</span>
            </div>
            <div class="pm-sec-body">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
                <div style="grid-column:1/-1;display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
                  <div class="pm-field">
                    <label class="pm-label">${icon('phone', 11)} Tel (Öğrenci)</label>
                    <input type="tel" id="s-phone" class="pm-input" value="${escHtml(student?.phone || '')}" placeholder="+90 5xx xxx xx xx">
                  </div>
                  <div class="pm-field">
                    <label class="pm-label">${icon('mail', 11)} E-posta (Öğrenci)</label>
                    <input type="email" id="s-email" class="pm-input" value="${escHtml(student?.email || '')}" placeholder="ornek@mail.com">
                  </div>
                </div>
              </div>
              <div style="padding-top:10px;border-top:1px dashed var(--border);display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
                <div class="pm-field">
                  <label class="pm-label" style="color:#ff9f43;">${icon('phone', 11)} Tel (Veli)</label>
                  <input type="tel" id="s-pphone" class="pm-input" value="${escHtml(student?.parentPhone || '')}" placeholder="+90 5xx xxx xx xx">
                </div>
                <div class="pm-field">
                  <label class="pm-label" style="color:#ff9f43;">${icon('mail', 11)} E-posta (Veli)</label>
                  <input type="email" id="s-pemail" class="pm-input" value="${escHtml(student?.parentEmail || '')}" placeholder="veli@mail.com">
                </div>
              </div>
            </div>
          </div>

          <!-- PROGRAM -->
          <div class="pm-sec">
            <div class="pm-sec-hdr">
              <div class="pm-sec-ico" style="background:rgba(124,106,255,0.1);color:#7c6aff;">${icon('clock', 14)}</div>
              <span class="pm-sec-ttl">Ders Programı</span>
            </div>
            <div class="pm-sec-body">
              <div class="pm-grid-3" style="margin-bottom:12px;">
                <div class="pm-field">
                  <label class="pm-label">Gün</label>
                  <select id="s-day" class="pm-select">
                    <option value="">Opsiyonel</option>
                    ${DAYS.map((d, i) => `<option value="${i}" ${student?.dayOfWeek === i ? 'selected' : ''}>${d}</option>`).join('')}
                  </select>
                </div>
                <div class="pm-field">
                  <label class="pm-label">Saat</label>
                  <input type="time" id="s-time" class="pm-input" value="${student?.time || '14:00'}">
                </div>
                <div class="pm-field">
                  <label class="pm-label">Süre (dk)</label>
                  <input type="number" id="s-duration" class="pm-input" value="${student?.duration || 60}" min="10" step="5">
                </div>
              </div>
              <div class="pm-dur-chips" id="s-dur-chips">
                <span class="pm-dur-chip" data-min="30">30 dk</span>
                <span class="pm-dur-chip active" data-min="60">60 dk</span>
                <span class="pm-dur-chip" data-min="90">90 dk</span>
                <span class="pm-dur-chip" data-min="120">2 saat</span>
              </div>
              <div class="pm-grid-2" style="margin-top:12px;">
                <div class="pm-field">
                  <label class="pm-label">${icon('calendar', 11)} Başlangıç</label>
                  <input type="date" id="s-start" class="pm-input" value="${student?.startDate || todayStr()}">
                </div>
                <div class="pm-field">
                  <label class="pm-label">${icon('calendar', 11)} Bitiş</label>
                  <input type="date" id="s-end" class="pm-input" value="${student?.endDate || getLocalDateStr(addDays(new Date(), 240))}">
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
                    <input type="number" id="s-rate" class="pm-input" style="padding-left:28px;" value="${student?.rate || 500}" min="0" step="50">
                  </div>
                </div>
                <div class="pm-field">
                  <label class="pm-label">Ders Linki / Konumu</label>
                  <input type="text" id="s-link" class="pm-input" value="${escHtml(student?.lessonLink || student?.meetLink || '')}" placeholder="https://...">
                </div>
              </div>
              <div class="pm-field">
                <label class="pm-label">Ders Ortamı</label>
                <div class="pm-fmt-btns" id="s-fmt-btns">
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
                <input type="hidden" id="s-format" value="${currentFormat}">
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
              <textarea id="s-notes" class="pm-textarea" placeholder="Öğrenci hakkında notlar, özel durumlar...">${escHtml(student?.notes || '')}</textarea>
            </div>
          </div>

          <!-- INFO / SYNC -->
          ${isEdit ? `
            <div class="pm-sync-box" id="pm-sync-box">
              <div class="pm-chk" id="pm-sync-chk">${icon('check', 12)}</div>
              <div>
                <div style="font-size:13px;font-weight:800;color:#ff9f43;margin-bottom:3px;">Müfredatı Güncelle</div>
                <div style="font-size:12px;color:var(--text-muted);font-weight:500;line-height:1.5;">Branşlarınız değiştiyse öğrencinin ders listesini güncelleyin. Tamamlanan konular korunur.</div>
              </div>
            </div>
          ` : `
            <div class="pm-info-box" style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15);color:var(--brand-green);">
              ${icon('checkCircle', 16)}
              <div>Öğrenci eklenince seçilen sınıfa ait tüm müfredat <strong>otomatik atanacak</strong>.</div>
            </div>
          `}
          <input type="hidden" id="s-sync-curr" value="0">

        </div>

        <!-- FOOTER -->
        <div class="pm-footer">
          <button class="pm-btn-cancel" id="s-cancel">İptal</button>
          <button class="pm-btn-save" id="s-save" style="background:linear-gradient(135deg,#004526,#047857);box-shadow:0 4px 14px rgba(16,185,129,0.35);">
            ${icon('check', 14)} ${isEdit ? 'Güncelle' : 'Öğrenci Ekle'}
          </button>
        </div>

      </div>
    `,
  });

  // ─── STATUS BUTTONS ───
  document.querySelectorAll('[data-status]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-status]').forEach(b => {
        b.classList.remove('active-status', 'passive-status');
      });
      const s = btn.dataset.status;
      btn.classList.add(s === 'active' ? 'active-status' : 'passive-status');
      document.getElementById('s-status').value = s;
    });
  });

  // ─── FORMAT BUTTONS ───
  const fmtHidden = document.getElementById('s-format');
  const linkInp = document.getElementById('s-link');
  document.querySelectorAll('[data-fmt]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-fmt]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      fmtHidden.value = btn.dataset.fmt;
      linkInp.placeholder = btn.dataset.fmt === 'face' ? 'Örn: Kadıköy Ofis, 3. Kat' : 'https://...';
    });
  });

  // ─── DURATION CHIPS ───
  const durInput = document.getElementById('s-duration');
  document.querySelectorAll('.pm-dur-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.pm-dur-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      durInput.value = chip.dataset.min;
    });
  });
  durInput.addEventListener('input', () => {
    const v = parseInt(durInput.value);
    document.querySelectorAll('.pm-dur-chip').forEach(c => c.classList.toggle('active', parseInt(c.dataset.min) === v));
  });
  // Sync initial chip
  const initDur = parseInt(durInput.value);
  document.querySelectorAll('.pm-dur-chip').forEach(c => c.classList.toggle('active', parseInt(c.dataset.min) === initDur));

  // ─── SYNC CHECKBOX ───
  let syncChecked = false;
  const syncBox = document.getElementById('pm-sync-box');
  const syncChk = document.getElementById('pm-sync-chk');
  const syncHidden = document.getElementById('s-sync-curr');
  syncBox?.addEventListener('click', () => {
    syncChecked = !syncChecked;
    syncChk?.classList.toggle('on', syncChecked);
    if (syncHidden) syncHidden.value = syncChecked ? '1' : '0';
  });

  // ─── CANCEL / SAVE ───
  document.getElementById('s-cancel')?.addEventListener('click', closeModal);
  document.getElementById('s-save')?.addEventListener('click', () => {
    const name = document.getElementById('s-name').value.trim();
    const grade = document.getElementById('s-grade').value;
    if (!name || !grade) { alert('Ad ve sınıf zorunludur.'); return; }

    const data = {
      name, grade,
      phone: document.getElementById('s-phone').value.trim(),
      email: document.getElementById('s-email').value.trim(),
      parentPhone: document.getElementById('s-pphone').value.trim(),
      parentEmail: document.getElementById('s-pemail').value.trim(),
      rate: parseFloat(document.getElementById('s-rate').value) || 500,
      lessonFormat: fmtHidden.value,
      lessonLink: linkInp.value.trim(),
      meetLink: fmtHidden.value === 'meet' ? linkInp.value.trim() : '',
      notes: document.getElementById('s-notes').value.trim(),
      status: document.getElementById('s-status').value,
      dayOfWeek: document.getElementById('s-day').value !== '' ? parseInt(document.getElementById('s-day').value) : null,
      time: document.getElementById('s-time').value,
      startDate: document.getElementById('s-start').value,
      endDate: document.getElementById('s-end').value,
      duration: parseInt(durInput.value) || 60,
    };

    if (student) {
      updateStudent(editId, data);
      if (document.getElementById('s-sync-curr')?.value === '1') syncStudentCurriculum(editId);
    } else {
      addStudent(data);
    }
    closeModal();
    if (onSave) onSave();
  });
}
