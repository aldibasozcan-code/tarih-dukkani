import { icon } from './icons.js';

export function renderPublicLayout(currentPage, navigate) {
  return `
    <div class="public-container">
      <nav class="public-nav">
        <div class="nav-links">
          <a href="#" class="nav-logo" data-nav="home" style="text-decoration:none; display:flex; align-items:center; gap:10px;">
            <div style="background:var(--brand-green); color:white; width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:18px;">B</div>
            <span style="font-weight:800; font-size:22px; color:var(--brand-green); letter-spacing:-1px;">bitika.app</span>
          </a>
          <div style="width:1px; height:24px; background:var(--border); margin:0 10px;"></div>
          <a href="#home" class="nav-link ${currentPage === 'home' ? 'active' : ''}" data-nav="home">Anasayfa</a>
          <a href="#forum" class="nav-link ${currentPage === 'forum' ? 'active' : ''}" data-nav="forum">Öğretmen Forumu</a>
          <a href="#blog" class="nav-link ${currentPage === 'blog' ? 'active' : ''}" data-nav="blog">Eğitim Bloğu</a>
        </div>
        
        <div class="nav-actions">
          <button class="btn btn-primary btn-lg" data-nav="dashboard" style="border-radius:100px; padding:12px 28px;">
            Bitika.app'e Giriş ${icon('chevronRight', 16)}
          </button>
        </div>
      </nav>

      <main id="public-content">
        <!-- Page content will be injected here -->
      </main>

      <!-- Global AdSense Banner Area (1 Adet) -->
      <aside style="display:flex; justify-content:center; align-items:center; width:100%; padding:40px 5%; background:var(--bg-secondary); border-top:1px solid var(--border);">
         <div style="width:100%; max-width:970px; min-height:90px; text-align:center;">
           <ins class="adsbygoogle"
                style="display:block; min-width:320px; max-width:970px; width:100%; height:90px;"
                data-ad-client="ca-pub-6399628596078526"
                data-ad-slot=""
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
           <script>
                (adsbygoogle = window.adsbygoogle || []).push({});
           </script>
         </div>
      </aside>

      <footer class="public-footer">
        <div class="footer-grid">
          <div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:24px;">
              <div style="background:white; color:var(--brand-green); width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:800;">B</div>
              <span style="font-weight:800; font-size:20px;">bitika.app</span>
            </div>
            <p style="color:rgba(255,255,255,0.6); line-height:1.6; font-size:14px;">
              Öğretmenlerin ve öğrencilerin buluşma noktası. LGS, YKS ve Lise eğitimi için profesyonel materyal ve ders yönetim platformu.
            </p>
          </div>
          <div>
            <h4 style="margin-bottom:20px; font-weight:700;">Platform</h4>
            <a href="#" class="footer-link" data-nav="home">Anasayfa</a>
            <a href="#" class="footer-link" data-nav="forum">Forum</a>
            <a href="#" class="footer-link" data-nav="blog">Blog</a>
          </div>
          <div>
            <h4 style="margin-bottom:20px; font-weight:700;">Öğretmenler</h4>
            <a href="#" class="footer-link" data-nav="dashboard">Ders Yönetimi</a>
            <a href="#" class="footer-link" data-nav="dashboard">Öğrenci Takibi</a>
            <a href="#" class="footer-link" data-nav="dashboard">Materyal Paylaşımı</a>
          </div>
          <div>
            <h4 style="margin-bottom:20px; font-weight:700;">Bizi Takip Edin</h4>
            <div style="display:flex; gap:12px;">
              <a href="https://x.com" target="_blank" class="social-icon-circle">${icon('xSocial', 18)}</a>
              <a href="https://instagram.com" target="_blank" class="social-icon-circle">${icon('instagram', 18)}</a>
              <a href="https://telegram.me" target="_blank" class="social-icon-circle">${icon('telegram', 18)}</a>
              <a href="https://youtube.com" target="_blank" class="social-icon-circle">${icon('youtube', 18)}</a>
            </div>
            <div style="margin-top:24px;">
              <div style="color:rgba(255,255,255,0.5); font-size:12px; margin-bottom:4px; text-transform:uppercase; letter-spacing:1px; font-weight:700;">Destek</div>
              <div style="color:white; font-size:14px; font-weight:600;">destek@bitika.app</div>
            </div>
          </div>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:40px; display:flex; justify-content:space-between; align-items:center; font-size:13px; color:rgba(255,255,255,0.4);">
          <div>© 2026 bitika.app. Tüm hakları saklıdır.</div>
          <div style="display:flex; gap:24px;">
            <a href="/terms.html" style="color:inherit; text-decoration:none;">Kullanım Koşulları</a>
            <a href="/privacy.html" style="color:inherit; text-decoration:none;">Gizlilik Politikası</a>
          </div>
        </div>
      </footer>
    </div>
  `;
}
