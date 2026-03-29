// ═══════════════════════════════════════════════════
// CURRICULUM SEED DATA
// ═══════════════════════════════════════════════════

export const ALL_BRANCHES = [
  "Almanca", "Arapça", "Beden Eğitimi ve Spor", "Bilişim Teknolojileri", "Biyoloji", "Coğrafya", 
  "Din Kültürü ve Ahlak Bilgisi", "Felsefe", "Fen Bilimleri", "Fizik", "Fransızca", 
  "Görsel Sanatlar", "İngilizce", "Kimya", "Mantık", "Matematik (İlköğretim)", 
  "Matematik (Lise)", "Müzik", "Osmanlı Türkçesi", "Psikoloji", "Rehberlik", 
  "Sosyal Bilgiler", "Sosyoloji", "T.C. İnkılap Tarihi ve Atatürkçülük", "Tarih", 
  "Teknoloji ve Tasarım", "Türk Dili ve Edebiyatı", "Türkçe"
];

export const SUBJECTS = [
  { id: 'sosyal', name: 'Sosyal Bilgiler', icon: '🌍' },
  { id: 'inkılap', name: 'İnkılap Tarihi', icon: '⚡' },
  { id: 'tarih', name: 'Tarih', icon: '📜' },
  { id: 'tyt', name: 'TYT', icon: '📝' },
  { id: 'ayt', name: 'AYT', icon: '🎯' },
  { id: 'osmanlıca', name: 'Osmanlı Türkçesi', icon: '📖' },
  { id: 'matematik_ilk', name: 'Matematik (İlköğretim)', icon: '🔢' },
  { id: 'matematik_lise', name: 'Matematik (Lise)', icon: '📐' },
  { id: 'turkce', name: 'Türkçe', icon: '✍️' },
  { id: 'fen_bilimleri', name: 'Fen Bilimleri', icon: '🧪' },
];

export const SUBJECT_GRADES = {
  'sosyal':    ['5. Sınıf', '6. Sınıf', '7. Sınıf'],
  'inkılap':   ['8. Sınıf', '12. Sınıf'],
  'tarih':     ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'tyt':       ['12. Sınıf', 'Mezun'],
  'ayt':       ['12. Sınıf', 'Mezun'],
  'osmanlıca': ['Diğer'],
  'matematik_ilk': ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'],
  'matematik_lise': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
};

// Content types for each topic
export const CONTENT_TYPES = [
  { id: 'ders_notu', label: 'Ders Notu', icon: '📄', color: '#63cab7' },
  { id: 'slayt', label: 'Slayt', icon: '🖥️', color: '#7c6aff' },
  { id: 'yeni_nesil', label: 'Yeni Nesil', icon: '💡', color: '#f6c90e' },
  { id: 'tarama', label: 'Konu Tarama Testi', icon: '✅', color: '#ff9f43' },
  { id: 'deneme', label: 'Deneme Sınavı', icon: '📋', color: '#ff5a65' },
];

// Default curriculum structure (MEB Maarif Modeli'ne uygun - 2024/2025)
export const DEFAULT_CURRICULUM = {
  'sosyal': {
    '5. Sınıf': [
      {
        id: 'u1', name: '1. Ünite: Birlikte Yaşamak (Maarif Modeli)',
        topics: [
          { id: 't1_1', name: 'Toplumsal Gruplar ve Sosyal Rollerimiz' },
          { id: 't1_2', name: 'Kültürel Özelliklere Saygı ve Birlikte Yaşama' },
          { id: 't1_3', name: 'Toplumsal Birlik: Yardımlaşma ve Dayanışma' },
        ]
      },
      {
        id: 'u2', name: '2. Ünite: Evimiz Dünya (Maarif Modeli)',
        topics: [
          { id: 't2_1', name: 'Yaşadığımız İlin Göreceli Konumu' },
          { id: 't2_2', name: 'Doğal ve Beşerî Çevredeki Değişimler' },
          { id: 't2_3', name: 'Afetlerin İnsan ve Çevre Üzerindeki Etkileri' },
          { id: 't2_4', name: 'Ülkemize Komşu Devletler ve Kültürel Bağlar' },
        ]
      },
      {
        id: 'u3', name: '3. Ünite: Ortak Mirasımız (Maarif Modeli)',
        topics: [
          { id: 't3_1', name: 'Ortak Miras Ögelerimiz' },
          { id: 't3_2', name: 'Somut ve Somut Olmayan Kültürel Miras' },
          { id: 't3_3', name: 'Anadolu ve Mezopotamya Medeniyetlerinin Katkıları' },
        ]
      },
      {
        id: 'u4', name: '4. Ünite: Yaşayan Demokrasimiz (Maarif Modeli)',
        topics: [
          { id: 't4_1', name: 'Demokrasi ve Cumhuriyetin Temel Nitelikleri' },
          { id: 't4_2', name: 'Etkin Vatandaşlık: Hak, Sorumluluk ve Özgürlük' },
          { id: 't4_3', name: 'Toplumsal Sorunların Çözümünde Kurumlar' },
        ]
      },
      {
        id: 'u5', name: '5. Ünite: Hayatımızdaki Ekonomi (Maarif Modeli)',
        topics: [
          { id: 't5_1', name: 'Kaynakların Verimli Kullanımı ve İsraf' },
          { id: 't5_2', name: 'Bireysel ve Aile Bütçesi Yönetimi' },
          { id: 't5_3', name: 'Yaşadığımız İldeki Ekonomik Faaliyetler' },
        ]
      },
      {
        id: 'u6', name: '6. Ünite: Teknoloji ve Sosyal Bilimler (Maarif Modeli)',
        topics: [
          { id: 't6_1', name: 'Teknolojik Gelişmelerin Topluma Etkisi' },
          { id: 't6_2', name: 'Teknolojik Ürünlerin Bilinçli ve Güvenli Kullanımı' },
        ]
      },
    ],
    '6. Sınıf': [
      {
        id: 'u1', name: '1. Ünite: Biz ve Değerlerimiz',
        topics: [
          { id: 't1_1', name: 'Sosyal Rollerimiz ve Sorumluluklarımız' },
          { id: 't1_2', name: 'Kültürümüzle Bir Aradayız' },
          { id: 't1_3', name: 'Ön Yargıları Kırıyoruz' },
          { id: 't1_4', name: 'Toplumsal Birliktelik ve Dayanışma' },
        ]
      },
      {
        id: 'u2', name: '2. Ünite: Tarihe Yolculuk',
        topics: [
          { id: 't2_1', name: 'Orta Asya İlk Türk Devletleri' },
          { id: 't2_2', name: 'İslamiyet\'in Doğuşu ve İlk İslam Devletleri' },
          { id: 't2_3', name: 'İlk Türk İslam Devletleri (Karahanlı, Gazneli, Selçuklu)' },
          { id: 't2_4', name: 'Yeni Yurt Anadolu' },
        ]
      },
      {
        id: 'u3', name: '3. Ünite: Yeryüzünde Yaşam',
        topics: [
          { id: 't3_1', name: 'Dünyanın Neresindeyim? (Paralel ve Meridyenler)' },
          { id: 't3_2', name: 'Ülkemizin Fiziki ve Beşerî Coğrafyası' },
          { id: 't3_3', name: 'Farklı İklimler Farklı Yaşamlar' },
        ]
      },
      {
        id: 'u4', name: '4. Ünite: Bilim, Teknoloji ve Toplum',
        topics: [
          { id: 't4_1', name: 'Sosyal Bilimlerin Toplumsal Hayata Etkisi' },
          { id: 't4_2', name: 'Bilimsel Araştırma Basamakları' },
          { id: 't4_3', name: 'Telif, Patent ve Etik Kurallar' },
        ]
      },
      {
        id: 'u5', name: '5. Ünite: Üretim, Dağıtım ve Tüketim',
        topics: [
          { id: 't5_1', name: 'Kaynaklarımız Kazanca Dönüşüyor' },
          { id: 't5_2', name: 'Ekonomik Faaliyetler ve Meslekler' },
          { id: 't5_3', name: 'Girişimci Kimdir? Yeni Fikirler' },
          { id: 't5_4', name: 'Vatandaşlık Görevimiz: Vergi' },
        ]
      },
      {
        id: 'u6', name: '6. Ünite: Etkin Vatandaşlık',
        topics: [
          { id: 't6_1', name: 'Yönetim Biçimleri ve Demokrasi' },
          { id: 't6_2', name: 'Anayasal Düzen: Yasama, Yürütme, Yargı' },
          { id: 't6_3', name: 'Kadın ve Toplum: Haklarımızın Kazanımı' },
        ]
      },
      {
        id: 'u7', name: '7. Ünite: Küresel Bağlantılar',
        topics: [
          { id: 't7_1', name: 'Komşularımız ve Kardeş Cumhuriyetler' },
          { id: 't7_2', name: 'Ticari ve Kültürel İlişkilerimiz' },
        ]
      },
    ],
    '7. Sınıf': [
      {
        id: 'u1', name: '1. Ünite: İletişim ve İnsan İlişkileri',
        topics: [
          { id: 't1_1', name: 'Olumlu İletişim ve Tutumlar' },
          { id: 't1_2', name: 'Medya Okuryazarlığı ve Sosyal Medya Etkisi' },
          { id: 't1_3', name: 'Haberleşme Özgürlüğü ve Haklarımız' },
        ]
      },
      {
        id: 'u2', name: '2. Ünite: Türk Tarihinde Yolculuk',
        topics: [
          { id: 't2_1', name: 'Osmanlı Devleti\'nin Kuruluşu ve Fetih Siyaseti' },
          { id: 't2_2', name: 'Dünya Gücü Osmanlı: İstanbul\'un Fethi ve Sonrası' },
          { id: 't2_3', name: 'Avrupa\'daki Gelişmeler ve Osmanlı\'ya Etkileri' },
          { id: 't2_4', name: 'Yenileşme Hareketleri: Islahatlar' },
        ]
      },
      {
        id: 'u3', name: '3. Ünite: Ülkemizde Nüfus',
        topics: [
          { id: 't3_1', name: 'Türkiye\'de Nüfusun Dağılışı ve Özellikleri' },
          { id: 't3_2', name: 'Göç: Nedenleri, Sonuçları ve Etkileri' },
          { id: 't3_3', name: 'Yerleşme ve Seyahat Özgürlüğü' },
        ]
      },
      {
        id: 'u4', name: '4. Ünite: Zaman İçinde Bilim',
        topics: [
          { id: 't4_1', name: 'Bilginin Serüveni: Yazıdan Dijitale' },
          { id: 't4_2', name: 'Türk-İslam Medeniyetinde Bilginler' },
          { id: 't4_3', name: 'Orta Çağ ve Rönesans: Aydınlanma Yolu' },
        ]
      },
      {
        id: 'u5', name: '5. Ünite: Üretim, Dağıtım ve Tüketim',
        topics: [
          { id: 't5_1', name: 'Toprak ve Üretim İlişkisi (Tımar ve İkta)' },
          { id: 't5_2', name: 'Üretim Teknolojisi ve Sosyal Değişim' },
          { id: 't5_3', name: 'Vakıf Medeniyeti ve Sivil Toplum' },
          { id: 't5_4', name: 'Geleceğin Meslekleri ve Ekonomi' },
        ]
      },
      {
        id: 'u6', name: '6. Ünite: Etkin Vatandaşlık',
        topics: [
          { id: 't6_1', name: 'Demokrasinin Tarihsel Serüveni' },
          { id: 't6_2', name: 'Atatürk ve Demokrasi Kültürü' },
          { id: 't6_3', name: 'Cumhuriyetimizin Temel Nitelikleri' },
        ]
      },
      {
        id: 'u7', name: '7. Ünite: Küresel Bağlantılar',
        topics: [
          { id: 't7_1', name: 'Türkiye ve Uluslararası Kuruluşlar' },
          { id: 't7_2', name: 'Küresel Sorunlar ve Ortak Çözümler' },
        ]
      },
    ],
  },
  'inkılap': {
    '8. Sınıf': [
      {
        id: 'u1', name: '1. Ünite: Bir Kahraman Doğuyor',
        topics: [
          { id: 't1_1', name: 'Uyanan Avrupa ve Sarsılan Osmanlı' },
          { id: 't1_2', name: 'Mustafa Kemal\'in Çocukluğu ve Eğitim Hayatı' },
          { id: 't1_3', name: 'Mustafa Kemal\'in Askerlik Hayatı ve Fikir Dünyası' },
        ]
      },
      {
        id: 'u2', name: '2. Ünite: Millî Uyanış: Bağımsızlık Yolunda Atılan Adımlar',
        topics: [
          { id: 't2_1', name: 'I. Dünya Savaşı ve Osmanlı Devleti' },
          { id: 't2_2', name: 'Mondros Ateşkes Antlaşması ve İşgaller' },
          { id: 't2_3', name: 'Cemiyetler ve Kuvâ-yı Millîye' },
          { id: 't2_4', name: 'Milli Mücadele\'nin Hazırlık Dönemi: Kongreler' },
          { id: 't2_5', name: 'Misak-ı Millî ve TBMM\'nin Açılışı' },
        ]
      },
      {
        id: 'u3', name: '3. Ünite: Millî Bir Destan: Ya İstiklal Ya Ölüm!',
        topics: [
          { id: 't3_1', name: 'Kurtuluş Savaşı: Doğu ve Güney Cepheleri' },
          { id: 't3_2', name: 'Batı Cephesi Savaşları' },
          { id: 't3_3', name: 'Mudanya ve Lozan Barış Antlaşmaları' },
        ]
      },
      {
        id: 'u4', name: '4. Ünite: Atatürkçülük ve Çağdaşlaşan Türkiye',
        topics: [
          { id: 't4_1', name: 'Siyasi Alandaki İnkılaplar (Saltanat ve Cumhuriyet)' },
          { id: 't4_2', name: 'Atatürk İlkeleri' },
          { id: 't4_3', name: 'Hukuk, Eğitim, Ekonomi ve Toplum Alandaki İnkılaplar' },
        ]
      },
      {
        id: 'u5', name: '5. Ünite: Demokratikleşme Çabaları',
        topics: [
          { id: 't5_1', name: 'Çok Partili Hayata Geçiş Denemeleri' },
          { id: 't5_2', name: 'Cumhuriyet Rejimine Yönelik Tehditler' },
        ]
      },
      {
        id: 'u6', name: '6. Ünite: Atatürk Dönemi Türk Dış Politikası',
        topics: [
          { id: 't6_1', name: 'Dış Politikanın Temel İlkeleri ve Gelişmeler' },
          { id: 't6_2', name: 'Boğazlar Meselesi ve Hatay\'ın Anavatana Katılımı' },
        ]
      },
      {
        id: 'u7', name: '7. Ünite: Atatürk\'ün Ölümü ve Sonrası',
        topics: [
          { id: 't7_1', name: 'Atatürk\'ün Vefatı and Eserleri' },
          { id: 't7_2', name: 'II. Dünya Savaşı and Türkiye\'ye Etkileri' },
        ]
      },
    ],
    '12. Sınıf': [
      {
        id: 'u1', name: '1. Ünite: XX. Yüzyıl Başlarında Osmanlı Devleti ve Dünya',
        topics: [
          { id: 't1_1', name: 'I. Dünya Savaşı ve Osmanlı Devleti' },
          { id: 't1_2', name: 'Mustafa Kemal ve Milli Mücadele Ruhu' },
        ]
      },
      {
        id: 'u2', name: '2. Ünite: Milli Mücadele',
        topics: [
          { id: 't2_1', name: 'Kurtuluş Savaşı\'nın Hazırlık Aşaması' },
          { id: 't2_2', name: 'Cepheler ve Bağımsızlık Mücadelesi' },
          { id: 't2_3', name: 'Lozan Barış Antlaşması' },
        ]
      },
      {
        id: 'u3', name: '3. Ünite: Atatürkçülük ve Türk İnkılabı',
        topics: [
          { id: 't3_1', name: 'Cumhuriyetin İlanı ve Köklü Dönüşümler' },
          { id: 't3_2', name: 'Atatürk İlkeleri ve Modern Türkiye' },
        ]
      },
      {
        id: 'u4', name: '4. Ünite: Atatürk Dönemi Sonrası Türkiye ve Dünya',
        topics: [
          { id: 't4_1', name: 'II. Dünya Savaşı ve Türkiye' },
          { id: 't4_2', name: 'Soğuk Savaş Dönemi ve Çok Partili Hayat' },
        ]
      },
    ],
  },
  'tarih': {
    '9. Sınıf': [
      {
        id: 'u1', name: '1. Ünite: Geçmişin İnşa Sürecinde Tarih (Maarif Modeli)',
        topics: [
          { id: 't1_1', name: 'Tarih Öğrenmenin Faydaları ve Tarihin Doğası' },
          { id: 't1_2', name: 'Tarihsel Bilginin Üretim Süreci' },
          { id: 't1_3', name: 'Tarih Araştırmalarında Dijital Dönüşüm' },
        ]
      },
      {
        id: 'u2', name: '2. Ünite: Eski Çağ Medeniyetleri (Maarif Modeli)',
        topics: [
          { id: 't2_1', name: 'Eski Çağ\'da Yerleşim ve Ekonomik Hayat' },
          { id: 't2_2', name: 'Eski Çağ\'da Devlet Anlayışı ve Yönetim' },
          { id: 't2_3', name: 'Eski Çağ Medeniyetlerinde İnanç ve Bilim' },
        ]
      },
      {
        id: 'u3', name: '3. Ünite: Orta Çağ Medeniyetleri (Maarif Modeli)',
        topics: [
          { id: 't3_1', name: 'Orta Çağ\'da Siyasi ve Askerî Yapılar' },
          { id: 't3_2', name: 'Orta Çağ\'da Toplumsal Yapı ve Ekonomi' },
          { id: 't3_3', name: 'Orta Çağ Medeniyetlerinde Bilim, İnanç ve Hukuk' },
        ]
      },
    ],
    '10. Sınıf': [
      {
        id: 'u1', name: '1. Ünite: Yerleşme ve Devletleşme Sürecinde Selçuklu Türkiyesi',
        topics: [
          { id: 't1_1', name: 'Anadolu\'ya Yapılan Türk Göçleri ve Malazgirt' },
          { id: 't1_2', name: 'Anadolu Selçuklu Devleti\'nin Kuruluş Süreci' },
          { id: 't1_3', name: 'Haçlı Seferleri ve Moğol İstilası' },
        ]
      },
      {
        id: 'u2', name: '2. Ünite: Beylikten Devlete Osmanlı Siyaseti (1302-1453)',
        topics: [
          { id: 't2_1', name: 'Osmanlı Devleti\'nin Kuruluş Macerası' },
          { id: 't2_2', name: 'Rumeli\'de Genişleme ve Balkan Fetihleri' },
          { id: 't2_3', name: 'Ankara Savaşı ve Fetret Devri' },
        ]
      },
      {
        id: 'u3', name: '3. Ünite: Devletleşme Sürecinde Savaşçılar ve Askerler',
        topics: [
          { id: 't3_1', name: 'Osmanlı Askerî Teşkilatının Temelleri' },
          { id: 't3_2', name: 'Tımar Sistemi ve Yeniçeri Ocağı' },
        ]
      },
      {
        id: 'u4', name: '4. Ünite: Beylikten Devlete Osmanlı Medeniyeti',
        topics: [
          { id: 't4_1', name: 'Osmanlı Devlet İdaresi ve Saray Teşkilatı' },
          { id: 't4_2', name: 'İlim, İrfan ve Sanat Erbapları' },
        ]
      },
      {
        id: 'u5', name: '5. Ünite: Dünya Gücü Osmanlı (1453-1595)',
        topics: [
          { id: 't5_1', name: 'İstanbul\'un Fethi ve Cihan Şümul Devlet' },
          { id: 't5_2', name: 'Denizlerde Hakimiyet: Akdeniz ve Hint Seferleri' },
          { id: 't5_3', name: 'Kanuni Sultan Süleyman Dönemi Gelişmeleri' },
        ]
      },
      {
        id: 'u6', name: '6. Ünite: Sultan ve Osmanlı Merkez Teşkilatı',
        topics: [
          { id: 't6_1', name: 'Topkapı Sarayı ve Bürokrasinin İşleyişi' },
          { id: 't6_2', name: 'Divan-ı Hümayun ve Karar Alma Süreçleri' },
        ]
      },
      {
        id: 'u7', name: '7. Ünite: Klasik Çağda Osmanlı Toplum Düzeni',
        topics: [
          { id: 't7_1', name: 'Millet Sistemi ve Osmanlı Ekonomisi' },
          { id: 't7_2', name: 'Lonca Teşkilatı ve Vakıf Müessesesi' },
        ]
      },
    ],
    '11. Sınıf': [
      {
        id: 'u1', name: '1. Ünite: Değişen Dünya Dengeleri Karşısında Osmanlı Siyaseti (1595-1774)',
        topics: [
          { id: 't1_1', name: 'XVII. Yüzyıl Siyasi Şartları ve Rekabet' },
          { id: 't1_2', name: 'Uzun Savaşlardan Karlofça Antlaşmasına' },
          { id: 't1_3', name: 'Osmanlı-Rusya ve Osmanlı-Safevi İlişkileri' },
        ]
      },
      {
        id: 'u2', name: '2. Ünite: Değişim Çağında Avrupa ve Osmanlı',
        topics: [
          { id: 't2_1', name: 'Avrupa\'daki Bilim ve Teknoloji Devrimleri' },
          { id: 't2_2', name: 'Osmanlı\'da Islahat Hareketleri ve Modernleşme' },
          { id: 't2_3', name: 'Sanayi İnkılabı ve Osmanlı Ekonomisine Etkileri' },
        ]
      },
      {
        id: 'u3', name: '3. Ünite: Uluslararası İlişkilerde Denge Stratejisi (1774-1914)',
        topics: [
          { id: 't3_1', name: 'XIX. Yüzyıl Siyasi Gelişmeleri ve Şark Meselesi' },
          { id: 't3_2', name: 'Denge Politikası ve Büyük Güçlerin Rekabeti' },
          { id: 't3_3', name: 'Tanzimat, Islahat ve Meşrutiyet Dönemleri' },
        ]
      },
    ],
    '12. Sınıf': [
      {
        id: 'u1', name: '1. Ünite: XX. Yüzyıl Başlarında Osmanlı Devleti ve Dünya',
        topics: [
          { id: 't1_1', name: 'Mustafa Kemal ve I. Dünya Savaşı' },
          { id: 't1_2', name: 'Osmanlı Devleti\'nin Son Savaşları' },
        ]
      },
      {
        id: 'u2', name: '2. Ünite: Milli Mücadele',
        topics: [
          { id: 't2_1', name: 'Bağımsızlığa Giden Yol: Kongreler ve Hazırlık' },
          { id: 't2_2', name: 'Kurtuluş Savaşı Cepheleri' },
        ]
      },
      {
        id: 'u3', name: '3. Ünite: Atatürkçülük ve İnkılaplar',
        topics: [
          { id: 't3_1', name: 'Cumhuriyetin Temelleri ve İnkılaplar' },
          { id: 't3_2', name: 'Atatürk İlkeleri' },
        ]
      },
      {
        id: 'u4', name: '4. Ünite: Çağdaş Dünya ve Türkiye',
        topics: [
          { id: 't4_1', name: 'II. Dünya Savaşı ve Sonrası' },
          { id: 't4_2', name: 'Soğuk Savaş ve Modern Türkiye' },
        ]
      },
    ],
  },
  'tyt': {
    '12. Sınıf': [
      {
        id: 'u1', name: 'TYT Tarih Konuları',
        topics: [
          { id: 't1_1', name: 'Tarih ve Zaman' },
          { id: 't1_2', name: 'İnsanlığın İlk Dönemleri' },
          { id: 't1_3', name: 'Orta Çağ\'da Dünya' },
          { id: 't1_4', name: 'İlk ve Orta Çağlarda Türk Dünyası' },
          { id: 't1_5', name: 'İslam Medeniyetinin Doğuşu' },
          { id: 't1_6', name: 'Türklerin İslamiyet\'i Kabulü ve İlk Türk İslam Devletleri' },
          { id: 't1_7', name: 'Yerleşme ve Devletleşme Sürecinde Selçuklu Türkiyesi' },
          { id: 't1_8', name: 'Beylikten Devlete Osmanlı Siyaseti' },
          { id: 't1_9', name: 'Devletleşme Sürecinde Savaşçılar ve Askerler' },
          { id: 't1_10', name: 'Beylikten Devlete Osmanlı Medeniyeti' },
          { id: 't1_11', name: 'Dünya Gücü Osmanlı' },
          { id: 't1_12', name: 'Sultan ve Osmanlı Merkez Teşkilatı' },
          { id: 't1_13', name: 'Klasik Çağda Osmanlı Toplum Düzeni' },
          { id: 't1_14', name: 'Değişen Dünya Dengeleri Karşısında Osmanlı Siyaseti' },
          { id: 't1_15', name: 'Değişim Çağında Avrupa ve Osmanlı' },
          { id: 't1_16', name: 'Uluslararası İlişkilerde Denge Stratejisi (1774-1914)' },
          { id: 't1_17', name: 'Devrimler Çağında Değişen Devlet-Toplum İlişkileri' },
          { id: 't1_18', name: 'Sermaye ve Emek' },
          { id: 't1_19', name: 'XIX. ve XX. Yüzyılda Değişen Gündelik Hayat' },
          { id: 't1_20', name: 'XX. Yüzyıl Başlarında Osmanlı Devleti ve Dünya' },
          { id: 't1_21', name: 'Millî Mücadele' },
          { id: 't1_22', name: 'Atatürkçülük ve Türk İnkılabı' },
        ]
      },
    ],
    'Mezun': [
      {
        id: 'u1', name: 'TYT Tarih Mezun Konuları',
        topics: [
          { id: 't1_1', name: 'Tarih ve Zaman' },
          { id: 't1_2', name: 'İnsanlığın İlk Dönemleri' },
          { id: 't1_3', name: 'Orta Çağ\'da Dünya' },
          { id: 't1_4', name: 'İlk ve Orta Çağlarda Türk Dünyası' },
          { id: 't1_5', name: 'İslam Medeniyetinin Doğuşu' },
          { id: 't1_6', name: 'Türklerin İslamiyet\'i Kabulü ve İlk Türk İslam Devletleri' },
          { id: 't1_7', name: 'Yerleşme ve Devletleşme Sürecinde Selçuklu Türkiyesi' },
          { id: 't1_8', name: 'Beylikten Devlete Osmanlı Siyaseti' },
          { id: 't1_9', name: 'Devletleşme Sürecinde Savaşçılar ve Askerler' },
          { id: 't1_10', name: 'Beylikten Devlete Osmanlı Medeniyeti' },
          { id: 't1_11', name: 'Dünya Gücü Osmanlı' },
          { id: 't1_12', name: 'Sultan ve Osmanlı Merkez Teşkilatı' },
          { id: 't1_13', name: 'Klasik Çağda Osmanlı Toplum Düzeni' },
          { id: 't1_14', name: 'Değişen Dünya Dengeleri Karşısında Osmanlı Siyaseti' },
          { id: 't1_15', name: 'Değişim Çağında Avrupa ve Osmanlı' },
          { id: 't1_16', name: 'Uluslararası İlişkilerde Denge Stratejisi (1774-1914)' },
          { id: 't1_17', name: 'Devrimler Çağında Değişen Devlet-Toplum İlişkileri' },
          { id: 't1_18', name: 'Sermaye ve Emek' },
          { id: 't1_19', name: 'XIX. ve XX. Yüzyılda Değişen Gündelik Hayat' },
          { id: 't1_20', name: 'XX. Yüzyıl Başlarında Osmanlı Devleti ve Dünya' },
          { id: 't1_21', name: 'Millî Mücadele' },
          { id: 't1_22', name: 'Atatürkçülük ve Türk İnkılabı' },
        ]
      },
    ],
  },
  'ayt': {
    '12. Sınıf': [
      {
        id: 'u1', name: 'AYT Tarih Konuları',
        topics: [
          { id: 't1_1', name: 'Tarih ve Zaman' },
          { id: 't1_2', name: 'İnsanlığın İlk Dönemleri' },
          { id: 't1_3', name: 'Orta Çağ\'da Dünya' },
          { id: 't1_4', name: 'İlk ve Orta Çağlarda Türk Dünyası' },
          { id: 't1_5', name: 'İslam Medeniyetinin Doğuşu' },
          { id: 't1_6', name: 'Türklerin İslamiyet\'i Kabulü ve İlk Türk İslam Devletleri' },
          { id: 't1_7', name: 'Yerleşme ve Devletleşme Sürecinde Selçuklu Türkiyesi' },
          { id: 't1_8', name: 'Beylikten Devlete Osmanlı Siyaseti' },
          { id: 't1_9', name: 'Devletleşme Sürecinde Savaşçılar ve Askerler' },
          { id: 't1_10', name: 'Beylikten Devlete Osmanlı Medeniyeti' },
          { id: 't1_11', name: 'Dünya Gücü Osmanlı' },
          { id: 't1_12', name: 'Sultan ve Osmanlı Merkez Teşkilatı' },
          { id: 't1_13', name: 'Klasik Çağda Osmanlı Toplum Düzeni' },
          { id: 't1_14', name: 'Değişen Dünya Dengeleri Karşısında Osmanlı Siyaseti' },
          { id: 't1_15', name: 'Değişim Çağında Avrupa ve Osmanlı' },
          { id: 't1_16', name: 'Uluslararası İlişkilerde Denge Stratejisi (1774-1914)' },
          { id: 't1_17', name: 'Devrimler Çağında Değişen Devlet-Toplum İlişkileri' },
          { id: 't1_18', name: 'Sermaye ve Emek' },
          { id: 't1_19', name: 'XIX. ve XX. Yüzyılda Değişen Gündelik Hayat' },
          { id: 't1_20', name: 'XX. Yüzyıl Başlarında Osmanlı Devleti ve Dünya' },
          { id: 't1_21', name: 'Millî Mücadele' },
          { id: 't1_22', name: 'Atatürkçülük ve Türk İnkılabı' },
          { id: 't1_23', name: 'İki Savaş Arasındaki Dönemde Türkiye ve Dünya' },
          { id: 't1_24', name: 'II. Dünya Savaşı Sürecinde Türkiye ve Dünya' },
          { id: 't1_25', name: 'II. Dünya Savaşı Sonrasında Türkiye ve Dünya' },
          { id: 't1_26', name: 'Toplumsal Devrim Çağında Dünya ve Türkiye' },
          { id: 't1_27', name: 'XXI Yüzyılın Eşiğinde Türkiye ve Dünya' },
        ]
      },
    ],
    'Mezun': [
      {
        id: 'u1', name: 'AYT Tarih Mezun Konuları',
        topics: [
          { id: 't1_1', name: 'Tarih ve Zaman' },
          { id: 't1_2', name: 'İnsanlığın İlk Dönemleri' },
          { id: 't1_3', name: 'Orta Çağ\'da Dünya' },
          { id: 't1_4', name: 'İlk ve Orta Çağlarda Türk Dünyası' },
          { id: 't1_5', name: 'İslam Medeniyetinin Doğuşu' },
          { id: 't1_6', name: 'Türklerin İslamiyet\'i Kabulü ve İlk Türk İslam Devletleri' },
          { id: 't1_7', name: 'Yerleşme ve Devletleşme Sürecinde Selçuklu Türkiyesi' },
          { id: 't1_8', name: 'Beylikten Devlete Osmanlı Siyaseti' },
          { id: 't1_9', name: 'Devletleşme Sürecinde Savaşçılar ve Askerler' },
          { id: 't1_10', name: 'Beylikten Devlete Osmanlı Medeniyeti' },
          { id: 't1_11', name: 'Dünya Gücü Osmanlı' },
          { id: 't1_12', name: 'Sultan ve Osmanlı Merkez Teşkilatı' },
          { id: 't1_13', name: 'Klasik Çağda Osmanlı Toplum Düzeni' },
          { id: 't1_14', name: 'Değişen Dünya Dengeleri Karşısında Osmanlı Siyaseti' },
          { id: 't1_15', name: 'Değişim Çağında Avrupa ve Osmanlı' },
          { id: 't1_16', name: 'Uluslararası İlişkilerde Denge Stratejisi (1774-1914)' },
          { id: 't1_17', name: 'Devrimler Çağında Değişen Devlet-Toplum İlişkileri' },
          { id: 't1_18', name: 'Sermaye ve Emek' },
          { id: 't1_19', name: 'XIX. ve XX. Yüzyılda Değişen Gündelik Hayat' },
          { id: 't1_20', name: 'XX. Yüzyıl Başlarında Osmanlı Devleti ve Dünya' },
          { id: 't1_21', name: 'Millî Mücadele' },
          { id: 't1_22', name: 'Atatürkçülük ve Türk İnkılabı' },
          { id: 't1_23', name: 'İki Savaş Arasındaki Dönemde Türkiye ve Dünya' },
          { id: 't1_24', name: 'II. Dünya Savaşı Sürecinde Türkiye ve Dünya' },
          { id: 't1_25', name: 'II. Dünya Savaşı Sonrasında Türkiye ve Dünya' },
          { id: 't1_26', name: 'Toplumsal Devrim Çağında Dünya ve Türkiye' },
          { id: 't1_27', name: 'XXI Yüzyılın Eşiğinde Türkiye ve Dünya' },
        ]
      },
    ],
  },
  'osmanlıca': {
    'Diğer': [
      {
        id: 'u1', name: '1. Seviye: Osmanlı Türkçesine Giriş',
        topics: [
          { id: 't1_1', name: 'Osmanlı Alfabesi ve Yazılışı' },
          { id: 't1_2', name: 'Harflerin Birleşimi' },
          { id: 't1_3', name: 'Okutucu Harfler (Elif, He, Vav, Ye)' },
        ]
      },
      {
        id: 'u2', name: '2. Seviye: Temel Okuma',
        topics: [
          { id: 't2_1', name: 'Türkçe Kelimelerin Yazılışı' },
          { id: 't2_2', name: 'Arapça ve Farsça Asıllı Kelimeler' },
          { id: 't2_3', name: 'Gündelik Metinler ve Tabelalar' },
        ]
      },
    ],
  },
  'matematik_ilk': {
    '5. Sınıf': [
      { id: 'u1', name: '1. Ünite: Sayılar ve Nicelikler (Maarif Modeli)', topics: [{ id: 't1_1', name: 'Doğal Sayılar ve Milyonlar' }, { id: 't1_2', name: 'İşlemler ve Zihinden Toplama' }] },
      { id: 'u2', name: '2. Ünite: Algoritma ve Bilişim (Maarif Modeli)', topics: [{ id: 't2_1', name: 'Matematiksel Algoritma Oluşturma' }] },
      { id: 'u3', name: '3. Ünite: Geometrik Şekiller', topics: [{ id: 't3_1', name: 'Temel Geometrik Şekiller ve Açı' }] },
      { id: 'u4', name: '4. Ünite: Veri Analizi ve Olasılık', topics: [{ id: 't4_1', name: 'Veri Toplama ve Yorumlama' }] }
    ],
    '6. Sınıf': [
      { id: 'u1', name: '1. Ünite: Oran ve Orantı', topics: [{ id: 't1_1', name: 'Oran Kavramı ve Gösterimi' }] },
      { id: 'u2', name: '2. Ünite: Cebirsel İfadeler', topics: [{ id: 't2_1', name: 'Cebirsel İfadelerle İşlemler' }] },
      { id: 'u3', name: '3. Ünite: Geometrik Cisimler', topics: [{ id: 't3_1', name: 'Hacim Ölçme ve Tahmin' }] }
    ],
    '7. Sınıf': [
      { id: 'u1', name: '1. Ünite: Tam Sayılar ve Rasyonel Sayılar', topics: [{ id: 't1_1', name: 'Tam Sayılarla İşlemler' }, { id: 't1_2', name: 'Rasyonel Sayılar' }] },
      { id: 'u2', name: '2. Ünite: Eşitlik ve Denklem', topics: [{ id: 't2_1', name: 'Denklem Kurme ve Çözme' }] },
      { id: 'u3', name: '3. Ünite: Yüzdeler ve Veri İşleme', topics: [{ id: 't3_1', name: 'Yüzde Hesaplamaları' }, { id: 't3_2', name: 'Veri Analizi' }] }
    ],
    '8. Sınıf': [
      { id: 'u1', name: '1. Ünite: Çarpanlar ve Katlar / Üslü İfadeler', topics: [{ id: 't1_1', name: 'EBOB-EKOK' }, { id: 't1_2', name: 'Üslü Sayılar' }] },
      { id: 'u2', name: '2. Ünite: Kareköklü İfadeler ve Veri Analizi', topics: [{ id: 't2_1', name: 'Kareköklü Sayılar' }, { id: 't2_2', name: 'Grafik Yorumlama' }] },
      { id: 'u3', name: '3. Ünite: Olasılık ve Cebirsel İfadeler', topics: [{ id: 't3_1', name: 'Olasılık Hesapları' }, { id: 't3_2', name: 'Cebirsel Özdeşlikler' }] }
    ],
  },
  'matematik_lise': {
    '9. Sınıf': [
      { id: 'u1', name: '1. Ünite: Sayılar (Maarif Modeli)', topics: [{ id: 't1_1', name: 'Sayı Kümeleri' }, { id: 't1_2', name: 'Üslü ve Köklü İfadeler' }] },
      { id: 'u2', name: '2. Ünite: Nicelikler ve Değişimler (Maarif Modeli)', topics: [{ id: 't2_1', name: 'Denklemler ve Eşitsizlikler' }] },
      { id: 'u3', name: '3. Ünite: Algoritma ve Bilişim (Maarif Modeli)', topics: [{ id: 't3_1', name: 'Algoritmik Problem Çözme' }] },
      { id: 'u4', name: '4. Ünite: Geometrik Şekiller / Eşlik ve Benzerlik', topics: [{ id: 't4_1', name: 'Üçgenler' }, { id: 't4_2', name: 'Eşlik Kavramı' }] },
      { id: 'u5', name: '5. Ünite: Veriden Olasılığa', topics: [{ id: 't5_1', name: 'Veri Analizi' }, { id: 't5_2', name: 'Olasılık' }] }
    ],
    '10. Sınıf': [
      { id: 'u1', name: '1. Ünite: Sayma ve Olasılık', topics: [{ id: 't1_1', name: 'Permütasyon ve Kombinasyon' }, { id: 't1_2', name: 'Binom Açılımı' }] },
      { id: 'u2', name: '2. Ünite: Fonksiyonlar', topics: [{ id: 't2_1', name: 'Fonksiyon Kavramı ve Grafikler' }] },
      { id: 'u3', name: '3. Ünite: Polinomlar ve Denklem Çözme', topics: [{ id: 't3_1', name: 'Polinomlarla İşlemler' }, { id: 't3_2', name: 'İkinci Dereceden Denklemler' }] },
      { id: 'u4', name: '4. Ünite: Dörtgenler ve Çokgenler', topics: [{ id: 't4_1', name: 'Dörtgen ve Çokgen Özellikleri' }] }
    ],
    '11. Sınıf': [
      { id: 'u1', name: '1. Ünite: Trigonometri', topics: [{ id: 't1_1', name: 'Yönlü Açılar' }, { id: 't1_2', name: 'Trigonometrik Fonksiyonlar' }] },
      { id: 'u2', name: '2. Ünite: Analitik Geometri', topics: [{ id: 't2_1', name: 'Doğrunun Analitik İncelenmesi' }] },
      { id: 'u3', name: '3. Ünite: Fonksiyonlarda Uygulamalar', topics: [{ id: 't3_1', name: 'İkinci Dereceden Fonksiyonlar (Parabol)' }] },
      { id: 'u4', name: '4. Ünite: Denklem ve Eşitsizlik Sistemleri', topics: [{ id: 't4_1', name: 'İki Bilinmeyenli Denklem Sistemleri' }] },
      { id: 'u5', name: '5. Ünite: Çember ve Daire', topics: [{ id: 't5_1', name: 'Çemberin Temel Elemanları' }] }
    ],
    '12. Sınıf': [
      { id: 'u1', name: '1. Ünite: Üstel ve Logaritmik Fonksiyonlar', topics: [{ id: 't1_1', name: 'Üstel Fonksiyon' }, { id: 't1_2', name: 'Logaritma Fonksiyonu' }] },
      { id: 'u2', name: '2. Ünite: Diziler', topics: [{ id: 't2_1', name: 'Aritmetik ve Geometrik Diziler' }] },
      { id: 'u3', name: '3. Ünite: Trigonometri (Toplam-Fark)', topics: [{ id: 't3_1', name: 'Trigonometrik Denklemler' }] },
      { id: 'u4', name: '4. Ünite: Türev', topics: [{ id: 't4_1', name: 'Türev Alma Kuralları' }, { id: 't4_2', name: 'Türevin Uygulamaları' }] },
      { id: 'u5', name: '5. Ünite: İntegral', topics: [{ id: 't5_1', name: 'Belirsiz İntegral' }, { id: 't5_2', name: 'Belirli İntegral Uygulamaları' }] }
    ],
  },
  'turkce': {
    '5. Sınıf': [
      { id: 'u1', name: '1. Tema: Harf Bilgisi', topics: [{ id: 't1_1', name: 'Ünlü ve Ünsüz Harfler' }] },
      { id: 'u2', name: '2. Tema: Sözcükte Anlam', topics: [{ id: 't2_1', name: 'Gerçek ve Mecaz Anlam' }] }
    ]
  },
  'fen_bilimleri': {
    '5. Sınıf': [
      { id: 'u1', name: '1. Ünite: Güneş, Dünya ve Ay', topics: [{ id: 't1_1', name: 'Güneş\'in Yapısı ve Özellikleri' }] }
    ]
  },
};

// All possible grade values (for student form dropdown)
export const ALL_GRADES = [
  '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf',
  '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf', 'Mezun', 'Diğer'
];

// Belirli bir branşa göre aktif edilecek dersleri döndüren yardımcı fonksiyon
export function getSubjectsForBranches(branches = []) {
  if (!branches || branches.length === 0) {
    // Eğer branş seçilmemişse tüm dersleri göster
    return SUBJECTS.map(s => s.id);
  }

  const activeSubjects = new Set();

  branches.forEach(branch => {
    const branchUpper = branch.toUpperCase();
    
    // 1) Bilinen özel haritalamalar (Tarihçi hem tarih hem ayt/tyt/inkılap görür)
    if (branchUpper.includes('TARİH') || branchUpper.includes('TARIH')) {
      if (branchUpper.includes('İNKILAP') || branchUpper.includes('INKILAP')) {
        activeSubjects.add('inkılap');
      } else {
        activeSubjects.add('tarih');
        activeSubjects.add('tyt');
        activeSubjects.add('ayt');
        activeSubjects.add('inkılap'); 
      }
    } else if (branchUpper.includes('MATEMATİK (LİSE)') || branchUpper.includes('MATEMATIK (LISE)')) {
      activeSubjects.add('matematik_lise');
      activeSubjects.add('tyt');
      activeSubjects.add('ayt');
    } else if (branchUpper.includes('MATEMATİK (İLKÖĞRETİM)') || branchUpper.includes('MATEMATIK (ILKOGRETIM)')) {
      activeSubjects.add('matematik_ilk');
    } else if (branchUpper.includes('OSMANLI')) {
      activeSubjects.add('osmanlıca');
    } else if (branchUpper.includes('SOSYAL BİLGİLER') || branchUpper.includes('SOSYAL BILGILER')) {
      activeSubjects.add('sosyal');
      activeSubjects.add('inkılap');
    } else {
      // 2) Diğer her branş için kendi ID'sini oluştur (Matematik -> matematik)
      // Türkçe karakterleri ve boşlukları temizleyerek ID oluşturuyoruz
      const id = branch.toLowerCase()
        .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
        .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/\s+/g, '_');
      activeSubjects.add(id);
    }
  });

  return Array.from(activeSubjects);
}

// Grade → Subject mapping for auto-curriculum assignment is now dynamic in store.js using getSubjectsForBranches
export const DAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
export const DAYS_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
export const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];
