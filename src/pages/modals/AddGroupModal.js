// ═════════════════════════════════════════════════
// ADD GROUP MODAL
// ═════════════════════════════════════════════════
import { getState, addGroup, updateGroup } from '../../store/store.js';
import { ALL_GRADES, DAYS_TR } from '../../data/curriculum.js';
import { openModal, closeModal } from '../../components/modal.js';
import { escHtml, todayStr, getLocalDateStr, addDays } from '../../utils/helpers.js';

export function openAddGroupModal(onSave, editId = null) {
  const state = getState();
  const group = editId ? state.groups.find(g => g.id === editId) : null;

  openModal({
    title: group ? 'Grubu Düzenle' : 'Yeni Grup Ekle',
    size: 'lg',
    body: `
      <div id="g-error-alert" class="login-alert error" style="display: none; margin-bottom: 20px;"></div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Grup Adı *</label>
          <input type="text" id="g-name" value="${escHtml(group?.name || '')}" placeholder="Örn: KPSS Lisans Grubu">
        </div>
        <div class="form-group">
          <label>Sınıf/Seviye *</label>
          <select id="g-grade">
            <option value="" disabled ${!group ? 'selected' : ''}>Sınıf seçin...</option>
            ${ALL_GRADES.map(g => `<option value="${g}" ${group?.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-row-3">
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
        <div class="form-group">
          <label>Ders Süresi (Dakika)</label>
          <input type="number" id="g-duration" value="${group?.duration || 60}" min="10" step="5">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Saatlik Ücret (₺)</label>
          <input type="number" id="g-rate" value="${group?.rate || 300}" min="0" step="50">
        </div>
        <div class="form-group">
          <label>Durum</label>
          <select id="g-status">
            <option value="active" ${group?.status === 'active' ? 'selected' : ''}>Aktif</option>
            <option value="passive" ${group?.status === 'passive' ? 'selected' : ''}>Pasif</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Ders İşleme Biçimi</label>
          <select id="g-format">
            <option value="zoom" ${group?.lessonFormat === 'zoom' || (!group?.lessonFormat && group?.zoomLink) ? 'selected' : ''}>Online (Zoom)</option>
            <option value="meet" ${group?.lessonFormat === 'meet' ? 'selected' : ''}>Online (Google Meet)</option>
            <option value="face" ${group?.lessonFormat === 'face' ? 'selected' : ''}>Yüzyüze</option>
          </select>
        </div>
        <div class="form-group">
          <label id="g-link-label">${(group?.lessonFormat === 'face') ? 'Ders Konumu' : 'Ders Linki'}</label>
          <input type="text" id="g-link" value="${escHtml(group?.lessonLink || group?.zoomLink || '')}" placeholder="${(group?.lessonFormat === 'face') ? 'Örn: Kadıköy Ofis' : 'https://...' }">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Başlangıç Tarihi *</label>
          <input type="date" id="g-start" value="${group?.startDate || todayStr()}">
        </div>
        <div class="form-group">
          <label>Bitiş Tarihi *</label>
          <input type="date" id="g-end" value="${group?.endDate || getLocalDateStr(addDays(new Date(), 240))}">
        </div>
      </div>

      <div class="form-group">
        <label>Notlar</label>
        <textarea id="g-notes" rows="2" placeholder="Grup hakkında notlar...">${escHtml(group?.notes || '')}</textarea>
      </div>

      ${!group ? `
        <div style="padding:16px; background:rgba(5, 150, 105, 0.05); border:1px solid rgba(5, 150, 105, 0.1); border-radius:12px; font-size:13px; color:var(--brand-green-light); display:flex; gap:12px; align-items:flex-start;">
          <div style="margin-top:2px;">ℹ️</div>
          <div>Grup eklendiğinde, seçilen tarih aralığında ve saatte haftalık dersler otomatik olarak takviminize işlenecektir.</div>
        </div>
      ` : ''}
    `,
    footer: `
      <button class="btn btn-secondary" id="g-cancel">İptal</button>
      <button class="btn btn-primary" id="g-save">${group ? 'Güncelle' : 'Ekle'}</button>
    `,
  });

  const errorAlert = document.getElementById('g-error-alert');
  const saveBtn = document.getElementById('g-save');

  const formatSel = document.getElementById('g-format');
  const linkLabel = document.getElementById('g-link-label');
  const linkInp = document.getElementById('g-link');

  formatSel?.addEventListener('change', () => {
    const val = formatSel.value;
    if (val === 'face') {
      linkLabel.textContent = 'Ders Konumu';
      linkInp.placeholder = 'Örn: Kadıköy Ofis';
    } else {
      linkLabel.textContent = 'Ders Linki';
      linkInp.placeholder = 'https://...';
    }
  });

  document.getElementById('g-cancel')?.addEventListener('click', closeModal);
  
  saveBtn?.addEventListener('click', async () => {
    const name = document.getElementById('g-name').value.trim();
    const grade = document.getElementById('g-grade').value;
    const start = document.getElementById('g-start').value;
    const end = document.getElementById('g-end').value;

    if (!name || !grade || !start || !end) {
      errorAlert.style.display = 'block';
      errorAlert.textContent = 'Lütfen tüm zorunlu alanları (*) doldurun.';
      return;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<div class="spinner-sm"></div> Kaydediliyor...';

    const formatVal = document.getElementById('g-format').value;
    const linkVal = document.getElementById('g-link').value.trim();

    const data = {
      name,
      grade,
      dayOfWeek: parseInt(document.getElementById('g-day').value),
      time: document.getElementById('g-time').value,
      duration: parseInt(document.getElementById('g-duration').value) || 60,
      rate: parseFloat(document.getElementById('g-rate').value) || 0,
      lessonFormat: formatVal,
      lessonLink: linkVal,
      zoomLink: formatVal === 'zoom' ? linkVal : '', // Compatibility
      notes: document.getElementById('g-notes').value.trim(),
      status: document.getElementById('g-status').value,
      startDate: start,
      endDate: end,
    };

    try {
      if (group) {
        await updateGroup(editId, data);
      } else {
        await addGroup(data);
      }
      closeModal();
      if (onSave) onSave();
    } catch (err) {
      console.error("Grup kaydetme hatası:", err);
      saveBtn.disabled = false;
      saveBtn.textContent = group ? 'Güncelle' : 'Ekle';
      errorAlert.style.display = 'block';
      errorAlert.textContent = 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
  });
}
