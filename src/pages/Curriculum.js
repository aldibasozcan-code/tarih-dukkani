// ═════════════════════════════════════════════════
// COURSES PAGE - Curriculum Management
// ═════════════════════════════════════════════════
import { getState, addMaterial, deleteMaterial, addUnit, updateUnit, deleteUnit, addTopic, updateTopic, deleteTopic, reorderTopics } from '../store/store.js';
import { icon } from '../components/icons.js';
import { SUBJECTS, ALL_GRADES, CONTENT_TYPES, SUBJECT_GRADES, getSubjectsForBranches } from '../data/curriculum.js';
import { escHtml, getYoutubeVideoId, isYoutubeUrl, getGoogleDrivePreviewUrl, isGoogleDriveUrl } from '../utils/helpers.js';
import { openModal, closeModal } from '../components/modal.js';

function renderGradeTabButton(g, activeGrade) {
  const isActive = g === activeGrade;
  return `
    <button class="tab-btn-modern ${isActive ? 'active' : ''}" data-grade="${g}" style="flex:1; min-width:80px; text-align:center; padding: 12px 20px; border-radius: 10px; border: none; background: ${isActive ? 'white' : 'transparent'}; color: ${isActive ? 'var(--brand-green)' : 'var(--text-secondary)'}; font-weight: ${isActive ? '800' : '600'}; font-size: 15px; box-shadow: ${isActive ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'}; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap;">
      ${g}
    </button>
  `;
}

export function renderCurriculum(navigate) {
  const state = getState();
  const activeGrades = state.profile.grades || [];
  const availableGrades = ALL_GRADES.filter(g => activeGrades.includes(g));
  let activeGrade = availableGrades[0];

  const html = `
    <div class="fade-in">
      <div class="page-header" style="background: linear-gradient(135deg, var(--brand-green-soft) 0%, rgba(255,255,255,1) 100%); padding: 32px 24px; border-radius: 20px; margin-bottom: 32px; border: 1px solid rgba(16,185,129,0.15); box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
        <div>
          <h2 style="font-size: 32px; font-weight: 800; color: var(--brand-green); margin-bottom: 8px; display: flex; align-items: center; gap: 12px; letter-spacing: -0.5px;">
            ${icon('book', 32)} Müfredat Yönetimi
          </h2>
          <p style="color: var(--text-secondary); font-size: 16px; font-weight: 500;">Sınıflara göre ünite ve konu içeriklerini profesyonelce yönetin</p>
        </div>
        <div style="display:flex; gap:12px; align-items: center;">
          <button class="btn btn-secondary hover-lift" id="btn-export-curr" style="background: white; border: 1px solid var(--border); box-shadow: var(--shadow-sm); padding: 10px 16px; font-weight: 600;">${icon('download', 16)} Dışa Aktar</button>
          <button class="btn btn-secondary hover-lift" id="btn-import-curr" style="background: white; border: 1px solid var(--border); box-shadow: var(--shadow-sm); padding: 10px 16px; font-weight: 600;">${icon('upload', 16)} İçe Aktar</button>
          <input type="file" id="import-curr-file" accept=".json" style="display:none;">
          <button class="btn btn-primary hover-lift" id="btn-add-material" style="box-shadow: 0 8px 20px rgba(16,185,129,0.3); padding: 10px 20px; font-weight: 700; font-size: 15px;">${icon('plus', 16)} İçerik Ekle</button>
        </div>
      </div>

      <!-- Grade Tabs -->
      <div class="tabs-modern" id="grade-tabs" style="margin-bottom:32px; overflow-x: auto; display: flex; gap: 8px; padding: 8px; background: var(--bg-secondary); border-radius: 16px; border: 1px solid var(--border); max-width: 100%;">
        ${availableGrades.map(g => renderGradeTabButton(g, activeGrade)).join('')}
      </div>

      <!-- Curriculum Content -->
      <div id="curriculum-content" style="background: white; padding: 32px; border-radius: 20px; border: 1px solid var(--border); box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
        ${renderCurriculumContent(state, activeGrade)}
      </div>
    </div>
  `;

  return {
    html,
    init: (el, nav) => initCurriculum(el, nav, state)
  };
}

const CHIP_STYLES = {
  ders_notu: { bg: 'rgba(99, 202, 183, 0.1)', border: 'rgba(99, 202, 183, 0.25)', text: '#2d7d6f', icon: '📄' },
  slayt: { bg: 'rgba(124, 106, 255, 0.1)', border: 'rgba(124, 106, 255, 0.25)', text: '#4e3bc2', icon: '🖥️' },
  yeni_nesil: { bg: 'rgba(246, 201, 14, 0.12)', border: 'rgba(246, 201, 14, 0.3)', text: '#a27f00', icon: '💡' },
  tarama: { bg: 'rgba(255, 159, 67, 0.1)', border: 'rgba(255, 159, 67, 0.25)', text: '#c86900', icon: '✅' },
  deneme: { bg: 'rgba(255, 90, 101, 0.1)', border: 'rgba(255, 90, 101, 0.25)', text: '#cc2935', icon: '📋' },
  video: { bg: 'rgba(255, 0, 0, 0.08)', border: 'rgba(255, 0, 0, 0.2)', text: '#cc0000', icon: '🎬' }
};
const defaultStyle = { bg: 'rgba(108, 117, 125, 0.1)', border: 'rgba(108, 117, 125, 0.2)', text: 'var(--text-primary)', icon: '📄' };

function renderCurriculumContent(state, grade) {
  const activeSubjectIds = getSubjectsForBranches(state.profile.branches || []);
  const subjects = activeSubjectIds
    .filter(subj => state.curriculum[subj] && state.curriculum[subj][grade])
    .map(subj => ({ subject: subj, grade: grade }));

  if (subjects.length === 0) {
    return `<div class="empty-state">${icon('book', 36)}<h3>Bu sınıf için müfredat tanımlanmamış</h3></div>`;
  }

  // Calculate statistics
  let totalUnits = 0;
  let totalTopics = 0;
  let totalMaterials = 0;
  let videoCount = 0;
  let docCount = 0;

  subjects.forEach(({ subject }) => {
    const units = state.curriculum[subject]?.[grade] || [];
    totalUnits += units.length;
    units.forEach(u => {
      totalTopics += u.topics.length;
    });

    const mats = Object.values(state.materials).filter(m => m.subject === subject && m.grade === grade);
    totalMaterials += mats.length;
    mats.forEach(m => {
      if (m.contentType === 'video') videoCount++;
      else docCount++;
    });
  });

  let html = `
    <!-- Bento Grid Stats -->
    <div class="grid grid-4 fade-in-up stagger-1" style="margin-bottom: 32px; gap: 16px;">
      <div class="kpi-card hover-lift" style="border-left: 4px solid var(--brand-green); background: rgba(255, 255, 255, 0.7); padding: 16px 20px;">
        <div class="kpi-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--brand-green); width: 42px; height: 42px; border-radius: 10px;">
          ${icon('book', 20)}
        </div>
        <div>
          <div class="kpi-value" style="font-size: 24px;">${totalUnits}</div>
          <div class="kpi-label" style="font-size: 12px;">Müfredat Ünitesi</div>
        </div>
      </div>
      <div class="kpi-card hover-lift" style="border-left: 4px solid #7c6aff; background: rgba(255, 255, 255, 0.7); padding: 16px 20px;">
        <div class="kpi-icon" style="background: rgba(124, 106, 255, 0.1); color: #7c6aff; width: 42px; height: 42px; border-radius: 10px;">
          ${icon('courses', 20)}
        </div>
        <div>
          <div class="kpi-value" style="font-size: 24px;">${totalTopics}</div>
          <div class="kpi-label" style="font-size: 12px;">Toplam Konu</div>
        </div>
      </div>
      <div class="kpi-card hover-lift" style="border-left: 4px solid #ff9f43; background: rgba(255, 255, 255, 0.7); padding: 16px 20px;">
        <div class="kpi-icon" style="background: rgba(255, 159, 67, 0.1); color: #ff9f43; width: 42px; height: 42px; border-radius: 10px;">
          ${icon('fileText', 20)}
        </div>
        <div>
          <div class="kpi-value" style="font-size: 24px;">${totalMaterials}</div>
          <div class="kpi-label" style="font-size: 12px;">Toplam Kaynak</div>
        </div>
      </div>
      <div class="kpi-card hover-lift" style="border-left: 4px solid #ff5a65; background: rgba(255, 255, 255, 0.7); padding: 16px 20px;">
        <div class="kpi-icon" style="background: rgba(255, 90, 101, 0.1); color: #ff5a65; width: 42px; height: 42px; border-radius: 10px;">
          ${icon('video', 20)}
        </div>
        <div>
          <div class="kpi-value" style="font-size: 14px; margin-top: 6px; font-weight: 800; color: var(--text-primary);">
            ${videoCount} Video / ${docCount} Doküman
          </div>
          <div class="kpi-label" style="margin-top: 8px; font-size: 12px;">Materyal Dağılımı</div>
        </div>
      </div>
    </div>

    <!-- Search Input Bar -->
    <div style="margin-bottom: 32px; position: relative;" class="fade-in-up stagger-2">
      <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex; align-items: center;">
        ${icon('search', 20)}
      </span>
      <input type="text" id="curriculum-search" placeholder="Müfredatta ünite veya konu ara..." style="width: 100%; padding: 14px 16px 14px 48px; border-radius: 14px; border: 1px solid var(--border); font-size: 15px; font-weight: 600; outline: none; transition: all 0.3s; background: var(--bg-secondary);">
    </div>
  `;

  subjects.forEach(({ subject }) => {
    let subjectInfo = SUBJECTS.find(s => s.id === subject);
    if (!subjectInfo) {
      subjectInfo = { 
        id: subject, 
        name: subject.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), 
        icon: '📚' 
      };
    }
    const units = state.curriculum[subject]?.[grade] || [];
    const allMaterials = Object.values(state.materials).filter(m => m.subject === subject && m.grade === grade);

    if (subjects.length > 1) {
      html += `
        <div style="margin: 32px 0 24px 0; display:flex; align-items:center; gap: 16px;">
          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, var(--brand-green-soft) 0%, rgba(255,255,255,1) 100%); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: var(--brand-green); font-size: 24px; box-shadow: 0 4px 12px rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2);">
             ${subjectInfo?.icon || '📚'}
          </div>
          <h3 style="color: var(--text-primary); font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
            ${subjectInfo?.name || subject}
          </h3>
          <div style="flex:1; height:2px; background: linear-gradient(to right, var(--border), transparent); margin-left: 16px;"></div>
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
      window._expandedUnits = window._expandedUnits || {};
      
      html += units.map((unit, uIndex) => {
        const isExpanded = window._expandedUnits[unit.id] !== false;
        const unitMaterials = allMaterials.filter(m => m.unitId === unit.id && !m.topicId);
        const totalResources = unitMaterials.length + unit.topics.reduce((acc, t) => acc + allMaterials.filter(m => m.unitId === unit.id && m.topicId === t.id).length, 0);
        
        return `
          <div class="unit-accordion hover-lift ${isExpanded ? 'active' : ''}" data-unit-id="${unit.id}" style="margin-bottom: 24px; border: 1px solid ${isExpanded ? 'rgba(16,185,129,0.3)' : 'var(--border)'}; border-radius: 16px; overflow: hidden; background: #fff; box-shadow: ${isExpanded ? '0 12px 30px rgba(16,185,129,0.06)' : 'var(--shadow-sm)'}; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
            <!-- Unit Header -->
            <div class="unit-header" data-toggle-unit="${unit.id}" style="padding: 20px 24px; background: ${isExpanded ? 'linear-gradient(to right, var(--brand-green-soft), #ffffff)' : '#fff'}; cursor: pointer; display: flex; align-items: center; gap: 16px; border-left: 5px solid ${isExpanded ? 'var(--brand-green)' : 'transparent'}; transition: all 0.3s ease;">
              <div class="unit-icon" style="color: ${isExpanded ? 'var(--brand-green)' : 'var(--text-muted)'}; transform: rotate(${isExpanded ? '90deg' : '0deg'}); transition: transform 0.3s; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: ${isExpanded ? 'white' : 'var(--bg-secondary)'}; border-radius: 10px; box-shadow: ${isExpanded ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'};">
                ${icon('chevronRight', 20)}
              </div>
              <h3 style="font-size: 18px; font-weight: 800; color: ${isExpanded ? 'var(--brand-green)' : 'var(--text-primary)'}; margin: 0; flex: 1; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                <span>${escHtml(unit.name)}</span>
                <span style="display: flex; gap: 6px; flex-wrap: wrap;">
                  <span style="border-radius: 20px; font-size: 11px; padding: 4px 10px; font-weight: 700; background: ${isExpanded ? 'white' : 'var(--brand-green-soft)'}; color: var(--brand-green); border: 1px solid rgba(16, 185, 129, 0.15); display: flex; align-items: center; gap: 4px;">
                    ${icon('book', 12)} ${unit.topics.length} Konu
                  </span>
                  <span style="border-radius: 20px; font-size: 11px; padding: 4px 10px; font-weight: 700; background: ${isExpanded ? 'white' : 'var(--bg-secondary)'}; color: var(--text-secondary); border: 1px solid var(--border); display: flex; align-items: center; gap: 4px;">
                    ${icon('fileText', 12)} ${totalResources} Kaynak
                  </span>
                </span>
              </h3>
              <div style="display: flex; gap: 8px; opacity: ${isExpanded ? '1' : '0.6'}; transition: opacity 0.3s;" onclick="event.stopPropagation()">
                <button class="btn btn-ghost btn-sm btn-icon hover-scale" data-edit-unit="${unit.id}" data-subject="${subject}" data-grade="${grade}" title="Üniteyi Düzenle" style="background: white; border: 1px solid var(--border); border-radius: 8px;">${icon('edit', 16)}</button>
                <button class="btn btn-ghost btn-sm btn-icon hover-scale" data-delete-unit="${unit.id}" data-subject="${subject}" data-grade="${grade}" style="color: var(--danger); background: white; border: 1px solid var(--border); border-radius: 8px;" title="Üniteyi Sil">${icon('trash', 16)}</button>
                <button class="btn btn-primary btn-sm hover-scale" data-add-topic="${unit.id}" data-subject="${subject}" data-grade="${grade}" style="border-radius: 8px; font-weight: 700;">
                  ${icon('plus', 14)} Konu Ekle
                </button>
              </div>
            </div>

            <!-- Unit Content -->
            <div class="unit-content" style="display: ${isExpanded ? 'block' : 'none'}; padding: 24px; border-top: 1px solid var(--border); background: #fcfcfc;">
              <div class="topic-list" style="display:flex; flex-direction:column; gap: 16px;">
                ${unit.topics.length === 0 ? `
                  <div class="empty-state" style="padding: 20px; opacity: 0.5;">
                    <p style="font-size: 14px; font-weight: 500;">Bu ünitede henüz konu bulunmuyor.</p>
                  </div>
                ` : ''}
                ${unit.topics.map((topic, index) => {
                  const topicMaterials = allMaterials.filter(m => m.unitId === unit.id && m.topicId === topic.id);
                  return `
                    <div class="topic-item hover-lift" draggable="true" 
                         data-index="${index}" 
                         data-topic-id="${topic.id}" 
                         data-unit-id="${unit.id}" 
                         data-subject="${subject}" 
                         data-grade="${grade}"
                         style="background: #ffffff; border-radius: 14px; padding: 18px 24px; border: 1px solid var(--border); border-left: 3px solid var(--border); transition: all 0.2s ease; box-shadow: 0 2px 10px rgba(0,0,0,0.01);">
                      <div style="display:flex;align-items:center;gap:16px; margin-bottom: 16px;">
                        <div class="topic-drag-handle" style="cursor: grab; color: var(--text-muted); opacity: 0.4; padding: 4px; border-radius: 6px; transition: all 0.2s;" onmouseover="this.style.background='var(--border)'; this.style.opacity='1'" onmouseout="this.style.background='transparent'; this.style.opacity='0.4'">
                          ${icon('dragHandle', 20)}
                        </div>
                        <div style="width: 32px; height: 32px; background: var(--brand-green-soft); border: 1px solid rgba(16,185,129,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: var(--brand-green); box-shadow: 0 2px 6px rgba(16,185,129,0.1);">
                          ${index + 1}
                        </div>
                        <h4 style="font-size:16px; font-weight:800; color:var(--text-primary); margin:0; flex:1; letter-spacing: -0.3px; display: flex; align-items: center; gap: 8px;">
                          <span>${escHtml(topic.name)}</span>
                          ${topicMaterials.length > 0 ? `
                            <span style="font-size: 11px; font-weight: 700; color: var(--brand-green); background: var(--brand-green-soft); padding: 2px 8px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.15); white-space: nowrap;">
                              ${topicMaterials.length} Kaynak
                            </span>
                          ` : ''}
                        </h4>
                        <div style="display:flex; gap:8px;">
                          <button class="btn btn-ghost btn-sm btn-icon hover-scale" data-edit-topic="${topic.id}" data-unit-id="${unit.id}" data-subject="${subject}" data-grade="${grade}" title="Düzenle" style="background: var(--bg-secondary); border-radius: 8px;">${icon('edit', 14)}</button>
                          <button class="btn btn-ghost btn-sm btn-icon hover-scale" data-delete-topic="${topic.id}" data-unit-id="${unit.id}" data-subject="${subject}" data-grade="${grade}" style="color:var(--danger); background: var(--bg-secondary); border-radius: 8px;" title="Sil">${icon('trash', 14)}</button>
                        </div>
                      </div>
                      
                      <div style="display:flex; flex-wrap: wrap; gap:12px; padding-left: 64px;">
                        ${topicMaterials.map(m => {
                          const isYoutube = isYoutubeUrl(m.link);
                          const isDrive = isGoogleDriveUrl(m.link);
                          const videoId = getYoutubeVideoId(m.link);
                          const drivePreview = isDrive ? getGoogleDrivePreviewUrl(m.link) : null;
                          
                          let clickAttrs = 'target="_blank"';
                          if (isYoutube) clickAttrs = `data-video-id="${videoId}" data-video-title="${escHtml(m.title)}"`;
                          else if (isDrive && drivePreview) clickAttrs = `data-preview-url="${escHtml(drivePreview)}" data-preview-title="${escHtml(m.title)}"`;

                          const style = CHIP_STYLES[m.contentType] || defaultStyle;
                          const chipIcon = isYoutube ? '🎬' : (isDrive ? '📁' : style.icon);
                          const chipStyle = isYoutube ? CHIP_STYLES.video : (isDrive ? { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.25)', text: '#10b981' } : style);

                          return `
                          <div class="material-chip hover-scale" style="display:flex; align-items:center; gap: 8px; padding: 6px 14px; background: ${chipStyle.bg}; border: 1px solid ${chipStyle.border}; border-radius: 24px; font-size:13px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); cursor: pointer; transition: all 0.2s;">
                            <span style="font-size:16px; color: ${chipStyle.text}; display: flex; align-items: center;">${chipIcon}</span>
                            <a href="${escHtml(m.link)}" ${clickAttrs} class="${isYoutube ? 'youtube-link' : (isDrive ? 'drive-link' : '')}" style="color: ${chipStyle.text}; text-decoration:none; font-weight:700;">
                              ${escHtml(m.title)}
                            </a>
                            <button class="btn btn-ghost btn-sm btn-icon" data-delete-material="${m.id}" style="width:20px; height:20px; color: ${chipStyle.text}; opacity:0.5; transition: opacity 0.2s; background: rgba(255,255,255,0.4); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: none; padding: 0;" onmouseover="this.style.opacity='1'; this.style.background='white';" onmouseout="this.style.opacity='0.5'; this.style.background='rgba(255,255,255,0.4)';" title="Sil">${icon('x', 10)}</button>
                          </div>
                          `;
                        }).join('')}
                        <button class="btn btn-ghost btn-sm hover-scale" data-add-material-to-topic="${topic.id}" data-unit-id="${unit.id}" data-subject="${subject}" data-grade="${grade}" style="padding: 8px 16px; font-size: 13px; font-weight: 700; color: var(--brand-green); border: 1.5px dashed rgba(16,185,129,0.4); border-radius: 24px; background: var(--brand-green-soft);">
                          ${icon('plus', 14)} İçerik Ekle
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Unit Level Materials -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--border);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                  <h4 style="font-size:14px; font-weight:800; color:var(--brand-green); text-transform: uppercase; letter-spacing: 0.5px; display:flex; align-items:center; gap: 8px;">
                    <span style="display:flex; align-items:center; justify-content:center; width: 28px; height: 28px; background: var(--brand-green-soft); border-radius: 8px;">${icon('book', 16)}</span>
                    Ünite Testleri ve Genel Kaynaklar
                  </h4>
                  <button class="btn btn-secondary btn-sm hover-scale" data-add-unit-material="${unit.id}" data-subject="${subject}" data-grade="${grade}" style="background: white; border: 1px solid var(--border); font-weight: 700; border-radius: 8px;">
                    ${icon('plus', 14)} Ekle
                  </button>
                </div>
                <div style="display:flex; flex-wrap: wrap; gap:12px;">
                  ${unitMaterials.map(m => {
                    const isYoutube = isYoutubeUrl(m.link);
                    const isDrive = isGoogleDriveUrl(m.link);
                    const videoId = getYoutubeVideoId(m.link);
                    const drivePreview = isDrive ? getGoogleDrivePreviewUrl(m.link) : null;

                    let clickAttrs = 'target="_blank"';
                    if (isYoutube) clickAttrs = `data-video-id="${videoId}" data-video-title="${escHtml(m.title)}"`;
                    else if (isDrive && drivePreview) clickAttrs = `data-preview-url="${escHtml(drivePreview)}" data-preview-title="${escHtml(m.title)}"`;

                    const style = CHIP_STYLES[m.contentType] || defaultStyle;
                    const unitIcon = isYoutube ? '🎬' : (isDrive ? '📁' : '📋');
                    const unitStyle = isYoutube ? CHIP_STYLES.video : (isDrive ? { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.25)', text: '#10b981' } : style);

                    return `
                    <div class="material-chip premium hover-scale" style="display:flex; align-items:center; gap: 12px; padding: 10px 18px; background: ${unitStyle.bg}; border: 1px solid ${unitStyle.border}; border-radius: 12px; font-size:14px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); cursor: pointer; transition: all 0.2s;">
                      <div style="width: 32px; height: 32px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); font-size: 16px; border: 1px solid ${unitStyle.border};">
                        ${unitIcon}
                      </div>
                      <a href="${escHtml(m.link)}" ${clickAttrs} class="${isYoutube ? 'youtube-link' : (isDrive ? 'drive-link' : '')}" style="color: ${unitStyle.text}; font-weight: 800; text-decoration:none; font-size: 14px; flex: 1;">
                        ${escHtml(m.title)}
                      </a>
                      <button class="btn btn-ghost btn-sm btn-icon" data-delete-material="${m.id}" style="color: var(--danger); opacity:0.6; transition: opacity 0.2s; background: white; border-radius: 8px; width: 28px; height: 28px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center;" onmouseover="this.style.opacity='1'; this.style.borderColor='rgba(239, 68, 68, 0.3)';" onmouseout="this.style.opacity='0.6'; this.style.borderColor='var(--border)';" title="Sil">${icon('trash', 14)}</button>
                    </div>
                    `;
                  }).join('')}
                  ${unitMaterials.length === 0 ? `<div style="font-size:14px; color:var(--text-muted); font-style:italic; padding: 12px 0; font-weight: 500;">Bu ünite için genel bir kaynak eklenmemiş.</div>` : ''}
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
      
      html += `
        <div style="text-align:center; padding: 24px 0;">
          <button class="btn btn-secondary hover-lift" data-add-unit="${subject}" data-grade="${grade}" style="padding: 12px 24px; font-size: 15px; font-weight: 700; border-radius: 12px; background: white; border: 1px dashed var(--brand-green); color: var(--brand-green);">${icon('plus', 16)} Yeni Ünite Ekle</button>
        </div>
      `;
    }
  });

  return html;
}

function initCurriculum(el, navigate) {
  const refresh = () => {
    const currentState = getState();
    const activeGrades = currentState.profile.grades || [];
    const availableGrades = ALL_GRADES.filter(g => activeGrades.includes(g));
    
    if (!window._activeGrade || !availableGrades.includes(window._activeGrade)) {
      window._activeGrade = availableGrades[0];
    }

    const tabsContainer = el.querySelector('#grade-tabs');
    if (tabsContainer) {
      tabsContainer.innerHTML = availableGrades.map(g => renderGradeTabButton(g, window._activeGrade)).join('');
      
      tabsContainer.querySelectorAll('.tab-btn-modern').forEach(tab => {
        tab.addEventListener('click', () => {
          window._activeGrade = tab.dataset.grade;
          refresh();
        });
      });
    }

    const content = el.querySelector('#curriculum-content');
    if (content) {
      content.innerHTML = renderCurriculumContent(currentState, window._activeGrade);
      initMaterialButtons(el, navigate);
      initCurriculumButtons(el, refresh, navigate);

      // Bind Search Filter
      const searchInput = el.querySelector('#curriculum-search');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase().trim();
          const normalizedQuery = query
            .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
            .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c');

          const accordions = el.querySelectorAll('.unit-accordion');
          accordions.forEach(acc => {
            const unitHeader = acc.querySelector('.unit-header h3 span');
            const unitTitle = unitHeader ? unitHeader.textContent.toLowerCase() : '';
            const normalizedUnitTitle = unitTitle
              .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
              .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c');
            
            const topics = acc.querySelectorAll('.topic-item');
            let unitHasMatch = normalizedUnitTitle.includes(normalizedQuery);
            let visibleTopicsCount = 0;

            topics.forEach(topic => {
              const topicHeader = topic.querySelector('h4 span');
              const topicTitle = topicHeader ? topicHeader.textContent.toLowerCase() : '';
              const normalizedTopicTitle = topicTitle
                .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
                .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c');
              
              const topicHasMatch = normalizedTopicTitle.includes(normalizedQuery);
              if (topicHasMatch || normalizedUnitTitle.includes(normalizedQuery)) {
                topic.style.display = 'block';
                visibleTopicsCount++;
              } else {
                topic.style.display = 'none';
              }
            });

            if (unitHasMatch || visibleTopicsCount > 0) {
              acc.style.display = 'block';
              if (visibleTopicsCount > 0 && query !== '') {
                acc.classList.add('active');
                acc.style.borderColor = 'rgba(16,185,129,0.3)';
                acc.style.boxShadow = '0 12px 30px rgba(16,185,129,0.06)';
                const contentDiv = acc.querySelector('.unit-content');
                if (contentDiv) contentDiv.style.display = 'block';
                const iconEl = acc.querySelector('.unit-icon');
                if (iconEl) iconEl.style.transform = 'rotate(90deg)';
              } else if (query === '') {
                const unitId = acc.dataset.unitId;
                const isExpanded = window._expandedUnits[unitId] !== false;
                if (isExpanded) {
                  acc.classList.add('active');
                  acc.style.borderColor = 'rgba(16,185,129,0.3)';
                  acc.style.boxShadow = '0 12px 30px rgba(16,185,129,0.06)';
                  const contentDiv = acc.querySelector('.unit-content');
                  if (contentDiv) contentDiv.style.display = 'block';
                  const iconEl = acc.querySelector('.unit-icon');
                  if (iconEl) iconEl.style.transform = 'rotate(90deg)';
                } else {
                  acc.classList.remove('active');
                  acc.style.borderColor = 'var(--border)';
                  acc.style.boxShadow = 'var(--shadow-sm)';
                  const contentDiv = acc.querySelector('.unit-content');
                  if (contentDiv) contentDiv.style.display = 'none';
                  const iconEl = acc.querySelector('.unit-icon');
                  if (iconEl) iconEl.style.transform = 'rotate(0deg)';
                }
              }
            } else {
              acc.style.display = 'none';
            }
          });
        });
      }
    }
  };

  // Global Add Material
  el.querySelector('#btn-add-material')?.addEventListener('click', () => {
    const currentState = getState();
    const activeSubjectIds = getSubjectsForBranches(currentState.profile.branches || []);
    openAddMaterialModal(activeSubjectIds[0], window._activeGrade, null, null, navigate, () => refresh());
  });

  el.querySelector('#btn-export-curr')?.addEventListener('click', () => {
    const state = getState();
    const data = JSON.stringify({ 
      curriculum: state.curriculum, 
      materials: state.materials 
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitig-mufredat-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  el.querySelector('#btn-import-curr')?.addEventListener('click', () => {
    el.querySelector('#import-curr-file').click();
  });

  el.querySelector('#import-curr-file')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const { importCurriculum } = await import('../store/store.js');
        await importCurriculum(data);
        alert('Müfredat başarıyla içe aktarıldı.');
        refresh();
      } catch (err) {
        console.error(err);
        alert('Geçersiz dosya. Yalnızca geçerli müfredat yedeği kabul edilir.');
      }
    };
    reader.readAsText(file);
  });

  refresh();
}

function initMaterialButtons(el, navigate) {
  el.querySelectorAll('[data-delete-material]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openCurriculumConfirmModal('İçeriği Sil', 'Bu metaryali silmek istediğinize emin misiniz?', () => {
        deleteMaterial(btn.dataset.deleteMaterial);
        // Force app re-render to reflect changes immediately
        navigate('curriculum', true); 
      });
    });
  });

  el.querySelectorAll('.youtube-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const videoId = link.dataset.videoId;
      const title = link.dataset.videoTitle;
      if (videoId) {
        openVideoModal(videoId, title);
      }
    });
  });

  el.querySelectorAll('.drive-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const previewUrl = link.dataset.previewUrl;
      const title = link.dataset.previewTitle;
      if (previewUrl) {
        openDrivePreviewModal(previewUrl, title);
      }
    });
  });
}

function openVideoModal(videoId, title) {
  const body = `
    <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:12px; background:#000; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <iframe 
        style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" 
        src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
        title="${escHtml(title)}" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    </div>
  `;

  openModal({
    title: title || 'Video İzle',
    size: 'lg',
    body,
    footer: `<button class="btn btn-secondary" id="btn-close-video">Kapat</button>`
  });

  document.getElementById('btn-close-video')?.addEventListener('click', closeModal);
}

function openDrivePreviewModal(previewUrl, title) {
  const body = `
    <div style="height: 70vh; border-radius: 12px; overflow: hidden; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
      <iframe 
        src="${previewUrl}" 
        style="width: 100%; height: 100%; border: none;" 
        allow="autoplay"
        loading="lazy">
      </iframe>
    </div>
  `;

  openModal({
    title: title || 'Dosya Önizleme',
    size: 'xl',
    body,
    footer: `<button class="btn btn-secondary" id="btn-close-drive">Kapat</button>`
  });

  document.getElementById('btn-close-drive')?.addEventListener('click', closeModal);
}

// targetUnitId allows us to open the modal specifically for a unit test (without topic)
function openAddMaterialModal(defSubject, defGrade, targetUnitId, targetTopicId, navigate, onSave) {
  const isUnitMode = targetUnitId && targetTopicId === null; // Force unit level

  const body = `
    <div class="form-group row-group" style="display:flex; gap:16px;">
      <div style="flex:1;">
        <label>Sınıf</label>
        <select id="mat-grade"></select>
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

  function updateGrades() {
    const activeGrades = getState().profile.grades || [];
    const validGrades = ALL_GRADES.filter(g => activeGrades.includes(g));
    gradeSel.innerHTML = validGrades.map(g => `<option value="${g}" ${g === defGrade ? 'selected' : ''}>${g}</option>`).join('');
    updateSubjects();
  }

  /**
   * CRITICAL: DO NOT CHANGE THIS FILTERING LOGIC.
   * This mapping (Grade -> Subject) is specifically requested and approved by the user 
   * for the MEB Maarif Modeli curriculum standards. 
   * Rule: 5-7 (Sosyal), 8 (İnkılap), 9-11 (Tarih), 12 (İnkılap/Tarih/TYT/AYT), Mezun (TYT/AYT), Diğer (Osmanlıca).
   */
  function updateSubjects() {
    const gr = gradeSel.value;
    const branches = getState().profile.branches || [];
    const teacherSubjects = getSubjectsForBranches(branches);
    
    // Filter teacher's subjects based on SUBJECT_GRADES for the current grade
    const activeSubjects = teacherSubjects.filter(s => {
      const validGrades = SUBJECT_GRADES[s] || [];
      return validGrades.includes(gr);
    });

    subjSel.innerHTML = activeSubjects.map(s => {
      let sinfo = SUBJECTS.find(x => x.id === s);
      if (!sinfo) {
        sinfo = { name: s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), icon: '📚' };
      }
      return `<option value="${s}" ${s === defSubject ? 'selected' : ''}>${sinfo?.icon || ''} ${sinfo?.name || s}</option>`;
    }).join('');

    if (activeSubjects.length === 0) {
      subjSel.innerHTML = '<option value="">(Bu Sınıf İçin Ders Bulunamadı)</option>';
    }
    
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
  updateGrades();

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
  // Unit Toggle (Accordion)
  el.querySelectorAll('[data-toggle-unit]').forEach(header => {
    header.addEventListener('click', () => {
      const uId = header.dataset.toggleUnit;
      window._expandedUnits = window._expandedUnits || {};
      window._expandedUnits[uId] = !window._expandedUnits[uId];
      // Note: default was true if not set, so !undefined becomes true? 
      // Actually window._expandedUnits[uId] !== false means default is true.
      // Let's refine the toggle logic:
      if (window._expandedUnits[uId] === undefined) {
        window._expandedUnits[uId] = false; // Toggle to closed if it was open (default)
      } else {
        window._expandedUnits[uId] = !window._expandedUnits[uId];
      }
      refresh();
    });
  });

  // Add Unit
  el.querySelectorAll('[data-add-unit]').forEach(btn => {
    btn.addEventListener('click', () => {
      openCurriculumPromptModal('Yeni Ünite Ekle', 'Ünite Adı', '', (name) => {
        const uId = addUnit(btn.dataset.addUnit, btn.dataset.grade, name);
        window._expandedUnits = window._expandedUnits || {};
        window._expandedUnits[uId] = true;
        refresh();
      });
    });
  });

  // Edit Unit
  el.querySelectorAll('[data-edit-unit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const subject = btn.dataset.subject;
      const grade = btn.dataset.grade;
      const unitId = btn.dataset.editUnit;
      const units = getState().curriculum[subject]?.[grade] || [];
      const unit = units.find(u => u.id === unitId);
      if (!unit) return;
      openCurriculumPromptModal('Üniteyi Düzenle', 'Ünite Adı', unit.name || '', (name) => {
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
      const unitId = btn.dataset.deleteUnit;
      openCurriculumConfirmModal('Üniteyi Sil', 'Bu üniteyi ve içindeki tüm konuları silmek istediğinize emin misiniz?', () => {
        deleteUnit(subject, grade, unitId);
        if (window._expandedUnits) delete window._expandedUnits[unitId];
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
      const units = getState().curriculum[subject]?.[grade] || [];
      const unit = units.find(u => u.id === unitId);
      const topic = unit?.topics.find(t => t.id === topicId);
      if (!topic) return;
      openCurriculumPromptModal('Konuyu Düzenle', 'Konu Adı', topic.name || '', (name) => {
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

  // Add Topic Material
  el.querySelectorAll('[data-add-material-to-topic]').forEach(btn => {
    btn.addEventListener('click', () => {
      const subject = btn.dataset.subject;
      const grade = btn.dataset.grade;
      const unitId = btn.dataset.unitId;
      const topicId = btn.dataset.addMaterialToTopic;
      openAddMaterialModal(subject, grade, unitId, topicId, navigate, () => refresh());
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

  initTopicDragAndDrop(el, refresh);
}

function initTopicDragAndDrop(el, refresh) {
  let draggedItem = null;
  let oldIndex = null;
  let unitId = null;
  let subject = null;
  let grade = null;

  el.querySelectorAll('.topic-item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedItem = item;
      oldIndex = parseInt(item.dataset.index);
      unitId = item.dataset.unitId;
      subject = item.dataset.subject;
      grade = item.dataset.grade;
      
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      // To allow dragging even if the handle is the target
      e.dataTransfer.setData('text/plain', item.dataset.topicId);
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      el.querySelectorAll('.topic-item').forEach(i => i.classList.remove('topic-drop-target'));
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (item === draggedItem) return;
      
      // Ensure we are in the same unit
      if (item.dataset.unitId !== unitId) return;

      e.dataTransfer.dropEffect = 'move';
      item.classList.add('topic-drop-target');
    });

    item.addEventListener('dragleave', () => {
      item.classList.remove('topic-drop-target');
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.classList.remove('topic-drop-target');

      if (item === draggedItem) return;
      if (item.dataset.unitId !== unitId) return;

      const newIndex = parseInt(item.dataset.index);
      
      if (oldIndex !== null && newIndex !== null) {
        reorderTopics(subject, grade, unitId, oldIndex, newIndex);
        refresh();
      }
    });
  });
}

