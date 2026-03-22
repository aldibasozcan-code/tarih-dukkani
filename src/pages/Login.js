// ═══════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════
import { loginUser, registerUser } from '../lib/auth.js';
import { icon } from '../components/icons.js';

export function renderLogin() {
  return `
    <div class="login-wrapper">
      <div class="login-container glass fade-in">
        <div class="login-header">
          <div class="login-logo-circle">
            ${icon('book', 32)}
          </div>
          <h2>Tarih Dükkanı</h2>
          <p class="login-subtitle">Öğretmen Paneli'ne Hoş Geldiniz</p>
        </div>
        
        <div class="login-tabs">
          <button class="login-tab active" data-tab="login">Giriş Yap</button>
          <button class="login-tab" data-tab="register">Kayıt Ol</button>
        </div>

        <div id="auth-alert" class="login-alert" style="display: none;"></div>

        <form id="auth-form" class="login-form">
          <div class="form-group">
            <label for="email">E-posta Adresi</label>
            <div class="input-with-icon">
              <!-- ${icon('mail', 18)} -->
              <svg stroke="currentColor" fill="none" viewBox="0 0 24 24" class="input-icon">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <input type="email" id="email" placeholder="ornek@email.com" required autocomplete="email" />
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">Şifre</label>
            <div class="input-with-icon">
              <svg stroke="currentColor" fill="none" viewBox="0 0 24 24" class="input-icon">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <input type="password" id="password" placeholder="••••••••" required autocomplete="current-password" />
            </div>
          </div>

          <button type="submit" class="btn btn-primary login-submit-btn">
            Mekana Giriş Yap
          </button>
        </form>
        
        <div class="login-footer">
          <p>© ${new Date().getFullYear()} Tarih Dükkanı. Tüm Hakları Saklıdır.</p>
        </div>
      </div>
    </div>
    
    <style>
      .login-wrapper {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: url('https://images.unsplash.com/photo-1524901548305-08eed8e01e15?q=80&w=2600&auto=format&fit=crop') center/cover no-repeat;
        position: relative;
      }
      .login-wrapper::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(0, 69, 38, 0.85) 0%, rgba(5, 150, 105, 0.6) 100%);
        backdrop-filter: blur(4px);
      }
      .login-container {
        width: 100%;
        max-width: 440px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: var(--radius-xl);
        padding: 40px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        position: relative;
        z-index: 10;
        backdrop-filter: blur(20px);
        transform: translateY(0);
        animation: floatUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes floatUp {
        0% { opacity: 0; transform: translateY(40px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .login-header {
        text-align: center;
        margin-bottom: 32px;
      }
      .login-logo-circle {
        width: 72px; height: 72px;
        background: var(--brand-green-soft);
        color: var(--brand-green);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 20px;
        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
      }
      .login-header h2 {
        font-size: 26px;
        font-weight: 800;
        color: var(--brand-green);
        letter-spacing: -0.5px;
      }
      .login-subtitle {
        color: var(--text-secondary);
        font-size: 14px;
        margin-top: 4px;
        font-weight: 500;
      }
      .login-tabs {
        display: flex;
        background: var(--bg-hover);
        border-radius: var(--radius-md);
        padding: 4px;
        margin-bottom: 24px;
      }
      .login-tab {
        flex: 1;
        padding: 10px;
        text-align: center;
        border: none;
        background: transparent;
        border-radius: var(--radius-sm);
        font-size: 14px;
        font-weight: 700;
        color: var(--text-secondary);
        cursor: pointer;
        transition: var(--transition);
      }
      .login-tab.active {
        background: #ffffff;
        color: var(--brand-green);
        box-shadow: var(--shadow-sm);
      }
      .input-with-icon {
        position: relative;
      }
      .input-with-icon .input-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        color: var(--text-muted);
        pointer-events: none;
      }
      .input-with-icon input {
        padding-left: 42px;
        height: 48px;
      }
      .login-submit-btn {
        width: 100%;
        height: 48px;
        font-size: 15px;
        margin-top: 12px;
        justify-content: center;
      }
      .login-alert {
        padding: 12px 16px;
        border-radius: var(--radius-md);
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 20px;
        text-align: center;
      }
      .login-alert.error {
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #fca5a5;
      }
      .login-alert.success {
        background: #d1fae5;
        color: #065f46;
        border: 1px solid #6ee7b7;
      }
      .login-footer {
        margin-top: 32px;
        text-align: center;
        color: var(--text-muted);
        font-size: 12px;
      }
      @media (max-width: 768px) {
        .login-container {
          padding: 24px;
          margin: 16px;
        }
        .login-header h2 { font-size: 22px; }
        .login-logo-circle { width: 56px; height: 56px; margin-bottom: 16px; }
        .login-logo-circle svg { width: 28px; height: 28px; }
      }
    </style>
  `;
}

export function initLogin(container) {
  let mode = 'login'; // 'login' or 'register'
  
  const form = container.querySelector('#auth-form');
  const alertBox = container.querySelector('#auth-alert');
  const emailInput = container.querySelector('#email');
  const passwordInput = container.querySelector('#password');
  const submitBtn = container.querySelector('.login-submit-btn');
  const tabs = container.querySelectorAll('.login-tab');
  
  // Switch Tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      mode = tab.dataset.tab;
      
      submitBtn.innerHTML = mode === 'login' ? 'Mekana Giriş Yap' : 'Kayıt Ol';
      alertBox.style.display = 'none';
    });
  });
  
  // Handle Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!email || !password) return;
    
    // UI Loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div>';
    submitBtn.disabled = true;
    
    try {
      if (mode === 'login') {
        await loginUser(email, password);
        // Success - onAuthStateChanged in main.js will handle the transition
      } else {
        await registerUser(email, password);
        // Display success but stay on page (app will redirect if user logs in automatically)
        alertBox.className = 'login-alert success';
        alertBox.innerHTML = 'Kayıt başarılı! Yönlendiriliyorsunuz...';
        alertBox.style.display = 'block';
      }
    } catch (err) {
      console.error(err);
      alertBox.className = 'login-alert error';
      // Basic Turkish error translations
      let msg = 'Bir hata oluştu.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'E-posta veya şifre hatalı.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Bu e-posta adresi zaten kullanımda.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Şifre çok zayıf. En az 6 karakter olmalı.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Geçersiz e-posta adresi.';
      }
      alertBox.innerHTML = msg;
      alertBox.style.display = 'block';
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });

  // Handle URL hash default
  if (window.location.hash === '#register') {
    const regTab = Array.from(tabs).find(t => t.dataset.tab === 'register');
    if (regTab) {
      regTab.click();
      window.history.replaceState(null, null, ' '); // remove hash cleanly
    }
  }
}
