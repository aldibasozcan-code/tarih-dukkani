import { openModal, closeModal } from '../../components/modal.js';
import { createPdfDocument } from '../../utils/pdf.js';
import { escHtml } from '../../utils/helpers.js';

function buildStudentMessage({ studentName, lessonDate, lessonTitle, topicTitle, lessonNotes, homeworkTitle }) {
  return `Merhaba ${studentName},\n\n${lessonDate} tarihinde tamamladığımız ${lessonTitle} dersinde ${topicTitle || 'seçilen bir konu'} işlendi.\n\nÖzet: ${lessonNotes || 'Ders notu paylaşılmadı.'}\n\nÖdev: ${homeworkTitle || 'Bu ders için ödev verilmedi.'}\n\nPDF formatındaki ders raporunu kaydedip WhatsApp üzerinden paylaşabilirsiniz.`;
}

function buildParentMessage({ studentName, lessonDate, unitName, progressText, lessonNotes, homeworkTitle }) {
  return `Merhaba,\n\n${studentName} ile ${lessonDate} tarihinde tamamladığımız ${unitName} ünitesi itibarıyla bir değerlendirme raporu paylaşıyorum.\n\nDurum: ${progressText}\n\nDers Özeti: ${lessonNotes || 'Özet notu paylaşılmamış.'}\n\nÖdev: ${homeworkTitle || 'Bu ünite kapsamında ek ödev verilmedi.'}\n\nPDF formatında hazırlanmış raporu kaydedip WhatsApp üzerinden veliye gönderebilirsiniz.`;
}

function buildStudentPdfSections({ lessonTitle, unitName, topicTitle, lessonNotes, homeworkTitle, homeworkLink }) {
  return [
    { title: 'Ünite', body: unitName },
    { title: 'İşlenen Konu', body: topicTitle || lessonTitle },
    { title: 'Ders Özeti', body: lessonNotes || 'Ders özeti girilmedi.' },
    { title: 'Ödev', body: homeworkTitle ? `${homeworkTitle}${homeworkLink ? `\nLink: ${homeworkLink}` : ''}` : 'Ödev yok.' },
  ];
}

function buildParentPdfSections({ studentName, lessonDate, unitName, progressText, lessonNotes, homeworkTitle, homeworkLink }) {
  return [
    { title: 'Öğrenci', body: studentName },
    { title: 'Ders Tarihi', body: lessonDate },
    { title: 'Ünite', body: unitName },
    { title: 'Durum', body: progressText },
    { title: 'Ünite Özeti', body: lessonNotes || 'Ders özeti girilmedi.' },
    { title: 'Ödev', body: homeworkTitle ? `${homeworkTitle}${homeworkLink ? `\nLink: ${homeworkLink}` : ''}` : 'Ödev yok.' },
  ];
}

export async function openUnitCompletionModal({ lesson, student, unit, homeworkTitle, homeworkLink, lessonNotes, progressText, onClose }) {
  const studentMsg = buildStudentMessage({
    studentName: student.name,
    lessonDate: lesson.date,
    lessonTitle: lesson.title,
    topicTitle: lesson.topicTitle || lesson.title,
    lessonNotes,
    homeworkTitle,
  });

  const parentMsg = buildParentMessage({
    studentName: student.name,
    lessonDate: lesson.date,
    unitName: unit.name,
    progressText,
    lessonNotes,
    homeworkTitle,
  });

  openModal({
    title: 'Ünite Tamamlandı - Bildirim Gönderimi',
    size: 'xl',
    onClose,
    body: `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:18px;">
        <div style="padding:22px; background:rgba(37,211,98,0.06); border:1px solid rgba(37,211,98,0.2); border-radius:18px;">
          <h3 style="margin:0 0 12px; font-size:16px;">Öğrenci Mesajı</h3>
          <p style="font-size:13px; color:var(--text-muted); margin:0 0 16px;">Bu alan öğrenciye gönderilecek PDF ve WhatsApp mesajını gösterir.</p>
          <div style="background:rgba(255,255,255,0.9); border-radius:14px; padding:16px; min-height:260px; white-space:pre-wrap; font-size:13px; line-height:1.5; color:var(--text-secondary);">${escHtml(studentMsg)}</div>
          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:16px;">
            <button class="btn btn-secondary" id="btn-student-pdf">PDF İndir</button>
            <button class="btn btn-success" id="btn-student-wa">WhatsApp'a Hazırla</button>
          </div>
        </div>

        <div style="padding:22px; background:rgba(66,153,225,0.06); border:1px solid rgba(66,153,225,0.2); border-radius:18px;">
          <h3 style="margin:0 0 12px; font-size:16px;">Veli Mesajı</h3>
          <p style="font-size:13px; color:var(--text-muted); margin:0 0 16px;">Bu alan veliye gönderilecek PDF ve WhatsApp mesajını gösterir.</p>
          <div style="background:rgba(255,255,255,0.9); border-radius:14px; padding:16px; min-height:260px; white-space:pre-wrap; font-size:13px; line-height:1.5; color:var(--text-secondary);">${escHtml(parentMsg)}</div>
          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:16px;">
            <button class="btn btn-secondary" id="btn-parent-pdf">PDF İndir</button>
            <button class="btn btn-primary" id="btn-parent-wa">WhatsApp'a Hazırla</button>
          </div>
        </div>
      </div>
      <div style="margin-top:20px; font-size:12px; color:var(--text-muted);">
        <strong>Not:</strong> PDF önce indirildikten sonra WhatsApp üzerinden ek olarak paylaşılmalıdır. WhatsApp butonu mesajı hazırlar.
      </div>
    `,
    footer: `<button class="btn btn-secondary" id="btn-unit-close">Kapat</button>`,
  });

  const studentPdfData = {
    title: `Ünite Raporu - ${unit.name}`,
    sections: buildStudentPdfSections({
      lessonTitle: lesson.title,
      unitName: unit.name,
      topicTitle: lesson.topicTitle || lesson.title,
      lessonNotes,
      homeworkTitle,
      homeworkLink,
    }),
    fileName: `${student.name || 'ogrenci'}_${unit.name.replace(/[^a-z0-9]/gi, '_')}_ogrenci.pdf`,
  };
  const parentPdfData = {
    title: `Veli Bilgilendirme - ${unit.name}`,
    sections: buildParentPdfSections({
      studentName: student.name,
      lessonDate: lesson.date,
      unitName: unit.name,
      progressText,
      lessonNotes,
      homeworkTitle,
      homeworkLink,
    }),
    fileName: `${student.name || 'veli'}_${unit.name.replace(/[^a-z0-9]/gi, '_')}_veli.pdf`,
  };

  document.getElementById('btn-student-pdf')?.addEventListener('click', async () => {
    await createPdfDocument(studentPdfData);
  });

  document.getElementById('btn-parent-pdf')?.addEventListener('click', async () => {
    await createPdfDocument(parentPdfData);
  });

  document.getElementById('btn-student-wa')?.addEventListener('click', () => {
    const phone = (student.phone || '').replace(/[^0-9]/g, '');
    if (!phone) {
      alert('Öğrencinin WhatsApp numarası yok.');
      return;
    }
    const text = encodeURIComponent(studentMsg + '\n\nPDF indirip WhatsApp üzerinden paylaşabilirsiniz.');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  });

  document.getElementById('btn-parent-wa')?.addEventListener('click', () => {
    const phone = (student.parentPhone || '').replace(/[^0-9]/g, '');
    if (!phone) {
      alert('Velinin WhatsApp numarası yok.');
      return;
    }
    const text = encodeURIComponent(parentMsg + '\n\nPDF indirip WhatsApp üzerinden paylaşabilirsiniz.');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  });

  document.getElementById('btn-unit-close')?.addEventListener('click', () => {
    closeModal();
  });
}
