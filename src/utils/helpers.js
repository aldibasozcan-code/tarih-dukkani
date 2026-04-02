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

export function getGroupInitials(name = '') {
  const words = name.split(' ').filter(Boolean);
  let initials = '';
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const nextWord = words[i+1];
    
    // "Sınıf" veya "Grade" kelimesinden sonra rakam geliyorsa kelimeyi atla, rakamı al
    const isSinif = word.toLowerCase() === 'sınıf' || word.toLowerCase() === 'sinif';
    if (isSinif && nextWord && /^\d+/.test(nextWord)) {
      continue; 
    }
    
    // Eğer kelime rakamla başlıyorsa (Sınıf 7 -> 7), rakam kısmını al
    if (/^\d+/.test(word)) {
      initials += word.match(/^\d+/)[0];
    } else {
      // Değilse ilk harfi al
      initials += word[0].toUpperCase();
    }
  }
  
  return initials.slice(0, 4); // Maksimum 4 karakter
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

// ─── YouTube URL Helpers ───
export function getYoutubeVideoId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function isYoutubeUrl(url) {
  return !!getYoutubeVideoId(url);
}

// ─── Google Drive URL Helpers ───
export function getGoogleDrivePreviewUrl(url) {
  if (!url) return null;
  // Match file share links
  const fileIdMatch = url.match(/\/file\/d\/([^\/]+)/) || url.match(/[?&]id=([^\/&]+)/);
  if (fileIdMatch) {
    return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
  }
  // Match doc/sheet share links
  const docIdMatch = url.match(/\/d\/([^\/]+)/);
  if (docIdMatch && (url.includes('docs.google.com') || url.includes('drive.google.com'))) {
    // For documents, we change the last part to 'preview' or just keep the ID
    return `https://docs.google.com/viewer?srcid=${docIdMatch[1]}&pid=explorer&efp=repts&a=v&chrome=false&embedded=true`;
  }
  return null;
}

export function isGoogleDriveUrl(url) {
  return url?.includes('drive.google.com') || url?.includes('docs.google.com');
}
