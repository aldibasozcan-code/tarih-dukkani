// ═════════════════════════════════════════════════
// STUDENT DETAIL MODAL
// ═════════════════════════════════════════════════
import { getState } from '../../store/store.js';
import { icon } from '../../components/icons.js';
import { openModal, closeModal } from '../../components/modal.js';
import { escHtml, getAvatarColor, getInitials, formatCurrency } from '../../utils/helpers.js';
import { DEFAULT_CURRICULUM, GRADE_TO_SUBJECTS, CONTENT_TYPES } from '../../data/curriculum.js';

export function openStudentDetail(studentId, navigate) {
  const state = getState();
  const student = state.students.find(s => s.id === studentId);
  if (!student) return;

  const subjects = GRADE_TO_SUBJECTS[student.grade] || [];

  openModal({
    title: '',
    size: 'xl',
    body: buildDetailBody(student, subjects, state),
  });
}

function buildDetailBody(student, subjects, state) {
  const completedSet = new Set(student.completedTopics || []);

  // Calculate total lessons done (status === 'completed')
  const completedLessonsCount = state.lessons.filter(l => l.type === 'student' && l.refId === student.id && l.status === 'completed').length;

  // Calculate overall curriculum progress
  let totalTopics = 0;
  let totalCompletedTopics = 0;
  subjects.forEach(({ subject, grade }) => {
    const units = DEFAULT_CURRICULUM[subject]?.[grade] || [];
    units.forEach(u => {
      totalTopics += u.topics.length;
      totalCompletedTopics += u.topics.filter(t => completedSet.has(t.id)).length;
    });
  });

  const remainingTopics = totalTopics - totalCompletedTopics;
  const overallPct = totalTopics > 0 ? Math.round((totalCompletedTopics / totalTopics) * 100) : 0;

  return `
    <!-- Header -->
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
      <div style="width:60px;height:60px;border-radius:14px;background:${getAvatarColor(student.name)};display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#fff;flex-shrink:0;">
        ${getInitials(student.name)}
      </div>
      <div style="flex:1;">
        <h2 style="font-size:20px;font-weight:800;">${escHtml(student.name)}</h2>
        <div style="display:flex;gap:10px;margin-top:4px;flex-wrap:wrap;">
          <span class="badge badge-info">${student.grade}</span>
          <span class="badge badge-muted">${formatCurrency(student.rate)}/saat</span>
          ${student.meetLink ? `<a href="${escHtml(student.meetLink)}" target="_blank" class="badge badge-success" style="text-decoration:none;">🎥 Google Meet</a>` : ''}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;text-align:right;">
        ${student.phone ? `<a href="https://wa.me/${student.phone.replace(/[^0-9]/g, '')}" target="_blank" class="whatsapp-btn">${icon('whatsapp', 12)} ${escHtml(student.phone)}</a>` : ''}
        ${student.parentPhone ? `<a href="https://wa.me/${student.parentPhone.replace(/[^0-9]/g, '')}" target="_blank" class="whatsapp-btn" style="background:#128c7e;">${icon('whatsapp', 12)} Veli: ${escHtml(student.parentPhone)}</a>` : ''}
      </div>
    </div>

    <!-- Overall KPI Summary -->
    <div class="grid grid-3" style="margin-bottom:20px;">
      <div class="card card-sm" style="background:rgba(99,202,183,0.05);border-color:rgba(99,202,183,0.2);">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">Tamamlanan Ders</div>
        <div style="font-size:24px;font-weight:800;color:var(--success);">${completedLessonsCount}</div>
      </div>
      <div class="card card-sm" style="background:rgba(124,106,255,0.05);border-color:rgba(124,106,255,0.2);">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">Müfredat İlerlemesi</div>
        <div style="font-size:24px;font-weight:800;color:var(--accent2);">%${overallPct}</div>
        <div class="progress-bar" style="height:4px;margin-top:6px;">
          <div class="progress-fill" style="width:${overallPct}%;background:var(--accent2);"></div>
        </div>
      </div>
      <div class="card card-sm" style="background:rgba(255,159,67,0.05);border-color:rgba(255,159,67,0.2);">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">Kalan Konu</div>
        <div style="font-size:24px;font-weight:800;color:var(--warning);">${remainingTopics}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Toplam: ${totalTopics} konu</div>
      </div>
    </div>

    <!-- Subject Progress Details -->
    <div class="grid grid-2" style="margin-bottom:20px;">
      ${subjects.map(({ subject, grade }) => {
        const units = DEFAULT_CURRICULUM[subject]?.[grade] || [];
        const allTopics = units.flatMap(u => u.topics);
        const completed = allTopics.filter(t => completedSet.has(t.id)).length;
        const pct = allTopics.length > 0 ? Math.round((completed / allTopics.length) * 100) : 0;
        return `
          <div class="card card-sm">
            <div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--accent);">${grade}</div>
            <div class="progress-bar" style="margin-bottom:6px;">
              <div class="progress-fill" style="width:${pct}%;background:linear-gradient(90deg,var(--accent),var(--accent2));"></div>
            </div>
            <div style="font-size:11px;color:var(--text-muted);">${completed}/${allTopics.length} konu tamamlandı (${pct}%)</div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Curriculum Detail -->
    ${subjects.map(({ subject, grade }) => {
      const units = DEFAULT_CURRICULUM[subject]?.[grade] || [];
      const materials = Object.values(state.materials).filter(m => m.subject === subject && m.grade === grade);

      return `
        <h3 style="font-size:14px;font-weight:700;color:var(--accent);margin:16px 0 10px;">${grade} Müfredatı</h3>
        ${units.map(unit => `
          <div class="card card-sm" style="margin-bottom:10px;">
            <div style="font-weight:700;font-size:13px;margin-bottom:10px;color:var(--text-secondary);">${escHtml(unit.name)}</div>
            ${unit.topics.map(topic => {
              const done = completedSet.has(topic.id);
              const topicMaterials = materials.filter(m => m.unitId === unit.id && m.topicId === topic.id);
              return `
                <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                  <button class="btn-icon" style="width:24px;height:24px;border-radius:6px;background:${done ? 'var(--success)' : 'rgba(255,255,255,0.05)'};border:1px solid ${done ? 'var(--success)' : 'var(--border)'};cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;" 
                    data-toggle-topic="${topic.id}" data-student-id="${student.id}">
                    ${done ? icon('check', 12) : ''}
                  </button>
                  <span style="flex:1;font-size:13px;${done ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${escHtml(topic.name)}</span>
                  <div style="display:flex;gap:4px;">
                    ${topicMaterials.map(m => `
                      <a href="${escHtml(m.link)}" target="_blank" class="badge badge-info" style="text-decoration:none;font-size:10px;">
                        ${CONTENT_TYPES.find(ct => ct.id === m.contentType)?.icon || '📄'} ${m.title}
                      </a>
                    `).join('')}
                  </div>
                  ${topicMaterials.length > 0 ? `
                    <button class="whatsapp-btn" style="font-size:10px;padding:4px 8px;" data-homework-topic="${topic.id}" data-homework-material="${topicMaterials[0].link}">
                      ${icon('whatsapp', 11)} Ödev Gönder
                    </button>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `).join('')}
      `;
    }).join('')}

    <!-- Homework list -->
    ${student.homework?.length > 0 ? `
      <h3 style="font-size:14px;font-weight:700;margin:16px 0 10px;">Ödevler</h3>
      <div class="card card-sm">
        ${student.homework.map(hw => `
          <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
            <span style="font-size:13px;flex:1;">${escHtml(hw.description)}</span>
            <span style="font-size:11px;color:var(--text-muted);">${hw.date}</span>
            ${student.parentPhone ? `
              <a href="https://wa.me/${student.parentPhone.replace(/[^0-9]/g,'')}?text=${encodeURIComponent('Ödev: ' + hw.description + ' - ' + hw.link)}" target="_blank" class="whatsapp-btn" style="font-size:10px;padding:4px 8px;">
                ${icon('whatsapp', 11)} Veli'ye Gönder
              </a>
            ` : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;
}

// After modal opens, init topic toggles
setTimeout(() => {
  document.querySelectorAll('[data-toggle-topic]').forEach(btn => {
    btn.addEventListener('click', () => {
      const topicId = btn.dataset.toggleTopic;
      const studentId = btn.dataset.studentId;
      import('../../store/store.js').then(m => {
        const s = m.getState().students.find(x => x.id === studentId);
        if (!s) return;
        const completed = s.completedTopics || [];
        const newCompleted = completed.includes(topicId)
          ? completed.filter(id => id !== topicId)
          : [...completed, topicId];
        m.updateStudent(studentId, { completedTopics: newCompleted });
        // Refresh button
        btn.style.background = newCompleted.includes(topicId) ? 'var(--success)' : 'rgba(255,255,255,0.05)';
        btn.style.borderColor = newCompleted.includes(topicId) ? 'var(--success)' : 'var(--border)';
        btn.innerHTML = newCompleted.includes(topicId) ? icon('check', 12) : '';
      });
    });
  });
}, 100);
