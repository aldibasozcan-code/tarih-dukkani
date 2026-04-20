// ═════════════════════════════════════════════════
// ADD LESSON MODAL
// ═════════════════════════════════════════════════
import { getState, addLesson, checkLessonConflict } from '../../store/store.js';
import { SUBJECTS, getSubjectsForBranches } from '../../data/curriculum.js';
import { openModal, closeModal } from '../../components/modal.js';
import { escHtml } from '../../utils/helpers.js';
import { icon } from '../../components/icons.js';

export function openAddLessonModal(onSave, prefill = {}) {
  const state = getState();
  const today = new Date().toISOString().split('T')[0];

  openModal({
    title: 'Ders Ekle',
    body: `
      <div id="l-conflict-alert" class="login-alert error" style="display: none; margin-bottom: 24px; font-size: 14px; line-height: 1.5; align-items: flex-start; gap: 12px; padding: 16px; border-radius: var(--radius-lg); background: rgba(220, 38, 38, 0.05); border: 1px solid rgba(220, 38, 38, 0.2); color: var(--danger);"></div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Tür *</label>
          <select id="l-type">
            <option value="student">Bireysel Öğrenci</option>
            <option value="group" ${prefill.type === 'group' ? 'selected' : ''}>Grup</option>
          </select>
        </div>
        <div class="form-group" id="l-ref-group">
          <label>Öğrenci/Grup *</label>
          <select id="l-ref"></select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Tarih *</label>
          <input type="date" id="l-date" value="${prefill.date || today}">
        </div>
        <div class="form-group">
          <label>Başlangıç *</label>
          <input type="time" id="l-start" value="${prefill.startTime || '14:00'}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Saatlik Ücret (₺)</label>
          <input type="number" id="l-fee" value="${prefill.fee || 500}" min="0" step="50">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Ders (Ünite)</label>
          <select id="l-subject"></select>
        </div>
        <div class="form-group">
          <label>Konu</label>
          <select id="l-topic"></select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Ders İşleme Biçimi</label>
          <select id="l-format">
            <option value="zoom">Online (Zoom)</option>
            <option value="meet">Online (Google Meet)</option>
            <option value="face">Yüzyüze</option>
          </select>
        </div>
        <div class="form-group">
          <label id="l-link-label">Ders Linki</label>
          <input type="text" id="l-link" placeholder="https://...">
        </div>
      </div>
      <div class="form-group">
        <label>Notlar</label>
        <textarea id="l-notes" rows="2" placeholder="Ders notları..."></textarea>
      </div>

      <div class="form-group" style="background:rgba(5, 150, 105, 0.05); padding:16px; border-radius:12px; border:1px solid rgba(5, 150, 105, 0.1); margin-top:8px;">
        <label class="checkbox-container" style="display:flex; align-items:center; gap:10px; cursor:pointer; margin:0; text-transform:none; font-weight:600; color:var(--brand-green);">
          <input type="checkbox" id="l-recurring" style="width:18px; height:18px; cursor:pointer;">
          <span>Haftalık Tekrarla (1 Ay / 4 Hafta boyunca ekle)</span>
        </label>
        <p style="font-size:11px; color:var(--text-muted); margin-top:8px; margin-left:28px;">
          Seçilirse, bu ders bugünden itibaren haftalık olarak toplam 4 kez takvime işlenecektir.
        </p>
      </div>

    `,
    footer: `
      <button class="btn btn-secondary" id="l-cancel">İptal</button>
      <button class="btn btn-primary" id="l-save">Dersi Takvime Ekle</button>
    `,
  });

  const typeSel = document.getElementById('l-type');
  const refSel = document.getElementById('l-ref');
  const unitSel = document.getElementById('l-subject');
  const topicSel = document.getElementById('l-topic');
  const feeInput = document.getElementById('l-fee');
  const conflictAlert = document.getElementById('l-conflict-alert');

  function updateRefOptions() {
    const type = typeSel.value;
    const list = type === 'student' ? state.students : state.groups;
    if (list.length === 0) {
      refSel.innerHTML = '<option value="">Kayıt Bulunamadı</option>';
    } else {
      refSel.innerHTML = list.map(item => `<option value="${item.id}">${escHtml(item.name)} (${item.grade})</option>`).join('');
    }
    // Automatically trigger ref change
    refSel.dispatchEvent(new Event('change'));
  }

  function updateUnitOptions() {
    const type = typeSel.value;
    const refId = refSel.value;
    const entity = type === 'student' ? state.students.find(s => s.id === refId) : state.groups.find(g => g.id === refId);
    
    if (!entity) {
      unitSel.innerHTML = '<option value="">Önce Seçim Yapın</option>';
      topicSel.innerHTML = '';
      return;
    }

    const completedSet = new Set(entity.completedTopics || []);
    const activeSubjects = getSubjectsForBranches(state.profile.branches || []);
    
    // entity.curriculum already has the correct subjects assigned during creation
    const subjectsForGrade = (entity.curriculum || []).filter(s => activeSubjects.length === 0 || activeSubjects.includes(s.subject));
    
    // Fallback: if student has no curriculum yet (old record), try teacher's current branches
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
          const allTopicsCompleted = unit.topics.length > 0 && unit.topics.every(t => completedSet.has(t.id));
          unitHtml += `<option value="${subject}|${grade}|${unit.id}" ${allTopicsCompleted ? 'style="color:rgba(255,255,255,0.4); font-style:italic;"' : 'style="color:#fff;"'}>
            ${allTopicsCompleted ? '✓ ' : ''}${escHtml(unit.name)}
          </option>`;
        });
        unitHtml += `</optgroup>`;
      }
    });

    if (!hasUnits) {
      unitHtml = '<option value="">Müfredat bulunamadı (Branş/Sınıf kontrol edin)</option>';
    }
    unitSel.innerHTML = unitHtml;
    // Reset topic
    updateTopicOptions();
  }

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
      // By default, show "Konu Seçiniz..."
      let topicHtml = '<option value="" disabled selected hidden>Konu Seçiniz...</option>';
      topicHtml += unit.topics.map(t => {
        const isDone = completedSet.has(t.id);
        // Do not disable completed topics entirely, but mark them. If user insists on disabling:
        return `<option value="${t.id}" ${isDone ? 'disabled style="color:rgba(255,255,255,0.2);"' : 'style="color:#fff;"'}>
          ${isDone ? '✓ ' : ''}${escHtml(t.name)}
        </option>`;
      }).join('');
      topicSel.innerHTML = topicHtml;
    } else {
      topicSel.innerHTML = '<option value="">Konu Bulunamadı</option>';
    }
  }

  // Bind Events
  typeSel.addEventListener('change', updateRefOptions);
  
  refSel.addEventListener('change', (e) => {
    const type = typeSel.value;
    const val = e.target.value;
    const list = type === 'student' ? state.students : state.groups;
    const entity = list.find(x => x.id === val);
    
    // Auto-update fee
    const rate = entity?.rate || 500;
    feeInput.value = rate;

    // Auto-update format and link
    if (entity?.lessonFormat) {
      document.getElementById('l-format').value = entity.lessonFormat;
      document.getElementById('l-format').dispatchEvent(new Event('change'));
    }
    if (entity?.lessonLink || entity?.meetLink || entity?.zoomLink) {
      document.getElementById('l-link').value = entity.lessonLink || entity.meetLink || entity.zoomLink || '';
    }
    
    updateUnitOptions();
  });

  const formatSel = document.getElementById('l-format');
  const linkLabel = document.getElementById('l-link-label');
  const linkInp = document.getElementById('l-link');

  formatSel?.addEventListener('change', () => {
    const val = formatSel.value;
    if (val === 'face') {
      linkLabel.textContent = 'Ders Konumu';
      linkInp.placeholder = 'Örn: Kadıköy Ofis';
    } else {
      linkLabel.textContent = 'Ders Linki';
      linkInp.placeholder = 'https://...';
    }
  });

  function checkConflictLive() {
    const date = document.getElementById('l-date').value;
    const start = document.getElementById('l-start').value;
    const end = addMins(start, 60);

    if (!date || !start) return;

    const conflict = checkLessonConflict(date, start, end);
    if (conflict) {
      conflictAlert.style.display = 'flex';
      if (conflict.type === 'internal') {
        conflictAlert.innerHTML = `
          <div style="margin-top:2px;">${icon('alertCircle', 20)}</div>
          <div style="flex:1;">
            <strong>Zaman Çakışması (Yerel):</strong> ${conflict.lesson.startTime} - ${conflict.lesson.endTime} saatleri arasında <strong>"${escHtml(conflict.lesson.title)}"</strong> dersi var.
          </div>
        `;
      }
    } else {
      conflictAlert.style.display = 'none';
    }
  }

  unitSel.addEventListener('change', updateTopicOptions);

  document.getElementById('l-date')?.addEventListener('change', checkConflictLive);
  document.getElementById('l-start')?.addEventListener('change', checkConflictLive);

  document.getElementById('l-cancel')?.addEventListener('click', closeModal);
  document.getElementById('l-save')?.addEventListener('click', async () => {
    const saveBtn = document.getElementById('l-save');
    const refId = refSel.value;
    const type = typeSel.value;
    const date = document.getElementById('l-date').value;
    const start = document.getElementById('l-start').value;
    const end = addMins(start, 60);

    if (!refId || !date || !start) { alert('Öğrenci/grup, tarih ve başlangıç saati zorunludur.'); return; }


    // Final Conflict Check
    const conflict = checkLessonConflict(date, start, end);
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

    const isRecurring = document.getElementById('l-recurring').checked;
    const lessonData = {
      type,
      refId,
      title: refEntity?.name || '',
      date,
      startTime: start,
      endTime: end,
      subject: subjectId || '',
      unitId: unitId || '',
      topicId: topicId || '',
      topicTitle: topicText,
      grade: refEntity?.grade || '',
      lessonFormat: document.getElementById('l-format').value,
      lessonLink: document.getElementById('l-link').value.trim(),
      notes: document.getElementById('l-notes').value.trim(),
      fee: parseFloat(feeInput.value) || 0
    };

    if (isRecurring) {
      // Create 4 lessons (current + 3 more weeks)
      for (let i = 0; i < 4; i++) {
        const d = new Date(date + 'T00:00:00');
        d.setDate(d.getDate() + (i * 7));
        const currentDateStr = d.toISOString().split('T')[0];
        
        // Final Conflict Check for each recurring date
        const conflict = checkLessonConflict(currentDateStr, start, end);
        if (!conflict) {
          await addLesson({ ...lessonData, date: currentDateStr });
        }
      }
    } else {
      await addLesson(lessonData);
    }

    closeModal();
    if (onSave) onSave();
  });

  // Initialize
  updateRefOptions();
}

function addMins(timeStr, mins) {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
