import { icon } from '../components/icons.js';
import { submitPost, getMyPosts, updatePost, deletePost } from '../store/publicData.js';
import { addNotification } from '../store/store.js';
import { auth } from '../lib/firebase.js';

let myPosts = [];
let editMode = false;
let editingPostId = null;

export async function renderPublish(navigate) {
  myPosts = await getMyPosts();

  const html = `
    <div class="fade-in" style="padding:24px; max-width:1200px; margin:0 auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <div>
          <h2 style="font-size:24px; font-weight:800; color:var(--text-primary); margin-bottom:4px;">İçerik Üretimi</h2>
          <p style="color:var(--text-secondary); font-size:14px;">Deneyimlerinizi ve materyallerinizi meslektaşlarınızla paylaşın.</p>
        </div>
        ${auth.currentUser?.email === 'aldibasozcan@gmail.com' ? `
          <div style="display:flex; align-items:center; gap:8px; background:var(--brand-green-soft); color:var(--brand-green); padding:8px 16px; border-radius:100px; font-weight:800; font-size:13px; border:1px solid var(--brand-green);">
            ${icon('checkCircle', 16)} Moderatör Yetkisi: Aktif
          </div>
        ` : ''}
      </div>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; align-items:start;">
        <!-- Left: Submit Form -->
        <div style="background:white; border-radius:var(--radius-lg); border:1px solid var(--border); padding:24px; box-shadow:var(--shadow-sm);">
          <h3 id="form-title" style="font-size:18px; font-weight:800; color:var(--text-primary); margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:12px;">Yeni İçerik Oluştur</h3>
          
          <div class="form-group mb-4">
            <label style="font-weight:700; color:var(--text-secondary); margin-bottom:8px; display:block; font-size:13px;">Yayınlanacak Yer</label>
            <select id="pub-type" class="form-control">
              <option value="forum">Öğretmen Forumu (Materyal/Test)</option>
              <option value="blog">Eğitim Bloğu (Makale/İnceleme)</option>
            </select>
          </div>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div class="form-group mb-4">
              <label style="font-weight:700; color:var(--text-secondary); margin-bottom:8px; display:block; font-size:13px;">Sınıf Seviyesi</label>
              <select id="pub-grade" class="form-control">
                <option value="">Seçiniz...</option>
                <option value="5. Sınıf">5. Sınıf</option>
                <option value="6. Sınıf">6. Sınıf</option>
                <option value="7. Sınıf">7. Sınıf</option>
                <option value="8. Sınıf">8. Sınıf (LGS)</option>
                <option value="9. Sınıf">9. Sınıf</option>
                <option value="10. Sınıf">10. Sınıf</option>
                <option value="11. Sınıf">11. Sınıf</option>
                <option value="12. Sınıf">12. Sınıf (YKS)</option>
                <option value="TYT-AYT">TYT-AYT / Karma</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>
            
          <div class="form-group mb-4">
            <label style="font-weight:700; color:var(--text-secondary); margin-bottom:8px; display:block; font-size:13px;">Kategori / Tür</label>
            <select id="pub-category" class="form-control">
              <option value="Konu Anlatımı">Konu Anlatımı / Özet</option>
              <option value="Yaprak Test">Yaprak Test / Deneme</option>
              <option value="Yazılı Hazırlık">Yazılı Hazırlık</option>
              <option value="Ders Sunumu">Ders Sunumu / Materyal</option>
              <option value="Rehberlik">Rehberlik / Motivasyon</option>
            </select>
          </div>
        </div>

          <div class="form-group mb-4">
            <label style="font-weight:700; color:var(--text-secondary); margin-bottom:8px; display:block; font-size:13px;">Konu / Ünite Adı</label>
            <input type="text" id="pub-topic" class="form-control" placeholder="Örn: Osmanlı Kuruluş, Milli Mücadele, 1. Ünite...">
          </div>
          
          <div class="form-group mb-4">
            <label style="font-weight:700; color:var(--text-secondary); margin-bottom:8px; display:block; font-size:13px;">Etiketler (En fazla 5 adet)</label>
            <div id="pub-tags-container" style="display:flex; flex-wrap:wrap; gap:8px; background:var(--bg-secondary); padding:12px; border-radius:var(--radius-md); border:1px solid var(--border); margin-bottom:12px;">
              <!-- Tags populated via JS -->
            </div>
            <div style="display:flex; gap:8px;">
               <input type="text" id="pub-custom-tag" class="form-control" placeholder="Yeni etiket yazın..." style="padding:8px 16px; font-size:13px;">
               <button type="button" id="btn-add-tag" class="btn btn-secondary" style="padding:8px 20px; font-size:13px; font-weight:800;">Ekle</button>
            </div>
          </div>
          
          <div class="form-group mb-4">
            <label style="font-weight:700; color:var(--text-secondary); margin-bottom:8px; display:block; font-size:13px;">Başlık</label>
            <input type="text" id="pub-title" class="form-control" placeholder="İçeriğinizin dikkat çekici başlığı">
          </div>
          
          <div class="form-group mb-4">
            <label style="font-weight:700; color:var(--text-secondary); margin-bottom:8px; display:block; font-size:13px;">Kısa Özet</label>
            <textarea id="pub-summary" class="form-control" rows="2" placeholder="Listeleme ekranında görünecek 1-2 cümlelik kısa açıklama..."></textarea>
          </div>
          
          <div class="form-group mb-4">
            <label style="font-weight:700; color:var(--text-secondary); margin-bottom:8px; display:block; font-size:13px;">İçerik</label>
            <textarea id="pub-content" class="form-control" rows="10" placeholder="Detaylı içeriğinizi, sorularınızı veya makalenizi buraya yazın..."></textarea>
          </div>
          
          <div style="background:var(--brand-green-soft); color:var(--brand-green); padding:16px; border-radius:var(--radius-md); font-size:13px; font-weight:600; margin-bottom:24px; display:flex; align-items:start; gap:12px; line-height:1.5;">
            <div style="margin-top:2px;">${icon('info', 18)}</div>
            <div id="status-hint">${auth.currentUser?.email === 'aldibasozcan@gmail.com' ? 'Yönetici olduğunuz için gönderdiğiniz içerikler <b>doğrudan yayınlanacaktır.</b>' : 'Gönderdiğiniz içerikler kalite kontrol (moderasyon) sürecinden geçtikten sonra açık sayfalarda onaylanarak yayınlanmaktadır.'}</div>
          </div>
          
          <div style="display:flex; gap:12px;">
            <button class="btn btn-secondary" id="btn-cancel-edit" style="display:none; flex:1; padding:14px; font-size:15px; font-weight:800;">Vazgeç</button>
            <button class="btn btn-primary" id="btn-submit-post" style="flex:2; padding:14px; font-size:15px; font-weight:800;">Onaya Gönder</button>
          </div>
        </div>

        <!-- Right: My Posts History -->
        <div style="background:white; border-radius:var(--radius-lg); border:1px solid var(--border); padding:24px; box-shadow:var(--shadow-sm);">
          <h3 style="font-size:18px; font-weight:800; color:var(--text-primary); margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:12px;">Yayınlarım & Geçmiş</h3>
          
          ${myPosts.length === 0 ? `
            <div style="text-align:center; padding:40px 20px;">
              <div style="color:var(--text-muted); margin-bottom:16px;">${icon('book', 48)}</div>
              <p style="color:var(--text-secondary); font-size:14px;">Henüz gönderilmiş bir içeriğiniz bulunmuyor.</p>
            </div>
          ` : `
            <div style="display:flex; flex-direction:column; gap:16px;">
              ${myPosts.map(post => `
                <div class="post-card" data-post-id="${post.id}" style="padding:16px; border:1px solid var(--border); border-radius:var(--radius-md); background:var(--bg-primary); display:flex; flex-direction:column; gap:8px;">
                  <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div style="font-weight:800; font-size:15px; color:var(--text-primary);">${post.title}</div>
                    <span class="badge ${post.status === 'approved' ? 'badge-success' : 'badge-warning'}" style="font-size:11px;">
                      ${post.status === 'approved' ? 'Yayında' : 'Onay Bekliyor'}
                    </span>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                      ${post.type === 'forum' ? 'Forum' : 'Blog'} · ${post.grade || ''} · ${post.category}
                    </div>
                    <div style="font-size:12px; color:var(--text-muted); font-style:italic;">
                      ${post.topic || ''}
                    </div>
                  </div>
                      ${new Date(post.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  ${post.tags && post.tags.length > 0 ? `
                    <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:8px;">
                      ${post.tags.map(t => `<span style="font-size:10px; color:var(--brand-green); font-weight:700; background:rgba(0,102,51,0.05); padding:2px 6px; border-radius:4px;">#${t}</span>`).join('')}
                    </div>
                  ` : ''}
                  <div style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:8px;">
                    <button class="btn btn-ghost btn-sm btn-edit-post" data-id="${post.id}" style="color:var(--text-secondary); font-weight:700; padding:4px 8px;">
                      ${icon('edit', 14)} Düzenle
                    </button>
                    <button class="btn btn-ghost btn-sm btn-delete-post" data-id="${post.id}" style="color:var(--danger); font-weight:700; padding:4px 8px;">
                      ${icon('trash', 14)} Sil
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  `;

  return {
    html,
    init: (el) => {
      const submitBtn = el.querySelector('#btn-submit-post');
      const cancelBtn = el.querySelector('#btn-cancel-edit');
      const formTitle = el.querySelector('#form-title');
      const statusHint = el.querySelector('#status-hint');
      
      const resetForm = () => {
        editMode = false;
        editingPostId = null;
        formTitle.innerHTML = 'Yeni İçerik Oluştur';
        submitBtn.innerHTML = auth.currentUser?.email === 'aldibasozcan@gmail.com' ? 'Hemen Yayınla' : 'Onaya Gönder';
        cancelBtn.style.display = 'none';
        el.querySelector('#pub-type').value = 'forum';
        updateCategoryOptions('forum');
        el.querySelector('#pub-grade').value = '';
        el.querySelector('#pub-topic').value = '';
        selectedTags = [];
        updateTagChips();
        el.querySelector('#pub-title').value = '';
        el.querySelector('#pub-summary').value = '';
        el.querySelector('#pub-content').value = '';
      };

      const forumCategories = [
        { val: 'Konu Anlatımı', label: 'Konu Anlatımı / Özet' },
        { val: 'Yaprak Test', label: 'Yaprak Test / Deneme' },
        { val: 'Yazılı Hazırlık', label: 'Yazılı Hazırlık' },
        { val: 'Ders Sunumu', label: 'Ders Sunumu / Materyal' },
        { val: 'Rehberlik', label: 'Rehberlik / Motivasyon' }
      ];

      const blogCategories = [
        { val: 'Akademik Makale', label: 'Akademik Makale' },
        { val: 'Pedagojik İnceleme', label: 'Pedagojik İnceleme' },
        { val: 'Eğitim Teknolojileri', label: 'Eğitim Teknolojileri (EdTech)' },
        { val: 'MEB Gündemi', label: 'MEB Gündemi & Mevzuat' },
        { val: 'Deneyim Paylaşımı', label: 'Deneyim Paylaşımı' }
      ];

      const updateCategoryOptions = (type, selectedVal = null) => {
        const catSelect = el.querySelector('#pub-category');
        const cats = type === 'blog' ? blogCategories : forumCategories;
        catSelect.innerHTML = cats.map(c => `<option value="${c.val}" ${selectedVal === c.val ? 'selected' : ''}>${c.label}</option>`).join('');
        
        // Also update tags when type changes
        selectedTags = [];
        updateTagChips();
      };

      el.querySelector('#pub-type').addEventListener('change', (e) => {
        updateCategoryOptions(e.target.value);
      });

      const forumTags = ['deneme', 'konuozeti', 'cikmissorular', 'mufredat', 'etkinlik', 'sunum', 'yazilihazirlik'];
      const blogTags = ['akademik', 'pedagoji', 'edtech', 'mebGundemi', 'rehberlik', 'inceleme', 'deneyim'];
      let selectedTags = [];

      const updateTagChips = (initialTags = null) => {
        const container = el.querySelector('#pub-tags-container');
        const type = el.querySelector('#pub-type').value;
        const baseTags = type === 'blog' ? blogTags : forumTags;
        
        if (initialTags !== null) {
          selectedTags = [...initialTags];
        }

        // Show predefined tags + any custom tags currently selected
        const allDisplayTags = [...new Set([...baseTags, ...selectedTags])];

        container.innerHTML = allDisplayTags.map(tag => {
          const isActive = selectedTags.includes(tag);
          return `
            <div class="tag-chip ${isActive ? 'active' : ''}" data-tag="${tag}" style="cursor:pointer; padding:6px 14px; border-radius:100px; font-size:12px; font-weight:700; border:1px solid ${isActive ? 'var(--brand-green)' : 'var(--border)'}; background:${isActive ? 'var(--brand-green)' : 'white'}; color:${isActive ? 'white' : 'var(--text-secondary)'}; transition:all 0.2s ease;">
              #${tag}
            </div>
          `;
        }).join('');

        container.querySelectorAll('.tag-chip').forEach(chip => {
          chip.onclick = () => {
            const tag = chip.dataset.tag;
            if (selectedTags.includes(tag)) {
              selectedTags = selectedTags.filter(t => t !== tag);
            } else {
              if (selectedTags.length >= 5) {
                 addNotification({ type: 'info', text: 'En fazla 5 etiket seçebilirsiniz.' });
                 return;
              }
              selectedTags.push(tag);
            }
            updateTagChips();
          };
        });
      };

      // Custom Tag Logic
      const addCustomTag = () => {
        const input = el.querySelector('#pub-custom-tag');
        const val = input.value.trim().toLowerCase().replace(/\s+/g, '-');
        if (!val) return;
        if (selectedTags.includes(val)) {
          input.value = '';
          return;
        }
        if (selectedTags.length >= 5) {
          addNotification({ type: 'info', text: 'En fazla 5 etiket seçebilirsiniz.' });
          return;
        }
        selectedTags.push(val);
        input.value = '';
        updateTagChips();
      };

      el.querySelector('#btn-add-tag').onclick = addCustomTag;
      el.querySelector('#pub-custom-tag').onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addCustomTag();
        }
      };

      updateTagChips(); // Initial run

      // Edit Mode Toggle
      el.querySelectorAll('.btn-edit-post').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.id;
          const post = myPosts.find(p => p.id === id);
          if (!post) return;

          editMode = true;
          editingPostId = id;
          formTitle.innerHTML = 'İçeriği Düzenle';
          submitBtn.innerHTML = 'Güncellemeleri Kaydet';
          cancelBtn.style.display = 'block';

          el.querySelector('#pub-type').value = post.type;
          updateCategoryOptions(post.type, post.category);
          el.querySelector('#pub-grade').value = post.grade || '';
          el.querySelector('#pub-topic').value = post.topic || '';
          updateTagChips(post.tags || []);
          el.querySelector('#pub-title').value = post.title;
          el.querySelector('#pub-summary').value = post.summary || '';
          el.querySelector('#pub-content').value = post.content;
          
          window.scrollTo({ top: 0, behavior: 'smooth' });
        };
      });

      cancelBtn.onclick = resetForm;

      // Delete logic
      el.querySelectorAll('.btn-delete-post').forEach(btn => {
        btn.onclick = async () => {
          const id = btn.dataset.id;
          if (!confirm('Bu içeriği silmek istediğinize emin misiniz?')) return;
          
          btn.disabled = true;
          btn.innerHTML = 'Siliniyor...';
          try {
            await deletePost(id);
            addNotification({ type: 'info', text: 'İçerik başarıyla silindi.', link: 'publish' });
            navigate('publish');
          } catch (error) {
            btn.disabled = false;
            btn.innerHTML = icon('trash', 14) + ' Sil';
            alert('Hata: ' + error.message);
          }
        };
      });

      submitBtn.addEventListener('click', async () => {
        const data = {
          type: el.querySelector('#pub-type').value,
          grade: el.querySelector('#pub-grade').value,
          category: el.querySelector('#pub-category').value,
          topic: el.querySelector('#pub-topic').value.trim(),
          tags: selectedTags,
          title: el.querySelector('#pub-title').value.trim(),
          summary: el.querySelector('#pub-summary').value.trim(),
          content: el.querySelector('#pub-content').value.trim()
        };

        if (!data.title || !data.content || !data.grade) {
          alert('Lütfen Sınıf Seviyesi, Başlık ve İçerik alanlarını doldurunuz.');
          return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = editMode ? 'Güncelleniyor...' : 'İletiliyor...';

        try {
          if (editMode && editingPostId) {
            await updatePost(editingPostId, data);
            addNotification({
              type: 'success',
              text: 'İçerik başarıyla güncellendi.',
              link: 'publish'
            });
          } else {
            await submitPost(data);
            const isAdmin = auth.currentUser?.email === 'aldibasozcan@gmail.com';
            const msg = isAdmin ? 'İçeriğiniz yönetici yetkisiyle doğrudan yayınlandı!' : 'İçerik başarıyla iletildi. Moderatör onayından sonra yayınlanacaktır.';
            addNotification({ type: 'success', text: msg, link: 'publish' });
          }
          resetForm();
          navigate('publish'); // Refresh
        } catch (error) {
           submitBtn.disabled = false;
           submitBtn.innerHTML = editMode ? 'Güncellenmeleri Kaydet' : (auth.currentUser?.email === 'aldibasozcan@gmail.com' ? 'Hemen Yayınla' : 'Onaya Gönder');
           alert('Hata: ' + error.message);
        }
      });
    }
  };
}
