import jsPDF from 'jspdf';

// Turkish characters sanitization helper
export function sanitizeTurkishChars(str) {
  if (!str) return '';
  const mapping = {
    'ğ': 'g', 'Ğ': 'G',
    'ş': 's', 'Ş': 'S',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ç': 'c', 'Ç': 'C',
    'ü': 'u', 'Ü': 'U'
  };
  return str.split('').map(c => mapping[c] || c).join('');
}

export async function createPdfDocument({ title, sections, fileName }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const leftMargin = 40;
  const maxWidth = pageWidth - leftMargin * 2;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(sanitizeTurkishChars(title), leftMargin, 50);

  let cursor = 78;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(12);

  sections.forEach(section => {
    if (section.title) {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(sanitizeTurkishChars(section.title), leftMargin, cursor);
      cursor += 20;
    }

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    const sanitizedBody = sanitizeTurkishChars(section.body);
    const lines = doc.splitTextToSize(sanitizedBody, maxWidth);
    doc.text(lines, leftMargin, cursor);
    cursor += lines.length * 16 + 16;

    if (cursor > doc.internal.pageSize.getHeight() - 80) {
      doc.addPage();
      cursor = 50;
    }
  });

  doc.save(fileName);
}

// Dedicated Monthly Summary PDF Export
export async function exportMonthlySummaryPdf({ studentOrGroupName, type, grade, monthName, year, stats, lessons }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const leftMargin = 40;
  const rightMargin = 40;
  const contentWidth = pageWidth - leftMargin - rightMargin; // 515.27

  // Helper for adding footer to all pages
  const addFooter = (pageNumber) => {
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      sanitizeTurkishChars(`bitiga.app - Sayfa ${pageNumber}`),
      pageWidth / 2,
      pageHeight - 30,
      { align: 'center' }
    );
  };

  // Header Banner
  doc.setFillColor(0, 69, 38); // Brand Green
  doc.rect(0, 0, pageWidth, 90, 'F');

  // Title in Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(sanitizeTurkishChars("AYLIK ILERLEME VE TAKIP RAPORU"), leftMargin, 40);

  // Period / Subtitle in Header
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(220, 220, 220);
  doc.text(sanitizeTurkishChars(`${monthName} ${year}`), leftMargin, 62);

  // Info Block (Student Details)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(sanitizeTurkishChars(studentOrGroupName), leftMargin, 130);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(sanitizeTurkishChars(`Tip: ${type === 'student' ? 'Bireysel Ogrenci' : 'Grup Egitimi'}  |  Sinif: ${grade}`), leftMargin, 150);

  // Summary Metrics Cards
  const cardY = 175;
  const cardHeight = 60;
  const cardWidth = contentWidth / 3 - 10;

  // Card 1: Completed Lessons
  doc.setFillColor(248, 250, 252); // Soft gray
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(leftMargin, cardY, cardWidth, cardHeight, 6, 6, 'FD');
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(sanitizeTurkishChars("Tamamlanan Ders"), leftMargin + 15, cardY + 22);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 69, 38);
  doc.text(sanitizeTurkishChars(`${stats.completedLessons}`), leftMargin + 15, cardY + 45);

  // Card 2: Total Hours
  const card2X = leftMargin + cardWidth + 15;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 6, 6, 'FD');
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(sanitizeTurkishChars("Toplam Sure"), card2X + 15, cardY + 22);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 69, 38);
  doc.text(sanitizeTurkishChars(`${stats.totalHours} Saat`), card2X + 15, cardY + 45);

  // Card 3: Total Earnings / Fees
  const card3X = leftMargin + (cardWidth + 15) * 2;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(card3X, cardY, cardWidth, cardHeight, 6, 6, 'FD');
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(sanitizeTurkishChars("Toplam Hak Edis"), card3X + 15, cardY + 22);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 69, 38);
  doc.text(sanitizeTurkishChars(`${stats.earnings} TL`), card3X + 15, cardY + 45);

  // Section Header: Lessons table
  let cursor = 265;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.text(sanitizeTurkishChars("Islenen Ders Detaylari"), leftMargin, cursor);
  cursor += 15;

  // Table Headers
  const colWidths = {
    date: 90,
    topic: 160,
    notes: 120,
    homework: 90,
    fee: 55
  };

  const colX = {
    date: leftMargin,
    topic: leftMargin + colWidths.date,
    notes: leftMargin + colWidths.date + colWidths.topic,
    homework: leftMargin + colWidths.date + colWidths.topic + colWidths.notes,
    fee: leftMargin + colWidths.date + colWidths.topic + colWidths.notes + colWidths.homework
  };

  doc.setFillColor(241, 245, 249); // Headers background
  doc.rect(leftMargin, cursor, contentWidth, 25, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);

  doc.text(sanitizeTurkishChars("Tarih / Saat"), colX.date + 8, cursor + 17);
  doc.text(sanitizeTurkishChars("Ders Konusu / Baslik"), colX.topic + 8, cursor + 17);
  doc.text(sanitizeTurkishChars("Degerlendirme"), colX.notes + 8, cursor + 17);
  doc.text(sanitizeTurkishChars("Verilen Odev"), colX.homework + 8, cursor + 17);
  doc.text(sanitizeTurkishChars("Ucret"), colX.fee + 8, cursor + 17);

  cursor += 25;
  let pageNum = 1;

  lessons.forEach((l, i) => {
    // Check page overflow
    if (cursor > pageHeight - 100) {
      addFooter(pageNum);
      doc.addPage();
      pageNum += 1;
      cursor = 50;

      // Repeat Table Headers on next page
      doc.setFillColor(241, 245, 249);
      doc.rect(leftMargin, cursor, contentWidth, 25, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(sanitizeTurkishChars("Tarih / Saat"), colX.date + 8, cursor + 17);
      doc.text(sanitizeTurkishChars("Ders Konusu / Baslik"), colX.topic + 8, cursor + 17);
      doc.text(sanitizeTurkishChars("Degerlendirme"), colX.notes + 8, cursor + 17);
      doc.text(sanitizeTurkishChars("Verilen Odev"), colX.homework + 8, cursor + 17);
      doc.text(sanitizeTurkishChars("Ucret"), colX.fee + 8, cursor + 17);
      cursor += 25;
    }

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    const dateText = `${l.date}\n${l.startTime}-${l.endTime}`;
    const topicText = l.title || 'Belirtilmedi';
    const notesText = l.notes || '-';
    const homeworkText = l.homework || 'Odev verilmedi';
    const feeText = `${l.fee || 0} TL`;

    // Calculate maximum height needed for this row
    const splitDate = doc.splitTextToSize(sanitizeTurkishChars(dateText), colWidths.date - 12);
    const splitTopic = doc.splitTextToSize(sanitizeTurkishChars(topicText), colWidths.topic - 12);
    const splitNotes = doc.splitTextToSize(sanitizeTurkishChars(notesText), colWidths.notes - 12);
    const splitHomework = doc.splitTextToSize(sanitizeTurkishChars(homeworkText), colWidths.homework - 12);
    const splitFee = doc.splitTextToSize(sanitizeTurkishChars(feeText), colWidths.fee - 12);

    const maxLines = Math.max(splitDate.length, splitTopic.length, splitNotes.length, splitHomework.length, splitFee.length);
    const rowHeight = maxLines * 13 + 14;

    // Draw zebra row highlight
    if (i % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(leftMargin, cursor, contentWidth, rowHeight, 'F');
    }

    // Border line under row
    doc.setDrawColor(241, 245, 249);
    doc.line(leftMargin, cursor + rowHeight, leftMargin + contentWidth, cursor + rowHeight);

    // Write row columns text
    doc.text(splitDate, colX.date + 8, cursor + 14);
    doc.text(splitTopic, colX.topic + 8, cursor + 14);
    doc.text(splitNotes, colX.notes + 8, cursor + 14);
    doc.text(splitHomework, colX.homework + 8, cursor + 14);
    doc.text(splitFee, colX.fee + 8, cursor + 14);

    cursor += rowHeight;
  });

  addFooter(pageNum);

  // Trigger Save/Download
  const cleanName = sanitizeTurkishChars(studentOrGroupName).replace(/\s+/g, '_');
  doc.save(`${cleanName}_Aylik_Ozet_${monthName}_${year}.pdf`);
}
