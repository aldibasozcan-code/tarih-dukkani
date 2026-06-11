// ═════════════════════════════════════════════════
// CHAT PAGE - Contacts & WhatsApp (Enhanced)
// ═════════════════════════════════════════════════
import { getState } from '../store/store.js';
import { icon } from '../components/icons.js';
import { escHtml, getAvatarColor, getInitials, getGroupInitials, formatCurrency } from '../utils/helpers.js';

export function renderChat(navigate) {
  const state = getState();
  const contacts = buildContacts(state);
  const studentCount = contacts.filter(c => c.type === 'student').length;
  const groupCount = contacts.filter(c => c.type === 'group').length;
  const withPhone = contacts.filter(c => c.phone || c.parentPhone).length;

  const html = `
    <div class="fade-in">
      <!-- Premium Header -->
      <div class="page-header" style="background: linear-gradient(135deg, rgba(37,211,102,0.08) 0%, rgba(16,185,129,0.03) 100%); padding: 32px 24px; border-radius: 20px; margin-bottom: 28px; border: 1px solid rgba(37,211,102,0.15); box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
        <div>
          <h2 style="font-size: 32px; font-weight: 800; color: #25d366; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; letter-spacing: -0.5px;">
            ${icon('chat', 32)} Mesajlar & İletişim
          </h2>
          <p style="color: var(--text-secondary); font-size: 16px; font-weight: 500;">Öğrenci ve veli iletişim bilgileri — WhatsApp ile anında ulaşın</p>
        </div>
      </div>

      <!-- KPI Stats Row -->
      <div class="grid grid-4 fade-in-up stagger-1" style="margin-bottom: 28px; gap: 16px;">
        <div class="kpi-card hover-lift" style="border-left: 4px solid #25d366; background: rgba(255,255,255,0.8); padding: 16px 20px;">
          <div class="kpi-icon" style="background: rgba(37,211,102,0.12); color:#25d366; width:42px; height:42px; border-radius:10px;">${icon('students', 20)}</div>
          <div>
            <div class="kpi-value" style="font-size:24px;">${studentCount}</div>
            <div class="kpi-label" style="font-size:12px;">Toplam Öğrenci</div>
          </div>
        </div>
        <div class="kpi-card hover-lift" style="border-left: 4px solid #7c6aff; background: rgba(255,255,255,0.8); padding: 16px 20px;">
          <div class="kpi-icon" style="background: rgba(124,106,255,0.12); color:#7c6aff; width:42px; height:42px; border-radius:10px;">${icon('groups', 20)}</div>
          <div>
            <div class="kpi-value" style="font-size:24px;">${groupCount}</div>
            <div class="kpi-label" style="font-size:12px;">Toplam Grup</div>
          </div>
        </div>
        <div class="kpi-card hover-lift" style="border-left: 4px solid #25d366; background: rgba(255,255,255,0.8); padding: 16px 20px;">
          <div class="kpi-icon" style="background: rgba(37,211,102,0.12); color:#25d366; width:42px; height:42px; border-radius:10px;">${icon('phone', 20)}</div>
          <div>
            <div class="kpi-value" style="font-size:24px;">${withPhone}</div>
            <div class="kpi-label" style="font-size:12px;">WhatsApp Erişimli</div>
          </div>
        </div>
        <div class="kpi-card hover-lift" style="border-left: 4px solid #ff9f43; background: rgba(255,255,255,0.8); padding: 16px 20px;">
          <div class="kpi-icon" style="background: rgba(255,159,67,0.12); color:#ff9f43; width:42px; height:42px; border-radius:10px;">${icon('users', 20)}</div>
          <div>
            <div class="kpi-value" style="font-size:24px;">${contacts.length}</div>
            <div class="kpi-label" style="font-size:12px;">Toplam Kişi</div>
          </div>
        </div>
      </div>

      <!-- Filter & Search Row -->
      <div style="display:flex; gap:12px; margin-bottom:24px; align-items:center; flex-wrap:wrap;">
        <!-- Search -->
        <div class="search-box" style="flex:1; min-width:220px;">
          <span class="search-icon">${icon('search', 15)}</span>
          <input type="text" id="contact-search" placeholder="Ad, telefon veya sınıf ile ara..." style="width:100%; font-weight:600;">
        </div>
        <!-- Type filter tabs -->
        <div class="tabs" style="padding:4px; background:var(--bg-secondary); border-radius:var(--radius-md); display:inline-flex;">
          <button class="tab-btn active contact-filter-tab" data-filter="all" style="padding:6px 14px;font-size:13px;font-weight:700;border-radius:8px;">Tümü</button>
          <button class="tab-btn contact-filter-tab" data-filter="student" style="padding:6px 14px;font-size:13px;font-weight:700;border-radius:8px;">Öğrenciler</button>
          <button class="tab-btn contact-filter-tab" data-filter="group" style="padding:6px 14px;font-size:13px;font-weight:700;border-radius:8px;">Gruplar</button>
        </div>
        <!-- Group WA Broadcast Button -->
        <button class="btn hover-lift" id="btn-group-broadcast" style="background:linear-gradient(135deg,#25d366,#1ebe5d);color:#fff;border:none;padding:9px 18px;border-radius:12px;font-weight:700;font-size:14px;display:flex;align-items:center;gap:8px;box-shadow:0 6px 18px rgba(37,211,102,0.3);cursor:pointer;">
          ${icon('whatsapp', 16)} Toplu Mesaj
        </button>
      </div>

      <!-- Info count -->
      <div style="font-size:12px; font-weight:700; color:var(--text-secondary); margin-bottom:16px;" id="contact-count-info">${contacts.length} kişi listeleniyor</div>

      <!-- Contacts Grid -->
      <div class="grid grid-2" id="contacts-grid" style="gap:16px;">
        ${renderContactCards(contacts)}
      </div>

      ${contacts.length === 0 ? `
        <div class="empty-state" style="padding:60px 20px;">
          ${icon('chat', 56)}
          <h3 style="margin-top:16px; font-size:20px;">Henüz iletişim bilgisi yok</h3>
          <p style="color:var(--text-secondary);">Öğrenci ekleyerek iletişim bilgilerini buraya taşıyın</p>
        </div>
      ` : ''}
    </div>

    <!-- WA Broadcast Modal (hidden) -->
    <div id="wa-broadcast-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); backdrop-filter:blur(6px); z-index:1000; align-items:center; justify-content:center; padding:20px;">
      <div style="background:#fff; border-radius:24px; max-width:560px; width:100%; max-height:80vh; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 24px 64px rgba(0,0,0,0.2);">
        <div style="padding:24px 28px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:36px;height:36px;background:#25d366;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;">${icon('whatsapp', 18)}</div>
            <div>
              <div style="font-size:16px; font-weight:800; color:var(--text-primary);">Toplu WhatsApp Mesajı</div>
              <div style="font-size:12px; color:var(--text-secondary); font-weight:600;">Kişileri seçin ve mesajı gönderin</div>
            </div>
          </div>
          <button id="wa-modal-close" style="background:var(--bg-secondary);border:none;border-radius:8px;width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);">${icon('x', 16)}</button>
        </div>
        <div style="padding:20px 28px; border-bottom:1px solid var(--border);">
          <label style="font-size:12px; font-weight:700; color:var(--text-secondary); margin-bottom:8px; display:block;">Mesaj Metni</label>
          <textarea id="wa-broadcast-text" rows="4" placeholder="Merhaba, bu hafta ders..." style="width:100%; padding:12px; border:1px solid var(--border); border-radius:12px; font-family:inherit; font-size:14px; font-weight:600; resize:vertical; outline:none; box-sizing:border-box;"></textarea>
          <div style="margin-top:8px; font-size:11px; color:var(--text-secondary); font-weight:600;" id="wa-char-count">0 karakter</div>
        </div>
        <div style="padding:16px 28px; border-bottom:1px solid var(--border);">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
            <label style="font-size:12px; font-weight:700; color:var(--text-secondary);">Alıcılar</label>
            <button id="wa-select-all" style="font-size:12px; font-weight:700; color:#25d366; background:none; border:none; cursor:pointer;">Tümünü Seç</button>
          </div>
          <div id="wa-recipient-list" style="max-height:200px; overflow-y:auto; display:flex; flex-direction:column; gap:6px;"></div>
        </div>
        <div style="padding:16px 28px; display:flex; gap:10px; justify-content:flex-end;">
          <button class="btn btn-secondary" id="wa-modal-cancel" style="font-weight:700; border-radius:10px;">İptal</button>
          <button class="btn hover-lift" id="wa-modal-send" style="background:linear-gradient(135deg,#25d366,#1ebe5d);color:#fff;border:none;padding:10px 24px;border-radius:10px;font-weight:700;display:flex;align-items:center;gap:8px;cursor:pointer;box-shadow:0 4px 12px rgba(37,211,102,0.3);">
            ${icon('send', 15)} Gönder
          </button>
        </div>
      </div>
    </div>
  `;

  return {
    html,
    init: (el, nav) => {
      let currentFilter = 'all';
      let searchQuery = '';

      function applyFilters() {
        const filtered = contacts.filter(c => {
          const matchType = currentFilter === 'all' || c.type === currentFilter;
          const q = searchQuery.toLowerCase();
          const matchSearch = !q
            || c.name.toLowerCase().includes(q)
            || (c.phone || '').includes(q)
            || (c.parentPhone || '').includes(q)
            || (c.grade || '').toLowerCase().includes(q);
          return matchType && matchSearch;
        });
        el.querySelector('#contacts-grid').innerHTML = renderContactCards(filtered);
        const info = el.querySelector('#contact-count-info');
        if (info) info.textContent = `${filtered.length} kişi listeleniyor`;
      }

      // Search
      el.querySelector('#contact-search')?.addEventListener('input', e => {
        searchQuery = e.target.value;
        applyFilters();
      });

      // Type filter tabs
      el.querySelectorAll('.contact-filter-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          el.querySelectorAll('.contact-filter-tab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentFilter = btn.dataset.filter;
          applyFilters();
        });
      });

      // WhatsApp Broadcast Modal
      const modal = el.querySelector('#wa-broadcast-modal');
      const recipientList = el.querySelector('#wa-recipient-list');
      const broadcastText = el.querySelector('#wa-broadcast-text');
      const charCount = el.querySelector('#wa-char-count');
      const selectAllBtn = el.querySelector('#wa-select-all');

      el.querySelector('#btn-group-broadcast')?.addEventListener('click', () => {
        // Build recipient list
        const phonedContacts = contacts.filter(c => c.phone || c.parentPhone);
        recipientList.innerHTML = phonedContacts.map(c => {
          const numbers = [];
          if (c.phone) numbers.push({ label: c.type === 'group' ? 'Grup' : 'Öğrenci', number: c.phone });
          if (c.parentPhone) numbers.push({ label: 'Veli', number: c.parentPhone });
          return numbers.map(n => `
            <label style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg-secondary);border-radius:10px;cursor:pointer;border:1px solid var(--border);transition:all 0.2s;" class="hover-lift">
              <input type="checkbox" class="wa-recv-check" value="${n.number}" checked style="width:16px;height:16px;accent-color:#25d366;cursor:pointer;">
              <div style="width:34px;height:34px;border-radius:8px;background:${getAvatarColor(c.name)};display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;flex-shrink:0;">${getInitials(c.name)}</div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:13px;font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(c.name)}</div>
                <div style="font-size:11px;font-weight:600;color:var(--text-secondary);">${n.label} • ${n.number}</div>
              </div>
              <span style="background:rgba(37,211,102,0.12);color:#25d366;border-radius:6px;padding:2px 8px;font-size:10px;font-weight:700;flex-shrink:0;">${icon('whatsapp', 10)}</span>
            </label>
          `).join('');
        }).join('');

        modal.style.display = 'flex';
        broadcastText.focus();
      });

      // Char counter
      broadcastText?.addEventListener('input', () => {
        charCount.textContent = `${broadcastText.value.length} karakter`;
      });

      // Select all
      selectAllBtn?.addEventListener('click', () => {
        const allChecked = [...el.querySelectorAll('.wa-recv-check')].every(c => c.checked);
        el.querySelectorAll('.wa-recv-check').forEach(c => c.checked = !allChecked);
        selectAllBtn.textContent = allChecked ? 'Tümünü Seç' : 'Tümünü Kaldır';
      });

      // Close modal
      [el.querySelector('#wa-modal-close'), el.querySelector('#wa-modal-cancel')].forEach(btn => {
        btn?.addEventListener('click', () => { modal.style.display = 'none'; });
      });
      modal?.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

      // Send
      el.querySelector('#wa-modal-send')?.addEventListener('click', () => {
        const message = broadcastText.value.trim();
        if (!message) { broadcastText.style.borderColor = '#ef4444'; broadcastText.focus(); return; }
        broadcastText.style.borderColor = '';

        const selected = [...el.querySelectorAll('.wa-recv-check:checked')].map(c => c.value);
        if (selected.length === 0) { alert('En az bir alıcı seçin.'); return; }

        const encodedMsg = encodeURIComponent(message);
        let opened = 0;
        selected.forEach((num, i) => {
          const clean = num.replace(/[^0-9]/g, '');
          if (!clean) return;
          setTimeout(() => {
            window.open(`https://wa.me/${clean}?text=${encodedMsg}`, '_blank');
          }, i * 400);
          opened++;
        });

        modal.style.display = 'none';
        broadcastText.value = '';
        if (charCount) charCount.textContent = '0 karakter';

        // Show toast confirmation
        const toast = document.createElement('div');
        toast.style.cssText = `position:fixed;bottom:28px;right:28px;background:#25d366;color:#fff;padding:14px 22px;border-radius:12px;font-size:14px;font-weight:700;box-shadow:0 8px 24px rgba(37,211,102,0.4);z-index:9999;display:flex;align-items:center;gap:8px;animation:slideInRight 0.3s ease;`;
        toast.innerHTML = `${icon('whatsapp', 16)} ${opened} kişiye mesaj penceresi açıldı`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
      });
    }
  };
}

function buildContacts(state) {
  const contacts = [];
  state.students.forEach(s => {
    contacts.push({
      id: s.id,
      name: s.name,
      grade: s.grade,
      role: `Öğrenci • ${s.grade}`,
      phone: s.phone,
      email: s.email,
      parentPhone: s.parentPhone,
      parentEmail: s.parentEmail,
      parentName: s.parentName,
      rate: s.rate,
      status: s.status || 'active',
      type: 'student',
    });
  });
  state.groups.forEach(g => {
    contacts.push({
      id: g.id,
      name: g.name,
      grade: g.grade,
      role: `Grup • ${g.grade}`,
      phone: g.phone,
      email: g.email,
      parentPhone: null,
      parentEmail: null,
      rate: g.rate,
      status: g.status || 'active',
      type: 'group',
    });
  });
  return contacts;
}

function renderContactCards(contacts) {
  if (!contacts.length) {
    return `<div style="color:var(--text-secondary); grid-column:1/-1; text-align:center; padding:48px; font-size:15px; font-weight:600;">Kişi bulunamadı</div>`;
  }

  return contacts.map(c => {
    const avatarColor = getAvatarColor(c.name);
    const initials = c.type === 'group' ? getGroupInitials(c.name) : getInitials(c.name);
    const isGroup = c.type === 'group';
    const isPassive = c.status === 'passive';

    const badgeColor = isGroup ? '#7c6aff' : '#25d366';
    const badgeBg = isGroup ? 'rgba(124,106,255,0.1)' : 'rgba(37,211,102,0.1)';
    const typeLabel = isGroup ? 'Grup' : 'Öğrenci';

    const waNumber = (c.phone || '').replace(/[^0-9]/g, '');
    const waParentNumber = (c.parentPhone || '').replace(/[^0-9]/g, '');

    return `
      <div class="card hover-lift" style="padding:24px; border-radius:20px; border:1px solid var(--border); box-shadow: var(--shadow-sm); transition:all 0.25s; position:relative; ${isPassive ? 'opacity:0.6;' : ''}">
        ${isPassive ? `<div style="position:absolute;top:14px;right:14px;background:rgba(239,68,68,0.1);color:#ef4444;border-radius:6px;padding:2px 8px;font-size:10px;font-weight:700;">Pasif</div>` : ''}

        <!-- Header Row -->
        <div style="display:flex; align-items:center; gap:14px; margin-bottom:18px;">
          <div style="width:54px; height:54px; border-radius:16px; background:${avatarColor}; display:flex; align-items:center; justify-content:center; color:#fff; font-size:18px; font-weight:800; flex-shrink:0; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            ${initials}
          </div>
          <div style="flex:1; min-width:0;">
            <div style="font-size:16px; font-weight:800; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escHtml(c.name)}</div>
            <div style="display:flex; align-items:center; gap:6px; margin-top:3px; flex-wrap:wrap;">
              <span style="font-size:11px; font-weight:700; color:var(--text-secondary);">${escHtml(c.grade || '')}</span>
              <span style="background:${badgeBg}; color:${badgeColor}; border-radius:6px; padding:2px 8px; font-size:10px; font-weight:700;">${typeLabel}</span>
              ${c.rate ? `<span style="background:rgba(16,185,129,0.08);color:var(--brand-green);border-radius:6px;padding:2px 8px;font-size:10px;font-weight:700;">${c.rate > 0 ? (c.rate >= 1000 ? Math.round(c.rate/100)/10 + 'K' : c.rate) + ' ₺/saat' : ''}</span>` : ''}
            </div>
          </div>
        </div>

        <!-- Contact rows -->
        <div style="display:flex; flex-direction:column; gap:10px;">

          <!-- Student/Group phone -->
          ${c.phone ? `
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:10px 14px; background:var(--bg-secondary); border-radius:12px; border:1px solid var(--border);">
              <div style="display:flex; align-items:center; gap:8px; min-width:0;">
                <span style="color:#25d366; flex-shrink:0;">${icon('phone', 14)}</span>
                <div style="min-width:0;">
                  <div style="font-size:11px; font-weight:600; color:var(--text-secondary);">${isGroup ? 'Grup Telefonu' : 'Öğrenci'}</div>
                  <div style="font-size:13px; font-weight:700; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escHtml(c.phone)}</div>
                </div>
              </div>
              <div style="display:flex; gap:6px; flex-shrink:0;">
                <a href="tel:${c.phone.replace(/[^0-9+]/g, '')}" style="background:rgba(99,102,241,0.1);color:#6366f1;border-radius:8px;padding:6px 10px;text-decoration:none;font-size:11px;font-weight:700;display:flex;align-items:center;gap:4px;transition:all 0.15s;" title="Ara">
                  ${icon('phone', 12)}
                </a>
                ${waNumber ? `
                  <a href="https://wa.me/${waNumber}" target="_blank" style="background:#25d366;color:#fff;border-radius:8px;padding:6px 10px;text-decoration:none;font-size:11px;font-weight:700;display:flex;align-items:center;gap:4px;transition:all 0.15s;box-shadow:0 2px 8px rgba(37,211,102,0.3);" title="WhatsApp">
                    ${icon('whatsapp', 12)} WA
                  </a>
                ` : ''}
              </div>
            </div>
          ` : ''}

          <!-- Student email -->
          ${c.email ? `
            <div style="display:flex; align-items:center; gap:8px; padding:10px 14px; background:var(--bg-secondary); border-radius:12px; border:1px solid var(--border);">
              <span style="color:#6366f1; flex-shrink:0;">${icon('mail', 14)}</span>
              <div style="flex:1; min-width:0;">
                <div style="font-size:11px; font-weight:600; color:var(--text-secondary);">E-posta</div>
                <a href="mailto:${escHtml(c.email)}" style="font-size:13px; font-weight:700; color:#6366f1; text-decoration:none; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block;">${escHtml(c.email)}</a>
              </div>
            </div>
          ` : ''}

          <!-- Parent phone -->
          ${c.parentPhone ? `
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:10px 14px; background:rgba(255,159,67,0.05); border-radius:12px; border:1px solid rgba(255,159,67,0.2);">
              <div style="display:flex; align-items:center; gap:8px; min-width:0;">
                <span style="color:#ff9f43; flex-shrink:0;">${icon('phone', 14)}</span>
                <div style="min-width:0;">
                  <div style="font-size:11px; font-weight:600; color:#ff9f43;">Veli${c.parentName ? ' — ' + escHtml(c.parentName) : ''}</div>
                  <div style="font-size:13px; font-weight:700; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escHtml(c.parentPhone)}</div>
                </div>
              </div>
              <div style="display:flex; gap:6px; flex-shrink:0;">
                <a href="tel:${c.parentPhone.replace(/[^0-9+]/g, '')}" style="background:rgba(255,159,67,0.1);color:#ff9f43;border-radius:8px;padding:6px 10px;text-decoration:none;font-size:11px;font-weight:700;display:flex;align-items:center;gap:4px;" title="Ara">
                  ${icon('phone', 12)}
                </a>
                ${waParentNumber ? `
                  <a href="https://wa.me/${waParentNumber}" target="_blank" style="background:#25d366;color:#fff;border-radius:8px;padding:6px 10px;text-decoration:none;font-size:11px;font-weight:700;display:flex;align-items:center;gap:4px;box-shadow:0 2px 8px rgba(37,211,102,0.3);" title="WhatsApp">
                    ${icon('whatsapp', 12)} WA
                  </a>
                ` : ''}
              </div>
            </div>
          ` : ''}

          <!-- Parent email -->
          ${c.parentEmail ? `
            <div style="display:flex; align-items:center; gap:8px; padding:10px 14px; background:rgba(255,159,67,0.05); border-radius:12px; border:1px solid rgba(255,159,67,0.2);">
              <span style="color:#ff9f43; flex-shrink:0;">${icon('mail', 14)}</span>
              <div style="flex:1; min-width:0;">
                <div style="font-size:11px; font-weight:600; color:#ff9f43;">Veli E-posta</div>
                <a href="mailto:${escHtml(c.parentEmail)}" style="font-size:13px; font-weight:700; color:#ff9f43; text-decoration:none; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block;">${escHtml(c.parentEmail)}</a>
              </div>
            </div>
          ` : ''}

          <!-- No contact info placeholder -->
          ${!c.phone && !c.email && !c.parentPhone && !c.parentEmail ? `
            <div style="padding:14px; text-align:center; color:var(--text-secondary); font-size:12px; font-weight:600; background:var(--bg-secondary); border-radius:12px; border:1px dashed var(--border);">
              ${icon('alertCircle', 14)} İletişim bilgisi girilmemiş
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}
