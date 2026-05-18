import { create } from 'zustand';
import { getState } from './store.js';

// MEB müfredatına uygun Sosyal Bilgiler ve Tarih Dersleri
const initialCourses = [
  {
    id: 'c_5_sosyal',
    title: '5. Sınıf Sosyal Bilgiler',
    instructor: '', // will be set from state or default
    grade: '5. Sınıf',
    subject: 'Sosyal Bilgiler',
    duration: '36 Hafta',
    status: 'Aktif',
    progress: 0,
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
    curriculum: [
      { id: '5s_1', title: '1. Ünite: Birey ve Toplum', status: 'active', type: 'video' },
      { id: '5s_2', title: '2. Ünite: Kültür ve Miras', status: 'locked', type: 'pdf' },
      { id: '5s_3', title: '3. Ünite: İnsanlar, Yerler ve Çevreler', status: 'locked', type: 'video' },
      { id: '5s_4', title: '4. Ünite: Bilim, Teknoloji ve Toplum', status: 'locked', type: 'pdf' },
      { id: '5s_5', title: '5. Ünite: Üretim, Dağıtım ve Tüketim', status: 'locked', type: 'video' },
      { id: '5s_6', title: '6. Ünite: Etkin Vatandaşlık', status: 'locked', type: 'video' },
      { id: '5s_7', title: '7. Ünite: Küresel Bağlantılar', status: 'locked', type: 'pdf' }
    ]
  },
  {
    id: 'c_6_sosyal',
    title: '6. Sınıf Sosyal Bilgiler',
    instructor: '',
    grade: '6. Sınıf',
    subject: 'Sosyal Bilgiler',
    duration: '36 Hafta',
    status: 'Aktif',
    progress: 0,
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    curriculum: [
      { id: '6s_1', title: '1. Ünite: Birey ve Toplum', status: 'active', type: 'video' },
      { id: '6s_2', title: '2. Ünite: Kültür ve Miras', status: 'locked', type: 'pdf' },
      { id: '6s_3', title: '3. Ünite: İnsanlar, Yerler ve Çevreler', status: 'locked', type: 'video' },
      { id: '6s_4', title: '4. Ünite: Bilim, Teknoloji ve Toplum', status: 'locked', type: 'pdf' },
      { id: '6s_5', title: '5. Ünite: Üretim, Dağıtım ve Tüketim', status: 'locked', type: 'video' },
      { id: '6s_6', title: '6. Ünite: Etkin Vatandaşlık', status: 'locked', type: 'video' },
      { id: '6s_7', title: '7. Ünite: Küresel Bağlantılar', status: 'locked', type: 'pdf' }
    ]
  },
  {
    id: 'c_7_sosyal',
    title: '7. Sınıf Sosyal Bilgiler',
    instructor: '',
    grade: '7. Sınıf',
    subject: 'Sosyal Bilgiler',
    duration: '36 Hafta',
    status: 'Aktif',
    progress: 0,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
    curriculum: [
      { id: '7s_1', title: '1. Ünite: Birey ve Toplum', status: 'active', type: 'video' },
      { id: '7s_2', title: '2. Ünite: Kültür ve Miras (Osmanlı Devleti)', status: 'locked', type: 'pdf' },
      { id: '7s_3', title: '3. Ünite: İnsanlar, Yerler ve Çevreler (Göçler)', status: 'locked', type: 'video' },
      { id: '7s_4', title: '4. Ünite: Bilim, Teknoloji ve Toplum', status: 'locked', type: 'pdf' },
      { id: '7s_5', title: '5. Ünite: Üretim, Dağıtım ve Tüketim', status: 'locked', type: 'video' },
      { id: '7s_6', title: '6. Ünite: Etkin Vatandaşlık (Demokrasi Serüveni)', status: 'locked', type: 'video' },
      { id: '7s_7', title: '7. Ünite: Küresel Bağlantılar', status: 'locked', type: 'pdf' }
    ]
  },
  {
    id: 'c_8_inkilap',
    title: '8. Sınıf T.C. İnkılap Tarihi ve Atatürkçülük',
    instructor: '',
    grade: '8. Sınıf',
    subject: 'Tarih',
    duration: '36 Hafta',
    status: 'Aktif',
    progress: 0,
    image: 'https://images.unsplash.com/photo-1574686419759-467406a1cb46?auto=format&fit=crop&w=800&q=80',
    curriculum: [
      { id: '8i_1', title: '1. Ünite: Bir Kahraman Doğuyor', status: 'active', type: 'video' },
      { id: '8i_2', title: '2. Ünite: Milli Uyanış: Bağımsızlık Yolunda Atılan Adımlar', status: 'locked', type: 'pdf' },
      { id: '8i_3', title: '3. Ünite: Milli Bir Destan: Ya İstiklal Ya Ölüm!', status: 'locked', type: 'video' },
      { id: '8i_4', title: '4. Ünite: Atatürkçülük ve Çağdaşlaşan Türkiye', status: 'locked', type: 'video' },
      { id: '8i_5', title: '5. Ünite: Demokratikleşme Çabaları', status: 'locked', type: 'pdf' },
      { id: '8i_6', title: '6. Ünite: Atatürk Dönemi Türk Dış Politikası', status: 'locked', type: 'video' },
      { id: '8i_7', title: '7. Ünite: Atatürk\'ün Ölümü ve Sonrası', status: 'locked', type: 'pdf' }
    ]
  },
  {
    id: 'c_9_tarih',
    title: '9. Sınıf Tarih',
    instructor: '',
    grade: '9. Sınıf',
    subject: 'Tarih',
    duration: '36 Hafta',
    status: 'Aktif',
    progress: 0,
    image: 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?auto=format&fit=crop&w=800&q=80',
    curriculum: [
      { id: '9t_1', title: '1. Ünite: Tarih ve Zaman', status: 'active', type: 'video' },
      { id: '9t_2', title: '2. Ünite: İnsanlığın İlk Dönemleri', status: 'locked', type: 'pdf' },
      { id: '9t_3', title: '3. Ünite: Orta Çağ\'da Dünya', status: 'locked', type: 'video' },
      { id: '9t_4', title: '4. Ünite: İlk ve Orta Çağlarda Türk Dünyası', status: 'locked', type: 'video' },
      { id: '9t_5', title: '5. Ünite: İslam Medeniyetinin Doğuşu', status: 'locked', type: 'pdf' },
      { id: '9t_6', title: '6. Ünite: Türklerin İslamiyet\'i Kabulü ve İlk Türk İslam Devletleri', status: 'locked', type: 'video' }
    ]
  },
  {
    id: 'c_10_tarih',
    title: '10. Sınıf Tarih',
    instructor: '',
    grade: '10. Sınıf',
    subject: 'Tarih',
    duration: '36 Hafta',
    status: 'Aktif',
    progress: 0,
    image: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&w=800&q=80',
    curriculum: [
      { id: '10t_1', title: '1. Ünite: Yerleşme ve Devletleşme Sürecinde Selçuklu Türkiyesi', status: 'active', type: 'video' },
      { id: '10t_2', title: '2. Ünite: Beylikten Devlete Osmanlı Siyaseti (1302-1453)', status: 'locked', type: 'pdf' },
      { id: '10t_3', title: '3. Ünite: Devletleşme Sürecinde Savaşçılar ve Askerler', status: 'locked', type: 'video' },
      { id: '10t_4', title: '4. Ünite: Beylikten Devlete Osmanlı Medeniyeti', status: 'locked', type: 'pdf' },
      { id: '10t_5', title: '5. Ünite: Dünya Gücü Osmanlı (1453-1595)', status: 'locked', type: 'video' },
      { id: '10t_6', title: '6. Ünite: Sultan ve Osmanlı Merkez Teşkilatı', status: 'locked', type: 'pdf' },
      { id: '10t_7', title: '7. Ünite: Klasik Çağda Osmanlı Toplum Düzeni', status: 'locked', type: 'video' }
    ]
  },
  {
    id: 'c_11_tarih',
    title: '11. Sınıf Tarih',
    instructor: '',
    grade: '11. Sınıf',
    subject: 'Tarih',
    duration: '36 Hafta',
    status: 'Aktif',
    progress: 0,
    image: 'https://images.unsplash.com/photo-1568285526372-fdf441619a9f?auto=format&fit=crop&w=800&q=80',
    curriculum: [
      { id: '11t_1', title: '1. Ünite: Değişen Dünya Dengeleri Karşısında Osmanlı Siyaseti (1595-1774)', status: 'active', type: 'video' },
      { id: '11t_2', title: '2. Ünite: Değişim Çağında Avrupa ve Osmanlı', status: 'locked', type: 'pdf' },
      { id: '11t_3', title: '3. Ünite: Uluslararası İlişkilerde Denge Stratejisi (1774-1914)', status: 'locked', type: 'video' },
      { id: '11t_4', title: '4. Ünite: Devrimler Çağında Değişen Devlet-Toplum İlişkileri', status: 'locked', type: 'pdf' },
      { id: '11t_5', title: '5. Ünite: Sermaye ve Emek', status: 'locked', type: 'video' },
      { id: '11t_6', title: '6. Ünite: XIX. ve XX. Yüzyılda Değişen Gündelik Hayat', status: 'locked', type: 'pdf' }
    ]
  },
  {
    id: 'c_12_inkilap',
    title: '12. Sınıf T.C. İnkılap Tarihi ve Atatürkçülük',
    instructor: '',
    grade: '12. Sınıf',
    subject: 'Tarih',
    duration: '36 Hafta',
    status: 'Aktif',
    progress: 0,
    image: 'https://images.unsplash.com/photo-1564858022692-0b25e791206d?auto=format&fit=crop&w=800&q=80',
    curriculum: [
      { id: '12i_1', title: '1. Ünite: XX. Yüzyıl Başlarında Osmanlı Devleti ve Dünya', status: 'active', type: 'video' },
      { id: '12i_2', title: '2. Ünite: Milli Mücadele', status: 'locked', type: 'pdf' },
      { id: '12i_3', title: '3. Ünite: Atatürkçülük ve Türk İnkılabı', status: 'locked', type: 'video' },
      { id: '12i_4', title: '4. Ünite: İki Savaş Arasındaki Dönemde Türkiye ve Dünya', status: 'locked', type: 'pdf' },
      { id: '12i_5', title: '5. Ünite: II. Dünya Savaşı Sürecinde Türkiye ve Dünya', status: 'locked', type: 'video' },
      { id: '12i_6', title: '6. Ünite: II. Dünya Savaşı Sonrasında Türkiye ve Dünya', status: 'locked', type: 'pdf' },
      { id: '12i_7', title: '7. Ünite: Toplumsal Devrim Çağında Dünya ve Türkiye', status: 'locked', type: 'video' },
      { id: '12i_8', title: '8. Ünite: XXI. Yüzyılın Eşiğinde Türkiye ve Dünya', status: 'locked', type: 'pdf' }
    ]
  },
  {
    id: 'c_tyt_tarih',
    title: 'TYT Tarih Kampı',
    instructor: '',
    grade: 'Mezun',
    subject: 'Tarih',
    duration: '24 Hafta',
    status: 'Aktif',
    progress: 0,
    image: 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?auto=format&fit=crop&w=800&q=80',
    curriculum: [
      { id: 'tyt_1', title: '1. Tarih ve Zaman', status: 'active', type: 'video' },
      { id: 'tyt_2', title: '2. İnsanlığın İlk Dönemleri', status: 'locked', type: 'pdf' },
      { id: 'tyt_3', title: '3. Orta Çağ\'da Dünya', status: 'locked', type: 'video' },
      { id: 'tyt_4', title: '4. İlk ve Orta Çağlarda Türk Dünyası', status: 'locked', type: 'video' },
      { id: 'tyt_5', title: '5. İslam Medeniyetinin Doğuşu', status: 'locked', type: 'pdf' },
      { id: 'tyt_6', title: '6. Türklerin İslamiyet\'i Kabulü ve İlk Türk İslam Devletleri', status: 'locked', type: 'video' },
      { id: 'tyt_7', title: '7. Yerleşme ve Devletleşme Sürecinde Selçuklu Türkiyesi', status: 'locked', type: 'pdf' },
      { id: 'tyt_8', title: '8. Beylikten Devlete Osmanlı Siyaseti', status: 'locked', type: 'video' },
      { id: 'tyt_9', title: '9. Dünya Gücü Osmanlı', status: 'locked', type: 'video' }
    ]
  },
  {
    id: 'c_ayt_tarih',
    title: 'AYT Tarih Kampı',
    instructor: '',
    grade: 'Mezun',
    subject: 'Tarih',
    duration: '24 Hafta',
    status: 'Aktif',
    progress: 0,
    image: 'https://images.unsplash.com/photo-1568285526372-fdf441619a9f?auto=format&fit=crop&w=800&q=80',
    curriculum: [
      { id: 'ayt_1', title: '1. Değişen Dünya Dengeleri Karşısında Osmanlı Siyaseti', status: 'active', type: 'video' },
      { id: 'ayt_2', title: '2. Değişim Çağında Avrupa ve Osmanlı', status: 'locked', type: 'pdf' },
      { id: 'ayt_3', title: '3. Uluslararası İlişkilerde Denge Stratejisi (1774-1914)', status: 'locked', type: 'video' },
      { id: 'ayt_4', title: '4. Devrimler Çağında Değişen Devlet-Toplum İlişkileri', status: 'locked', type: 'pdf' },
      { id: 'ayt_5', title: '5. Sermaye ve Emek', status: 'locked', type: 'video' },
      { id: 'ayt_6', title: '6. XIX. ve XX. Yüzyılda Değişen Gündelik Hayat', status: 'locked', type: 'video' },
      { id: 'ayt_7', title: '7. XX. Yüzyıl Başlarında Osmanlı Devleti ve Dünya', status: 'locked', type: 'pdf' },
      { id: 'ayt_8', title: '8. Millî Mücadele', status: 'locked', type: 'video' },
      { id: 'ayt_9', title: '9. Atatürkçülük ve Türk İnkılabı', status: 'locked', type: 'video' },
      { id: 'ayt_10', title: '10. İki Savaş Arasındaki Dönemde Türkiye ve Dünya', status: 'locked', type: 'pdf' },
      { id: 'ayt_11', title: '11. II. Dünya Savaşı ve Sonrasında Türkiye ve Dünya', status: 'locked', type: 'video' }
    ]
  }
];

// Set instructor names correctly based on state
const coursesWithInstructors = initialCourses.map(course => ({
  ...course,
  instructor: getState()?.profile?.name || 'Ayşe Kaya'
}));

// Derse göre tematik Unsplash fotoğrafı getiren yardımcı fonksiyon
const getUnsplashImageForSubject = (subject) => {
  const keywordMap = {
    'Matematik': 'math,numbers,calculation',
    'Fen Bilimleri': 'science,laboratory,biology',
    'Türkçe': 'literature,books,reading',
    'Edebiyat': 'literature,books,poetry',
    'Sosyal Bilgiler': 'history,globe',
    'Tarih': 'history,ancient,monument',
    'Coğrafya': 'geography,earth,map',
    'İngilizce': 'english,language,dictionary',
    'Fizik': 'physics,universe,energy',
    'Kimya': 'chemistry,flask',
    'Biyoloji': 'biology,nature,cells'
  };

  const keywords = keywordMap[subject] || 'education,classroom,learning';
  return `https://source.unsplash.com/random/800x600/?${keywords}&sig=${Date.now()}`;
};

export const useCourseStore = create((set) => ({
  courses: coursesWithInstructors,
  
  addCourse: (courseData) => set((state) => {
    const newCourse = {
      ...courseData,
      id: `c_${Date.now()}`,
      progress: 0,
      image: getUnsplashImageForSubject(courseData.subject),
      curriculum: courseData.curriculum || [],
      status: courseData.status || 'Taslak'
    };
    return { courses: [...state.courses, newCourse] };
  }),
  
  updateCourse: (id, updatedData) => set((state) => ({
    courses: state.courses.map(course => 
      course.id === id ? { ...course, ...updatedData } : course
    )
  })),
  
  deleteCourse: (id) => set((state) => ({
    courses: state.courses.filter(course => course.id !== id)
  }))
}));
