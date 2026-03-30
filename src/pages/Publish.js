import { icon } from '../components/icons.js';
import { submitPost, getMyPosts } from '../store/publicData.js';
import { addNotification } from '../store/store.js';
import { auth } from '../lib/firebase.js';

let myPosts = [];

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
          <h3 style="font-size:18px; font-weight:800; color:var(--text-primary); margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:12px;">Yeni İçerik Oluştur</h3>
          
          <div class="form-group mb-4">
            <label style="font-weight:700; color:var(--text-secondary); margin-bottom:8px; display:block; font-size:13px;">Yayınlanacak Yer</label>
            <select id="pub-type" class="form-control">
              <option value="forum">Öğretmen Forumu (Materyal/Test)</option>
              <option value="blog">Eğitim Bloğu (Makale/İnceleme)</option>
            </select>
          </div>
          
          <div class="form-group mb-4">
            <label style="font-weight:700; color:var(--text-secondary); margin-bottom:8px; display:block; font-size:13px;">Kategori / Branş</label>
            <input type="text" id="pub-category" class="form-control" placeholder="Örn: 8. Sınıf LGS, Pedagoji, YKS">
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
            <div>${auth.currentUser?.email === 'aldibasozcan@gmail.com' ? 'Yönetici olduğunuz için gönderdiğiniz içerikler <b>doğrudan yayınlanacaktır.</b>' : 'Gönderdiğiniz içerikler kalite kontrol (moderasyon) sürecinden geçtikten sonra açık sayfalarda onaylanarak yayınlanmaktadır.'}</div>
          </div>
          
          <button class="btn btn-primary" id="btn-submit-post" style="width:100%; padding:14px; font-size:15px; font-weight:800;">${auth.currentUser?.email === 'aldibasozcan@gmail.com' ? 'Hemen Yayınla' : 'Onaya Gönder'}</button>
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
                <div style="padding:16px; border:1px solid var(--border); border-radius:var(--radius-md); background:var(--bg-primary); display:flex; flex-direction:column; gap:8px;">
                  <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div style="font-weight:800; font-size:15px; color:var(--text-primary);">${post.title}</div>
                    <span class="badge ${post.status === 'approved' ? 'badge-success' : 'badge-warning'}" style="font-size:11px;">
                      ${post.status === 'approved' ? 'Yayında' : 'Onay Bekliyor'}
                    </span>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                    <div style="font-size:12px; color:var(--text-secondary); text-transform:uppercase; font-weight:700;">
                      ${post.type === 'forum' ? 'Forum' : 'Blog'} · ${post.category}
                    </div>
                    <div style="font-size:12px; color:var(--text-muted);">
                      ${new Date(post.createdAt).toLocaleDateString('tr-TR')}
                    </div>
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
      
      submitBtn.addEventListener('click', async () => {
        const type = el.querySelector('#pub-type').value;
        const category = el.querySelector('#pub-category').value.trim();
        const title = el.querySelector('#pub-title').value.trim();
        const summary = el.querySelector('#pub-summary').value.trim();
        const content = el.querySelector('#pub-content').value.trim();

        if (!title || !content || !category) {
          alert('Lütfen Kategori, Başlık ve İçerik alanlarını doldurunuz.');
          return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = 'İletiliyor...';

        try {
          await submitPost({ type, category, title, summary, content });
          const msg = auth.currentUser?.email === 'aldibasozcan@gmail.com' 
            ? 'İçeriğiniz yönetici yetkisiyle doğrudan yayınlandı!' 
            : 'İçerik başarıyla iletildi. Moderatör onayından sonra yayınlanacaktır.';
            
          addNotification({
            type: 'success',
            text: msg,
            link: 'publish'
          });
          
          // Clear form
          el.querySelector('#pub-category').value = '';
          el.querySelector('#pub-title').value = '';
          el.querySelector('#pub-summary').value = '';
          el.querySelector('#pub-content').value = '';
          
          navigate('publish'); // Refresh page
        } catch (error) {
           submitBtn.disabled = false;
           submitBtn.innerHTML = 'Onaya Gönder';
           alert('Hata: ' + error.message);
        }
      });
    }
  };
}
