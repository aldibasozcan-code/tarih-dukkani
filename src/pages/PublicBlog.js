import { icon } from '../components/icons.js';
import { getApprovedPosts } from '../store/publicData.js';
import { auth } from '../lib/firebase.js';
import { sharePost } from '../utils/share.js';

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
      <div class="blog-card stagger-${i}" data-id="${post.id}" style="background:rgba(255, 255, 255, 0.75); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.5); border-radius:24px; overflow:hidden; transition:all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); display:flex; flex-direction:column; box-shadow:var(--shadow-md); cursor:pointer;" onmouseover="this.style.transform='translateY(-12px) scale(1.02)'; this.style.boxShadow='0 20px 40px rgba(0,0,0,0.08)'; this.style.background='rgba(255,255,255,0.95)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='var(--shadow-md)'; this.style.background='rgba(255, 255, 255, 0.75)'">
        <div class="blog-image" style="background:linear-gradient(45deg, var(--brand-green-soft), #d1fae5); height:220px; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;">
            <!-- Abstract background pattern for blog image -->
           <div style="position:absolute; inset:0; opacity:0.1; background-image: radial-gradient(var(--brand-green) 1px, transparent 1px); background-size: 20px 20px;"></div>
           <div style="background:white; color:var(--brand-green); width:72px; height:72px; border-radius:18px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:32px; box-shadow:var(--shadow-lg); z-index:1; border:2px solid rgba(255,255,255,0.8);">${post.title[0]}</div>
           <div style="position:absolute; top:20px; right:20px; background:rgba(255,255,255,0.9); backdrop-filter:blur(4px); padding:8px 14px; border-radius:12px; font-size:12px; font-weight:800; color:var(--brand-green); display:flex; align-items:center; gap:8px; box-shadow:var(--shadow-sm); z-index:1;">
             ${icon('clock', 14)} 4-5 dk
           </div>
        </div>
        <div class="blog-content" style="padding:36px; flex:1; display:flex; flex-direction:column;">
           <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px;">
             <span class="badge" style="background:var(--brand-green-soft); color:var(--brand-green); border-radius:8px; padding:6px 14px; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; font-weight:800;">${post.category}</span>
             ${post.grade ? `<span style="background:white; border:1px solid var(--border); color:var(--text-secondary); padding:6px 14px; border-radius:8px; font-size:11px; font-weight:800; text-transform:uppercase;">${post.grade}</span>` : ''}
           </div>
           
           <h3 style="font-size:24px; font-weight:900; margin-bottom:16px; line-height:1.3; color:var(--text-primary); letter-spacing:-0.5px;">${post.title}</h3>
           <p style="font-size:15px; color:var(--text-secondary); line-height:1.7; margin-bottom:28px; flex:1; text-align: justify; opacity:0.9;">${post.summary || post.content.substring(0, 160) + '...'}</p>
           
           ${post.tags && post.tags.length > 0 ? `
             <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:24px;">
               ${post.tags.map(t => `<span class="tag-link" data-tag="${t}" style="font-size:11px; color:var(--brand-green); font-weight:700; background:white; border:1px solid var(--brand-green-soft); padding:4px 10px; border-radius:8px; transition:all 0.2s;">#${t}</span>`).join('')}
             </div>
           ` : ''}

           <div style="border-top:1px solid var(--border); padding-top:24px; display:flex; align-items:center; justify-content:space-between; margin-top:auto;">
              <div style="display:flex; align-items:center; gap:14px;">
                 <div style="width:44px; height:44px; background:var(--brand-green); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:16px; box-shadow:0 4px 10px rgba(0,69,38,0.2);">${post.authorName ? post.authorName[0] : 'Ö'}</div>
                 <div>
                   <div style="font-weight:900; color:var(--text-primary); font-size:14px;">${post.authorName || 'Öğretmen'}</div>
                   <div style="font-size:12px; color:var(--text-muted); margin-top:2px; font-weight:600;">Eğitim Yazarı</div>
                 </div>
              </div>
              <div style="display:flex; align-items:center; gap:10px;">
                 <button class="btn-share-post" data-title="${post.title}" data-id="${post.id}" style="background:white; border:1px solid var(--border); width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--text-secondary); cursor:pointer; transition:var(--transition);" onmouseover="this.style.background='var(--brand-green-soft)'; this.style.color='var(--brand-green)'; this.style.borderColor='var(--brand-green)'" onmouseout="this.style.background='white'; this.style.color='var(--text-secondary)'; this.style.borderColor='var(--border)'">
                    ${icon('externalLink', 16)}
                 </button>
                 <div style="color:var(--brand-green); background:var(--brand-green-soft); width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center;">${icon('chevronRight', 20)}</div>
              </div>
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

      <section class="blog-grid-section" style="padding:100px 5%; background: 
        radial-gradient(at 100% 0%, rgba(0, 69, 38, 0.05) 0px, transparent 50%), 
        radial-gradient(at 0% 100%, rgba(5, 150, 105, 0.05) 0px, transparent 50%), 
        #f8fafc; position:relative; overflow:hidden;">
        
        <div id="blog-posts-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap:40px; max-width:1400px; margin:0 auto; position:relative; z-index:1;">
          ${renderPostsHtml(getFilteredPosts())}
        </div>
      </section>

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
            if (e.target.closest('.btn-share-post')) {
              e.stopPropagation();
              const btn = e.target.closest('.btn-share-post');
              sharePost(btn.dataset.title, btn.dataset.id);
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
