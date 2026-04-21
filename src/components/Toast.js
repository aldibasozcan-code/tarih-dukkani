import { icon } from './icons.js';

let container = null;

function createContainer() {
  container = document.createElement('div');
  container.id = 'toast-container';
  document.body.appendChild(container);
  return container;
}

export function showToast({ title, message, type = 'info', duration = 5000 }) {
  if (!container) createContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconName = 'bell';
  if (type === 'success') iconName = 'checkCircle';
  if (type === 'warning') iconName = 'alertCircle';
  if (type === 'danger') iconName = 'alertCircle';

  toast.innerHTML = `
    <div class="kpi-icon" style="width:36px;height:36px;background:none;color:inherit;margin-right:0;">
      ${icon(iconName, 20)}
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <div class="toast-close">
      ${icon('x', 14)}
    </div>
    <div class="toast-progress">
      <div class="toast-progress-bar"></div>
    </div>
  `;

  container.appendChild(toast);

  const closeBtn = toast.querySelector('.toast-close');
  const progressBar = toast.querySelector('.toast-progress-bar');

  let start = null;
  let animationFrame;

  function animate(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration * 100, 100);
    progressBar.style.width = `${progress}%`;
    
    if (progress < 100) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      hide();
    }
  }

  function hide() {
    toast.classList.add('hiding');
    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
        container = null;
      }
    }, 400);
  }

  animationFrame = requestAnimationFrame(animate);

  closeBtn.addEventListener('click', () => {
    cancelAnimationFrame(animationFrame);
    hide();
  });
}
