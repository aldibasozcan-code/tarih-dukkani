import { icon } from '../../components/icons.js';
import { getState, nextTourStep, skipTour, completeTour, startTour } from '../../store/store.js';
import { openModal, closeModal } from '../../components/modal.js';

const tourSteps = [
  {
    page: 'dashboard',
    title: 'Komuta Merkeziniz! 📊',
    content: 'Bitika\'e hoş geldiniz! **Panel**, günlük akışınızı yönettiğiniz yerdir. Üstteki kartlardan aylık kazancınızı ve ders istatistiklerinizi anlık olarak takip edebilirsiniz.',
    tip: 'KPI kartlarına tıklayarak detaylı finansal raporlarınıza hızlıca göz atabilirsiniz.',
    buttonText: 'Kursları Keşfet',
    nextPage: 'courses'
  },
  {
    page: 'courses',
    title: 'Dijital Müfredat Sistemi 📚',
    content: 'Seçtiğiniz branşlara göre **MEB müfredatı** buraya otomatik yüklendi. Ünitelere tıklayarak alt konuları görebilir, her konunun yanına **kendi ders notlarınızı veya slaytlarınızı** ekleyerek dijital arşivinizi oluşturabilirsiniz.',
    tip: 'Müfredat verilerini Ayarlar sayfasından dilediğiniz zaman sıfırlayabilir veya branş değişikliği yapabilirsiniz.',
    buttonText: 'Öğrencilere Bak',
    nextPage: 'students'
  },
  {
    page: 'students',
    title: 'Öğrenci Yönetimi 👥',
    content: 'Bireysel öğrencilerinizi buradan ekleyin. Her birinin profilinde **müfredat ilerlemesini yüzde olarak** görebilir, ders bazlı özel notlar alabilirsiniz. Telefon ikonuna basarak veli iletişimine hızlıca geçebilirsiniz.',
    tip: 'Öğrenci profilindeki dersleri tamamladıkça ilerleme çubuğu otomatik olarak güncellenir.',
    buttonText: 'Gruplara Geç',
    nextPage: 'groups'
  },
  {
    page: 'groups',
    title: 'Çalışma Grupları 🏫',
    content: 'Birden fazla öğrenciyle yaptığınız dersleri gruplar altında toplayın. Grup sayfasından **tüm katılımcıların durumunu** ortak yönetebilir, grup bazlı özel saatlik ücretler belirleyebilirsiniz.',
    tip: 'Grup bazlı bir dersi "Tamamlandı" olarak işaretlediğinizde, tüm öğrencilerin muhasebe kaydı aynı anda oluşur.',
    buttonText: 'Takvimi Gör',
    nextPage: 'calendar'
  },
  {
    page: 'calendar',
    title: 'İnteraktif Haftalık Takvim 📅',
    content: 'Tüm programınızı **sürükle-bırak** ile buradan yönetin. Derslerin saatlerini değiştirmek için kartı tutup yeni saatine sürüklemeniz yeterli. Tamamlanan dersler yeşil, onay bekleyenler turuncu vurgulanır.',
    tip: 'Ayarlar\'dan Google Takvim ID\'nizi girerek kendi Google takviminizi de bu sayfa içinde görüntüleyebilirsiniz.',
    buttonText: 'Muhasebe\'ye Git',
    nextPage: 'finance'
  },
  {
    page: 'finance',
    title: 'Akıllı Muhasebe 💰',
    content: 'Derslerden elde ettiğiniz kazançlar burada toplanır. Bir ödemeyi aldığınızda **"Tahsil Edildi"** onayı vererek, gelirinizin "Kesin Kazanç" olarak raporlanmasını sağlayabilirsiniz.',
    tip: 'Tahsil edilmemiş dersler "Tahmini Kazanç" olarak görünür, böylece alacaklarınızı asla unutmazsınız.',
    buttonText: 'Ayarları Özelleştir',
    nextPage: 'settings'
  },
  {
    page: 'settings',
    title: 'Kişiselleştirme & Ayarlar ⚙️',
    content: 'Uygulama ismini, logoyu, branşlarınızı ve **uygulama ana rengini** buradan dilediğiniz gibi değiştirin. Tüm değişiklikler anında sidebar ve dashboard\'a yansıyacaktır.',
    tip: 'Tebrikler! Artık tüm temel özellikleri biliyorsunuz. Rehbere her an buradan tekrar ulaşabilirsiniz.',
    buttonText: 'Rehberi Bitir',
    nextPage: null
  }
];

export function injectTour(currentPage, navigate) {
  const state = getState();
  const { tourActive, tourStep } = state.profile;

  if (!tourActive) return;

  const stepIndex = tourStep || 0;
  const currentTourStep = tourSteps[stepIndex];

  if (currentTourStep.page !== currentPage) return;

  renderTourBox(currentTourStep, navigate);
}

function renderTourBox(step, navigate) {
  document.getElementById('tour-guide-box')?.remove();

  const box = document.createElement('div');
  box.id = 'tour-guide-box';
  box.className = 'card fade-in';
  box.style = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 380px;
    z-index: 9999;
    box-shadow: 0 12px 50px rgba(0,0,0,0.3);
    border: 2px solid var(--accent);
    padding: 24px;
    background: var(--bg-card);
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: slideUp 0.4s ease-out;
  `;

  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
      <h3 style="margin:0; font-size:19px; color:var(--text-primary); font-weight:800;">${step.title}</h3>
      <button class="btn btn-ghost btn-sm" id="tour-close-x" style="padding:4px; opacity:0.6 hover:opacity:1;">${icon('close', 18)}</button>
    </div>
    
    <div style="font-size:15px; color:var(--text-secondary); line-height:1.7;">
      ${step.content.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary); font-weight:700;">$1</strong>')}
    </div>

    ${step.tip ? `
      <div style="background:var(--accent-glow); border-radius:12px; padding:12px 16px; border-left:4px solid var(--accent); display:flex; gap:12px; align-items:start;">
        <div style="color:var(--accent); margin-top:2px;">${icon('star', 16)}</div>
        <div style="font-size:13px; color:var(--text-primary); line-height:1.5;">
          <strong style="display:block; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; opacity:0.8;">Biliyor muydunuz?</strong>
          ${step.tip}
        </div>
      </div>
    ` : ''}

    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
      <button class="btn btn-ghost btn-sm" id="tour-skip-btn" style="color:var(--text-muted); padding:0; font-size:13px;">Rehberi Atla</button>
      <button class="btn btn-primary" id="tour-next-btn" style="padding: 10px 20px; font-weight:700;">
        ${step.buttonText} ${icon('chevronRight', 16)}
      </button>
    </div>
    
    <div style="display:flex; gap:6px; margin-top:8px;">
      ${tourSteps.map((_, i) => `
        <div style="flex:1; height:4px; border-radius:4px; background:${i <= tourSteps.indexOf(step) ? 'var(--accent)' : 'var(--border)'}; transition: background 0.3s ease;"></div>
      `).join('')}
    </div>

    <style>
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    </style>
  `;

  document.body.appendChild(box);

  // Events
  box.querySelector('#tour-next-btn').onclick = () => {
    if (step.nextPage) {
      nextTourStep();
      navigate(step.nextPage);
    } else {
      completeTour();
      box.remove();
    }
  };

  box.querySelector('#tour-skip-btn').onclick = handleSkip;
  box.querySelector('#tour-close-x').onclick = handleSkip;
}

function handleSkip() {
  openModal({
    title: 'Rehberi Atlıyorsunuz',
    body: `
      <div style="text-align:center; padding: 20px 0;">
        <div style="color:var(--warning); margin-bottom:16px;">${icon('alertCircle', 48)}</div>
        <p style="font-size:16px; color:var(--text-primary); line-height:1.6;">Tanıtım rehberini şu an sonlandırmak istediğinize emin misiniz?</p>
        <div class="alert alert-info" style="margin-top:20px; text-align:left;">
          <strong>Unutmayın:</strong> Bu rehbere her zaman <strong>Ayarlar</strong> sayfasındaki "Rehberi Tekrar Başlat" butonu ile ulaşabilirsiniz.
        </div>
      </div>
    `,
    footer: `
      <button class="btn btn-secondary" onclick="closeModal()">Vazgeç</button>
      <button class="btn btn-primary" id="btn-confirm-skip" style="background:var(--danger); border-color:var(--danger);">Rehberi Kapat</button>
    `,
    size: 'sm'
  });

  document.getElementById('btn-confirm-skip').onclick = () => {
    skipTour();
    closeModal();
    document.getElementById('tour-guide-box')?.remove();
  };
}

export function restartTour(navigate) {
  startTour();
  navigate('dashboard');
}
