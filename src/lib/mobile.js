// ═══════════════════════════════════════════════════
// MOBILE INITIALIZATION & CAPACITOR BRIDGE
// ═══════════════════════════════════════════════════
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { closeModal } from '../components/modal.js';
import { closeSidebar, closeNotifPanel } from '../components/Layout.js';

let _backButtonToastTimeout = null;
let _lastBackPressTime = 0;

export async function initMobileApp(navigate) {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform(); // 'ios', 'android', 'web'

  // Mark platform classes on document body
  document.body.classList.add(`platform-${platform}`);
  if (isNative) {
    document.body.classList.add('is-native-app');
  }

  // Native plugin configurations (only executed on real Android/iOS)
  if (!isNative) {
    return;
  }

  try {
    // 1. Status Bar Setup
    if (Capacitor.isPluginAvailable('StatusBar')) {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        if (platform === 'android') {
          await StatusBar.setBackgroundColor({ color: '#004526' });
          await StatusBar.setOverlaysWebView({ overlay: false });
        }
      } catch (e) {
        console.warn('[Mobile] StatusBar init warning:', e);
      }
    }

    // 2. Splash Screen Auto-Hide
    if (Capacitor.isPluginAvailable('SplashScreen')) {
      try {
        setTimeout(async () => {
          await SplashScreen.hide({ fadeOutDuration: 400 });
        }, 600);
      } catch (e) {
        console.warn('[Mobile] SplashScreen hide warning:', e);
      }
    }

    // 3. Keyboard Mode
    if (Capacitor.isPluginAvailable('Keyboard')) {
      try {
        Keyboard.setAccessoryBarVisible({ isVisible: true });
      } catch (e) {}
    }

    // 4. Android Hardware Back Button Handling
    if (Capacitor.isPluginAvailable('App')) {
      App.addListener('backButton', async () => {
        // Priority 1: Close active modal
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer && modalContainer.children.length > 0) {
          closeModal();
          return;
        }

        // Priority 2: Close notification panel
        const notifContainer = document.getElementById('notif-panel-container');
        if (notifContainer && notifContainer.children.length > 0) {
          closeNotifPanel();
          return;
        }

        // Priority 3: Close open sidebar
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('sidebar-open')) {
          closeSidebar();
          return;
        }

        // Priority 4: Navigate to dashboard if on another page
        const app = document.getElementById('app');
        const currentPage = app?._currentPage || window.location.hash.replace('#', '');
        if (currentPage && currentPage !== 'dashboard' && currentPage !== 'login') {
          navigate('dashboard');
          return;
        }

        // Priority 5: Double press back button to exit on main screen
        const now = Date.now();
        if (now - _lastBackPressTime < 2000) {
          App.exitApp();
        } else {
          _lastBackPressTime = now;
          showExitToast('Çıkmak için tekrar basın');
        }
      });
    }
  } catch (err) {
    console.error('[Mobile] Initialization error:', err);
  }
}

function showExitToast(msg) {
  let toast = document.getElementById('mobile-exit-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'mobile-exit-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: max(32px, env(safe-area-inset-bottom, 24px));
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.92);
      color: #ffffff;
      padding: 10px 22px;
      border-radius: 24px;
      font-size: 13px;
      font-weight: 700;
      z-index: 999999;
      pointer-events: none;
      backdrop-filter: blur(10px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
      transition: opacity 0.25s ease;
      letter-spacing: 0.2px;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(_backButtonToastTimeout);
  _backButtonToastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
  }, 2000);
}
