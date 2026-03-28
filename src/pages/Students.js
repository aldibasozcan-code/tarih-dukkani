// ═══════════════════════════════════════════════════
// STUDENTS PAGE
// ═══════════════════════════════════════════════════
import { getState, deleteStudent } from '../store/store.js';
import { icon } from '../components/icons.js';
import { formatCurrency, getAvatarColor, getInitials, escHtml } from '../utils/helpers.js';
import { showConfirm } from '../components/modal.js';

export function renderStudents(navigate) {
  const state = getState();

  const html = `
    <div class="fade-in">
      <div class="page-header">
        <div>
          <h2>Öğrenciler</h2>
          <p>Öğrenci listesi ve yönetimi</p>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-primary" id="btn-add-student">${icon('plus', 14)} Öğrenci Ekle</button>
        </div>
      </div>

      <div class="tabs" style="margin-bottom:20px;">
        <button class="tab-btn active" data-tab="active">Aktif Öğrenciler</button>
        <button class="tab-btn" data-tab="passive">Pasif Öğrenciler</button>
      </div>

      <div id="tab-students">
        <div class="search-box" style="margin-bottom:16px;">
          <span class="search-icon">${icon('search', 15)}</span>
          <input type="text" id="student-search" placeholder="Öğrenci ara..." style="width:280px;">
        </div>
        <div class="grid grid-auto" id="students-grid">
          ${renderStudentCards(state.students.filter(s => (s.status || 'active') === 'active'))}
        </div>
        ${state.students.filter(s => (s.status || 'active') === 'active').length === 0 ? `
          <div class="empty-state" id="students-empty">
            ${icon('students', 40)}
            <h3>Henüz aktif öğrenci eklenmedi</h3>
            <p>Yeni öğrenci eklemek için butona tıklayın</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  return { html, init: (el, nav) => initStudents(el, nav) };
}

function renderStudentCards(students) {
  return students.map(s => `
    <div class="person-card" data-student-id="${s.id}">
      <div class="person-avatar" style="background:${getAvatarColor(s.name)}">
        ${getInitials(s.name)}
      </div>
      <div style="flex:1;min-width:0;">
        <div class="person-name">${escHtml(s.name)}</div>
        <div class="person-sub">${s.grade}</div>
        <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
          <span class="badge badge-info">${formatCurrency(s.rate)}/s</span>
          <span class="badge badge-muted">${s.completedTopics?.length || 0} konu ✓</span>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end;">
        <button class="btn btn-ghost btn-sm btn-icon" data-edit-student="${s.id}">${icon('edit', 13)}</button>
        <button class="btn btn-ghost btn-sm btn-icon" style="color:var(--danger);" data-delete-student="${s.id}">${icon('trash', 13)}</button>
      </div>
    </div>
  `).join('');
}
function initStudents(container, navigate) {
  initStudentCardEvents(container, navigate);

  // Status Tabs
  let currentTab = 'active';
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.dataset.tab;
      refreshList();
    });
  });

  // Student search
  const searchInp = container.querySelector('#student-search');
  searchInp?.addEventListener('input', () => refreshList());

  function refreshList() {
    const q = searchInp.value.toLowerCase();
    const state = getState();
    const grid = container.querySelector('#students-grid');
    const empty = container.querySelector('#students-empty');
    if (!grid) return;

    const filtered = state.students.filter(s => {
      const matchStatus = (s.status || 'active') === currentTab;
      const matchSearch = s.name.toLowerCase().includes(q) || s.grade.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });

    grid.innerHTML = renderStudentCards(filtered);
    if (empty) {
      empty.style.display = filtered.length === 0 ? 'flex' : 'none';
      empty.querySelector('h3').textContent = currentTab === 'active' ? 'Henüz aktif öğrenci eklenmedi' : 'Pasif öğrenci bulunamadı';
    }
    initStudentCardEvents(container, navigate);
  }

  // Add student
  container.querySelector('#btn-add-student')?.addEventListener('click', () => {
    import('./modals/AddStudentModal.js').then(m => m.openAddStudentModal(() => navigate('students')));
  });
}

function initStudentCardEvents(container, navigate) {
  // Student detail
  container.querySelectorAll('[data-student-id]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-edit-student]') || e.target.closest('[data-delete-student]')) return;
      const id = card.dataset.studentId;
      import('./modals/StudentDetailModal.js').then(m => m.openStudentDetail(id, navigate));
    });
  });

  // Edit student
  container.querySelectorAll('[data-edit-student]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      import('./modals/AddStudentModal.js').then(m => m.openAddStudentModal(() => navigate('students'), btn.dataset.editStudent));
    });
  });

  // Delete student
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
          navigate('students'); 
        },
      });
    });
  });
}
