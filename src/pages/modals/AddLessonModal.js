// ═════════════════════════════════════════════════
// ADD LESSON MODAL — Premium Redesign
// ═════════════════════════════════════════════════
import { getState, addLesson, checkLessonConflict } from '../../store/store.js';
import { SUBJECTS, getSubjectsForBranches } from '../../data/curriculum.js';
import { openModal, closeModal } from '../../components/modal.js';
import { escHtml, todayStr, getLocalDateStr } from '../../utils/helpers.js';
import { icon } from '../../components/icons.js';

export function openAddLessonModal(onSave, prefill = {}) {
  const state = getState();
  const today = todayStr();
  const date = prefill.date || today;
  const startTime = prefill.startTime || '14:00';

  openModal({
    title: '',
    size: 'lg',
    body: `
      <style>
        .alm-overlay { margin: -32px; }
        .alm-header {
          background: linear-gradient(135deg, #004526 0%, #065f46 50%, #047857 100%);
          padding: 28px 32px 24px;
          position: relative;
          overflow: hidden;
        }
        .alm-header::before {
          content: '';
          position: absolute;
          top: -40px; right: -40px;
          width: 180px; height: 180px;
          background: rgba(255,255,255,0.06);
          border-radius: 50%;
        }
        .alm-header::after {
          content: '';
          position: absolute;
          bottom: -30px; left: 20px;
          width: 120px; height: 120px;
          background: rgba(255,255,255,0.04);
          border-radius: 50%;
        }
        .alm-header-content { position: relative; z-index: 1; }
        .alm-header h2 {
          font-size: 22px; font-weight: 800; color: #fff;
          margin: 0 0 4px; letter-spacing: -0.5px;
          display: flex; align-items: center; gap: 10px;
        }
        .alm-header p { font-size: 13px; color: rgba(255,255,255,0.7); margin: 0; font-weight: 500; }
        .alm-body { padding: 28px 32px; }
        .alm-section {
          margin-bottom: 24px;
          background: #fafafa;
          border: 1px solid #f0f0f0;
          border-radius: 14px;
          overflow: hidden;
        }
        .alm-section-header {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 18px;
          background: white;
          border-bottom: 1px solid #f0f0f0;
        }
        .alm-section-icon {
          width: 32px; height: 32px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .alm-section-title {
          font-size: 13px; font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .alm-section-body { padding: 18px; }
        .alm-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .alm-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
        .alm-field { display: flex; flex-direction: column; gap: 6px; }
        .alm-label {
          font-size: 12px; font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase; letter-spacing: 0.4px;
          display: flex; align-items: center; gap: 5px;
        }
        .alm-label .req { color: #ef4444; }
        .alm-input, .alm-select {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-size: 14px; font-weight: 600;
          color: var(--text-primary);
          background: white;
          transition: all 0.2s;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
        }
        .alm-input:focus, .alm-select:focus {
          border-color: var(--brand-green);
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
        }
        .alm-textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-size: 14px; font-weight: 500;
          color: var(--text-primary);
          background: white;
          resize: vertical;
          min-height: 72px;
          transition: all 0.2s;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
        }
        .alm-textarea:focus {
          border-color: var(--brand-green);
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
        }
        .alm-type-toggle {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .alm-type-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px;
          border: 2px solid var(--border);
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 700; font-size: 14px;
          color: var(--text-secondary);
        }
        .alm-type-btn:hover { border-color: var(--brand-green); background: rgba(16,185,129,0.04); }
        .alm-type-btn.active {
          border-color: var(--brand-green);
          background: rgba(16,185,129,0.08);
          color: var(--brand-green);
        }
        .alm-type-btn .type-icon {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(16,185,129,0.1); color: var(--brand-green);
          flex-shrink: 0;
        }
        .alm-format-btns {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .alm-format-btn {
          display: flex; flex-direction: column; align-items: center;
          gap: 6px; padding: 12px 8px;
          border: 2px solid var(--border);
          border-radius: 12px; background: white;
          cursor: pointer; transition: all 0.2s;
          font-size: 12px; font-weight: 700;
          color: var(--text-secondary);
        }
        .alm-format-btn:hover { border-color: #7c6aff; background: rgba(124,106,255,0.05); }
        .alm-format-btn.active {
          border-color: #7c6aff;
          background: rgba(124,106,255,0.08);
          color: #7c6aff;
        }
        .alm-format-icon {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .alm-conflict {
          display: none;
          align-items: flex-start; gap: 10px;
          padding: 12px 16px;
          background: rgba(239,68,68,0.06);
          border: 1.5px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          color: var(--danger);
          font-size: 13px; font-weight: 600;
          margin-bottom: 16px;
        }
        .alm-recurring-box {
          background: linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(5,150,105,0.03) 100%);
          border: 1.5px solid rgba(16,185,129,0.15);
          border-radius: 14px; padding: 16px 18px;
          display: flex; align-items: flex-start; gap: 14px;
          cursor: pointer; transition: all 0.2s;
        }
        .alm-recurring-box:hover { border-color: rgba(16,185,129,0.35); background: rgba(16,185,129,0.09); }
        .alm-recurring-box.checked { border-color: var(--brand-green); }
        .alm-custom-check {
          width: 22px; height: 22px; border-radius: 6px;
          border: 2px solid var(--border);
          background: white;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.2s;
          color: white; margin-top: 1px;
        }
        .alm-custom-check.checked { background: var(--brand-green); border-color: var(--brand-green); }
        .alm-footer {
          display: flex; gap: 12px; justify-content: flex-end;
          padding: 20px 32px;
          border-top: 1px solid var(--border);
          background: #fafafa;
          margin: 0 -32px -32px;
        }
        .alm-btn-cancel {
          padding: 11px 22px; border-radius: 10px;
          border: 1.5px solid var(--border);
          background: white; color: var(--text-secondary);
          font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; font-family: inherit;
        }
        .alm-btn-cancel:hover { background: #f5f5f5; border-color: #ccc; }
        .alm-btn-save {
          padding: 11px 28px; border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #004526, #047857);
          color: white;
          font-size: 14px; font-weight: 800;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; gap: 8px;
          box-shadow: 0 4px 14px rgba(16,185,129,0.35); font-family: inherit;
        }
        .alm-btn-save:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(16,185,129,0.4); }
        .alm-btn-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .alm-duration-quick { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
        .alm-dur-chip {
          padding: 4px 12px; border-radius: 20px;
          border: 1.5px solid var(--border); background: white;
          font-size: 12px; font-weight: 700; color: var(--text-secondary);
          cursor: pointer; transition: all 0.15s;
        }
        .alm-dur-chip:hover { border-color: var(--brand-green); color: var(--brand-green); background: rgba(16,185,129,0.05); }
        .alm-dur-chip.active { border-color: var(--brand-green); color: var(--brand-green); background: rgba(16,185,129,0.1); }
      </style>

      <div class="alm-overlay">
        <!-- HEADER -->
        <div class="alm-header">
          <div class="alm-header-content">
            <h2>${icon('calendar', 22)} Yeni Ders Ekle</h2>
            <p>Takvime yeni bir ders etkinliği oluşturun</p>
          </div>
        </div>

        <div class="alm-body">

          <!-- CONFLICT ALERT -->
          <div class="alm-conflict" id="l-conflict-alert"></div>

          <!-- SECTION 1: KİME -->
          <div class="alm-section">
            <div class="alm-section-header">
              <div class="alm-section-icon" style="background:rgba(16,185,129,0.1);color:var(--brand-green);">${icon('students', 16)}</div>
              <span class="alm-section-title">Ders Türü &amp; Öğrenci</span>
            </div>
            <div class="alm-section-body">
              <div class="alm-type-toggle" style="margin-bottom:14px;" id="l-type-toggle">
                <div class="alm-type-btn active" data-type="student" id="type-btn-student">
                  <div class="type-icon">${icon('students', 16)}</div>
                  <div>
                    <div style="font-size:14px;font-weight:800;color:inherit;">Bireysel</div>
                    <div style="font-size:11px;font-weight:500;color:var(--text-muted);">Tek öğrenci</div>
                  </div>
                </div>
                <div class="alm-type-btn" data-type="group" id="type-btn-group">
                  <div class="type-icon">${icon('groups', 16)}</div>
                  <div>
                    <div style="font-size:14px;font-weight:800;color:inherit;">Grup</div>
                    <div style="font-size:11px;font-weight:500;color:var(--text-muted);">Sınıf / grup</div>
                  </div>
                </div>
              </div>
              <input type="hidden" id="l-type" value="${prefill.type === 'group' ? 'group' : 'student'}">
              <div class="alm-field">
                <label class="alm-label">${icon('user', 12)} Öğrenci / Grup <span class="req">*</span></label>
                <select id="l-ref" class="alm-select"></select>
              </div>
            </div>
          </div>

          <!-- SECTION 2: ZAMAN -->
          <div class="alm-section">
            <div class="alm-section-header">
              <div class="alm-section-icon" style="background:rgba(124,106,255,0.1);color:#7c6aff;">${icon('clock', 16)}</div>
              <span class="alm-section-title">Tarih &amp; Saat</span>
            </div>
            <div class="alm-section-body">
              <div class="alm-grid-3" style="margin-bottom:12px;">
                <div class="alm-field">
                  <label class="alm-label">${icon('calendar', 12)} Tarih <span class="req">*</span></label>
                  <input type="date" id="l-date" value="${date}" class="alm-input">
                </div>
                <div class="alm-field">
                  <label class="alm-label">${icon('clock', 12)} Başlangıç <span class="req">*</span></label>
                  <input type="time" id="l-start" value="${startTime}" class="alm-input">
                </div>
                <div class="alm-field">
                  <label class="alm-label">${icon('zap', 12)} Süre (dk) <span class="req">*</span></label>
                  <input type="number" id="l-duration" value="${prefill.duration || 60}" min="5" step="5" class="alm-input">
                </div>
              </div>
              <div class="alm-duration-quick">
                <span class="alm-dur-chip" data-min="30">30 dk</span>
                <span class="alm-dur-chip active" data-min="60">60 dk</span>
                <span class="alm-dur-chip" data-min="90">90 dk</span>
                <span class="alm-dur-chip" data-min="120">2 saat</span>
              </div>
            </div>
          </div>

          <!-- SECTION 3: ÜCRET -->
          <div class="alm-section">
            <div class="alm-section-header">
              <div class="alm-section-icon" style="background:rgba(255,159,67,0.1);color:#ff9f43;">${icon('finance', 16)}</div>
              <span class="alm-section-title">Ücret</span>
            </div>
            <div class="alm-section-body">
              <div class="alm-field" style="max-width:200px;">
                <label class="alm-label">${icon('finance', 12)} Ücret (₺ / saat)</label>
                <div style="position:relative;">
                  <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:16px;font-weight:800;color:var(--text-muted);">₺</span>
                  <input type="number" id="l-fee" value="${prefill.fee || 500}" min="0" step="50" class="alm-input" style="padding-left:32px;">
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 4: KONU -->
          <div class="alm-section">
            <div class="alm-section-header">
              <div class="alm-section-icon" style="background:rgba(16,185,129,0.1);color:var(--brand-green);">${icon('book', 16)}</div>
              <span class="alm-section-title">Müfredat &amp; Konu</span>
            </div>
            <div class="alm-section-body">
              <div class="alm-grid-2">
                <div class="alm-field">
                  <label class="alm-label">${icon('book', 12)} Ünite</label>
                  <select id="l-subject" class="alm-select"></select>
                </div>
                <div class="alm-field">
                  <label class="alm-label">${icon('chevronRight', 12)} Konu</label>
                  <select id="l-topic" class="alm-select"></select>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 5: FORMAT -->
          <div class="alm-section">
            <div class="alm-section-header">
              <div class="alm-section-icon" style="background:rgba(124,106,255,0.1);color:#7c6aff;">${icon('video', 16)}</div>
              <span class="alm-section-title">Ders Ortamı &amp; Bağlantı</span>
            </div>
            <div class="alm-section-body">
              <div class="alm-format-btns" style="margin-bottom:14px;" id="l-format-btns">
                <div class="alm-format-btn active" data-format="zoom">
                  <div class="alm-format-icon">🎥</div>
                  <span>Zoom</span>
                </div>
                <div class="alm-format-btn" data-format="meet">
                  <div class="alm-format-icon">📹</div>
                  <span>Google Meet</span>
                </div>
                <div class="alm-format-btn" data-format="face">
                  <div class="alm-format-icon">🏠</div>
                  <span>Yüz Yüze</span>
                </div>
              </div>
              <input type="hidden" id="l-format" value="zoom">
              <div class="alm-field">
                <label class="alm-label" id="l-link-label">${icon('link', 12)} Ders Linki</label>
                <input type="text" id="l-link" placeholder="https://..." class="alm-input">
              </div>
            </div>
          </div>

          <!-- SECTION 6: NOT -->
          <div class="alm-section" style="margin-bottom:20px;">
            <div class="alm-section-header">
              <div class="alm-section-icon" style="background:rgba(239,68,68,0.08);color:#ef4444;">${icon('fileText', 16)}</div>
              <span class="alm-section-title">Notlar</span>
            </div>
            <div class="alm-section-body">
              <div class="alm-field">
                <textarea id="l-notes" class="alm-textarea" placeholder="Bu ders için notlar, hatırlatmalar..."></textarea>
              </div>
            </div>
          </div>

          <!-- TEKRAR -->
          <div class="alm-recurring-box" id="l-recurring-box">
            <div class="alm-custom-check" id="l-recurring-check">${icon('check', 14)}</div>
            <div>
              <div style="font-size:14px;font-weight:800;color:var(--brand-green);margin-bottom:3px;">Haftalık Tekrarla</div>
              <div style="font-size:12px;color:var(--text-muted);font-weight:500;line-height:1.5;">Bu ders seçilen tarihten itibaren haftalık olarak 4 hafta boyunca takvime eklenecektir.</div>
            </div>
          </div>

        </div>

        <!-- FOOTER -->
        <div class="alm-footer">
          <button class="alm-btn-cancel" id="l-cancel">İptal</button>
          <button class="alm-btn-save" id="l-save">
            ${icon('calendar', 15)} Dersi Kaydet
          </button>
        </div>
      </div>
    `,
  });

  // ─── STATE ───
  const typeSel = document.getElementById('l-type');
  const refSel = document.getElementById('l-ref');
  const unitSel = document.getElementById('l-subject');
  const topicSel = document.getElementById('l-topic');
  const feeInput = document.getElementById('l-fee');
  const conflictAlert = document.getElementById('l-conflict-alert');
  const formatHidden = document.getElementById('l-format');
  let isRecurring = false;

  // ─── TYPE TOGGLE ───
  document.querySelectorAll('.alm-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.alm-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      typeSel.value = btn.dataset.type;
      updateRefOptions();
    });
  });

  // Set initial type based on prefill
  if (prefill.type === 'group') {
    document.getElementById('type-btn-group')?.classList.add('active');
    document.getElementById('type-btn-student')?.classList.remove('active');
    typeSel.value = 'group';
  }

  // ─── DURATION CHIPS ───
  const durationInput = document.getElementById('l-duration');
  document.querySelectorAll('.alm-dur-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.alm-dur-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      durationInput.value = chip.dataset.min;
      checkConflictLive();
    });
  });
  durationInput.addEventListener('input', () => {
    const val = parseInt(durationInput.value);
    document.querySelectorAll('.alm-dur-chip').forEach(c => {
      c.classList.toggle('active', parseInt(c.dataset.min) === val);
    });
    checkConflictLive();
  });

  // ─── FORMAT BTNS ───
  document.querySelectorAll('.alm-format-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.alm-format-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      formatHidden.value = btn.dataset.format;
      const linkLabel = document.getElementById('l-link-label');
      const linkInp = document.getElementById('l-link');
      if (btn.dataset.format === 'face') {
        linkLabel.innerHTML = `${icon('link', 12)} Konum`;
        linkInp.placeholder = 'Örn: Kadıköy Ofis, 3. Kat';
      } else {
        linkLabel.innerHTML = `${icon('link', 12)} Ders Linki`;
        linkInp.placeholder = 'https://...';
      }
    });
  });

  // ─── RECURRING TOGGLE ───
  const recurringBox = document.getElementById('l-recurring-box');
  const recurringCheck = document.getElementById('l-recurring-check');
  recurringBox.addEventListener('click', () => {
    isRecurring = !isRecurring;
    recurringCheck.classList.toggle('checked', isRecurring);
    recurringBox.classList.toggle('checked', isRecurring);
  });

  // ─── POPULATE REF OPTIONS ───
  function updateRefOptions() {
    const type = typeSel.value;
    const list = (type === 'student' ? state.students : state.groups).filter(x => (x.status || 'active') === 'active');
    if (list.length === 0) {
      refSel.innerHTML = '<option value="">Kayıt Bulunamadı</option>';
    } else {
      refSel.innerHTML = list.map(item => `<option value="${item.id}">${escHtml(item.name)} (${item.grade})</option>`).join('');
    }
    refSel.dispatchEvent(new Event('change'));
  }

  // ─── UNIT OPTIONS ───
  function updateUnitOptions() {
    const type = typeSel.value;
    const refId = refSel.value;
    const entity = type === 'student'
      ? state.students.find(s => s.id === refId)
      : state.groups.find(g => g.id === refId);

    if (!entity) {
      unitSel.innerHTML = '<option value="">Önce Seçim Yapın</option>';
      topicSel.innerHTML = '';
      return;
    }

    const completedSet = new Set(entity.completedTopics || []);
    const activeSubjects = getSubjectsForBranches(state.profile.branches || []);
    const subjectsForGrade = (entity.curriculum || []).filter(s => activeSubjects.length === 0 || activeSubjects.includes(s.subject));
    const subjectsToRender = subjectsForGrade.length > 0
      ? subjectsForGrade
      : activeSubjects.map(s => ({ subject: s, grade: entity.grade }));

    let unitHtml = '<option value="" disabled selected hidden>Ünite Seçiniz...</option>';
    let hasUnits = false;

    (subjectsToRender || []).forEach(({ subject, grade }) => {
      const units = state.curriculum[subject]?.[grade] || [];
      let subjectDef = SUBJECTS.find(s => s.id === subject);
      if (!subjectDef) {
        subjectDef = { name: subject.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), icon: '📚' };
      }
      if (units.length > 0) {
        hasUnits = true;
        unitHtml += `<optgroup label="${subjectDef?.icon || '📚'} ${subjectDef?.name || subject}">`;
        units.forEach(unit => {
          const allDone = unit.topics.length > 0 && unit.topics.every(t => completedSet.has(t.id));
          unitHtml += `<option value="${subject}|${grade}|${unit.id}">${allDone ? '✓ ' : ''}${escHtml(unit.name)}</option>`;
        });
        unitHtml += `</optgroup>`;
      }
    });

    if (!hasUnits) {
      unitHtml = '<option value="">Müfredat bulunamadı</option>';
    }
    unitSel.innerHTML = unitHtml;
    updateTopicOptions();
  }

  // ─── TOPIC OPTIONS ───
  function updateTopicOptions() {
    const unitVal = unitSel.value;
    if (!unitVal || !unitVal.includes('|')) {
      topicSel.innerHTML = '<option value="">Ünite Bekleniyor</option>';
      return;
    }
    const [subject, grade, unitId] = unitVal.split('|');
    const unit = state.curriculum[subject]?.[grade]?.find(u => u.id === unitId);
    const type = typeSel.value;
    const refId = refSel.value;
    const entity = type === 'student' ? state.students.find(s => s.id === refId) : state.groups.find(g => g.id === refId);
    const completedSet = new Set(entity?.completedTopics || []);

    if (unit && unit.topics && unit.topics.length > 0) {
      let html = '<option value="" disabled selected hidden>Konu Seçiniz...</option>';
      html += unit.topics.map(t => {
        const isDone = completedSet.has(t.id);
        return `<option value="${t.id}" ${isDone ? 'disabled' : ''}>${isDone ? '✓ ' : ''}${escHtml(t.name)}</option>`;
      }).join('');
      topicSel.innerHTML = html;
    } else {
      topicSel.innerHTML = '<option value="">Konu Bulunamadı</option>';
    }
  }

  // ─── REF CHANGE ───
  refSel.addEventListener('change', (e) => {
    const type = typeSel.value;
    const list = type === 'student' ? state.students : state.groups;
    const entity = list.find(x => x.id === e.target.value);

    if (entity?.rate) feeInput.value = entity.rate;
    if (entity?.duration) {
      durationInput.value = entity.duration;
      document.querySelectorAll('.alm-dur-chip').forEach(c => {
        c.classList.toggle('active', parseInt(c.dataset.min) === entity.duration);
      });
    }
    if (entity?.lessonFormat) {
      const fmtBtn = document.querySelector(`.alm-format-btn[data-format="${entity.lessonFormat}"]`);
      if (fmtBtn) {
        document.querySelectorAll('.alm-format-btn').forEach(b => b.classList.remove('active'));
        fmtBtn.classList.add('active');
        formatHidden.value = entity.lessonFormat;
      }
    }
    if (entity?.lessonLink || entity?.meetLink || entity?.zoomLink) {
      document.getElementById('l-link').value = entity.lessonLink || entity.meetLink || entity.zoomLink || '';
    }

    updateUnitOptions();
    checkConflictLive();
  });

  // ─── CONFLICT CHECK ───
  function checkConflictLive() {
    const dateVal = document.getElementById('l-date').value;
    const startVal = document.getElementById('l-start').value;
    const dur = parseInt(durationInput.value) || 60;
    const end = addMins(startVal, dur);
    if (!dateVal || !startVal) return;
    const conflict = checkLessonConflict(dateVal, startVal, end);
    if (conflict) {
      conflictAlert.style.display = 'flex';
      if (conflict.type === 'internal') {
        conflictAlert.innerHTML = `
          <div style="margin-top:1px;">${icon('alertCircle', 18)}</div>
          <div><strong>Zaman Çakışması:</strong> ${conflict.lesson.startTime}–${conflict.lesson.endTime} arası <strong>"${escHtml(conflict.lesson.title)}"</strong> dersi var.</div>
        `;
      }
    } else {
      conflictAlert.style.display = 'none';
    }
  }

  unitSel.addEventListener('change', updateTopicOptions);
  document.getElementById('l-date')?.addEventListener('change', checkConflictLive);
  document.getElementById('l-start')?.addEventListener('change', checkConflictLive);

  // ─── CANCEL ───
  document.getElementById('l-cancel')?.addEventListener('click', closeModal);

  // ─── SAVE ───
  document.getElementById('l-save')?.addEventListener('click', async () => {
    const saveBtn = document.getElementById('l-save');
    const refId = refSel.value;
    const type = typeSel.value;
    const dateVal = document.getElementById('l-date').value;
    const startVal = document.getElementById('l-start').value;
    const dur = parseInt(durationInput.value) || 60;
    const end = addMins(startVal, dur);

    if (!refId || !dateVal || !startVal) {
      alert('Öğrenci/grup, tarih ve başlangıç saati zorunludur.');
      return;
    }

    const conflict = checkLessonConflict(dateVal, startVal, end);
    if (conflict) {
      alert(`Seçilen saatte bir çakışma var: ${conflict.lesson.title}`);
      return;
    }

    const unitVal = unitSel.value;
    const [subjectId, gradeId, unitId] = (unitVal && unitVal.includes('|')) ? unitVal.split('|') : ['', '', ''];
    const topicId = topicSel.value;
    const topicText = topicSel.options[topicSel.selectedIndex]?.text?.replace('✓ ', '').trim() || '';
    const refEntity = type === 'student'
      ? state.students.find(s => s.id === refId)
      : state.groups.find(g => g.id === refId);

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<div class="spinner-sm"></div> Kaydediliyor...';

    const lessonData = {
      type,
      refId,
      title: refEntity?.name || '',
      date: dateVal,
      startTime: startVal,
      endTime: end,
      subject: subjectId || '',
      unitId: unitId || '',
      topicId: topicId || '',
      topicTitle: topicText,
      grade: refEntity?.grade || '',
      lessonFormat: formatHidden.value,
      lessonLink: document.getElementById('l-link').value.trim(),
      notes: document.getElementById('l-notes').value.trim(),
      fee: parseFloat(feeInput.value) || 0
    };

    if (isRecurring) {
      for (let i = 0; i < 4; i++) {
        const d = new Date(dateVal + 'T00:00:00');
        d.setDate(d.getDate() + (i * 7));
        const ds = getLocalDateStr(d);
        if (!checkLessonConflict(ds, startVal, end)) {
          await addLesson({ ...lessonData, date: ds });
        }
      }
    } else {
      await addLesson(lessonData);
    }

    closeModal();
    if (onSave) onSave();
  });

  // ─── INIT ───
  updateRefOptions();
}

function addMins(timeStr, mins) {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
