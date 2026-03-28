// ═══════════════════════════════════════════════════
// LAYOUT COMPONENT - Sidebar + Topbar
// ═══════════════════════════════════════════════════
import { getState, subscribe, markAllNotificationsRead, addNotification } from '../store/store.js';
import { icon } from './icons.js';
import { formatDistanceToNow } from '../utils/helpers.js';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'courses', label: 'Kurslar', icon: 'courses' },
  { id: 'students', label: 'Öğrenciler', icon: 'students' },
  { id: 'groups', label: 'Gruplar', icon: 'groups' },
  { id: 'finance', label: 'Muhasebe', icon: 'finance' },
  { id: 'calendar', label: 'Takvim', icon: 'calendar' },
  { id: 'chat', label: 'Mesajlar', icon: 'chat' },
  { id: 'liveClass', label: 'Canlı Sınıf', icon: 'liveClass' },
  { id: 'settings', label: 'Ayarlar', icon: 'settings' },
];

let _notifPanelOpen = false;
let _sidebarOpen = false;

export function renderLayout(currentPage, navigate) {
  const state = getState();
  const unreadCount = state.notifications.filter(n => !n.read).length;

  return `
    <div class="sidebar ${state.ui?.sidebarOpen ? 'sidebar-open' : ''}" id="sidebar">
      ${renderSidebar(state, currentPage, navigate)}
    </div>
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <div class="main-area">
      <div class="topbar" id="topbar">
        ${renderTopbar(state, unreadCount)}
      </div>
      <div class="page-content" id="page-content">
        <!-- Page content injected here -->
      </div>
    </div>
    <div id="modal-container"></div>
    <div id="notif-panel-container"></div>
  `;
}

function renderSidebar(state, currentPage, navigate) {
  const logo = state.settings.logo
    ? `<img src="${state.settings.logo}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">`
    : `<span>${(state.settings.appName || 'TD').slice(0, 2)}</span>`;

  return `
    <div class="sidebar-brand">
      <div class="brand-logo" data-nav="settings">${logo}</div>
      <div>
        <div class="brand-name">${state.settings.appName || 'Öğretmen Paneli'}</div>
        <div class="brand-sub">${state.profile.title || 'Öğretmen Paneli'}</div>
      </div>
    </div>
    <nav class="nav-section">
      ${NAV_ITEMS.map(item => `
        <button class="nav-item ${currentPage === item.id ? 'active' : ''}" data-nav="${item.id}">
          ${icon(item.icon, 17)}
          ${item.label}
        </button>
      `).join('')}
    </nav>
    <div style="margin-top:auto; padding: 12px 16px; border-top: 1px solid var(--border);">
      <button class="nav-item" id="logout-btn" style="color: var(--danger); margin-bottom: 12px; transition: all 0.2s;">
        <svg stroke="currentColor" fill="none" viewBox="0 0 24 24" style="width:18px;height:18px;flex-shrink:0;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
        </svg>
        Çıkış Yap
      </button>
      <div style="font-size:11px; color:var(--text-on-green-muted); opacity:0.8;">${state.settings.footerText || 'v1.0 • Öğretmen Paneli'}</div>
    </div>
  `;
}

function renderTopbar(state, unreadCount) {
  const pageTitles = {
    dashboard: 'Dashboard', courses: 'Kurslar & Müfredat',
    students: 'Öğrenciler', groups: 'Gruplar',
    finance: 'Muhasebe', calendar: 'Takvim',
    chat: 'Mesajlar', liveClass: 'Canlı Sınıf',
    settings: 'Ayarlar', profile: 'Profil',
    notifications: 'Bildirimler',
  };

  const currentPage = document.querySelector('#app')?._currentPage || 'dashboard';

  return `
    <div style="display:flex;align-items:center;gap:12px;">
      <button class="icon-btn mobile-only" id="menu-toggle">
        ${icon('menu', 20)}
      </button>
      <div class="topbar-title">
        <h1>${pageTitles[currentPage] || 'Öğretmen Paneli'}</h1>
      </div>
    </div>
    <div class="topbar-actions">
      <button class="icon-btn" id="notif-btn" data-tooltip="Bildirimler">
        ${icon('bell', 18)}
        ${unreadCount > 0 ? `<span class="notif-badge">${unreadCount}</span>` : ''}
      </button>
      <div class="profile-chip" id="profile-btn">
        <div class="avatar" style="overflow:hidden; display:flex; align-items:center; justify-content:center;">
          ${state.profile.avatar ? `<img src="${state.profile.avatar}" style="width:100%;height:100%;object-fit:cover;">` : getInitials(state.profile.name)}
        </div>
        <div>
          <div class="name">${state.profile.name || 'Öğretmen'}</div>
          <div class="role">${state.profile.title || ''}</div>
        </div>
      </div>
    </div>
  `;
}

function getInitials(name) {
  return (name || 'Ö').split(' ').map(w => w ? w[0] : '').slice(0, 2).join('').toUpperCase();
}

export function toggleNotifPanel(navigate) {
  _notifPanelOpen = !_notifPanelOpen;
  const container = document.getElementById('notif-panel-container');
  if (!container) return;
  if (_notifPanelOpen) {
    const state = getState();
    container.innerHTML = renderNotifPanel(state, navigate);
    // Mark all read after 1 second
    setTimeout(() => {
      markAllNotificationsRead();
      const badge = document.querySelector('.notif-badge');
      if (badge) badge.remove();
    }, 1000);
  } else {
    container.innerHTML = '';
  }
}

function renderNotifPanel(state, navigate) {
  const notifs = state.notifications.slice(0, 15);
  return `
    <div class="notif-panel fade-in">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--border);">
        <span style="font-weight:700;font-size:14px;">Bildirimler</span>
        <button class="btn btn-ghost btn-sm" id="view-all-notifs">Tümünü Gör</button>
      </div>
      ${notifs.length === 0 ? '<div style="padding:24px;text-align:center;color:var(--text-muted);">Bildirim yok</div>' : ''}
      ${notifs.map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'}" data-notif-link="${n.link || ''}">
          <div class="notif-icon">
            ${n.type === 'warning' ? icon('alertCircle', 16) : n.type === 'success' ? icon('checkCircle', 16) : icon('bell', 16)}
          </div>
          <div>
            <div class="notif-text">${n.text}</div>
            <div class="notif-time">${formatDistanceToNow(new Date(n.time))}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

export function closeNotifPanel() {
  if (_notifPanelOpen) {
    _notifPanelOpen = false;
    const container = document.getElementById('notif-panel-container');
    if (container) container.innerHTML = '';
  }
}

export function toggleSidebar() {
  _sidebarOpen = !_sidebarOpen;
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.toggle('sidebar-open', _sidebarOpen);
  if (overlay) overlay.classList.toggle('active', _sidebarOpen);
}

export function closeSidebar() {
  _sidebarOpen = false;
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('sidebar-open');
  if (overlay) overlay.classList.remove('active');
}

export function refreshTopbar(state) {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;
  applyTheme(state);
  const unreadCount = (state.notifications || []).filter(n => !n.read).length;
  topbar.innerHTML = renderTopbar(state, unreadCount);
}

export function refreshSidebar(state, currentPage) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  applyTheme(state);
  sidebar.innerHTML = renderSidebar(state, currentPage, null);
}

export function applyTheme(state) {
  const color = state.settings.brandColor || '#004526';
  const root = document.documentElement;
  root.style.setProperty('--brand-green', color);
  root.style.setProperty('--bg-sidebar', color);
  root.style.setProperty('--accent', color);
  
  // Opaklık destekli açık ton (RGBA)
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  root.style.setProperty('--brand-green-soft', `rgba(${r}, ${g}, ${b}, 0.08)`);
  root.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.1)`);
}
