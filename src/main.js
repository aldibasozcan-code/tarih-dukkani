// ═══════════════════════════════════════════════════
// MAIN.JS - SPA Entry Point & Router
// ═══════════════════════════════════════════════════
import { initStore, getState, subscribe, getPendingLessons, getLessonStatus } from './store/store.js';
import { renderLayout, toggleNotifPanel, closeNotifPanel, refreshTopbar, refreshSidebar, toggleSidebar, closeSidebar } from './components/Layout.js';
import { subscribeToAuth } from './lib/auth.js';

// ─── Initialize ───
// state initialization moved to init()

// ─── Router State ───
let currentPage = 'dashboard';

// ─── Navigate function ───
async function navigate(page) {
  currentPage = page;

  // Update URL hash
  window.location.hash = page;

  // Update sidebar active state
  refreshSidebar(getState(), page);
  refreshTopbar(getState());

  // Update topbar title (patch the hidden data attr)
  const app = document.getElementById('app');
  if (app) app._currentPage = page;

  // Load and render page
  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = '<div style="display:flex;justify-content:center;padding:60px;"><div class="spinner"></div></div>';

  try {
    let module, result;
    switch (page) {
      case 'dashboard':
        module = await import('./pages/Dashboard.js');
        result = module.renderDashboard(navigate);
        break;
      case 'courses':
        module = await import('./pages/Courses.js');
        result = module.renderCourses(navigate);
        break;
      case 'students':
        module = await import('./pages/Students.js');
        result = module.renderStudents(navigate);
        break;
      case 'groups':
        module = await import('./pages/Groups.js');
        result = module.renderGroups(navigate);
        break;
      case 'finance':
        module = await import('./pages/Finance.js');
        result = module.renderFinance(navigate);
        break;
      case 'calendar':
        module = await import('./pages/Calendar.js');
        result = module.renderCalendar(navigate);
        break;
      case 'chat':
        module = await import('./pages/Chat.js');
        result = module.renderChat(navigate);
        break;
      case 'liveClass':
        module = await import('./pages/LiveClass.js');
        result = module.renderLiveClass(navigate);
        break;
      case 'settings':
        module = await import('./pages/Settings.js');
        result = module.renderSettings(navigate);
        break;
      case 'profile':
        module = await import('./pages/Settings.js');
        result = module.renderProfile(navigate);
        break;
      case 'notifications':
        module = await import('./pages/Settings.js');
        result = module.renderNotifications(navigate);
        break;
      default:
        content.innerHTML = '<div class="empty-state"><h3>Sayfa bulunamadı</h3></div>';
        return;
    }

    if (result?.html !== undefined) {
      content.innerHTML = result.html;
      if (result.init) {
        result.init(content, navigate);
      }
    }
  } catch (err) {
    console.error('Page load error:', err);
    content.innerHTML = `<div class="empty-state"><h3>Sayfa yüklenirken hata oluştu</h3><p>${err.message}</p></div>`;
  }

  // Close sidebar on mobile after navigation
  closeSidebar();

  // Re-attach sidebar/topbar nav events
  attachNavEvents();
}

// ─── Initial Render ───
let _appInitialized = false;

async function init() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;"><div class="spinner"></div></div>';

  subscribeToAuth(async (user) => {
    if (user) {
      if (!_appInitialized) {
        _appInitialized = true;
        await initStore(); // Load from Firebase or local

        app.innerHTML = renderLayout(currentPage, navigate);
        app._currentPage = currentPage;

        // Set page from hash
        const hash = window.location.hash.replace('#', '');
        const validPages = ['dashboard','courses','students','groups','finance','calendar','chat','liveClass','settings','profile','notifications'];
        const startPage = validPages.includes(hash) ? hash : 'dashboard';

        attachNavEvents();
        navigate(startPage);

        // Subscribe to state changes to update topbar
        subscribe((newState) => {
          refreshTopbar(newState);
          const pendingCount = newState.notifications.filter(n => !n.read).length;
          // Update notification badge
          const badge = document.querySelector('.notif-badge');
          if (badge) badge.textContent = pendingCount;
          else if (pendingCount > 0) {
            const notifBtn = document.getElementById('notif-btn');
            if (notifBtn && !notifBtn.querySelector('.notif-badge')) {
              const b = document.createElement('span');
              b.className = 'notif-badge';
              b.textContent = pendingCount;
              notifBtn.appendChild(b);
            }
          }
        });

        // Periodic check for pending lessons (every 5 minutes)
        setInterval(checkPendingLessons, 5 * 60 * 1000);
        checkPendingLessons();
      }
    } else {
      // User is logged out
      _appInitialized = false;
      const { renderLogin, initLogin } = await import('./pages/Login.js');
      app.innerHTML = renderLogin();
      initLogin(app);
    }
  });
}

function attachNavEvents() {
  // Sidebar nav items
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      navigate(el.dataset.nav);
    });
  });

  // Notification button
  const notifBtn = document.getElementById('notif-btn');
  if (notifBtn && !notifBtn._bound) {
    notifBtn._bound = true;
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNotifPanel(navigate);
    });
  }

  // Profile chip
  const profileBtn = document.getElementById('profile-btn');
  if (profileBtn && !profileBtn._bound) {
    profileBtn._bound = true;
    profileBtn.addEventListener('click', () => {
      closeNotifPanel();
      navigate('profile');
    });
  }

  // Close notif panel on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#notif-btn') && !e.target.closest('.notif-panel')) {
      closeNotifPanel();
    }
  }, { once: false });

  // View all notifications link
  document.getElementById('view-all-notifs')?.addEventListener('click', () => {
    closeNotifPanel();
    navigate('notifications');
  });

  // Notif items
  document.querySelectorAll('[data-notif-link]').forEach(el => {
    el.addEventListener('click', () => {
      const link = el.dataset.notifLink;
      closeNotifPanel();
      if (link) navigate(link);
    });
  });

  // Mobile Menu Toggle
  document.getElementById('menu-toggle')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSidebar();
  });

  // Sidebar Overlay
  document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
    closeSidebar();
  });

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn && !logoutBtn._bound) {
    logoutBtn._bound = true;
    logoutBtn.addEventListener('click', async () => {
      logoutBtn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;border-color:var(--danger);border-top-color:transparent;display:inline-block;"></div> Çıkış Yapılıyor...';
      try {
        const { logoutUser } = await import('./lib/auth.js');
        await logoutUser();
        window.location.reload(); // clear JS memory fully
      } catch(err) {
        console.error(err);
        logoutBtn.innerHTML = 'Hata Oluştu';
      }
    });
  }
}

function checkPendingLessons() {
  const pending = getPendingLessons();
  if (pending.length > 0) {
    import('./store/store.js').then(m => {
      m.addNotification({
        type: 'warning',
        text: `${pending.length} ders onay bekliyor`,
        link: 'dashboard',
      });
    });
  }
}

// ─── Hash routing ───
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash && hash !== currentPage) navigate(hash);
});

// ─── Start ───
init();
