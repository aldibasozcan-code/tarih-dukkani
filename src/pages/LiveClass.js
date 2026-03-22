// ═════════════════════════════════════════════════
// LIVE CLASS PAGE
// ═════════════════════════════════════════════════
import { getState, updateStudent, updateGroup } from '../store/store.js';
import { icon } from '../components/icons.js';
import { escHtml, getAvatarColor, getInitials } from '../utils/helpers.js';
import { openModal, closeModal } from '../components/modal.js';

export function renderLiveClass(navigate) {
  const state = getState();

  const html = `
    <div class="fade-in">
      <div class="page-header">
        <div>
          <h2>Canlı Sınıf</h2>
          <p>Ders linkleri - Google Meet & Zoom</p>
        </div>
      </div>

      <div class="grid grid-2" style="align-items:start;">
        <!-- Students - Google Meet -->
        <div>
          <div class="section-title" style="margin-bottom:12px;">
            <h3 style="display:flex;align-items:center;gap:8px;">
              <span style="color:#1a73e8;">●</span> Google Meet - Bireysel Dersler
            </h3>
          </div>
          ${state.students.length === 0 ? `<div class="empty-state">${icon('video', 32)}<p>Öğrenci yok</p></div>` : ''}
          ${state.students.map(s => `
            <div class="card" style="margin-bottom:10px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <div class="person-avatar" style="background:${getAvatarColor(s.name)};border-radius:10px;">
                  ${getInitials(s.name)}
                </div>
                <div style="flex:1;">
                  <div style="font-weight:600;">${escHtml(s.name)}</div>
                  <div style="font-size:12px;color:var(--text-muted);">${s.grade}</div>
                </div>
                <div style="display:flex;gap:8px;align-items:center;">
                  ${s.meetLink ? `
                    <a href="${escHtml(s.meetLink)}" target="_blank" class="btn btn-primary btn-sm">
                      ${icon('video', 13)} Katıl
                    </a>
                    <button class="btn btn-ghost btn-sm btn-icon" data-edit-meet="${s.id}">${icon('edit', 13)}</button>
                  ` : `
                    <button class="btn btn-secondary btn-sm" data-edit-meet="${s.id}">${icon('plus', 13)} Link Ekle</button>
                  `}
                </div>
              </div>
              ${s.meetLink ? `
                <div style="margin-top:8px;padding:8px;background:rgba(255,255,255,0.03);border-radius:8px;display:flex;align-items:center;gap:8px;">
                  <span style="font-size:11px;color:var(--text-muted);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(s.meetLink)}</span>
                  <button class="btn btn-ghost btn-sm btn-icon" onclick="navigator.clipboard.writeText('${escHtml(s.meetLink)}')">
                    ${icon('copy', 11)}
                  </button>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Groups - Zoom -->
        <div>
          <div class="section-title" style="margin-bottom:12px;">
            <h3 style="display:flex;align-items:center;gap:8px;">
              <span style="color:#2d8cff;">●</span> Zoom - Kunduz Akademi Grupları
            </h3>
          </div>
          ${state.groups.length === 0 ? `<div class="empty-state">${icon('video', 32)}<p>Grup yok</p></div>` : ''}
          ${state.groups.map(g => {
            const days = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];
            return `
              <div class="card" style="margin-bottom:10px;">
                <div style="display:flex;align-items:center;gap:12px;">
                  <div class="person-avatar" style="background:linear-gradient(135deg,#2d8cff,#1a5fb8);border-radius:10px;">
                    ${getInitials(g.name)}
                  </div>
                  <div style="flex:1;">
                    <div style="font-weight:600;">${escHtml(g.name)}</div>
                    <div style="font-size:12px;color:var(--text-muted);">${g.grade} • ${days[g.dayOfWeek]} ${g.time}</div>
                  </div>
                  <div style="display:flex;gap:8px;align-items:center;">
                    ${g.zoomLink ? `
                      <a href="${escHtml(g.zoomLink)}" target="_blank" class="btn btn-sm" style="background:#2d8cff;color:#fff;">
                        ${icon('video', 13)} Zoom
                      </a>
                    ` : ''}
                    <button class="btn btn-secondary btn-sm" data-edit-zoom="${g.id}">${g.zoomLink ? icon('edit', 13) : icon('plus', 13)} Zoom</button>
                  </div>
                </div>
                ${g.zoomLink ? `
                  <div style="margin-top:8px;padding:8px;background:rgba(255,255,255,0.03);border-radius:8px;">
                    <span style="font-size:11px;color:var(--text-muted);">${escHtml(g.zoomLink)}</span>
                  </div>
                ` : `
                  <div style="margin-top:8px;padding:8px;background:rgba(255,159,67,0.08);border-radius:8px;border:1px dashed var(--warning);">
                    <span style="font-size:11px;color:var(--warning);">Haftalık Zoom linki henüz eklenmedi</span>
                  </div>
                `}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  return {
    html,
    init: (el, nav) => {
      // Edit Meet link
      el.querySelectorAll('[data-edit-meet]').forEach(btn => {
        btn.addEventListener('click', () => {
          const s = getState().students.find(x => x.id === btn.dataset.editMeet);
          openModal({
            title: 'Google Meet Linki Güncelle',
            body: `
              <div class="form-group">
                <label>Öğrenci: ${escHtml(s?.name)}</label>
                <input type="url" id="meet-link-input" value="${escHtml(s?.meetLink || '')}" placeholder="https://meet.google.com/...">
              </div>
            `,
            footer: `
              <button class="btn btn-secondary" id="meet-cancel">İptal</button>
              <button class="btn btn-primary" id="meet-save">Kaydet</button>
            `,
          });
          document.getElementById('meet-cancel')?.addEventListener('click', closeModal);
          document.getElementById('meet-save')?.addEventListener('click', () => {
            updateStudent(btn.dataset.editMeet, { meetLink: document.getElementById('meet-link-input').value.trim() });
            closeModal();
            nav('liveClass');
          });
        });
      });

      // Edit Zoom link
      el.querySelectorAll('[data-edit-zoom]').forEach(btn => {
        btn.addEventListener('click', () => {
          const g = getState().groups.find(x => x.id === btn.dataset.editZoom);
          openModal({
            title: 'Zoom Linki Güncelle',
            body: `
              <div class="form-group">
                <label>Grup: ${escHtml(g?.name)}</label>
                <input type="url" id="zoom-link-input" value="${escHtml(g?.zoomLink || '')}" placeholder="https://zoom.us/j/...">
              </div>
              <p style="font-size:12px;color:var(--text-muted);">Bu link her hafta değişebilir. Güncel linki buraya ekleyin.</p>
            `,
            footer: `
              <button class="btn btn-secondary" id="zoom-cancel">İptal</button>
              <button class="btn btn-primary" id="zoom-save">Kaydet</button>
            `,
          });
          document.getElementById('zoom-cancel')?.addEventListener('click', closeModal);
          document.getElementById('zoom-save')?.addEventListener('click', () => {
            updateGroup(btn.dataset.editZoom, { zoomLink: document.getElementById('zoom-link-input').value.trim() });
            closeModal();
            nav('liveClass');
          });
        });
      });
    }
  };
}
