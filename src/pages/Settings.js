// ═════════════════════════════════════════════════
// SETTINGS PAGE
// ═════════════════════════════════════════════════
import { getState, updateSettings, updateProfile } from '../store/store.js';
import { icon } from '../components/icons.js';

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
        <div class="card">
          <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Uygulama Kimliği</h3>
          <div class="form-group">
            <label>Uygulama Adı</label>
            <input type="text" id="app-name" value="${state.settings.appName || 'Tarih Dükkanı'}">
          </div>
          <div class="form-group">
            <label>Logo (URL veya dosya)</label>
            <div style="display:flex;gap:8px;align-items:center;">
              <input type="url" id="app-logo" value="${state.settings.logo || ''}" placeholder="https://... (boş bırakılırsa baş harfler kullanılır)">
            </div>
          </div>
          <button class="btn btn-primary" id="btn-save-branding">${icon('check', 14)} Kaydet</button>
        </div>

        <!-- Google Calendar Integration -->
        <div class="card">
          <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Google Takvim Entegrasyonu</h3>
          <div style="background:rgba(255,159,67,0.08);border:1px solid rgba(255,159,67,0.3);border-radius:10px;padding:16px;margin-bottom:16px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              ${icon('alertCircle', 16)}
              <span style="font-weight:600;color:var(--warning);">Google Calendar API</span>
            </div>
            <p style="font-size:13px;color:var(--text-muted);">Google Calendar entegrasyonu için OAuth2 yapılandırması gereklidir. Bu özellik yakında aktif edilecek.</p>
          </div>
          <div class="form-group">
            <label>Google API Anahtarı</label>
            <input type="password" id="g-api-key" value="${state.settings.calendarApiKey || ''}" placeholder="AIza... (isteğe bağlı, okuma için)">
          </div>
          <div class="form-group">
            <label>Takvim ID'si</label>
            <input type="text" id="g-cal-id" value="${state.settings.calendarId || ''}" placeholder="örn: name@gmail.com veya özel ID">
          </div>
          <button class="btn btn-primary" id="btn-save-calendar">${icon('check', 14)} Takvim Ayarlarını Kaydet</button>
        </div>

        <!-- Data Management -->
        <div class="card">
          <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Veri Yönetimi</h3>
          <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">Tüm veriler tarayıcı belleğinde (localStorage) tutulmaktadır.</p>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <button class="btn btn-secondary" id="btn-export">
              ${icon('download', 14)} Veriyi Dışa Aktar (JSON)
            </button>
            <div>
              <input type="file" id="import-file" accept=".json" style="display:none;">
              <button class="btn btn-secondary" id="btn-import">
                ${icon('upload', 14)} Veriyi İçe Aktar
              </button>
            </div>
            <button class="btn btn-danger" id="btn-reset">
              ${icon('trash', 14)} Tüm Verileri Sıfırla
            </button>
          </div>
        </div>

        <!-- About -->
        <div class="card">
          <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Hakkında</h3>
          <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;color:var(--text-secondary);">
            <div style="display:flex;justify-content:space-between;">
              <span>Uygulama</span>
              <span style="font-weight:600;">Tarih Dükkanı</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span>Versiyon</span>
              <span class="badge badge-info">v1.0.0</span>
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
      el.querySelector('#btn-save-branding')?.addEventListener('click', () => {
        updateSettings({
          appName: el.querySelector('#app-name').value.trim() || 'Tarih Dükkanı',
          logo: el.querySelector('#app-logo').value.trim() || null,
        });
        // Refresh sidebar
        import('../components/Layout.js').then(m => m.refreshSidebar(getState(), 'settings'));
        const btn = el.querySelector('#btn-save-branding');
        btn.innerHTML = `${icon('check', 14)} Kaydedildi!`;
        btn.style.background = 'var(--success)';
        setTimeout(() => {
          btn.innerHTML = `${icon('check', 14)} Kaydet`;
          btn.style.background = '';
        }, 2000);
      });

      el.querySelector('#btn-save-calendar')?.addEventListener('click', () => {
        updateSettings({
          calendarApiKey: el.querySelector('#g-api-key').value.trim(),
          calendarId: el.querySelector('#g-cal-id').value.trim(),
        });
        const btn = el.querySelector('#btn-save-calendar');
        btn.innerHTML = `${icon('check', 14)} Kaydedildi!`;
        btn.style.background = 'var(--success)';
        setTimeout(() => {
          btn.innerHTML = `${icon('check', 14)} Takvim Ayarlarını Kaydet`;
          btn.style.background = '';
        }, 2000);
      });

      el.querySelector('#btn-export')?.addEventListener('click', () => {
        const data = JSON.stringify(getState(), null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tarih-dukkani-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });

      el.querySelector('#btn-import')?.addEventListener('click', () => {
        el.querySelector('#import-file').click();
      });

      el.querySelector('#import-file')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result);
            localStorage.setItem('tarih_dukkani_v1', JSON.stringify(data));
            nav('dashboard');
          } catch { alert('Geçersiz dosya.'); }
        };
        reader.readAsText(file);
      });

      el.querySelector('#btn-reset')?.addEventListener('click', () => {
        if (confirm('TÜM verileriniz silinecek! Emin misiniz?')) {
          localStorage.removeItem('tarih_dukkani_v1');
          location.reload();
        }
      });
    }
  };
}

// ═════════════════════════════════════════════════
// PROFILE PAGE
// ═════════════════════════════════════════════════
export function renderProfile(navigate) {
  const state = getState();
  const p = state.profile;
  let editMode = false;

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

        <!-- Edit Form -->
        <div class="card" id="profile-form">
          <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">İletişim & Bilgiler</h3>
          <div class="form-group">
            <label>Ad Soyad</label>
            <input type="text" id="p-name" value="${p.name}">
          </div>
          <div class="form-group">
            <label>Ünvan / Branş</label>
            <input type="text" id="p-title" value="${p.title}">
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
        </div>
      </div>
    </div>
  `;

  return {
    html,
    init: (el, nav) => {
      el.querySelector('#btn-save-profile')?.addEventListener('click', () => {
        const { updateProfile } = require('../store/store.js');
        import('../store/store.js').then(m => {
          m.updateProfile({
            name: el.querySelector('#p-name').value.trim(),
            title: el.querySelector('#p-title').value.trim(),
            phone: el.querySelector('#p-phone').value.trim(),
            email: el.querySelector('#p-email').value.trim(),
            city: el.querySelector('#p-city').value.trim(),
            experience: el.querySelector('#p-exp').value.trim(),
            bio: el.querySelector('#p-bio').value.trim(),
          });
          import('../components/Layout.js').then(layout => layout.refreshTopbar(m.getState()));
          const btn = el.querySelector('#btn-save-profile');
          btn.innerHTML = `${icon('check', 14)} Kaydedildi!`;
          btn.style.background = 'var(--success)';
          setTimeout(() => { btn.innerHTML = `${icon('check', 14)} Kaydet`; btn.style.background = ''; }, 2000);
        });
      });

      el.querySelector('#avatar-upload')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          import('../store/store.js').then(m => m.updateProfile({ avatar: ev.target.result }));
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
  const { formatDistanceToNow } = require('../utils/helpers.js');

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
          <div class="notif-item ${n.read ? '' : 'unread'}" style="padding:16px 20px;">
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
