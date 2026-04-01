import { icon } from '../components/icons.js';
import { openModal } from '../components/modal.js';

export function sharePost(title, id) {
  const url = `${window.location.origin}/#post-detail:${id}`;
  const text = encodeURIComponent(`${title} - bitika.app`);

  if (navigator.share) {
    navigator.share({
      title: title,
      text: `${title} - bitika.app`,
      url: url,
    }).catch(() => showShareModal(title, url, text));
  } else {
    showShareModal(title, url, text);
  }
}

function showShareModal(title, url, text) {
  openModal({
    title: 'Yazıyı Paylaş',
    body: `
      <div style="text-align:center; padding:20px 0;">
        <p style="color:var(--text-secondary); margin-bottom:24px; font-size:15px;">"${title}" yazısını sevdiklerinizle paylaşın.</p>
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:16px;">
          <a href="https://wa.me/?text=${text}%20${url}" target="_blank" style="text-decoration:none; display:flex; align-items:center; justify-content:center; gap:10px; background:#25D366; color:white; padding:14px; border-radius:12px; font-weight:700; font-size:14px; transition:opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
            ${icon('whatsapp', 18)} WhatsApp
          </a>
          <a href="https://t.me/share/url?url=${url}&text=${text}" target="_blank" style="text-decoration:none; display:flex; align-items:center; justify-content:center; gap:10px; background:#0088cc; color:white; padding:14px; border-radius:12px; font-weight:700; font-size:14px; transition:opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
            ${icon('telegram', 18)} Telegram
          </a>
          <a href="https://x.com/intent/post?text=${text}&url=${url}" target="_blank" style="text-decoration:none; display:flex; align-items:center; justify-content:center; gap:10px; background:#000; color:white; padding:14px; border-radius:12px; font-weight:700; font-size:14px; transition:opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
            ${icon('xSocial', 18)} X (Twitter)
          </a>
          <button id="copy-link-btn" style="border:1px solid var(--border); background:white; color:var(--text-primary); display:flex; align-items:center; justify-content:center; gap:10px; padding:14px; border-radius:12px; font-weight:700; font-size:14px; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='white'">
            ${icon('copy', 18)} Bağlantı
          </button>
        </div>
      </div>
    `,
    onInit: (modalEl) => {
      const copyBtn = modalEl.querySelector('#copy-link-btn');
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(decodeURIComponent(url));
        const originalHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = `${icon('check', 18)} Kopyalandı!`;
        copyBtn.style.borderColor = 'var(--brand-green)';
        copyBtn.style.color = 'var(--brand-green)';
        setTimeout(() => {
          copyBtn.innerHTML = originalHtml;
          copyBtn.style.borderColor = 'var(--border)';
          copyBtn.style.color = 'var(--text-primary)';
        }, 2000);
      };
    }
  });
}
