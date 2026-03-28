// ═════════════════════════════════════════════════
// ADD GROUP MODAL
// ═════════════════════════════════════════════════
import { getState, addGroup, updateGroup } from '../../store/store.js';
import { ALL_GRADES, DAYS_TR } from '../../data/curriculum.js';
import { openModal, closeModal } from '../../components/modal.js';
import { escHtml } from '../../utils/helpers.js';

export function openAddGroupModal(onSave, editId = null) {
  const group = editId ? getState().groups.find(g => g.id === editId) : null;

  openModal({
    title: group ? 'Grubu Düzenle' : 'Yeni Grup Ekle',
    body: `
      <div class="form-group">
        <label>Grup Adı *</label>
        <input type="text" id="g-name" value="${escHtml(group?.name || '')}" placeholder="Örn: Kunduz 8A">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Sınıf *</label>
          <select id="g-grade">
            <option value="">Sınıf seçin</option>
            ${ALL_GRADES.map(g => `<option value="${g}" ${group?.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Saatlik Ücret (₺)</label>
          <input type="number" id="g-rate" value="${group?.rate || 300}" min="0" step="50">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Ders Günü *</label>
          <select id="g-day">
            ${DAYS_TR.map((d, i) => `<option value="${i}" ${group?.dayOfWeek === i ? 'selected' : ''}>${d}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Ders Saati *</label>
          <input type="time" id="g-time" value="${group?.time || '14:00'}">
        </div>
      </div>
      <div class="form-group">
        <label>Ders Süresi (dakika)</label>
        <input type="number" id="g-duration" value="${group?.duration || 60}" min="30" step="30">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Zoom Linki (opsiyonel)</label>
          <input type="url" id="g-zoom" value="${escHtml(group?.zoomLink || '')}" placeholder="https://zoom.us/j/...">
        </div>
        <div class="form-group">
          <label>Durum</label>
          <select id="g-status">
            <option value="active" ${group?.status === 'active' ? 'selected' : ''}>Aktif</option>
            <option value="passive" ${group?.status === 'passive' ? 'selected' : ''}>Pasif</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Notlar</label>
        <textarea id="g-notes" rows="2">${escHtml(group?.notes || '')}</textarea>
      </div>
      ${!group ? '<div style="padding:10px;background:rgba(124,106,255,0.08);border-radius:8px;font-size:12px;color:var(--accent2);">Grup eklenince seçilen gün ve saatte 52 hafta boyunca haftalık ders otomatik oluşturulacak.</div>' : ''}
    `,
    footer: `
      <button class="btn btn-secondary" id="g-cancel">İptal</button>
      <button class="btn btn-primary" id="g-save">${group ? 'Güncelle' : 'Ekle'}</button>
    `,
  });

  document.getElementById('g-cancel')?.addEventListener('click', closeModal);
  document.getElementById('g-save')?.addEventListener('click', () => {
    const name = document.getElementById('g-name').value.trim();
    const grade = document.getElementById('g-grade').value;
    if (!name || !grade) { alert('Grup adı ve sınıf zorunludur.'); return; }

    const data = {
      name,
      grade,
      dayOfWeek: parseInt(document.getElementById('g-day').value),
      time: document.getElementById('g-time').value,
      duration: parseInt(document.getElementById('g-duration').value) || 60,
      rate: parseFloat(document.getElementById('g-rate').value) || 300,
      zoomLink: document.getElementById('g-zoom').value.trim(),
      notes: document.getElementById('g-notes').value.trim(),
      status: document.getElementById('g-status').value,
    };

    if (group) {
      updateGroup(editId, data);
    } else {
      addGroup(data);
    }
    closeModal();
    if (onSave) onSave();
  });
}
