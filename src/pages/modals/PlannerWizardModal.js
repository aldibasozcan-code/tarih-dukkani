// ═════════════════════════════════════════════════
// UNIFIED PLANNER WIZARD MODAL (Öğrenci/Grup Ekle)
// ═════════════════════════════════════════════════
import { getState, addPlannedGroup, addPlannedStudent } from '../../store/store.js';
import { ALL_GRADES, DAYS_TR, getSubjectsForBranches } from '../../data/curriculum.js';
import { openModal, closeModal } from '../../components/modal.js';
import { escHtml, todayStr, getLocalDateStr, addDays } from '../../utils/helpers.js';

let currentStep = 1;
let entityType = 'student'; // 'student' or 'group'
let entityData = {};
let schedules = [{ dayOfWeek: 1, time: '14:00', duration: 60 }];
let generatedLessons = [];
let allCurriculumTopics = []; // To hold the topics for shifting

export function openPlannerWizard(onSave) {
  currentStep = 1;
  entityType = 'student';
  entityData = {
    name: '',
    grade: '',
    startDate: todayStr(),
    endDate: getLocalDateStr(addDays(new Date(), 240)),
    rate: 300,
    lessonFormat: 'meet',
    link: ''
  };
  schedules = [{ dayOfWeek: 1, time: '14:00', duration: 60 }];
  generatedLessons = [];
  allCurriculumTopics = [];

  renderModal(onSave);
}

function renderModal(onSave) {
  let content = '';

  if (currentStep === 1) content = renderStep1();
  else if (currentStep === 2) content = renderStep2();
  else if (currentStep === 3) content = renderStep3();
  else if (currentStep === 4) content = renderStep4();

  let footer = '';
  if (currentStep === 1) {
    footer = `
      <button class="btn btn-secondary" id="pw-cancel">İptal</button>
      <button class="btn btn-primary" id="pw-next1">İleri <i class="ph ph-arrow-right"></i></button>
    `;
  } else if (currentStep === 2) {
    footer = `
      <button class="btn btn-secondary" id="pw-prev2"><i class="ph ph-arrow-left"></i> Geri</button>
      <button class="btn btn-primary" id="pw-next2">İleri: Ders Programı <i class="ph ph-arrow-right"></i></button>
    `;
  } else if (currentStep === 3) {
    footer = `
      <button class="btn btn-secondary" id="pw-prev3"><i class="ph ph-arrow-left"></i> Geri</button>
      <button class="btn btn-primary" id="pw-next3">İleri: Planı Önizle <i class="ph ph-arrow-right"></i></button>
    `;
  } else if (currentStep === 4) {
    footer = `
      <button class="btn btn-secondary" id="pw-prev4"><i class="ph ph-arrow-left"></i> Geri</button>
      <button class="btn btn-primary" id="pw-save"><i class="ph ph-check"></i> Planı Kaydet</button>
    `;
  }

  // Generate Step Indicators
  const steps = [
    { num: 1, label: 'Tür Seçimi' },
    { num: 2, label: 'Bilgiler' },
    { num: 3, label: 'Program' },
    { num: 4, label: 'Önizleme' }
  ];
  
  const stepIndicators = steps.map(s => `
    <div style="flex:1; text-align:center; display:flex; flex-direction:column; align-items:center; gap:8px;">
      <div style="width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; 
        background:${currentStep >= s.num ? 'var(--brand-green)' : 'var(--bg-secondary)'}; 
        color:${currentStep >= s.num ? 'white' : 'var(--text-light)'};
        border: 2px solid ${currentStep >= s.num ? 'var(--brand-green)' : 'var(--border-light)'};
        transition: all 0.3s ease;">
        ${s.num}
      </div>
      <div style="font-size:12px; font-weight:600; color:${currentStep >= s.num ? 'var(--text-primary)' : 'var(--text-light)'}">${s.label}</div>
    </div>
  `).join('');

  openModal({
    title: 'Yeni Sınıf / Öğrenci Ekle (Akıllı Planlayıcı)',
    size: 'xl',
    body: `
      <div style="display:flex; justify-content:space-between; margin-bottom:30px; position:relative;">
        <div style="position:absolute; top:16px; left:10%; right:10%; height:2px; background:var(--border-light); z-index:-1;"></div>
        <div style="position:absolute; top:16px; left:10%; right:10%; height:2px; background:var(--brand-green); z-index:-1; width:${(currentStep-1)*33.3}%; transition: width 0.3s ease;"></div>
        ${stepIndicators}
      </div>
      <div id="pw-error" class="login-alert error" style="display:none; margin-bottom:16px;"></div>
      ${content}
    `,
    footer
  });

  attachListeners(onSave);
}

function renderStep1() {
  return `
    <div style="text-align:center; margin-bottom:24px;">
      <h3 style="margin-bottom:8px;">Ne Eklemek İstiyorsunuz?</h3>
      <p style="color:var(--text-light);">Sisteme eklemek istediğiniz planlama türünü seçin.</p>
    </div>
    <div style="display:flex; gap:20px; justify-content:center;">
      <div class="pw-type-card ${entityType === 'student' ? 'active' : ''}" data-type="student" style="flex:1; max-width:300px; padding:30px; border-radius:16px; border:2px solid ${entityType === 'student' ? 'var(--brand-green)' : 'var(--border-light)'}; cursor:pointer; text-align:center; transition:all 0.2s; background:${entityType === 'student' ? 'rgba(5,150,105,0.05)' : 'white'};">
        <div style="font-size:48px; margin-bottom:16px;">👤</div>
        <h4 style="margin:0 0 8px 0;">Birebir Öğrenci</h4>
        <p style="font-size:13px; color:var(--text-light); margin:0;">Tek bir öğrenci için yıllık müfredat ve takvim planı oluşturun.</p>
      </div>
      <div class="pw-type-card ${entityType === 'group' ? 'active' : ''}" data-type="group" style="flex:1; max-width:300px; padding:30px; border-radius:16px; border:2px solid ${entityType === 'group' ? 'var(--brand-green)' : 'var(--border-light)'}; cursor:pointer; text-align:center; transition:all 0.2s; background:${entityType === 'group' ? 'rgba(5,150,105,0.05)' : 'white'};">
        <div style="font-size:48px; margin-bottom:16px;">👥</div>
        <h4 style="margin:0 0 8px 0;">Sınıf / Grup</h4>
        <p style="font-size:13px; color:var(--text-light); margin:0;">Birden fazla öğrencinin katılacağı bir sınıf veya grup oluşturun.</p>
      </div>
    </div>
  `;
}

function renderStep2() {
  const isGroup = entityType === 'group';
  return `
    <div class="form-row">
      <div class="form-group">
        <label>${isGroup ? 'Grup Adı' : 'Öğrenci Adı Soyadı'} *</label>
        <input type="text" id="pw-name" value="${escHtml(entityData.name)}" placeholder="${isGroup ? 'Örn: 8A LGS Grubu' : 'Örn: Ali Yılmaz'}">
      </div>
      <div class="form-group">
        <label>Sınıf Seviyesi *</label>
        <select id="pw-grade">
          <option value="" disabled ${!entityData.grade ? 'selected' : ''}>Sınıf seçin...</option>
          ${ALL_GRADES.map(g => `<option value="${g}" ${entityData.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Plan Başlangıç Tarihi *</label>
        <input type="date" id="pw-start" value="${entityData.startDate}">
      </div>
      <div class="form-group">
        <label>Plan Bitiş Tarihi *</label>
        <input type="date" id="pw-end" value="${entityData.endDate}">
      </div>
    </div>
    <div class="form-row-3">
      <div class="form-group">
        <label>Ders İşleme Biçimi</label>
        <select id="pw-format">
          <option value="zoom" ${entityData.lessonFormat === 'zoom' ? 'selected' : ''}>Online (Zoom)</option>
          <option value="meet" ${entityData.lessonFormat === 'meet' ? 'selected' : ''}>Online (Google Meet)</option>
          <option value="face" ${entityData.lessonFormat === 'face' ? 'selected' : ''}>Yüzyüze</option>
        </select>
      </div>
      <div class="form-group" style="flex:2">
        <label id="pw-link-label">${entityData.lessonFormat === 'face' ? 'Konum' : 'Ders Linki'}</label>
        <input type="text" id="pw-link" value="${escHtml(entityData.link)}" placeholder="...">
      </div>
      <div class="form-group">
        <label>Saatlik Ücret (₺)</label>
        <input type="number" id="pw-rate" value="${entityData.rate}" min="0" step="50">
      </div>
    </div>
  `;
}

function renderStep3() {
  let scheduleRows = schedules.map((sch, i) => `
    <div class="schedule-row" style="display:flex; gap:12px; margin-bottom:12px; align-items:flex-end;" data-index="${i}">
      <div class="form-group" style="flex:2; margin:0;">
        <label>Ders Günü</label>
        <select class="sch-day">
          ${DAYS_TR.map((d, dIdx) => `<option value="${dIdx}" ${sch.dayOfWeek === dIdx ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
      </div>
      <div class="form-group" style="flex:1; margin:0;">
        <label>Saat</label>
        <input type="time" class="sch-time" value="${sch.time}">
      </div>
      <div class="form-group" style="flex:1; margin:0;">
        <label>Süre (dk)</label>
        <input type="number" class="sch-duration" value="${sch.duration}" min="10" step="5">
      </div>
      ${schedules.length > 1 ? `
        <button class="btn btn-icon btn-danger remove-sch" data-index="${i}" style="margin-bottom:2px;"><i class="ph ph-trash"></i></button>
      ` : ''}
    </div>
  `).join('');

  return `
    <div style="margin-bottom:16px;">
      <h3 style="margin:0 0 4px 0; font-size:16px;">Haftalık Ders Programı</h3>
      <p style="margin:0; font-size:13px; color:var(--text-light);">Haftada kaç gün ders yapılacağını belirleyin. Konular bu derslere sırayla dağıtılacaktır.</p>
    </div>
    <div id="pw-schedules-container" style="background:#f8fafc; padding:16px; border-radius:12px; border:1px solid var(--border-light);">
      ${scheduleRows}
    </div>
    <button class="btn btn-secondary btn-sm" id="pw-add-sch" style="margin-top:12px;"><i class="ph ph-plus"></i> Yeni Ders Günü Ekle</button>
  `;
}

function renderStep4() {
  if (generatedLessons.length === 0) {
    return `<div style="text-align:center; padding:40px; color:var(--text-light);">Plan oluşturulamadı. Lütfen tarihleri kontrol edin.</div>`;
  }

  let tableRows = generatedLessons.map((l, i) => {
    const isSpecial = l.isSpecial;
    const isSkipped = l.isSkipped;
    
    let topicContent = '';
    if (isSkipped) {
      topicContent = `<div style="color:var(--text-light); font-style:italic;">Bu ders tatil edildi / atlandı.</div>`;
    } else if (isSpecial) {
      topicContent = `<div style="color:var(--brand-green); font-weight:600;">📝 ${escHtml(l.title)}</div>`;
    } else if (l.topicId) {
      topicContent = `
        <div style="font-weight:500; font-size:13px;">${escHtml(l.title)}</div>
        <div style="font-size:11px; color:var(--brand-green);">${escHtml(l.subject)}</div>
      `;
    } else {
      topicContent = `<div style="font-style:italic; color:var(--text-light); font-size:13px;">(Konu kalmadı / Serbest Ders)</div>`;
    }

    return `
      <tr style="${isSkipped ? 'opacity:0.6; background:#f8fafc;' : ''}">
        <td style="font-size:12px; font-weight:600; color:var(--text-light);">${i+1}. Ders</td>
        <td style="white-space:nowrap;">${l.date.split('-').reverse().join('.')}</td>
        <td style="white-space:nowrap;">${DAYS_TR[new Date(l.date).getDay()]} ${l.startTime}</td>
        <td>${topicContent}</td>
        <td style="text-align:right;">
          ${!isSkipped ? `<button class="btn btn-sm btn-ghost action-skip" data-index="${i}" title="Dersi Atla (Tatil)"><i class="ph ph-calendar-x"></i> Atla</button>` : ''}
          ${isSkipped ? `<button class="btn btn-sm btn-ghost action-unskip" data-index="${i}" title="Atlamayı Geri Al"><i class="ph ph-arrow-u-up-left"></i> Geri Al</button>` : ''}
          ${!isSkipped && !isSpecial ? `<button class="btn btn-sm btn-ghost action-special" data-index="${i}" title="Sınav/Etkinlik Ekle"><i class="ph ph-plus"></i> Sınav</button>` : ''}
          ${isSpecial ? `<button class="btn btn-sm btn-ghost action-remove-special" data-index="${i}" title="Sınavı Kaldır"><i class="ph ph-trash"></i> Kaldır</button>` : ''}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div style="margin-bottom:16px; background:rgba(5,150,105,0.05); padding:16px; border-radius:12px; border:1px solid rgba(5,150,105,0.1); display:flex; justify-content:space-between; align-items:center;">
      <div>
        <h3 style="margin:0 0 4px 0; font-size:16px; color:var(--brand-green);">İnteraktif Plan Önizlemesi</h3>
        <div style="font-size:13px; color:var(--text-muted);">Tatillere denk gelen dersleri atlayabilir veya araya özel sınavlar ekleyebilirsiniz. Müfredat otomatik olarak kayacaktır.</div>
      </div>
      <div style="text-align:right; font-size:12px;">
        <div><strong>Toplam Ders:</strong> ${generatedLessons.filter(l => !l.isSkipped).length}</div>
        <div><strong>Bitiş:</strong> ${generatedLessons[generatedLessons.length-1].date.split('-').reverse().join('.')}</div>
      </div>
    </div>
    
    <div class="table-container" style="max-height: 400px; overflow-y: auto;">
      <table class="table">
        <thead style="position:sticky; top:0; background:white; z-index:1; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
          <tr>
            <th width="80">Sıra</th>
            <th width="100">Tarih</th>
            <th width="120">Gün & Saat</th>
            <th>İşlenecek Konu (Müfredat)</th>
            <th width="160" style="text-align:right;">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;
}

function attachListeners(onSave) {
  const errorAlert = document.getElementById('pw-error');

  // Cancel
  document.getElementById('pw-cancel')?.addEventListener('click', closeModal);

  // Type Cards
  document.querySelectorAll('.pw-type-card').forEach(card => {
    card.addEventListener('click', (e) => {
      document.querySelectorAll('.pw-type-card').forEach(c => {
        c.classList.remove('active');
        c.style.border = '2px solid var(--border-light)';
        c.style.background = 'white';
      });
      const target = e.currentTarget;
      target.classList.add('active');
      target.style.border = '2px solid var(--brand-green)';
      target.style.background = 'rgba(5,150,105,0.05)';
      entityType = target.dataset.type;
    });
  });

  // Next 1
  document.getElementById('pw-next1')?.addEventListener('click', () => {
    currentStep = 2;
    renderModal(onSave);
  });

  // Format change
  const formatSel = document.getElementById('pw-format');
  if (formatSel) {
    formatSel.addEventListener('change', () => {
      const label = document.getElementById('pw-link-label');
      label.textContent = formatSel.value === 'face' ? 'Konum' : 'Ders Linki';
    });
  }

  // Next 2
  document.getElementById('pw-next2')?.addEventListener('click', () => {
    entityData.name = document.getElementById('pw-name').value.trim();
    entityData.grade = document.getElementById('pw-grade').value;
    entityData.startDate = document.getElementById('pw-start').value;
    entityData.endDate = document.getElementById('pw-end').value;
    entityData.lessonFormat = document.getElementById('pw-format').value;
    entityData.link = document.getElementById('pw-link').value.trim();
    entityData.rate = parseFloat(document.getElementById('pw-rate').value) || 0;

    if (!entityData.name || !entityData.grade || !entityData.startDate || !entityData.endDate) {
      errorAlert.textContent = "Lütfen tüm zorunlu (*) alanları doldurun.";
      errorAlert.style.display = "block";
      return;
    }
    errorAlert.style.display = "none";
    currentStep = 3;
    renderModal(onSave);
  });

  // Prev 2
  document.getElementById('pw-prev2')?.addEventListener('click', () => {
    currentStep = 1;
    renderModal(onSave);
  });

  // Add Schedule
  document.getElementById('pw-add-sch')?.addEventListener('click', () => {
    saveSchedulesFromDOM();
    schedules.push({ dayOfWeek: 1, time: '14:00', duration: 60 });
    renderModal(onSave);
  });

  // Remove Schedule
  document.querySelectorAll('.remove-sch').forEach(btn => {
    btn.addEventListener('click', (e) => {
      saveSchedulesFromDOM();
      const idx = parseInt(e.currentTarget.getAttribute('data-index'));
      schedules.splice(idx, 1);
      renderModal(onSave);
    });
  });

  // Next 3 (Generate Plan)
  document.getElementById('pw-next3')?.addEventListener('click', () => {
    saveSchedulesFromDOM();
    if (schedules.length === 0) {
      errorAlert.textContent = "En az bir ders günü eklemelisiniz.";
      errorAlert.style.display = "block";
      return;
    }
    
    generateInitialPlan();
    
    errorAlert.style.display = "none";
    currentStep = 4;
    renderModal(onSave);
  });

  // Prev 3
  document.getElementById('pw-prev3')?.addEventListener('click', () => {
    currentStep = 2;
    renderModal(onSave);
  });
  
  // Prev 4
  document.getElementById('pw-prev4')?.addEventListener('click', () => {
    currentStep = 3;
    renderModal(onSave);
  });

  // Interactive Actions
  document.querySelectorAll('.action-skip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-index'));
      generatedLessons[idx].isSkipped = true;
      generatedLessons[idx].isSpecial = false;
      remapTopics();
      renderModal(onSave);
    });
  });

  document.querySelectorAll('.action-unskip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-index'));
      generatedLessons[idx].isSkipped = false;
      remapTopics();
      renderModal(onSave);
    });
  });

  document.querySelectorAll('.action-special').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-index'));
      const title = prompt("Eklenecek Sınav/Etkinlik adını girin:", "1. Dönem 1. Yazılı");
      if (title) {
        generatedLessons[idx].isSpecial = true;
        generatedLessons[idx].specialTitle = title;
        remapTopics();
        renderModal(onSave);
      }
    });
  });

  document.querySelectorAll('.action-remove-special').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-index'));
      generatedLessons[idx].isSpecial = false;
      generatedLessons[idx].specialTitle = '';
      remapTopics();
      renderModal(onSave);
    });
  });

  // Save Final
  document.getElementById('pw-save')?.addEventListener('click', async () => {
    const btn = document.getElementById('pw-save');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner-sm"></div> Kaydediliyor...';

    const payload = {
      name: entityData.name,
      grade: entityData.grade,
      startDate: entityData.startDate,
      endDate: entityData.endDate,
      rate: entityData.rate,
      lessonFormat: entityData.lessonFormat,
      lessonLink: entityData.link,
      zoomLink: entityData.lessonFormat === 'zoom' ? entityData.link : '',
      meetLink: entityData.lessonFormat === 'meet' ? entityData.link : '',
      status: 'active'
    };
    
    // Filter out skipped lessons
    const finalLessonsToSave = generatedLessons.filter(l => !l.isSkipped);

    try {
      if (entityType === 'group') {
        await addPlannedGroup(payload, finalLessonsToSave);
      } else {
        await addPlannedStudent(payload, finalLessonsToSave);
      }
      closeModal();
      if (onSave) onSave();
    } catch (err) {
      console.error(err);
      btn.disabled = false;
      btn.innerHTML = '<i class="ph ph-check"></i> Planı Kaydet';
      errorAlert.textContent = "Kaydedilirken bir hata oluştu.";
      errorAlert.style.display = "block";
    }
  });
}

function saveSchedulesFromDOM() {
  const rows = document.querySelectorAll('.schedule-row');
  schedules = Array.from(rows).map(row => {
    return {
      dayOfWeek: parseInt(row.querySelector('.sch-day').value),
      time: row.querySelector('.sch-time').value,
      duration: parseInt(row.querySelector('.sch-duration').value) || 60
    };
  });
}

function generateInitialPlan() {
  const state = getState();
  const start = new Date(entityData.startDate + 'T00:00:00');
  const end = new Date(entityData.endDate + 'T23:59:59');
  
  const activeSubjects = getSubjectsForBranches(state.profile.branches || []);
  allCurriculumTopics = [];
  
  activeSubjects.forEach(subj => {
    const units = state.curriculum[subj]?.[entityData.grade] || [];
    units.forEach(unit => {
      unit.topics.forEach(topic => {
        allCurriculumTopics.push({
          subject: subj,
          unitId: unit.id,
          topicId: topic.id,
          title: topic.name
        });
      });
    });
  });

  let rawLessons = [];
  const iterDate = new Date(start);
  
  while (iterDate <= end) {
    const currentDay = iterDate.getDay();
    schedules.forEach(sch => {
      if (sch.dayOfWeek === currentDay) {
        rawLessons.push({
          date: getLocalDateStr(new Date(iterDate)),
          startTime: sch.time,
          endTime: _addMinutes(sch.time, sch.duration),
          isSkipped: false,
          isSpecial: false,
          specialTitle: ''
        });
      }
    });
    iterDate.setDate(iterDate.getDate() + 1);
  }

  rawLessons.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  generatedLessons = rawLessons;
  remapTopics();
}

function remapTopics() {
  let topicIndex = 0;
  
  generatedLessons.forEach(lesson => {
    if (lesson.isSkipped) {
      lesson.topicId = null;
      lesson.unitId = null;
      lesson.title = 'Tatil';
    } else if (lesson.isSpecial) {
      lesson.topicId = null;
      lesson.unitId = null;
      lesson.title = lesson.specialTitle;
      lesson.subject = 'Sınav / Özel Etkinlik';
    } else {
      const topic = allCurriculumTopics[topicIndex];
      if (topic) {
        lesson.subject = topic.subject;
        lesson.unitId = topic.unitId;
        lesson.topicId = topic.topicId;
        lesson.title = topic.title;
        topicIndex++;
      } else {
        lesson.subject = 'Genel';
        lesson.unitId = null;
        lesson.topicId = null;
        lesson.title = 'Serbest Ders / Genel Tekrar';
      }
    }
  });
}

function _addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
