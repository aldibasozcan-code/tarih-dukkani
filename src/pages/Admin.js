import { getPendingPosts, approvePost, rejectPost } from '../store/publicData.js';
import { addNotification } from '../store/store.js';
import { icon } from '../components/icons.js';

let pendingPosts = [];

export async function renderAdmin(navigate) {
  pendingPosts = await getPendingPosts();
  
  const html = `
    <div class="fade-in" style="padding:24px; max-width:1200px; margin:0 auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <h2 style="font-size:24px; font-weight:800; color:var(--text-primary);">Kontrol Merkezi (Moderasyon)</h2>
        <span class="badge badge-warning" style="font-size:14px;">Bekleyen Gönderi: ${pendingPosts.length}</span>
      </div>
      
      ${pendingPosts.length === 0 ? `
        <div style="text-align:center; padding:60px 20px; background:white; border-radius:var(--radius-lg); border:1px solid var(--border);">
           <div style="color:var(--text-muted); font-size:48px; margin-bottom:16px; display:flex; justify-content:center;">${icon('checkCircle', 48)}</div>
           <h3 style="font-size:20px; font-weight:700; color:var(--text-primary); margin-bottom:8px;">Bekleyen Onay Yok</h3>
           <p style="color:var(--text-secondary);">Şu anda onayınızı bekleyen yeni bir içerik bulunmuyor.</p>
        </div>
      ` : `
        <div class="table-container" style="background:white; border-radius:var(--radius-lg); border:1px solid var(--border); overflow:hidden;">
          <table class="table" style="width:100%; border-collapse:collapse; background:white;">
             <thead style="background:var(--bg-secondary); text-align:left; border-bottom:1px solid var(--border);">
               <tr>
                 <th style="padding:16px; font-weight:700; color:var(--text-secondary);">Türü</th>
                 <th style="padding:16px; font-weight:700; color:var(--text-secondary);">Gönderici</th>
                 <th style="padding:16px; font-weight:700; color:var(--text-secondary);">Başlık / Özet</th>
                 <th style="padding:16px; font-weight:700; color:var(--text-secondary);">Tarih</th>
                 <th style="padding:16px; font-weight:700; color:var(--text-secondary); text-align:right;">İşlemler</th>
               </tr>
             </thead>
             <tbody>
               ${pendingPosts.map(post => `
                 <tr style="border-bottom:1px solid var(--border);">
                   <td style="padding:16px;">
                     <span class="badge ${post.type === 'forum' ? 'badge-primary' : 'badge-info'}" style="text-transform:uppercase; font-size:12px;">${post.type === 'forum' ? 'Forum' : 'Blog'}</span>
                     <div style="font-size:12px; margin-top:4px; color:var(--text-muted); font-weight:600;">${post.category}</div>
                   </td>
                   <td style="padding:16px;">
                     <div style="font-weight:700;">${post.authorName}</div>
                     <div style="font-size:13px; color:var(--text-muted);">${post.authorEmail || ''}</div>
                   </td>
                   <td style="padding:16px;">
                     <div style="font-weight:700; color:var(--text-primary); margin-bottom:4px;">${post.title}</div>
                     <div style="font-size:13px; color:var(--text-secondary); max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${post.summary || post.content || ''}</div>
                   </td>
                   <td style="padding:16px; color:var(--text-secondary); font-size:14px;">
                     ${new Date(post.createdAt).toLocaleDateString('tr-TR')}
                   </td>
                   <td style="padding:16px; text-align:right;">
                     <button class="btn btn-ghost btn-sm btn-approve" data-id="${post.id}" style="color:var(--brand-green); margin-right:8px;">${icon('checkCircle', 18)} Onayla</button>
                     <button class="btn btn-ghost btn-sm btn-reject" data-id="${post.id}" style="color:var(--danger);">${icon('trash', 18)} Sil</button>
                   </td>
                 </tr>
               `).join('')}
             </tbody>
          </table>
        </div>
      `}
    </div>
  `;

  return {
    html,
    init: (el) => {
      // Approve Logic
      el.querySelectorAll('.btn-approve').forEach(btn => {
        btn.onclick = async () => {
          const id = btn.getAttribute('data-id');
          if (!confirm("Bu içeriği yayınlamak istediğinize emin misiniz?")) return;
          
          btn.disabled = true;
          btn.innerHTML = "Onaylanıyor...";
          try {
            await approvePost(id);
            addNotification({ type: 'success', text: 'İçerik başarıyla yayınlandı!', link: 'admin' });
            navigate('admin'); // Refresh
          } catch (error) {
            btn.disabled = false;
            btn.innerHTML = `${icon('checkCircle', 18)} Onayla`;
            alert("Onay sırasında hata oluştu: " + error.message);
          }
        };
      });

      // Reject Logic
      el.querySelectorAll('.btn-reject').forEach(btn => {
        btn.onclick = async () => {
          const id = btn.getAttribute('data-id');
          if (!confirm("Bu içeriği kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) return;
          
          btn.disabled = true;
          btn.innerHTML = "Siliniyor...";
          try {
            await rejectPost(id);
            addNotification({ type: 'info', text: 'İçerik reddedildi ve silindi.', link: 'admin' });
            navigate('admin'); // Refresh
          } catch (error) {
            btn.disabled = false;
            btn.innerHTML = `${icon('trash', 18)} Sil`;
            alert("Silme sırasında hata oluştu: " + error.message);
          }
        };
      });
    }
  };
}
