// ═════════════════════════════════════════════════
// ADD STUDENT MODAL
// ═════════════════════════════════════════════════
import { getState, addStudent, updateStudent, syncStudentCurriculum } from '../../store/store.js';
import { ALL_GRADES } from '../../data/curriculum.js';
import { openModal, closeModal } from '../../components/modal.js';
import { escHtml } from '../../utils/helpers.js';

export function openAddStudentModal(onSave, editId = null) {
  const student = editId ? getState().students.find(s => s.id === editId) : null;

  openModal({
    title: student ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Ekle',
    body: `
      <div class="form-group">
        <label>Ad Soyad *</label>
        <input type="text" id="s-name" value="${escHtml(student?.name || '')}" placeholder="Örn: Ahmet Yılmaz">
      </div>
      <div class="form-group">
        <label>Sınıf *</label>
        <select id="s-grade">
          <option value="">Sınıf seçin</option>
          ${ALL_GRADES.map(g => `<option value="${g}" ${student?.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Telefon (Öğrenci)</label>
          <input type="tel" id="s-phone" value="${escHtml(student?.phone || '')}" placeholder="+90 5xx xxx xx xx">
        </div>
        <div class="form-group">
          <label>E-posta (Öğrenci)</label>
          <input type="email" id="s-email" value="${escHtml(student?.email || '')}" placeholder="ornek@mail.com">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Telefon (Veli)</label>
          <input type="tel" id="s-pphone" value="${escHtml(student?.parentPhone || '')}" placeholder="+90 5xx xxx xx xx">
        </div>
        <div class="form-group">
          <label>E-posta (Veli)</label>
          <input type="email" id="s-pemail" value="${escHtml(student?.parentEmail || '')}" placeholder="veli@mail.com">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Saatlik Ücret (₺)</label>
          <input type="number" id="s-rate" value="${student?.rate || 500}" min="0" step="50">
        </div>
        <div class="form-group">
          <label>Durum</label>
          <select id="s-status">
            <option value="active" ${student?.status === 'active' ? 'selected' : ''}>Aktif</option>
            <option value="passive" ${student?.status === 'passive' ? 'selected' : ''}>Pasif</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Ders İşleme Biçimi</label>
          <select id="s-format">
            <option value="zoom" ${student?.lessonFormat === 'zoom' ? 'selected' : ''}>Online (Zoom)</option>
            <option value="meet" ${student?.lessonFormat === 'meet' || (!student?.lessonFormat && student?.meetLink) ? 'selected' : ''}>Online (Google Meet)</option>
            <option value="face" ${student?.lessonFormat === 'face' ? 'selected' : ''}>Yüzyüze</option>
          </select>
        </div>
        <div class="form-group" id="s-link-group">
          <label id="s-link-label">${(student?.lessonFormat === 'face') ? 'Ders Konumu' : 'Ders Linki'}</label>
          <input type="text" id="s-link" value="${escHtml(student?.lessonLink || student?.meetLink || '')}" placeholder="${(student?.lessonFormat === 'face') ? 'Örn: Kadıköy Ofis' : 'https://...' }">
        </div>
      </div>
      <div class="form-group">
        <label>Notlar</label>
        <textarea id="s-notes" rows="2" placeholder="Öğrenci hakkında notlar...">${escHtml(student?.notes || '')}</textarea>
      </div>
      ${student ? `
        <div style="margin-top:10px; padding:12px; background:rgba(255,159,67,0.05); border-radius:8px; border:1px dashed rgba(255,159,67,0.3);">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; margin:0;">
            <input type="checkbox" id="s-sync-curr" style="width:16px; height:16px;">
            <span style="font-size:12px; font-weight:600; color:var(--warning);">Müfredatı Mevcut Branşlarıma Göre Güncelle</span>
          </label>
          <p style="font-size:11px; color:var(--text-muted); margin-top:4px; margin-left:24px;">Branşlarınız değiştiyse veya müfredatta hata varsa bunu işaretleyerek öğrencinin ders listesini güncelleyebilirsiniz. (Tamamlanan konular korunur).</p>
        </div>
      ` : '<div style="padding:10px;background:rgba(99,202,183,0.08);border-radius:8px;font-size:12px;color:var(--accent);">Öğrenci eklenince seçilen sınıfa ait tüm müfredat otomatik atanacak.</div>'}
    `,
    footer: `
      <button class="btn btn-secondary" id="s-cancel">İptal</button>
      <button class="btn btn-primary" id="s-save">${student ? 'Güncelle' : 'Ekle'}</button>
    `,
  });

  const formatSel = document.getElementById('s-format');
  const linkLabel = document.getElementById('s-link-label');
  const linkInp = document.getElementById('s-link');

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

  document.getElementById('s-cancel')?.addEventListener('click', closeModal);
  document.getElementById('s-save')?.addEventListener('click', () => {
    const name = document.getElementById('s-name').value.trim();
    const grade = document.getElementById('s-grade').value;
    if (!name || !grade) { alert('Ad ve sınıf zorunludur.'); return; }

    const data = {
      name,
      grade,
      phone: document.getElementById('s-phone').value.trim(),
      email: document.getElementById('s-email').value.trim(),
      parentPhone: document.getElementById('s-pphone').value.trim(),
      parentEmail: document.getElementById('s-pemail').value.trim(),
      rate: parseFloat(document.getElementById('s-rate').value) || 500,
      lessonFormat: formatSel.value,
      lessonLink: linkInp.value.trim(),
      meetLink: formatSel.value === 'meet' ? linkInp.value.trim() : '', // Compatibility
      notes: document.getElementById('s-notes').value.trim(),
      status: document.getElementById('s-status').value,
    };

    if (student) {
      updateStudent(editId, data);
      if (document.getElementById('s-sync-curr')?.checked) {
        syncStudentCurriculum(editId);
      }
    } else {
      addStudent(data);
    }
    closeModal();
    if (onSave) onSave();
  });
}
