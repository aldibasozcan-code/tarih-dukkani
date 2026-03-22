// ═══════════════════════════════════════════════════
// GROUPS PAGE
// ═══════════════════════════════════════════════════
import { getState, deleteGroup } from '../store/store.js';
import { icon } from '../components/icons.js';
import { formatCurrency, getAvatarColor, getInitials, escHtml } from '../utils/helpers.js';
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

      <div id="tab-groups">
        <div class="search-box" style="margin-bottom:16px;">
          <span class="search-icon">${icon('search', 15)}</span>
          <input type="text" id="group-search" placeholder="Grup ara..." style="width:280px;">
        </div>
        <div class="grid grid-auto" id="groups-grid">
          ${renderGroupCards(state.groups)}
        </div>
        ${state.groups.length === 0 ? `
          <div class="empty-state">
            ${icon('groups', 40)}
            <h3>Henüz grup eklenmedi</h3>
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
      <div class="person-avatar" style="background:linear-gradient(135deg,var(--accent2),#5a4dcc);">
        ${getInitials(g.name)}
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
  // Group search
  container.querySelector('#group-search')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const state = getState();
    const filtered = state.groups.filter(g => g.name.toLowerCase().includes(q) || g.grade.toLowerCase().includes(q));
    const grid = container.querySelector('#groups-grid');
    if (grid) grid.innerHTML = renderGroupCards(filtered);
    initGroupCardEvents(container, navigate);
  });

  // Add group
  container.querySelector('#btn-add-group')?.addEventListener('click', () => {
    import('./modals/AddGroupModal.js').then(m => m.openAddGroupModal(() => navigate('groups')));
  });

  initGroupCardEvents(container, navigate);
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
      import('../store/store.js').then(m => {
        showConfirm({
          title: 'Grubu Sil',
          message: `"${g?.name}" grubu ve tüm dersleri silinecek.`,
          confirmText: 'Sil',
          type: 'danger',
          onConfirm: () => { m.deleteGroup(id); navigate('groups'); },
        });
      });
    });
  });
}
