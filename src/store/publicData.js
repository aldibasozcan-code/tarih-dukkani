import { db, auth } from '../lib/firebase.js';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
