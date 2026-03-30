// ═══════════════════════════════════════════════════
// MAIN.JS - SPA Entry Point & Router
// ═══════════════════════════════════════════════════
import { initStore, getState, subscribe, getPendingLessons, getLessonStatus } from './store/store.js';
import { renderLayout, toggleNotifPanel, closeNotifPanel, refreshTopbar, refreshSidebar, toggleSidebar, closeSidebar, applyTheme } from './components/Layout.js';
import { subscribeToAuth } from './lib/auth.js';
import { icon } from './components/icons.js';

// ─── Initialize ───
// state initialization moved to init()

// ─── Router State ───
let currentPage = 'home';
let currentLayout = null; // Forces initial layout render

const PUBLIC_PAGES = ['home', 'forum', 'blog'];
const DASHBOARD_PAGES = ['dashboard', 'courses', 'students', 'groups', 'finance', 'calendar', 'chat', 'liveClass', 'publish', 'settings', 'profile', 'notifications', 'admin'];

// ─── Navigate function ───
async function navigate(page) {
  // Normalize page
  if (!PUBLIC_PAGES.includes(page) && !DASHBOARD_PAGES.includes(page)) {
    page = 'home';
  }

  const state = getState();
  const user = (await import('./lib/firebase.js')).auth.currentUser;

  // Protected route check
  if (DASHBOARD_PAGES.includes(page) && !user) {
    page = 'login';
  }

  currentPage = page;
  window.location.hash = page;

  const app = document.getElementById('app');
  if (app) app._currentPage = page;

  // Determine needed layout
  const neededLayout = DASHBOARD_PAGES.includes(page) ? 'dashboard' : (page === 'login' ? 'login' : 'public');

  if (currentLayout !== neededLayout) {
    currentLayout = neededLayout;
    if (neededLayout === 'dashboard') {
      const { renderLayout } = await import('./components/Layout.js');
      app.innerHTML = renderLayout(page, navigate);
    } else if (neededLayout === 'public') {
      const { renderPublicLayout } = await import('./components/PublicLayout.js');
      app.innerHTML = renderPublicLayout(page, navigate);
    } else if (neededLayout === 'login') {
      const { renderLogin, initLogin } = await import('./pages/Login.js');
      app.innerHTML = renderLogin();
      initLogin(app);
      return;
    }
  }

  // Update layout UI state
  if (currentLayout === 'dashboard') {
     const { refreshSidebar, refreshTopbar } = await import('./components/Layout.js');
     refreshSidebar(state, page);
     refreshTopbar(state);
  }

  // Render Page Content
  const containerId = currentLayout === 'dashboard' ? 'page-content' : 'public-content';
  const content = document.getElementById(containerId);
  if (!content) return;

  content.innerHTML = '<div style="display:flex;justify-content:center;padding:100px;"><div class="spinner"></div></div>';

  try {
    let module, result;
    if (page === 'home') {
      module = await import('./pages/PublicHome.js');
      result = module.renderPublicHome(navigate);
    } else if (page === 'forum') {
      module = await import('./pages/PublicForum.js');
      result = await module.renderPublicForum(navigate);
    } else if (page === 'blog') {
      module = await import('./pages/PublicBlog.js');
      result = await module.renderPublicBlog(navigate);
    } else {
      // Dashboard Pages
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
        case 'publish':
          module = await import('./pages/Publish.js');
          result = await module.renderPublish(navigate);
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
        case 'admin':
          if (user?.email !== 'aldibasozcan@gmail.com') {
             window.location.hash = 'dashboard';
             return;
          }
          module = await import('./pages/Admin.js');
          result = await module.renderAdmin(navigate);
          break;
      }
    }

    if (result?.html !== undefined) {
      content.innerHTML = result.html;
      if (result.init) result.init(content, navigate);
    }
  } catch (err) {
    console.error('Page load error:', err);
    content.innerHTML = `<div class="empty-state"><h3>Hata oluştu</h3><p>${err.message}</p></div>`;
  }

  // Common UI updates
  if (currentLayout === 'dashboard') {
    const { closeSidebar } = await import('./components/Layout.js');
    closeSidebar();
  }
  attachNavEvents();

  // Custom tour injection for dashboard
  if (page === 'dashboard' && user) {
     const { injectTour } = await import('./pages/modals/GuidedTour.js');
     injectTour(page, navigate);
  }
}

// ─── Domain Migration Notice ───
async function checkDomainMigration() {
  const currentHost = window.location.hostname;
  if (currentHost.includes('tarih-dukkani')) {
    const { openModal } = await import('./components/modal.js');
    // ... migration modal logic here if needed ...
  }
}

// ─── Initial Render ───
let _appInitialized = false;

async function init() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;"><div class="spinner"></div></div>';

  subscribeToAuth(async (user) => {
    // Determine start page from hash or default
    const hash = window.location.hash.replace('#', '');
    const startPage = hash || (user ? 'dashboard' : 'home');

    if (user) {
      if (!_appInitialized) {
        _appInitialized = true;
        await initStore();
        const state = getState();

        if (state && state.profile && !state.profile.onboarded) {
          const { renderOnboarding, initOnboarding } = await import('./pages/Onboarding.js');
          app.innerHTML = renderOnboarding();
          initOnboarding(app, async (profileData) => {
            const { updateProfile } = await import('./store/store.js');
            updateProfile({ ...profileData, onboarded: true });
            setTimeout(() => window.location.reload(), 1200);
          });
          return;
        }

        // Check for auto-start tour
        if (!state.profile.tourCompleted && !state.profile.tourAutoStarted && startPage === 'dashboard') {
           const { startTour } = await import('./store/store.js');
           startTour();
        }

        // State change subscription
        subscribe((newState) => {
          if (currentLayout === 'dashboard') {
            const { refreshTopbar } = import('./components/Layout.js').then(m => m.refreshTopbar(newState));
          }
        });
      }
    } else {
      _appInitialized = false;
    }

    navigate(startPage);
  });
}

function attachNavEvents() {
  const app = document.getElementById('app');
  if (!app || app._globalEventsBound) return;
  app._globalEventsBound = true;

  app.addEventListener('click', (e) => {
    const navEl = e.target.closest('[data-nav]');
    if (navEl) {
      e.preventDefault();
      e.stopPropagation();
      navigate(navEl.dataset.nav);
      return;
    }

    // Dashboard specific events
    if (currentLayout === 'dashboard') {
      const notifBtn = e.target.closest('#notif-btn');
      if (notifBtn) {
        import('./components/Layout.js').then(m => m.toggleNotifPanel(navigate));
        return;
      }
      const menuToggle = e.target.closest('#menu-toggle');
      if (menuToggle) {
        import('./components/Layout.js').then(m => m.toggleSidebar());
        return;
      }
      const logoutBtn = e.target.closest('#logout-btn');
      if (logoutBtn) {
        handleLogout(logoutBtn);
        return;
      }
    }
  });
}

async function handleLogout(btn) {
  btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;"></div>';
  const { logoutUser } = await import('./lib/auth.js');
  await logoutUser();
  window.location.hash = 'home';
  window.location.reload(); 
}

// ─── Hash routing ───
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash && hash !== currentPage) navigate(hash);
});

init();

