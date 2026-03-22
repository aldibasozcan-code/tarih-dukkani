// ─── Date/time helpers ───

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export function formatTime(timeStr) {
  return timeStr || '';
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(amount);
}

export function formatDistanceToNow(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'az önce';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  return formatDateShort(date.toISOString().split('T')[0]);
}

export function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function getMonthDays(year, month) {
  // Returns array of Date objects for all days in month view (including overflow)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  // Fill leading days from prev month
  const startDow = (firstDay.getDay() + 6) % 7; // Monday-first
  for (let i = startDow; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    days.push({ date: d, currentMonth: false });
  }
  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), currentMonth: true });
  }
  // Fill trailing days
  const rest = 42 - days.length;
  for (let i = 1; i <= rest; i++) {
    days.push({ date: new Date(year, month + 1, i), currentMonth: false });
  }
  return days;
}

export function getInitials(name = '') {
  return name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export function getAvatarColor(name = '') {
  const colors = [
    'linear-gradient(135deg,#63cab7,#4aad9a)',
    'linear-gradient(135deg,#7c6aff,#5a4dcc)',
    'linear-gradient(135deg,#f6c90e,#e0a800)',
    'linear-gradient(135deg,#ff9f43,#e88c2c)',
    'linear-gradient(135deg,#ff5a65,#e03d48)',
    'linear-gradient(135deg,#2ed573,#26b366)',
  ];
  const sum = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return colors[sum % colors.length];
}

export function escHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function getLessonStatusInfo(status) {
  const map = {
    upcoming:  { label: 'Bekliyor', badgeClass: 'badge-muted', dotClass: 'status-upcoming' },
    ongoing:   { label: 'Devam Ediyor', badgeClass: 'badge-success', dotClass: 'status-ongoing' },
    waiting:   { label: 'Onay Bekliyor', badgeClass: 'badge-warning', dotClass: 'status-waiting' },
    completed: { label: 'Tamamlandı', badgeClass: 'badge-info', dotClass: 'status-completed' },
    postponed: { label: 'Ertelendi', badgeClass: 'badge-danger', dotClass: 'status-postponed' },
  };
  return map[status] || map.upcoming;
}

// Debounce
export function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}
