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
  return groups.map(g => {
    const avatarColor = getAvatarColor(g.name);
    return `
      <div class="premium-card person-card" data-group-id="${g.id}" style="padding: 24px; border-top: none; border-left: 5px solid ${avatarColor};">
        <div class="person-avatar" style="background:${avatarColor}; width: 60px; height: 60px; border-radius: 18px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); font-size: 20px;">
          ${getGroupInitials(g.name)}
        </div>
        <div style="flex:1;min-width:0;">
          <div class="person-name" style="font-size: 18px; font-weight: 800; color: var(--text-primary);">${escHtml(g.name)}</div>
          <div class="person-sub" style="font-size: 13px; font-weight: 600; color: var(--text-muted); margin-top: 2px;">${g.grade} • ${days[g.dayOfWeek]} ${g.time}</div>
          <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
            <span class="badge" style="background: #f3e8ff; color: #6b21a8; font-size: 11px; padding: 4px 10px; border-radius: 8px;">${formatCurrency(g.rate)}/saat</span>
            ${g.zoomLink ? '<span class="badge" style="background: #ecfdf5; color: #065f46; font-size: 11px; padding: 4px 10px; border-radius: 8px;">Zoom ✓</span>' : '<span class="badge" style="background: #fef3c7; color: #92400e; font-size: 11px; padding: 4px 10px; border-radius: 8px;">Zoom bekleniyor</span>'}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end;">
          <button class="btn btn-ghost btn-sm btn-icon" data-edit-group="${g.id}" style="border-radius: 10px; background: var(--bg-secondary);">${icon('edit', 14)}</button>
          <button class="btn btn-ghost btn-sm btn-icon" style="color:var(--danger); border-radius: 10px; background: #fff1f2;" data-delete-group="${g.id}">${icon('trash', 14)}</button>
        </div>
      </div>
    `;
  }).join('');
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
