// ═════════════════════════════════════════════════
// GROUP DETAIL MODAL
// ═════════════════════════════════════════════════
import { getState, getFutureLessonsForRef } from '../../store/store.js';
import { icon } from '../../components/icons.js';
import { openModal, closeModal } from '../../components/modal.js';
import { escHtml, getAvatarColor, getInitials, getGroupInitials, formatCurrency, formatDate, formatDateShort } from '../../utils/helpers.js';
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

  // Circular progress helper
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overallPct / 100) * circumference;

  const avatarColor = getAvatarColor(group.name);
  const primaryColor = avatarColor.match(/#[a-fA-F0-9]{6}/)?.[0] || '#6d28d9';

  openModal({
    title: '',
    size: 'xl',
    body: `
      <div class="fade-in-up" style="position: relative;">
        <!-- Hero Header Section -->
        <div class="premium-card" style="margin-bottom: 32px; padding: 32px; overflow: hidden; position: relative; border: none; background: ${avatarColor};">
          <div class="blur-orb" style="width: 200px; height: 200px; background: rgba(255, 255, 255, 0.2); top: -50px; right: -50px;"></div>
          <div class="blur-orb" style="width: 150px; height: 150px; background: rgba(255, 255, 255, 0.1); bottom: -30px; left: -30px;"></div>
          
          <div style="position: relative; z-index: 2; display: flex; align-items: center; gap: 32px; flex-wrap: wrap;">
            <div style="position: relative;">
              <div style="width: 120px; height: 120px; border-radius: 32px; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 44px; font-weight: 800; color: ${primaryColor}; box-shadow: 0 20px 40px rgba(0,0,0,0.2); border: 4px solid rgba(255,255,255,0.2);">
                ${getGroupInitials(group.name)}
              </div>
              <div style="position: absolute; bottom: -8px; right: -8px; width: 40px; height: 40px; border-radius: 12px; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-lg);">
                ${group.status === 'passive' ? icon('alertCircle', 20, '#ef4444') : icon('checkCircle', 20, '#10b981')}
              </div>
            </div>
            
            <div style="flex: 1; min-width: 300px;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <h2 style="font-size: 32px; font-weight: 800; color: #fff; letter-spacing: -1px; margin: 0;">${escHtml(group.name)}</h2>
                <span class="badge" style="background: rgba(255,255,255,0.15); color: #fff; backdrop-filter: blur(4px); padding: 6px 14px; border-radius: 10px; font-size: 14px;">${group.grade}</span>
              </div>
              <p style="color: rgba(255,255,255,0.8); font-size: 16px; margin-bottom: 24px; font-weight: 500;">Grup Eğitim Profili • ${DAYS_TR[group.dayOfWeek]} ${group.time}</p>
              
              <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <button class="btn" id="btn-edit-group-detail" style="background: #fff; color: ${primaryColor}; padding: 10px 20px; border-radius: 12px; font-weight: 700; box-shadow: 0 10px 20px rgba(0,0,0,0.1);">
                  ${icon('edit', 16)} Grubu Düzenle
                </button>
                ${group.zoomLink ? `<a href="${escHtml(group.zoomLink)}" target="_blank" class="btn" style="background: #10b981; color: #fff; padding: 10px 20px; border-radius: 12px; text-decoration: none; font-weight: 700;">📹 Zoom Ders Odası</a>` : ''}
                ${group.meetLink ? `<a href="${escHtml(group.meetLink)}" target="_blank" class="btn" style="background: #3b82f6; color: #fff; padding: 10px 20px; border-radius: 12px; text-decoration: none; font-weight: 700;">🎥 Google Meet</a>` : ''}
              </div>
            </div>

            <div style="background: rgba(255,255,255,0.1); border-radius: 20px; padding: 16px; backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.2); min-width: 180px;">
              <div style="font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.6); text-transform: uppercase; margin-bottom: 8px;">Dönem Aralığı</div>
              <div style="color: #fff; font-weight: 700; font-size: 14px;">${formatDateShort(group.startDate)} - ${formatDateShort(group.endDate)}</div>
              <div style="margin-top: 12px; height: 1px; background: rgba(255,255,255,0.1);"></div>
              <div style="margin-top: 12px; font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.6); text-transform: uppercase; margin-bottom: 4px;">Ders Ücreti</div>
              <div style="color: #fff; font-weight: 800; font-size: 20px;">${formatCurrency(group.rate)}<span style="font-size: 12px; opacity: 0.7;">/saat</span></div>
            </div>
          </div>
        </div>

        <!-- Bento Grid Stats -->
        <div class="grid grid-3" style="margin-bottom: 32px;">
          <div class="premium-card card-sm" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 24px;">
            <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">Tamamlanan Ders</div>
            <div style="font-size: 32px; font-weight: 800; color: ${primaryColor};">${completedLessonsCount}</div>
          </div>

          <div class="premium-card card-sm" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 24px; position: relative; overflow: hidden;">
            <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Müfredat</div>
            <div style="position: relative; width: 100px; height: 100px;">
              <svg width="100" height="100" viewBox="0 0 100 100" style="transform: rotate(-90deg);">
                <circle cx="50" cy="50" r="${radius}" fill="transparent" stroke="var(--bg-secondary)" stroke-width="8" />
                <circle cx="50" cy="50" r="${radius}" fill="transparent" stroke="${primaryColor}" stroke-width="8" 
                  stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round" 
                  style="transition: stroke-dashoffset 1s ease-out;" />
              </svg>
              <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: ${primaryColor};">
                %${overallPct}
              </div>
            </div>
          </div>

          <div class="premium-card card-sm" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 24px;">
            <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">Kalan Konu</div>
            <div style="font-size: 32px; font-weight: 800; color: var(--warning);">${remainingTopics}</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px; font-weight: 600;">Toplam: ${totalTopics}</div>
          </div>
        </div>

        <div class="grid grid-2" style="align-items: start; gap: 32px;">
          <!-- Left Column: Upcoming & Finance -->
          <div style="display: flex; flex-direction: column; gap: 32px;">
            
            <!-- Future Lessons -->
            <div>
              <div class="section-title">
                <h3 style="color: ${primaryColor};">${icon('calendar', 18)} Gelecek Ders Programı</h3>
              </div>
              <div class="premium-card" style="padding: 12px;">
                ${(() => {
                  const futureLessons = getFutureLessonsForRef('group', group.id);
                  if (futureLessons.length === 0) return '<div style="padding: 32px; text-align: center; color: var(--text-muted); font-size: 14px; font-weight: 500;">Planlanmış gelecek ders bulunmuyor.</div>';
                  
                  return `
                    <div style="max-height: 350px; overflow-y: auto; padding-right: 8px;">
                      ${futureLessons.map(l => `
                        <div class="list-item-hover" style="display: flex; align-items: center; gap: 20px; padding: 16px; border-radius: 16px; margin-bottom: 8px; border: 1px solid transparent; transition: all 0.2s ease; cursor: pointer;" data-lesson-id="${l.id}">
                          <div style="width: 52px; height: 52px; border-radius: 14px; background: ${primaryColor}15; display: flex; flex-direction: column; align-items: center; justify-content: center; color: ${primaryColor}; font-weight: 800; font-size: 12px; line-height: 1.1; flex-shrink: 0; border: 1px solid ${primaryColor}10;">
                            <div style="font-size: 16px;">${l.date.split('-')[2]}</div>
                            <div style="font-size: 10px; text-transform: uppercase;">${new Date(l.date).toLocaleDateString('tr-TR', { month: 'short' })}</div>
                          </div>
                          <div style="flex: 1;">
                            <div style="font-size: 15px; font-weight: 700; color: var(--text-primary);">${l.startTime} – ${l.endTime}</div>
                            <div style="font-size: 12px; color: var(--text-muted); font-weight: 500; margin-top: 2px;">${new Date(l.date).toLocaleDateString('tr-TR', { weekday: 'long' })}</div>
                          </div>
                          <span class="badge ${l.status === 'scheduled' || l.status === 'upcoming' ? 'badge-purple' : 'badge-warning'}" style="font-size: 11px; padding: 6px 12px; border-radius: 8px;">
                            ${l.status === 'scheduled' || l.status === 'upcoming' ? 'Bekliyor' : l.status.toUpperCase()}
                          </span>
                        </div>
                      `).join('')}
                    </div>
                  `;
                })()}
              </div>
            </div>

            <!-- Financials -->
            <div>
              <div class="section-title">
                <h3 style="color: var(--success);">${icon('creditCard', 18)} Grup Muhasebe Özeti</h3>
              </div>
              <div class="premium-card" style="padding: 24px;">
                <div style="display: flex; gap: 16px; margin-bottom: 24px;">
                  <div style="flex: 1; padding: 20px; background: rgba(245, 158, 11, 0.05); border-radius: 20px; border: 1px solid rgba(245, 158, 11, 0.1);">
                    <div style="font-size: 11px; font-weight: 700; color: var(--warning); margin-bottom: 8px; text-transform: uppercase;">Tahmini Alacak</div>
                    <div style="font-size: 24px; font-weight: 800; color: var(--warning);">
                      ${formatCurrency(state.transactions.filter(t => t.refId === group.id && t.status === 'estimated').reduce((s,t)=>s+t.amount,0))}
                    </div>
                  </div>
                  <div style="flex: 1; padding: 20px; background: rgba(16, 185, 129, 0.05); border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.1);">
                    <div style="font-size: 12px; font-weight: 700; color: var(--success); margin-bottom: 8px; text-transform: uppercase;">Toplam Tahsilat</div>
                    <div style="font-size: 24px; font-weight: 800; color: var(--success);">
                      ${formatCurrency(state.transactions.filter(t => t.refId === group.id && t.status === 'confirmed').reduce((s,t)=>s+t.amount,0))}
                    </div>
                  </div>
                </div>

                <div class="table-wrapper" style="border: none; box-shadow: none;">
                  <table style="font-size: 13px; border-collapse: separate; border-spacing: 0 8px;">
                    <tbody>
                      ${[...state.transactions].filter(t => t.refId === group.id).sort((a,b)=>b.date.localeCompare(a.date)).slice(0, 5).map(t => `
                        <tr style="background: var(--bg-secondary); border-radius: 12px;">
                          <td style="padding: 12px; border-radius: 12px 0 0 12px; font-weight: 600; color: var(--text-muted);">${formatDateShort(t.date)}</td>
                          <td style="padding: 12px; font-weight: 700;">${escHtml(t.description)}</td>
                          <td style="padding: 12px; text-align: right; font-weight: 800; color: var(--text-primary);">${formatCurrency(t.amount)}</td>
                          <td style="padding: 12px; border-radius: 0 12px 12px 0; text-align: right;">
                             <span class="badge ${t.status === 'confirmed' ? 'badge-success' : 'badge-warning'}" style="font-size: 10px;">
                               ${t.status === 'confirmed' ? '✓ Ödendi' : '⏳ Bekliyor'}
                             </span>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Curriculum Roadmap -->
          <div>
            <div class="section-title">
              <h3 style="color: ${primaryColor};">${icon('trendingUp', 18)} Eğitim İlerlemesi</h3>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 24px;">
              ${subjects.map(({ subject, grade }) => {
                const units = state.curriculum[subject]?.[grade] || [];
                let sinfo = SUBJECTS.find(s => s.id === subject);
                if (!sinfo) sinfo = { name: subject.replace('_', ' '), icon: '📚' };
                const materials = Object.values(state.materials).filter(m => m.subject === subject && m.grade === grade);

                return units.map(unit => {
                  const unitProgress = Math.round((unit.topics.filter(t => completedSet.has(t.id)).length / unit.topics.length) * 100);
                  const isDone = unitProgress === 100;

                  return `
                    <div class="premium-card" style="padding: 0; overflow: hidden; background: #fff; border: 1px solid var(--border);">
                      <div style="padding: 20px; background: ${isDone ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-secondary)'}; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                          <div style="font-size: 10px; font-weight: 800; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">${sinfo.name}</div>
                          <div style="font-size: 15px; font-weight: 800; color: var(--text-primary);">${escHtml(unit.name)}</div>
                        </div>
                        <div style="font-size: 16px; font-weight: 800; color: ${isDone ? 'var(--success)' : primaryColor};">${unitProgress}%</div>
                      </div>
                      <div style="padding: 12px;">
                        ${unit.topics.map(topic => {
                          const done = completedSet.has(topic.id);
                          const topicMaterials = materials.filter(m => m.unitId === unit.id && m.topicId === topic.id);
                          return `
                            <div class="list-item-hover" style="display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 12px; margin-bottom: 2px;">
                              <button style="width: 26px; height: 26px; border-radius: 8px; background: ${done ? 'var(--success)' : '#fff'}; border: 2px solid ${done ? 'var(--success)' : 'var(--border)'}; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"
                                data-toggle-group-topic="${topic.id}" data-group-id="${group.id}">
                                ${done ? icon('check', 12, '#fff') : ''}
                              </button>
                              <div style="flex: 1;">
                                <div style="font-size: 13px; font-weight: 600; ${done ? 'text-decoration: line-through; color: var(--text-muted);' : 'color: var(--text-primary);'}">${escHtml(topic.name)}</div>
                                <div style="display: flex; gap: 6px; margin-top: 4px;">
                                  ${topicMaterials.map(m => `
                                    <a href="${escHtml(m.link)}" target="_blank" style="text-decoration: none; font-size: 10px; font-weight: 700; color: ${primaryColor}; background: ${primaryColor}15; padding: 2px 8px; border-radius: 6px; display: flex; align-items: center; gap: 4px;">
                                      ${CONTENT_TYPES.find(ct => ct.id === m.contentType)?.icon || '📄'} ${m.title}
                                    </a>
                                  `).join('')}
                                </div>
                              </div>
                            </div>
                          `;
                        }).join('')}
                      </div>
                    </div>
                  `;
                }).join('');
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `,
  });

  // Events init
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

    document.querySelectorAll('[data-confirm-transaction]').forEach(btn => {
      btn.addEventListener('click', () => {
        const txId = btn.dataset.confirmTransaction;
        import('../../store/store.js').then(m => {
          m.confirmTransaction(txId);
          openGroupDetail(group.id, navigate);
        });
      });
    });

    document.querySelectorAll('[data-lesson-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const lessonId = btn.dataset.lessonId;
        import('./LessonEvalModal.js').then(m => {
          m.openLessonEvalModal(lessonId, navigate);
        });
      });
    });

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
          btn.style.background = !c.includes(topicId) ? 'var(--success)' : '#fff';
          btn.style.borderColor = !c.includes(topicId) ? 'var(--success)' : 'var(--border)';
          btn.innerHTML = !c.includes(topicId) ? icon('check', 12, '#fff') : '';
        });
      });
    });
  }, 100);
}
