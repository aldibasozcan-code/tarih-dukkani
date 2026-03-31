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
    status: isAdmin ? 'approved' : 'pending', // Admin değilse tekrar onaya düşer
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
      category: 'LGS',
      title: 'LGS İnkılap Tarihi - 10 Sayfalık Tam Ünite Özeti (PDF)',
      summary: 'LGS hazırlık sürecinde tüm üniteleri kapsayan, MEB müfredatına %100 uyumlu özet notlar. Kavram haritaları destekli.',
      content: 'Bu materyal, 8. Sınıf T.C. İnkılap Tarihi ve Atatürkçülük dersinin tüm ünitelerini kapsamaktadır. Birinci Dünya Savaşı\'ndan Atatürk Dönemi Dış Politika\'ya kadar tüm kritik noktalar özetlenmiştir. Özellikle kronolojik sıra ve neden-sonuç ilişkileri üzerine kurulmuştur.\n\nÖğrencileriniz için PDF olarak çıktı alıp dağıtabilirsiniz.',
      authorName: 'Bitig Rehber',
      authorId: 'system',
      status: 'approved',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2 // 2 gün önce
    },
    {
      type: 'forum',
      category: 'YKS',
      title: 'YKS Tarih: Son 5 Yılın Soru Analizi ve Kritik Konular',
      summary: 'TYT ve AYT sınavlarında en çok çıkan 100 temel tarih kavramı ve son 5 yılın soru dağılım grafiği.',
      content: 'YKS hazırlığında öğrencilerin en çok zorlandığı nokta, hangi konuya ne kadar ağırlık verecekleridir. Bu analiz raporu, ÖSYM\'nin son yıllardaki soru sorma eğilimlerini ortaya koymaktadır. \n\nÖzellikle "İlk Türk Devletleri" ve "Atatürk İlkeleri" konularındaki her yıl çıkan garanti soruları kaçırmamak için mutlaka inceleyin.',
      authorName: 'Tarih Zümre Başkanı',
      authorId: 'system',
      status: 'approved',
      createdAt: Date.now() - 1000 * 60 * 60 * 5 // 5 saat önce
    },
    {
      type: 'forum',
      category: 'Lise (9-12)',
      title: '9. Sınıf 1. Ünite: Tarih ve Zaman - İnteraktif Sunum',
      summary: 'Tarih biliminin yöntemi ve kaynakların sınıflandırılması üzerine hazırladığım ders sunumu ve etkinlik kağıdı.',
      content: '9. sınıfın ilk ünitesi olan "Tarih ve Zaman", öğrencilerin tarih bilincini oluşturmak için kritiktir. Bu sunumda bol görsel ve video bağlantıları bulunmaktadır. Ayrıca sunum sonunda öğrenciyi aktif kılan bir "Doğru-Yanlış" etkinliği mevcuttur.',
      authorName: 'Mehmet Hoca',
      authorId: 'system',
      status: 'approved',
      createdAt: Date.now() - 1000 * 60 * 60 * 48 // 2 gün önce
    },
    {
      type: 'forum',
      category: 'YKS',
      title: 'Tarih Dersi İçin Hafıza Teknikleri ve Kodlamalar',
      summary: 'Anlaşmalar, savaşlar ve kronolojik olayları ezberlemeyi kolaylaştıran özgün kodlama yöntemleri.',
      content: 'Tarih dersinde çok fazla isim ve tarih olduğu için ezber yükü fazladır. Bu materyalde, öğrencilerin akılda tutmasını kolaylaştıracak tekerlemeler ve görsel kodlamalar yer almaktadır. Örneğin; Mudanya Mütarekesi maddeleri için hazırladığımız özel şifre içermektedir.',
      authorName: 'Akademik Başarı',
      authorId: 'system',
      status: 'approved',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 // 1 gün önce
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
