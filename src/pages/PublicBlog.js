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
      <div class="premium-card fade-in-up" data-id="${post.id}" style="animation-delay: ${i * 0.1}s; display:flex; flex-direction:column; overflow:hidden;">
        <div class="blog-image" style="background:linear-gradient(135deg, var(--brand-green), #065f46); height:240px; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;">
            <!-- Abstract background pattern for blog image -->
           <div style="position:absolute; inset:0; opacity:0.15; background-image: url('https://www.transparenttextures.com/patterns/cubes.png');"></div>
           <div style="background:rgba(255,255,255,0.2); backdrop-filter:blur(8px); color:white; width:80px; height:80px; border-radius:24px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:36px; z-index:1; border:1px solid rgba(255,255,255,0.3); text-shadow: 0 4px 10px rgba(0,0,0,0.2);">${post.title[0]}</div>
           
           <div style="position:absolute; bottom:0; left:0; right:0; height:80px; background:linear-gradient(to top, rgba(0,0,0,0.4), transparent); z-index:1;"></div>
           
           <div style="position:absolute; top:20px; right:20px; background:rgba(255,255,255,0.95); padding:8px 16px; border-radius:100px; font-size:11px; font-weight:800; color:var(--brand-green); display:flex; align-items:center; gap:8px; box-shadow:var(--shadow-md); z-index:2;">
             ${icon('clock', 14)} 5 dk okuma
           </div>
           
           <div style="position:absolute; bottom:20px; left:20px; z-index:2; display:flex; gap:8px;">
              <span style="background:var(--brand-green); color:white; padding:4px 12px; border-radius:100px; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; border:1px solid rgba(255,255,255,0.2);">${post.category}</span>
           </div>
        </div>
        <div class="blog-content" style="padding:32px; flex:1; display:flex; flex-direction:column;">
           <h3 style="font-size:22px; font-weight:900; margin-bottom:14px; line-height:1.4; color:var(--text-primary); letter-spacing:-0.5px;">${post.title}</h3>
           <p style="font-size:15px; color:var(--text-secondary); line-height:1.6; margin-bottom:24px; flex:1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${post.summary || post.content.substring(0, 150) + '...'}</p>
           
           ${post.tags && post.tags.length > 0 ? `
             <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:24px;">
               ${post.tags.slice(0, 3).map(t => `<span class="tag-link" data-tag="${t}" style="font-size:10px; color:var(--text-secondary); font-weight:700; background:var(--bg-secondary); border:1px solid var(--border); padding:4px 10px; border-radius:100px; transition:all 0.2s;">#${t}</span>`).join('')}
             </div>
           ` : ''}
 
           <div style="border-top:1px solid var(--border); padding-top:20px; display:flex; align-items:center; justify-content:space-between;">
              <div style="display:flex; align-items:center; gap:12px;">
                 <div style="width:40px; height:40px; background:linear-gradient(135deg, var(--brand-green), var(--brand-green-light)); color:white; border-radius:14px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:16px; box-shadow:0 4px 12px rgba(0,69,38,0.15);">${post.authorName ? post.authorName[0] : 'Ö'}</div>
                 <div>
                    <div style="font-weight:800; color:var(--text-primary); font-size:13px;">${post.authorName || 'Öğretmen'}</div>
                    <div style="font-size:11px; color:var(--text-muted); font-weight:600;">Eğitim Yazarı</div>
                 </div>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                 <button class="btn-share-post icon-btn" data-title="${post.title}" data-id="${post.id}" style="width:34px; height:34px; border-radius:10px;">
                    ${icon('externalLink', 14)}
                 </button>
                 <div style="color:white; background:var(--brand-green); width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,69,38,0.2);">${icon('chevronRight', 18)}</div>
              </div>
           </div>
        </div>
      </div>
    `).join('');
  }

  const html = `
    <div class="fade-in">
      <header class="blog-header" style="background:linear-gradient(to bottom, var(--brand-green) 0%, #002514 100%); color:white; padding:180px 5% 120px; text-align:center; position:relative; overflow:hidden;">
        <!-- Floating orbs in header -->
        <div class="blur-orb" style="top:-100px; left:-100px; width:400px; height:400px; background:rgba(5, 150, 105, 0.4);"></div>
        <div class="blur-orb" style="bottom:-50px; right:10%; width:300px; height:300px; background:rgba(0, 69, 38, 0.6); animation-delay: -5s;"></div>
        
        <div style="position:relative; z-index:2;">
          <h2 style="font-size:56px; font-weight:900; margin-bottom:20px; letter-spacing:-2px; line-height:1.1;">Eğitim Bloğu</h2>
          <p style="color:rgba(255,255,255,0.8); max-width:700px; margin:0 auto; font-size:20px; line-height:1.6; font-weight:500;">Akademik derinlik, pedagojik yenilik ve profesyonel gelişim merkezi.</p>
          
          <div class="blog-filters" style="display:flex; justify-content:center; gap:12px; margin-top:48px; flex-wrap:wrap; max-width:1200px; margin-left:auto; margin-right:auto;">
            ${blogCategories.map(c => `
              <button class="blog-filter-btn ${currentFilter === c.id ? 'active' : ''}" data-filter="${c.id}" style="border-radius:100px; padding:12px 26px; font-weight:800; font-size:13px; background:${currentFilter === c.id ? 'white' : 'rgba(255,255,255,0.08)'}; border:1px solid ${currentFilter === c.id ? 'white' : 'rgba(255,255,255,0.15)'}; color:${currentFilter === c.id ? 'var(--brand-green)' : 'white'}; cursor:pointer; display:flex; align-items:center; gap:10px; transition:all 0.4s cubic-bezier(0.16, 1, 0.3, 1); backdrop-filter:blur(10px);">
                ${icon(c.icon, 18)}
                ${c.label}
              </button>
            `).join('')}
          </div>
  
          <div class="tag-filters" style="display:flex; justify-content:center; gap:8px; margin-top:32px; flex-wrap:wrap; max-width:800px; margin-left:auto; margin-right:auto;">
            <span style="font-size:12px; font-weight:800; color:rgba(255,255,255,0.5); align-self:center; margin-right:8px; text-transform:uppercase; letter-spacing:1px;">Popüler Etiketler:</span>
            <button class="tag-filter-btn ${currentTag === 'all' ? 'active' : ''}" data-tag="all" style="font-size:11px; font-weight:700; padding:6px 16px; border-radius:100px; border:1px solid rgba(255,255,255,0.1); background:${currentTag === 'all' ? 'white' : 'rgba(255,255,255,0.05)'}; color:${currentTag === 'all' ? 'var(--brand-green)' : 'white'}; cursor:pointer; transition:var(--transition);">#tümü</button>
            ${blogTags.map(t => `
              <button class="tag-filter-btn ${currentTag === t ? 'active' : ''}" data-tag="${t}" style="font-size:11px; font-weight:700; padding:6px 16px; border-radius:100px; border:1px solid rgba(255,255,255,0.1); background:${currentTag === t ? 'white' : 'rgba(255,255,255,0.05)'}; color:${currentTag === t ? 'var(--brand-green)' : 'white'}; cursor:pointer; transition:var(--transition);">#${t}</button>
            `).join('')}
          </div>
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
        el.querySelectorAll('.premium-card').forEach(card => {
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
