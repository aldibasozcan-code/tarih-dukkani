// ═══════════════════════════════════════════════════
// ONBOARDING PAGE (Yeni Öğretmen Profil Kurulumu)
// ═══════════════════════════════════════════════════
import { ALL_GRADES, SUBJECTS, ALL_BRANCHES } from '../data/curriculum.js';
import { icon } from '../components/icons.js';

export function renderOnboarding() {
  return `
    <div class="onboarding-wrapper">
      <div class="onboarding-container glass fade-in">
        <div class="onboarding-header" style="padding: 24px 32px; border-bottom: 1px solid var(--border); text-align: center; flex-shrink: 0; background: rgba(255,255,255,0.95); position: relative; z-index: 2;">
          <div class="login-logo-circle" style="margin-bottom: 12px; width: 64px; height: 64px;">
            ${icon('book', 28)}
          </div>
          <h2 style="font-size: 22px; font-weight: 800; color: var(--brand-green); margin-bottom: 4px;">Tarih Dükkanı</h2>
          <p class="login-subtitle" style="font-size: 15px; color: var(--brand-green); margin: 0;">Sisteme Hoş Geldiniz!</p>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 8px; line-height: 1.4;">
            Uygulamayı kendi derslerinize ve öğrencilerinize göre şekillendirebilmemiz için lütfen aşağıdaki bilgileri doldurun.
          </p>
        </div>

        <form id="onboarding-form" class="onboarding-form" style="display: flex; flex-direction: column; flex: 1; overflow: hidden; margin: 0;">
          <div class="onboarding-body" style="flex: 1; overflow-y: auto; padding: 24px 32px;">
            
            <!-- 3 Column Info Row -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
              <div class="form-group" style="margin: 0;">
                <label for="ob-name">Ad Soyad</label>
                <input type="text" id="ob-name" placeholder="Örn: Ahmet Yılmaz" />
              </div>
              <div class="form-group" style="margin: 0;">
                <label for="ob-phone">Telefon Numarası</label>
                <input type="tel" id="ob-phone" placeholder="0555 123 4567" />
              </div>
              <div class="form-group" style="margin: 0;">
                <label for="ob-title">Unvan (Sıfat)</label>
                <input type="text" id="ob-title" placeholder="Örn: Uzman Öğretmen" />
              </div>
            </div>

            <!-- 2 Column Lists Row -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
              
              <!-- Branches -->
              <div class="form-group" style="margin: 0;">
                <label style="margin-bottom: 12px; display: block; font-size: 14px; font-weight: 700; color: var(--brand-green);">Branşlar (Dersler)</label>
                <div class="multi-select-grid">
                  ${ALL_BRANCHES.map(branch => `
                    <label class="checkbox-label">
                      <input type="checkbox" name="branches" value="${branch}">
                      <span class="checkbox-custom"></span>
                      ${branch}
                    </label>
                  `).join('')}
                </div>
              </div>

              <!-- Grades -->
              <div class="form-group" style="margin: 0;">
                <label style="margin-bottom: 12px; display: block; font-size: 14px; font-weight: 700; color: var(--brand-green);">Sınıflar (Seviyeler)</label>
                <div class="multi-select-grid">
                  ${ALL_GRADES.map(grade => `
                    <label class="checkbox-label">
                      <input type="checkbox" name="grades" value="${grade}">
                      <span class="checkbox-custom"></span>
                      ${grade}
                    </label>
                  `).join('')}
                </div>
                <p style="font-size:11px; color:var(--text-muted); margin-top:8px;">Birden fazla seçenek işaretleyebilirsiniz.</p>
              </div>

            </div>
          </div>

          <div class="onboarding-footer" style="padding: 20px 32px; border-top: 1px solid var(--border); background: #f8fafc; flex-shrink: 0; display: flex; justify-content: flex-end; align-items: center;">
            <button type="submit" class="btn btn-primary login-submit-btn" style="height: 44px; padding: 0 24px; font-size: 15px;">
              Kurulumu Tamamla ve Başla ${icon('check', 16)}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <style>
      .onboarding-wrapper {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: url('https://images.unsplash.com/photo-1524901548305-08eed8e01e15?q=80&w=2600&auto=format&fit=crop') center/cover no-repeat;
        position: relative;
        padding: 24px;
      }
      .onboarding-wrapper::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(0, 69, 38, 0.9) 0%, rgba(5, 150, 105, 0.75) 100%);
        backdrop-filter: blur(8px);
      }
      .onboarding-container {
        width: 100%;
        max-width: 900px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.95);
        border-radius: var(--radius-xl);
        padding: 0;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        position: relative;
        z-index: 10;
        backdrop-filter: blur(20px);
        transform: translateY(0);
        animation: floatUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .multi-select-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 12px;
        margin-bottom: 8px;
      }
      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-primary);
        cursor: pointer;
        padding: 8px 12px;
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        transition: var(--transition);
        background: #fff;
      }
      .checkbox-label:hover {
        border-color: var(--brand-green-light);
        background: var(--brand-green-soft);
      }
      .checkbox-label input:checked + .checkbox-custom + span {
        color: var(--brand-green);
      }
      .checkbox-label:has(input:checked) {
        border-color: var(--brand-green);
        background: var(--brand-green-soft);
        box-shadow: inset 0 0 0 1px var(--brand-green);
      }
      .checkbox-label input {
        width: 16px;
        height: 16px;
        accent-color: var(--brand-green);
        cursor: pointer;
      }
      /* Hızlı Kaydırma Çubuğu Stili */
      .onboarding-body::-webkit-scrollbar {
        width: 8px;
      }
      .onboarding-body::-webkit-scrollbar-track {
        background: rgba(0,0,0,0.02);
      }
      .onboarding-body::-webkit-scrollbar-thumb {
        background: rgba(0,0,0,0.15);
        border-radius: 10px;
      }

      @media (max-width: 768px) {
        .onboarding-header {
          padding: 20px 24px !important;
        }
        .onboarding-body {
          padding: 20px 24px !important;
        }
        .onboarding-footer {
          padding: 16px 24px !important;
        }
        /* Grid çökmelerini engelle */
        .onboarding-body > div[style*="grid-template-columns: repeat(3"] {
          grid-template-columns: 1fr !important;
        }
        .onboarding-body > div[style*="grid-template-columns: 1fr 1fr"] {
          grid-template-columns: 1fr !important;
          gap: 24px !important;
        }
        .multi-select-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
      }
    </style>
  `;
}

export function initOnboarding(container, onComplete) {
  const form = container.querySelector('#onboarding-form');
  const btn = container.querySelector('.login-submit-btn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Gerekli değerleri topla
    const name = form.querySelector('#ob-name').value.trim();
    const phone = form.querySelector('#ob-phone').value.trim();
    const title = form.querySelector('#ob-title').value.trim();
    
    if (!name || !phone || !title) {
      alert('Lütfen Ad Soyad, Telefon ve Unvan alanlarını eksiksiz doldurun.');
      return;
    }
    
    const gradesBoxes = form.querySelectorAll('input[name="grades"]:checked');
    const selectedGrades = Array.from(gradesBoxes).map(b => b.value);
    
    const branchBoxes = form.querySelectorAll('input[name="branches"]:checked');
    const selectedBranches = Array.from(branchBoxes).map(b => b.value);
    
    // UI Feedback
    btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></div> Hazırlanıyor...';
    btn.disabled = true;

    // Profil objesi oluşturuluyor
    const profileData = {
      name,
      phone,
      title: title || 'Öğretmen',
      grades: selectedGrades,
      branches: selectedBranches,
      // Seçilmeyen diğer alanlar daha sonra Settings sayfasından doldurulabilir
      city: '',
      bio: '',
      experience: '',
      rate: '',
      avatar: null
    };

    // Callback ile main.js veya render Layout sürecine haber ver
    if (typeof onComplete === 'function') {
      onComplete(profileData);
    }
  });
}
