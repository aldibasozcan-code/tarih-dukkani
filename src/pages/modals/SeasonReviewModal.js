import { getState, setState, updateStudent, updateGroup, updateSettings } from '../store/store.js';
import { icon } from '../components/icons.js';
import { openModal, closeModal } from '../components/modal.js';
import { escHtml } from '../utils/helpers.js';

export function openSeasonReviewModal() {
  const state = getState();
  const activeStudents = state.students.filter(s => (s.status || 'active') === 'active');
  const activeGroups = state.groups.filter(g => (g.status || 'active') === 'active');

  if (activeStudents.length === 0 && activeGroups.length === 0) {
    setState({ showSeasonReview: false });
    return;
  }

  openModal({
    title: 'Yeni Dönem Hazırlığı',
    size: 'xl',
    body: `
      <div style="margin-bottom:20px;">
        <p style="font-size:14px; color:var(--text-secondary); line-height:1.6;">
          Haziran ayı sonu itibariyle bir eğitim dönemini daha geride bıraktık. 
          Aşağıdaki listeden yeni dönemde **devam etmeyeceğiniz** öğrenci ve grupları "Pasif" hale getirerek ders trafiğinizi düzenleyebilirsiniz.
        </p>
      </div>

      <div class="review-section">
        <h3 style="font-size:15px; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
          ${icon('students', 16)} Aktif Öğrenciler
        </h3>
        <div class="review-list">
          ${activeStudents.map(s => `
            <div class="review-item card card-sm" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; padding:12px 16px;">
              <div>
                <div style="font-weight:700; font-size:14px;">${escHtml(s.name)}</div>
                <div style="font-size:12px; color:var(--text-muted);">${s.grade}</div>
              </div>
              <div class="review-actions" style="display:flex; gap:8px;">
                <label class="toggle-btn">
                  <input type="radio" name="status-s-${s.id}" value="active" checked>
                  <span>Devam Et</span>
                </label>
                <label class="toggle-btn toggle-passive">
                  <input type="radio" name="status-s-${s.id}" value="passive">
                  <span>Tamamla (Pasif)</span>
                </label>
              </div>
            </div>
          `).join('')}
          ${activeStudents.length === 0 ? '<p style="font-size:12px; color:var(--text-muted);">Aktif öğrenci bulunamadı.</p>' : ''}
        </div>
      </div>

      <div class="review-section" style="margin-top:24px;">
        <h3 style="font-size:15px; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
          ${icon('groups', 16)} Aktif Gruplar
        </h3>
        <div class="review-list">
          ${activeGroups.map(g => `
            <div class="review-item card card-sm" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; padding:12px 16px;">
              <div>
                <div style="font-weight:700; font-size:14px;">${escHtml(g.name)}</div>
                <div style="font-size:12px; color:var(--text-muted);">${g.grade}</div>
              </div>
              <div class="review-actions" style="display:flex; gap:8px;">
                <label class="toggle-btn">
                  <input type="radio" name="status-g-${g.id}" value="active" checked>
                  <span>Devam Et</span>
                </label>
                <label class="toggle-btn toggle-passive">
                  <input type="radio" name="status-g-${g.id}" value="passive">
                  <span>Tamamla (Pasif)</span>
                </label>
              </div>
            </div>
          `).join('')}
          ${activeGroups.length === 0 ? '<p style="font-size:12px; color:var(--text-muted);">Aktif grup bulunamadı.</p>' : ''}
        </div>
      </div>

      <style>
        .toggle-btn {
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
        }
        .toggle-btn input { display: none; }
        .toggle-btn span {
          display: block;
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-muted);
          transition: all 0.2s;
        }
        .toggle-btn input:checked + span {
          background: var(--brand-green);
          color: #fff;
          border-color: var(--brand-green);
        }
        .toggle-passive input:checked + span {
          background: var(--danger);
          border-color: var(--danger);
        }
      </style>
    `,
    footer: `
      <button class="btn btn-secondary" id="btn-review-skip">Daha Sonra</button>
      <button class="btn btn-primary" id="btn-review-save">${icon('check', 14)} Değişiklikleri Uygula</button>
    `
  });

  document.getElementById('btn-review-skip')?.addEventListener('click', () => {
    setState({ showSeasonReview: false });
    closeModal();
  });

  document.getElementById('btn-review-save')?.addEventListener('click', () => {
    const sUpdates = activeStudents.map(s => ({
      id: s.id,
      status: document.querySelector(`input[name="status-s-${s.id}"]:checked`).value
    }));

    const gUpdates = activeGroups.map(g => ({
      id: g.id,
      status: document.querySelector(`input[name="status-g-${g.id}"]:checked`).value
    }));

    // Apply updates
    sUpdates.forEach(upd => {
      if (upd.status === 'passive') updateStudent(upd.id, { status: 'passive' });
    });
    gUpdates.forEach(upd => {
      if (upd.status === 'passive') updateGroup(upd.id, { status: 'passive' });
    });

    setState({ showSeasonReview: false });
    closeModal();
    
    // Refresh current view if possible
    window.location.reload(); 
  });
}
