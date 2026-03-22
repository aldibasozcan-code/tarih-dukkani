// ═════════════════════════════════════════════════
// LESSON EVALUATION MODAL
// ═════════════════════════════════════════════════
import { getState, completeLesson, postponeLesson, addNextWeekLesson, addNotification } from '../../store/store.js';
import { icon } from '../../components/icons.js';
import { openModal, closeModal, showConfirm } from '../../components/modal.js';
import { escHtml } from '../../utils/helpers.js';

export function openLessonEvalModal(lessonId, navigate) {
  const state = getState();
  const lesson = state.lessons.find(l => l.id === lessonId);
  if (!lesson) return;

  const ref = lesson.type === 'student'
    ? state.students.find(s => s.id === lesson.refId)
    : state.groups.find(g => g.id === lesson.refId);

  const hasPhone = ref?.phone || ref?.parentPhone;
  const materials = Object.values(state.materials).filter(m =>
    m.subject === lesson.subject && m.grade === lesson.grade
  );

  openModal({
    title: 'Ders Değerlendirme',
    size: 'lg',
    body: `
      <div style="background:rgba(99,202,183,0.08);border:1px solid rgba(99,202,183,0.2);border-radius:12px;padding:16px;margin-bottom:20px;">
        <div style="font-size:15px;font-weight:700;">${escHtml(lesson.title)}</div>
        <div style="font-size:13px;color:var(--text-muted);margin-top:4px;">${lesson.date} • ${lesson.startTime} – ${lesson.endTime}</div>
        <div style="font-size:13px;color:var(--text-muted);">Ücret: ₺${lesson.fee || ref?.rate || 0}</div>
      </div>

      <div style="margin-bottom:20px;">
        <p style="font-size:14px;font-weight:600;margin-bottom:12px;">Bu ders tamamlandı mı?</p>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-success" id="btn-completed" style="flex:1;">
            ${icon('checkCircle', 15)} Evet, Tamamlandı
          </button>
          <button class="btn btn-warning" id="btn-postpone" style="flex:1;">
            ${icon('clock', 15)} Ertele
          </button>
        </div>
      </div>

      <div id="completion-form" style="display:none;">
        <hr class="divider">
        <h3 style="font-size:14px;font-weight:700;margin-bottom:12px;">Ders Notları</h3>
        <div class="form-group">
          <label>İşlenen Konu</label>
          <input type="text" id="l-topic-done" placeholder="Bu derste hangi konu işlendi?" value="${escHtml(lesson.notes || '')}">
        </div>
        <div class="form-group">
          <label>Değerlendirme Notu</label>
          <textarea id="l-eval-notes" rows="2" placeholder="Ders değerlendirmesi..."></textarea>
        </div>
        ${materials.length > 0 ? `
          <div class="form-group">
            <label>Ödev Linki (opsiyonel)</label>
            <select id="l-homework-link">
              <option value="">Ödev yok</option>
              ${materials.map(m => `<option value="${escHtml(m.link)}" data-title="${escHtml(m.title)}">${m.title}</option>`).join('')}
            </select>
          </div>
        ` : ''}
        <div style="padding:10px;background:rgba(46,213,115,0.08);border-radius:8px;margin-bottom:12px;font-size:12px;color:var(--success);">
          ✓ Ders tamamlanınca: ₺${lesson.fee || ref?.rate || 0} muhasebe kaydına eklenecek ve bir sonraki hafta için ders otomatik planlanacak.
        </div>
        ${hasPhone ? `
          <div style="padding:10px;background:rgba(37,211,102,0.08);border-radius:8px;border:1px solid rgba(37,211,102,0.2);font-size:12px;color:#25d366;margin-bottom:12px;">
            WhatsApp ile ödev gönderim butonu aşağıda görünecek.
          </div>
        ` : ''}
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button class="btn btn-secondary" id="btn-eval-cancel">İptal</button>
          <button class="btn btn-success" id="btn-eval-confirm">${icon('check', 14)} Onayla ve Kaydet</button>
        </div>
      </div>

      <div id="postpone-form" style="display:none;">
        <hr class="divider">
        <h3 style="font-size:14px;font-weight:700;margin-bottom:12px;">Erteleme</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Yeni Tarih</label>
            <input type="date" id="l-new-date">
          </div>
          <div class="form-group">
            <label>Yeni Saat</label>
            <input type="time" id="l-new-time" value="${lesson.startTime}">
          </div>
        </div>
        <p style="font-size:12px;color:var(--warning);">Erteleme durumunda muhasebe kaydı oluşturulmaz.</p>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:12px;">
          <button class="btn btn-secondary" id="btn-post-cancel">İptal</button>
          <button class="btn btn-warning" id="btn-post-confirm">${icon('clock', 14)} Ertele</button>
        </div>
      </div>
    `,
  });

  document.getElementById('btn-completed')?.addEventListener('click', () => {
    document.getElementById('completion-form').style.display = '';
    document.getElementById('postpone-form').style.display = 'none';
  });

  document.getElementById('btn-postpone')?.addEventListener('click', () => {
    document.getElementById('postpone-form').style.display = '';
    document.getElementById('completion-form').style.display = 'none';
  });

  document.getElementById('btn-eval-cancel')?.addEventListener('click', closeModal);
  document.getElementById('btn-post-cancel')?.addEventListener('click', closeModal);

  document.getElementById('btn-eval-confirm')?.addEventListener('click', () => {
    const hwSel = document.getElementById('l-homework-link');
    const hwLink = hwSel?.value || '';
    const hwTitle = hwSel?.options[hwSel.selectedIndex]?.dataset.title || '';
    const notes = document.getElementById('l-eval-notes')?.value || '';

    const extraOpts = {
      notes,
      homework: hwLink ? hwTitle : null,
    };

    completeLesson(lessonId, extraOpts);

    // Add homework to student if applicable
    if (hwLink && lesson.type === 'student' && ref) {
      const hw = {
        id: Date.now().toString(),
        description: hwTitle,
        link: hwLink,
        date: lesson.date,
      };
      import('../../store/store.js').then(m => {
        m.updateStudent(lesson.refId, {
          homework: [...(ref.homework || []), hw]
        });
      });
    }

    // Ask about next week lesson
    closeModal();
    showConfirm({
      title: 'Haftalık Tekrar',
      message: `Bir sonraki hafta için (${getNextWeekDate(lesson.date)}) aynı dersi otomatik ekleyeyim mi?`,
      confirmText: 'Evet, Ekle',
      cancelText: 'Hayır',
      onConfirm: () => {
        addNextWeekLesson(lesson);
        if (navigate) navigate(window.location.hash.replace('#','') || 'dashboard');
      },
      onCancel: () => {
        if (navigate) navigate(window.location.hash.replace('#','') || 'dashboard');
      }
    });

    // Send WA notification
    if (hwLink && hasPhone) {
      const phone = (ref.parentPhone || ref.phone).replace(/[^0-9]/g, '');
      const msg = encodeURIComponent(`Sayın veli, ${ref.name} öğrencimizin ödevi: ${hwTitle} - ${hwLink}`);
      setTimeout(() => {
        const waBtn = document.createElement('a');
        waBtn.href = `https://wa.me/${phone}?text=${msg}`;
        waBtn.target = '_blank';
        waBtn.click();
      }, 500);
    }
  });

  document.getElementById('btn-post-confirm')?.addEventListener('click', () => {
    const newDate = document.getElementById('l-new-date').value;
    const newTime = document.getElementById('l-new-time').value;
    if (!newDate) { alert('Lütfen yeni tarih seçin.'); return; }
    postponeLesson(lessonId, newDate, newTime);
    addNotification({ type: 'warning', text: `${lesson.title} dersi ${newDate} tarihine ertelendi.`, link: 'calendar' });
    closeModal();
    if (navigate) navigate(window.location.hash.replace('#','') || 'dashboard');
  });
}

function getNextWeekDate(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 7);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}
