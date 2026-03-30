import { openModal, closeModal } from '../../components/modal.js';
import { submitPost } from '../../store/publicData.js';
import { addNotification } from '../../store/store.js';

export function openSubmitPostModal(defaultType = 'forum') {
  openModal({
    title: 'Yeni İçerik Paylaş',
    size: 'lg',
    body: `
      <div class="form-group">
        <label>Yayınlanacak Yer</label>
        <select id="post-type" class="form-control">
          <option value="forum" ${defaultType === 'forum' ? 'selected' : ''}>Öğretmen Forumu</option>
          <option value="blog" ${defaultType === 'blog' ? 'selected' : ''}>Eğitim Bloğu</option>
        </select>
      </div>
      <div class="form-group">
        <label>Kategori</label>
        <input type="text" id="post-category" class="form-control" placeholder="Örn: Pedagoji, YKS, Materyal vb.">
      </div>
      <div class="form-group">
        <label>Başlık</label>
        <input type="text" id="post-title" class="form-control" placeholder="İçeriğinizin başlığı">
      </div>
      <div class="form-group">
        <label>Kısa Özet</label>
        <textarea id="post-summary" class="form-control" rows="2" placeholder="Listeleme ekranında görülecek kısa açıklama..."></textarea>
      </div>
      <div class="form-group">
        <label>İçerik (Makale/Soru)</label>
        <textarea id="post-content" class="form-control" rows="6" placeholder="Detaylı içeriğinizi buraya yazın..."></textarea>
      </div>
      <div style="background:var(--brand-green-soft); color:var(--brand-green); padding:12px 16px; border-radius:var(--radius-md); font-size:13px; font-weight:600; margin-top:20px; display:flex; align-items:center; gap:8px;">
        <svg style="width:16px;height:16px;flex-shrink:0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Gönderilen yazılar yönetici (moderatör) onayından geçtikten sonra herkese açık olarak yayınlanacaktır.
      </div>
    `,
    footer: `
      <button class="btn btn-secondary" onclick="document.getElementById('modal-container').innerHTML=''">İptal</button>
      <button class="btn btn-primary" id="btn-submit-post">Onaya Gönder</button>
    `,
    onClose: () => {}
  });

  const submitBtn = document.getElementById('btn-submit-post');
  submitBtn.addEventListener('click', async () => {
    const type = document.getElementById('post-type').value;
    const category = document.getElementById('post-category').value.trim();
    const title = document.getElementById('post-title').value.trim();
    const summary = document.getElementById('post-summary').value.trim();
    const content = document.getElementById('post-content').value.trim();

    if (!title || !content || !category) {
      alert("Lütfen Kategori, Başlık ve İçerik alanlarını doldurunuz.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Gönderiliyor...';

    try {
      await submitPost({ type, category, title, summary, content });
      addNotification({
        type: 'success',
        text: 'İçeriğiniz başarıyla iletildi. Moderatör onayından sonra yayınlanacaktır.',
        link: 'dashboard'
      });
      closeModal();
    } catch (error) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Onaya Gönder';
      alert('Hata: ' + error.message);
    }
  });
}
