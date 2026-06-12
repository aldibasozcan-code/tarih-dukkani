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
      <!-- Premium Header -->
      <div class="page-header" style="background: linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(99,102,241,0.02) 100%); padding: 32px 24px; border-radius: 20px; margin-bottom: 28px; border: 1px solid rgba(16,185,129,0.15); box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
        <div>
          <h2 style="font-size: 32px; font-weight: 800; color: var(--brand-green); margin-bottom: 8px; display: flex; align-items: center; gap: 12px; letter-spacing: -0.5px;">
            ${icon('book', 32)} Müfredat Yönetimi
          </h2>
          <p style="color: var(--text-secondary); font-size: 16px; font-weight: 500;">Sınıflara göre ünite ve konu içeriklerini profesyonelce yönetin</p>
        </div>
        <div style="display:flex; gap:10px; align-items: center; flex-wrap:wrap;">
          <button class="btn btn-secondary hover-lift" id="btn-export-curr" style="background: white; border: 1px solid var(--border); box-shadow: var(--shadow-sm); padding: 9px 16px; font-weight: 700; border-radius:10px; font-size:13px;">${icon('download', 14)} Dışa Aktar</button>
          <button class="btn btn-secondary hover-lift" id="btn-import-curr" style="background: white; border: 1px solid var(--border); box-shadow: var(--shadow-sm); padding: 9px 16px; font-weight: 700; border-radius:10px; font-size:13px;">${icon('upload', 14)} İçe Aktar</button>
          <input type="file" id="import-curr-file" accept=".json" style="display:none;">
          <button class="btn btn-primary hover-lift" id="btn-add-material" style="box-shadow: 0 8px 20px rgba(16,185,129,0.3); padding: 10px 20px; font-weight: 700; font-size: 14px; border-radius:12px;">${icon('plus', 16)} İçerik Ekle</button>
        </div>
      </div>

      <!-- Grade Tabs -->
      <div class="tabs-modern" id="grade-tabs" style="margin-bottom: 28px; overflow-x: auto; display: flex; gap: 6px; padding: 6px; background: var(--bg-secondary); border-radius: 16px; border: 1px solid var(--border); max-width: 100%;">
        ${availableGrades.map(g => renderGradeTabButton(g, activeGrade)).join('')}
      </div>

      <!-- Curriculum Content -->
      <div id="curriculum-content" style="background: linear-gradient(180deg, #f9fffe 0%, #ffffff 100%); padding: 32px; border-radius: 20px; border: 1px solid rgba(16,185,129,0.1); box-shadow: 0 4px 24px rgba(0,0,0,0.03);">
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
        <div style="padding:32px 24px; border: 2px dashed rgba(16,185,129,0.25); margin-bottom: 20px; border-radius: 16px; background: rgba(16,185,129,0.02); text-align:center;">
          <div style="font-size:40px; margin-bottom:12px;">📂</div>
          <p style="color:var(--text-secondary); font-size:15px; font-weight:600; margin-bottom: 16px;">Henüz ünite eklenmemiş.</p>
          <button class="btn btn-primary hover-lift" data-add-unit="${subject}" data-grade="${grade}" style="border-radius:10px; padding:10px 24px; font-weight:700;">${icon('plus', 14)} İlk Üniteyi Ekle</button>
        </div>
      `;
    } else {
      window._expandedUnits = window._expandedUnits || {};
      
      html += units.map((unit, uIndex) => {
        const isExpanded = window._expandedUnits[unit.id] !== false;
        const unitMaterials = allMaterials.filter(m => m.unitId === unit.id && !m.topicId);
        const totalResources = unitMaterials.length + unit.topics.reduce((acc, t) => acc + allMaterials.filter(m => m.unitId === unit.id && m.topicId === t.id).length, 0);
        const topicsWithMaterials = unit.topics.filter(t => allMaterials.some(m => m.topicId === t.id)).length;
        const completionPct = unit.topics.length > 0 ? Math.round(topicsWithMaterials / unit.topics.length * 100) : 0;
        
        return `
          <div class="unit-accordion ${isExpanded ? 'active' : ''}" data-unit-id="${unit.id}" style="margin-bottom: 20px; border: 1px solid ${isExpanded ? 'rgba(16,185,129,0.25)' : 'var(--border)'}; border-radius: 18px; overflow: hidden; background: #fff; box-shadow: ${isExpanded ? '0 8px 28px rgba(16,185,129,0.07)' : '0 2px 8px rgba(0,0,0,0.03)'}; transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);">
            <!-- Unit Header -->
            <div class="unit-header" data-toggle-unit="${unit.id}" style="padding: 18px 22px; background: ${isExpanded ? 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(255,255,255,1) 100%)' : '#ffffff'}; cursor: pointer; display: flex; align-items: center; gap: 14px; border-left: 4px solid ${isExpanded ? 'var(--brand-green)' : 'transparent'}; transition: all 0.3s ease;">
              <!-- Unit Number Badge -->
              <div style="width:40px; height:40px; border-radius:12px; background:${isExpanded ? 'var(--brand-green)' : 'var(--bg-secondary)'}; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:900; color:${isExpanded ? '#fff' : 'var(--text-secondary)'}; flex-shrink:0; transition:all 0.3s; box-shadow:${isExpanded ? '0 4px 12px rgba(16,185,129,0.3)' : 'none'};">
                ${uIndex + 1}
              </div>
              <!-- Toggle Icon -->
              <div style="color: ${isExpanded ? 'var(--brand-green)' : 'var(--text-muted)'}; transform: rotate(${isExpanded ? '90deg' : '0deg'}); transition: transform 0.3s; display: flex; align-items: center; flex-shrink:0;">
                ${icon('chevronRight', 18)}
              </div>
              <div style="flex:1; min-width:0;">
                <h3 style="font-size: 17px; font-weight: 800; color: ${isExpanded ? 'var(--brand-green)' : 'var(--text-primary)'}; margin: 0 0 6px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${escHtml(unit.name)}
                </h3>
                <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
                  <span style="border-radius:20px; font-size:10px; padding:3px 9px; font-weight:700; background:${isExpanded ? 'rgba(16,185,129,0.1)' : 'var(--bg-secondary)'}; color:${isExpanded ? 'var(--brand-green)' : 'var(--text-secondary)'}; border:1px solid ${isExpanded ? 'rgba(16,185,129,0.2)' : 'var(--border)'}; display:flex; align-items:center; gap:3px;">
                    ${icon('book', 10)} ${unit.topics.length} Konu
                  </span>
                  <span style="border-radius:20px; font-size:10px; padding:3px 9px; font-weight:700; background:var(--bg-secondary); color:var(--text-secondary); border:1px solid var(--border); display:flex; align-items:center; gap:3px;">
                    ${icon('fileText', 10)} ${totalResources} Kaynak
                  </span>
                  ${unit.topics.length > 0 ? `
                    <div style="display:flex; align-items:center; gap:5px;">
                      <div style="width:56px; height:5px; background:var(--border); border-radius:3px; overflow:hidden;">
                        <div style="width:${completionPct}%; height:100%; background:var(--brand-green); border-radius:3px; transition:width 0.4s;"></div>
                      </div>
                      <span style="font-size:10px; font-weight:700; color:var(--text-secondary);">${completionPct}%</span>
                    </div>
                  ` : ''}
                </div>
              </div>
              <div style="display:flex; gap:6px; flex-shrink:0;" onclick="event.stopPropagation()">
                <button class="btn btn-ghost btn-sm btn-icon hover-scale" data-edit-unit="${unit.id}" data-subject="${subject}" data-grade="${grade}" title="Üniteyi Düzenle" style="background: var(--bg-secondary); border: 1px solid var(--border); border-radius:8px; width:32px; height:32px;">${icon('edit', 14)}</button>
                <button class="btn btn-ghost btn-sm btn-icon hover-scale" data-delete-unit="${unit.id}" data-subject="${subject}" data-grade="${grade}" style="color:var(--danger); background:var(--bg-secondary); border:1px solid var(--border); border-radius:8px; width:32px; height:32px;" title="Üniteyi Sil">${icon('trash', 14)}</button>
                <button class="btn btn-primary btn-sm hover-scale" data-add-topic="${unit.id}" data-subject="${subject}" data-grade="${grade}" style="border-radius:8px; font-weight:700; font-size:12px; padding:6px 12px;">
                  ${icon('plus', 12)} Konu Ekle
                </button>
              </div>
            </div>

            <!-- Unit Content -->
            <div class="unit-content" style="display: ${isExpanded ? 'block' : 'none'}; padding: 20px 22px; border-top: 1px solid rgba(16,185,129,0.1); background: #fafffe;">
              <div class="topic-list" style="display:flex; flex-direction:column; gap: 12px;">
                ${unit.topics.length === 0 ? `
                  <div style="padding:24px; text-align:center; border:2px dashed rgba(16,185,129,0.2); border-radius:12px; background:rgba(16,185,129,0.02);">
                    <div style="font-size:28px; margin-bottom:8px;">📝</div>
                    <p style="font-size:13px; font-weight:600; color:var(--text-secondary); margin-bottom:12px;">Bu ünitede henüz konu bulunmuyor.</p>
                    <button class="btn btn-primary btn-sm" data-add-topic="${unit.id}" data-subject="${subject}" data-grade="${grade}" style="border-radius:8px; font-size:12px;">${icon('plus', 12)} Konu Ekle</button>
                  </div>
                ` : ''}
                ${unit.topics.map((topic, index) => {
                  const topicMaterials = allMaterials.filter(m => m.unitId === unit.id && m.topicId === topic.id);
                  const hasMaterials = topicMaterials.length > 0;
                  return `
                    <div class="topic-item" draggable="true" 
                         data-index="${index}" 
                         data-topic-id="${topic.id}" 
                         data-unit-id="${unit.id}" 
                         data-subject="${subject}" 
                         data-grade="${grade}"
                         style="background:#ffffff; border-radius:14px; padding:16px 20px; border:1px solid ${hasMaterials ? 'rgba(16,185,129,0.2)' : 'var(--border)'}; border-left: 4px solid ${hasMaterials ? 'var(--brand-green)' : 'var(--border)'}; transition:all 0.2s ease; box-shadow: 0 1px 4px rgba(0,0,0,0.03);">
                      <!-- Topic Header -->
                      <div style="display:flex; align-items:center; gap:12px; margin-bottom:${topicMaterials.length > 0 ? '14px' : '0'};">
                        <div class="topic-drag-handle" style="cursor:grab; color:var(--text-muted); opacity:0.35; flex-shrink:0; border-radius:6px; transition:all 0.2s; padding:2px;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='0.35'">
                          ${icon('dragHandle', 16)}
                        </div>
                        <!-- Number circle -->
                        <div style="width:28px; height:28px; flex-shrink:0; border-radius:8px; background:${hasMaterials ? 'var(--brand-green)' : 'var(--bg-secondary)'}; border:1px solid ${hasMaterials ? 'rgba(16,185,129,0.3)' : 'var(--border)'}; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; color:${hasMaterials ? '#fff' : 'var(--text-secondary)'}; transition:all 0.2s;">
                          ${index + 1}
                        </div>
                        <h4 style="font-size:15px; font-weight:800; color:var(--text-primary); margin:0; flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escHtml(topic.name)}</h4>
                        ${hasMaterials ? `<span style="background:rgba(16,185,129,0.1); color:var(--brand-green); border-radius:10px; padding:2px 8px; font-size:10px; font-weight:700; flex-shrink:0;">${topicMaterials.length} Kaynak</span>` : ''}
                        <div style="display:flex; gap:5px; flex-shrink:0;">
                          <button class="btn btn-ghost btn-sm btn-icon" data-edit-topic="${topic.id}" data-unit-id="${unit.id}" data-subject="${subject}" data-grade="${grade}" title="Düzenle" style="background:var(--bg-secondary); border-radius:7px; width:28px; height:28px; display:flex; align-items:center; justify-content:center;">${icon('edit', 12)}</button>
                          <button class="btn btn-ghost btn-sm btn-icon" data-delete-topic="${topic.id}" data-unit-id="${unit.id}" data-subject="${subject}" data-grade="${grade}" style="color:var(--danger); background:var(--bg-secondary); border-radius:7px; width:28px; height:28px; display:flex; align-items:center; justify-content:center;" title="Sil">${icon('trash', 12)}</button>
                        </div>
                      </div>
                      
                      <!-- Material chips -->
                      ${topicMaterials.length > 0 || true ? `
                      <div style="display:flex; flex-wrap:wrap; gap:8px; padding-left:${topicMaterials.length > 0 ? '52px' : '52px'};">
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
                          const chipStyle = isYoutube ? CHIP_STYLES.video : (isDrive ? { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', text: '#10b981' } : style);

                          return `
                          <div class="material-chip hover-scale" style="display:inline-flex; align-items:center; gap:7px; padding:5px 12px 5px 7px; background:${chipStyle.bg}; border:1px solid ${chipStyle.border}; border-radius:20px; font-size:12px; cursor:pointer; transition:all 0.15s; max-width:240px;">
                            <div style="width:22px; height:22px; border-radius:6px; background:rgba(255,255,255,0.7); display:flex; align-items:center; justify-content:center; font-size:12px; flex-shrink:0;">${chipIcon}</div>
                            <a href="${escHtml(m.link)}" ${clickAttrs} class="${isYoutube ? 'youtube-link' : (isDrive ? 'drive-link' : '')}" style="color:${chipStyle.text}; text-decoration:none; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escHtml(m.title)}</a>
                            <button class="btn btn-ghost btn-sm btn-icon" data-delete-material="${m.id}" style="width:16px; height:16px; color:${chipStyle.text}; opacity:0.4; transition:opacity 0.2s; background:rgba(255,255,255,0.5); border-radius:50%; display:flex; align-items:center; justify-content:center; border:none; padding:0; flex-shrink:0;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.4'" title="Sil">${icon('x', 9)}</button>
                          </div>
                          `;
                        }).join('')}
                        <button class="btn btn-ghost btn-sm" data-add-material-to-topic="${topic.id}" data-unit-id="${unit.id}" data-subject="${subject}" data-grade="${grade}" style="padding:5px 12px; font-size:11px; font-weight:700; color:var(--brand-green); border:1.5px dashed rgba(16,185,129,0.35); border-radius:20px; background:rgba(16,185,129,0.04); display:inline-flex; align-items:center; gap:4px;">
                          ${icon('plus', 11)} Kaynak Ekle
                        </button>
                      </div>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Unit Level Materials -->
              <div style="margin-top:24px; padding-top:20px; border-top:1px solid rgba(16,185,129,0.1);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                  <h4 style="font-size:12px; font-weight:800; color:var(--brand-green); text-transform:uppercase; letter-spacing:0.8px; display:flex; align-items:center; gap:7px;">
                    <span style="display:flex; align-items:center; justify-content:center; width:24px; height:24px; background:var(--brand-green-soft); border-radius:7px;">${icon('book', 13)}</span>
                    Ünite Testleri & Genel Kaynaklar
                  </h4>
                  <button class="btn btn-secondary btn-sm" data-add-unit-material="${unit.id}" data-subject="${subject}" data-grade="${grade}" style="background:white; border:1px solid var(--border); font-weight:700; border-radius:8px; font-size:12px; padding:5px 12px;">
                    ${icon('plus', 12)} Ekle
                  </button>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:10px;">
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
                    const unitStyle = isYoutube ? CHIP_STYLES.video : (isDrive ? { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', text: '#10b981' } : style);

                    return `
                    <div class="material-chip premium hover-scale" style="display:flex; align-items:center; gap:10px; padding:8px 14px 8px 8px; background:${unitStyle.bg}; border:1px solid ${unitStyle.border}; border-radius:12px; font-size:13px; cursor:pointer; transition:all 0.15s;">
                      <div style="width:30px; height:30px; background:white; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:14px; border:1px solid ${unitStyle.border}; flex-shrink:0;">${unitIcon}</div>
                      <a href="${escHtml(m.link)}" ${clickAttrs} class="${isYoutube ? 'youtube-link' : (isDrive ? 'drive-link' : '')}" style="color:${unitStyle.text}; font-weight:700; text-decoration:none; font-size:13px;">${escHtml(m.title)}</a>
                      <button class="btn btn-ghost btn-sm btn-icon" data-delete-material="${m.id}" style="color:var(--danger); opacity:0.5; transition:opacity 0.2s; background:white; border-radius:7px; width:26px; height:26px; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; flex-shrink:0;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'" title="Sil">${icon('trash', 12)}</button>
                    </div>
                    `;
                  }).join('')}
                  ${unitMaterials.length === 0 ? `<div style="font-size:13px; color:var(--text-muted); font-style:italic; padding:10px 0; font-weight:500;">Bu ünite için genel bir kaynak eklenmemiş.</div>` : ''}
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
      
      html += `
        <div style="text-align:center; padding:20px 0;">
          <button class="btn hover-lift" data-add-unit="${subject}" data-grade="${grade}" style="padding:11px 28px; font-size:14px; font-weight:700; border-radius:12px; background:white; border:2px dashed rgba(16,185,129,0.4); color:var(--brand-green); display:inline-flex; align-items:center; gap:8px; transition:all 0.2s;">${icon('plus', 15)} Yeni Ünite Ekle</button>
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

  const contentTypeCards = CONTENT_TYPES.map((ct, i) => `
    <div class="mat-type-card ${i === 0 && !isUnitMode ? 'active' : (isUnitMode && ct.id === 'deneme' ? 'active' : '')}" 
         data-type-id="${ct.id}"
         style="display:flex; flex-direction:column; align-items:center; gap:6px; padding:12px 8px; border:2px solid var(--border); border-radius:12px; background:white; cursor:pointer; transition:all 0.2s; text-align:center; min-width:0;">
      <div style="font-size:22px; line-height:1;">${ct.icon}</div>
      <div style="font-size:11px; font-weight:700; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%;">${ct.label}</div>
    </div>
  `).join('');

  const body = `
    <style>
      .mat-type-card:hover { border-color: #7c6aff !important; background: rgba(124,106,255,0.05) !important; }
      .mat-type-card.active { border-color: #7c6aff !important; background: rgba(124,106,255,0.1) !important; }
      .mat-type-card.active div:last-child { color: #7c6aff !important; }
      .mat-section { margin-bottom: 20px; background: #fafafa; border: 1px solid #f0f0f0; border-radius: 14px; overflow: hidden; }
      .mat-section-hdr { display:flex; align-items:center; gap:8px; padding:12px 16px; background:white; border-bottom:1px solid #f0f0f0; }
      .mat-section-icon { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
      .mat-section-title { font-size:11px; font-weight:800; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px; }
      .mat-section-body { padding:16px; }
      .mat-field { display:flex; flex-direction:column; gap:5px; }
      .mat-label { font-size:11px; font-weight:700; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.4px; display:flex; align-items:center; gap:4px; }
      .mat-select, .mat-input { width:100%; padding:9px 12px; border:1.5px solid var(--border); border-radius:9px; font-size:13px; font-weight:600; color:var(--text-primary); background:white; transition:all 0.2s; outline:none; font-family:inherit; -webkit-appearance:none; box-sizing:border-box; }
      .mat-select:focus, .mat-input:focus { border-color:#7c6aff; box-shadow:0 0 0 3px rgba(124,106,255,0.1); }
      .mat-select { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 10px center; background-size:14px; padding-right:34px; cursor:pointer; }
      .mat-link-preview { display:none; margin-top:10px; padding:10px 12px; background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.2); border-radius:10px; }
      .mat-error-box { display:none; padding:10px 12px; background:rgba(239,68,68,0.06); border:1.5px solid rgba(239,68,68,0.2); border-radius:9px; color:var(--danger); font-size:13px; font-weight:600; margin-bottom:16px; }
      .mat-footer { display:flex; gap:10px; justify-content:flex-end; margin-top:8px; }
      .mat-btn-cancel { padding:10px 20px; border-radius:9px; border:1.5px solid var(--border); background:white; color:var(--text-secondary); font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:inherit; }
      .mat-btn-cancel:hover { background:#f5f5f5; }
      .mat-btn-save { padding:10px 24px; border-radius:9px; border:none; background:linear-gradient(135deg,#004526,#047857); color:white; font-size:13px; font-weight:800; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; gap:7px; box-shadow:0 4px 12px rgba(16,185,129,0.3); font-family:inherit; }
      .mat-btn-save:hover { transform:translateY(-1px); box-shadow:0 6px 16px rgba(16,185,129,0.4); }
      .mat-btn-save:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
    </style>

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#3730a3 0%,#6d28d9 50%,#7c3aed 100%); padding:24px 28px 20px; margin:-32px -32px 24px; position:relative; overflow:hidden;">
      <div style="position:absolute;top:-30px;right:-30px;width:130px;height:130px;background:rgba(255,255,255,0.07);border-radius:50%;"></div>
      <div style="position:absolute;bottom:-20px;left:30px;width:80px;height:80px;background:rgba(255,255,255,0.05);border-radius:50%;"></div>
      <div style="position:relative;z-index:1;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
          <div style="width:36px;height:36px;background:rgba(255,255,255,0.15);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;">📚</div>
          <h2 style="font-size:20px;font-weight:800;color:#fff;margin:0;letter-spacing:-0.3px;">İçerik Ekle</h2>
        </div>
        <p style="font-size:13px;color:rgba(255,255,255,0.7);margin:0;font-weight:500;">Seçilen konuya bağlantı veya kaynak ekleyin</p>
      </div>
    </div>

    <!-- SECTION 1: Hedef -->
    <div class="mat-section">
      <div class="mat-section-hdr">
        <div class="mat-section-icon" style="background:rgba(124,106,255,0.1);color:#7c6aff;">${icon('book', 14)}</div>
        <span class="mat-section-title">Hedef Sınıf &amp; Ders</span>
      </div>
      <div class="mat-section-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="mat-field">
            <label class="mat-label">Sınıf</label>
            <select id="mat-grade" class="mat-select"></select>
          </div>
          <div class="mat-field">
            <label class="mat-label">Ders</label>
            <select id="mat-subject" class="mat-select"></select>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 2: Konum -->
    <div class="mat-section">
      <div class="mat-section-hdr">
        <div class="mat-section-icon" style="background:rgba(16,185,129,0.1);color:var(--brand-green);">${icon('chevronRight', 14)}</div>
        <span class="mat-section-title">Ünite &amp; Konu</span>
      </div>
      <div class="mat-section-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
          <div class="mat-field">
            <label class="mat-label">Ünite</label>
            <select id="mat-unit" class="mat-select"></select>
          </div>
          <div class="mat-field" id="topic-container" style="${isUnitMode ? 'display:none;' : ''}">
            <label class="mat-label">Konu</label>
            <select id="mat-topic" class="mat-select"></select>
          </div>
        </div>
        <div style="${isUnitMode ? 'display:none;' : ''}" id="mat-level-wrap">
          <div class="mat-field">
            <label class="mat-label">İçerik Seviyesi</label>
            <select id="mat-level" class="mat-select">
              <option value="topic" ${!isUnitMode ? 'selected' : ''}>📌 Konuya Özgü</option>
              <option value="unit" ${isUnitMode ? 'selected' : ''}>📂 Ünite Geneli (Test/Deneme)</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 3: İçerik Türü -->
    <div class="mat-section">
      <div class="mat-section-hdr">
        <div class="mat-section-icon" style="background:rgba(255,159,67,0.1);color:#ff9f43;">${icon('fileText', 14)}</div>
        <span class="mat-section-title">İçerik Türü</span>
      </div>
      <div class="mat-section-body">
        <input type="hidden" id="mat-type" value="${isUnitMode ? 'deneme' : 'ders_notu'}">
        <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;" id="mat-type-cards">
          ${contentTypeCards}
        </div>
      </div>
    </div>

    <!-- SECTION 4: İçerik Detayı -->
    <div class="mat-section">
      <div class="mat-section-hdr">
        <div class="mat-section-icon" style="background:rgba(16,185,129,0.1);color:var(--brand-green);">${icon('link', 14)}</div>
        <span class="mat-section-title">Başlık &amp; Link</span>
      </div>
      <div class="mat-section-body">
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div class="mat-field">
            <label class="mat-label">${icon('edit', 11)} Başlık</label>
            <input type="text" id="mat-title" class="mat-input" placeholder="Örn: 1. Ünite Konu Özeti, Tarama Testi…">
          </div>
          <div class="mat-field">
            <label class="mat-label">${icon('link', 11)} Google Drive veya YouTube Linki</label>
            <input type="url" id="mat-link" class="mat-input" placeholder="https://drive.google.com/... veya https://youtu.be/...">
            <div class="mat-link-preview" id="mat-link-preview">
              <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:var(--brand-green);">
                <span id="mat-link-icon" style="font-size:16px;"></span>
                <span id="mat-link-label"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mat-error-box" id="mat-error"></div>

    <div class="mat-footer">
      <button class="mat-btn-cancel" id="mat-cancel">İptal</button>
      <button class="mat-btn-save" id="mat-save">${icon('check', 14)} Kaydet</button>
    </div>
  `;

  openModal({
    title: '',
    size: '',
    body,
  });

  const gradeSel = document.getElementById('mat-grade');
  const subjSel = document.getElementById('mat-subject');
  const unitSel = document.getElementById('mat-unit');
  const topicSel = document.getElementById('mat-topic');
  const levelSel = document.getElementById('mat-level');
  const topicContainer = document.getElementById('topic-container');
  const matTypeHidden = document.getElementById('mat-type');

  // ─── CONTENT TYPE CARDS ───
  document.querySelectorAll('.mat-type-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.mat-type-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      matTypeHidden.value = card.dataset.typeId;
    });
  });

  // ─── LINK PREVIEW DETECTION ───
  const linkInput = document.getElementById('mat-link');
  const linkPreview = document.getElementById('mat-link-preview');
  const linkIcon = document.getElementById('mat-link-icon');
  const linkLabel = document.getElementById('mat-link-label');

  linkInput?.addEventListener('input', () => {
    const val = linkInput.value.trim();
    if (!val) { linkPreview.style.display = 'none'; return; }
    if (isYoutubeUrl(val)) {
      linkPreview.style.display = 'block';
      linkIcon.textContent = '🎬';
      linkLabel.textContent = 'YouTube videosu algılandı — uygulama içinde oynatılacak';
      // Auto-select 'video' type
      document.querySelectorAll('.mat-type-card').forEach(c => c.classList.remove('active'));
      const vidCard = document.querySelector('.mat-type-card[data-type-id="video"]');
      if (vidCard) { vidCard.classList.add('active'); matTypeHidden.value = 'video'; }
    } else if (isGoogleDriveUrl(val)) {
      linkPreview.style.display = 'block';
      linkIcon.textContent = '📁';
      linkLabel.textContent = 'Google Drive dosyası algılandı — uygulama içinde önizlenecek';
    } else if (val.startsWith('http')) {
      linkPreview.style.display = 'block';
      linkIcon.textContent = '🔗';
      linkLabel.textContent = 'Harici bağlantı — yeni sekmede açılacak';
    } else {
      linkPreview.style.display = 'none';
    }
  });

  // ─── LEVEL CHANGE ───
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
    const isUnitLvl = isUnitMode || (levelSel && levelSel.value === 'unit');
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
      contentType: matTypeHidden.value,
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

