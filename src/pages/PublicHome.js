import { icon } from '../components/icons.js';

export function renderPublicHome(navigate) {
  const html = `
    <div class="fade-in">
      <!-- Hero Section -->
      <section class="hero-section">
        <h1 class="hero-title">Türkiye'nin En Profesyonel Eğitim Materyal Paylaşım Platformu</h1>
        <p class="hero-subtitle">Burası 8. Sınıftan Mezun (YKS) hazırlık öğrencilerine kadar her öğrenci için profesyonel öğretmenler tarafından geliştirilmiş içeriklerle dolu bir eğitim üssüdür.</p>
        
        <div style="display:flex; justify-content:center; gap:20px; align-items:center;">
          <button class="btn btn-primary btn-lg" data-nav="forum" style="border-radius:100px; padding:16px 40px; font-size:16px; font-weight:800;">
            Materyalleri Keşfet ${icon('courses', 18)}
          </button>
          <button class="btn btn-secondary btn-lg" data-nav="blog" style="border-radius:100px; padding:16px 40px; font-size:16px; font-weight:800;">
            Eğitim Bloğu ${icon('bookOpen', 18)}
          </button>
        </div>
        
        <div style="margin-top:60px; display:flex; justify-content:center; gap:48px; opacity:0.6; filter:grayscale(100);">
           <div style="display:flex; align-items:center; gap:8px; font-weight:700;">LGS 2026</div>
           <div style="display:flex; align-items:center; gap:8px; font-weight:700;">TYT & AYT</div>
           <div style="display:flex; align-items:center; gap:8px; font-weight:700;">MEB MÜFREDATI</div>
        </div>
      </section>

      <!-- Bento Grid -->
      <section class="bento-grid">
        <!-- LGS (8. Sınıf) -->
        <div class="bento-item large" style="background:#004526;" data-nav="forum">
          <div class="bento-overlay"></div>
          <div class="bento-content">
            <span class="badge badge-warning" style="margin-bottom:12px;">8. SINIF | LGS 2026</span>
            <h3>LGS Hazırlık Merkezi</h3>
            <p>Yeni nesil sorular, konu tarama testleri ve LGS sınavına yönelik öğretmenler tarafından hazırlanmış güncel materyaller burada.</p>
            <div style="margin-top:20px; display:flex; gap:12px;">
              <span style="font-size:13px; font-weight:700; background:rgba(255,255,255,0.1); padding:4px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.2);">Matematik</span>
              <span style="font-size:13px; font-weight:700; background:rgba(255,255,255,0.1); padding:4px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.2);">Fen Bilimleri</span>
              <span style="font-size:13px; font-weight:700; background:rgba(255,255,255,0.1); padding:4px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.2);">Sosyal Bilgiler</span>
            </div>
          </div>
        </div>

        <!-- Forum Highlight -->
        <div class="bento-item medium" style="background:#059669;" data-nav="forum">
          <div class="bento-overlay"></div>
          <div class="bento-content">
            <span class="badge badge-info" style="margin-bottom:12px;">FORUM</span>
            <h3>Öğretmen Paylaşım Forumu</h3>
            <p>Ders materyallerinizi paylaşın, meslektaşlarınızla fikir alışverişinde bulunun ve en güncel notlara ulaşın.</p>
            <button class="btn btn-primary" data-nav="forum" style="margin-top:20px; width:100%; justify-content:center;">Her Şeye Göz At</button>
          </div>
        </div>

        <!-- TYT (9-12. Sınıf) -->
        <div class="bento-item medium" style="background:#1e293b;" data-nav="forum">
          <div class="bento-overlay"></div>
          <div class="bento-content">
            <span class="badge badge-purple" style="margin-bottom:12px;">9-12. SINIF</span>
            <h3>Lise Eğitimi & TYT</h3>
            <p>Dokuzuncudan on ikinci sınıfa kadar her seviye için müfredata uyumlu, profesyonel ders kütüphanesi.</p>
          </div>
        </div>

        <!-- AYT (Mezun) -->
        <div class="bento-item large" style="background:var(--brand-green-light);" data-nav="forum">
          <div class="bento-overlay"></div>
          <div class="bento-content">
            <span class="badge badge-success" style="margin-bottom:12px;">AYT - MEZUN SİSTEMİ</span>
            <h3>AYT ve Mezun Hazırlık</h3>
            <p>Derinlikli konu anlatımları, soru bankaları ve deneme sınavlarıyla üniversite yolculuğunda yanındayız. Kamu, Özel ve Freelancer öğretmenlerin gücüyle oluşturulan arşivimizi keşfedin.</p>
          </div>
        </div>

        <!-- Blog Section -->
        <div class="bento-item wide" style="background:#f1f5f9; color:var(--text-primary); border:1px solid var(--border);" data-nav="blog">
          <div style="padding:40px; display:flex; align-items:center; justify-content:space-between; gap:32px;">
            <div style="flex:1;">
               <span class="badge badge-info" style="margin-bottom:12px;">BLOG</span>
               <h3 style="color:var(--brand-green); font-size:32px; font-weight:800; margin-bottom:12px;">Eğitimde Yeni Yaklaşımlar</h3>
               <p style="color:var(--text-secondary); font-size:18px;">Öğretmenler arası deneyim paylaşımı, yeni nesil pedagoji ve eğitimdeki son gelişmeleri paylaştığımız blog sayfamızı ziyaret edin.</p>
            </div>
            <button class="btn btn-primary btn-lg" data-nav="blog" style="border-radius:100px;">Blogu Keşfet ${icon('chevronRight', 16)}</button>
          </div>
        </div>
      </section>

      <!-- Legal Footer for Google Verification -->
      <footer style="padding:40px 5%; background:var(--bg-card); text-align:center; border-top:1px solid var(--border);">
        <p style="color:var(--text-muted); font-size:13px; margin-bottom:12px;">© ${new Date().getFullYear()} bitika.app. Eğitim ve materyal paylaşım platformu.</p>
        <div style="display:flex; justify-content:center; gap:32px;">
          <a href="/privacy.html" style="color:var(--brand-green); text-decoration:none; font-weight:700; font-size:14px;">Gizlilik Politikası</a>
          <a href="/terms.html" style="color:var(--brand-green); text-decoration:none; font-weight:700; font-size:14px;">Kullanım Şartları</a>
        </div>
      </footer>
    </div>
  `;

  return { 
    html, 
    init: (el) => {
      el.querySelectorAll('[data-nav]').forEach(btn => {
        btn.onclick = () => {
          const nav = btn.dataset.nav;
          navigate(nav);
        }
      });
    } 
  };
}
