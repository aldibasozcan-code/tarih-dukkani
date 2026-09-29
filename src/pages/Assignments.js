import { getState, updateAssignment, deleteAssignment } from '../store/store.js';
import { icon } from '../components/icons.js';
import { escHtml, getLocalDateStr } from '../utils/helpers.js';
import { openModal, closeModal } from '../components/modal.js';

export function renderAssignments(navigate) {
  const state = getState();
  const assignments = state.assignments || [];

  const html = `
    <div class="fade-in">
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div>
          <h2>Ödev Takibi</h2>
          <p>Öğrenci ve gruplara verilen ödevleri buradan yönetin</p>
        </div>
      </div>

      <!-- TABS -->
      <div style="display:flex; gap:16px; margin-bottom:24px; border-bottom:1px solid var(--border); overflow-x:auto;" class="hide-scrollbar">
        <button class="nav-item assignment-tab active" data-tab="pending" style="padding-bottom:12px; border-bottom:2px solid transparent;">
          <span style="display:flex;align-items:center;gap:6px;">${icon('bell', 16)} Ödev Bekleyenler (Hatırlatmalar)</span>
        </button>
        <button class="nav-item assignment-tab" data-tab="assigned" style="padding-bottom:12px; border-bottom:2px solid transparent;">
          <span style="display:flex;align-items:center;gap:6px;">${icon('clock', 16)} Devam Edenler</span>
        </button>
        <button class="nav-item assignment-tab" data-tab="completed" style="padding-bottom:12px; border-bottom:2px solid transparent;">
          <span style="display:flex;align-items:center;gap:6px;">${icon('check', 16)} Yapılanlar / Geçmiş</span>
        </button>
      </div>

      <div id="assignments-content">
        <!-- Injected via JS -->
      </div>
    </div>
  `;

  return {
    html,
    init: (el, nav) => {
      let currentTab = 'pending';

      const tabBtns = el.querySelectorAll('.assignment-tab');
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          tabBtns.forEach(b => {
            b.classList.remove('active');
            b.style.borderBottomColor = 'transparent';
          });
          btn.classList.add('active');
          btn.style.borderBottomColor = 'var(--brand-green)';
          currentTab = btn.dataset.tab;
          refreshList();
        });
      });

      // trigger initial active state style
      const activeTab = el.querySelector('.assignment-tab.active');
      if (activeTab) activeTab.style.borderBottomColor = 'var(--brand-green)';

      function refreshList() {
        const contentEl = el.querySelector('#assignments-content');
        if (!contentEl) return;

        const currentState = getState();
        const all = currentState.assignments || [];

        let filtered = [];
        if (currentTab === 'pending') {
          filtered = all.filter(a => a.status === 'pending');
        } else if (currentTab === 'assigned') {
          filtered = all.filter(a => a.status === 'assigned');
        } else if (currentTab === 'completed') {
          filtered = all.filter(a => ['completed', 'not_completed'].includes(a.status));
        }

        if (filtered.length === 0) {
          contentEl.innerHTML = `
            <div class="empty-state">
              ${icon('book', 48)}
              <p>Bu kategoride kayıt bulunamadı.</p>
            </div>
          `;
          return;
        }

        contentEl.innerHTML = `
          <div style="display:grid; grid-template-columns:1fr; gap:12px;">
            ${filtered.map(a => renderAssignmentCard(a, currentState)).join('')}
          </div>
        `;

        bindCardEvents(contentEl);
      }

      function renderAssignmentCard(a, state) {
        let entityName = 'Bilinmiyor';
        let grade = '';
        if (a.type === 'student') {
          const s = state.students.find(x => x.id === a.refId);
          if (s) { entityName = s.name; grade = s.grade; }
        } else {
          const g = state.groups.find(x => x.id === a.refId);
          if (g) { entityName = g.name; grade = g.grade; }
        }

        const dateLabel = a.status === 'pending' ? 'Ünite Bitiş:' : (a.status === 'assigned' ? 'Teslim:' : 'Tarih:');
        const dateValue = a.status === 'pending' ? a.createdDate : (a.dueDate || '-');

        let statusBadge = '';
        if (a.status === 'pending') statusBadge = `<span class="badge" style="background:rgba(255,159,67,0.1);color:var(--warning);">Hatırlatma</span>`;
        if (a.status === 'assigned') statusBadge = `<span class="badge" style="background:rgba(45,140,255,0.1);color:#2d8cff;">Devam Ediyor</span>`;
        if (a.status === 'completed') statusBadge = `<span class="badge" style="background:rgba(16,185,129,0.1);color:var(--success);">Yapıldı</span>`;
        if (a.status === 'not_completed') statusBadge = `<span class="badge" style="background:rgba(234,84,85,0.1);color:var(--danger);">Yapılmadı</span>`;

        return `
          <div class="card hover-lift" style="display:flex; align-items:center; gap:16px; padding:16px; border-left:4px solid ${a.status === 'pending' ? 'var(--warning)' : (a.status === 'assigned' ? '#2d8cff' : (a.status === 'completed' ? 'var(--success)' : 'var(--danger)'))};">
            <div style="flex:1;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <span style="font-weight:700; font-size:15px; color:var(--text-primary);">${escHtml(entityName)}</span>
                <span style="font-size:12px; color:var(--text-muted);">${grade}</span>
                ${statusBadge}
              </div>
              <div style="font-size:13px; color:var(--text-secondary); margin-bottom:8px;">
                <strong>Ünite:</strong> ${escHtml(a.unit || 'Belirtilmedi')}
              </div>
              ${a.description ? `<div style="font-size:13px; color:var(--text-primary); background:var(--bg-secondary); padding:8px 12px; border-radius:8px;">${escHtml(a.description)}</div>` : ''}
            </div>
            
            <div style="text-align:right; min-width:120px;">
              <div style="font-size:11px; color:var(--text-muted); margin-bottom:4px;">${dateLabel}</div>
              <div style="font-size:13px; font-weight:600; color:var(--text-primary);">${dateValue}</div>
            </div>

            <div style="display:flex; gap:6px;">
              ${a.status === 'pending' ? `
                <button class="btn btn-primary btn-sm btn-action" data-action="give" data-id="${a.id}">Ödev Ver</button>
              ` : ''}
              ${a.status === 'assigned' ? `
                <button class="btn btn-sm btn-action" style="background:var(--success); color:white;" data-action="complete" data-id="${a.id}">${icon('check', 14)} Yapıldı</button>
                <button class="btn btn-sm btn-action" style="background:var(--danger); color:white;" data-action="fail" data-id="${a.id}">${icon('x', 14)} Yapılmadı</button>
              ` : ''}
              <button class="btn btn-ghost btn-icon btn-sm btn-action" data-action="edit" data-id="${a.id}" title="Düzenle">${icon('edit', 14)}</button>
              <button class="btn btn-ghost btn-icon btn-sm btn-action" data-action="delete" data-id="${a.id}" style="color:var(--danger);" title="Sil">${icon('trash', 14)}</button>
            </div>
          </div>
        `;
      }

      function bindCardEvents(container) {
        container.querySelectorAll('.btn-action').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            const id = e.currentTarget.dataset.id;
            const a = getState().assignments.find(x => x.id === id);
            if (!a) return;

            if (action === 'give') {
              openAssignmentModal(a, 'give');
            } else if (action === 'edit') {
              openAssignmentModal(a, 'edit');
            } else if (action === 'complete') {
              updateAssignment(id, { status: 'completed' });
              nav('assignments', true);
            } else if (action === 'fail') {
              updateAssignment(id, { status: 'not_completed' });
              nav('assignments', true);
            } else if (action === 'delete') {
              if (confirm('Bu ödev kaydını silmek istediğinize emin misiniz?')) {
                deleteAssignment(id);
                nav('assignments', true);
              }
            }
          });
        });
      }

      function openAssignmentModal(a, mode) {
        const title = mode === 'give' ? 'Ödev Ver' : 'Ödevi Düzenle';
        openModal({
          title,
          body: `
            <div class="form-group">
              <label>Teslim Tarihi</label>
              <input type="date" id="asm-due" class="pm-input" value="${a.dueDate || getLocalDateStr(new Date())}">
            </div>
            <div class="form-group">
              <label>Ödev İçeriği / Notlar</label>
              <textarea id="asm-desc" class="pm-input" style="height:100px;">${a.description || ''}</textarea>
            </div>
          `,
          footer: `
            <button class="btn btn-secondary" id="asm-cancel">İptal</button>
            <button class="btn btn-primary" id="asm-save">Kaydet</button>
          `
        });

        document.getElementById('asm-cancel').addEventListener('click', closeModal);
        document.getElementById('asm-save').addEventListener('click', () => {
          const due = document.getElementById('asm-due').value;
          const desc = document.getElementById('asm-desc').value;
          updateAssignment(a.id, {
            status: mode === 'give' ? 'assigned' : a.status,
            dueDate: due,
            description: desc
          });
          closeModal();
          nav('assignments', true);
        });
      }

      refreshList();
    }
  };
}
