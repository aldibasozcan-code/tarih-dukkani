// ═════════════════════════════════════════════════
// EDIT LESSON MODAL
// ═════════════════════════════════════════════════
import { getState, updateLesson, checkLessonConflict } from '../../store/store.js';
import { SUBJECTS, getSubjectsForBranches } from '../../data/curriculum.js';
import { openModal, closeModal } from '../../components/modal.js';
import { escHtml } from '../../utils/helpers.js';
import { icon } from '../../components/icons.js';

export function openEditLessonModal(lessonId, onSave) {
  const state = getState();
  const lesson = state.lessons.find(l => l.id === lessonId);
  
  if (!lesson) {
    console.error("Lesson not found:", lessonId);
    return;
  }

  openModal({
    title: 'Dersi Düzenle',
    body: `
      <div id="l-conflict-alert" class="login-alert error" style="display: none; margin-bottom: 24px; font-size: 14px; line-height: 1.5; align-items: flex-start; gap: 12px; padding: 16px; border-radius: var(--radius-lg); background: rgba(220, 38, 38, 0.05); border: 1px solid rgba(220, 38, 38, 0.2); color: var(--danger);"></div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Öğrenci/Grup</label>
          <input type="text" value="${escHtml(lesson.title)}" disabled style="background:var(--bg-secondary); opacity:0.7;">
        </div>
        <div class="form-group">
          <label>Saatlik Ücret (₺)</label>
          <input type="number" id="l-fee" value="${lesson.fee || 0}" min="0" step="50">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Tarih *</label>
          <input type="date" id="l-date" value="${lesson.date}">
        </div>
        <div class="form-group">
          <label>Başlangıç *</label>
          <input type="time" id="l-start" value="${lesson.startTime}">
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
            <option value="zoom" ${lesson.lessonFormat === 'zoom' ? 'selected' : ''}>Online (Zoom)</option>
            <option value="meet" ${lesson.lessonFormat === 'meet' ? 'selected' : ''}>Online (Google Meet)</option>
            <option value="face" ${lesson.lessonFormat === 'face' ? 'selected' : ''}>Yüzyüze</option>
          </select>
        </div>
        <div class="form-group">
          <label id="l-link-label">${(lesson.lessonFormat === 'face') ? 'Ders Konumu' : 'Ders Linki'}</label>
          <input type="text" id="l-link" value="${escHtml(lesson.lessonLink || '')}" placeholder="${(lesson.lessonFormat === 'face') ? 'Örn: Kadıköy Ofis' : 'https://...' }">
        </div>
      </div>
      <div class="form-group">
        <label>Notlar</label>
        <textarea id="l-notes" rows="2" placeholder="Ders notları...">${escHtml(lesson.notes || '')}</textarea>
      </div>
    `,
    footer: `
      <button class="btn btn-secondary" id="l-cancel">İptal</button>
      <button class="btn btn-primary" id="l-save">Değişiklikleri Kaydet</button>
    `,
  });

  const unitSel = document.getElementById('l-subject');
  const topicSel = document.getElementById('l-topic');
  const feeInput = document.getElementById('l-fee');
  const conflictAlert = document.getElementById('l-conflict-alert');

  function updateUnitOptions() {
    const refId = lesson.refId;
    const type = lesson.type;
    const entity = type === 'student' ? state.students.find(s => s.id === refId) : state.groups.find(g => g.id === refId);
    
    if (!entity) {
      unitSel.innerHTML = '<option value="">Önce Seçim Yapın</option>';
      topicSel.innerHTML = '';
      return;
    }

    const completedSet = new Set(entity.completedTopics || []);
    const activeSubjects = getSubjectsForBranches(state.profile.branches || []);
    const subjectsForGrade = (entity.curriculum || []).filter(s => activeSubjects.length === 0 || activeSubjects.includes(s.subject));
    const subjectsToRender = subjectsForGrade.length > 0 ? subjectsForGrade : activeSubjects.map(s => ({ subject: s, grade: entity.grade }));
    
    let unitHtml = '<option value="" disabled selected hidden>Ünite Seçiniz...</option>';
    let hasUnits = false;
    
    (subjectsToRender || []).forEach(({ subject, grade }) => {
      const units = state.curriculum[subject]?.[grade] || [];
      let subjectDef = SUBJECTS.find(s => s.id === subject);
      if (!subjectDef) subjectDef = { name: subject, icon: '📚' };
      
      if (units.length > 0) {
        hasUnits = true;
        unitHtml += `<optgroup label="${subjectDef?.icon || '📚'} ${subjectDef?.name || subject}">`;
        units.forEach(unit => {
          const allTopicsCompleted = unit.topics.length > 0 && unit.topics.every(t => completedSet.has(t.id));
          const isSelected = lesson.subject === subject && lesson.unitId === unit.id;
          unitHtml += `<option value="${subject}|${grade}|${unit.id}" ${isSelected ? 'selected' : ''} ${allTopicsCompleted ? 'style="color:rgba(255,255,255,0.4); font-style:italic;"' : 'style="color:#fff;"'}>
            ${allTopicsCompleted ? '✓ ' : ''}${escHtml(unit.name)}
          </option>`;
        });
        unitHtml += `</optgroup>`;
      }
    });

    if (!hasUnits) unitHtml = '<option value="">Müfredat bulunamadı</option>';
    unitSel.innerHTML = unitHtml;
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
    const entity = lesson.type === 'student' ? state.students.find(s => s.id === lesson.refId) : state.groups.find(g => g.id === lesson.refId);
    const completedSet = new Set(entity?.completedTopics || []);

    if (unit && unit.topics && unit.topics.length > 0) {
      let topicHtml = '<option value="" disabled selected hidden>Konu Seçiniz...</option>';
      topicHtml += unit.topics.map(t => {
        const isDone = completedSet.has(t.id);
        const isSelected = lesson.topicId === t.id;
        return `<option value="${t.id}" ${isSelected ? 'selected' : ''} ${isDone ? 'disabled style="color:rgba(255,255,255,0.2);"' : 'style="color:#fff;"'}>
          ${isDone ? '✓ ' : ''}${escHtml(t.name)}
        </option>`;
      }).join('');
      topicSel.innerHTML = topicHtml;
    } else {
      topicSel.innerHTML = '<option value="">Konu Bulunamadı</option>';
    }
  }

  function checkConflictLive() {
    const date = document.getElementById('l-date').value;
    const start = document.getElementById('l-start').value;
    const duration = _getDuration(lesson.startTime, lesson.endTime);
    const end = addMins(start, duration);

    if (!date || !start) return;

    const conflict = checkLessonConflict(date, start, end, lesson.id); 
    if (conflict) {
      conflictAlert.style.display = 'flex';
      conflictAlert.innerHTML = `
        <div style="margin-top:2px;">${icon('alertCircle', 20)}</div>
        <div style="flex:1;">
          <strong>Zaman Çakışması:</strong> ${conflict.lesson.startTime} - ${conflict.lesson.endTime} saatleri arasında <strong>"${escHtml(conflict.lesson.title)}"</strong> dersi var.
        </div>
      `;
    } else {
      conflictAlert.style.display = 'none';
    }
  }

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

  unitSel.addEventListener('change', updateTopicOptions);
  document.getElementById('l-date')?.addEventListener('change', checkConflictLive);
  document.getElementById('l-start')?.addEventListener('change', checkConflictLive);
  document.getElementById('l-cancel')?.addEventListener('click', closeModal);
  
  document.getElementById('l-save')?.addEventListener('click', async () => {
    const saveBtn = document.getElementById('l-save');
    const date = document.getElementById('l-date').value;
    const start = document.getElementById('l-start').value;
    const duration = _getDuration(lesson.startTime, lesson.endTime);
    const end = addMins(start, duration);

    if (!date || !start) { alert('Tarih ve başlangıç saati zorunludur.'); return; }

    const conflict = checkLessonConflict(date, start, end, lesson.id);
    if (conflict) {
      alert(`Seçilen saatte bir çakışma var: ${conflict.lesson.title}`);
      return;
    }
    
    const unitVal = unitSel.value;
    const [subjectId, gradeId, unitId] = (unitVal && unitVal.includes('|')) ? unitVal.split('|') : ['', '', ''];
    const topicId = topicSel.value;
    const topicText = topicSel.options[topicSel.selectedIndex]?.text?.replace('✓ ', '').trim() || '';

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<div class="spinner-sm"></div> Kaydediliyor...';

    const updatedData = {
      date,
      startTime: start,
      endTime: end,
      subject: subjectId || lesson.subject,
      unitId: unitId || lesson.unitId,
      topicId: topicId || lesson.topicId,
      topicTitle: topicText || lesson.topicTitle,
      lessonFormat: formatSel.value,
      lessonLink: linkInp.value.trim(),
      notes: document.getElementById('l-notes').value.trim(),
      fee: parseFloat(feeInput.value) || 0
    };

    await updateLesson(lesson.id, updatedData);
    closeModal();
    if (onSave) onSave();
  });

  // Initialize
  updateUnitOptions();
}

function addMins(timeStr, mins) {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function _getDuration(start, end) {
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
}
