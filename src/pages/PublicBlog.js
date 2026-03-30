import { icon } from '../components/icons.js';
import { getApprovedPosts } from '../store/publicData.js';
import { auth } from '../lib/firebase.js';

export async function renderPublicBlog(navigate) {
  const posts = await getApprovedPosts('blog');

  const html = `
    <div class="fade-in">
      <header class="forum-header" style="background:var(--brand-green); color:white; padding:220px 5% 180px; text-align:center;">
        <h2 style="font-size:54px; font-weight:800; margin-bottom:20px;">Eğitim Bloğu & Akademik Yayınlar</h2>
        <p style="color:rgba(255,255,255,0.8); max-width:900px; margin:0 auto; font-size:22px; line-height:1.6;">Eğitimde mükemmelliğe giden yol: Akademik makaleler, yenilikçi pedagojik yaklaşımlar ve MEB müfredatına dair profesyonel incelemeler.</p>
        

      </header>

      <div class="blog-list" style="padding:80px 5%; display:grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap:40px; max-width:1400px; margin:0 auto;">
        ${posts.length === 0 ? `
           <div style="grid-column: 1 / -1; text-align:center; padding:100px 20px;">
              <div style="color:var(--brand-green-soft); margin-bottom:20px;">${icon('book', 64)}</div>
              <h3 style="font-size:24px; font-weight:800; color:var(--text-primary); margin-bottom:12px;">Henüz Makale Yok</h3>
              <p style="color:var(--text-secondary); font-size:18px;">Değerli bilgi birikiminizi ve makalelerinizi platformumuzda paylaşabilirsiniz.</p>
           </div>
        ` : posts.map((post, i) => `
          <div class="blog-card stagger-${i}" style="background:white; border:1px solid var(--border); border-radius:var(--radius-xl); overflow:hidden; transition:var(--transition); display:flex; flex-direction:column; box-shadow:var(--shadow-sm); cursor:pointer;" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='var(--shadow-lg)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm)'">
            <div class="blog-image" style="background:var(--brand-green-soft); height:220px; display:flex; align-items:center; justify-content:center; position:relative;">
               <div style="background:white; color:var(--brand-green); width:72px; height:72px; border-radius:16px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:32px; box-shadow:var(--shadow-md);">${post.title[0]}</div>
               <div style="position:absolute; top:20px; right:20px; background:rgba(255,255,255,0.9); padding:6px 12px; border-radius:100px; font-size:12px; font-weight:700; color:var(--brand-green); display:flex; align-items:center; gap:6px;">
                 ${icon('clock', 14)} 5 dk
               </div>
            </div>
            <div class="blog-content" style="padding:32px; flex:1; display:flex; flex-direction:column;">
               <span class="badge badge-info" style="margin-bottom:20px; border-radius:100px; padding:6px 16px; align-self:flex-start; font-size:13px; text-transform:uppercase; letter-spacing:0.5px;">${post.category}</span>
               <h3 style="font-size:22px; font-weight:800; margin-bottom:16px; line-height:1.4; color:var(--text-primary);">${post.title}</h3>
               <p style="font-size:15px; color:var(--text-secondary); line-height:1.7; margin-bottom:32px; flex:1;">${post.summary || post.content.substring(0, 150) + '...'}</p>
               
               <div style="border-top:1px solid var(--border); padding-top:24px; display:flex; align-items:center; justify-content:space-between; margin-top:auto;">
                  <div style="display:flex; align-items:center; gap:12px;">
                     <div style="width:36px; height:36px; background:var(--brand-green); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px;">${post.authorName ? post.authorName[0] : 'Ö'}</div>
                     <div>
                       <div style="font-weight:800; color:var(--text-primary); font-size:14px;">${post.authorName || 'Öğretmen'}</div>
                       <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">Eğitim Uzmanı</div>
                     </div>
                  </div>
                  <button class="btn btn-ghost" style="font-size:13px; font-weight:800; padding:8px; color:var(--brand-green);">İncele ${icon('chevronRight', 16)}</button>
               </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Newsletter Banner -->
      <section style="margin:40px 5% 100px; background:linear-gradient(135deg, var(--bg-secondary) 0%, #ffffff 100%); border:1px solid var(--border); padding:80px 40px; border-radius:var(--radius-xl); text-align:center; box-shadow:var(--shadow-md);">
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
    init: (el, navigateFn) => {
      // Sadece okuma sayfası olduğu için özel bir init işlemine gerek kalmadı
    }
  };
}
