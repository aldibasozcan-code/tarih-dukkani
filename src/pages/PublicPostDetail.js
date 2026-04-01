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
      <div class="post-hero" style="background:var(--brand-green); color:white; padding:180px 5% 120px; position:relative; overflow:hidden;">
        <!-- Abstract Decorations -->
        <div style="position:absolute; top:-100px; right:-100px; width:400px; height:400px; background:rgba(255,255,255,0.05); border-radius:50%;"></div>
        <div style="position:absolute; bottom:-50px; left:10%; width:200px; height:200px; background:rgba(255,255,255,0.03); border-radius:50%;"></div>

        <div style="max-width:900px; margin:0 auto; position:relative; z-index:2;">
           <button class="btn-back" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:white; padding:8px 20px; border-radius:100px; font-weight:700; display:flex; align-items:center; gap:8px; margin-bottom:40px; cursor:pointer;" onclick="window.history.back()">
             ${icon('chevronRight', 18, { style: 'transform:rotate(180deg)' })} Geri Dön
           </button>
           
           <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
              <span style="background:rgba(255,255,255,0.2); backdrop-filter:blur(10px); padding:6px 16px; border-radius:100px; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">${post.category}</span>
              <span style="color:rgba(255,255,255,0.7); font-size:14px;">${dateStr}</span>
           </div>

           <h1 style="font-size: clamp(32px, 5vw, 56px); font-weight:800; line-height:1.1; margin-bottom:32px; letter-spacing:-1px;">${post.title}</h1>
           
           <div style="display:flex; align-items:center; gap:16px;">
              <div style="width:56px; height:56px; background:white; color:var(--brand-green); border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:20px; box-shadow:var(--shadow-md);">${post.authorName ? post.authorName[0] : 'Ö'}</div>
              <div>
                <div style="font-weight:800; font-size:18px;">${post.authorName || 'Öğretmen'}</div>
                <div style="color:rgba(255,255,255,0.7); font-size:14px;">${post.type === 'blog' ? 'Eğitim Yazarı' : 'Eğitmen'}</div>
              </div>
           </div>
        </div>
      </div>

      <div class="post-body-container" style="max-width:900px; margin:-60px auto 100px; padding:0 24px; position:relative; z-index:3;">
        <div style="background:white; padding:60px; border-radius:var(--radius-xl); border:1px solid var(--border); box-shadow:var(--shadow-xl);">
           <div class="post-content-rich" style="font-size:19px; line-height:1.8; color:var(--text-primary);">
              ${(post.content || '').split('\n').map(p => p.trim() ? `<p style="margin-bottom:24px; text-align: justify;">${p}</p>` : '').join('') || '<p style="color:var(--text-muted); font-style:italic;">Bu yazı henüz içerik barındırmıyor.</p>'}
           </div>

          <div style="margin-top:60px; padding:40px; border-radius:var(--radius-xl); background:var(--bg-secondary); border:1px solid var(--border);">
            <h4 style="font-size:18px; font-weight:800; color:var(--brand-green); margin-bottom:20px; text-align:center;">Bu Yazıyı Paylaşın</h4>
            <div style="display:flex; justify-content:center; gap:16px; flex-wrap:wrap;">
              <button class="btn-share-action" data-type="whatsapp" style="flex:1; min-width:140px; display:flex; align-items:center; justify-content:center; gap:10px; background:#25D366; color:white; border:none; padding:12px 20px; border-radius:100px; font-weight:700; cursor:pointer; transition:all 0.2s;">${icon('whatsapp', 18)} WhatsApp</button>
              <button class="btn-share-action" data-type="telegram" style="flex:1; min-width:140px; display:flex; align-items:center; justify-content:center; gap:10px; background:#0088cc; color:white; border:none; padding:12px 20px; border-radius:100px; font-weight:700; cursor:pointer; transition:all 0.2s;">${icon('telegram', 18)} Telegram</button>
              <button class="btn-share-action" data-type="x" style="flex:1; min-width:140px; display:flex; align-items:center; justify-content:center; gap:10px; background:#000; color:white; border:none; padding:12px 20px; border-radius:100px; font-weight:700; cursor:pointer; transition:all 0.2s;">${icon('xSocial', 18)} X (Twitter)</button>
              <button class="btn-share-action" data-type="copy" style="flex:1; min-width:140px; display:flex; align-items:center; justify-content:center; gap:10px; background:white; color:var(--text-primary); border:1px solid var(--border); padding:12px 20px; border-radius:100px; font-weight:700; cursor:pointer; transition:all 0.2s;">${icon('copy', 18)} Kopyala</button>
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
