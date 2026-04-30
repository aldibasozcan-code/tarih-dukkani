// ═══════════════════════════════════════════════════
// STUDENTS AND GROUPS PAGE
// ═══════════════════════════════════════════════════
import { getState, deleteStudent, deleteGroup } from '../store/store.js';
import { icon } from '../components/icons.js';
import { formatCurrency, getAvatarColor, getInitials, getGroupInitials, escHtml } from '../utils/helpers.js';
import { showConfirm } from '../components/modal.js';

export function renderStudentsAndGroups(navigate) {
  const state = getState();

  const html = `
    <div class="fade-in">
      <div class="page-header">
        <div>
          <h2>Öğrenci & Grup</h2>
          <p>Öğrenci ve grup listelerinizi buradan yönetebilirsiniz</p>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-primary" id="btn-add-new">${icon('plus', 14)} Yeni Ekle</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        
        <!-- STUDENTS COLUMN -->
        <div class="card" style="padding: 24px;">
          <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin:0; font-size: 18px; color: var(--text-primary); display:flex; align-items:center; gap:8px;">${icon('students', 20)} Öğrenciler</h3>
            <div class="tabs" style="margin: 0; padding: 4px; background: var(--bg-secondary); border-radius: var(--radius-md);">
              <button class="tab-btn active student-tab" data-student-tab="active" style="padding: 4px 12px; font-size: 13px;">Aktif</button>
              <button class="tab-btn student-tab" data-student-tab="passive" style="padding: 4px 12px; font-size: 13px;">Pasif</button>
            </div>
          </div>
          <div class="search-box" style="margin-bottom:16px;">
            <span class="search-icon">${icon('search', 15)}</span>
            <input type="text" id="student-search" placeholder="Öğrenci ara..." style="width:100%;">
          </div>
          <div class="grid" id="students-grid" style="grid-template-columns: 1fr;">
            <!-- student cards injected here -->
          </div>
          <div class="empty-state" id="students-empty" style="display:none; padding: 30px;">
             ${icon('students', 40)}
             <h3 style="font-size: 16px;">Henüz aktif öğrenci eklenmedi</h3>
          </div>
        </div>

        <!-- GROUPS COLUMN -->
        <div class="card" style="padding: 24px;">
          <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin:0; font-size: 18px; color: var(--text-primary); display:flex; align-items:center; gap:8px;">${icon('groups', 20)} Gruplar</h3>
            <div class="tabs" style="margin: 0; padding: 4px; background: var(--bg-secondary); border-radius: var(--radius-md);">
              <button class="tab-btn active group-tab" data-group-tab="active" style="padding: 4px 12px; font-size: 13px;">Aktif</button>
              <button class="tab-btn group-tab" data-group-tab="passive" style="padding: 4px 12px; font-size: 13px;">Pasif</button>
            </div>
          </div>
          <div class="search-box" style="margin-bottom:16px;">
            <span class="search-icon">${icon('search', 15)}</span>
            <input type="text" id="group-search" placeholder="Grup ara..." style="width:100%;">
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
  `;

  return { html, init: (el, nav) => initStudentsAndGroups(el, nav) };
}

function renderStudentCards(students) {
  return students.map(s => {
    const avatarColor = getAvatarColor(s.name);
    return `
      <div class="premium-card person-card" data-student-id="${s.id}" style="padding: 16px; border-top: none; border-left: 4px solid ${avatarColor}; display:flex; align-items:center; gap: 16px; cursor: pointer;">
        <div class="person-avatar" style="background:${avatarColor}; width: 48px; height: 48px; border-radius: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); font-size: 18px; color:white; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
          ${getInitials(s.name)}
        </div>
        <div style="flex:1;min-width:0;">
          <div class="person-name" style="font-size: 15px; font-weight: 700; color: var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escHtml(s.name)}</div>
          <div class="person-sub" style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-top: 2px;">${s.grade}</div>
          <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
            <span class="badge" style="background: var(--brand-green-soft); color: var(--brand-green); font-size: 10px; padding: 2px 8px; border-radius: 6px;">${formatCurrency(s.rate)}/saat</span>
          </div>
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0;">
          <button class="btn btn-ghost btn-sm btn-icon" data-edit-student="${s.id}" style="border-radius: 8px;">${icon('edit', 14)}</button>
          <button class="btn btn-ghost btn-sm btn-icon" style="color:var(--danger); border-radius: 8px;" data-delete-student="${s.id}">${icon('trash', 14)}</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderGroupCards(groups) {
  const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  return groups.map(g => {
    const avatarColor = getAvatarColor(g.name);
    return `
      <div class="premium-card person-card" data-group-id="${g.id}" style="padding: 16px; border-top: none; border-left: 4px solid ${avatarColor}; display:flex; align-items:center; gap: 16px; cursor: pointer;">
        <div class="person-avatar" style="background:${avatarColor}; width: 48px; height: 48px; border-radius: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); font-size: 18px; color:white; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
          ${getGroupInitials(g.name)}
        </div>
        <div style="flex:1;min-width:0;">
          <div class="person-name" style="font-size: 15px; font-weight: 700; color: var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escHtml(g.name)}</div>
          <div class="person-sub" style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-top: 2px;">${g.grade} • ${days[g.dayOfWeek]} ${g.time}</div>
          <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
            <span class="badge" style="background: #f3e8ff; color: #6b21a8; font-size: 10px; padding: 2px 8px; border-radius: 6px;">${formatCurrency(g.rate)}/saat</span>
          </div>
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0;">
          <button class="btn btn-ghost btn-sm btn-icon" data-edit-group="${g.id}" style="border-radius: 8px;">${icon('edit', 14)}</button>
          <button class="btn btn-ghost btn-sm btn-icon" style="color:var(--danger); border-radius: 8px;" data-delete-group="${g.id}">${icon('trash', 14)}</button>
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

    grid.innerHTML = renderStudentCards(filtered);
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

    grid.innerHTML = renderGroupCards(filtered);
    if (empty) {
      empty.style.display = filtered.length === 0 ? 'flex' : 'none';
      empty.querySelector('h3').textContent = currentGroupTab === 'active' ? 'Henüz aktif grup eklenmedi' : 'Pasif grup bulunamadı';
    }
    initGroupCardEvents(container, navigate);
  }

  // Initial renders
  refreshStudentList();
  refreshGroupList();

  // Add button
  container.querySelector('#btn-add-new')?.addEventListener('click', () => {
    import('./modals/PlannerWizardModal.js').then(m => m.openPlannerWizard(() => navigate('studentsAndGroups')));
  });
}

function initStudentCardEvents(container, navigate) {
  container.querySelectorAll('[data-student-id]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-edit-student]') || e.target.closest('[data-delete-student]')) return;
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
      if (e.target.closest('[data-edit-group]') || e.target.closest('[data-delete-group]')) return;
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
