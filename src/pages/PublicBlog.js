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

    return posts.map((post, i) => {
      const isNew = (Date.now() - post.createdAt) < (1000 * 60 * 60 * 24);
      return `
      <div class="social-post-card fade-in-up" data-id="${post.id}" style="animation-delay: ${i * 0.1}s; width:100%; max-width:600px; margin: 0 auto 40px; background:white; border:1px solid var(--border); border-radius:16px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.03); position:relative;">
        ${isNew ? `<div style="position:absolute; top:12px; right:12px; background:var(--danger); color:white; font-size:10px; font-weight:900; padding:4px 10px; border-radius:100px; text-transform:uppercase; z-index:2; letter-spacing:1px;">YENİ</div>` : ''}
        
        <!-- Post Header -->
        <div style="display:flex; align-items:center; justify-content:space-between; padding:16px;">
           <div style="display:flex; align-items:center; gap:12px;">
             <div style="width:40px; height:40px; background:linear-gradient(135deg, var(--brand-green), #002514); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:900; box-shadow:0 2px 8px rgba(0,69,38,0.15);">${post.authorName ? post.authorName[0] : 'Ö'}</div>
             <div>
               <div style="font-size:14px; font-weight:800; color:var(--text-primary); line-height:1.2;">${post.authorName || 'Öğretmen'}</div>
               <div style="font-size:11px; color:var(--text-muted); font-weight:600;">${new Date(post.createdAt).toLocaleDateString('tr-TR')} · ${post.category}</div>
             </div>
           </div>
           <button class="btn-share-post icon-btn" data-title="${post.title}" data-id="${post.id}" style="color:var(--text-muted); background:none; border:none; padding:8px; cursor:pointer;">
              ${icon('moreVertical', 20)}
           </button>
        </div>

        <!-- Post Image or Placeholder -->
        ${post.imageUrl ? `
          <div style="width:100%; max-height:600px; overflow:hidden; background:#f8fafc; display:flex; align-items:center; justify-content:center; border-top:1px solid var(--border); border-bottom:1px solid var(--border);">
             <img src="${post.imageUrl}" alt="Post image" style="width:100%; height:auto; max-height:600px; object-fit:cover; display:block;" />
          </div>
        ` : `
          <div style="width:100%; padding:60px 30px; background:linear-gradient(135deg, rgba(5,150,105,0.05), rgba(0,69,38,0.02)); text-align:center; border-top:1px solid var(--border); border-bottom:1px solid var(--border);">
             <div style="color:var(--brand-green); opacity:0.4; margin-bottom:16px;">${icon('book', 48)}</div>
             <h3 style="font-size:22px; font-weight:900; color:var(--text-primary); line-height:1.3; margin:0 auto; letter-spacing:-0.5px;">${post.title}</h3>
          </div>
        `}

        <!-- Post Actions -->
        <div style="padding:16px 16px 8px; display:flex; align-items:center; justify-content:space-between;">
           <div style="display:flex; align-items:center; gap:16px;">
             <button style="background:none; border:none; cursor:pointer; color:var(--text-primary); padding:0; display:flex; align-items:center; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                ${icon('heart', 24)}
             </button>
             <button style="background:none; border:none; cursor:pointer; color:var(--text-primary); padding:0; display:flex; align-items:center; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                ${icon('chat', 24)}
             </button>
             <button class="btn-share-post" data-title="${post.title}" data-id="${post.id}" style="background:none; border:none; cursor:pointer; color:var(--text-primary); padding:0; display:flex; align-items:center; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                ${icon('send', 24)}
             </button>
           </div>
           <button style="background:none; border:none; cursor:pointer; color:var(--text-primary); padding:0; display:flex; align-items:center; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
              ${icon('bookmark', 24)}
           </button>
        </div>

        <!-- Likes count -->
        <div style="padding:0 16px; margin-bottom:8px; font-size:13px; font-weight:800; color:var(--text-primary);">
           ${Math.floor(Math.random() * 200) + 12} beğenme
        </div>

        <!-- Post Description -->
        <div style="padding:0 16px 16px;">
          <p style="font-size:14px; color:var(--text-primary); line-height:1.5;">
            <span style="font-weight:800; margin-right:6px;">${post.authorName || 'Öğretmen'}</span>
            ${post.imageUrl ? `<span style="font-weight:700;">${post.title}</span> - ` : ''}
            ${post.content.length > 250 ? post.content.substring(0,250) + '... <span style="color:var(--text-muted); cursor:pointer; font-weight:600;">devamını oku</span>' : post.content}
          </p>
          
          ${post.tags && post.tags.length > 0 ? `
            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:10px;">
              ${post.tags.slice(0, 5).map(t => `<span class="tag-link" data-tag="${t}" style="font-size:13px; color:var(--brand-green); font-weight:600; cursor:pointer; transition:opacity 0.2s;">#${t}</span>`).join('')}
            </div>
          ` : ''}

          <div style="color:var(--text-muted); font-size:13px; margin-top:10px; cursor:pointer;">
             ${Math.floor(Math.random() * 40) + 2} yorumun tümünü gör
          </div>
        </div>
      </div>
      `;
    }).join('');
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
          
          <div class="stories-container" style="display:flex; gap:16px; overflow-x:auto; padding:20px 0; max-width:640px; margin:24px auto 0; scrollbar-width:none; -ms-overflow-style:none;">
            <style>
              .stories-container::-webkit-scrollbar { display: none; }
              .blog-filter-story .story-ring { background: rgba(255,255,255,0.2); }
              .blog-filter-story.active .story-ring { background: linear-gradient(45deg, #facc15, #10b981); }
            </style>
            ${blogCategories.map(c => `
              <div class="blog-filter-story ${currentFilter === c.id ? 'active' : ''}" data-filter="${c.id}" style="display:flex; flex-direction:column; align-items:center; gap:8px; cursor:pointer; min-width:72px;">
                <div class="story-ring" style="width:68px; height:68px; border-radius:50%; padding:3px; transition:all 0.3s; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
                  <div style="width:100%; height:100%; background:${currentFilter === c.id ? 'white' : 'rgba(255,255,255,0.1)'}; backdrop-filter:blur(10px); border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid ${currentFilter === c.id ? 'white' : 'rgba(255,255,255,0.2)'};">
                    <div style="color:${currentFilter === c.id ? 'var(--brand-green)' : 'white'}; transition:color 0.3s;">${icon(c.icon, 28)}</div>
                  </div>
                </div>
                <span style="font-size:11px; font-weight:${currentFilter === c.id ? '800' : '600'}; color:white; text-align:center; max-width:80px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${c.label}</span>
              </div>
            `).join('')}
          </div>
  
          <div class="tag-filters" style="display:flex; justify-content:center; gap:8px; margin-top:20px; flex-wrap:wrap; max-width:800px; margin-left:auto; margin-right:auto;">
            ${blogTags.map(t => `
              <button class="tag-filter-btn ${currentTag === t ? 'active' : ''}" data-tag="${t}" style="font-size:11px; font-weight:700; padding:6px 16px; border-radius:100px; border:1px solid rgba(255,255,255,0.2); background:${currentTag === t ? 'white' : 'rgba(255,255,255,0.1)'}; color:${currentTag === t ? 'var(--brand-green)' : 'white'}; cursor:pointer; transition:all 0.2s; backdrop-filter:blur(4px);">#${t}</button>
            `).join('')}
            ${currentTag !== 'all' ? `<button class="tag-filter-btn" data-tag="all" style="font-size:11px; font-weight:700; padding:6px 12px; border-radius:100px; border:none; background:none; color:rgba(255,255,255,0.7); cursor:pointer; text-decoration:underline;">Sıfırla</button>` : ''}
          </div>
        </div>
      </header>

      <section class="blog-grid-section" style="padding:100px 5%; background: 
        radial-gradient(at 100% 0%, rgba(0, 69, 38, 0.05) 0px, transparent 50%), 
        radial-gradient(at 0% 100%, rgba(5, 150, 105, 0.05) 0px, transparent 50%), 
        #f8fafc; position:relative; overflow:hidden;">
        
        <div id="blog-posts-grid" style="display:flex; flex-direction:column; align-items:center; width:100%; position:relative; z-index:1;">
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

        // Update Filter Buttons (Stories)
        el.querySelectorAll('.blog-filter-story').forEach(b => {
          const isActive = b.dataset.filter === currentFilter;
          if (isActive) {
            b.classList.add('active');
            b.querySelector('span').style.fontWeight = '800';
            b.querySelector('div > div').style.background = 'white';
            b.querySelector('div > div').style.border = '2px solid white';
            if(b.querySelector('div > div > div')) b.querySelector('div > div > div').style.color = 'var(--brand-green)';
          } else {
            b.classList.remove('active');
            b.querySelector('span').style.fontWeight = '600';
            b.querySelector('div > div').style.background = 'rgba(255,255,255,0.1)';
            b.querySelector('div > div').style.border = '2px solid rgba(255,255,255,0.2)';
            if(b.querySelector('div > div > div')) b.querySelector('div > div > div').style.color = 'white';
          }
        });

        // Update Tag Buttons
        el.querySelectorAll('.tag-filter-btn').forEach(tb => {
          if (tb.innerText === 'Sıfırla') return;
          const isActive = tb.dataset.tag === currentTag;
          tb.style.background = isActive ? 'white' : 'rgba(255,255,255,0.1)';
          tb.style.color = isActive ? 'var(--brand-green)' : 'white';
        });
      };

      const attachCardEvents = () => {
        el.querySelectorAll('.social-post-card').forEach(card => {
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

      el.querySelectorAll('.blog-filter-story').forEach(btn => {
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
