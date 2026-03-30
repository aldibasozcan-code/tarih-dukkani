import { icon } from '../components/icons.js';
import { getApprovedPosts } from '../store/publicData.js';
import { auth } from '../lib/firebase.js';

export async function renderPublicForum(navigate) {
  const categories = [
    { id: 'lgs', label: '8. Sınıf (LGS)', color: 'warning' },
    { id: 'lise', label: 'Lise (9-12)', color: 'info' },
    { id: 'yks', label: 'TYT & AYT', color: 'purple' },
    { id: 'mezun', label: 'Mezun Hazırlık', color: 'success' },
  ];

  const posts = await getApprovedPosts('forum');

  const html = `
    <div class="fade-in">
      <header class="forum-header" style="background:var(--bg-secondary); border-bottom:1px solid var(--border); padding:80px 5%; text-align:center;">
        <h2 style="font-size:42px; font-weight:800; color:var(--brand-green); margin-bottom:16px;">Öğretmen Forumu & Materyal Paylaşımı</h2>
        <p style="color:var(--text-secondary); max-width:700px; margin:0 auto; font-size:20px; line-height:1.6;">Öğretmenlerimiz tarafından hazırlanan onaylı materyalleri inceleyin, derslerinize güç katın.</p>
        
        <div class="forum-categories" style="display:flex; justify-content:center; gap:12px; margin-top:32px; flex-wrap:wrap;">
          ${categories.map(c => `
            <button class="btn btn-secondary" style="border-radius:100px; padding:12px 28px; font-weight:700; background:white; border:1px solid var(--border); color:var(--text-primary); box-shadow:var(--shadow-sm);">
              ${c.label}
            </button>
          `).join('')}
        </div>
      </header>

      <div style="padding:80px 5%; display:grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap:32px; max-width:1400px; margin:0 auto;">
        ${posts.length === 0 ? `
           <div style="grid-column: 1 / -1; text-align:center; padding:100px 20px;">
              <div style="color:var(--brand-green-soft); margin-bottom:20px;">${icon('courses', 64)}</div>
              <h3 style="font-size:24px; font-weight:800; color:var(--text-primary); margin-bottom:12px;">Henüz Paylaşım Yok</h3>
              <p style="color:var(--text-secondary); font-size:18px;">İlk materyali siz paylaşarak platforma katkıda bulunabilirsiniz!</p>
           </div>
        ` : posts.map((post, i) => `
          <div class="forum-card stagger-${i}" style="background:white; border:1px solid var(--border); border-radius:var(--radius-xl); padding:24px; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; transition:var(--transition);" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='var(--shadow-md)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm)'">
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:20px;">
               <span class="forum-tag badge badge-primary" style="font-size:12px; text-transform:uppercase; letter-spacing:0.5px; padding:6px 12px; border-radius:100px;">${post.category}</span>
               <div style="color:var(--brand-green);">${icon('courses', 22)}</div>
            </div>
            <h3 style="font-size:20px; font-weight:800; margin-bottom:12px; line-height:1.4; color:var(--text-primary);">${post.title}</h3>
            <p style="font-size:15px; color:var(--text-secondary); line-height:1.6; margin-bottom:24px; flex:1;">${post.summary || post.content.substring(0,120) + '...'}</p>
            
            <div style="border-top:1px solid var(--border); padding-top:20px; display:flex; align-items:center; justify-content:space-between; margin-top:auto;">
               <div style="display:flex; align-items:center; gap:10px;">
                 <div style="width:32px; height:32px; background:var(--brand-green); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800;">${post.authorName[0]}</div>
                 <div>
                   <div style="font-size:14px; font-weight:800; color:var(--text-primary);">${post.authorName}</div>
                   <div style="font-size:12px; color:var(--text-muted);">${new Date(post.createdAt).toLocaleDateString('tr-TR')}</div>
                 </div>
               </div>
               <button class="btn btn-ghost btn-sm" style="color:var(--brand-green); font-weight:800;">İncele ${icon('chevronRight', 16)}</button>
            </div>
          </div>
        `).join('')}
      </div>


    </div>
  `;

  return { 
    html,
    init: (el, navigateFn) => {
      // Sadece okuma sayfası olduğu için özel bir init işlemine gerek kalmadı
    }
  };
}
