// ═════════════════════════════════════════════════
// STUDENT DETAIL MODAL
// ═════════════════════════════════════════════════
import { getState, getFutureLessonsForRef } from '../../store/store.js';
import { icon } from '../../components/icons.js';
import { openModal, closeModal } from '../../components/modal.js';
import { escHtml, getAvatarColor, getInitials, formatCurrency, formatDate } from '../../utils/helpers.js';
import { ALL_GRADES, SUBJECTS, getSubjectsForBranches, CONTENT_TYPES } from '../../data/curriculum.js';
import { openMonthlySummary } from './MonthlySummaryModal.js';

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
            if (navigate) navigate('studentsAndGroups');
          }, studentId);
        });
      });
    }

    const summaryBtn = document.getElementById('btn-monthly-summary');
    if (summaryBtn) {
      summaryBtn.addEventListener('click', () => {
        openMonthlySummary(student.id, 'student', navigate);
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

    document.querySelectorAll('[data-lesson-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const lessonId = btn.dataset.lessonId;
        import('./LessonEvalModal.js').then(m => {
          m.openLessonEvalModal(lessonId, navigate);
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

  // Circular progress helper
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overallPct / 100) * circumference;

  const avatarColor = getAvatarColor(student.name);
  const primaryColor = avatarColor.match(/#[a-fA-F0-9]{6}/)?.[0] || 'var(--brand-green)';

  return `
    <div class="fade-in-up" style="position: relative;">
      <!-- Hero Header Section -->
      <div class="premium-card" style="margin-bottom: 32px; padding: 32px; overflow: hidden; position: relative; border: none; background: ${avatarColor};">
        <div class="blur-orb" style="width: 200px; height: 200px; background: rgba(255, 255, 255, 0.2); top: -50px; right: -50px;"></div>
        <div class="blur-orb" style="width: 150px; height: 150px; background: rgba(255, 255, 255, 0.1); bottom: -30px; left: -30px;"></div>
        
        <div style="position: relative; z-index: 2; display: flex; align-items: center; gap: 32px; flex-wrap: wrap;">
          <div style="position: relative;">
            <div style="width: 120px; height: 120px; border-radius: 32px; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 44px; font-weight: 800; color: ${primaryColor}; box-shadow: 0 20px 40px rgba(0,0,0,0.2); border: 4px solid rgba(255,255,255,0.2);">
              ${getInitials(student.name)}
            </div>
            <div style="position: absolute; bottom: -8px; right: -8px; width: 40px; height: 40px; border-radius: 12px; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-lg);">
              ${student.status === 'passive' ? icon('alertCircle', 20, '#ef4444') : icon('checkCircle', 20, '#10b981')}
            </div>
          </div>
          
          <div style="flex: 1; min-width: 300px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              <h2 style="font-size: 32px; font-weight: 800; color: #fff; letter-spacing: -1px; margin: 0;">${escHtml(student.name)}</h2>
              <span class="badge" style="background: rgba(255,255,255,0.15); color: #fff; backdrop-filter: blur(4px); padding: 6px 14px; border-radius: 10px; font-size: 14px;">${student.grade}</span>
            </div>
            <p style="color: rgba(255,255,255,0.8); font-size: 16px; margin-bottom: 24px; font-weight: 500;">Bireysel Öğrenci Profili</p>
            
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <button class="btn" id="btn-edit-student-detail" style="background: #fff; color: ${primaryColor}; padding: 10px 20px; border-radius: 12px; font-weight: 700; box-shadow: 0 10px 20px rgba(0,0,0,0.1);">
                ${icon('edit', 16)} Profili Düzenle
              </button>
              <button class="btn" data-sync-curriculum="${student.id}" style="background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 12px; backdrop-filter: blur(4px);">
                ${icon('refresh', 16)} Müfredatı Eşitle
              </button>
              <button class="btn" id="btn-monthly-summary" style="background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 12px; backdrop-filter: blur(4px);">
                ${icon('fileText', 16)} Aylık Özet
              </button>
              ${student.meetLink ? `<a href="${escHtml(student.meetLink)}" target="_blank" class="btn" style="background: #10b981; color: #fff; padding: 10px 20px; border-radius: 12px; text-decoration: none; font-weight: 700;">🎥 Google Meet</a>` : ''}
            </div>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${student.phone ? `
              <a href="https://wa.me/${student.phone.replace(/[^0-9]/g, '')}" target="_blank" class="whatsapp-btn" style="background: #25d366; padding: 12px 24px; border-radius: 16px; box-shadow: 0 10px 20px rgba(37, 211, 102, 0.2); text-decoration: none; display: flex; align-items: center; gap: 10px; font-weight: 700; color: #fff;">
                ${icon('whatsapp', 18)} ${escHtml(student.phone)}
              </a>` : ''}
            ${student.parentPhone ? `
              <a href="https://wa.me/${student.parentPhone.replace(/[^0-9]/g, '')}" target="_blank" class="whatsapp-btn" style="background: #fff; padding: 12px 24px; border-radius: 16px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); text-decoration: none; display: flex; align-items: center; gap: 10px; font-weight: 700; color: #128c7e; border: 1px solid #e2e8f0;">
                ${icon('whatsapp', 18)} Veli: ${escHtml(student.parentPhone)}
              </a>` : ''}
          </div>
        </div>
      </div>

      <!-- Bento Grid Stats -->
      <div class="grid grid-4" style="margin-bottom: 32px;">
        <div class="premium-card card-sm" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 24px;">
          <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">Öğrenim Ücreti</div>
          <div style="font-size: 28px; font-weight: 800; color: ${primaryColor};">${formatCurrency(student.rate)}<span style="font-size: 14px; color: var(--text-muted); font-weight: 500;"> /saat</span></div>
        </div>
        
        <div class="premium-card card-sm" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 24px;">
          <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">Tamamlanan Ders</div>
          <div style="font-size: 32px; font-weight: 800; color: var(--success);">${completedLessonsCount}</div>
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
        <!-- Left Column: Lessons & Finance -->
        <div style="display: flex; flex-direction: column; gap: 32px;">
          
          <!-- Future Lessons Section -->
          <div>
            <div class="section-title">
              <h3 style="color: ${primaryColor};">${icon('calendar', 18)} Planlanmış Gelecek Dersler</h3>
            </div>
            <div class="premium-card" style="padding: 12px;">
              ${(() => {
                const futureLessons = getFutureLessonsForRef('student', student.id);
                if (futureLessons.length === 0) return '<div style="padding: 32px; text-align: center; color: var(--text-muted); font-size: 14px; font-weight: 500;">Planlanmış gelecek ders bulunmuyor.</div>';
                
                return `
                  <div style="max-height: 350px; overflow-y: auto; padding-right: 8px;">
                    ${futureLessons.map(l => `
                      <div class="list-item-hover" style="display: flex; align-items: center; gap: 20px; padding: 16px; border-radius: 16px; margin-bottom: 8px; border: 1px solid transparent; transition: all 0.2s ease; cursor: pointer;" data-lesson-id="${l.id}">
                        <div style="width: 52px; height: 52px; border-radius: 14px; background: ${primaryColor}20; display: flex; flex-direction: column; align-items: center; justify-content: center; color: ${primaryColor}; font-weight: 800; font-size: 12px; line-height: 1.1; flex-shrink: 0; border: 1px solid ${primaryColor}10;">
                          <div style="font-size: 16px;">${l.date.split('-')[2]}</div>
                          <div style="font-size: 10px; text-transform: uppercase;">${new Date(l.date).toLocaleDateString('tr-TR', { month: 'short' })}</div>
                        </div>
                        <div style="flex: 1;">
                          <div style="font-size: 15px; font-weight: 700; color: var(--text-primary);">${l.startTime} – ${l.endTime}</div>
                          <div style="font-size: 12px; color: var(--text-muted); font-weight: 500; margin-top: 2px;">${new Date(l.date).toLocaleDateString('tr-TR', { weekday: 'long' })}</div>
                        </div>
                        <span class="badge ${l.status === 'scheduled' || l.status === 'upcoming' ? 'badge-info' : 'badge-warning'}" style="font-size: 11px; padding: 6px 12px; border-radius: 8px;">
                          ${l.status === 'scheduled' || l.status === 'upcoming' ? 'Bekliyor' : l.status.toUpperCase()}
                        </span>
                      </div>
                    `).join('')}
                  </div>
                `;
              })()}
            </div>
          </div>

          <!-- Financial Summary Section -->
          <div>
            <div class="section-title">
              <h3 style="color: var(--success);">${icon('creditCard', 18)} Ödeme & Tahsilat</h3>
            </div>
            <div class="premium-card" style="padding: 24px;">
              <div style="display: flex; gap: 16px; margin-bottom: 24px;">
                <div style="flex: 1; padding: 20px; background: rgba(245, 158, 11, 0.05); border-radius: 20px; border: 1px solid rgba(245, 158, 11, 0.1);">
                  <div style="font-size: 12px; font-weight: 700; color: var(--warning); margin-bottom: 8px; text-transform: uppercase;">Tahmini Kazanç</div>
                  <div style="font-size: 24px; font-weight: 800; color: var(--warning);">
                    ${formatCurrency(state.transactions.filter(t => t.refId === student.id && t.status === 'estimated').reduce((s,t)=>s+t.amount,0))}
                  </div>
                </div>
                <div style="flex: 1; padding: 20px; background: rgba(16, 185, 129, 0.05); border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.1);">
                  <div style="font-size: 12px; font-weight: 700; color: var(--success); margin-bottom: 8px; text-transform: uppercase;">Toplam Tahsilat</div>
                  <div style="font-size: 24px; font-weight: 800; color: var(--success);">
                    ${formatCurrency(state.transactions.filter(t => t.refId === student.id && t.status === 'confirmed').reduce((s,t)=>s+t.amount,0))}
                  </div>
                </div>
              </div>
              
              <div class="table-wrapper" style="border: none; box-shadow: none;">
                <table style="font-size: 13px; border-collapse: separate; border-spacing: 0 8px;">
                  <thead>
                    <tr>
                      <th style="background: none; border: none; padding: 8px 12px;">Tarih</th>
                      <th style="background: none; border: none; padding: 8px 12px;">Ders/Açıklama</th>
                      <th style="background: none; border: none; padding: 8px 12px; text-align: right;">Tutar</th>
                      <th style="background: none; border: none; padding: 8px 12px;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    ${[...state.transactions].filter(t => t.refId === student.id).sort((a,b)=>b.date.localeCompare(a.date)).slice(0, 8).map(t => `
                      <tr style="background: var(--bg-secondary); border-radius: 12px; transition: transform 0.2s;">
                        <td style="padding: 12px; border: none; border-radius: 12px 0 0 12px; font-weight: 600; color: var(--text-muted);">${formatDate(t.date).split(' ').slice(0, 2).join(' ')}</td>
                        <td style="padding: 12px; border: none;">
                          <div style="font-weight: 700; color: var(--text-primary);">${escHtml(t.description)}</div>
                          <div style="font-size: 11px; color: ${t.status === 'estimated' ? 'var(--warning)' : 'var(--success)'}; font-weight: 700; margin-top: 2px;">
                            ${t.status === 'estimated' ? '⏳ Bekliyor' : '✓ Tahsil Edildi'}
                          </div>
                        </td>
                        <td style="padding: 12px; border: none; text-align: right; font-weight: 800; font-size: 15px; color: var(--text-primary);">${formatCurrency(t.amount)}</td>
                        <td style="padding: 12px; border: none; border-radius: 0 12px 12px 0; text-align: right;">
                          ${t.status === 'estimated' ? `
                            <button class="btn btn-success" data-confirm-transaction="${t.id}" style="padding: 6px 12px; font-size: 11px; border-radius: 8px;">
                              Onayla
                            </button>
                          ` : ''}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Curriculum & Progress -->
        <div style="display: flex; flex-direction: column; gap: 32px;">
          
          <!-- Subject Progress Cards -->
          <div>
            <div class="section-title">
              <h3>${icon('trendingUp', 18)} Branş Bazlı İlerleme</h3>
            </div>
            <div class="grid grid-1" style="gap: 16px;">
              ${subjects.map(({ subject, grade }) => {
                const units = state.curriculum[subject]?.[grade] || [];
                const allTopics = units.flatMap(u => u.topics);
                const completed = allTopics.filter(t => completedSet.has(t.id)).length;
                const isStale = !activeSubjects.includes(subject);
                const pct = allTopics.length > 0 ? Math.round((completed / allTopics.length) * 100) : 0;
                
                let sinfo = SUBJECTS.find(s => s.id === subject);
                if (!sinfo) sinfo = { name: (subject || '').replace('_', ' '), icon: '📚' };

                return `
                  <div class="premium-card" style="padding: 20px; border-left: 6px solid ${isStale ? 'var(--warning)' : 'var(--brand-green)'};">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                      <div>
                        <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                          ${sinfo.icon} ${sinfo.name}
                          ${isStale ? `<span title="Aktif branşlarınızda değil" style="font-size: 12px; opacity: 0.5;">⚠️</span>` : ''}
                        </div>
                        <div style="font-size: 12px; color: var(--text-muted); font-weight: 600; margin-top: 2px;">${grade} • ${units.length} Ünite</div>
                      </div>
                      <div style="font-size: 20px; font-weight: 800; color: var(--brand-green);">%${pct}</div>
                    </div>
                    <div class="progress-bar" style="height: 10px; border-radius: 5px; background: var(--bg-secondary); border: none;">
                      <div class="progress-fill" style="width: ${pct}%; height: 100%; border-radius: 5px; background: linear-gradient(90deg, var(--brand-green), var(--brand-green-light));"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Homeworks Section -->
          ${student.homework?.length > 0 ? `
            <div>
              <div class="section-title">
                <h3>${icon('book', 18)} Son Ödevler</h3>
              </div>
              <div class="premium-card" style="padding: 12px;">
                ${student.homework.slice(-5).reverse().map(hw => `
                  <div style="display: flex; align-items: center; gap: 16px; padding: 14px; border-bottom: 1px solid var(--border); last-child: border-bottom: none;">
                    <div style="width: 40px; height: 40px; border-radius: 12px; background: #fff8eb; display: flex; align-items: center; justify-content: center; color: #f59e0b; flex-shrink: 0;">
                      ${icon('fileText', 18)}
                    </div>
                    <div style="flex: 1;">
                      <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">${escHtml(hw.description)}</div>
                      <div style="font-size: 11px; color: var(--text-muted); font-weight: 600; margin-top: 2px;">${formatDate(hw.date)}</div>
                    </div>
                    ${student.parentPhone ? `
                      <a href="https://wa.me/${student.parentPhone.replace(/[^0-9]/g,'')}?text=${encodeURIComponent('Ödev Hatırlatma: ' + hw.description + ' - ' + hw.link)}" target="_blank" class="whatsapp-btn" style="padding: 6px 12px; font-size: 10px; border-radius: 10px; background: rgba(37, 211, 102, 0.1); color: #25d366; box-shadow: none;">
                        ${icon('whatsapp', 14)} Hatırlat
                      </a>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

        </div>
      </div>

      <!-- Full Curriculum Roadmap -->
      <div style="margin-top: 48px;">
        <div class="section-title">
          <h3 style="font-size: 20px;">${icon('layers', 20)} Müfredat Yol Haritası</h3>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 32px;">
          ${subjects.map(({ subject, grade }) => {
            const units = state.curriculum[subject]?.[grade] || [];
            let sinfo = SUBJECTS.find(s => s.id === subject);
            if (!sinfo) sinfo = { name: subject.replace('_', ' '), icon: '📚' };
            const materials = Object.values(state.materials).filter(m => m.subject === subject && m.grade === grade);

            return units.map(unit => {
              const unitCompleted = unit.topics.every(t => completedSet.has(t.id));
              const unitProgress = Math.round((unit.topics.filter(t => completedSet.has(t.id)).length / unit.topics.length) * 100);

              return `
                <div class="premium-card" style="padding: 0; overflow: hidden; background: #fff; border: 1px solid var(--border);">
                  <div style="padding: 20px; background: ${unitCompleted ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-secondary)'}; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-size: 11px; font-weight: 800; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">${sinfo.name} • Ünite</div>
                      <div style="font-size: 16px; font-weight: 800; color: var(--text-primary);">${escHtml(unit.name)}</div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 18px; font-weight: 800; color: ${unitCompleted ? 'var(--success)' : 'var(--text-muted)'};">${unitProgress}%</div>
                    </div>
                  </div>
                  <div style="padding: 16px;">
                    ${unit.topics.map(topic => {
                      const done = completedSet.has(topic.id);
                      const topicMaterials = materials.filter(m => m.unitId === unit.id && m.topicId === topic.id);
                      return `
                        <div class="list-item-hover" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px; margin-bottom: 4px;">
                          <button class="btn-icon" style="width: 28px; height: 28px; border-radius: 10px; background: ${done ? 'var(--success)' : '#fff'}; border: 2px solid ${done ? 'var(--success)' : 'var(--border)'}; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s;" 
                            data-toggle-topic="${topic.id}" data-student-id="${student.id}">
                            ${done ? icon('check', 14, '#fff') : ''}
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
  `;
}
