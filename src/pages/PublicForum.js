import { icon } from '../components/icons.js';
import { getApprovedPosts, seedInitialData } from '../store/publicData.js';
import { auth } from '../lib/firebase.js';
import { sharePost } from '../utils/share.js';

export async function renderPublicForum(navigate) {
  // Seed if empty
  await seedInitialData();

  const allPosts = await getApprovedPosts('forum');
  let currentFilter = 'all';
  let currentTag = 'all';

  const forumTags = ['deneme', 'konuozeti', 'cikmissorular', 'mufredat', 'etkinlik', 'sunum', 'yazilihazirlik'];

  const gradeGroups = [
    { id: 'all', label: 'Tümü', icon: 'layers' },
    { id: 'Yazılı Hazırlık', label: 'Yazılı Hazırlık', icon: 'edit', specialty: true },
    { id: '5-6-7. Sınıf', label: 'Ortaokul (5-7)', grades: ['5. Sınıf', '6. Sınıf', '7. Sınıf'] },
    { id: '8. Sınıf', label: '8. Sınıf (LGS)', grades: ['8. Sınıf'] },
    { id: '9-10-11. Sınıf', label: 'Lise (9-11)', grades: ['9. Sınıf', '10. Sınıf', '11. Sınıf'] },
    { id: '12. Sınıf', label: '12. Sınıf (YKS)', grades: ['12. Sınıf', 'TYT-AYT'] },
  ];

  function getFilteredPosts() {
    let filtered = allPosts;
    
    // Grade/Category Filter
    if (currentFilter !== 'all') {
      const group = gradeGroups.find(g => g.id === currentFilter);
      if (group.specialty) {
        filtered = filtered.filter(p => p.category === currentFilter);
      } else {
        filtered = filtered.filter(p => group.grades.includes(p.grade));
      }
    }

    // Tag Filter
    if (currentTag !== 'all') {
      filtered = filtered.filter(p => p.tags && p.tags.includes(currentTag));
    }

    return filtered;
  }

  function renderPostsHtml(posts) {
    if (posts.length === 0) {
      return `
        <div style="width:100%; max-width:600px; text-align:center; padding:100px 20px;">
          <div style="color:var(--brand-green-soft); margin-bottom:20px;">${icon('courses', 64)}</div>
          <h3 style="font-size:24px; font-weight:800; color:var(--text-primary); margin-bottom:12px;">Henüz Paylaşım Yok</h3>
          <p style="color:var(--text-secondary); font-size:18px;">Aradığınız kriterde henüz bir materyal bulunmuyor.</p>
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
             <div style="width:40px; height:40px; background:linear-gradient(135deg, var(--brand-green), #002514); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:900; box-shadow:0 2px 8px rgba(0,69,38,0.15);">${post.authorName[0]}</div>
             <div>
               <div style="font-size:14px; font-weight:800; color:var(--text-primary); line-height:1.2;">${post.authorName}</div>
               <div style="font-size:11px; color:var(--text-muted); font-weight:600;">${new Date(post.createdAt).toLocaleDateString('tr-TR')} · ${post.grade || 'Genel'}</div>
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
            <span style="font-weight:800; margin-right:6px;">${post.authorName}</span>
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
      <header class="forum-header" style="background:linear-gradient(to bottom, #f0fdf4 0%, white 100%); border-bottom:1px solid var(--border); padding:100px 5% 80px; text-align:center; position:relative; overflow:hidden;">
        <!-- Subtle floating orbs for forum -->
        <div class="blur-orb" style="top:-50px; right:-50px; width:300px; height:300px; background:rgba(5, 150, 105, 0.08);"></div>
        <div class="blur-orb" style="bottom:20%; left:5%; width:250px; height:250px; background:rgba(0, 69, 38, 0.05); animation-delay: -3s;"></div>
        
        <div style="position:relative; z-index:2;">
          <h2 style="font-size:48px; font-weight:900; color:var(--brand-green); margin-bottom:16px; letter-spacing:-2px; line-height:1.1;">Öğretmen Forumu</h2>
          <p style="color:var(--text-secondary); max-width:700px; margin:0 auto; font-size:18px; line-height:1.6; font-weight:500;">Branşdaşlarınızla materyal paylaşın, güncel müfredata uygun içeriklere ulaşın ve deneyimlerinizi aktarın.</p>
          
          <div class="stories-container" style="display:flex; gap:16px; overflow-x:auto; padding:20px 0; max-width:640px; margin:24px auto 0; scrollbar-width:none; -ms-overflow-style:none;">
            <style>
              .stories-container::-webkit-scrollbar { display: none; }
              .filter-story .story-ring { background: var(--border); }
              .filter-story.active .story-ring { background: linear-gradient(45deg, var(--brand-green), #10b981); }
            </style>
            ${gradeGroups.map(g => `
              <div class="filter-story ${currentFilter === g.id ? 'active' : ''}" data-filter="${g.id}" style="display:flex; flex-direction:column; align-items:center; gap:8px; cursor:pointer; min-width:72px;">
                <div class="story-ring" style="width:68px; height:68px; border-radius:50%; padding:3px; transition:all 0.3s; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
                  <div style="width:100%; height:100%; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white;">
                    ${g.icon ? `<div style="color:${currentFilter === g.id ? 'var(--brand-green)' : 'var(--text-muted)'}; transition:color 0.3s;">${icon(g.icon, 28)}</div>` : `<div style="font-size:22px; font-weight:900; color:${currentFilter === g.id ? 'var(--brand-green)' : 'var(--text-muted)'}; transition:color 0.3s;">${g.label[0]}</div>`}
                  </div>
                </div>
                <span style="font-size:11px; font-weight:${currentFilter === g.id ? '800' : '600'}; color:${currentFilter === g.id ? 'var(--brand-green)' : 'var(--text-secondary)'}; text-align:center; max-width:80px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${g.label}</span>
              </div>
            `).join('')}
          </div>
  
          <div class="tag-filters" style="display:flex; justify-content:center; gap:8px; margin-top:20px; flex-wrap:wrap; max-width:800px; margin-left:auto; margin-right:auto;">
            ${forumTags.map(t => `
              <button class="tag-filter-btn ${currentTag === t ? 'active' : ''}" data-tag="${t}" style="font-size:11px; font-weight:700; padding:6px 16px; border-radius:100px; border:1px solid var(--border); background:${currentTag === t ? 'var(--text-primary)' : 'white'}; color:${currentTag === t ? 'white' : 'var(--text-secondary)'}; cursor:pointer; transition:all 0.2s;">#${t}</button>
            `).join('')}
            ${currentTag !== 'all' ? `<button class="tag-filter-btn" data-tag="all" style="font-size:11px; font-weight:700; padding:6px 12px; border-radius:100px; border:none; background:none; color:var(--text-muted); cursor:pointer; text-decoration:underline;">Sıfırla</button>` : ''}
          </div>
        </div>
      </header>

      <section class="forum-grid-section" style="padding:100px 5%; background: 
        radial-gradient(at 0% 0%, rgba(0, 69, 38, 0.08) 0px, transparent 50%), 
        radial-gradient(at 50% 0%, rgba(5, 150, 105, 0.05) 0px, transparent 50%), 
        radial-gradient(at 100% 0%, rgba(0, 69, 38, 0.08) 0px, transparent 50%), 
        radial-gradient(at 50% 50%, rgba(236, 253, 245, 0.5) 0px, transparent 50%), 
        radial-gradient(at 0% 100%, rgba(5, 150, 105, 0.08) 0px, transparent 50%), 
        radial-gradient(at 100% 100%, rgba(0, 69, 38, 0.08) 0px, transparent 50%),
        #f8fafc; position:relative; overflow:hidden;">
        
        <!-- Decorative blurred orbs for even more depth -->
        <div style="position:absolute; top:15%; left:5%; width:500px; height:500px; background:var(--brand-green-soft); border-radius:50%; filter:blur(120px); opacity:0.7; z-index:0; pointer-events:none;"></div>
        <div style="position:absolute; bottom:10%; right:5%; width:450px; height:450px; background:rgba(5,150,105,0.12); border-radius:50%; filter:blur(100px); opacity:0.5; z-index:0; pointer-events:none;"></div>
        
        <div id="forum-posts-grid" style="display:flex; flex-direction:column; align-items:center; width:100%; position:relative; z-index:1;">
          ${renderPostsHtml(getFilteredPosts())}
        </div>
      </section>
    </div>
  `;

  return { 
    html,
    init: (el, navigateFn) => {
      const grid = el.querySelector('#forum-posts-grid');
      const filterBtns = el.querySelectorAll('.filter-btn');

      const updateUI = () => {
        const filtered = getFilteredPosts();
        grid.style.opacity = '0';
        setTimeout(() => {
          grid.innerHTML = renderPostsHtml(filtered);
          grid.style.opacity = '1';
          attachCardEvents();
        }, 200);

        // Update Filter Buttons (Stories)
        el.querySelectorAll('.filter-story').forEach(b => {
          const isActive = b.dataset.filter === currentFilter;
          if (isActive) {
            b.classList.add('active');
            b.querySelector('span').style.fontWeight = '800';
            b.querySelector('span').style.color = 'var(--brand-green)';
            if(b.querySelector('div > div > div')) b.querySelector('div > div > div').style.color = 'var(--brand-green)';
          } else {
            b.classList.remove('active');
            b.querySelector('span').style.fontWeight = '600';
            b.querySelector('span').style.color = 'var(--text-secondary)';
            if(b.querySelector('div > div > div')) b.querySelector('div > div > div').style.color = 'var(--text-muted)';
          }
        });

        // Update Tag Buttons
        el.querySelectorAll('.tag-filter-btn').forEach(tb => {
          if (tb.innerText === 'Sıfırla') return;
          const isActive = tb.dataset.tag === currentTag;
          tb.style.background = isActive ? 'var(--text-primary)' : 'white';
          tb.style.color = isActive ? 'white' : 'var(--text-secondary)';
        });
      };

      const attachCardEvents = () => {
        el.querySelectorAll('.social-post-card').forEach(card => {
          card.onclick = (e) => {
            if (e.target.classList.contains('tag-link')) {
              e.stopPropagation();
              currentTag = e.target.dataset.tag;
              updateUI();
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

      el.querySelectorAll('.filter-story').forEach(btn => {
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
