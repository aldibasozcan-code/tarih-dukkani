import { icon } from '../components/icons.js';
import { getPostById } from '../store/publicData.js';

export async function renderPublicPostDetail(postId, navigate) {
  const post = await getPostById(postId);

  if (!post) {
    return {
      html: `
        <div style="padding:150px 5%; text-align:center;">
          <div style="color:var(--brand-green-soft); margin-bottom:24px;">${icon('info', 64)}</div>
          <h2 style="font-size:32px; font-weight:800; color:var(--text-primary);">Yazı Bulunamadı</h2>
          <p style="color:var(--text-secondary); margin-bottom:40px;">Aradığınız içerik kaldırılmış veya taşınmış olabilir.</p>
          <button class="btn btn-primary" onclick="window.location.hash='blog'">Blog'a Dön</button>
        </div>
      `
    };
  }

  const dateStr = new Date(post.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  const html = `
    <div class="fade-in post-detail-page">
      <div class="post-hero" style="background:linear-gradient(to bottom, #004526 0%, #002514 100%); color:white; padding:200px 5% 150px; position:relative; overflow:hidden;">
        <!-- Premium Decorations -->
        <div class="blur-orb" style="top:-150px; right:-100px; width:500px; height:500px; background:rgba(5, 150, 105, 0.3);"></div>
        <div class="blur-orb" style="bottom:-100px; left:5%; width:400px; height:400px; background:rgba(0, 69, 38, 0.6); animation-delay: -7s;"></div>

        <div style="max-width:1000px; margin:0 auto; position:relative; z-index:2;">
           <button class="btn-back" style="background:rgba(255,255,255,0.08); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.15); color:white; padding:10px 24px; border-radius:100px; font-weight:800; font-size:13px; display:flex; align-items:center; gap:10px; margin-bottom:48px; cursor:pointer; transition:var(--transition);" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'" onclick="window.history.back()">
              ${icon('chevronRight', 18, { style: 'transform:rotate(180deg)' })} Geri Dön
           </button>
           
           <div style="display:flex; align-items:center; gap:16px; margin-bottom:32px;">
              <span style="background:var(--brand-green-light); color:white; padding:8px 20px; border-radius:100px; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; border:1px solid rgba(255,255,255,0.2);">${post.category}</span>
              <span style="color:rgba(255,255,255,0.5); font-size:14px; font-weight:600;">${dateStr}</span>
           </div>
 
           <h1 style="font-size: clamp(36px, 6vw, 64px); font-weight:900; line-height:1.1; margin-bottom:40px; letter-spacing:-2px; color:#ffffff;">${post.title}</h1>
           
           <div style="display:flex; align-items:center; gap:20px;">
              <div style="width:64px; height:64px; background:linear-gradient(135deg, white, var(--brand-green-soft)); color:var(--brand-green); border-radius:20px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:24px; box-shadow: 0 10px 20px rgba(0,0,0,0.2);">${post.authorName ? post.authorName[0] : 'Ö'}</div>
              <div>
                <div style="font-weight:900; font-size:20px; color:#ffffff;">${post.authorName || 'Öğretmen'}</div>
                <div style="color:rgba(255,255,255,0.6); font-size:14px; font-weight:600; text-transform:uppercase; letter-spacing:1px;">${post.type === 'blog' ? 'Eğitim Yazarı' : 'Eğitmen'}</div>
              </div>
           </div>
        </div>
      </div>

      <div class="post-body-container" style="max-width:1000px; margin:-80px auto 100px; padding:0 32px; position:relative; z-index:3;">
        <div class="premium-card fade-in-up" style="background:#ffffff; padding:80px; box-shadow:0 50px 100px -20px rgba(0,0,0,0.15);">
           <div class="post-content-rich" style="font-size:20px; line-height:1.8; color:var(--text-primary); font-weight:400;">
              ${(post.content || '').split('\n').map(p => p.trim() ? `<p style="margin-bottom:32px; text-align: justify; letter-spacing:0.1px;">${p}</p>` : '').join('') || '<p style="color:var(--text-muted); font-style:italic;">Bu yazı henüz içerik barındırmıyor.</p>'}
           </div>
 
          <div style="margin-top:80px; padding:48px; border-radius:32px; background:var(--bg-secondary); border:1px solid var(--border); text-align:center;">
            <h4 style="font-size:22px; font-weight:900; color:var(--brand-green); margin-bottom:24px; letter-spacing:-0.5px;">Bu Akademik İçeriği Paylaşın</h4>
            <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
              <button class="btn-share-action" data-type="whatsapp" style="min-width:140px; display:flex; align-items:center; justify-content:center; gap:10px; background:#25D366; color:white; border:none; padding:14px 28px; border-radius:100px; font-weight:800; font-size:14px; cursor:pointer; transition:all 0.3s; box-shadow:0 10px 20px rgba(37, 211, 102, 0.2);"> ${icon('whatsapp', 18)} WhatsApp</button>
              <button class="btn-share-action" data-type="telegram" style="min-width:140px; display:flex; align-items:center; justify-content:center; gap:10px; background:#0088cc; color:white; border:none; padding:14px 28px; border-radius:100px; font-weight:800; font-size:14px; cursor:pointer; transition:all 0.3s; box-shadow:0 10px 20px rgba(0, 136, 204, 0.2);"> ${icon('telegram', 18)} Telegram</button>
              <button class="btn-share-action" data-type="copy" style="min-width:140px; display:flex; align-items:center; justify-content:center; gap:10px; background:white; color:var(--text-primary); border:2px solid var(--border); padding:14px 28px; border-radius:100px; font-weight:800; font-size:14px; cursor:pointer; transition:all 0.3s;"> ${icon('copy', 18)} Bağlantıyı Kopyala</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Newsletter Banner -->
      <section style="margin:0 5% 100px; background:linear-gradient(135deg, var(--bg-secondary) 0%, #ffffff 100%); border:1px solid var(--border); padding:80px 40px; border-radius:var(--radius-xl); text-align:center; box-shadow:var(--shadow-md);">
         <h2 style="font-size:36px; font-weight:800; color:var(--brand-green); margin-bottom:16px; letter-spacing:-1px;">Akademik Vizyona Ortak Olun</h2>
         <p style="color:var(--text-secondary); font-size:18px; max-width:600px; margin:0 auto 40px; line-height:1.6;">Haftalık derlediğimiz eğitim teknolojileri bültenimize abone olun, yeni materyallerden ve makalelerden anında haberdar olun.</p>
         
         <div style="display:flex; justify-content:center; gap:16px; max-width:600px; margin:0 auto; flex-wrap:wrap;">
            <input type="email" placeholder="Kurumsal e-posta adresiniz..." style="flex:1; min-width:280px; border-radius:100px; padding:18px 32px; border:2px solid transparent; background:white; font-size:16px; box-shadow:var(--shadow-sm); outline:none; transition:var(--transition);" onfocus="this.style.border='2px solid var(--brand-green)'" onblur="this.style.border='2px solid transparent'">
            <button class="btn btn-primary" style="border-radius:100px; padding:18px 48px; font-size:16px; font-weight:800;">Bültene Katıl</button>
         </div>
      </section>
    </div>
  `;

  return { 
    html,
    init: (el) => {
      const url = `${window.location.origin}/#post-detail:${post.id}`;
      const text = encodeURIComponent(`${post.title} - bitika.app`);

      el.querySelectorAll('.btn-share-action').forEach(btn => {
        btn.onclick = () => {
          const type = btn.dataset.type;
          if (type === 'whatsapp') window.open(`https://wa.me/?text=${text}%20${url}`);
          else if (type === 'telegram') window.open(`https://t.me/share/url?url=${url}&text=${text}`);
          else if (type === 'x') window.open(`https://x.com/intent/post?text=${text}&url=${url}`);
          else if (type === 'copy') {
            navigator.clipboard.writeText(decodeURIComponent(url));
            const originalIcon = btn.innerHTML;
            btn.innerHTML = `${icon('check', 18)} Kopyalandı!`;
            setTimeout(() => { btn.innerHTML = originalIcon; }, 2000);
          }
        };
      });
    }
  };
}
