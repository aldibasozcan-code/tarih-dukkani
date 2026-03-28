// ═════════════════════════════════════════════════
// GROUP DETAIL MODAL
// ═════════════════════════════════════════════════
import { getState } from '../../store/store.js';
import { icon } from '../../components/icons.js';
import { openModal, closeModal } from '../../components/modal.js';
import { escHtml, getAvatarColor, getInitials, formatCurrency, formatDate } from '../../utils/helpers.js';
import { SUBJECTS, getSubjectsForBranches, CONTENT_TYPES, DAYS_TR } from '../../data/curriculum.js';

export function openGroupDetail(groupId, navigate) {
  const state = getState();
  const group = state.groups.find(g => g.id === groupId);
  if (!group) return;

  const activeSubjects = getSubjectsForBranches(state.profile.branches || []);
  const subjects = (group.curriculum && group.curriculum.length > 0)
    ? group.curriculum
    : activeSubjects.map(s => ({ subject: s, grade: group.grade }));
  const completedSet = new Set(group.completedTopics || []);

  // Get upcoming lessons for this group
  const today = new Date().toISOString().split('T')[0];
  const upcomingLessons = state.lessons
    .filter(l => l.refId === groupId && l.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  // Calculate total lessons done (status === 'completed')
  const completedLessonsCount = state.lessons.filter(l => l.type === 'group' && l.refId === group.id && l.status === 'completed').length;

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

  openModal({
    title: '',
    size: 'xl',
    body: `
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
        <div style="width:60px;height:60px;border-radius:14px;background:linear-gradient(135deg,var(--accent2),#5a4dcc);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#fff;flex-shrink:0;">
          ${getInitials(group.name)}
        </div>
        <div style="flex:1;">
          <h2 style="font-size:20px;font-weight:800;">${escHtml(group.name)}</h2>
          <div style="display:flex;gap:10px;margin-top:4px;flex-wrap:wrap;align-items:center;">
            <span class="badge badge-purple">${group.grade}</span>
            <span class="badge badge-muted">${DAYS_TR[group.dayOfWeek]} ${group.time}</span>
            <span class="badge badge-info">${formatCurrency(group.rate)}/saat</span>
            <span class="badge ${group.status === 'passive' ? 'badge-danger' : 'badge-success'}">${group.status === 'passive' ? 'PASİF' : 'AKTİF'}</span>
            ${group.zoomLink ? `<a href="${escHtml(group.zoomLink)}" target="_blank" class="badge badge-success" style="text-decoration:none;">📹 Zoom</a>` : '<span class="badge badge-warning">Zoom bekleniyor</span>'}
            <button class="btn btn-ghost btn-sm" id="btn-edit-group-detail" style="padding:2px 8px; font-size:11px; margin-left:auto;">${icon('edit', 12)} Profili Düzenle</button>
          </div>
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

      <div class="grid grid-2" style="margin-bottom:20px;">
        <!-- Upcoming lessons -->
        <div class="card card-sm">
          <div style="font-weight:700;font-size:13px;margin-bottom:12px;color:var(--accent);">Yaklaşan Dersler</div>
          ${upcomingLessons.length === 0 ? '<p style="font-size:12px;color:var(--text-muted);">Ders yok</p>' : ''}
          ${upcomingLessons.map(l => `
            <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
              <div class="dot dot-blue" style="flex-shrink:0;"></div>
              <div style="flex:1;">
                <div style="font-size:12px;font-weight:600;">${formatDate(l.date)}</div>
                <div style="font-size:11px;color:var(--text-muted);">${l.startTime} – ${l.endTime}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Stats -->
        ${subjects.map(({ subject, grade }) => {
          const units = state.curriculum[subject]?.[grade] || [];
          const allTopics = units.flatMap(u => u.topics);
          const completed = allTopics.filter(t => completedSet.has(t.id)).length;
          const pct = allTopics.length > 0 ? Math.round((completed / allTopics.length) * 100) : 0;
          
          let sinfo = SUBJECTS.find(s => s.id === subject);
          if (!sinfo) sinfo = { name: subject.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), icon: '📚' };

          return `
            <div class="card card-sm">
              <div style="font-size:12px;font-weight:600;color:var(--accent2);margin-bottom:8px;">${sinfo.icon} ${sinfo.name} (${grade})</div>
              <div class="progress-bar" style="margin-bottom:6px;">
                <div class="progress-fill" style="width:${pct}%;background:linear-gradient(90deg,var(--accent2),var(--accent));"></div>
              </div>
              <div style="font-size:11px;color:var(--text-muted);">${completed}/${allTopics.length} konu tamamlandı</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Curriculum -->
      ${subjects.map(({ subject, grade }) => {
        const units = state.curriculum[subject]?.[grade] || [];
        let sinfo = SUBJECTS.find(s => s.id === subject);
        if (!sinfo) sinfo = { name: subject.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), icon: '📚' };
        
        const materials = Object.values(state.materials).filter(m => m.subject === subject && m.grade === grade);

        return `
          <h3 style="font-size:14px;font-weight:700;color:var(--accent2);margin:16px 0 10px;">${sinfo.icon} ${sinfo.name} (${grade}) Müfredatı</h3>
          ${units.map(unit => `
            <div class="card card-sm" style="margin-bottom:8px;">
              <div style="font-weight:700;font-size:12px;margin-bottom:8px;color:var(--text-secondary);">${escHtml(unit.name)}</div>
              ${unit.topics.map(topic => {
                const done = completedSet.has(topic.id);
                const topicMaterials = materials.filter(m => m.unitId === unit.id && m.topicId === topic.id);
                return `
                  <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <button style="width:24px;height:24px;border-radius:6px;background:${done ? 'var(--success)' : 'rgba(255,255,255,0.05)'};border:1px solid ${done ? 'var(--success)' : 'var(--border)'};cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;"
                      data-toggle-group-topic="${topic.id}" data-group-id="${group.id}">
                      ${done ? icon('check', 11) : ''}
                    </button>
                    <span style="flex:1;font-size:12px;${done ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${escHtml(topic.name)}</span>
                    ${topicMaterials.map(m => `
                      <a href="${escHtml(m.link)}" target="_blank" class="badge badge-purple" style="text-decoration:none;font-size:10px;">
                        ${CONTENT_TYPES.find(ct => ct.id === m.contentType)?.icon || '📄'} ${m.title}
                      </a>
                    `).join('')}
                  </div>
                `;
              }).join('')}
            </div>
          `).join('')}
        `;
      }).join('')}
    `,
  });

  // Topic toggle
  setTimeout(() => {
    // Edit Group
    const editBtn = document.getElementById('btn-edit-group-detail');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        import('./AddGroupModal.js').then(m => {
          closeModal();
          m.openAddGroupModal(() => {
             if (navigate) navigate('groups');
          }, group.id);
        });
      });
    }

    document.querySelectorAll('[data-toggle-group-topic]').forEach(btn => {
      btn.addEventListener('click', () => {
        const topicId = btn.dataset.toggleGroupTopic;
        const gId = btn.dataset.groupId;
        import('../../store/store.js').then(m => {
          const g = m.getState().groups.find(x => x.id === gId);
          if (!g) return;
          const c = g.completedTopics || [];
          m.updateGroup(gId, {
            completedTopics: c.includes(topicId) ? c.filter(id => id !== topicId) : [...c, topicId]
          });
          btn.style.background = !c.includes(topicId) ? 'var(--success)' : 'rgba(255,255,255,0.05)';
          btn.style.borderColor = !c.includes(topicId) ? 'var(--success)' : 'var(--border)';
          btn.innerHTML = !c.includes(topicId) ? icon('check', 11) : '';
        });
      });
    });
  }, 100);
}
