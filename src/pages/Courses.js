// ═════════════════════════════════════════════════
// COURSES PAGE - Curriculum Management
// ═════════════════════════════════════════════════
import { getState, addMaterial, deleteMaterial, addUnit, updateUnit, deleteUnit, addTopic, updateTopic, deleteTopic } from '../store/store.js';
import { icon } from '../components/icons.js';
import { SUBJECTS, GRADE_TO_SUBJECTS, ALL_GRADES, CONTENT_TYPES } from '../data/curriculum.js';
import { escHtml } from '../utils/helpers.js';
import { openModal, closeModal } from '../components/modal.js';

export function renderCourses(navigate) {
  const state = getState();
  const availableGrades = ALL_GRADES.filter(g => GRADE_TO_SUBJECTS[g] && GRADE_TO_SUBJECTS[g].length > 0);
  let activeGrade = availableGrades[0];

  const html = `
    <div class="fade-in">
      <div class="page-header">
        <div>
          <h2>Müfredat Yönetimi</h2>
          <p>Sınıflara göre ünite ve konu içeriklerini yönetin</p>
        </div>
        <button class="btn btn-primary" id="btn-add-material">${icon('plus', 14)} İçerik Ekle</button>
      </div>

      <!-- Grade Tabs -->
      <div class="tabs" id="grade-tabs" style="margin-bottom:24px; overflow-x: auto; display: flex; gap: 8px;">
        ${availableGrades.map((g, i) => `
          <button class="tab-btn ${g === activeGrade ? 'active' : ''}" data-grade="${g}" style="white-space: nowrap;">${g}</button>
        `).join('')}
      </div>

      <!-- Curriculum Content -->
      <div id="curriculum-content">
        ${renderCurriculumContent(state, activeGrade)}
      </div>
    </div>
  `;

  return {
    html,
    init: (el, nav) => initCourses(el, nav, state)
  };
}

function renderCurriculumContent(state, grade) {
  const subjects = GRADE_TO_SUBJECTS[grade] || [];
  let html = '';

  if (subjects.length === 0) {
    return `<div class="empty-state">${icon('book', 36)}<h3>Bu sınıf için müfredat tanımlanmamış</h3></div>`;
  }

  subjects.forEach(({ subject }) => {
    const subjectInfo = SUBJECTS.find(s => s.id === subject);
    const units = state.curriculum[subject]?.[grade] || [];
    const allMaterials = Object.values(state.materials).filter(m => m.subject === subject && m.grade === grade);

    if (subjects.length > 1) {
      html += `
        <div style="margin: 24px 0 16px 0; border-bottom: 2px solid var(--border); padding-bottom: 8px;">
          <h3 style="color: var(--text); display:flex; align-items:center; gap: 8px; font-size: 18px;">
            ${subjectInfo?.icon || ''} ${subjectInfo?.name || subject}
          </h3>
        </div>
      `;
    }

    if (units.length === 0) {
      html += `
        <div class="empty-state" style="padding: 20px; border: 1px dashed var(--border); margin-bottom: 16px; border-radius: 8px;">
          <p style="color:var(--text-muted); margin-bottom: 12px;">Henüz ünite eklenmemiş.</p>
          <button class="btn btn-secondary btn-sm" data-add-unit="${subject}" data-grade="${grade}">${icon('plus', 12)} Yeni Ünite Ekle</button>
        </div>
      `;
    } else {
      html += units.map(unit => {
        const unitMaterials = allMaterials.filter(m => m.unitId === unit.id && !m.topicId);

        return `
          <div class="card" style="margin-bottom:16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid var(--bg-hover);">
              <div style="width:12px;height:12px;border-radius:4px;background:var(--primary);flex-shrink:0;"></div>
              <h3 style="font-size:16px;font-weight:700;flex:1;display:flex;align-items:center;gap:8px; color:var(--text);">
                ${escHtml(unit.name)}
                <div style="display:flex; opacity: 0.6; transition: opacity 0.2s;">
                  <button class="btn btn-ghost btn-sm" data-edit-unit="${unit.id}" data-subject="${subject}" data-grade="${grade}" style="padding:4px;" title="Üniteyi Düzenle">${icon('edit', 14)}</button>
                  <button class="btn btn-ghost btn-sm" data-delete-unit="${unit.id}" data-subject="${subject}" data-grade="${grade}" style="padding:4px;color:var(--danger);" title="Üniteyi Sil">${icon('trash', 14)}</button>
                </div>
              </h3>
              <button class="btn btn-secondary btn-sm" data-add-topic="${unit.id}" data-subject="${subject}" data-grade="${grade}">${icon('plus', 12)} Konu Ekle</button>
            </div>

            <!-- Topics List -->
            <div style="padding-left: 22px; display:flex; flex-direction:column; gap: 16px;">
              ${unit.topics.length === 0 ? '<em style="color:var(--text-muted);font-size:13px;">Bu ünitede henüz konu yok.</em>' : ''}
              ${unit.topics.map(topic => {
                const topicMaterials = allMaterials.filter(m => m.unitId === unit.id && m.topicId === topic.id);
                return `
                  <div style="border-left: 2px solid var(--border); padding-left: 16px;">
                    <div style="display:flex;align-items:center;gap:8px; margin-bottom: 8px;">
                      <h4 style="font-size:14px; font-weight:600; color:var(--text); margin:0; display:flex; align-items:center; gap:6px;">
                        ${escHtml(topic.name)}
                        <button class="btn btn-ghost btn-sm" data-edit-topic="${topic.id}" data-unit-id="${unit.id}" data-subject="${subject}" data-grade="${grade}" style="padding:2px;" title="Konuyu Düzenle">${icon('edit', 12)}</button>
                        <button class="btn btn-ghost btn-sm" data-delete-topic="${topic.id}" data-unit-id="${unit.id}" data-subject="${subject}" data-grade="${grade}" style="padding:2px;color:var(--danger);" title="Konuyu Sil">${icon('trash', 12)}</button>
                      </h4>
                    </div>
                    
                    <!-- Materials for this topic -->
                    <div style="display:flex; flex-direction:column; gap:6px; padding-left: 8px;">
                      ${topicMaterials.length === 0 ? '<span style="color:var(--text-muted); font-size:12px;">İçerik yok.</span>' : ''}
                      ${topicMaterials.map(m => {
                        const cType = CONTENT_TYPES.find(ct => ct.id === m.contentType);
                        return `
                        <div style="display:flex; align-items:center; gap: 8px; font-size:13px;">
                          <span style="font-size:14px;">${cType?.icon || '📄'}</span>
                          <a href="${escHtml(m.link)}" target="_blank" style="color:var(--primary); text-decoration:none; display:flex; align-items:center; gap:4px;" class="hover-underline">
                            ${escHtml(m.title)}
                          </a>
                          <button class="btn btn-ghost btn-sm" data-delete-material="${m.id}" style="padding:0px 4px; color:var(--danger); opacity:0.6; margin-left:auto;" title="İçeriği Sil">${icon('x', 14)}</button>
                        </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Unit Level Materials (Exams, etc.) -->
            ${unitMaterials.length > 0 ? `
              <div style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed var(--border); padding-left: 22px;">
                <h4 style="font-size:13px; font-weight:700; color:var(--text-muted); margin-bottom: 8px; text-transform: uppercase;">Ünite Değerlendirme / Genel Testler</h4>
                <div style="display:flex; flex-direction:column; gap:6px; padding-left: 8px;">
                  ${unitMaterials.map(m => {
                    const cType = CONTENT_TYPES.find(ct => ct.id === m.contentType);
                    return `
                    <div style="display:flex; align-items:center; gap: 8px; font-size:13px; background: rgba(255,159,67,0.08); padding: 6px 10px; border-radius: 6px;">
                      <span style="font-size:14px;">${cType?.icon || '📋'}</span>
                      <a href="${escHtml(m.link)}" target="_blank" style="color:var(--text); font-weight: 500; text-decoration:none; display:flex; align-items:center; gap:4px;" class="hover-underline">
                        ${escHtml(m.title)}
                      </a>
                      <button class="btn btn-ghost btn-sm" data-delete-material="${m.id}" style="padding:0px 4px; color:var(--danger); opacity:0.8; margin-left:auto;">${icon('x', 14)}</button>
                    </div>
                    `;
                  }).join('')}
                </div>
              </div>
            ` : ''}
            
            <div style="margin-top: 16px; text-align: center;">
              <button class="btn btn-ghost btn-sm" data-add-unit-material="${unit.id}" data-subject="${subject}" data-grade="${grade}" style="color:var(--text-muted); font-size: 13px;">${icon('plus', 12)} Ünite Geneli Test/Deneme Ekle</button>
            </div>
          </div>
        `;
      }).join('');
      
      html += `
        <div style="text-align:center; padding-top: 10px; margin-bottom: 24px;">
          <button class="btn btn-secondary" data-add-unit="${subject}" data-grade="${grade}">${icon('plus', 14)} Yeni Ünite Ekle</button>
        </div>
      `;
    }
  });

  return html;
}

function initCourses(el, navigate, state) {
  const availableGrades = ALL_GRADES.filter(g => GRADE_TO_SUBJECTS[g] && GRADE_TO_SUBJECTS[g].length > 0);
  let activeGrade = availableGrades[0];

  function refresh() {
    const content = el.querySelector('#curriculum-content');
    if (content) {
      content.innerHTML = renderCurriculumContent(getState(), activeGrade);
      initMaterialButtons(el, navigate);
      initCurriculumButtons(el, refresh, navigate);
    }
  }

  // Grade selection
  el.querySelectorAll('[data-grade]').forEach(btn => {
    // Top-level tab buttons only
    if (btn.classList.contains('tab-btn')) {
      btn.addEventListener('click', () => {
        activeGrade = btn.dataset.grade;
        el.querySelectorAll('.tab-btn[data-grade]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        refresh();
      });
    }
  });

  // Global Add Material
  el.querySelector('#btn-add-material')?.addEventListener('click', () => {
    const defaultSubject = GRADE_TO_SUBJECTS[activeGrade]?.[0]?.subject;
    openAddMaterialModal(defaultSubject, activeGrade, null, null, navigate, () => refresh());
  });

  initMaterialButtons(el, navigate);
  initCurriculumButtons(el, refresh, navigate);
}

function initMaterialButtons(el, navigate) {
  el.querySelectorAll('[data-delete-material]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openCurriculumConfirmModal('İçeriği Sil', 'Bu metaryali silmek istediğinize emin misiniz?', () => {
        deleteMaterial(btn.dataset.deleteMaterial);
        // Dispatch custom event to trigger app re-render or do manual refresh 
        navigate('courses'); 
      });
    });
  });
}

// targetUnitId allows us to open the modal specifically for a unit test (without topic)
function openAddMaterialModal(defSubject, defGrade, targetUnitId, targetTopicId, navigate, onSave) {
  const isUnitMode = targetUnitId && targetTopicId === null; // Force unit level

  const body = `
    <div class="form-group row-group" style="display:flex; gap:16px;">
      <div style="flex:1;">
        <label>Sınıf</label>
        <select id="mat-grade">
          ${ALL_GRADES.filter(g => GRADE_TO_SUBJECTS[g]?.length > 0).map(g => `<option value="${g}" ${g === defGrade ? 'selected' : ''}>${g}</option>`).join('')}
        </select>
      </div>
      <div style="flex:1;">
        <label>Ders</label>
        <select id="mat-subject"></select>
      </div>
    </div>
    
    <div class="form-group" style="${isUnitMode ? 'display:none;' : ''}">
      <label>İçerik Seviyesi</label>
       <select id="mat-level">
        <option value="topic" ${!isUnitMode ? 'selected' : ''}>Konuya Özgü (Özet, Slayt vs.)</option>
        <option value="unit" ${isUnitMode ? 'selected' : ''}>Ünite Geneli (Değerlendirme Testi, Deneme vb.)</option>
      </select>
    </div>

    <div class="form-group row-group" style="display:flex; gap:16px;">
      <div style="flex:1;">
        <label>İçerik Türü</label>
        <select id="mat-type">
          ${CONTENT_TYPES.map(ct => `<option value="${ct.id}" ${isUnitMode && ct.id === 'deneme' ? 'selected' : ''}>${ct.icon} ${ct.label}</option>`).join('')}
        </select>
      </div>
    </div>
    
    <div class="form-group">
      <label>Ünite</label>
      <select id="mat-unit"></select>
    </div>
    <div class="form-group" id="topic-container" style="${isUnitMode ? 'display:none;' : ''}">
      <label>Konu</label>
      <select id="mat-topic"></select>
    </div>
    
    <div class="form-group">
      <label>Başlık</label>
      <input type="text" id="mat-title" placeholder="İçerik başlığı (örn: Konu Özeti)">
    </div>
    <div class="form-group">
      <label>Google Drive / YouTube Linki</label>
      <input type="url" id="mat-link" placeholder="https://drive.google.com/...">
    </div>
    <div id="mat-error" style="color:var(--danger); font-size:13px; margin-top:8px; display:none; padding:8px; background:rgba(234, 84, 85, 0.1); border-radius:4px;"></div>
  `;

  openModal({
    title: 'İçerik Ekle',
    size: '',
    body,
    footer: `<button class="btn btn-secondary" id="mat-cancel">İptal</button><button class="btn btn-primary" id="mat-save">Kaydet</button>`,
  });

  const gradeSel = document.getElementById('mat-grade');
  const subjSel = document.getElementById('mat-subject');
  const unitSel = document.getElementById('mat-unit');
  const topicSel = document.getElementById('mat-topic');
  const levelSel = document.getElementById('mat-level');
  const topicContainer = document.getElementById('topic-container');

  // Trigger content level change
  levelSel?.addEventListener('change', (e) => {
    if (e.target.value === 'unit') {
      topicContainer.style.display = 'none';
      topicSel.value = '';
    } else {
      topicContainer.style.display = 'block';
    }
  });

  function updateSubjects() {
    const gr = gradeSel.value;
    const subjects = GRADE_TO_SUBJECTS[gr] || [];
    subjSel.innerHTML = subjects.map(s => {
      const sinfo = SUBJECTS.find(x => x.id === s.subject);
      return `<option value="${s.subject}" ${s.subject === defSubject ? 'selected' : ''}>${sinfo?.icon || ''} ${sinfo?.name || s.subject}</option>`;
    }).join('');
    updateUnits();
  }

  function updateUnits() {
    const gr = gradeSel.value;
    const subj = subjSel.value;
    const units = getState().curriculum[subj]?.[gr] || [];
    unitSel.innerHTML = units.map(u => `<option value="${u.id}" ${u.id === targetUnitId ? 'selected' : ''}>${u.name}</option>`).join('');
    if (units.length === 0) {
      unitSel.innerHTML = '<option value="">(Ünite Bulunamadı)</option>';
    }
    updateTopics();
  }

  function updateTopics() {
    const gr = gradeSel.value;
    const subj = subjSel.value;
    const uId = unitSel.value;
    const unit = getState().curriculum[subj]?.[gr]?.find(u => u.id === uId);
    if (unit && unit.topics.length > 0) {
      topicSel.innerHTML = unit.topics.map(t => `<option value="${t.id}" ${t.id === targetTopicId ? 'selected' : ''}>${t.name}</option>`).join('');
    } else {
      topicSel.innerHTML = '<option value="">(Konu Bulunamadı)</option>';
    }
  }

  gradeSel?.addEventListener('change', updateSubjects);
  subjSel?.addEventListener('change', updateUnits);
  unitSel?.addEventListener('change', updateTopics);

  // Init dropdowns
  updateSubjects();

  document.getElementById('mat-cancel')?.addEventListener('click', closeModal);
  document.getElementById('mat-save')?.addEventListener('click', () => {
    const link = document.getElementById('mat-link').value.trim();
    const title = document.getElementById('mat-title').value.trim();
    const isUnitLvl = levelSel.value === 'unit';
    const errEl = document.getElementById('mat-error');
    
    function showError(msg) {
      if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
    }

    if (!title || !link) { showError('Başlık ve link zorunludur.'); return; }
    if (!unitSel.value) { showError('Lütfen bir ünite seçin veya önce ünite oluşturun.'); return; }
    if (!isUnitLvl && !topicSel.value) { showError('Lütfen bir konu seçin veya önce konu oluşturun.'); return; }

    addMaterial({
      subject: subjSel.value,
      grade: gradeSel.value,
      unitId: unitSel.value,
      topicId: isUnitLvl ? null : topicSel.value,
      contentType: document.getElementById('mat-type').value,
      title,
      link,
    });
    closeModal();
    if (onSave) onSave();
  });
}

function openCurriculumPromptModal(title, label, defaultValue, onSave) {
  const body = `
    <div class="form-group">
      <label>${label}</label>
      <input type="text" id="curr-prompt-input" value="${escHtml(defaultValue)}" placeholder="${label}...">
      <div id="curr-prompt-error" style="color:var(--danger); font-size:13px; margin-top:6px; display:none; padding:6px; background:rgba(234, 84, 85, 0.1); border-radius:4px;"></div>
    </div>
  `;
  openModal({
    title,
    size: 'sm',
    body,
    footer: `<button class="btn btn-secondary" id="curr-cancel">İptal</button><button class="btn btn-primary" id="curr-save">Kaydet</button>`,
  });

  document.getElementById('curr-cancel')?.addEventListener('click', closeModal);
  document.getElementById('curr-save')?.addEventListener('click', () => {
    const val = document.getElementById('curr-prompt-input').value.trim();
    if (val) {
      onSave(val);
      closeModal();
    } else {
      const errEl = document.getElementById('curr-prompt-error');
      if (errEl) { errEl.textContent = "Bu alan boş bırakılamaz."; errEl.style.display = 'block'; }
    }
  });
  
  setTimeout(() => document.getElementById('curr-prompt-input')?.focus(), 100);
}

function openCurriculumConfirmModal(title, text, onConfirm) {
  const body = `
    <div style="padding: 10px 0;">
      <p style="margin-bottom: 0;">${text}</p>
    </div>
  `;
  openModal({
    title,
    size: 'sm',
    body,
    footer: `<button class="btn btn-secondary" id="curr-cancel">Vazgeç</button><button class="btn btn-primary" id="curr-confirm" style="background:var(--danger);">Evet, Sil</button>`,
  });

  document.getElementById('curr-cancel')?.addEventListener('click', closeModal);
  document.getElementById('curr-confirm')?.addEventListener('click', () => {
    onConfirm();
    closeModal();
  });
}

function initCurriculumButtons(el, refresh, navigate) {
  // Add Unit
  el.querySelectorAll('[data-add-unit]').forEach(btn => {
    btn.addEventListener('click', () => {
      openCurriculumPromptModal('Yeni Ünite Ekle', 'Ünite Adı', '', (name) => {
        // use btn.dataset.addUnit since it holds the subject id (data-add-unit="tarih")
        addUnit(btn.dataset.addUnit, btn.dataset.grade, name);
        refresh();
        setTimeout(() => {
          const scroller = document.querySelector('.page-content');
          if (scroller) scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
        }, 100);
      });
    });
  });

  // Edit Unit
  el.querySelectorAll('[data-edit-unit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const subject = btn.dataset.subject;
      const grade = btn.dataset.grade;
      const unitId = btn.dataset.editUnit;
      const unit = getState().curriculum[subject][grade].find(u => u.id === unitId);
      openCurriculumPromptModal('Üniteyi Düzenle', 'Ünite Adı', unit?.name || '', (name) => {
        if (name !== unit.name) {
          updateUnit(subject, grade, unitId, name);
          refresh();
        }
      });
    });
  });

  // Delete Unit
  el.querySelectorAll('[data-delete-unit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const subject = btn.dataset.subject;
      const grade = btn.dataset.grade;
      openCurriculumConfirmModal('Üniteyi Sil', 'Bu üniteyi ve içindeki tüm konuları silmek istediğinize emin misiniz?', () => {
        deleteUnit(subject, grade, btn.dataset.deleteUnit);
        refresh();
      });
    });
  });

  // Add Topic
  el.querySelectorAll('[data-add-topic]').forEach(btn => {
    btn.addEventListener('click', () => {
      openCurriculumPromptModal('Yeni Konu Ekle', 'Konu Adı', '', (name) => {
        addTopic(btn.dataset.subject, btn.dataset.grade, btn.dataset.addTopic, name);
        refresh();
      });
    });
  });

  // Edit Topic
  el.querySelectorAll('[data-edit-topic]').forEach(btn => {
    btn.addEventListener('click', () => {
      const subject = btn.dataset.subject;
      const grade = btn.dataset.grade;
      const topicId = btn.dataset.editTopic;
      const unitId = btn.dataset.unitId;
      const unit = getState().curriculum[subject][grade].find(u => u.id === unitId);
      const topic = unit?.topics.find(t => t.id === topicId);
      openCurriculumPromptModal('Konuyu Düzenle', 'Konu Adı', topic?.name || '', (name) => {
        if (name !== topic.name) {
          updateTopic(subject, grade, unitId, topicId, name);
          refresh();
        }
      });
    });
  });

  // Delete Topic
  el.querySelectorAll('[data-delete-topic]').forEach(btn => {
    btn.addEventListener('click', () => {
      const subject = btn.dataset.subject;
      const grade = btn.dataset.grade;
      openCurriculumConfirmModal('Konuyu Sil', 'Bu konuyu silmek istediğinize emin misiniz? Öğrencilerin tamamlanma durumları etkilenebilir.', () => {
        deleteTopic(subject, grade, btn.dataset.unitId, btn.dataset.deleteTopic);
        refresh();
      });
    });
  });

  // Add Unit Level Material (Exam)
  el.querySelectorAll('[data-add-unit-material]').forEach(btn => {
    btn.addEventListener('click', () => {
      const subject = btn.dataset.subject;
      const grade = btn.dataset.grade;
      const unitId = btn.dataset.addUnitMaterial;
      openAddMaterialModal(subject, grade, unitId, null, navigate, () => refresh());
    });
  });
}

