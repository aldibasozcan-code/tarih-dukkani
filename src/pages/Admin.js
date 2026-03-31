import { getPendingPosts, getAllApprovedPostsAdmin, approvePost, rejectPost, updatePost } from '../store/publicData.js';
import { addNotification } from '../store/store.js';
import { icon } from '../components/icons.js';
import { openModal, closeModal, showConfirm } from '../components/modal.js';

let pendingPosts = [];
let approvedPosts = [];
let currentTab = 'pending'; // 'pending' or 'approved'
let isLoading = false;

export async function renderAdmin(navigate) {
  // Shell HTML
  const html = `
    <div id="admin-dashboard-container" class="fade-in" style="padding:24px; max-width:1200px; margin:0 auto;">
      <div id="admin-header-area"></div>
      <div id="admin-tabs-area"></div>
      <div id="admin-content-area">
        <div style="text-align:center; padding:100px; color:var(--text-muted);">
          <div class="spinner" style="margin:0 auto 16px;"></div>
          Yükleniyor...
        </div>
      </div>
    </div>
  `;

  return {
    html,
    init: (el, navFn) => {
      updateView(el, navFn);
    }
  };
}

async function updateView(el, navFn) {
  const container = el.querySelector('#admin-dashboard-container');
  if (!container) return;

  const headerArea = container.querySelector('#admin-header-area');
  const tabsArea = container.querySelector('#admin-tabs-area');
  const contentArea = container.querySelector('#admin-content-area');

  isLoading = true;
  // Fetch data
  pendingPosts = await getPendingPosts();
  approvedPosts = await getAllApprovedPostsAdmin();
  isLoading = false;

  const activePosts = currentTab === 'pending' ? pendingPosts : approvedPosts;

  // Render Header
  headerArea.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
      <h2 style="font-size:24px; font-weight:800; color:var(--text-primary);">Kontrol Merkezi (Moderasyon)</h2>
      <div style="display:flex; gap:8px;">
        <span class="badge badge-warning" style="font-size:14px;">${pendingPosts.length} Bekleyen</span>
        <span class="badge badge-success" style="font-size:14px;">${approvedPosts.length} Yayında</span>
      </div>
    </div>
  `;

  // Render Tabs
  tabsArea.innerHTML = `
    <div class="tabs" style="margin-bottom:24px;">
      <button class="tab-btn ${currentTab === 'pending' ? 'active' : ''}" data-tab="pending">
        Onay Bekleyenler
      </button>
      <button class="tab-btn ${currentTab === 'approved' ? 'active' : ''}" data-tab="approved">
        Yayınlanmış İçerikler
      </button>
    </div>
  `;

  // Render Content
  contentArea.innerHTML = activePosts.length === 0 ? `
    <div style="text-align:center; padding:60px 20px; background:white; border-radius:var(--radius-lg); border:1px solid var(--border);">
       <div style="color:var(--text-muted); font-size:48px; margin-bottom:16px; display:flex; justify-content:center;">${icon('layers', 48)}</div>
       <h3 style="font-size:20px; font-weight:700; color:var(--text-primary); margin-bottom:8px;">İçerik Bulunamadı</h3>
       <p style="color:var(--text-secondary);">Bu kategoride henüz bir içerik bulunmuyor.</p>
    </div>
  ` : `
    <div class="table-container" style="background:white; border-radius:var(--radius-xl); border:1px solid var(--border); overflow:hidden; box-shadow:var(--shadow-sm);">
      <table class="table" style="width:100%; border-collapse:collapse; background:white;">
         <thead style="background:var(--bg-secondary); text-align:left; border-bottom:1px solid var(--border);">
           <tr>
             <th style="padding:20px; font-weight:700; color:var(--text-secondary); width:100px;">Tür</th>
             <th style="padding:20px; font-weight:700; color:var(--text-secondary); width:200px;">Yazar</th>
             <th style="padding:20px; font-weight:700; color:var(--text-secondary);">İçerik Başlığı</th>
             <th style="padding:20px; font-weight:700; color:var(--text-secondary); width:120px;">Tarih</th>
             <th style="padding:20px; font-weight:700; color:var(--text-secondary); text-align:right; width:220px;">İşlemler</th>
           </tr>
         </thead>
         <tbody>
           ${activePosts.map((post, index) => `
             <tr style="border-bottom:1px solid var(--border); transition:var(--transition);" onmouseover="this.style.background='#f8fbf9'" onmouseout="this.style.background='white'">
               <td style="padding:20px;">
                 <span class="badge ${post.type === 'forum' ? 'badge-primary' : 'badge-info'}" style="text-transform:uppercase; font-size:10px; font-weight:800; letter-spacing:0.5px;">${post.type === 'forum' ? 'Forum' : 'Blog'}</span>
                 <div style="font-size:11px; margin-top:6px; color:var(--brand-green); font-weight:700;">${post.category}</div>
               </td>
               <td style="padding:20px;">
                 <div style="font-weight:700; color:var(--text-primary);">${post.authorName}</div>
                 <div style="font-size:12px; color:var(--text-muted);">${post.authorEmail || ''}</div>
               </td>
               <td style="padding:20px;">
                 <div style="font-weight:700; color:var(--text-primary); margin-bottom:4px; line-height:1.4;">${post.title}</div>
                 <div style="font-size:12px; color:var(--text-secondary); max-width:400px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${post.summary || post.content.substring(0,60) || ''}</div>
               </td>
               <td style="padding:20px; color:var(--text-secondary); font-size:13px;">
                 ${new Date(post.createdAt).toLocaleDateString('tr-TR')}
               </td>
               <td style="padding:20px; text-align:right;">
                 <div style="display:flex; justify-content:flex-end; gap:8px;">
                   ${currentTab === 'pending' ? `
                     <button class="btn btn-ghost btn-sm btn-approve" data-id="${post.id}" style="color:var(--brand-green); font-weight:800;">Onayla</button>
                   ` : ''}
                   <button class="btn btn-ghost btn-sm btn-edit" data-index="${index}" style="color:var(--info); font-weight:800;">Düzenle</button>
                   <button class="btn btn-ghost btn-sm btn-delete" data-id="${post.id}" style="color:var(--danger); font-weight:800;">Sil</button>
                 </div>
               </td>
             </tr>
           `).join('')}
         </tbody>
      </table>
    </div>
  `;

  // Attach Events
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      if (currentTab === btn.dataset.tab) return;
      currentTab = btn.dataset.tab;
      updateView(el, navFn);
    };
  });

  container.querySelectorAll('.btn-approve').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      showConfirm({
        title: 'Yayına Al',
        message: 'Bu içeriği onaylayıp yayına almak istediğinize emin misiniz?',
        confirmText: 'Yayınla',
        onConfirm: async () => {
          try {
            await approvePost(id);
            addNotification({ type: 'success', text: 'İçerik başarıyla yayınlandı!', link: 'admin' });
            updateView(el, navFn);
          } catch (e) { alert(e.message); }
        }
      });
    };
  });

  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.onclick = () => {
      const index = parseInt(btn.dataset.index);
      const post = activePosts[index];
      openEditPostModal(post, el, navFn);
    };
  });

  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      showConfirm({
        title: 'Kalıcı Olarak Sil',
        message: 'Bu içeriği silmek üzeresiniz. Bu işlem geri alınamaz!',
        confirmText: 'Evet, Sil',
        type: 'danger',
        onConfirm: async () => {
          try {
            await rejectPost(id);
            addNotification({ type: 'info', text: 'İçerik silindi.', link: 'admin' });
            updateView(el, navFn);
          } catch (e) { alert(e.message); }
        }
      });
    };
  });
}

function openEditPostModal(post, rootEl, navFn) {
  openModal({
    title: 'Paylaşımı Düzenle',
    size: 'lg',
    body: `
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:16px;">
        <div class="form-group">
          <label>İçerik Türü</label>
          <select id="edit-type">
            <option value="forum" ${post.type === 'forum' ? 'selected' : ''}>Forum Materyali</option>
            <option value="blog" ${post.type === 'blog' ? 'selected' : ''}>Eğitim Bloğu / Yazı</option>
          </select>
        </div>
        <div class="form-group">
          <label>Kategori</label>
          <input type="text" id="edit-category" value="${post.category || ''}" placeholder="Örn: LGS, YKS, TYT...">
        </div>
      </div>
      <div class="form-group">
        <label>Başlık</label>
        <input type="text" id="edit-title" value="${post.title || ''}" placeholder="İçerik başlığı">
      </div>
      <div class="form-group">
        <label>Kısa Özet</label>
        <textarea id="edit-summary" rows="2" style="padding:12px; font-size:14px;">${post.summary || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Ana İçerik</label>
        <textarea id="edit-content" rows="12" style="padding:12px; font-size:14px; font-family:inherit; line-height:1.6;">${post.content || ''}</textarea>
      </div>
    `,
    footer: `
      <button class="btn btn-secondary" id="edit-cancel">Vazgeç</button>
      <button class="btn btn-primary" id="edit-save">${icon('save', 14)} Güncellemeleri Kaydet</button>
    `
  });

  document.getElementById('edit-cancel').onclick = closeModal;
  document.getElementById('edit-save').onclick = async () => {
    const btn = document.getElementById('edit-save');
    const data = {
      title: document.getElementById('edit-title').value.trim(),
      summary: document.getElementById('edit-summary').value.trim(),
      content: document.getElementById('edit-content').value.trim(),
      category: document.getElementById('edit-category').value.trim(),
      type: document.getElementById('edit-type').value,
    };

    if (!data.title || !data.content) {
      alert("Başlık ve içeriği doldurmanız gerekiyor.");
      return;
    }

    btn.disabled = true;
    btn.innerHTML = "Kaydediliyor...";

    try {
      await updatePost(post.id, data);
      closeModal();
      addNotification({ type: 'success', text: 'İçerik başarıyla güncellendi.', link: 'admin' });
      updateView(rootEl, navFn);
    } catch (e) {
      btn.disabled = false;
      btn.innerHTML = `${icon('save', 14)} Güncellemeleri Kaydet`;
      alert("Hata: " + e.message);
    }
  };
}
