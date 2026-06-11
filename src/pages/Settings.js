// ═════════════════════════════════════════════════
// SETTINGS PAGE - Premium & Rich
// ═════════════════════════════════════════════════
import { getState, updateSettings, updateProfile } from '../store/store.js';
import { ALL_GRADES, ALL_BRANCHES } from '../data/curriculum.js';
import { icon } from '../components/icons.js';

const HISTORY_GROUP = ["Sosyal Bilgiler", "T.C. İnkılap Tarihi ve Atatürkçülük", "Tarih"];
const MATH_GROUP = ["Matematik (İlköğretim)", "Matematik (Lise)"];

const APP_VERSION = '1.2.0';
const BUILD_DATE = '2026-06-11';

function showBranchPolicyModal(m) {
  m.openModal({
    title: 'Branş Değişikliği Politikası',
    body: `
      <div style="text-align:center; padding: 10px 0;">
        <div style="color:var(--accent); margin-bottom:16px;">
          ${icon('alertCircle', 48)}
        </div>
        <h3 style="font-size:18px; margin-bottom:8px; color:var(--text-primary);">Profesyonel Branş Yönetimi</h3>
        <p style="color:var(--text-secondary); line-height:1.6; font-size:14px;">
          Bitig.app, öğretmenlerimizin uzmanlık alanlarında en yüksek verimi almasını hedefler. Bu nedenle profesyonel standartlar gereği <strong>branş değişikliği kısıtlanmıştır</strong>.
        </p>
        <div style="background:var(--bg-secondary); border-radius:12px; padding:16px; margin:20px 0; text-align:left; border:1px solid var(--border);">
          <ul style="margin:0; padding-left:20px; font-size:13px; color:var(--text-secondary); line-height:1.8;">
            <li>Sadece uzman olduğunuz ana branşı seçebilirsiniz.</li>
            <li><strong>Tarih (Tarih, Sosyal, İnkılap)</strong> ve <strong>Matematik (İlköğretim, Lise)</strong> dersleri akademik grup olarak istisnadır.</li>
            <li>Branşınızı tamamen değiştirmek isterseniz mevcut verilerinizi silip (Veri Yönetimi kısmından) yeni branşınızla hesap açmanız önerilir.</li>
          </ul>
        </div>
      </div>
    `,
    footer: `
      <button class="btn btn-primary" id="modal-close-policy" style="width:100%; justify-content:center;">Anladım, Devam Et</button>
    `
  });
  document.getElementById('modal-close-policy')?.addEventListener('click', m.closeModal);
}

export function renderSettings(navigate) {
  const state = getState();

  // Compute stats
  const totalLessons = state.lessons?.length || 0;
  const completedLessons = state.lessons?.filter(l => l.status === 'completed').length || 0;
  const totalStudents = state.students?.length || 0;
  const totalGroups = state.groups?.length || 0;
  const totalTransactions = state.transactions?.length || 0;
  const dataSize = Math.round(JSON.stringify(state).length / 1024);

  const html = `
    <div class="fade-in">
      <!-- Page Header -->
      <div class="page-header" style="background: linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(99,102,241,0.02) 100%); padding: 32px 24px; border-radius: 20px; margin-bottom: 32px; border: 1px solid rgba(16,185,129,0.15); box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
        <div>
          <h2 style="font-size: 32px; font-weight: 800; color: var(--brand-green); margin-bottom: 8px; display: flex; align-items: center; gap: 12px; letter-spacing: -0.5px;">
            ${icon('settings', 32)} Ayarlar
          </h2>
          <p style="color: var(--text-secondary); font-size: 16px; font-weight: 500;">Uygulama tercihlerinizi özelleştirin ve sistemi yönetin</p>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <div style="background: var(--brand-green); color: white; border-radius: 10px; padding: 8px 16px; font-size: 13px; font-weight: 700;">
            v${APP_VERSION}
          </div>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-4 fade-in-up stagger-1" style="margin-bottom: 32px; gap: 16px;">
        <div class="kpi-card hover-lift" style="border-left: 4px solid var(--brand-green); padding: 16px 20px; background: rgba(255,255,255,0.7);">
          <div class="kpi-icon" style="background: rgba(16,185,129,0.1); color: var(--brand-green); width:42px; height:42px; border-radius:10px;">
            ${icon('user', 20)}
          </div>
          <div>
            <div class="kpi-value" style="font-size:20px; font-weight:800;">${totalStudents}</div>
            <div class="kpi-label" style="font-size:12px;">Öğrenci</div>
          </div>
        </div>
        <div class="kpi-card hover-lift" style="border-left: 4px solid #7c6aff; padding: 16px 20px; background: rgba(255,255,255,0.7);">
          <div class="kpi-icon" style="background: rgba(124,106,255,0.1); color:#7c6aff; width:42px; height:42px; border-radius:10px;">
            ${icon('group', 20)}
          </div>
          <div>
            <div class="kpi-value" style="font-size:20px; font-weight:800;">${totalGroups}</div>
            <div class="kpi-label" style="font-size:12px;">Grup</div>
          </div>
        </div>
        <div class="kpi-card hover-lift" style="border-left: 4px solid #ff9f43; padding: 16px 20px; background: rgba(255,255,255,0.7);">
          <div class="kpi-icon" style="background: rgba(255,159,67,0.1); color:#ff9f43; width:42px; height:42px; border-radius:10px;">
            ${icon('checkCircle', 20)}
          </div>
          <div>
            <div class="kpi-value" style="font-size:20px; font-weight:800;">${completedLessons}</div>
            <div class="kpi-label" style="font-size:12px;">Tamamlanan Ders</div>
          </div>
        </div>
        <div class="kpi-card hover-lift" style="border-left: 4px solid #ef4444; padding: 16px 20px; background: rgba(255,255,255,0.7);">
          <div class="kpi-icon" style="background: rgba(239,68,68,0.1); color:#ef4444; width:42px; height:42px; border-radius:10px;">
            ${icon('database', 20)}
          </div>
          <div>
            <div class="kpi-value" style="font-size:20px; font-weight:800;">${dataSize} KB</div>
            <div class="kpi-label" style="font-size:12px;">Veri Boyutu</div>
          </div>
        </div>
      </div>

      <!-- Settings Tabs -->
      <div style="margin-bottom: 24px;">
        <div class="tabs" style="padding: 4px; background: var(--bg-secondary); border-radius: var(--radius-md); display: inline-flex; flex-wrap: wrap; gap: 4px;" id="settings-tabs">
          <button class="tab-btn active settings-tab" data-settings-tab="branding" style="padding: 8px 18px; font-size:13px; font-weight:700; border-radius:8px; display:flex; align-items:center; gap:6px;">
            ${icon('star', 14)} Markalaşma
          </button>
          <button class="tab-btn settings-tab" data-settings-tab="data" style="padding: 8px 18px; font-size:13px; font-weight:700; border-radius:8px; display:flex; align-items:center; gap:6px;">
            ${icon('database', 14)} Veri Yönetimi
          </button>
          <button class="tab-btn settings-tab" data-settings-tab="curriculum" style="padding: 8px 18px; font-size:13px; font-weight:700; border-radius:8px; display:flex; align-items:center; gap:6px;">
            ${icon('book', 14)} Müfredat
          </button>
          <button class="tab-btn settings-tab" data-settings-tab="preferences" style="padding: 8px 18px; font-size:13px; font-weight:700; border-radius:8px; display:flex; align-items:center; gap:6px;">
            ${icon('settings', 14)} Tercihler
          </button>
          <button class="tab-btn settings-tab" data-settings-tab="about" style="padding: 8px 18px; font-size:13px; font-weight:700; border-radius:8px; display:flex; align-items:center; gap:6px;">
            ${icon('alertCircle', 14)} Hakkında
          </button>
        </div>
      </div>

      <!-- TAB: Markalaşma -->
      <div id="settings-tab-branding" class="settings-tab-content">
        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; align-items: start;">
          <!-- Left: Form -->
          <div class="card" style="padding: 28px;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid var(--border);">
              <div style="width:38px;height:38px;background:rgba(16,185,129,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--brand-green);">
                ${icon('star', 18)}
              </div>
              <div>
                <div style="font-size:16px;font-weight:800;color:var(--text-primary);">Uygulama Kimliği & Markalaşma</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:1px;">Sidebar görünümünü ve marka renklerini özelleştirin</div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Uygulama Adı</label>
                <input type="text" id="app-name" value="${state.settings.appName || 'Bitig.app'}" placeholder="Uygulama adı">
              </div>
              <div class="form-group">
                <label>Logo (URL)</label>
                <input type="url" id="app-logo" value="${state.settings.logo || ''}" placeholder="https://...">
              </div>
            </div>

            <div class="form-group">
              <label>Alt Bilgi Metni (Sidebar)</label>
              <input type="text" id="app-footer" value="${state.settings.footerText || 'v1.0 • Bitig.app'}" placeholder="v1.0 • Marka Adınız">
            </div>

            <div class="form-group">
              <label>Marka Rengi</label>
              <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
                <input type="color" id="app-color" value="${state.settings.brandColor || '#004526'}" style="width:50px; height:44px; padding:2px; border-radius:8px; cursor:pointer;">
                <div id="color-presets" style="display:flex; gap:8px; flex-wrap:wrap;">
                  ${[
                    { c: '#004526', name: 'Orman' },
                    { c: '#1e40af', name: 'Lacivert' },
                    { c: '#7c3aed', name: 'Mor' },
                    { c: '#db2777', name: 'Pembe' },
                    { c: '#059669', name: 'Zümrüt' },
                    { c: '#111827', name: 'Gece' },
                    { c: '#b45309', name: 'Amber' },
                    { c: '#0284c7', name: 'Gökyüzü' }
                  ].map(({ c, name }) => `
                    <button class="color-preset" data-color="${c}" title="${name}" style="width:28px; height:28px; border-radius:50%; background:${c}; border:2px solid ${(state.settings.brandColor || '#004526') === c ? 'var(--text-primary)' : 'transparent'}; cursor:pointer; transition: all 0.2s; box-shadow: 0 2px 6px rgba(0,0,0,0.15);"></button>
                  `).join('')}
                </div>
              </div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:6px;">Seçilen renk tüm sidebar ve vurgu renklerini etkiler</div>
            </div>

            <div style="display:flex; gap:10px; margin-top:8px;">
              <button class="btn btn-primary hover-lift" id="btn-save-branding" style="flex:1; justify-content:center; box-shadow: 0 4px 12px rgba(16,185,129,0.25);">
                ${icon('check', 14)} Değişiklikleri Kaydet
              </button>
            </div>
          </div>

          <!-- Right: Live Preview -->
          <div class="card" style="padding: 28px;">
            <div style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:20px; letter-spacing:1px; display:flex; align-items:center; gap:6px;">
              ${icon('eye', 14)} Canlı Önizleme
            </div>

            <!-- Miniature Sidebar -->
            <div style="display:flex; justify-content:center; margin-bottom:20px;">
              <div id="brand-preview-sidebar" style="width:180px; background:${state.settings.brandColor || '#004526'}; border-radius:16px; padding:20px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); transition: all 0.3s ease; position:relative; overflow:hidden;">
                <div style="position:absolute;top:-20px;right:-20px;width:80px;height:80px;background:rgba(255,255,255,0.05);border-radius:50%;"></div>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:20px;">
                  <div id="preview-logo-box" style="width:34px; height:34px; background:#fff; border-radius:8px; display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0;">
                    ${state.settings.logo ? `<img src="${state.settings.logo}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="color:${state.settings.brandColor || '#004526'}; font-weight:800; font-size:13px;">${(state.settings.appName || 'TP').slice(0, 2).toUpperCase()}</span>`}
                  </div>
                  <div style="font-size:13px; font-weight:800; color:#fff;" id="preview-name">${state.settings.appName || 'Bitig.app'}</div>
                </div>

                ${['Anasayfa', 'Öğrenciler', 'Takvim', 'Muhasebe', 'Ayarlar'].map((item, i) => `
                  <div style="display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:6px;margin-bottom:4px;background:${i === 0 ? 'rgba(255,255,255,0.2)' : 'transparent'};">
                    <div style="width:12px;height:12px;border-radius:3px;background:rgba(255,255,255,${i === 0 ? '0.9' : '0.3'});"></div>
                    <div style="height:6px;width:${60 + i * 5}%;background:rgba(255,255,255,${i === 0 ? '0.9' : '0.3'});border-radius:3px;"></div>
                  </div>
                `).join('')}

                <div style="margin-top:16px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1); font-size:9px; color:rgba(255,255,255,0.5);" id="preview-footer">
                  ${state.settings.footerText || 'v1.0 • Bitig.app'}
                </div>
              </div>
            </div>

            <!-- Color info -->
            <div style="background:var(--bg-secondary);border-radius:12px;padding:14px;border:1px solid var(--border);">
              <div style="font-size:12px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">Seçili Tema</div>
              <div style="display:flex;align-items:center;gap:10px;">
                <div id="preview-color-dot" style="width:24px;height:24px;border-radius:6px;background:${state.settings.brandColor || '#004526'};box-shadow:0 2px 8px rgba(0,0,0,0.2);"></div>
                <div>
                  <div id="preview-color-hex" style="font-size:13px;font-weight:800;color:var(--text-primary);">${state.settings.brandColor || '#004526'}</div>
                  <div style="font-size:11px;color:var(--text-muted);">Marka Rengi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: Veri Yönetimi -->
      <div id="settings-tab-data" class="settings-tab-content" style="display:none;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start;">

          <!-- Backup & Restore -->
          <div class="card" style="padding:28px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--border);">
              <div style="width:38px;height:38px;background:rgba(99,102,241,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#7c6aff;">
                ${icon('database', 18)}
              </div>
              <div>
                <div style="font-size:16px;font-weight:800;color:var(--text-primary);">Yedekleme & Geri Yükleme</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:1px;">Tüm verilerinizi JSON formatında yedekleyin</div>
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:10px;">
              <button class="btn btn-primary hover-lift" id="btn-export-all" style="justify-content:center; box-shadow:0 4px 12px rgba(16,185,129,0.2);">
                ${icon('download', 14)} Tüm Verileri Yedekle (JSON)
              </button>
              <button class="btn btn-secondary hover-lift" id="btn-import-all" style="justify-content:center;">
                ${icon('upload', 14)} Yedeği Geri Yükle
              </button>
            </div>

            <div style="margin-top:20px;padding-top:20px;border-top:1px solid var(--border);">
              <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:12px;">Öğrenci & Grup Verileri</div>
              <div style="display:flex; gap:8px;">
                <button class="btn btn-secondary btn-sm hover-lift" id="btn-export-students" style="flex:1; justify-content:center;">
                  ${icon('download', 13)} Dışa Aktar
                </button>
                <button class="btn btn-secondary btn-sm hover-lift" id="btn-import-students" style="flex:1; justify-content:center;">
                  ${icon('upload', 13)} İçe Aktar
                </button>
              </div>
            </div>

            <div style="margin-top:20px;padding:14px;background:rgba(16,185,129,0.06);border-radius:12px;border:1px solid rgba(16,185,129,0.15);">
              <div style="font-size:12px;font-weight:700;color:var(--brand-green);margin-bottom:6px;">💡 Yedekleme Önerisi</div>
              <div style="font-size:12px;color:var(--text-secondary);line-height:1.5;">Her ay düzenli yedek almanız önerilir. Tüm verileriniz yerel olarak saklandığı için düzenli yedekleme önemlidir.</div>
            </div>

            <input type="file" id="import-file-all" accept=".json" style="display:none;">
            <input type="file" id="import-file-students" accept=".json" style="display:none;">
          </div>

          <!-- Danger Zone -->
          <div style="display:flex;flex-direction:column;gap:24px;">
            <!-- MEB Sync -->
            <div class="card" style="padding:28px;">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border);">
                <div style="width:38px;height:38px;background:rgba(255,159,67,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#ff9f43;">
                  ${icon('refresh', 18)}
                </div>
                <div>
                  <div style="font-size:16px;font-weight:800;color:var(--text-primary);">MEB Müfredatı</div>
                  <div style="font-size:12px;color:var(--text-secondary);margin-top:1px;">Müfredatı varsayılan MEB verileriyle senkronize edin</div>
                </div>
              </div>
              <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;line-height:1.5;">
                MEB'in resmi müfredatı ile kendi özelleştirmelerinizi senkronize edin. Mevcut verilerinizdeki bazı başlıklar güncellenebilir.
              </p>
              <button class="btn btn-secondary hover-lift" id="btn-sync-meb" style="width:100%;justify-content:center;">
                ${icon('refresh', 14)} MEB Müfredatını Yenile
              </button>
            </div>

            <!-- Danger Zone -->
            <div class="card" style="padding:28px; border: 1px solid rgba(239,68,68,0.2); background: rgba(239,68,68,0.02);">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid rgba(239,68,68,0.15);">
                <div style="width:38px;height:38px;background:rgba(239,68,68,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#ef4444;">
                  ${icon('alertCircle', 18)}
                </div>
                <div>
                  <div style="font-size:16px;font-weight:800;color:#ef4444;">Tehlikeli Bölge</div>
                  <div style="font-size:12px;color:var(--text-secondary);margin-top:1px;">Bu işlemler geri alınamaz</div>
                </div>
              </div>

              <div style="display:flex;flex-direction:column;gap:10px;">
                <div style="padding:12px;background:rgba(239,68,68,0.06);border-radius:8px;border:1px solid rgba(239,68,68,0.1);">
                  <div style="font-size:12px;font-weight:700;color:var(--text-primary);margin-bottom:4px;">Sistem Verilerini Sıfırla</div>
                  <div style="font-size:11px;color:var(--text-secondary);margin-bottom:10px;">Tüm öğrenci, ders ve muhasebe verilerinizi siler. Geri alınamaz!</div>
                  <button class="btn btn-danger btn-sm hover-lift" id="btn-reset" style="width:100%;justify-content:center;">
                    ${icon('trash', 13)} Verileri Sıfırla
                  </button>
                </div>

                <div style="padding:12px;background:rgba(239,68,68,0.06);border-radius:8px;border:1px solid rgba(239,68,68,0.1);">
                  <div style="font-size:12px;font-weight:700;color:var(--text-primary);margin-bottom:4px;">Hesabı Kalıcı Olarak Sil</div>
                  <div style="font-size:11px;color:var(--text-secondary);margin-bottom:10px;">Hesabınız ve tüm verileriniz kalıcı olarak silinir.</div>
                  <button class="btn btn-danger btn-sm hover-lift" id="btn-delete-account" style="width:100%;justify-content:center;">
                    ${icon('trash', 13)} Hesabı Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: Müfredat -->
      <div id="settings-tab-curriculum" class="settings-tab-content" style="display:none;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start;">

          <!-- Excel Import -->
          <div class="card" style="padding:28px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--border);">
              <div style="width:38px;height:38px;background:rgba(16,185,129,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--brand-green);">
                ${icon('upload', 18)}
              </div>
              <div>
                <div style="font-size:16px;font-weight:800;color:var(--text-primary);">Excel'den Müfredat İçe Aktar</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:1px;">Kendi hazırladığınız müfredatı yükleyin</div>
              </div>
            </div>

            <div style="background:var(--bg-secondary);border-radius:12px;padding:16px;margin-bottom:20px;border:1px solid var(--border);">
              <div style="font-size:12px;font-weight:800;color:var(--text-primary);margin-bottom:8px;">📋 Excel Formatı</div>
              <table style="width:100%;font-size:11px;color:var(--text-secondary);border-collapse:collapse;">
                <thead>
                  <tr style="border-bottom:1px solid var(--border);">
                    <th style="padding:4px 8px;text-align:left;font-weight:700;color:var(--text-primary);">A - Sınıf</th>
                    <th style="padding:4px 8px;text-align:left;font-weight:700;color:var(--text-primary);">B - Ünite</th>
                    <th style="padding:4px 8px;text-align:left;font-weight:700;color:var(--text-primary);">C - Konu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style="padding:4px 8px;">5. Sınıf</td><td style="padding:4px 8px;">1. Ünite</td><td style="padding:4px 8px;">Konu 1</td></tr>
                  <tr><td style="padding:4px 8px;">5. Sınıf</td><td style="padding:4px 8px;">1. Ünite</td><td style="padding:4px 8px;">Konu 2</td></tr>
                </tbody>
              </table>
            </div>

            <div class="form-group">
              <label>Hedef Branş / Ders</label>
              <select id="import-excel-subject" style="height:44px;">
                ${(state.profile.branches || []).map(b => `<option value="${b}">${b}</option>`).join('')}
              </select>
            </div>

            <input type="file" id="import-excel-file" accept=".xlsx, .xls" style="display:none;">
            <button class="btn btn-primary hover-lift" id="btn-import-excel" style="width:100%;justify-content:center;box-shadow:0 4px 12px rgba(16,185,129,0.2);">
              ${icon('upload', 14)} Excel Dosyası Seç ve Yükle
            </button>
          </div>

          <!-- Curriculum Info -->
          <div style="display:flex;flex-direction:column;gap:20px;">
            <!-- Stats Card -->
            <div class="card" style="padding:28px;">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border);">
                <div style="width:38px;height:38px;background:rgba(124,106,255,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#7c6aff;">
                  ${icon('book', 18)}
                </div>
                <div>
                  <div style="font-size:16px;font-weight:800;color:var(--text-primary);">Müfredat Durumu</div>
                  <div style="font-size:12px;color:var(--text-secondary);margin-top:1px;">Yüklü müfredat bilgileri</div>
                </div>
              </div>

              ${(() => {
                const curriculum = state.curriculum || {};
                const subjects = Object.keys(curriculum);
                if (subjects.length === 0) {
                  return `<div class="empty-state" style="padding:20px;"><p style="font-size:13px;">Henüz müfredat yüklenmemiş</p></div>`;
                }
                return subjects.map(subj => {
                  const grades = Object.keys(curriculum[subj] || {});
                  const totalUnits = grades.reduce((sum, g) => sum + (curriculum[subj][g]?.length || 0), 0);
                  const totalTopics = grades.reduce((sum, g) => sum + (curriculum[subj][g]?.reduce((s, u) => s + (u.topics?.length || 0), 0) || 0), 0);
                  return `
                    <div style="padding:12px;background:var(--bg-secondary);border-radius:10px;margin-bottom:10px;border:1px solid var(--border);">
                      <div style="font-size:13px;font-weight:800;color:var(--text-primary);margin-bottom:6px;">${subj}</div>
                      <div style="display:flex;gap:16px;font-size:11px;color:var(--text-secondary);">
                        <span><strong style="color:var(--brand-green);">${grades.length}</strong> sınıf</span>
                        <span><strong style="color:#7c6aff;">${totalUnits}</strong> ünite</span>
                        <span><strong style="color:#ff9f43;">${totalTopics}</strong> konu</span>
                      </div>
                    </div>
                  `;
                }).join('');
              })()}
            </div>

            <!-- Tips -->
            <div class="card" style="padding:24px;">
              <div style="font-size:14px;font-weight:800;color:var(--text-primary);margin-bottom:14px;display:flex;align-items:center;gap:8px;">
                💡 İpuçları
              </div>
              <div style="display:flex;flex-direction:column;gap:10px;">
                ${[
                  { emoji: '📊', text: 'Excel dosyanızın ilk satırı başlık satırı olmalıdır.' },
                  { emoji: '🔄', text: 'MEB Müfredatını yenilemek mevcut özelleştirmelerinizi silmez.' },
                  { emoji: '📚', text: 'Müfredatı Müfredat sayfasından detaylı düzenleyebilirsiniz.' },
                  { emoji: '⚡', text: 'Aynı branş için birden fazla sınıf seviyesi yüklenebilir.' }
                ].map(t => `
                  <div style="display:flex;align-items:flex-start;gap:10px;font-size:12px;color:var(--text-secondary);">
                    <span style="font-size:16px;flex-shrink:0;">${t.emoji}</span>
                    <span style="line-height:1.5;">${t.text}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: Tercihler -->
      <div id="settings-tab-preferences" class="settings-tab-content" style="display:none;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start;">

          <!-- Quick Actions -->
          <div class="card" style="padding:28px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--border);">
              <div style="width:38px;height:38px;background:rgba(16,185,129,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--brand-green);">
                ${icon('star', 18)}
              </div>
              <div>
                <div style="font-size:16px;font-weight:800;color:var(--text-primary);">Hızlı Erişim</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:1px;">Sık kullandığınız sayfalara hızlıca gidin</div>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:8px;">
              ${[
                { label: 'Öğrenci & Gruplar', icon: 'user', route: 'studentsAndGroups', color: 'var(--brand-green)', bg: 'rgba(16,185,129,0.08)' },
                { label: 'Takvim', icon: 'calendar', route: 'calendar', color: '#7c6aff', bg: 'rgba(124,106,255,0.08)' },
                { label: 'Muhasebe', icon: 'finance', route: 'finance', color: '#ff9f43', bg: 'rgba(255,159,67,0.08)' },
                { label: 'Müfredat', icon: 'book', route: 'curriculum', color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
                { label: 'Dashboard', icon: 'home', route: 'dashboard', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
              ].map(item => `
                <button class="hover-lift" data-nav-route="${item.route}" style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;border:1px solid var(--border);background:${item.bg};cursor:pointer;width:100%;text-align:left;transition:all 0.2s;">
                  <div style="width:34px;height:34px;border-radius:8px;background:${item.color};display:flex;align-items:center;justify-content:center;color:white;flex-shrink:0;">
                    ${icon(item.icon, 16)}
                  </div>
                  <div style="flex:1;font-size:14px;font-weight:700;color:var(--text-primary);">${item.label}</div>
                  <div style="color:var(--text-muted);">${icon('chevronRight', 14)}</div>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Guided Tour & Support -->
          <div style="display:flex;flex-direction:column;gap:20px;">

            <!-- App Guide -->
            <div class="card" style="padding:28px;">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border);">
                <div style="width:38px;height:38px;background:rgba(124,106,255,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#7c6aff;">
                  ${icon('star', 18)}
                </div>
                <div>
                  <div style="font-size:16px;font-weight:800;color:var(--text-primary);">Uygulama Rehberi</div>
                  <div style="font-size:12px;color:var(--text-secondary);margin-top:1px;">Uygulamayı öğrenin, adım adım keşfedin</div>
                </div>
              </div>
              <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:16px;">
                Uygulamanın tüm özelliklerini interaktif bir rehber eşliğinde keşfedin. Rehber her sayfada neler yapabileceğinizi gösterir.
              </p>
              <button class="btn btn-secondary hover-lift" id="btn-start-tour" style="width:100%;justify-content:center;">
                ${icon('star', 14)} Rehberi Başlat
              </button>
            </div>

            <!-- Keyboard Shortcuts -->
            <div class="card" style="padding:28px;">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border);">
                <div style="width:38px;height:38px;background:rgba(255,159,67,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#ff9f43;">
                  ${icon('settings', 18)}
                </div>
                <div>
                  <div style="font-size:16px;font-weight:800;color:var(--text-primary);">Kullanım İpuçları</div>
                  <div style="font-size:12px;color:var(--text-secondary);margin-top:1px;">Verimliliği artıran kısa yollar</div>
                </div>
              </div>
              <div style="display:flex;flex-direction:column;gap:8px;">
                ${[
                  { tip: 'Ders tamamlamak için dersin üzerine tıklayın', emoji: '✅' },
                  { tip: 'Takvimde sürükle-bırak ile ders saatini değiştirin', emoji: '📅' },
                  { tip: 'Öğrenci kartına tıklayarak detay sayfasına ulaşın', emoji: '👤' },
                  { tip: 'Müfredatı Excel ile toplu yükleyerek zaman kazanın', emoji: '📊' },
                  { tip: 'Sidebar\'dan herhangi bir sayfaya tek tıklamayla gidin', emoji: '⚡' },
                ].map(t => `
                  <div style="display:flex;align-items:flex-start;gap:10px;padding:10px;border-radius:8px;background:var(--bg-secondary);border:1px solid var(--border);">
                    <span style="font-size:18px;flex-shrink:0;">${t.emoji}</span>
                    <span style="font-size:12px;color:var(--text-secondary);line-height:1.5;">${t.tip}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: Hakkında -->
      <div id="settings-tab-about" class="settings-tab-content" style="display:none;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start;">

          <!-- App Info -->
          <div class="card" style="padding:28px;">
            <!-- Hero -->
            <div style="text-align:center;padding:24px 0;border-bottom:1px solid var(--border);margin-bottom:24px;">
              <div style="width:80px;height:80px;background:linear-gradient(135deg,var(--brand-green),#10b981);border-radius:20px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 15px 30px rgba(16,185,129,0.3);">
                <span style="font-size:36px;font-weight:900;color:white;">B</span>
              </div>
              <h2 style="font-size:24px;font-weight:900;color:var(--text-primary);margin-bottom:4px;">${state.settings.appName || 'Bitig.app'}</h2>
              <p style="font-size:14px;color:var(--text-secondary);">Öğretmenler için akıllı takip sistemi</p>
              <div style="display:inline-flex;align-items:center;gap:6px;background:var(--brand-green);color:white;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;margin-top:10px;">
                ${icon('star', 12)} Versiyon ${APP_VERSION}
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:12px;">
              ${[
                { label: 'Versiyon', value: APP_VERSION, badge: true },
                { label: 'Derleme Tarihi', value: BUILD_DATE },
                { label: 'Kullanıcı', value: state.profile.name },
                { label: 'Branş', value: (state.profile.branches || []).join(', ') || '-' },
                { label: 'Depolama', value: 'Yerel & Bulut (Firebase)', badge: false },
                { label: 'Platform', value: 'Web (PWA Uyumlu)' },
              ].map(item => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);">
                  <span style="font-size:13px;color:var(--text-secondary);font-weight:600;">${item.label}</span>
                  ${item.badge 
                    ? `<span class="badge badge-success" style="font-size:12px;">${item.value}</span>`
                    : `<span style="font-size:13px;font-weight:700;color:var(--text-primary);">${item.value}</span>`
                  }
                </div>
              `).join('')}
            </div>
          </div>

          <!-- System Stats & Policies -->
          <div style="display:flex;flex-direction:column;gap:20px;">

            <!-- System Summary -->
            <div class="card" style="padding:28px;">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border);">
                <div style="width:38px;height:38px;background:rgba(16,185,129,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--brand-green);">
                  ${icon('trendUp', 18)}
                </div>
                <div>
                  <div style="font-size:16px;font-weight:800;color:var(--text-primary);">Sistem Özeti</div>
                  <div style="font-size:12px;color:var(--text-secondary);">Toplam kullanım istatistikleri</div>
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                ${[
                  { label: 'Toplam Öğrenci', value: totalStudents, color: 'var(--brand-green)' },
                  { label: 'Toplam Grup', value: totalGroups, color: '#7c6aff' },
                  { label: 'Toplam Ders', value: totalLessons, color: '#ff9f43' },
                  { label: 'Tamamlanan', value: completedLessons, color: '#0ea5e9' },
                  { label: 'İşlemler', value: totalTransactions, color: '#ef4444' },
                  { label: 'Veri', value: `${dataSize} KB`, color: '#f59e0b' },
                ].map(stat => `
                  <div style="padding:14px;background:var(--bg-secondary);border-radius:10px;border:1px solid var(--border);text-align:center;">
                    <div style="font-size:22px;font-weight:900;color:${stat.color};margin-bottom:4px;">${stat.value}</div>
                    <div style="font-size:11px;color:var(--text-muted);font-weight:600;">${stat.label}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Privacy & Security -->
            <div class="card" style="padding:28px;">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border);">
                <div style="width:38px;height:38px;background:rgba(16,185,129,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--brand-green);">
                  ${icon('shield', 18)}
                </div>
                <div>
                  <div style="font-size:16px;font-weight:800;color:var(--text-primary);">Gizlilik & Güvenlik</div>
                  <div style="font-size:12px;color:var(--text-secondary);">Veri güvenliği politikaları</div>
                </div>
              </div>
              <div style="display:flex;flex-direction:column;gap:10px;">
                ${[
                  { text: 'Tüm veriler Firebase ile güvenli şekilde şifrelenir', emoji: '🔐' },
                  { text: 'Kişisel verileriniz 3. taraflarla paylaşılmaz', emoji: '🛡️' },
                  { text: 'Yerel önbellek ile çevrimdışı erişim sağlanır', emoji: '💾' },
                  { text: 'Hesabınızı istediğiniz zaman kalıcı olarak silebilirsiniz', emoji: '🗑️' },
                ].map(p => `
                  <div style="display:flex;align-items:flex-start;gap:10px;padding:10px;border-radius:8px;background:var(--bg-secondary);border:1px solid var(--border);">
                    <span style="font-size:18px;flex-shrink:0;">${p.emoji}</span>
                    <span style="font-size:12px;color:var(--text-secondary);line-height:1.5;">${p.text}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;

  return {
    html,
    init: (el, nav) => {
      // ── Tab Switching ──
      el.querySelectorAll('.settings-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          el.querySelectorAll('.settings-tab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const tab = btn.dataset.settingsTab;
          el.querySelectorAll('.settings-tab-content').forEach(c => c.style.display = 'none');
          el.querySelector(`#settings-tab-${tab}`).style.display = '';
        });
      });

      // ── Quick Nav Buttons ──
      el.querySelectorAll('[data-nav-route]').forEach(btn => {
        btn.addEventListener('click', () => nav(btn.dataset.navRoute));
      });

      // ── Branding: Live Preview ──
      const nameInp = el.querySelector('#app-name');
      const logoInp = el.querySelector('#app-logo');
      const footerInp = el.querySelector('#app-footer');
      const colorInp = el.querySelector('#app-color');

      const updatePreview = () => {
        const name = nameInp.value.trim() || 'Bitig.app';
        const logo = logoInp.value.trim();
        const footer = footerInp.value.trim() || 'v1.0 • Bitig.app';
        const color = colorInp.value;

        const previewSidebar = el.querySelector('#brand-preview-sidebar');
        const previewName = el.querySelector('#preview-name');
        const previewLogoBox = el.querySelector('#preview-logo-box');
        const previewFooter = el.querySelector('#preview-footer');
        const previewDot = el.querySelector('#preview-color-dot');
        const previewHex = el.querySelector('#preview-color-hex');

        if (previewSidebar) previewSidebar.style.background = color;
        if (previewName) previewName.textContent = name;
        if (previewFooter) previewFooter.textContent = footer;
        if (previewDot) previewDot.style.background = color;
        if (previewHex) previewHex.textContent = color;
        if (previewLogoBox) {
          previewLogoBox.innerHTML = logo
            ? `<img src="${logo}" style="width:100%; height:100%; object-fit:cover;">`
            : `<span style="color:${color}; font-weight:800; font-size:13px;">${name.slice(0, 2).toUpperCase()}</span>`;
        }
      };

      [nameInp, logoInp, footerInp, colorInp].forEach(inp => {
        inp?.addEventListener('input', updatePreview);
      });

      // Preset Colors
      el.querySelectorAll('.color-preset').forEach(btn => {
        btn.addEventListener('click', () => {
          colorInp.value = btn.dataset.color;
          el.querySelectorAll('.color-preset').forEach(b => b.style.borderColor = 'transparent');
          btn.style.borderColor = 'var(--text-primary)';
          updatePreview();
        });
      });

      // Save Branding
      el.querySelector('#btn-save-branding')?.addEventListener('click', () => {
        updateSettings({
          appName: nameInp.value.trim() || 'Bitig.app',
          logo: logoInp.value.trim() || null,
          brandColor: colorInp.value,
          footerText: footerInp.value.trim() || 'v1.0 • Bitig.app'
        });

        import('../components/Layout.js').then(m => {
          const state = getState();
          m.refreshSidebar(state, 'settings');
          m.refreshTopbar(state);
          m.applyTheme(state);
        });

        const btn = el.querySelector('#btn-save-branding');
        const orig = btn.innerHTML;
        btn.innerHTML = `${icon('check', 14)} Kaydedildi!`;
        btn.style.background = 'var(--success)';
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.background = '';
        }, 2000);
      });

      // ── Data: MEB Sync ──
      el.querySelector('#btn-sync-meb')?.addEventListener('click', async () => {
        if (confirm('MEB müfredatı varsayılan haline dönecektir. Kendinizin eklediği ünite isimleri vb. üzerine yazılabilir. Emin misiniz?')) {
          const btn = el.querySelector('#btn-sync-meb');
          const orig = btn.innerHTML;
          btn.innerHTML = `${icon('refresh', 14)} Yenileniyor...`;
          btn.disabled = true;
          const { syncCurriculumWithBranches } = await import('../store/store.js');
          syncCurriculumWithBranches(getState().profile.branches || [], getState().profile.grades || [], true);
          setTimeout(() => {
            btn.innerHTML = `${icon('check', 14)} Yenilendi!`;
            btn.style.background = 'var(--success)';
            setTimeout(() => {
              btn.innerHTML = orig;
              btn.style.background = '';
              btn.disabled = false;
            }, 2000);
          }, 500);
        }
      });

      // ── Data: Export All ──
      el.querySelector('#btn-export-all')?.addEventListener('click', () => {
        const data = JSON.stringify(getState(), null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bitig-full-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });

      // ── Data: Export Students ──
      el.querySelector('#btn-export-students')?.addEventListener('click', () => {
        const state = getState();
        const data = JSON.stringify({ students: state.students, groups: state.groups }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bitig-students-groups-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });

      el.querySelector('#btn-import-all')?.addEventListener('click', () => el.querySelector('#import-file-all').click());
      el.querySelector('#btn-import-students')?.addEventListener('click', () => el.querySelector('#import-file-students').click());

      const handleImport = (inputEl, type) => {
        inputEl?.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async (ev) => {
            try {
              const data = JSON.parse(ev.target.result);
              const { importData, importStudentsAndGroups } = await import('../store/store.js');
              if (type === 'all') await importData(data);
              else await importStudentsAndGroups(data);
              alert('İçe aktarma başarılı!');
            } catch (err) {
              console.error(err);
              alert('Geçersiz dosya. Yalnızca geçerli .json yedeği kabul edilir.');
            }
          };
          reader.readAsText(file);
        });
      };

      handleImport(el.querySelector('#import-file-all'), 'all');
      handleImport(el.querySelector('#import-file-students'), 'students');

      // ── Data: Reset ──
      el.querySelector('#btn-reset')?.addEventListener('click', async () => {
        if (confirm('Sadece SİZE AİT olan tüm verileriniz sıfırlanacak! Bu işlem geri alınamaz. Emin misiniz?')) {
          const btn = el.querySelector('#btn-reset');
          btn.innerHTML = 'Sıfırlanıyor...';
          btn.disabled = true;
          const { resetData } = await import('../store/store.js');
          await resetData();
        }
      });

      // ── Data: Delete Account ──
      el.querySelector('#btn-delete-account')?.addEventListener('click', () => {
        import('../components/modal.js').then(m => {
          m.openModal({
            title: 'Hesabı Kalıcı Olarak Sil',
            body: `
              <div style="text-align:center; padding: 20px 0;">
                <div style="color:var(--danger); margin-bottom:16px;">${icon('alertCircle', 52)}</div>
                <h3 style="font-size:20px; margin-bottom:12px; color:var(--text-primary);">Tüm Verileriniz Silinecek!</h3>
                <p style="color:var(--text-secondary); line-height:1.7; font-size:14px;">
                  Öğrenci kayıtlarınız, dersleriniz, muhasebe kayıtlarınız ve hesap kimliğiniz <strong>tamamen ve kalıcı olarak</strong> silinecektir.
                </p>
                <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:14px;margin-top:16px;text-align:left;">
                  <div style="font-size:12px;color:#ef4444;font-weight:700;margin-bottom:6px;">⚠️ Bu işlem geri alınamaz!</div>
                  <div style="font-size:12px;color:var(--text-secondary);">Devam etmeden önce verilerinizi yedeklemenizi şiddetle öneririz.</div>
                </div>
              </div>
            `,
            footer: `
              <button class="btn btn-secondary" id="modal-cancel-btn" style="flex:1;">İptal</button>
              <button class="btn btn-danger" id="modal-delete-btn" style="flex:1;justify-content:center;">Evet, Kalıcı Olarak Sil</button>
            `
          });

          document.getElementById('modal-cancel-btn')?.addEventListener('click', m.closeModal);
          document.getElementById('modal-delete-btn')?.addEventListener('click', async () => {
            const btn = document.getElementById('modal-delete-btn');
            btn.innerHTML = 'Siliniyor...';
            btn.disabled = true;
            document.getElementById('modal-cancel-btn').disabled = true;
            try {
              const { deleteAccount } = await import('../store/store.js');
              await deleteAccount();
              m.openModal({
                title: 'Hesap Silindi',
                body: `<div style="text-align:center;padding:20px 0;">
                  <div style="color:var(--success);margin-bottom:16px;">${icon('checkCircle', 52)}</div>
                  <h3 style="font-size:20px;margin-bottom:8px;">Hesabınız Silindi</h3>
                  <p style="color:var(--text-secondary);line-height:1.6;">Tüm verileriniz güvenle kaldırıldı. Tekrar görüşmek dileğiyle!</p>
                </div>`,
                footer: `<button class="btn btn-primary" id="goodbye-btn" style="width:100%;justify-content:center;">Ana Sayfaya Dön</button>`
              });
              document.getElementById('goodbye-btn')?.addEventListener('click', () => {
                window.location.hash = '#register';
                window.location.reload();
              });
            } catch (err) {
              btn.innerHTML = 'Silinemedi';
              btn.disabled = false;
              document.getElementById('modal-cancel-btn').disabled = false;
              m.showAlert({ title: 'Hata', message: err.message, buttonText: 'Anladım' });
            }
          });
        });
      });

      // ── Curriculum: Excel Import ──
      el.querySelector('#btn-import-excel')?.addEventListener('click', () => {
        el.querySelector('#import-excel-file').click();
      });

      el.querySelector('#import-excel-file')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const btn = el.querySelector('#btn-import-excel');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `${icon('refresh', 14)} Okunuyor...`;
        btn.disabled = true;

        const reader = new FileReader();
        reader.onload = async (ev) => {
          try {
            const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
            const data = new Uint8Array(ev.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet);

            const subjectId = el.querySelector('#import-excel-subject').value;
            const { importCurriculumFromExcel } = await import('../store/store.js');
            importCurriculumFromExcel(subjectId, rows);

            btn.innerHTML = `${icon('check', 14)} Başarıyla Yüklendi!`;
            btn.style.background = 'var(--success)';
            setTimeout(() => {
              btn.innerHTML = originalHtml;
              btn.style.background = '';
              btn.disabled = false;
            }, 3000);
          } catch (err) {
            console.error(err);
            alert('Excel dosyası okunurken bir hata oluştu. Lütfen formatı kontrol edin.');
            btn.innerHTML = originalHtml;
            btn.disabled = false;
          }
        };
        reader.readAsArrayBuffer(file);
      });

      // ── Preferences: Guided Tour ──
      el.querySelector('#btn-start-tour')?.addEventListener('click', () => {
        import('./modals/GuidedTour.js').then(m => m.restartTour(nav));
      });
    }
  };
}


// ═════════════════════════════════════════════════
// PROFILE PAGE - Premium
// ═════════════════════════════════════════════════
export function renderProfile(navigate) {
  const state = getState();
  const p = state.profile;
  const initials = p.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'ÖĞ';

  const html = `
    <div class="fade-in">
      <!-- Page Header -->
      <div class="page-header" style="background: linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(99,102,241,0.02) 100%); padding: 32px 24px; border-radius: 20px; margin-bottom: 32px; border: 1px solid rgba(16,185,129,0.15); box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
        <div>
          <h2 style="font-size: 32px; font-weight: 800; color: var(--brand-green); margin-bottom: 8px; display: flex; align-items: center; gap: 12px; letter-spacing: -0.5px;">
            ${icon('user', 32)} Öğretmen Profili
          </h2>
          <p style="color: var(--text-secondary); font-size: 16px; font-weight: 500;">Kişisel bilgiler, branş & sınıf ayarları</p>
        </div>
        <button class="btn btn-primary hover-lift" id="btn-edit-profile" style="box-shadow: 0 8px 20px rgba(16,185,129,0.3); padding: 10px 20px; font-weight: 700; font-size: 15px;">
          ${icon('edit', 16)} Profili Düzenle
        </button>
      </div>

      <!-- Dynamic content populated by init -->
      <div class="profile-main-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start;">
      </div>
    </div>
  `;

  return {
    html,
    init: (el, nav) => {
      let isEditing = false;
      const editBtn = el.querySelector('#btn-edit-profile');
      const mainGrid = el.querySelector('.profile-main-grid');

      function updateView() {
        Promise.all([
          import('../store/store.js'),
          import('../components/modal.js')
        ]).then(([m, modal]) => {
          const cp = m.getState().profile;
          const cs = m.getState();
          const curInitials = cp.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'ÖĞ';

          const totalLessons = cs.lessons?.length || 0;
          const completedLessons = cs.lessons?.filter(l => l.status === 'completed').length || 0;
          const totalStudents = cs.students?.length || 0;
          const totalGroups = cs.groups?.length || 0;
          const totalTransactions = cs.transactions?.length || 0;
          const confirmedIncome = cs.transactions?.filter(t => t.type === 'income' && t.status === 'confirmed').reduce((s, t) => s + t.amount, 0) || 0;
          const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

          const badges = [];
          if (completedLessons >= 100) badges.push({ label: '100+ Ders', emoji: '🏆', color: '#f59e0b' });
          else if (completedLessons >= 50) badges.push({ label: '50+ Ders', emoji: '🥇', color: '#f59e0b' });
          else if (completedLessons >= 10) badges.push({ label: '10+ Ders', emoji: '🎯', color: '#7c6aff' });
          if (totalStudents >= 20) badges.push({ label: '20+ Öğrenci', emoji: '👥', color: 'var(--brand-green)' });
          else if (totalStudents >= 5) badges.push({ label: '5+ Öğrenci', emoji: '👤', color: 'var(--brand-green)' });
          if (totalGroups >= 3) badges.push({ label: '3+ Grup', emoji: '📚', color: '#0ea5e9' });
          if (cp.bio) badges.push({ label: 'Profil Tamamlandı', emoji: '✅', color: '#10b981' });

          if (!isEditing) {
            mainGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start;';
            mainGrid.innerHTML = `
              <!-- LEFT -->
              <div style="display:flex;flex-direction:column;gap:20px;">
                <!-- Hero Card -->
                <div class="card" style="padding:0;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.06);">
                  <div style="height:100px;background:linear-gradient(135deg,var(--brand-green) 0%,#10b981 60%,#059669 100%);position:relative;overflow:hidden;">
                    <div style="position:absolute;top:-40px;right:-40px;width:150px;height:150px;background:rgba(255,255,255,0.07);border-radius:50%;"></div>
                    <div style="position:absolute;bottom:-30px;left:20px;width:90px;height:90px;background:rgba(255,255,255,0.05);border-radius:50%;"></div>
                  </div>
                  <div style="padding:0 28px 28px;">
                    <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:-46px;margin-bottom:16px;">
                      <div style="position:relative;">
                        <div id="profile-avatar-view" style="width:92px;height:92px;border-radius:24px;background:linear-gradient(135deg,#7c6aff,var(--brand-green));display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:900;color:#fff;border:4px solid white;box-shadow:0 8px 24px rgba(0,0,0,0.18);">
                          ${cp.avatar ? `<img src="${cp.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:20px;">` : curInitials}
                        </div>
                        <label style="position:absolute;bottom:-6px;right:-6px;width:28px;height:28px;background:var(--brand-green);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2);color:white;" title="Fotoğraf Değiştir">
                          ${icon('edit', 12)}
                          <input type="file" accept="image/*" id="avatar-upload" style="display:none;">
                        </label>
                      </div>
                      <span class="badge badge-success" style="font-size:11px;padding:4px 10px;">Aktif</span>
                    </div>
                    <h2 style="font-size:22px;font-weight:900;color:var(--text-primary);margin-bottom:2px;">${cp.name}</h2>
                    <p style="font-size:14px;color:var(--brand-green);font-weight:700;margin-bottom:12px;">${cp.title || ''}</p>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
                      ${cp.city ? `<span style="font-size:12px;color:var(--text-secondary);font-weight:600;">📍 ${cp.city}</span>` : ''}
                      ${cp.experience ? `<span style="font-size:12px;color:var(--text-secondary);font-weight:600;">⏳ ${cp.experience}</span>` : ''}
                      ${cp.phone ? `<span style="font-size:12px;color:var(--text-secondary);font-weight:600;">📞 ${cp.phone}</span>` : ''}
                    </div>
                    ${cp.bio ? `
                      <div style="background:var(--bg-secondary);border-radius:12px;padding:14px;border:1px solid var(--border);font-size:13px;color:var(--text-secondary);line-height:1.6;font-style:italic;">
                        "${cp.bio}"
                      </div>
                    ` : `<div style="background:var(--bg-secondary);border-radius:10px;padding:12px;border:1px dashed var(--border);font-size:13px;color:var(--text-muted);text-align:center;">Hakkımda bilgisi henüz eklenmemiş</div>`}
                  </div>
                </div>

                <!-- Stats Grid -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  ${[
                    { label: 'Öğrenci', value: totalStudents, i: 'user', color: 'var(--brand-green)', bg: 'rgba(16,185,129,0.08)' },
                    { label: 'Grup', value: totalGroups, i: 'group', color: '#7c6aff', bg: 'rgba(124,106,255,0.08)' },
                    { label: 'Tamamlanan Ders', value: completedLessons, i: 'checkCircle', color: '#ff9f43', bg: 'rgba(255,159,67,0.08)' },
                    { label: 'Tamamlanma Oranı', value: `%${completionRate}`, i: 'trendUp', color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
                  ].map(s => `
                    <div class="hover-lift" style="padding:16px;background:white;border:1px solid var(--border);border-radius:14px;display:flex;align-items:center;gap:12px;box-shadow:0 2px 8px rgba(0,0,0,0.03);">
                      <div style="width:38px;height:38px;border-radius:10px;background:${s.bg};color:${s.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${icon(s.i, 18)}</div>
                      <div>
                        <div style="font-size:20px;font-weight:900;color:var(--text-primary);">${s.value}</div>
                        <div style="font-size:11px;color:var(--text-muted);font-weight:600;">${s.label}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>

                ${badges.length > 0 ? `
                  <div class="card" style="padding:20px;">
                    <div style="font-size:13px;font-weight:800;color:var(--text-primary);margin-bottom:12px;">🏅 Rozetler <span class="badge" style="background:var(--bg-secondary);color:var(--text-muted);font-size:10px;">${badges.length}</span></div>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;">
                      ${badges.map(b => `
                        <div class="hover-lift" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:20px;background:rgba(0,0,0,0.03);border:1px solid var(--border);">
                          <span style="font-size:16px;">${b.emoji}</span>
                          <span style="font-size:12px;font-weight:700;color:${b.color};">${b.label}</span>
                        </div>`).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>

              <!-- RIGHT -->
              <div style="display:flex;flex-direction:column;gap:20px;">
                <!-- Contact Info -->
                <div class="card" style="padding:28px;">
                  <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border);">
                    <div style="width:36px;height:36px;background:rgba(16,185,129,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--brand-green);">${icon('user', 16)}</div>
                    <div style="display:flex;align-items:center;justify-content:space-between;flex:1;">
                      <div style="font-size:15px;font-weight:800;color:var(--text-primary);">Profesyonel Bilgiler</div>
                      <span class="badge badge-info" style="font-size:10px;">Okuma Modu</span>
                    </div>
                  </div>
                  <div>
                    ${[
                      { label: 'Ad Soyad', value: cp.name, i: 'user' },
                      { label: 'E-posta', value: cp.email, i: 'mail' },
                      { label: 'Telefon', value: cp.phone, i: 'phone' },
                      { label: 'Şehir', value: cp.city, i: 'home' },
                      { label: 'Deneyim', value: cp.experience, i: 'clock' },
                    ].map(row => `
                      <div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--border);">
                        <div style="width:32px;height:32px;border-radius:8px;background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;color:var(--text-muted);flex-shrink:0;">${icon(row.i, 14)}</div>
                        <div style="flex:1;min-width:0;">
                          <div style="font-size:11px;color:var(--text-muted);font-weight:600;">${row.label}</div>
                          <div style="font-size:13px;font-weight:700;color:${row.value ? 'var(--text-primary)' : 'var(--text-muted)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${row.value || '—'}</div>
                        </div>
                      </div>`).join('')}
                  </div>
                </div>

                <!-- Branches & Grades -->
                <div class="card" style="padding:28px;">
                  <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border);">
                    <div style="width:36px;height:36px;background:rgba(124,106,255,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#7c6aff;">${icon('book', 16)}</div>
                    <div style="font-size:15px;font-weight:800;color:var(--text-primary);">Branş & Sınıf Bilgileri</div>
                  </div>
                  <div style="margin-bottom:16px;">
                    <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Branşlar</div>
                    <div style="display:flex;flex-wrap:wrap;gap:7px;">
                      ${cp.branches?.length > 0 ? cp.branches.map(b => `<span style="padding:5px 10px;border-radius:8px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);font-size:12px;font-weight:700;color:var(--brand-green);">📖 ${b}</span>`).join('') : '<span style="color:var(--text-muted);font-style:italic;font-size:13px;">Belirtilmemiş</span>'}
                    </div>
                  </div>
                  <div>
                    <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Sınıf Seviyeleri</div>
                    <div style="display:flex;flex-wrap:wrap;gap:7px;">
                      ${cp.grades?.length > 0 ? cp.grades.map(g => `<span style="padding:5px 10px;border-radius:8px;background:rgba(124,106,255,0.08);border:1px solid rgba(124,106,255,0.2);font-size:12px;font-weight:700;color:#7c6aff;">${g}</span>`).join('') : '<span style="color:var(--text-muted);font-style:italic;font-size:13px;">Belirtilmemiş</span>'}
                    </div>
                  </div>
                </div>

                <!-- Financial Summary -->
                <div class="card" style="padding:24px;background:linear-gradient(135deg,rgba(16,185,129,0.06),rgba(99,102,241,0.03));border:1px solid rgba(16,185,129,0.12);">
                  <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                    <div style="width:36px;height:36px;background:rgba(16,185,129,0.15);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--brand-green);">${icon('finance', 16)}</div>
                    <div style="font-size:15px;font-weight:800;color:var(--text-primary);">Finansal Özet</div>
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div style="text-align:center;padding:14px;background:white;border-radius:12px;border:1px solid var(--border);">
                      <div style="font-size:20px;font-weight:900;color:var(--brand-green);">₺${confirmedIncome.toLocaleString('tr-TR')}</div>
                      <div style="font-size:11px;color:var(--text-muted);font-weight:600;margin-top:2px;">Tahsil Edilen</div>
                    </div>
                    <div style="text-align:center;padding:14px;background:white;border-radius:12px;border:1px solid var(--border);">
                      <div style="font-size:20px;font-weight:900;color:#7c6aff;">${totalTransactions}</div>
                      <div style="font-size:11px;color:var(--text-muted);font-weight:600;margin-top:2px;">İşlem</div>
                    </div>
                  </div>
                </div>
              </div>
            `;

            // Bind avatar upload
            mainGrid.querySelector('#avatar-upload')?.addEventListener('change', (e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                import('../store/store.js').then(mStore => {
                  mStore.updateProfile({ avatar: ev.target.result });
                  import('../components/Layout.js').then(layout => layout.refreshTopbar(mStore.getState()));
                });
                const avatarDiv = mainGrid.querySelector('#profile-avatar-view');
                if (avatarDiv) avatarDiv.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:20px;">`;
              };
              reader.readAsDataURL(file);
            });

            editBtn.innerHTML = `${icon('edit', 16)} Profili Düzenle`;
            editBtn.className = 'btn btn-primary hover-lift';

          } else {
            // ─── EDIT MODE ───
            mainGrid.style.cssText = 'display:grid;gap:24px;';
            mainGrid.innerHTML = `
              <div>
                <div class="card" style="padding:32px;">
                  <div style="display:flex;align-items:center;gap:16px;margin-bottom:28px;padding-bottom:22px;border-bottom:1px solid var(--border);">
                    <div id="profile-avatar-edit" style="width:76px;height:76px;border-radius:20px;background:linear-gradient(135deg,#7c6aff,var(--brand-green));display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;color:#fff;flex-shrink:0;border:3px solid var(--border);">
                      ${cp.avatar ? `<img src="${cp.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:17px;">` : curInitials}
                    </div>
                    <div style="flex:1;">
                      <div style="font-size:18px;font-weight:900;color:var(--text-primary);">${cp.name}</div>
                      <div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px;">${cp.title || ''}</div>
                      <label class="btn btn-secondary btn-sm" style="cursor:pointer;display:inline-flex;align-items:center;gap:6px;">
                        ${icon('upload', 12)} Fotoğraf Değiştir
                        <input type="file" accept="image/*" id="avatar-upload-edit" style="display:none;">
                      </label>
                    </div>
                  </div>

                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
                    <div class="form-group" style="margin:0;"><label>Ad Soyad</label><input type="text" id="p-name" value="${cp.name}"></div>
                    <div class="form-group" style="margin:0;"><label>Ünvan / Branş</label>
                      <select id="p-title" style="height:44px;width:100%;">
                        ${ALL_BRANCHES.map(branch => {
                          const optTxt = `${branch} Öğretmeni`;
                          return `<option value="${branch}" ${cp.title === optTxt ? 'selected' : ''}>${optTxt}</option>`;
                        }).join('')}
                        <option value="Öğretmen" ${cp.title === 'Öğretmen' ? 'selected' : ''}>Diğer / Sadece Öğretmen</option>
                      </select>
                    </div>
                    <div class="form-group" style="margin:0;"><label>Telefon</label><input type="tel" id="p-phone" value="${cp.phone || ''}" placeholder="0555 000 00 00"></div>
                    <div class="form-group" style="margin:0;"><label>E-posta</label><input type="email" id="p-email" value="${cp.email || ''}" placeholder="ornek@mail.com"></div>
                    <div class="form-group" style="margin:0;"><label>Şehir</label><input type="text" id="p-city" value="${cp.city || ''}" placeholder="İstanbul"></div>
                    <div class="form-group" style="margin:0;"><label>Deneyim</label><input type="text" id="p-exp" value="${cp.experience || ''}" placeholder="ör. 5 yıl"></div>
                    <div class="form-group" style="margin:0;grid-column:1/-1;"><label>Hakkımda</label><textarea id="p-bio" rows="3" placeholder="Kendinizi kısaca tanıtın...">${cp.bio || ''}</textarea></div>
                  </div>

                  <div style="border-top:1px solid var(--border);padding-top:24px;margin-bottom:24px;">
                    <div style="font-size:13px;font-weight:800;color:var(--text-primary);margin-bottom:16px;display:flex;align-items:center;gap:8px;">
                      <div style="width:4px;height:16px;background:#7c6aff;border-radius:2px;"></div>Branş & Sınıf Seçimi
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
                      <div class="form-group">
                        <label style="margin-bottom:12px;display:block;font-size:13px;font-weight:700;color:var(--brand-green);">Branşlar / Dersler</label>
                        <div class="selection-list" id="p-branch-list">
                          ${ALL_BRANCHES.map(branch => `
                            <label class="selection-item">
                              <input type="checkbox" name="p-branches" value="${branch}" ${cp.branches?.includes(branch) ? 'checked' : ''}>
                              <div class="selection-box"><span class="selection-label">${branch}</span><div class="selection-check">${icon('check', 14)}</div></div>
                            </label>`).join('')}
                        </div>
                      </div>
                      <div class="form-group">
                        <label style="margin-bottom:12px;display:block;font-size:13px;font-weight:700;color:var(--brand-green);">Sınıflar / Seviyeler</label>
                        <div class="selection-list">
                          ${ALL_GRADES.map(grade => `
                            <label class="selection-item">
                              <input type="checkbox" name="p-grades" value="${grade}" ${cp.grades?.includes(grade) ? 'checked' : ''}>
                              <div class="selection-box"><span class="selection-label">${grade}</span><div class="selection-check">${icon('check', 14)}</div></div>
                            </label>`).join('')}
                        </div>
                      </div>
                    </div>
                    <p style="font-size:11px;color:var(--text-muted);margin-top:10px;">* Branş değişikliği sadece Tarih ve Matematik grupları için toplu yapılabilir.</p>
                  </div>

                  <div style="display:flex;gap:12px;justify-content:flex-end;padding-top:20px;border-top:1px solid var(--border);">
                    <button class="btn btn-secondary" id="btn-cancel-edit">İptal</button>
                    <button class="btn btn-primary hover-lift" id="btn-save-profile" style="box-shadow:0 4px 14px rgba(16,185,129,0.3);padding:10px 24px;font-weight:700;">
                      ${icon('check', 15)} Değişiklikleri Kaydet
                    </button>
                  </div>
                </div>
              </div>
            `;

            // Avatar upload in edit mode
            mainGrid.querySelector('#avatar-upload-edit')?.addEventListener('change', (e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                import('../store/store.js').then(mStore => {
                  mStore.updateProfile({ avatar: ev.target.result });
                  import('../components/Layout.js').then(layout => layout.refreshTopbar(mStore.getState()));
                });
                const avatarDiv = mainGrid.querySelector('#profile-avatar-edit');
                if (avatarDiv) avatarDiv.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:17px;">`;
              };
              reader.readAsDataURL(file);
            });

            // Cancel
            mainGrid.querySelector('#btn-cancel-edit')?.addEventListener('click', () => {
              isEditing = false; updateView();
            });

            // Show branch policy
            showBranchPolicyModal(modal);

            // Branch radio-like behavior
            const branchCbs = mainGrid.querySelectorAll('input[name="p-branches"]');
            branchCbs.forEach(cb => {
              cb.addEventListener('change', () => {
                if (cb.checked) {
                  const val = cb.value;
                  if (HISTORY_GROUP.includes(val)) branchCbs.forEach(o => { if (!HISTORY_GROUP.includes(o.value)) o.checked = false; });
                  else if (MATH_GROUP.includes(val)) branchCbs.forEach(o => { if (!MATH_GROUP.includes(o.value)) o.checked = false; });
                  else branchCbs.forEach(o => { if (o !== cb) o.checked = false; });
                }
              });
            });

            // Title → branch sync
            mainGrid.querySelector('#p-title')?.addEventListener('change', (e) => {
              const val = e.target.value;
              if (val !== 'Öğretmen') {
                const cb = mainGrid.querySelector(`input[name="p-branches"][value="${val}"]`);
                if (cb) { cb.checked = true; cb.dispatchEvent(new Event('change')); }
              }
            });

            // Save
            mainGrid.querySelector('#btn-save-profile')?.addEventListener('click', () => {
              const titleSel = mainGrid.querySelector('#p-title');
              const titleVal = titleSel ? titleSel.options[titleSel.selectedIndex].text : cp.title;
              const branchKey = titleSel ? titleSel.value : '';
              const selGrades = Array.from(mainGrid.querySelectorAll('input[name="p-grades"]:checked')).map(b => b.value);
              const selBranches = Array.from(mainGrid.querySelectorAll('input[name="p-branches"]:checked')).map(b => b.value);
              if (branchKey !== 'Öğretmen' && !selBranches.includes(branchKey)) selBranches.push(branchKey);

              m.updateProfile({
                name: mainGrid.querySelector('#p-name').value.trim(),
                title: titleVal,
                grades: selGrades,
                branches: selBranches,
                phone: mainGrid.querySelector('#p-phone').value.trim(),
                email: mainGrid.querySelector('#p-email').value.trim(),
                city: mainGrid.querySelector('#p-city').value.trim(),
                experience: mainGrid.querySelector('#p-exp').value.trim(),
                bio: mainGrid.querySelector('#p-bio').value.trim(),
              });

              const saveBtn = mainGrid.querySelector('#btn-save-profile');
              saveBtn.innerHTML = `${icon('check', 15)} Kaydedildi!`;
              saveBtn.style.background = 'var(--success)';
              setTimeout(() => {
                import('../components/Layout.js').then(layout => layout.refreshTopbar(m.getState()));
                isEditing = false;
                updateView();
              }, 700);
            });

            editBtn.innerHTML = `Vazgeç`;
            editBtn.className = 'btn btn-secondary';
          }
        });
      }

      updateView();
      editBtn?.addEventListener('click', () => { isEditing = !isEditing; updateView(); });
    }
  };
}

// ═════════════════════════════════════════════════
// NOTIFICATIONS PAGE
// ═════════════════════════════════════════════════
export function renderNotifications(navigate) {
  const state = getState();

  const html = `
    <div class="fade-in">
      <div class="page-header">
        <div>
          <h2>Bildirimler</h2>
          <p>Tüm sistem bildirimleri</p>
        </div>
        <button class="btn btn-ghost btn-sm" id="btn-mark-read">${icon('check', 13)} Tümünü Okundu İşaretle</button>
      </div>

      <div class="card" style="padding:0;">
        ${state.notifications.length === 0 ? `<div class="empty-state">${icon('bell', 40)}<h3>Bildirim yok</h3></div>` : ''}
        ${state.notifications.map(n => `
          <div class="notif-item ${n.read ? '' : 'unread'}" ${n.link ? `data-nav="${n.link}"` : ''} style="padding:16px 20px; ${n.link ? 'cursor:pointer;' : ''}">
            <div class="notif-icon" style="margin-top:2px;">
              <div style="width:32px;height:32px;border-radius:8px;background:${n.type === 'warning' ? 'rgba(255,159,67,0.15)' : n.type === 'success' ? 'rgba(46,213,115,0.15)' : 'rgba(99,202,183,0.15)'};display:flex;align-items:center;justify-content:center;">
                ${n.type === 'warning' ? icon('alertCircle', 16) : n.type === 'success' ? icon('checkCircle', 16) : icon('bell', 16)}
              </div>
            </div>
            <div style="flex:1;">
              <div class="notif-text" style="font-size:13px;">${n.text}</div>
              <div class="notif-time">${new Date(n.time).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            ${!n.read ? '<div style="width:8px;height:8px;border-radius:50%;background:var(--accent);flex-shrink:0;margin-top:4px;"></div>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  return {
    html,
    init: (el, nav) => {
      el.querySelector('#btn-mark-read')?.addEventListener('click', () => {
        import('../store/store.js').then(m => {
          m.markAllNotificationsRead();
          nav('notifications');
        });
      });
    }
  };
}
