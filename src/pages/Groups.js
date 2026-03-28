// ═══════════════════════════════════════════════════
// GROUPS PAGE
// ═══════════════════════════════════════════════════
import { getState, deleteGroup } from '../store/store.js';
import { icon } from '../components/icons.js';
import { formatCurrency, getAvatarColor, getInitials, getGroupInitials, escHtml } from '../utils/helpers.js';
import { showConfirm } from '../components/modal.js';

export function renderGroups(navigate) {
  const state = getState();

  const html = `
    <div class="fade-in">
      <div class="page-header">
        <div>
          <h2>Gruplar</h2>
          <p>Grup listesi ve yönetimi</p>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-secondary" id="btn-add-group">${icon('plus', 14)} Grup Ekle</button>
        </div>
      </div>

      <div class="tabs" style="margin-bottom:20px;">
        <button class="tab-btn active" data-tab="active">Aktif Gruplar</button>
        <button class="tab-btn" data-tab="passive">Pasif Gruplar</button>
      </div>

      <div id="tab-groups">
        <div class="search-box" style="margin-bottom:16px;">
          <span class="search-icon">${icon('search', 15)}</span>
          <input type="text" id="group-search" placeholder="Grup ara..." style="width:280px;">
        </div>
        <div class="grid grid-auto" id="groups-grid">
          ${renderGroupCards(state.groups.filter(g => (g.status || 'active') === 'active'))}
        </div>
        ${state.groups.filter(g => (g.status || 'active') === 'active').length === 0 ? `
          <div class="empty-state" id="groups-empty">
            ${icon('groups', 40)}
            <h3>Henüz aktif grup eklenmedi</h3>
            <p>Yeni grup eklemek için butona tıklayın</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  return { html, init: (el, nav) => initGroups(el, nav) };
}

function renderGroupCards(groups) {
  const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  return groups.map(g => `
    <div class="person-card" data-group-id="${g.id}">
      <div class="person-avatar" style="background:${getAvatarColor(g.name)}">
        ${getGroupInitials(g.name)}
      </div>
      <div style="flex:1;min-width:0;">
        <div class="person-name">${escHtml(g.name)}</div>
        <div class="person-sub">${g.grade} • ${days[g.dayOfWeek]} ${g.time}</div>
        <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
          <span class="badge badge-purple">${formatCurrency(g.rate)}/s</span>
          ${g.zoomLink ? '<span class="badge badge-success">Zoom ✓</span>' : '<span class="badge badge-muted">Zoom bekleniyor</span>'}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end;">
        <button class="btn btn-ghost btn-sm btn-icon" data-edit-group="${g.id}">${icon('edit', 13)}</button>
        <button class="btn btn-ghost btn-sm btn-icon" style="color:var(--danger);" data-delete-group="${g.id}">${icon('trash', 13)}</button>
      </div>
    </div>
  `).join('');
}
function initGroups(container, navigate) {
  initGroupCardEvents(container, navigate);

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

  // Group search
  const searchInp = container.querySelector('#group-search');
  searchInp?.addEventListener('input', () => refreshList());

  function refreshList() {
    const q = searchInp.value.toLowerCase();
    const state = getState();
    const grid = container.querySelector('#groups-grid');
    const empty = container.querySelector('#groups-empty');
    if (!grid) return;

    const filtered = state.groups.filter(g => {
      const matchStatus = (g.status || 'active') === currentTab;
      const matchSearch = g.name.toLowerCase().includes(q) || g.grade.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });

    grid.innerHTML = renderGroupCards(filtered);
    if (empty) {
      empty.style.display = filtered.length === 0 ? 'flex' : 'none';
      empty.querySelector('h3').textContent = currentTab === 'active' ? 'Henüz aktif grup eklenmedi' : 'Pasif grup bulunamadı';
    }
    initGroupCardEvents(container, navigate);
  }

  // Add group
  container.querySelector('#btn-add-group')?.addEventListener('click', () => {
    import('./modals/AddGroupModal.js').then(m => m.openAddGroupModal(() => navigate('groups')));
  });
}

function initGroupCardEvents(container, navigate) {
  // Group detail
  container.querySelectorAll('[data-group-id]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-edit-group]') || e.target.closest('[data-delete-group]')) return;
      const id = card.dataset.groupId;
      import('./modals/GroupDetailModal.js').then(m => m.openGroupDetail(id, navigate));
    });
  });

  // Edit group
  container.querySelectorAll('[data-edit-group]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      import('./modals/AddGroupModal.js').then(m => m.openAddGroupModal(() => navigate('groups'), btn.dataset.editGroup));
    });
  });

  // Delete group
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
          navigate('groups'); 
        },
      });
    });
  });
}
