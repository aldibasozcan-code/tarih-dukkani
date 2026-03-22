// ═════════════════════════════════════════════════
// CHAT PAGE - Contacts & WhatsApp
// ═════════════════════════════════════════════════
import { getState } from '../store/store.js';
import { icon } from '../components/icons.js';
import { escHtml, getAvatarColor, getInitials } from '../utils/helpers.js';

export function renderChat(navigate) {
  const state = getState();
  const contacts = buildContacts(state);

  const html = `
    <div class="fade-in">
      <div class="page-header">
        <div>
          <h2>Mesajlar & İletişim</h2>
          <p>Öğrenci ve veli iletişim bilgileri</p>
        </div>
      </div>

      <div class="search-box" style="margin-bottom:16px;">
        <span class="search-icon">${icon('search', 15)}</span>
        <input type="text" id="contact-search" placeholder="Kişi ara..." style="width:280px;">
      </div>

      <div class="grid grid-2" id="contacts-grid">
        ${renderContactCards(contacts)}
      </div>

      ${contacts.length === 0 ? `<div class="empty-state">${icon('chat', 40)}<h3>Henüz iletişim bilgisi yok</h3><p>Öğrenci ekleyerek iletişim bilgilerini buraya ekleyin</p></div>` : ''}
    </div>
  `;

  return {
    html,
    init: (el, nav) => {
      el.querySelector('#contact-search')?.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        const filtered = contacts.filter(c =>
          c.name.toLowerCase().includes(q) || c.phone?.includes(q)
        );
        el.querySelector('#contacts-grid').innerHTML = renderContactCards(filtered);
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
      role: `Öğrenci • ${s.grade}`,
      phone: s.phone,
      email: s.email,
      parentPhone: s.parentPhone,
      parentEmail: s.parentEmail,
      type: 'student',
    });
  });
  return contacts;
}

function renderContactCards(contacts) {
  if (!contacts.length) return '<div style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:40px;">Kişi bulunamadı</div>';
  return contacts.map(c => `
    <div class="card">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
        <div class="person-avatar" style="background:${getAvatarColor(c.name)};width:50px;height:50px;border-radius:12px;">
          ${getInitials(c.name)}
        </div>
        <div style="flex:1;">
          <div style="font-size:15px;font-weight:700;">${escHtml(c.name)}</div>
          <div style="font-size:12px;color:var(--text-muted);">${c.role}</div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:8px;">
        ${c.phone ? `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div style="display:flex;align-items:center;gap:8px;font-size:13px;">
              <span style="color:var(--text-muted);">${icon('phone', 13)}</span>
              <span>${escHtml(c.phone)}</span>
              <span class="badge badge-muted" style="font-size:10px;">Öğrenci</span>
            </div>
            <a href="https://wa.me/${c.phone.replace(/[^0-9]/g, '')}" target="_blank" class="whatsapp-btn">
              ${icon('whatsapp', 13)} WA
            </a>
          </div>
        ` : ''}
        ${c.email ? `
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;">
            <span style="color:var(--text-muted);">${icon('mail', 13)}</span>
            <a href="mailto:${escHtml(c.email)}" style="color:var(--accent);text-decoration:none;">${escHtml(c.email)}</a>
          </div>
        ` : ''}
        ${c.parentPhone ? `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div style="display:flex;align-items:center;gap:8px;font-size:13px;">
              <span style="color:var(--text-muted);">${icon('phone', 13)}</span>
              <span>${escHtml(c.parentPhone)}</span>
              <span class="badge badge-warning" style="font-size:10px;">Veli</span>
            </div>
            <a href="https://wa.me/${c.parentPhone.replace(/[^0-9]/g, '')}" target="_blank" class="whatsapp-btn">
              ${icon('whatsapp', 13)} WA
            </a>
          </div>
        ` : ''}
        ${c.parentEmail ? `
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;">
            <span style="color:var(--text-muted);">${icon('mail', 13)}</span>
            <a href="mailto:${escHtml(c.parentEmail)}" style="color:var(--accent);text-decoration:none;">${escHtml(c.parentEmail)}</a>
            <span class="badge badge-warning" style="font-size:10px;">Veli</span>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}
