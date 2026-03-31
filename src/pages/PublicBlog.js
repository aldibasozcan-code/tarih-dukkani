import { icon } from '../components/icons.js';
import { getApprovedPosts } from '../store/publicData.js';
import { auth } from '../lib/firebase.js';

export async function renderPublicBlog(navigate) {
  const allPosts = await getApprovedPosts('blog');
  let currentFilter = 'all';
  let currentTag = 'all';

  const blogTags = ['akademik', 'pedagoji', 'edtech', 'mebGundemi', 'rehberlik', 'inceleme', 'deneyim'];

  const blogCategories = [
    { id: 'all', label: 'Tümü', icon: 'layers' },
    { id: 'Akademik Makale', label: 'Akademik Makale', icon: 'book' },
    { id: 'Pedagojik İnceleme', label: 'Pedagojik İnceleme', icon: 'users' },
    { id: 'Eğitim Teknolojileri', label: 'EdTech', icon: 'cpu' },
    { id: 'MEB Gündemi', label: 'MEB & Mevzuat', icon: 'checkCircle' },
    { id: 'Deneyim Paylaşımı', label: 'Deneyimler', icon: 'star' },
  ];

  function getFilteredPosts() {
    let filtered = allPosts;
    if (currentFilter !== 'all') {
      filtered = filtered.filter(p => p.category === currentFilter);
    }
    if (currentTag !== 'all') {
      filtered = filtered.filter(p => p.tags && p.tags.includes(currentTag));
    }
    return filtered;
  }

  function renderPostsHtml(posts) {
    if (posts.length === 0) {
      return `
        <div style="grid-column: 1 / -1; text-align:center; padding:100px 20px;">
          <div style="color:var(--brand-green-soft); margin-bottom:20px;">${icon('book', 64)}</div>
          <h3 style="font-size:24px; font-weight:800; color:var(--text-primary); margin-bottom:12px;">Henüz Makale Yok</h3>
          <p style="color:var(--text-secondary); font-size:18px;">Aradığınız kategoride henüz bir makale bulunmuyor.</p>
        </div>
      `;
    }

    return posts.map((post, i) => `
      <div class="blog-card stagger-${i}" data-id="${post.id}" style="background:white; border:1px solid var(--border); border-radius:var(--radius-xl); overflow:hidden; transition:var(--transition); display:flex; flex-direction:column; box-shadow:var(--shadow-sm); cursor:pointer;" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='var(--shadow-lg)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm)'">
        <div class="blog-image" style="background:var(--brand-green-soft); height:200px; display:flex; align-items:center; justify-content:center; position:relative;">
           <div style="background:white; color:var(--brand-green); width:64px; height:64px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:28px; box-shadow:var(--shadow-md);">${post.title[0]}</div>
           <div style="position:absolute; top:20px; right:20px; background:rgba(255,255,255,0.9); padding:6px 12px; border-radius:100px; font-size:12px; font-weight:700; color:var(--brand-green); display:flex; align-items:center; gap:6px;">
             ${icon('clock', 14)} 4-5 dk
           </div>
        </div>
        <div class="blog-content" style="padding:32px; flex:1; display:flex; flex-direction:column;">
           <div style="display:flex; gap:8px; margin-bottom:16px;">
             <span class="badge badge-info" style="border-radius:100px; padding:6px 16px; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">${post.category}</span>
             ${post.grade ? `<span style="background:var(--bg-secondary); color:var(--text-secondary); padding:6px 14px; border-radius:100px; font-size:12px; font-weight:700;">${post.grade}</span>` : ''}
           </div>
           <h3 style="font-size:20px; font-weight:800; margin-bottom:12px; line-height:1.4; color:var(--text-primary);">${post.title}</h3>
           <p style="font-size:14px; color:var(--text-secondary); line-height:1.6; margin-bottom:24px; flex:1;">${post.summary || post.content.substring(0, 140) + '...'}</p>
           
           ${post.tags && post.tags.length > 0 ? `
             <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:20px;">
               ${post.tags.map(t => `<span class="tag-link" data-tag="${t}" style="font-size:10px; color:var(--brand-green); font-weight:700; background:rgba(0,102,51,0.05); padding:3px 8px; border-radius:4px; transition:all 0.2s;">#${t}</span>`).join('')}
             </div>
           ` : ''}

           <div style="border-top:1px solid var(--border); padding-top:20px; display:flex; align-items:center; justify-content:space-between; margin-top:auto;">
              <div style="display:flex; align-items:center; gap:12px;">
                 <div style="width:36px; height:36px; background:var(--brand-green); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px;">${post.authorName ? post.authorName[0] : 'Ö'}</div>
                 <div>
                   <div style="font-weight:800; color:var(--text-primary); font-size:13px;">${post.authorName || 'Öğretmen'}</div>
                   <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Eğitim Yazarı</div>
                 </div>
              </div>
              <div style="color:var(--brand-green);">${icon('chevronRight', 20)}</div>
           </div>
        </div>
      </div>
    `).join('');
  }

  const html = `
    <div class="fade-in">
      <header class="blog-header" style="background:linear-gradient(to bottom, var(--brand-green) 0%, #005a32 100%); color:white; padding:160px 5% 100px; text-align:center;">
        <h2 style="font-size:48px; font-weight:900; margin-bottom:16px; letter-spacing:-1px;">Eğitim Bloğu</h2>
        <p style="color:rgba(255,255,255,0.85); max-width:800px; margin:0 auto; font-size:18px; line-height:1.6;">Akademik makaleler, yenilikçi pedagojik yaklaşımlar ve profesyonel incelemeler.</p>
        
        <div class="blog-filters" style="display:flex; justify-content:center; gap:10px; margin-top:40px; flex-wrap:wrap; max-width:1100px; margin-left:auto; margin-right:auto;">
          ${blogCategories.map(c => `
            <button class="blog-filter-btn ${currentFilter === c.id ? 'active' : ''}" data-filter="${c.id}" style="border-radius:100px; padding:10px 22px; font-weight:700; background:${currentFilter === c.id ? 'white' : 'rgba(255,255,255,0.1)'}; border:1px solid ${currentFilter === c.id ? 'white' : 'rgba(255,255,255,0.2)'}; color:${currentFilter === c.id ? 'var(--brand-green)' : 'white'}; cursor:pointer; display:flex; align-items:center; gap:8px; transition:all 0.3s ease;">
              ${icon(c.icon, 16)}
              ${c.label}
            </button>
          `).join('')}
        </div>

        <div class="tag-filters" style="display:flex; justify-content:center; gap:8px; margin-top:24px; flex-wrap:wrap; max-width:800px; margin-left:auto; margin-right:auto;">
          <span style="font-size:13px; font-weight:700; color:rgba(255,255,255,0.7); align-self:center; margin-right:8px;">Etiketler:</span>
          <button class="tag-filter-btn ${currentTag === 'all' ? 'active' : ''}" data-tag="all" style="font-size:11px; font-weight:700; padding:6px 14px; border-radius:100px; border:1px solid rgba(255,255,255,0.2); background:${currentTag === 'all' ? 'white' : 'rgba(255,255,255,0.1)'}; color:${currentTag === 'all' ? 'var(--brand-green)' : 'white'}; cursor:pointer;">#tümü</button>
          ${blogTags.map(t => `
            <button class="tag-filter-btn ${currentTag === t ? 'active' : ''}" data-tag="${t}" style="font-size:11px; font-weight:700; padding:6px 14px; border-radius:100px; border:1px solid rgba(255,255,255,0.2); background:${currentTag === t ? 'white' : 'rgba(255,255,255,0.1)'}; color:${currentTag === t ? 'var(--brand-green)' : 'white'}; cursor:pointer;">#${t}</button>
          `).join('')}
        </div>
      </header>

      <div id="blog-posts-grid" style="padding:60px 5%; display:grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap:32px; max-width:1400px; margin:0 auto;">
        ${renderPostsHtml(getFilteredPosts())}
      </div>

      <!-- Newsletter Banner -->
      <section style="margin:40px 5% 100px; background:linear-gradient(135deg, var(--bg-secondary) 0%, #ffffff 100%); border:1px solid var(--border); padding:80px 40px; border-radius:var(--radius-xl); text-align:center; box-shadow:var(--shadow-md);">
         <h2 style="font-size:32px; font-weight:800; color:var(--brand-green); margin-bottom:16px; letter-spacing:-1px;">Akademik Vizyona Ortak Olun</h2>
         <p style="color:var(--text-secondary); font-size:16px; max-width:600px; margin:0 auto 40px; line-height:1.6;">Haftalık derlediğimiz eğitim teknolojileri bültenimize abone olun, yeni materyallerden ve makalelerden anında haberdar olun.</p>
         
         <div style="display:flex; justify-content:center; gap:12px; max-width:560px; margin:0 auto; flex-wrap:wrap;">
            <input type="email" placeholder="E-posta adresiniz..." style="flex:1; min-width:260px; border-radius:100px; padding:16px 28px; border:2px solid transparent; background:white; font-size:15px; box-shadow:var(--shadow-sm); outline:none; transition:var(--transition);" onfocus="this.style.border='2px solid var(--brand-green)'" onblur="this.style.border='2px solid transparent'">
            <button class="btn btn-primary" style="border-radius:100px; padding:16px 36px; font-size:15px; font-weight:800;">Abone Ol</button>
         </div>
      </section>
    </div>
  `;

  return { 
    html,
    init: (el, navigateFn) => {
      const grid = el.querySelector('#blog-posts-grid');
      const filterBtns = el.querySelectorAll('.blog-filter-btn');

      const updateUI = () => {
        const filtered = getFilteredPosts();
        grid.style.opacity = '0';
        setTimeout(() => {
          grid.innerHTML = renderPostsHtml(filtered);
          grid.style.opacity = '1';
          attachCardEvents();
        }, 200);

        // Update Category Buttons
        filterBtns.forEach(b => {
          const isActive = b.dataset.filter === currentFilter;
          b.style.background = isActive ? 'white' : 'rgba(255,255,255,0.1)';
          b.style.color = isActive ? 'var(--brand-green)' : 'white';
          b.style.borderColor = isActive ? 'white' : 'rgba(255,255,255,0.2)';
        });

        // Update Tag Buttons
        el.querySelectorAll('.tag-filter-btn').forEach(tb => {
          const isActive = tb.dataset.tag === currentTag;
          tb.style.background = isActive ? 'white' : 'rgba(255,255,255,0.1)';
          tb.style.color = isActive ? 'var(--brand-green)' : 'white';
        });
      };

      const attachCardEvents = () => {
        el.querySelectorAll('.blog-card').forEach(card => {
          card.onclick = (e) => {
            if (e.target.classList.contains('tag-link')) {
              e.stopPropagation();
              currentTag = e.target.dataset.tag;
              updateUI();
              window.scrollTo({ top: 300, behavior: 'smooth' });
              return;
            }
            navigateFn(`post-detail:${card.dataset.id}`);
          };
        });
      };

      filterBtns.forEach(btn => {
        btn.onclick = () => {
          currentFilter = btn.dataset.filter;
          updateUI();
        };
      });

      el.querySelectorAll('.tag-filter-btn').forEach(btn => {
        btn.onclick = () => {
          currentTag = btn.dataset.tag;
          updateUI();
        };
      });

      attachCardEvents();
    }
  };
}
