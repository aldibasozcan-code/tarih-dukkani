// ═════════════════════════════════════════════════
// SETTINGS PAGE
// ═════════════════════════════════════════════════
import { getState, updateSettings, updateProfile } from '../store/store.js';
import { ALL_GRADES, ALL_BRANCHES } from '../data/curriculum.js';
import { icon } from '../components/icons.js';

const HISTORY_GROUP = ["Sosyal Bilgiler", "T.C. İnkılap Tarihi ve Atatürkçülük", "Tarih"];
const MATH_GROUP = ["Matematik (İlköğretim)", "Matematik (Lise)"];

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

  const html = `
    <div class="fade-in">
      <div class="page-header">
        <div>
          <h2>Ayarlar</h2>
          <p>Sistem ve uygulama ayarları</p>
        </div>
      </div>

      <div class="grid grid-2" style="align-items:start;">
        <!-- App Branding -->
        <div class="card" style="grid-column: 1 / -1; display: grid; grid-template-columns: 1.5fr 1fr; gap: 32px;">
          <div>
            <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Uygulama Kimliği & Markalaşma</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>Uygulama Adı</label>
                <input type="text" id="app-name" value="${state.settings.appName || 'Bitig.app'}">
              </div>
              <div class="form-group">
                <label>Logo (URL)</label>
                <input type="url" id="app-logo" value="${state.settings.logo || ''}" placeholder="https://...">
              </div>
            </div>

            <div class="form-group">
              <label>Alt Bilgi (Sidebar Footer)</label>
              <input type="text" id="app-footer" value="${state.settings.footerText || 'v1.0 • Bitig.app'}" placeholder="v1.0 • Marka Adınız">
            </div>

            <div class="form-group">
              <label>Marka Rengi</label>
              <div style="display:flex; gap:12px; align-items:center;">
                <input type="color" id="app-color" value="${state.settings.brandColor || '#004526'}" style="width:50px; height:44px; padding:2px;">
                <div id="color-presets" style="display:flex; gap:8px;">
                  ${['#004526', '#1e40af', '#7c3aed', '#db2777', '#059669', '#111827'].map(c => `
                    <button class="color-preset" data-color="${c}" style="width:24px; height:24px; border-radius:50%; background:${c}; border:2px solid ${state.settings.brandColor === c ? 'var(--text-primary)' : 'transparent'}; cursor:pointer;"></button>
                  `).join('')}
                </div>
              </div>
            </div>

            <button class="btn btn-primary" id="btn-save-branding" style="margin-top:8px;">${icon('check', 14)} Değişiklikleri Kaydet</button>
          </div>

          <!-- Live Preview -->
          <div style="background:var(--bg-secondary); border-radius:var(--radius-lg); border:1px dashed var(--border); padding:24px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
            <div style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:16px; letter-spacing:1px;">Canlı Marka Önizlemesi</div>
            
            <!-- Miniature Sidebar -->
            <div id="brand-preview-sidebar" style="width:180px; background:${state.settings.brandColor || '#004526'}; border-radius:12px; padding:16px; box-shadow:var(--shadow-lg); transition: all 0.3s ease;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:24px;">
                <div id="preview-logo-box" style="width:32px; height:32px; background:#fff; border-radius:8px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                  ${state.settings.logo ? `<img src="${state.settings.logo}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="color:${state.settings.brandColor || '#004526'}; font-weight:800; font-size:14px;">${(state.settings.appName || 'TP').slice(0, 2).toUpperCase()}</span>`}
                </div>
                <div style="font-size:13px; font-weight:800; color:#fff;" id="preview-name">${state.settings.appName || 'Bitig.app'}</div>
              </div>
              
              <div style="height:8px; width:100%; background:rgba(255,255,255,0.1); border-radius:4px; margin-bottom:8px;"></div>
              <div style="height:8px; width:70%; background:rgba(255,255,255,0.1); border-radius:4px; margin-bottom:8px;"></div>
              <div style="height:24px; width:100%; background:#fff; border-radius:6px; margin:16px 0 8px;"></div>
              
              <div style="margin-top:32px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1); font-size:9px; color:rgba(255,255,255,0.6);" id="preview-footer">
                ${state.settings.footerText || 'v1.0 • Bitig.app'}
              </div>
            </div>
          </div>
        </div>


        <!-- Data Management -->
        <div class="card">
          <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Veri Yönetimi</h3>
          
          <div style="margin-bottom:20px; padding:12px; background:var(--bg-secondary); border-radius:12px; border:1px solid var(--border);">
            <div style="font-size:12px; font-weight:700; margin-bottom:8px; color:var(--brand-green);">ÖĞRENCİ & GRUP YÖNETİMİ</div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-secondary btn-sm" id="btn-export-students" style="flex:1;">
                ${icon('download', 14)} Dışa Aktar
              </button>
              <button class="btn btn-secondary btn-sm" id="btn-import-students" style="flex:1;">
                ${icon('upload', 14)} İçe Aktar
              </button>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:10px;">
            <button class="btn btn-primary" id="btn-sync-meb">
              ${icon('refresh', 14)} MEB Müfredatını Yenile (Varsayılan)
            </button>
            <button class="btn btn-secondary" id="btn-export-all">
              ${icon('download', 14)} Tüm Verileri Yedekle (JSON)
            </button>
            <button class="btn btn-secondary" id="btn-import-all">
              ${icon('upload', 14)} Tüm Verileri Geri Yükle
            </button>
            <input type="file" id="import-file-all" accept=".json" style="display:none;">
            <input type="file" id="import-file-students" accept=".json" style="display:none;">
            
            <button class="btn btn-danger" id="btn-reset" style="margin-top:8px;">
              ${icon('trash', 14)} Sistem Verilerini Sıfırla
            </button>
          </div>
        </div>

        <!-- Excel Curriculum Import -->
        <div class="card">
          <h3 style="font-size:15px;font-weight:700;margin-bottom:12px;">Müfredat İçe Aktar (Excel)</h3>
          <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">
            Kendi hazırladığınız müfredatları Excel (.xlsx, .xls) dosyasıyla toplu olarak yükleyin.
          </p>
          <div style="background:var(--bg-secondary); border-radius:8px; padding:12px; margin-bottom:16px; border:1px solid var(--border);">
            <div style="font-size:12px; font-weight:700; margin-bottom:4px; color:var(--text-primary);">Excel Formatı:</div>
            <p style="font-size:11px; color:var(--text-secondary); margin:0;">Birinci satırda şu başlıklar olmalıdır: <strong>Sınıf, Ünite, Konu</strong></p>
          </div>
          <div class="form-group">
            <label>Hedef Ders / Branş</label>
            <select id="import-excel-subject">
              ${state.profile.branches.map(b => `<option value="${b}">${b}</option>`).join('')}
            </select>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <input type="file" id="import-excel-file" accept=".xlsx, .xls" style="display:none;">
            <button class="btn btn-secondary" id="btn-import-excel" style="width:100%; justify-content:center;">
              ${icon('upload', 14)} Excel Seç ve Yükle
            </button>
          </div>
        </div>

        </div>
        
        <!-- Guided Tour -->
        <div class="card">
          <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Uygulama Rehberi</h3>
          <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">
            Uygulamanın özelliklerini ve nasıl kullanıldığını tekrar hatırlamak ister misiniz?
          </p>
          <button class="btn btn-secondary" id="btn-start-tour" style="width:100%;justify-content:center;">
            ${icon('star', 14)} Rehberi Tekrar Başlat
          </button>
        </div>

        <!-- About -->
        <div class="card">
          <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Hakkında</h3>
          <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;color:var(--text-secondary);">
            <div style="display:flex;justify-content:space-between;">
              <span>Uygulama</span>
              <span style="font-weight:600;">Bitig.app</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span>Versiyon</span>
              <span class="badge badge-info">v1.1.0</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span>Kullanıcı</span>
              <span style="font-weight:600;">${state.profile.name}</span>
            </div>
            <hr class="divider">
            <p style="font-size:12px;color:var(--text-muted);">Tüm veriler lokal olarak saklanmaktadır. İnternet bağlantısı gerektirmez.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  return {
    html,
    init: (el, nav) => {
      // Live Preview Real-time Updates
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

        if (previewSidebar) previewSidebar.style.background = color;
        if (previewName) previewName.textContent = name;
        if (previewFooter) previewFooter.textContent = footer;
        if (previewLogoBox) {
          previewLogoBox.innerHTML = logo 
            ? `<img src="${logo}" style="width:100%; height:100%; object-fit:cover;">` 
            : `<span style="color:${color}; font-weight:800; font-size:14px;">${name.slice(0, 2).toUpperCase()}</span>`;
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

      el.querySelector('#btn-save-branding')?.addEventListener('click', () => {
        updateSettings({
          appName: nameInp.value.trim() || 'Bitig.app',
          logo: logoInp.value.trim() || null,
          brandColor: colorInp.value,
          footerText: footerInp.value.trim() || 'v1.0 • Bitig.app'
        });
        
        // Refresh UI
        import('../components/Layout.js').then(m => {
          const state = getState();
          m.refreshSidebar(state, 'settings');
          m.refreshTopbar(state);
          m.applyTheme(state);
        });

        const btn = el.querySelector('#btn-save-branding');
        btn.innerHTML = `${icon('check', 14)} Kaydedildi!`;
        btn.style.background = 'var(--success)';
        setTimeout(() => {
          btn.innerHTML = `${icon('check', 14)} Değişiklikleri Kaydet`;
          btn.style.background = '';
        }, 2000);
      });



      el.querySelector('#btn-sync-meb')?.addEventListener('click', async () => {
        if (confirm('MEB müfredatı varsayılan haline dönecektir. Kendinizin eklediği ünite isimleri vb. üzerine yazılabilir. Emin misiniz?')) {
          const btn = el.querySelector('#btn-sync-meb');
          btn.innerHTML = 'Yenileniyor...';
          btn.disabled = true;
          const { syncCurriculumWithBranches } = await import('../store/store.js');
          syncCurriculumWithBranches(getState().profile.branches || [], getState().profile.grades || [], true);
          setTimeout(() => {
            btn.innerHTML = `${icon('check', 14)} Yenilendi`;
            btn.style.background = 'var(--success)';
            setTimeout(() => {
              btn.innerHTML = `${icon('refresh', 14)} MEB Müfredatını Yenile`;
              btn.style.background = '';
              btn.disabled = false;
            }, 2000);
          }, 500);
        }
      });

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

      el.querySelector('#btn-export-students')?.addEventListener('click', () => {
        const state = getState();
        const data = JSON.stringify({ 
          students: state.students, 
          groups: state.groups 
        }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bitig-students-groups-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });

      el.querySelector('#btn-import-all')?.addEventListener('click', () => {
        el.querySelector('#import-file-all').click();
      });

      el.querySelector('#btn-import-students')?.addEventListener('click', () => {
        el.querySelector('#import-file-students').click();
      });

      const handleImport = (inputEl, type) => {
        inputEl?.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async (ev) => {
            try {
              const data = JSON.parse(ev.target.result);
              const { importData, importStudentsAndGroups } = await import('../store/store.js');
              if (type === 'all') {
                await importData(data);
              } else {
                await importStudentsAndGroups(data);
              }
              alert('İçe aktarma başarılı.');
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

      el.querySelector('#btn-reset')?.addEventListener('click', async () => {
        if (confirm('Sadece SİZE AİT olan tüm verileriniz sıfırlanacak! Emin misiniz?')) {
          const btn = el.querySelector('#btn-reset');
          btn.innerHTML = 'Sıfırlanıyor...';
          btn.disabled = true;
          const { resetData } = await import('../store/store.js');
          await resetData();
        }
      });

      // Excel Import Logic
      el.querySelector('#btn-import-excel')?.addEventListener('click', () => {
        el.querySelector('#import-excel-file').click();
      });

      el.querySelector('#import-excel-file')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const btn = el.querySelector('#btn-import-excel');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = 'Okunuyor...';
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

      el.querySelector('#btn-delete-account')?.addEventListener('click', () => {
        import('../components/modal.js').then(m => {
          m.openModal({
            title: 'Hesabı Sil',
            body: `
              <div style="text-align:center; padding: 10px 0;">
                <div style="color:var(--danger); margin-bottom:16px;">
                  ${icon('alertCircle', 48)}
                </div>
                <h3 style="font-size:18px; margin-bottom:8px; color:var(--text-primary);">Tüm Verileriniz Silinecek!</h3>
                <p style="color:var(--text-secondary); line-height:1.6;">
                  Bu işlem sonucunda öğrenci kayıtlarınız, dersleriniz, muhasebe kayıtlarınız ve e-posta kimliğiniz <strong>tamamen ve kalıcı olarak</strong> imha edilecektir. Devam etmek istediğinize emin misiniz?
                </p>
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
            btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;border-color:#fff;border-top-color:transparent;display:inline-block;"></div> Siliniyor...';
            btn.disabled = true;
            document.getElementById('modal-cancel-btn').disabled = true;
            try {
              const { deleteAccount } = await import('../store/store.js');
              await deleteAccount();
              
              m.openModal({
                title: 'Veda Vakti',
                body: `
                  <div style="text-align:center; padding: 20px 0;">
                    <div style="color:var(--success); margin-bottom:16px;">
                      ${icon('checkCircle', 48)}
                    </div>
                    <h3 style="font-size:20px; margin-bottom:8px; color:var(--text-primary);">Hesabınız Silindi</h3>
                    <p style="color:var(--text-secondary); line-height:1.6;">
                      Tüm verileriniz ve kayıtlarınız güvenle sistemden kaldırılmıştır. Sizi aramızda tekrar görmek dileğiyle, tekrar görüşmek üzere!
                    </p>
                  </div>
                `,
                footer: `
                  <button class="btn btn-primary" id="goodbye-btn" style="width:100%;justify-content:center;">Ana Sayfaya Dön</button>
                `
              });

              document.getElementById('goodbye-btn')?.addEventListener('click', () => {
                window.location.hash = '#register';
                window.location.reload();
              });

            } catch (err) {
              btn.innerHTML = 'Silinemedi';
              btn.disabled = false;
              document.getElementById('modal-cancel-btn').disabled = false;
              
              m.showAlert({ 
                title: err.message.includes('yeniden giriş') ? 'Güvenlik Uyarısı' : 'Hata', 
                message: err.message, 
                buttonText: 'Anladım' 
              });
            }
          });
        });
      });

      // Guided Tour
      el.querySelector('#btn-start-tour')?.addEventListener('click', () => {
        import('./modals/GuidedTour.js').then(m => m.restartTour(nav));
      });
    }
  };
}

// ═════════════════════════════════════════════════
// PROFILE PAGE
// ═════════════════════════════════════════════════
function renderProfileFormContent(p, editMode) {
  if (!editMode) {
    return `
      <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;">
        <span>İletişim & Bilgiler</span>
        <span class="badge badge-info text-xs">Okuma Modu</span>
      </h3>
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div style="display:grid;grid-template-columns:120px 1fr;gap:16px;font-size:14px;align-items:start;">
          <strong style="color:var(--text-muted);margin-top:2px;">Ad Soyad:</strong>
          <span style="font-weight:600;">${p.name || '-'}</span>
          
          <strong style="color:var(--text-muted);margin-top:2px;">Ünvan:</strong>
          <span>${p.title || '-'}</span>
          
          <strong style="color:var(--text-muted);margin-top:2px;">Branşlar:</strong>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${p.branches && p.branches.length > 0 
              ? p.branches.map(b => `<span class="badge" style="background:var(--bg-card);border:1px solid var(--border);color:var(--text-secondary);">${b}</span>`).join('')
              : '<span style="color:var(--text-muted);font-style:italic;">Belirtilmemiş</span>'}
          </div>
          
          <strong style="color:var(--text-muted);margin-top:2px;">Sınıflar:</strong>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${p.grades && p.grades.length > 0 
              ? p.grades.map(g => `<span class="badge" style="background:var(--bg-card);border:1px solid var(--border);color:var(--text-secondary);">${g}</span>`).join('')
              : '<span style="color:var(--text-muted);font-style:italic;">Belirtilmemiş</span>'}
          </div>
          
          <strong style="color:var(--text-muted);margin-top:2px;">Telefon:</strong>
          <span>${p.phone || '-'}</span>
          
          <strong style="color:var(--text-muted);margin-top:2px;">E-posta:</strong>
          <span>${p.email || '-'}</span>
          
          <strong style="color:var(--text-muted);margin-top:2px;">Şehir:</strong>
          <span>${p.city || '-'}</span>
          
          <strong style="color:var(--text-muted);margin-top:2px;">Deneyim:</strong>
          <span>${p.experience || '-'}</span>
          
          <strong style="color:var(--text-muted);margin-top:2px;">Hakkımda:</strong>
          <span style="white-space:pre-wrap;line-height:1.5;">${p.bio || '-'}</span>
        </div>
      </div>
    `;
  }

  return `
    <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">İletişim & Bilgiler (Düzenle)</h3>
    <div class="form-group">
      <label>Ad Soyad</label>
      <input type="text" id="p-name" value="${p.name}">
    </div>
    <div class="form-group">
      <label>Ünvan / Branş</label>
      <select id="p-title" style="height: 44px; width: 100%;">
        ${ALL_BRANCHES.map(branch => {
          const optionText = `${branch} Öğretmeni`;
          const isSelected = p.title === optionText ? 'selected' : '';
          return `<option value="${branch}" ${isSelected}>${optionText}</option>`;
        }).join('')}
        <option value="Öğretmen" ${p.title === 'Öğretmen' ? 'selected' : ''}>Diğer / Sadece Öğretmen</option>
      </select>
    </div>
    
    <div class="form-group" style="margin-top: 24px; border-top: 1px solid var(--border); padding-top: 20px;">
      <div class="grid grid-2" style="gap: 32px;">
        <!-- Branches -->
        <div class="form-group">
          <label style="margin-bottom: 12px; display: block; font-size: 14px; font-weight: 700; color: var(--brand-green);">Branşlar / Dersler</label>
          <div class="selection-list" id="p-branch-list">
            ${ALL_BRANCHES.map(branch => {
              const isChecked = p.branches && p.branches.includes(branch) ? 'checked' : '';
              return `
              <label class="selection-item">
                <input type="checkbox" name="p-branches" value="${branch}" ${isChecked}>
                <div class="selection-box">
                  <span class="selection-label">${branch}</span>
                  <div class="selection-check">${icon('check', 14)}</div>
                </div>
              </label>
            `}).join('')}
          </div>
        </div>
        
        <!-- Grades -->
        <div class="form-group">
          <label style="margin-bottom: 12px; display: block; font-size: 14px; font-weight: 700; color: var(--brand-green);">Sınıflar / Seviyeler</label>
          <div class="selection-list">
            ${ALL_GRADES.map(grade => {
              const isChecked = p.grades && p.grades.includes(grade) ? 'checked' : '';
              return `
              <label class="selection-item">
                <input type="checkbox" name="p-grades" value="${grade}" ${isChecked}>
                <div class="selection-box">
                  <span class="selection-label">${grade}</span>
                  <div class="selection-check">${icon('check', 14)}</div>
                </div>
              </label>
            `}).join('')}
          </div>
        </div>
      </div>
      <p style="font-size:11px; color:var(--text-muted); margin-top:8px;">
        * Branş değişikliği sadece Tarih ve Matematik grupları için toplu olarak yapılabilir. Diğer branşlar tektir.
      </p>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Telefon</label>
        <input type="tel" id="p-phone" value="${p.phone || ''}">
      </div>
      <div class="form-group">
        <label>E-posta</label>
        <input type="email" id="p-email" value="${p.email || ''}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Şehir</label>
        <input type="text" id="p-city" value="${p.city || ''}">
      </div>
      <div class="form-group">
        <label>Deneyim</label>
        <input type="text" id="p-exp" value="${p.experience || ''}">
      </div>
    </div>
    <div class="form-group">
      <label>Hakkımda</label>
      <textarea id="p-bio" rows="3">${p.bio || ''}</textarea>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;">
      <button class="btn btn-primary" id="btn-save-profile">${icon('check', 14)} Kaydet</button>
    </div>
  `;
}

export function renderProfile(navigate) {
  const state = getState();
  const p = state.profile;

  const html = `
    <div class="fade-in">
      <div class="page-header">
        <div>
          <h2>Profil</h2>
          <p>Kişisel bilgiler ve ayarlar</p>
        </div>
        <button class="btn btn-primary" id="btn-edit-profile">${icon('edit', 14)} Düzenle</button>
      </div>

      <div class="grid grid-2" style="align-items:start;">
        <!-- Profile Card -->
        <div class="card" style="text-align:center;padding:32px;">
          <div style="width:80px;height:80px;border-radius:20px;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#fff;margin:0 auto 16px;" id="profile-avatar">
            ${p.avatar ? `<img src="${p.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:20px;">` : p.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <h2 id="profile-name" style="font-size:20px;font-weight:800;">${p.name}</h2>
          <p id="profile-title" style="color:var(--accent);font-weight:600;margin-top:4px;">${p.title}</p>
          <div style="display:flex;justify-content:center;gap:16px;margin-top:20px;font-size:13px;color:var(--text-muted);">
            <div><div style="font-weight:700;font-size:18px;color:var(--text-primary);">${state.students.length}</div>Öğrenci</div>
            <div><div style="font-weight:700;font-size:18px;color:var(--text-primary);">${state.groups.length}</div>Grup</div>
          </div>
          <label class="btn btn-secondary" style="margin-top:16px;cursor:pointer;">
            ${icon('upload', 14)} Fotoğraf Değiştir
            <input type="file" accept="image/*" id="avatar-upload" style="display:none;">
          </label>
        </div>

        <!-- Edit Form Box -->
        <div class="card" id="profile-form">
          <!-- Handled dynamically by init -->
        </div>
      </div>
    </div>
  `;

  return {
    html,
    init: (el, nav) => {
      let isEditing = false;
      const editBtn = el.querySelector('#btn-edit-profile');
      const formContainer = el.querySelector('#profile-form');

      function updateView() {
        Promise.all([
          import('../store/store.js'),
          import('../components/modal.js')
        ]).then(([m, modal]) => {
          const currentProfile = m.getState().profile;
          formContainer.innerHTML = renderProfileFormContent(currentProfile, isEditing);
          
          if (isEditing) {
            editBtn.innerHTML = `Vazgeç`;
            editBtn.classList.replace('btn-primary', 'btn-secondary');
            
            // Branş Politikası Bilgilendirmesi
            showBranchPolicyModal(modal);

            const branchCheckboxes = formContainer.querySelectorAll('input[name="p-branches"]');
            branchCheckboxes.forEach(cb => {
              cb.addEventListener('change', () => {
                if (cb.checked) {
                  const val = cb.value;
                  const isHistory = HISTORY_GROUP.includes(val);
                  const isMath = MATH_GROUP.includes(val);

                  if (isHistory) {
                    branchCheckboxes.forEach(other => { if (!HISTORY_GROUP.includes(other.value)) other.checked = false; });
                  } else if (isMath) {
                    branchCheckboxes.forEach(other => { if (!MATH_GROUP.includes(other.value)) other.checked = false; });
                  } else {
                    branchCheckboxes.forEach(other => { if (other !== cb) other.checked = false; });
                  }
                }
              });
            });

            formContainer.querySelector('#btn-save-profile')?.addEventListener('click', () => {
              const titleSelect = el.querySelector('#p-title');
              const titleValue = titleSelect ? titleSelect.options[titleSelect.selectedIndex].text : p.title;
              const branchKey = titleSelect ? titleSelect.value : '';

              const selectedGrades = Array.from(el.querySelectorAll('input[name="p-grades"]:checked')).map(b => b.value);
              const selectedBranches = Array.from(el.querySelectorAll('input[name="p-branches"]:checked')).map(b => b.value);
              
              if (branchKey !== "Öğretmen" && !selectedBranches.includes(branchKey)) {
                selectedBranches.push(branchKey);
              }

              m.updateProfile({
                name: el.querySelector('#p-name').value.trim(),
                title: titleValue,
                grades: selectedGrades,
                branches: selectedBranches,
                phone: el.querySelector('#p-phone').value.trim(),
                email: el.querySelector('#p-email').value.trim(),
                city: el.querySelector('#p-city').value.trim(),
                experience: el.querySelector('#p-exp').value.trim(),
                bio: el.querySelector('#p-bio').value.trim(),
              });
              
              const btn = formContainer.querySelector('#btn-save-profile');
              btn.innerHTML = `${icon('check', 14)} Kaydedildi!`;
              btn.style.background = 'var(--success)';
              
              setTimeout(() => { 
                import('../components/Layout.js').then(layout => layout.refreshTopbar(m.getState()));
                isEditing = false;
                updateView();
              }, 600);
            });

            el.querySelector('#p-title')?.addEventListener('change', (e) => {
              const branchVal = e.target.value;
              if (branchVal !== "Öğretmen") {
                const checkbox = el.querySelector(`input[name="p-branches"][value="${branchVal}"]`);
                if (checkbox) {
                  checkbox.checked = true;
                  checkbox.dispatchEvent(new Event('change'));
                }
              }
            });
          } else {
            editBtn.innerHTML = `${icon('edit', 14)} Düzenle`;
            editBtn.classList.replace('btn-secondary', 'btn-primary');
          }
        });
      }

      // Initial Mount
      updateView();

      // Edit Toggle
      editBtn?.addEventListener('click', () => {
        isEditing = !isEditing;
        updateView();
      });

      el.querySelector('#avatar-upload')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          import('../store/store.js').then(m => {
            m.updateProfile({ avatar: ev.target.result });
            // Refresh topbar immediately
            import('../components/Layout.js').then(layout => layout.refreshTopbar(m.getState()));
          });
          const avatarDiv = el.querySelector('#profile-avatar');
          if (avatarDiv) avatarDiv.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:20px;">`;
        };
        reader.readAsDataURL(file);
      });
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
