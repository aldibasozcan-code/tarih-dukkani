import { getState } from '../../store/store.js';
import { icon } from '../../components/icons.js';
import { openModal, closeModal } from '../../components/modal.js';
import { escHtml, formatCurrency, formatDate } from '../../utils/helpers.js';
import { exportMonthlySummaryPdf } from '../../utils/pdf.js';

const MONTHS = [
  { value: '01', name: 'Ocak' },
  { value: '02', name: 'Şubat' },
  { value: '03', name: 'Mart' },
  { value: '04', name: 'Nisan' },
  { value: '05', name: 'Mayıs' },
  { value: '06', name: 'Haziran' },
  { value: '07', name: 'Temmuz' },
  { value: '08', name: 'Ağustos' },
  { value: '09', name: 'Eylül' },
  { value: '10', name: 'Ekim' },
  { value: '11', name: 'Kasım' },
  { value: '12', name: 'Aralık' }
];

const YEARS = ['2024', '2025', '2026', '2027'];

function getDurationInHours(start, end) {
  if (!start || !end) return 1;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diffMins = (eh * 60 + em) - (sh * 60 + sm);
  return diffMins > 0 ? (diffMins / 60) : 1;
}

export function openMonthlySummary(refId, refType, navigate) {
  const state = getState();
  const refObj = refType === 'student'
    ? state.students.find(s => s.id === refId)
    : state.groups.find(g => g.id === refId);

  if (!refObj) return;

  // Set default current month and year
  const today = new Date();
  let selectedMonthVal = String(today.getMonth() + 1).padStart(2, '0');
  let selectedYearVal = String(today.getFullYear());

  const modalBodyHtml = `
    <div style="padding: 10px 0;">
      <!-- Month & Year Selectors -->
      <div style="display: flex; gap: 16px; margin-bottom: 24px; align-items: center; background: var(--bg-secondary); padding: 16px 20px; border-radius: 16px; border: 1px solid var(--border);">
        <div style="flex: 1;">
          <label style="font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 6px;">Ay Seçin</label>
          <select id="summary-month-select" style="width: 100%; border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; background: white; font-weight: 700;">
            ${MONTHS.map(m => `<option value="${m.value}" ${m.value === selectedMonthVal ? 'selected' : ''}>${m.name}</option>`).join('')}
          </select>
        </div>
        <div style="flex: 1;">
          <label style="font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 6px;">Yıl Seçin</label>
          <select id="summary-year-select" style="width: 100%; border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; background: white; font-weight: 700;">
            ${YEARS.map(y => `<option value="${y}" ${y === selectedYearVal ? 'selected' : ''}>${y}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Statistics Container -->
      <div id="summary-stats-container" class="grid grid-3" style="margin-bottom: 24px;"></div>

      <!-- Report Details Container -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1.5px solid var(--border); padding-bottom: 8px;">
          <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 8px;">
            ${icon('book', 18)} İşlenen Ders Detayları
          </h4>
        </div>
        <div id="summary-lessons-list" style="max-height: 350px; overflow-y: auto; padding-right: 4px;"></div>
      </div>
    </div>
  `;

  openModal({
    title: `${refObj.name} - Aylık Gelişim & İlerleme Özeti`,
    size: 'lg',
    body: modalBodyHtml,
    footer: `
      <button class="btn btn-secondary" id="btn-close-summary">Kapat</button>
      <button class="btn btn-primary" id="btn-download-pdf-summary" style="display: flex; align-items: center; gap: 8px; font-weight: 700; background: var(--brand-green);">
        ${icon('download', 16)} Raporu PDF İndir
      </button>
    `
  });

  // Calculate and populate data
  function populateSummary() {
    const freshState = getState();
    const month = document.getElementById('summary-month-select').value;
    const year = document.getElementById('summary-year-select').value;

    const filteredLessons = freshState.lessons.filter(l => {
      if (l.refId !== refId || l.type !== refType || l.status !== 'completed') return false;
      // l.date format is YYYY-MM-DD
      const [lYear, lMonth] = l.date.split('-');
      return lYear === year && lMonth === month;
    }).sort((a, b) => b.date.localeCompare(a.date));

    // Stats calculations
    const completedLessonsCount = filteredLessons.length;
    let totalMins = 0;
    let totalEarnings = 0;

    filteredLessons.forEach(l => {
      const hours = getDurationInHours(l.startTime, l.endTime);
      totalMins += hours * 60;
      totalEarnings += l.fee || refObj.rate || 0;
    });

    const totalHours = Math.round((totalMins / 60) * 10) / 10;

    // Render stats cards
    const statsContainer = document.getElementById('summary-stats-container');
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="premium-card card-sm" style="padding: 16px; text-align: center; border: 1px solid var(--border);">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Ders Sayısı</div>
          <div style="font-size: 24px; font-weight: 800; color: var(--brand-green);">${completedLessonsCount} Ders</div>
        </div>
        <div class="premium-card card-sm" style="padding: 16px; text-align: center; border: 1px solid var(--border);">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Toplam Süre</div>
          <div style="font-size: 24px; font-weight: 800; color: var(--brand-green);">${totalHours} Saat</div>
        </div>
        <div class="premium-card card-sm" style="padding: 16px; text-align: center; border: 1px solid var(--border);">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Hak Ediş Tutarı</div>
          <div style="font-size: 24px; font-weight: 800; color: var(--success);">${formatCurrency(totalEarnings)}</div>
        </div>
      `;
    }

    // Render lessons list
    const lessonsListContainer = document.getElementById('summary-lessons-list');
    if (lessonsListContainer) {
      if (filteredLessons.length === 0) {
        lessonsListContainer.innerHTML = `
          <div style="text-align: center; padding: 48px 20px; color: var(--text-muted); font-size: 14px; font-weight: 500;">
            Seçilen dönemde tamamlanmış bir ders bulunmuyor.
          </div>
        `;
      } else {
        lessonsListContainer.innerHTML = filteredLessons.map(l => `
          <div style="padding: 14px; border: 1px solid var(--border); border-radius: 12px; margin-bottom: 8px; background: white; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
              <div>
                <span style="font-size: 11px; font-weight: 800; color: var(--brand-green); text-transform: uppercase; letter-spacing: 0.5px;">${l.date} • ${l.startTime} – ${l.endTime}</span>
                <h5 style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin: 4px 0 0 0;">${escHtml(l.title)}</h5>
              </div>
              <span style="font-size: 14px; font-weight: 800; color: var(--success);">${formatCurrency(l.fee || refObj.rate || 0)}</span>
            </div>
            
            ${l.notes ? `
              <div style="background: var(--bg-secondary); padding: 8px 12px; border-radius: 8px; font-size: 12px; color: var(--text-secondary); line-height: 1.4; border-left: 3.5px solid var(--brand-green-light);">
                <strong>Değerlendirme:</strong> ${escHtml(l.notes)}
              </div>
            ` : ''}

            ${l.homework ? `
              <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #d97706; font-weight: 700;">
                ${icon('book', 14)} <strong>Ödev:</strong> ${escHtml(l.homework)}
              </div>
            ` : ''}
          </div>
        `).join('');
      }
    }
  }

  // Setup change event listeners
  const monthSelect = document.getElementById('summary-month-select');
  const yearSelect = document.getElementById('summary-year-select');

  monthSelect.addEventListener('change', populateSummary);
  yearSelect.addEventListener('change', populateSummary);

  // Download PDF Report trigger
  document.getElementById('btn-download-pdf-summary').addEventListener('click', () => {
    const monthVal = monthSelect.value;
    const yearVal = yearSelect.value;
    const monthObj = MONTHS.find(m => m.value === monthVal);

    const freshState = getState();
    const filteredLessons = freshState.lessons.filter(l => {
      if (l.refId !== refId || l.type !== refType || l.status !== 'completed') return false;
      const [lYear, lMonth] = l.date.split('-');
      return lYear === yearVal && lMonth === monthVal;
    }).sort((a, b) => b.date.localeCompare(a.date));

    let totalMins = 0;
    let totalEarnings = 0;

    filteredLessons.forEach(l => {
      const hours = getDurationInHours(l.startTime, l.endTime);
      totalMins += hours * 60;
      totalEarnings += l.fee || refObj.rate || 0;
    });

    const totalHours = Math.round((totalMins / 60) * 10) / 10;

    exportMonthlySummaryPdf({
      studentOrGroupName: refObj.name,
      type: refType,
      grade: refObj.grade,
      monthName: monthObj.name,
      year: yearVal,
      stats: {
        completedLessons: filteredLessons.length,
        totalHours: totalHours,
        earnings: totalEarnings
      },
      lessons: filteredLessons
    });
  });

  document.getElementById('btn-close-summary').addEventListener('click', closeModal);

  // Initial populate
  populateSummary();
}
