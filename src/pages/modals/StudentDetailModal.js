// ═════════════════════════════════════════════════
// STUDENT DETAIL MODAL
// ═════════════════════════════════════════════════
import { getState } from '../../store/store.js';
import { icon } from '../../components/icons.js';
import { openModal, closeModal } from '../../components/modal.js';
import { escHtml, getAvatarColor, getInitials, formatCurrency, formatDate } from '../../utils/helpers.js';
import { ALL_GRADES, SUBJECTS, getSubjectsForBranches, CONTENT_TYPES } from '../../data/curriculum.js';

export function openStudentDetail(studentId, navigate) {
  const state = getState();
  const student = state.students.find(s => s.id === studentId);
  if (!student) return;

  const activeSubjects = getSubjectsForBranches(state.profile.branches || []);
  const subjects = (student.curriculum && student.curriculum.length > 0)
    ? student.curriculum
    : activeSubjects.map(s => ({ subject: s, grade: student.grade }));

  openModal({
    title: '',
    size: 'xl',
    body: buildDetailBody(student, subjects, state, activeSubjects),
  });
  // After modal opens, init toggles
  setTimeout(() => {
    // Edit Student
    const editBtn = document.getElementById('btn-edit-student-detail');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        import('./AddStudentModal.js').then(m => {
          closeModal();
          m.openAddStudentModal(() => {
            if (navigate) navigate('students');
          }, studentId);
        });
      });
    }

    document.querySelectorAll('[data-sync-curriculum]').forEach(btn => {
      btn.addEventListener('click', () => {
        const sId = btn.dataset.syncCurriculum;
        import('../../store/store.js').then(m => {
          m.syncStudentCurriculum(sId);
          openStudentDetail(sId, navigate);
        });
      });
    });

    document.querySelectorAll('[data-confirm-transaction]').forEach(btn => {
      btn.addEventListener('click', () => {
        const txId = btn.dataset.confirmTransaction;
        import('../../store/store.js').then(m => {
          m.confirmTransaction(txId);
          // Re-open/refresh modal
          openStudentDetail(student.id, navigate);
        });
      });
    });

    document.querySelectorAll('[data-toggle-topic]').forEach(btn => {
      btn.addEventListener('click', () => {
        const topicId = btn.dataset.toggleTopic;
        const sId = btn.dataset.studentId;
        import('../../store/store.js').then(store => {
          const s = store.getState().students.find(x => x.id === sId);
          if (!s) return;
          const completed = s.completedTopics || [];
          const newCompleted = completed.includes(topicId)
            ? completed.filter(id => id !== topicId)
            : [...completed, topicId];
          store.updateStudent(sId, { completedTopics: newCompleted });
          // Refresh button locally
          btn.style.background = newCompleted.includes(topicId) ? 'var(--success)' : 'rgba(255,255,255,0.05)';
          btn.style.borderColor = newCompleted.includes(topicId) ? 'var(--success)' : 'var(--border)';
          btn.innerHTML = newCompleted.includes(topicId) ? icon('check', 12) : '';
        });
      });
    });
  }, 100);
}

function buildDetailBody(student, subjects, state, activeSubjects) {
  const completedSet = new Set(student.completedTopics || []);

  // Calculate total lessons done (status === 'completed')
  const completedLessonsCount = state.lessons.filter(l => l.type === 'student' && l.refId === student.id && l.status === 'completed').length;

  // Calculate overall curriculum progress
  let totalTopics = 0;
  let totalCompletedTopics = 0;
  subjects.forEach(({ subject, grade }) => {
    const units = state.curriculum[subject]?.[grade] || [];
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
        <div style="display:flex;gap:10px;margin-top:4px;flex-wrap:wrap;align-items:center;">
          <span class="badge badge-info">${student.grade}</span>
          <span class="badge badge-muted">${formatCurrency(student.rate)}/saat</span>
          <span class="badge ${student.status === 'passive' ? 'badge-danger' : 'badge-success'}">${student.status === 'passive' ? 'PASİF' : 'AKTİF'}</span>
          ${student.meetLink ? `<a href="${escHtml(student.meetLink)}" target="_blank" class="badge badge-success" style="text-decoration:none;">🎥 Google Meet</a>` : ''}
          <button class="btn btn-ghost btn-sm" id="btn-edit-student-detail" style="padding:2px 8px; font-size:11px; margin-left:auto;">${icon('edit', 12)} Profili Düzenle</button>
          <button class="btn btn-ghost btn-sm" data-sync-curriculum="${student.id}" style="padding:2px 8px; font-size:11px; color:var(--warning);" title="Branşlarınıza göre müfredatı yeniden eşitleyin">${icon('refresh', 12)} Müfredatı Eşitle</button>
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
        const units = state.curriculum[subject]?.[grade] || [];
        const allTopics = units.flatMap(u => u.topics);
        const completed = allTopics.filter(t => completedSet.has(t.id)).length;
        const isStale = !activeSubjects.includes(subject);
        const pct = allTopics.length > 0 ? Math.round((completed / allTopics.length) * 100) : 0;
        
        let sinfo = SUBJECTS.find(s => s.id === subject);
        if (!sinfo) {
          const name = (subject || 'Bilinmeyen_Ders').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          sinfo = { name, icon: '📚' };
        }

        return `
          <div class="card card-sm" style="${isStale ? 'border-color:var(--warning); background:rgba(255,159,67,0.03);' : ''}">
            <div style="font-size:12px;font-weight:600;margin-bottom:8px;color:${isStale ? 'var(--warning)' : 'var(--accent)'}; display:flex; justify-content:space-between; align-items:center;">
               <span>${sinfo.icon} ${sinfo.name} (${grade})</span>
               ${isStale ? `<span title="Bu ders branşlarınızda bulunmuyor" style="cursor:help;">⚠️</span>` : ''}
            </div>
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
      const units = state.curriculum[subject]?.[grade] || [];
      let sinfo = SUBJECTS.find(s => s.id === subject);
      if (!sinfo) {
        const name = (subject || 'Bilinmeyen_Ders').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        sinfo = { name, icon: '📚' };
      }
      const materials = Object.values(state.materials).filter(m => m.subject === subject && m.grade === grade);

      return `
        <h3 style="font-size:14px;font-weight:700;color:var(--accent);margin:16px 0 10px;">${sinfo.icon} ${sinfo.name} (${grade}) Müfredatı</h3>
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
                </div>
              `;
            }).join('')}
          </div>
        `).join('')}
      `;
    }).join('')}

    <!-- Financial Status -->
    <h3 style="font-size:14px;font-weight:700;margin:24px 0 10px; color:var(--success);">Ödeme ve Tahsilat Geçmişi</h3>
    <div class="card card-sm">
      <div style="display:flex; gap:16px; margin-bottom:16px;">
        <div style="flex:1; padding:10px; background:rgba(255,159,67,0.05); border-radius:8px; border:1px solid rgba(255,159,67,0.2);">
          <div style="font-size:11px; color:var(--text-muted);">Bekleyen (Tahmini)</div>
          <div style="font-size:18px; font-weight:800; color:var(--warning);">
            ${formatCurrency(state.transactions.filter(t => t.refId === student.id && t.status === 'estimated').reduce((s,t)=>s+t.amount,0))}
          </div>
        </div>
        <div style="flex:1; padding:10px; background:rgba(46,213,115,0.05); border-radius:8px; border:1px solid rgba(46,213,115,0.2);">
          <div style="font-size:11px; color:var(--text-muted);">Tahsil Edilen (Kesin)</div>
          <div style="font-size:18px; font-weight:800; color:var(--success);">
            ${formatCurrency(state.transactions.filter(t => t.refId === student.id && t.status === 'confirmed').reduce((s,t)=>s+t.amount,0))}
          </div>
        </div>
      </div>
      
      <div class="table-wrapper">
        <table style="font-size:12px;">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Ders/Açıklama</th>
              <th>Durum</th>
              <th style="text-align:right;">Tutar</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${[...state.transactions].filter(t => t.refId === student.id).sort((a,b)=>b.date.localeCompare(a.date)).map(t => `
              <tr>
                <td style="color:var(--text-muted);">${formatDate(t.date)}</td>
                <td>${escHtml(t.description)}</td>
                <td>
                  <span class="badge ${t.status === 'estimated' ? 'badge-warning' : 'badge-success'}">
                    ${t.status === 'estimated' ? '⏳ Bekliyor' : '✓ Ödendi'}
                  </span>
                </td>
                <td style="text-align:right; font-weight:700;">${formatCurrency(t.amount)}</td>
                <td style="text-align:right;">
                  ${t.status === 'estimated' ? `
                    <button class="btn btn-success btn-sm" data-confirm-transaction="${t.id}" style="padding:4px 8px; font-size:10px;">
                      ${icon('check', 10)} Tahsil Et
                    </button>
                  ` : ''}
                </td>
              </tr>
            `).join('')}
            ${state.transactions.filter(t => t.refId === student.id).length === 0 ? '<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">Kayıt bulunamadı.</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>

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
