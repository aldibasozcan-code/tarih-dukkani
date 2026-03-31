import { icon } from '../components/icons.js';
import { getApprovedPosts, seedInitialData } from '../store/publicData.js';
import { auth } from '../lib/firebase.js';

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
        <div style="grid-column: 1 / -1; text-align:center; padding:100px 20px;">
          <div style="color:var(--brand-green-soft); margin-bottom:20px;">${icon('courses', 64)}</div>
          <h3 style="font-size:24px; font-weight:800; color:var(--text-primary); margin-bottom:12px;">Henüz Paylaşım Yok</h3>
          <p style="color:var(--text-secondary); font-size:18px;">Aradığınız kriterde henüz bir materyal bulunmuyor.</p>
        </div>
      `;
    }

    return posts.map((post, i) => {
      const isNew = (Date.now() - post.createdAt) < (1000 * 60 * 60 * 24);
      return `
      <div class="forum-card stagger-${i}" data-id="${post.id}" style="background:white; border:1px solid var(--border); border-radius:var(--radius-xl); padding:32px; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; transition:var(--transition); cursor:pointer; position:relative;" onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='var(--shadow-lg)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm)'">
        ${isNew ? `<div style="position:absolute; top:20px; right:20px; background:var(--danger); color:white; font-size:10px; font-weight:900; padding:4px 8px; border-radius:4px; text-transform:uppercase; z-index:2;">YENİ</div>` : ''}
        
        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px;">
           <span style="font-size:10px; text-transform:uppercase; font-weight:800; letter-spacing:1px; background:var(--brand-green-soft); color:var(--brand-green); padding:4px 10px; border-radius:4px;">${post.grade || 'Genel'}</span>
           <span style="font-size:10px; text-transform:uppercase; font-weight:800; letter-spacing:1px; background:var(--bg-secondary); color:var(--text-secondary); padding:4px 10px; border-radius:4px;">${post.category}</span>
        </div>

        <h3 style="font-size:20px; font-weight:800; margin-bottom:12px; line-height:1.4; color:var(--text-primary);">${post.title}</h3>
        
        ${post.topic ? `
          <div style="font-size:13px; color:var(--brand-green); font-weight:700; margin-bottom:16px; display:flex; align-items:center; gap:6px;">
            ${icon('book', 14)} ${post.topic}
          </div>
        ` : ''}

        <p style="font-size:14px; color:var(--text-secondary); line-height:1.6; margin-bottom:24px; flex:1;">${post.summary || post.content.substring(0,120) + '...'}</p>
        
        ${post.tags && post.tags.length > 0 ? `
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:20px;">
            ${post.tags.map(t => `<span class="tag-link" data-tag="${t}" style="font-size:10px; color:var(--brand-green); font-weight:700; background:rgba(0,102,51,0.05); padding:3px 8px; border-radius:4px; transition:all 0.2s;">#${t}</span>`).join('')}
          </div>
        ` : ''}

        <div style="border-top:1px solid var(--border); padding-top:20px; display:flex; align-items:center; justify-content:space-between; margin-top:auto;">
           <div style="display:flex; align-items:center; gap:10px;">
             <div style="width:36px; height:36px; background:var(--brand-green); color:white; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800;">${post.authorName[0]}</div>
             <div>
               <div style="font-size:13px; font-weight:800; color:var(--text-primary);">${post.authorName}</div>
               <div style="font-size:11px; color:var(--text-muted);">${new Date(post.createdAt).toLocaleDateString('tr-TR')}</div>
             </div>
           </div>
           <div style="color:var(--brand-green);">${icon('chevronRight', 20)}</div>
        </div>
      </div>
      `;
    }).join('');
  }

  const html = `
    <div class="fade-in">
      <header class="forum-header" style="background:linear-gradient(to bottom, var(--bg-secondary) 0%, white 100%); border-bottom:1px solid var(--border); padding:80px 5%; text-align:center;">
        <h2 style="font-size:42px; font-weight:900; color:var(--text-primary); margin-bottom:16px; letter-spacing:-1px;">Öğretmen Forumu</h2>
        <p style="color:var(--text-secondary); max-width:700px; margin:0 auto; font-size:18px; line-height:1.6;">Branşdaşlarınızla materyal paylaşın, güncel müfredata uygun içeriklere ulaşın.</p>
        
        <div class="forum-filters" style="display:flex; justify-content:center; gap:10px; margin-top:40px; flex-wrap:wrap; max-width:1000px; margin-left:auto; margin-right:auto;">
          ${gradeGroups.map(g => `
            <button class="filter-btn ${currentFilter === g.id ? 'active' : ''}" data-filter="${g.id}" style="border-radius:12px; padding:12px 20px; font-weight:700; background:${currentFilter === g.id ? 'var(--brand-green)' : 'white'}; border:1px solid ${currentFilter === g.id ? 'var(--brand-green)' : 'var(--border)'}; color:${currentFilter === g.id ? 'white' : 'var(--text-primary)'}; cursor:pointer; display:flex; align-items:center; gap:8px; transition:all 0.2s ease; box-shadow:var(--shadow-sm);">
              ${g.icon ? icon(g.icon, 16) : ''}
              ${g.label}
            </button>
          `).join('')}
        </div>

        <div class="tag-filters" style="display:flex; justify-content:center; gap:8px; margin-top:20px; flex-wrap:wrap; max-width:800px; margin-left:auto; margin-right:auto;">
          <span style="font-size:12px; font-weight:700; color:var(--text-muted); align-self:center; margin-right:8px;">Etiketler:</span>
          <button class="tag-filter-btn ${currentTag === 'all' ? 'active' : ''}" data-tag="all" style="font-size:11px; font-weight:700; padding:6px 12px; border-radius:100px; border:1px solid var(--border); background:${currentTag === 'all' ? 'var(--brand-green)' : 'white'}; color:${currentTag === 'all' ? 'white' : 'var(--text-secondary)'}; cursor:pointer;">#tümü</button>
          ${forumTags.map(t => `
            <button class="tag-filter-btn ${currentTag === t ? 'active' : ''}" data-tag="${t}" style="font-size:11px; font-weight:700; padding:6px 12px; border-radius:100px; border:1px solid var(--border); background:${currentTag === t ? 'var(--brand-green)' : 'white'}; color:${currentTag === t ? 'white' : 'var(--text-secondary)'}; cursor:pointer;">#${t}</button>
          `).join('')}
        </div>
      </header>

      <div id="forum-posts-grid" style="padding:60px 5%; display:grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap:24px; max-width:1400px; margin:0 auto;">
        ${renderPostsHtml(getFilteredPosts())}
      </div>
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

        // Update Filter Buttons
        filterBtns.forEach(b => {
          const isActive = b.dataset.filter === currentFilter;
          b.style.background = isActive ? 'var(--brand-green)' : 'white';
          b.style.color = isActive ? 'white' : 'var(--text-primary)';
          b.style.borderColor = isActive ? 'var(--brand-green)' : 'var(--border)';
        });

        // Update Tag Buttons
        el.querySelectorAll('.tag-filter-btn').forEach(tb => {
          const isActive = tb.dataset.tag === currentTag;
          tb.style.background = isActive ? 'var(--brand-green)' : 'white';
          tb.style.color = isActive ? 'white' : 'var(--text-secondary)';
        });
      };

      const attachCardEvents = () => {
        el.querySelectorAll('.forum-card').forEach(card => {
          card.onclick = (e) => {
            if (e.target.classList.contains('tag-link')) {
              e.stopPropagation();
              currentTag = e.target.dataset.tag;
              updateUI();
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
