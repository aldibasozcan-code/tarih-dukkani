// ═══════════════════════════════════════════════════
// STUDENTS AND GROUPS PAGE
// ═══════════════════════════════════════════════════
import { getState, deleteStudent, deleteGroup, updateStudent, updateGroup } from '../store/store.js';
import { icon } from '../components/icons.js';
import { formatCurrency, getAvatarColor, getInitials, getGroupInitials, escHtml } from '../utils/helpers.js';
import { showConfirm } from '../components/modal.js';

export function renderStudentsAndGroups(navigate) {
  const state = getState();
  const activeStudents = state.students.filter(s => (s.status || 'active') === 'active');
  const activeGroups = state.groups.filter(g => (g.status || 'active') === 'active');
  
  const hourlyCapacity = activeStudents.reduce((acc, s) => acc + (s.rate || 0), 0)
    + activeGroups.reduce((acc, g) => acc + (g.rate || 0), 0);

  const weeklyLessonHours = activeStudents.filter(s => s.dayOfWeek !== null && s.dayOfWeek !== undefined).length
    + activeGroups.length;

  const html = `
    <div class="fade-in">
      <div class="page-header" style="background: linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(99,102,241,0.02) 100%); padding: 32px 24px; border-radius: 20px; margin-bottom: 28px; border: 1px solid rgba(16,185,129,0.15); box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
        <div>
          <h2 style="font-size: 32px; font-weight: 800; color: var(--brand-green); margin-bottom: 8px; display: flex; align-items: center; gap: 12px; letter-spacing: -0.5px;">
            ${icon('students', 32)} Öğrenci & Grup
          </h2>
          <p style="color: var(--text-secondary); font-size: 16px; font-weight: 500;">Öğrenci ve grup listelerinizi profesyonelce yönetin</p>
        </div>
        <div style="display:flex;gap:10px; align-items: center; flex-wrap:wrap;">
          <button class="btn btn-secondary hover-lift" id="btn-add-group" style="background:white; border:1px solid var(--border); box-shadow:var(--shadow-sm); padding:10px 18px; font-weight:700; font-size:14px; border-radius:12px;">
            ${icon('group', 15)} Grup Ekle
          </button>
          <button class="btn btn-primary hover-lift" id="btn-add-student" style="box-shadow: 0 8px 20px rgba(16,185,129,0.3); padding: 10px 20px; font-weight: 700; font-size: 14px; border-radius:12px;">
            ${icon('plus', 15)} Öğrenci Ekle
          </button>
        </div>
      </div>

      <!-- Bento Grid Stats -->
      <div class="grid grid-4 fade-in-up stagger-1" style="margin-bottom: 32px; gap: 16px;">
        <div class="kpi-card hover-lift" style="border-left: 4px solid var(--brand-green); background: rgba(255, 255, 255, 0.7); padding: 16px 20px;">
          <div class="kpi-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--brand-green); width: 42px; height: 42px; border-radius: 10px;">
            ${icon('students', 20)}
          </div>
          <div>
            <div class="kpi-value" style="font-size: 24px;">${activeStudents.length}</div>
            <div class="kpi-label" style="font-size: 12px;">Aktif Öğrenci</div>
          </div>
        </div>
        <div class="kpi-card hover-lift" style="border-left: 4px solid #7c6aff; background: rgba(255, 255, 255, 0.7); padding: 16px 20px;">
          <div class="kpi-icon" style="background: rgba(124, 106, 255, 0.1); color: #7c6aff; width: 42px; height: 42px; border-radius: 10px;">
            ${icon('groups', 20)}
          </div>
          <div>
            <div class="kpi-value" style="font-size: 24px;">${activeGroups.length}</div>
            <div class="kpi-label" style="font-size: 12px;">Aktif Grup</div>
          </div>
        </div>
        <div class="kpi-card hover-lift" style="border-left: 4px solid #ff9f43; background: rgba(255, 255, 255, 0.7); padding: 16px 20px;">
          <div class="kpi-icon" style="background: rgba(255, 159, 67, 0.1); color: #ff9f43; width: 42px; height: 42px; border-radius: 10px;">
            ${icon('finance', 20)}
          </div>
          <div>
            <div class="kpi-value" style="font-size: 22px; font-weight: 800;">${formatCurrency(hourlyCapacity)}</div>
            <div class="kpi-label" style="font-size: 12px;">Saatlik Kazanç Kapasitesi</div>
          </div>
        </div>
        <div class="kpi-card hover-lift" style="border-left: 4px solid #ff5a65; background: rgba(255, 255, 255, 0.7); padding: 16px 20px;">
          <div class="kpi-icon" style="background: rgba(255, 90, 101, 0.1); color: #ff5a65; width: 42px; height: 42px; border-radius: 10px;">
            ${icon('calendar', 20)}
          </div>
          <div>
            <div class="kpi-value" style="font-size: 22px; font-weight: 800;">${weeklyLessonHours} Saat/Hafta</div>
            <div class="kpi-label" style="font-size: 12px;">Haftalık Ders Yükü</div>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;" class="fade-in-up stagger-2">
        
        <!-- STUDENTS COLUMN -->
        <div style="background:#fff; border:1px solid var(--border); border-radius:20px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.02);">
          <!-- Section header strip -->
          <div style="padding:16px 20px; background:linear-gradient(135deg,rgba(16,185,129,0.06) 0%,rgba(255,255,255,1) 100%); border-bottom:1px solid rgba(16,185,129,0.1); display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="width:32px;height:32px;border-radius:10px;background:rgba(16,185,129,0.12);color:var(--brand-green);display:flex;align-items:center;justify-content:center;">${icon('students', 16)}</div>
              <div>
                <h3 style="margin:0; font-size:16px; color:var(--brand-green); font-weight:800; letter-spacing:-0.3px;">Öğrenciler</h3>
                <div style="font-size:11px;color:var(--text-muted);font-weight:600;margin-top:1px;">${activeStudents.length} aktif</div>
              </div>
            </div>
            <div class="tabs" style="margin:0; padding:4px; background:rgba(16,185,129,0.06); border-radius:10px; border:1px solid rgba(16,185,129,0.12);">
              <button class="tab-btn active student-tab" data-student-tab="active" style="padding:5px 12px; font-size:12px; font-weight:700; border-radius:7px;">Aktif</button>
              <button class="tab-btn student-tab" data-student-tab="passive" style="padding:5px 12px; font-size:12px; font-weight:700; border-radius:7px;">Pasif</button>
            </div>
          </div>
          <div style="padding:16px 20px 20px;">
            <div style="position:relative; margin-bottom:14px;">
              <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);display:flex;align-items:center;">${icon('search', 15)}</span>
              <input type="text" id="student-search" placeholder="Öğrenci ara..." style="width:100%;padding:9px 12px 9px 36px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;font-weight:600;outline:none;transition:all 0.2s;box-sizing:border-box;">
            </div>
            <div class="grid" id="students-grid" style="grid-template-columns: 1fr;">
              <!-- student cards injected here -->
            </div>
            <div class="empty-state" id="students-empty" style="display:none; padding: 30px;">
              ${icon('students', 40)}
              <h3 style="font-size: 16px;">Henüz aktif öğrenci eklenmedi</h3>
            </div>
          </div>
        </div>

        <!-- GROUPS COLUMN -->
        <div style="background:#fff; border:1px solid var(--border); border-radius:20px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.02);">
          <!-- Section header strip -->
          <div style="padding:16px 20px; background:linear-gradient(135deg,rgba(79,70,229,0.05) 0%,rgba(255,255,255,1) 100%); border-bottom:1px solid rgba(79,70,229,0.1); display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="width:32px;height:32px;border-radius:10px;background:rgba(79,70,229,0.1);color:#4f46e5;display:flex;align-items:center;justify-content:center;">${icon('groups', 16)}</div>
              <div>
                <h3 style="margin:0; font-size:16px; color:#4f46e5; font-weight:800; letter-spacing:-0.3px;">Gruplar</h3>
                <div style="font-size:11px;color:var(--text-muted);font-weight:600;margin-top:1px;">${activeGroups.length} aktif</div>
              </div>
            </div>
            <div class="tabs" style="margin:0; padding:4px; background:rgba(79,70,229,0.05); border-radius:10px; border:1px solid rgba(79,70,229,0.1);">
              <button class="tab-btn active group-tab" data-group-tab="active" style="padding:5px 12px; font-size:12px; font-weight:700; border-radius:7px;">Aktif</button>
              <button class="tab-btn group-tab" data-group-tab="passive" style="padding:5px 12px; font-size:12px; font-weight:700; border-radius:7px;">Pasif</button>
            </div>
          </div>
          <div style="padding:16px 20px 20px;">
            <div style="position:relative; margin-bottom:14px;">
              <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);display:flex;align-items:center;">${icon('search', 15)}</span>
              <input type="text" id="group-search" placeholder="Grup ara..." style="width:100%;padding:9px 12px 9px 36px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;font-weight:600;outline:none;transition:all 0.2s;box-sizing:border-box;">
            </div>
            <div class="grid" id="groups-grid" style="grid-template-columns: 1fr;">
              <!-- group cards injected here -->
            </div>
            <div class="empty-state" id="groups-empty" style="display:none; padding: 30px;">
              ${icon('groups', 40)}
              <h3 style="font-size: 16px;">Henüz aktif grup eklenmedi</h3>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  return { html, init: (el, nav) => initStudentsAndGroups(el, nav) };
}

function renderStudentCards(students, state) {
  return students.map(s => {
    const avatarColor = getAvatarColor(s.name);
    const completedCount = state.lessons.filter(l => l.type === 'individual' && l.refId === s.id && l.status === 'completed').length;
    
    return `
      <div class="premium-card person-card hover-lift" data-student-id="${s.id}" style="padding: 18px 24px; border-top: none; border-left: 4px solid ${avatarColor}; display:flex; align-items:center; gap: 16px; cursor: pointer; background: white; margin-bottom: 12px; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); transition: all 0.3s;">
        <div class="person-avatar" style="background:${avatarColor}; width: 52px; height: 52px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); font-size: 18px; color:white; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-weight: 800;">
          ${getInitials(s.name)}
        </div>
        <div style="flex:1; min-width:0;">
          <div class="person-name" style="font-size: 16px; font-weight: 800; color: var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${escHtml(s.name)}
          </div>
          <div class="person-sub" style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-top: 2px;">
            ${s.grade} ${s.phone ? `• ${escHtml(s.phone)}` : ''}
          </div>
          <div style="display:flex; gap:6px; margin-top: 8px; flex-wrap:wrap; align-items: center;">
            <span class="badge" style="background: var(--brand-green-soft); color: var(--brand-green); font-size: 11px; padding: 4px 10px; border-radius: 8px; font-weight: 700; border: 1px solid rgba(16, 185, 129, 0.15);">
              ${formatCurrency(s.rate)}/saat
            </span>
            <span class="badge" style="background: rgba(124, 106, 255, 0.1); color: #7c6aff; font-size: 11px; padding: 4px 10px; border-radius: 8px; font-weight: 700; border: 1px solid rgba(124, 106, 255, 0.15);">
              ${completedCount} Ders Tamamlandı
            </span>
          </div>
        </div>
        <div style="display:flex; gap:6px; flex-shrink:0;" onclick="event.stopPropagation()">
          ${s.status === 'passive' ? `
            <button class="btn btn-ghost btn-sm btn-icon hover-scale" data-activate-student="${s.id}" title="Aktife Al" style="color:#10b981; border-radius: 8px; width: 32px; height: 32px; border: 1px solid rgba(16,185,129,0.3); background: rgba(16,185,129,0.08); display:flex; align-items:center; justify-content:center;">
              ${icon('check', 14)}
            </button>
            <button class="btn btn-ghost btn-sm btn-icon hover-scale" data-delete-student="${s.id}" title="Kalıcı Sil" style="color:var(--danger); border-radius: 8px; width: 32px; height: 32px; border: 1px solid var(--border); background: white; display:flex; align-items:center; justify-content:center;">
              ${icon('trash', 14)}
            </button>
          ` : `
            <button class="btn btn-ghost btn-sm btn-icon hover-scale" data-edit-student="${s.id}" style="border-radius: 8px; width: 32px; height: 32px; border: 1px solid var(--border); background: white; display:flex; align-items:center; justify-content:center;">
              ${icon('edit', 14)}
            </button>
            <button class="btn btn-ghost btn-sm btn-icon hover-scale" data-delete-student="${s.id}" title="Pasife Al" style="color:var(--danger); border-radius: 8px; width: 32px; height: 32px; border: 1px solid var(--border); background: white; display:flex; align-items:center; justify-content:center;">
              ${icon('trash', 14)}
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

function renderGroupCards(groups, state) {
  const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  return groups.map(g => {
    const avatarColor = getAvatarColor(g.name);
    const completedCount = state.lessons.filter(l => l.type === 'group' && l.refId === g.id && l.status === 'completed').length;
    
    return `
      <div class="premium-card person-card hover-lift" data-group-id="${g.id}" style="padding: 18px 24px; border-top: none; border-left: 4px solid ${avatarColor}; display:flex; align-items:center; gap: 16px; cursor: pointer; background: white; margin-bottom: 12px; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); transition: all 0.3s;">
        <div class="person-avatar" style="background:${avatarColor}; width: 52px; height: 52px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); font-size: 18px; color:white; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-weight: 800;">
          ${getGroupInitials(g.name)}
        </div>
        <div style="flex:1; min-width:0;">
          <div class="person-name" style="font-size: 16px; font-weight: 800; color: var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${escHtml(g.name)}
          </div>
          <div class="person-sub" style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-top: 2px;">
            ${g.grade} • ${days[g.dayOfWeek]} ${g.time}
          </div>
          <div style="display:flex; gap:6px; margin-top: 8px; flex-wrap:wrap; align-items: center;">
            <span class="badge" style="background: rgba(124, 106, 255, 0.1); color: #7c6aff; font-size: 11px; padding: 4px 10px; border-radius: 8px; font-weight: 700; border: 1px solid rgba(124, 106, 255, 0.15);">
              ${formatCurrency(g.rate)}/saat
            </span>
            <span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--success); font-size: 11px; padding: 4px 10px; border-radius: 8px; font-weight: 700; border: 1px solid rgba(16, 185, 129, 0.15);">
              ${completedCount} Ders Yapıldı
            </span>
          </div>
        </div>
        <div style="display:flex; gap:6px; flex-shrink:0;" onclick="event.stopPropagation()">
          ${g.status === 'passive' ? `
            <button class="btn btn-ghost btn-sm btn-icon hover-scale" data-activate-group="${g.id}" title="Aktife Al" style="color:#10b981; border-radius: 8px; width: 32px; height: 32px; border: 1px solid rgba(16,185,129,0.3); background: rgba(16,185,129,0.08); display:flex; align-items:center; justify-content:center;">
              ${icon('check', 14)}
            </button>
            <button class="btn btn-ghost btn-sm btn-icon hover-scale" data-delete-group="${g.id}" title="Kalıcı Sil" style="color:var(--danger); border-radius: 8px; width: 32px; height: 32px; border: 1px solid var(--border); background: white; display:flex; align-items:center; justify-content:center;">
              ${icon('trash', 14)}
            </button>
          ` : `
            <button class="btn btn-ghost btn-sm btn-icon hover-scale" data-edit-group="${g.id}" style="border-radius: 8px; width: 32px; height: 32px; border: 1px solid var(--border); background: white; display:flex; align-items:center; justify-content:center;">
              ${icon('edit', 14)}
            </button>
            <button class="btn btn-ghost btn-sm btn-icon hover-scale" data-delete-group="${g.id}" title="Pasife Al" style="color:var(--danger); border-radius: 8px; width: 32px; height: 32px; border: 1px solid var(--border); background: white; display:flex; align-items:center; justify-content:center;">
              ${icon('trash', 14)}
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

function initStudentsAndGroups(container, navigate) {
  let currentStudentTab = 'active';
  let currentGroupTab = 'active';

  // Tabs for students
  container.querySelectorAll('.student-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.student-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStudentTab = btn.dataset.studentTab;
      refreshStudentList();
    });
  });

  // Tabs for groups
  container.querySelectorAll('.group-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.group-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentGroupTab = btn.dataset.groupTab;
      refreshGroupList();
    });
  });

  // Search
  const studentSearchInp = container.querySelector('#student-search');
  studentSearchInp?.addEventListener('input', () => refreshStudentList());

  const groupSearchInp = container.querySelector('#group-search');
  groupSearchInp?.addEventListener('input', () => refreshGroupList());

  function refreshStudentList() {
    const q = studentSearchInp.value.toLowerCase();
    const state = getState();
    const grid = container.querySelector('#students-grid');
    const empty = container.querySelector('#students-empty');
    if (!grid) return;

    const filtered = state.students.filter(s => {
      const matchStatus = (s.status || 'active') === currentStudentTab;
      const matchSearch = s.name.toLowerCase().includes(q) || s.grade.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });

    grid.innerHTML = renderStudentCards(filtered, state);
    if (empty) {
      empty.style.display = filtered.length === 0 ? 'flex' : 'none';
      empty.querySelector('h3').textContent = currentStudentTab === 'active' ? 'Henüz aktif öğrenci eklenmedi' : 'Pasif öğrenci bulunamadı';
    }
    initStudentCardEvents(container, navigate);
  }

  function refreshGroupList() {
    const q = groupSearchInp.value.toLowerCase();
    const state = getState();
    const grid = container.querySelector('#groups-grid');
    const empty = container.querySelector('#groups-empty');
    if (!grid) return;

    const filtered = state.groups.filter(g => {
      const matchStatus = (g.status || 'active') === currentGroupTab;
      const matchSearch = g.name.toLowerCase().includes(q) || g.grade.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });

    grid.innerHTML = renderGroupCards(filtered, state);
    if (empty) {
      empty.style.display = filtered.length === 0 ? 'flex' : 'none';
      empty.querySelector('h3').textContent = currentGroupTab === 'active' ? 'Henüz aktif grup eklenmedi' : 'Pasif grup bulunamadı';
    }
    initGroupCardEvents(container, navigate);
  }

  // Initial renders
  refreshStudentList();
  refreshGroupList();

  // Add buttons
  container.querySelector('#btn-add-student')?.addEventListener('click', () => {
    import('./modals/AddStudentModal.js').then(m => m.openAddStudentModal(() => navigate('studentsAndGroups')));
  });

  container.querySelector('#btn-add-group')?.addEventListener('click', () => {
    import('./modals/AddGroupModal.js').then(m => m.openAddGroupModal(() => navigate('studentsAndGroups')));
  });
}

function initStudentCardEvents(container, navigate) {
  container.querySelectorAll('[data-student-id]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-edit-student]') || e.target.closest('[data-delete-student]') || e.target.closest('[data-activate-student]')) return;
      const id = card.dataset.studentId;
      import('./modals/StudentDetailModal.js').then(m => m.openStudentDetail(id, navigate));
    });
  });

  container.querySelectorAll('[data-edit-student]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      import('./modals/AddStudentModal.js').then(m => m.openAddStudentModal(() => navigate('studentsAndGroups'), btn.dataset.editStudent));
    });
  });

  // Activate (reactivate) student
  container.querySelectorAll('[data-activate-student]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.activateStudent;
      const s = getState().students.find(x => x.id === id);
      showConfirm({
        title: 'Öğrenciyi Aktife Al',
        message: `"${s?.name}" öğrencisi tekrar aktif listeye taşınacak. Pasif durumdaki planlanmış dersleri de yeniden aktif hale getirilecek.`,
        confirmText: 'Aktife Al',
        type: 'success',
        onConfirm: () => {
          updateStudent(id, { status: 'active' });
          navigate('studentsAndGroups');
        },
      });
    });
  });

  container.querySelectorAll('[data-delete-student]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.deleteStudent;
      const s = getState().students.find(x => x.id === id);
      const isActive = (s?.status || 'active') === 'active';
      
      showConfirm({
        title: isActive ? 'Öğrenciyi Pasife Al' : 'Öğrenciyi Kalıcı Olarak Sil',
        message: isActive 
          ? `"${s?.name}" öğrencisi pasif listesine taşınacak. İleri tarihli planlanmış dersleri de pasif hale getirilecek.` 
          : `"${s?.name}" öğrencisi ve tüm verileri kalıcı olarak silinecek. Bu işlem geri alınamaz.`,
        confirmText: isActive ? 'Pasife Al' : 'Kalıcı Olarak Sil',
        type: 'danger',
        onConfirm: () => { 
          deleteStudent(id); 
          navigate('studentsAndGroups'); 
        },
      });
    });
  });
}

function initGroupCardEvents(container, navigate) {
  container.querySelectorAll('[data-group-id]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-edit-group]') || e.target.closest('[data-delete-group]') || e.target.closest('[data-activate-group]')) return;
      const id = card.dataset.groupId;
      import('./modals/GroupDetailModal.js').then(m => m.openGroupDetail(id, navigate));
    });
  });

  container.querySelectorAll('[data-edit-group]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      import('./modals/AddGroupModal.js').then(m => m.openAddGroupModal(() => navigate('studentsAndGroups'), btn.dataset.editGroup));
    });
  });

  // Activate (reactivate) group
  container.querySelectorAll('[data-activate-group]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.activateGroup;
      const g = getState().groups.find(x => x.id === id);
      showConfirm({
        title: 'Grubu Aktife Al',
        message: `"${g?.name}" grubu tekrar aktif listeye taşınacak. Pasif durumdaki planlanmış dersleri de yeniden aktif hale getirilecek.`,
        confirmText: 'Aktife Al',
        type: 'success',
        onConfirm: () => {
          updateGroup(id, { status: 'active' });
          navigate('studentsAndGroups');
        },
      });
    });
  });

  container.querySelectorAll('[data-delete-group]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.deleteGroup;
      const g = getState().groups.find(x => x.id === id);
      const isActive = (g?.status || 'active') === 'active';
      
      showConfirm({
        title: isActive ? 'Grubu Pasife Al' : 'Grubu Kalıcı Olarak Sil',
        message: isActive 
          ? `"${g?.name}" grubu pasif listesine taşınacak. İleri tarihli planlanmış dersleri de pasif hale getirilecek.` 
          : `"${g?.name}" grubu ve tüm verileri kalıcı olarak silinecek. Bu işlem geri alınamaz.`,
        confirmText: isActive ? 'Pasife Al' : 'Kalıcı Olarak Sil',
        type: 'danger',
        onConfirm: () => { 
          deleteGroup(id); 
          navigate('studentsAndGroups'); 
        },
      });
    });
  });
}
