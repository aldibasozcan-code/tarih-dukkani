// ═══════════════════════════════════════════════════
// ONBOARDING PAGE (Yeni Öğretmen Profil Kurulumu)
// ═══════════════════════════════════════════════════
import { ALL_GRADES, SUBJECTS, ALL_BRANCHES } from '../data/curriculum.js';
import { icon } from '../components/icons.js';

const HISTORY_GROUP = ["Sosyal Bilgiler", "T.C. İnkılap Tarihi ve Atatürkçülük", "Tarih"];
const MATH_GROUP = ["Matematik (İlköğretim)", "Matematik (Lise)"];

export function renderOnboarding() {
  return `
    <div class="onboarding-wrapper">
      <div class="onboarding-container glass fade-in">
        <div class="onboarding-header" style="padding: 24px 32px; border-bottom: 1px solid var(--border); text-align: center; flex-shrink: 0; background: rgba(255,255,255,0.95); position: relative; z-index: 2;">
          <div class="login-logo-circle" style="margin-bottom: 12px; width: 64px; height: 64px;">
            ${icon('book', 28)}
          </div>
          <h2 style="font-size: 22px; font-weight: 800; color: var(--brand-green); margin-bottom: 4px;">Bitig.app</h2>
          <p class="login-subtitle" style="font-size: 15px; color: var(--brand-green); margin: 0;">Sisteme Hoş Geldiniz!</p>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 8px; line-height: 1.4;">
            Uygulamayı branşınıza ve profesyonel kariyerinize göre şekillendirebilmemiz için lütfen aşağıdaki bilgileri doldurun.
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
                <label for="ob-title">Unvan / Branş</label>
                <select id="ob-title" style="height: 48px; width: 100%;">
                  <option value="" disabled selected>Branş Seçin...</option>
                  ${ALL_BRANCHES.map(branch => `<option value="${branch}">${branch} Öğretmeni</option>`).join('')}
                  <option value="Öğretmen">Diğer / Sadece Öğretmen</option>
                </select>
              </div>
            </div>

            <!-- 2 Column Selection Lists -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; max-width: 800px; margin: 0 auto;">
              
              <!-- Branches (Selection List) -->
              <div class="form-group" style="margin: 0;">
                <label style="margin-bottom: 12px; display: block; font-size: 14px; font-weight: 700; color: var(--brand-green);">
                  Uzmanlık Branşınız
                </label>
                <div class="selection-list" id="branch-selection-list" style="display: flex; flex-direction: column; gap: 8px;">
                  ${ALL_BRANCHES.map(branch => `
                    <label class="selection-item ${HISTORY_GROUP.includes(branch) || MATH_GROUP.includes(branch) ? 'history-group-item' : ''}">
                      <input type="checkbox" name="branches" value="${branch}">
                      <div class="selection-box">
                        <span class="selection-label">${branch}</span>
                        <div class="selection-check">${icon('check', 14)}</div>
                      </div>
                    </label>
                  `).join('')}
                </div>
                <p style="font-size:11px; color:var(--text-muted); margin-top:8px;">
                  Profesyonellik gereği uzmanlık alanınızı seçmelisiniz. (Tarih ve Matematik gruplarında çoklu seçim yapılabilir).
                </p>
              </div>

              <!-- Grades (Selection List) -->
              <div class="form-group" style="margin: 0;">
                <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:12px;">
                  <label style="margin-bottom: 0; display: block; font-size: 14px; font-weight: 700; color: var(--brand-green);">Hizmet Verdiğiniz Sınıflar</label>
                  <button type="button" id="btn-select-all-grades" style="font-size:11px; color:var(--accent); background:none; border:none; padding:0; cursor:pointer; font-weight:600; display:none;">TÜMÜNÜ SEÇ</button>
                </div>
                <div class="selection-list" id="grade-selection-list" style="display: flex; flex-direction: column; gap: 8px;">
                  ${ALL_GRADES.map(grade => `
                    <label class="selection-item">
                      <input type="checkbox" name="grades" value="${grade}">
                      <div class="selection-box">
                        <span class="selection-label">${grade}</span>
                        <div class="selection-check">${icon('check', 14)}</div>
                      </div>
                    </label>
                  `).join('')}
                </div>
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
      @media (max-width: 768px) {
        .onboarding-header { padding: 20px 24px !important; }
        .onboarding-body { padding: 20px 24px !important; }
        .onboarding-footer { padding: 16px 24px !important; }
        .onboarding-body > div[style*="max-width: 800px"] {
          grid-template-columns: 1fr !important;
          gap: 24px !important;
        }
      }
    </style>
  `;
}

export function initOnboarding(container, onComplete) {
  const form = container.querySelector('#onboarding-form');
  const btn = container.querySelector('.login-submit-btn');
  const selectAllGradesBtn = container.querySelector('#btn-select-all-grades');

  // Branş Seçim Mantığı
  const branchCheckboxes = form.querySelectorAll('input[name="branches"]');
  branchCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const val = cb.value;
      const isHistory = HISTORY_GROUP.includes(val);
      const isMath = MATH_GROUP.includes(val);

      if (cb.checked) {
        if (isHistory) {
          // Tarih grubuysa grupta olmayanları temizle
          branchCheckboxes.forEach(other => {
            if (!HISTORY_GROUP.includes(other.value)) other.checked = false;
          });
        } else if (isMath) {
          // Matematik grubuysa grupta olmayanları temizle
          branchCheckboxes.forEach(other => {
            if (!MATH_GROUP.includes(other.value)) other.checked = false;
          });
        } else {
          // Diğer branşlar tekildir
          branchCheckboxes.forEach(other => {
            if (other !== cb) other.checked = false;
          });
        }
      }

      // "Tümünü Seç" butonunu sadece tarih veya matematik grubu seçiliyse göster
      const isAcademicGroup = Array.from(branchCheckboxes).some(c => 
        c.checked && (HISTORY_GROUP.includes(c.value) || MATH_GROUP.includes(c.value))
      );
      if (selectAllGradesBtn) {
        selectAllGradesBtn.style.display = isAcademicGroup ? 'block' : 'none';
      }
    });
  });

  // Tüm Sınıfları Seç Butonu
  selectAllGradesBtn?.addEventListener('click', () => {
    const gradeCheckboxes = form.querySelectorAll('input[name="grades"]');
    const allChecked = Array.from(gradeCheckboxes).every(c => c.checked);
    gradeCheckboxes.forEach(c => c.checked = !allChecked);
    selectAllGradesBtn.textContent = !allChecked ? 'SEÇİMİ KALDIR' : 'TÜMÜNÜ SEÇ';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = form.querySelector('#ob-name').value.trim();
    const phone = form.querySelector('#ob-phone').value.trim();
    const titleSelect = form.querySelector('#ob-title');
    const titleValue = titleSelect.options[titleSelect.selectedIndex].text;
    const branchValue = titleSelect.value;
    
    if (!name || !phone || !branchValue) {
      alert('Lütfen Ad Soyad, Telefon ve Branş/Unvan alanlarını eksiksiz doldurun.');
      return;
    }
    
    const gradesBoxes = form.querySelectorAll('input[name="grades"]:checked');
    const selectedGrades = Array.from(gradesBoxes).map(b => b.value);
    
    const branchBoxes = form.querySelectorAll('input[name="branches"]:checked');
    let selectedBranches = Array.from(branchBoxes).map(b => b.value);
    
    if (branchValue !== "Öğretmen" && !selectedBranches.includes(branchValue)) {
      selectedBranches.push(branchValue);
    }
    
    btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></div> Hazırlanıyor...';
    btn.disabled = true;

    const profileData = {
      name, phone, title: titleValue,
      grades: selectedGrades,
      branches: selectedBranches,
      city: '', bio: '', experience: '', rate: '', avatar: null
    };

    if (typeof onComplete === 'function') onComplete(profileData);
  });

  form.querySelector('#ob-title')?.addEventListener('change', (e) => {
    const branchVal = e.target.value;
    if (branchVal !== "Öğretmen") {
      const checkbox = form.querySelector(`input[name="branches"][value="${branchVal}"]`);
      if (checkbox) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change'));
      }
    }
  });
}
