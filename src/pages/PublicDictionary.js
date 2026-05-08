import { icon } from '../components/icons.js';
import { getApprovedPosts, submitPost } from '../store/publicData.js';
import { openModal, closeModal } from '../components/modal.js';
import { addNotification } from '../store/store.js';
import { auth } from '../lib/firebase.js';

export async function renderPublicDictionary(navigate) {
  let allEntries = await getApprovedPosts('sozluk');
  let currentTerm = null;

  // Group by title (term)
  const groupedTerms = {};
  allEntries.forEach(entry => {
    const term = entry.title;
    if (!groupedTerms[term]) groupedTerms[term] = [];
    groupedTerms[term].push(entry);
  });

  // Sort terms by latest activity
  const sortedTerms = Object.keys(groupedTerms).sort((a, b) => {
    const latestA = Math.max(...groupedTerms[a].map(e => e.createdAt));
    const latestB = Math.max(...groupedTerms[b].map(e => e.createdAt));
    return latestB - latestA;
  });

  if (!currentTerm && sortedTerms.length > 0) {
    currentTerm = sortedTerms[0];
  }

  function renderSidebar() {
    return `
      <div style="background:white; border-radius:var(--radius-lg); border:1px solid var(--border); overflow:hidden; box-shadow:var(--shadow-sm); position:sticky; top:100px;">
        <div style="padding:20px; border-bottom:1px solid var(--border); background:var(--bg-secondary); display:flex; align-items:center; justify-content:space-between;">
          <h3 style="font-weight:800; font-size:16px; color:var(--text-primary); margin:0;">Gündem / Kavramlar</h3>
        </div>
        <div class="dictionary-term-list" style="max-height:calc(100vh - 200px); overflow-y:auto;">
          ${sortedTerms.length === 0 ? `<div style="padding:20px; color:var(--text-muted); text-align:center; font-size:13px;">Henüz başlık yok.</div>` : ''}
          ${sortedTerms.map(term => `
            <div class="dict-term-item ${currentTerm === term ? 'active' : ''}" data-term="${term}" style="padding:16px 20px; cursor:pointer; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; transition:background 0.2s; ${currentTerm === term ? 'background:rgba(5, 150, 105, 0.05); border-left:4px solid var(--brand-green);' : 'border-left:4px solid transparent;'}">
              <span style="font-weight:${currentTerm === term ? '800' : '600'}; color:${currentTerm === term ? 'var(--brand-green)' : 'var(--text-primary)'}; font-size:14px; line-height:1.4;">${term}</span>
              <span style="font-size:11px; font-weight:800; color:white; background:${currentTerm === term ? 'var(--brand-green)' : 'var(--text-muted)'}; padding:2px 8px; border-radius:100px;">${groupedTerms[term].length}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderEntries() {
    if (!currentTerm) {
      return `
        <div style="text-align:center; padding:100px 20px; background:white; border-radius:var(--radius-lg); border:1px solid var(--border);">
           <div style="color:var(--brand-green-soft); margin-bottom:20px;">${icon('book', 64)}</div>
           <h3 style="font-size:24px; font-weight:800; color:var(--text-primary); margin-bottom:12px;">Eğitim Sözlüğü</h3>
           <p style="color:var(--text-secondary); font-size:16px;">Öğretmenlerin bilgi ve deneyimlerini paylaştığı imece sözlüğe hoş geldiniz.</p>
        </div>
      `;
    }

    const entries = groupedTerms[currentTerm] || [];
    // Sort entries by date (oldest first, like ekşi sözlük)
    entries.sort((a, b) => a.createdAt - b.createdAt);

    return `
      <div style="margin-bottom:24px; padding-bottom:16px; border-bottom:2px solid var(--brand-green);">
        <h2 style="font-size:32px; font-weight:900; color:var(--brand-green); letter-spacing:-1px; margin:0;">${currentTerm}</h2>
      </div>
      
      <div style="display:flex; flex-direction:column; gap:20px;">
        ${entries.map((entry, idx) => `
          <div class="fade-in-up" style="background:white; border-radius:var(--radius-lg); border:1px solid var(--border); padding:24px; box-shadow:var(--shadow-sm); animation-delay:${idx*0.05}s; position:relative; overflow:hidden;">
            ${entry.isQuestion ? `
              <div style="position:absolute; top:0; left:0; right:0; height:4px; background:var(--warning);"></div>
              <div style="position:absolute; top:16px; right:16px; color:var(--warning); background:rgba(245, 158, 11, 0.1); padding:4px 12px; border-radius:100px; font-size:11px; font-weight:800; display:flex; align-items:center; gap:6px;">
                ${icon('helpCircle', 14)} Soru
              </div>
            ` : ''}
            
            <div style="font-size:15px; color:var(--text-primary); line-height:1.7; margin-bottom:20px; white-space:pre-wrap;">${entry.content}</div>
            
            <div style="display:flex; justify-content:space-between; align-items:flex-end; border-top:1px solid var(--border); padding-top:16px;">
              <div style="display:flex; gap:16px;">
                 <button class="btn-upvote" style="background:none; border:none; cursor:pointer; color:var(--text-muted); display:flex; align-items:center; gap:6px; font-size:13px; font-weight:700; transition:color 0.2s;" onmouseover="this.style.color='var(--brand-green)'" onmouseout="this.style.color='var(--text-muted)'">
                   ${icon('chevronUp', 16)} <span>${Math.floor(Math.random() * 50) + 5}</span>
                 </button>
                 <button class="btn-downvote" style="background:none; border:none; cursor:pointer; color:var(--text-muted); display:flex; align-items:center; gap:6px; font-size:13px; font-weight:700; transition:color 0.2s;" onmouseover="this.style.color='var(--danger)'" onmouseout="this.style.color='var(--text-muted)'">
                   ${icon('chevronDown', 16)}
                 </button>
              </div>
              <div style="text-align:right;">
                 <div style="font-weight:800; color:var(--brand-green); font-size:14px; cursor:pointer;">${entry.authorName}</div>
                 <div style="font-size:11px; color:var(--text-muted); font-weight:600; margin-top:4px;">${new Date(entry.createdAt).toLocaleString('tr-TR')}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="margin-top:40px; padding-top:24px; border-top:1px dashed var(--border); text-align:center;">
        <button id="btn-add-entry-to-current" class="btn btn-secondary" style="border-radius:100px; padding:12px 24px; font-weight:800;">
          ${icon('edit', 16)} Bu kavrama sen de bir girdi yaz
        </button>
      </div>
    `;
  }

  const html = `
    <div class="fade-in" style="background:#f8fafc; min-height:100vh;">
      <!-- Header -->
      <header style="background:var(--brand-green); color:white; padding:100px 5% 40px; text-align:center; position:relative; overflow:hidden;">
        <div style="position:absolute; inset:0; opacity:0.1; background-image: url('https://www.transparenttextures.com/patterns/cubes.png');"></div>
        <div style="position:relative; z-index:2; max-width:1200px; margin:0 auto; display:flex; justify-content:space-between; align-items:flex-end;">
          <div style="text-align:left;">
            <h1 style="font-size:42px; font-weight:900; margin-bottom:8px; letter-spacing:-1px; display:flex; align-items:center; gap:16px;">
              ${icon('bookOpen', 42)} İmece Sözlük
            </h1>
            <p style="font-size:16px; color:rgba(255,255,255,0.8); font-weight:500;">Öğretmenlerin ortak bilgi ve deneyim havuzu</p>
          </div>
          <div>
            <button id="btn-new-term" class="btn" style="background:white; color:var(--brand-green); border-radius:100px; padding:14px 28px; font-weight:900; font-size:15px; box-shadow:0 8px 20px rgba(0,0,0,0.15); display:flex; align-items:center; gap:8px;">
              ${icon('plus', 18)} Kavram Gir / Soru Sor
            </button>
          </div>
        </div>
      </header>

      <!-- Main Layout -->
      <section style="max-width:1200px; margin:40px auto; padding:0 5%; display:grid; grid-template-columns: 300px 1fr; gap:40px; align-items:start;">
        <aside id="dict-sidebar">
          ${renderSidebar()}
        </aside>
        
        <main id="dict-content" style="min-height:500px;">
          ${renderEntries()}
        </main>
      </section>
    </div>
  `;

  return {
    html,
    init: (el, navigateFn) => {
      const updateUI = () => {
        el.querySelector('#dict-sidebar').innerHTML = renderSidebar();
        el.querySelector('#dict-content').innerHTML = renderEntries();
        attachEvents();
      };

      const attachEvents = () => {
        el.querySelectorAll('.dict-term-item').forEach(item => {
          item.onclick = () => {
            currentTerm = item.dataset.term;
            updateUI();
            window.scrollTo({ top: 300, behavior: 'smooth' });
          };
        });

        const btnAddEntry = el.querySelector('#btn-add-entry-to-current');
        if (btnAddEntry) {
          btnAddEntry.onclick = () => openSubmitModal(currentTerm);
        }

        // Voting buttons
        el.querySelectorAll('.btn-upvote, .btn-downvote').forEach(btn => {
          btn.onclick = (e) => {
            if (!auth.currentUser) {
              alert("Oy vermek için giriş yapmalısınız.");
              return;
            }
            const isUpvote = btn.classList.contains('btn-upvote');
            if (isUpvote) {
              const span = btn.querySelector('span');
              span.innerText = parseInt(span.innerText) + 1;
              btn.style.color = 'var(--brand-green)';
            } else {
              btn.style.color = 'var(--danger)';
            }
            btn.style.pointerEvents = 'none'; // Prevent multiple votes temporarily
          };
        });
      };

      const openSubmitModal = (initialTerm = '') => {
        if (!auth.currentUser) {
          openModal({
            title: 'Giriş Yapmanız Gerekiyor',
            size: 'sm',
            body: `
              <div style="text-align:center; padding:20px 0;">
                <div style="color:var(--brand-green); margin-bottom:16px;">${icon('lock', 48)}</div>
                <h3 style="font-size:20px; font-weight:800; color:var(--text-primary); margin-bottom:12px;">Yetkisiz İşlem</h3>
                <p style="color:var(--text-secondary); font-size:15px; line-height:1.5;">Sözlüğe katkıda bulunmak, kavram girmek veya soru sormak için öğretmen hesabınızla giriş yapmalısınız.</p>
              </div>
            `,
            footer: `
              <button class="btn btn-secondary" onclick="document.querySelector('.modal-overlay').remove()">İptal</button>
              <button class="btn btn-primary" id="btn-go-to-login">Giriş Yap</button>
            `
          });
          document.getElementById('btn-go-to-login').onclick = () => {
            closeModal();
            navigateFn('login');
          };
          return;
        }

        openModal({
          title: initialTerm ? 'Sözlüğe Katkıda Bulun' : 'Yeni Kavram / Soru',
          size: 'md',
          body: `
            <div class="form-group" style="margin-bottom:20px;">
              <label>Kavram Adı</label>
              <input type="text" id="dict-term-input" class="form-control" value="${initialTerm}" ${initialTerm ? 'readonly style="background:#f1f5f9; cursor:not-allowed;"' : 'placeholder="Örn: Yapılandırmacı Yaklaşım"'} />
            </div>
            <div class="form-group" style="margin-bottom:16px;">
              <label>Açıklama veya Sorunuz</label>
              <textarea id="dict-content-input" class="form-control" rows="6" placeholder="Kavramı açıklayın veya bu kavramla ilgili sorunuzu sorun..."></textarea>
            </div>
            <div style="display:flex; align-items:center; gap:8px; background:rgba(245, 158, 11, 0.05); padding:12px; border-radius:8px; border:1px solid rgba(245, 158, 11, 0.2);">
              <input type="checkbox" id="dict-is-question" style="width:18px; height:18px; accent-color:var(--warning); cursor:pointer;">
              <label for="dict-is-question" style="margin:0; font-weight:700; color:var(--text-primary); cursor:pointer;">Bu girdi bir sorudur (Bilenlerin cevaplamasını istiyorum)</label>
            </div>
          `,
          footer: `
            <button class="btn btn-secondary" id="btn-dict-cancel">İptal</button>
            <button class="btn btn-primary" id="btn-dict-submit">${icon('send', 16)} Moderatör Onayına Gönder</button>
          `
        });

        document.getElementById('btn-dict-cancel').onclick = closeModal;
        document.getElementById('btn-dict-submit').onclick = async () => {
          const btn = document.getElementById('btn-dict-submit');
          const title = document.getElementById('dict-term-input').value.trim();
          const content = document.getElementById('dict-content-input').value.trim();
          const isQuestion = document.getElementById('dict-is-question').checked;

          if (!title || !content) {
            alert('Kavram adı ve içeriği boş bırakılamaz.');
            return;
          }

          btn.disabled = true;
          btn.innerHTML = 'Gönderiliyor...';

          try {
            await submitPost({
              type: 'sozluk',
              title: title,
              content: content,
              isQuestion: isQuestion,
              category: isQuestion ? 'Soru' : 'Tanım/Açıklama'
            });
            
            closeModal();
            addNotification({ type: 'success', text: 'Sözlük girdiniz başarıyla alındı. Moderatör onayından sonra yayınlanacaktır.' });
          } catch (e) {
            btn.disabled = false;
            btn.innerHTML = 'Gönder';
            alert('Hata: ' + e.message);
          }
        };
      };

      el.querySelector('#btn-new-term').onclick = () => openSubmitModal();
      
      attachEvents();
    }
  };
}
