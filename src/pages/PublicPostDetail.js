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
              ${(post.content || '').split('\n').map(p => p.trim() ? `<p style="margin-bottom:24px;">${p}</p>` : '').join('') || '<p style="color:var(--text-muted); font-style:italic;">Bu yazı henüz içerik barındırmıyor.</p>'}
           </div>

           <div style="margin-top:60px; padding-top:40px; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;">
              <div style="display:flex; gap:12px;">
                 <button class="btn btn-ghost" style="gap:8px;">${icon('star', 20)} Faydalı Buldum</button>
                 <button class="btn btn-ghost" style="gap:8px;">${icon('chat', 20)} Yorum Yap</button>
              </div>
              <div style="display:flex; gap:12px;">
                 <button class="btn btn-secondary" style="border-radius:50%; width:44px; height:44px; padding:0; display:flex; align-items:center; justify-content:center;">${icon('info', 18)}</button>
                 <button class="btn btn-secondary" style="border-radius:50%; width:44px; height:44px; padding:0; display:flex; align-items:center; justify-content:center;">${icon('settings', 18)}</button>
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

  return { html };
}
