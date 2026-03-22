// ═══════════════════════════════════════════════════
// MODAL SYSTEM
// ═══════════════════════════════════════════════════

let _currentModal = null;

export function openModal({ title, body, size = '', footer = '', onClose }) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  closeModal();

  const modalId = 'modal_' + Date.now();
  const html = `
    <div class="modal-overlay" id="${modalId}-overlay">
      <div class="modal ${size === 'lg' ? 'modal-lg' : size === 'xl' ? 'modal-xl' : ''}">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="close-btn" id="${modalId}-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    </div>
  `;

  container.innerHTML = html;
  _currentModal = { id: modalId, onClose };

  const overlay = document.getElementById(`${modalId}-overlay`);
  const closeBtn = document.getElementById(`${modalId}-close`);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  closeBtn.addEventListener('click', closeModal);

  document.addEventListener('keydown', _escHandler);
}

function _escHandler(e) {
  if (e.key === 'Escape') closeModal();
}

export function closeModal() {
  const container = document.getElementById('modal-container');
  if (!container) return;
  if (_currentModal?.onClose) _currentModal.onClose();
  container.innerHTML = '';
  _currentModal = null;
  document.removeEventListener('keydown', _escHandler);
}

export function getModalBody() {
  return document.querySelector('.modal-body');
}

export function showConfirm({ title, message, confirmText = 'Onayla', cancelText = 'İptal', onConfirm, onCancel, type = 'primary' }) {
  const btnClass = type === 'danger' ? 'btn-danger' : 'btn-primary';
  openModal({
    title,
    body: `<p style="color:var(--text-secondary);line-height:1.6;">${message}</p>`,
    footer: `
      <button class="btn btn-secondary" id="confirm-cancel">${cancelText}</button>
      <button class="btn ${btnClass}" id="confirm-ok">${confirmText}</button>
    `,
    onClose: onCancel,
  });

  document.getElementById('confirm-cancel')?.addEventListener('click', () => {
    closeModal();
    if (onCancel) onCancel();
  });
  document.getElementById('confirm-ok')?.addEventListener('click', () => {
    closeModal();
    if (onConfirm) onConfirm();
  });
}

export function showAlert({ title = 'Uyarı', message, buttonText = 'Tamam', onClose }) {
  openModal({
    title,
    size: 'sm',
    body: `<p style="color:var(--text-secondary);line-height:1.6;padding: 10px 0;">${message}</p>`,
    footer: `<button class="btn btn-primary" id="alert-ok">${buttonText}</button>`,
    onClose,
  });

  document.getElementById('alert-ok')?.addEventListener('click', () => {
    closeModal();
    if (onClose) onClose();
  });
}

