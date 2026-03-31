import { db, auth } from '../lib/firebase.js';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const POSTS_COLLECTION = 'public_posts';

/**
 * Gönderi (Forum/Blog) onaya gönderme
 * @param {Object} data - { title, content, category, type ('forum'|'blog') } 
 */
export async function submitPost(data) {
  if (!auth.currentUser) throw new Error("Giriş yapmanız gerekiyor.");
  
  const isAdmin = auth.currentUser.email === 'aldibasozcan@gmail.com';
  if (isAdmin) localStorage.setItem('_is_admin', 'true');

  const post = {
    ...data,
    authorId: auth.currentUser.uid,
    authorName: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
    authorEmail: auth.currentUser.email,
    status: isAdmin ? 'approved' : 'pending',
    createdAt: Date.now()
  };

  try {
    const docRef = await addDoc(collection(db, POSTS_COLLECTION), post);
    return { id: docRef.id, ...post };
  } catch (error) {
    console.error("Yazı gönderilirken hata oluştu:", error);
    throw error;
  }
}

/**
 * Belirli bir tipteki (forum/blog) ONAYLANMIŞ gönderileri getirir.
 * @param {String} type - 'forum' | 'blog'
 */
export async function getApprovedPosts(type) {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where("status", "==", "approved"),
      where("type", "==", type),
      // Firestore index may be required to sort, so we fetch and sort on client to avoid composite index requirement for now
      // orderBy("createdAt", "desc") 
    );
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return posts.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Onaylı yazılar getirilirken hata:", error);
    return [];
  }
}

/**
 * ONAY BEKLEYEN gönderileri getirir (Sadece admin için)
 */
export async function getPendingPosts() {
  if (!auth.currentUser || auth.currentUser.email !== 'aldibasozcan@gmail.com') {
    throw new Error("Yetkisiz erişim");
  }
  
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where("status", "==", "pending")
    );
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return posts.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Bekleyen yazılar getirilirken hata:", error);
    return [];
  }
}

/**
 * Bir gönderiyi onaylar.
 * @param {String} postId 
 */
export async function approvePost(postId) {
  if (!auth.currentUser || auth.currentUser.email !== 'aldibasozcan@gmail.com') return;
  const postRef = doc(db, POSTS_COLLECTION, postId);
  await updateDoc(postRef, { status: 'approved' });
}

/**
 * Bir gönderiyi reddeder (siler).
 * @param {String} postId 
 */
export async function rejectPost(postId) {
  if (!auth.currentUser || auth.currentUser.email !== 'aldibasozcan@gmail.com') return;
  const postRef = doc(db, POSTS_COLLECTION, postId);
  await deleteDoc(postRef);
}

/**
 * Oturum açmış olan kullanıcının gönderdiği tüm yazıları (Onaylı/Bekliyor) getirir.
 */
export async function getMyPosts() {
  if (!auth.currentUser) throw new Error("Giriş yapmanız gerekiyor.");
  
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where("authorId", "==", auth.currentUser.uid)
    );
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return posts.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Kendi yazılarınız getirilirken hata:", error);
    return [];
  }
}
/**
 * Bir gönderiyi günceller.
 * @param {String} postId 
 * @param {Object} data - { title, content, category, type }
 */
export async function updatePost(postId, data) {
  if (!auth.currentUser) throw new Error("Giriş yapmanız gerekiyor.");
  
  const isAdmin = auth.currentUser.email === 'aldibasozcan@gmail.com';
  const postRef = doc(db, POSTS_COLLECTION, postId);
  
  const updates = {
    ...data,
    tags: Array.isArray(data.tags) ? data.tags : [],
    status: isAdmin ? 'approved' : 'pending',
    updatedAt: Date.now()
  };

  try {
    await updateDoc(postRef, updates);
    return updates;
  } catch (error) {
    console.error("Yazı güncellenirken hata oluştu:", error);
    throw error;
  }
}

/**
 * Bir gönderiyi tamamen siler.
 * @param {String} postId 
 */
export async function deletePost(postId) {
  if (!auth.currentUser) throw new Error("Giriş yapmanız gerekiyor.");
  const postRef = doc(db, POSTS_COLLECTION, postId);
  
  try {
    await deleteDoc(postRef);
  } catch (error) {
    console.error("Yazı silinirken hata oluştu:", error);
    throw error;
  }
}

/**
 * Bir gönderiyi ID ile getirir.
 * @param {String} postId 
 */
export async function getPostById(postId) {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      return { id: postSnap.id, ...postSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Yazı getirilirken hata:", error);
    return null;
  }
}
/**
 * Forum/Blog boş ise profesyonel örnek içerikler ekler.
 */
export async function seedInitialData() {
  const forumCheck = await getApprovedPosts('forum');
  if (forumCheck.length > 0) return; // Zaten veri var

  const seedPosts = [
    {
      type: 'forum',
      category: 'LGS', // Geriye dönük uyumluluk için tutuyoruz
      grade: '8. Sınıf',
      topic: 'İnkılap Tarihi',
      title: 'LGS İnkılap Tarihi - 10 Sayfalık Tam Ünite Özeti (PDF)',
      summary: 'LGS hazırlık sürecinde tüm üniteleri kapsayan, MEB müfredatına %100 uyumlu özet notlar. Kavram haritaları destekli.',
      content: 'Bu materyal, 8. Sınıf T.C. İnkılap Tarihi ve Atatürkçülük dersinin tüm ünitelerini kapsamaktadır...',
      tags: ['konuozeti', 'mufredat'],
      authorName: 'Bitig Rehber',
      authorId: 'system',
      status: 'approved',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2
    },
    {
      type: 'forum',
      category: 'Yazılı Hazırlık',
      grade: '9. Sınıf',
      topic: '1. Dönem 1. Yazılı',
      title: '9. Sınıf Tarih 1. Dönem 1. Yazılı Hazırlık Soruları (2024)',
      summary: 'Yeni müfredata uygun, açık uçlu ve senaryo temelli yazılı hazırlık soruları ve cevap anahtarı.',
      content: '9. sınıf öğrencilerimiz için hazırladığımız yazılı provasıdır...',
      tags: ['yazilihazirlik', 'deneme'],
      authorName: 'Müverrih Hoca',
      authorId: 'system',
      status: 'approved',
      createdAt: Date.now() - 1000 * 60 * 60 * 12
    },
    {
      type: 'forum',
      category: 'YKS',
      grade: 'TYT-AYT',
      topic: 'Soru Analizi',
      title: 'YKS Tarih: Son 5 Yılın Soru Analizi ve Kritik Konular',
      summary: 'TYT ve AYT sınavlarında en çok çıkan 100 temel tarih kavramı ve son 5 yılın soru dağılım grafiği.',
      content: 'YKS hazırlığında öğrencilerin en çok zorlandığı nokta...',
      tags: ['cikmissorular', 'mufredat'],
      authorName: 'Tarih Zümre Başkanı',
      authorId: 'system',
      status: 'approved',
      createdAt: Date.now() - 1000 * 60 * 60 * 5
    },
    {
      type: 'forum',
      category: 'Lise',
      grade: '10. Sınıf',
      topic: 'Osmanlı Devleti',
      title: '10. Sınıf: Dünya Gücü Osmanlı (1453-1595) İnteraktif Sunum',
      summary: 'İstanbul\'un Fethi ve yükseliş dönemini kapsayan görsel ağırlıklı ders materyali.',
      content: '10. sınıfın en önemli konularından biri olan Osmanlı Yükseliş dönemi için hazırladığım sunumdur. Haritalar ve 3D canlandırmalar içermektedir.',
      tags: ['sunum', 'etkinlik'],
      authorName: 'Mehmet Hoca',
      authorId: 'system',
      status: 'approved',
      createdAt: Date.now() - 1000 * 60 * 60 * 48 // 2 gün önce
    },
    {
      id: 'blog-3',
      type: 'blog',
      title: 'Dijital Çağda Tarih Okuryazarlığı',
      summary: 'Yapay zeka ve dijital kaynakların tarih eğitimindeki kritik rolü üzerine bir inceleme.',
      content: 'Günümüzde bilgiye ulaşım hızlanırken, bilginin doğruluğunu teyit etmek her zamankinden daha önemli hale gelmiştir...',
      category: 'Akademik Makale',
      grade: 'TYT-AYT',
      tags: ['akademik', 'pedagoji'],
      authorId: 'admin_1',
      authorName: 'Dr. Ahmet Yılmaz',
      authorEmail: 'aldibasozcan@gmail.com',
      createdAt: Date.now() - 1000 * 60 * 60 * 12,
      status: 'approved'
    }
  ];

  for (const post of seedPosts) {
    await addDoc(collection(db, POSTS_COLLECTION), post);
  }
  
  console.log("Forum seed verileri başarıyla eklendi.");
}
/**
 * Tüm ONAYLANMIŞ gönderileri getirir (Admin/Moderasyon için tip bağımsız)
 */
export async function getAllApprovedPostsAdmin() {
  if (!auth.currentUser || auth.currentUser.email !== 'aldibasozcan@gmail.com') {
    throw new Error("Yetkisiz erişim");
  }
  
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where("status", "==", "approved")
    );
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return posts.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Onaylı yazılar (Admin) getirilirken hata:", error);
    return [];
  }
}
