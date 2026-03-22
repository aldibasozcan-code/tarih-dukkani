// ═════════════════════════════════════════════════
// ADD LESSON MODAL
// ═════════════════════════════════════════════════
import { getState, addLesson } from '../../store/store.js';
import { SUBJECTS, GRADE_TO_SUBJECTS } from '../../data/curriculum.js';
import { openModal, closeModal } from '../../components/modal.js';
import { escHtml } from '../../utils/helpers.js';

export function openAddLessonModal(onSave, prefill = {}) {
  const state = getState();
  const today = new Date().toISOString().split('T')[0];

  openModal({
    title: 'Ders Ekle',
    body: `
      <div class="form-row">
        <div class="form-group">
          <label>Tür *</label>
          <select id="l-type">
            <option value="student">Bireysel Öğrenci</option>
            <option value="group">Grup</option>
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
          <label>Bitiş Saati</label>
          <input type="time" id="l-end" value="${prefill.endTime || '15:00'}">
        </div>
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
      <div class="form-group">
        <label>Notlar</label>
        <textarea id="l-notes" rows="2" placeholder="Ders notları..."></textarea>
      </div>
    `,
    footer: `
      <button class="btn btn-secondary" id="l-cancel">İptal</button>
      <button class="btn btn-primary" id="l-save">Ekle</button>
    `,
  });

  const typeSel = document.getElementById('l-type');
  const refSel = document.getElementById('l-ref');
  const unitSel = document.getElementById('l-subject');
  const topicSel = document.getElementById('l-topic');
  const feeInput = document.getElementById('l-fee');

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
    const subjectsForGrade = GRADE_TO_SUBJECTS[entity.grade] || [];
    
    let unitHtml = '<option value="" disabled selected hidden>Ünite Seçiniz...</option>';
    let hasUnits = false;
    
    subjectsForGrade.forEach(({ subject, grade }) => {
      const units = state.curriculum[subject]?.[grade] || [];
      const subjectDef = SUBJECTS.find(s => s.id === subject);
      
      if (units.length > 0) {
        hasUnits = true;
        unitHtml += `<optgroup label="${subjectDef?.name || subject}">`;
        units.forEach(unit => {
          const allTopicsCompleted = unit.topics.length > 0 && unit.topics.every(t => completedSet.has(t.id));
          unitHtml += `<option value="${subject}|${grade}|${unit.id}" ${allTopicsCompleted ? 'disabled style="color:rgba(255,255,255,0.2);"' : 'style="color:#fff;"'}>
            ${allTopicsCompleted ? '✓ ' : ''}${escHtml(unit.name)}
          </option>`;
        });
        unitHtml += `</optgroup>`;
      }
    });

    if (!hasUnits) {
      unitHtml = '<option value="">Müfredat Bulunamadı</option>';
    }
    unitSel.innerHTML = unitHtml;
    // Reset topic
    unitSel.dispatchEvent(new Event('change'));
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
    
    updateUnitOptions();
  });

  unitSel.addEventListener('change', updateTopicOptions);

  document.getElementById('l-start')?.addEventListener('change', (e) => {
    const endEl = document.getElementById('l-end');
    if (endEl) endEl.value = addMins(e.target.value, 60);
  });

  document.getElementById('l-cancel')?.addEventListener('click', closeModal);
  document.getElementById('l-save')?.addEventListener('click', () => {
    const refId = refSel.value;
    const type = typeSel.value;
    const date = document.getElementById('l-date').value;
    const start = document.getElementById('l-start').value;
    const end = document.getElementById('l-end').value || addMins(start, 60);

    if (!refId || !date || !start) { alert('Öğrenci/grup, tarih ve başlangıç saati zorunludur.'); return; }

    // Çakışma Kontrolü (Conflict Check)
    const existingLessons = state.lessons.filter(l => l.date === date && l.status !== 'postponed');
    
    // Time comparison helper (convert HH:MM to minutes since midnight)
    const toMins = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };
    
    const startMins = toMins(start);
    const endMins = toMins(end);

    const checkConflict = existingLessons.find(l => {
      const lStart = toMins(l.startTime);
      const lEnd = toMins(l.endTime);
      // Overlap condition:
      // (start < lEnd) && (end > lStart)
      return (startMins < lEnd) && (endMins > lStart);
    });

    if (checkConflict) {
      alert(`Çakışma Hatası!\n${checkConflict.startTime} - ${checkConflict.endTime} saatleri arasında "${checkConflict.title}" dersiniz bulunmaktadır.\nLütfen farklı bir saat seçin.`);
      return;
    }

    const unitVal = unitSel.value;
    const [subjectId, gradeId, unitId] = (unitVal && unitVal.includes('|')) ? unitVal.split('|') : ['', '', ''];
    const topicId = topicSel.value;
    
    // Fetch descriptive titles
    const topicText = topicSel.options[topicSel.selectedIndex]?.text.replace('✓ ', '').trim() || '';

    const refEntity = type === 'student'
      ? state.students.find(s => s.id === refId)
      : state.groups.find(g => g.id === refId);

    addLesson({
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
      notes: document.getElementById('l-notes').value.trim(),
      fee: parseFloat(feeInput.value) || 0,
    });

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
