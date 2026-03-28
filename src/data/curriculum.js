// ═══════════════════════════════════════════════════
// CURRICULUM SEED DATA
// ═══════════════════════════════════════════════════

export const ALL_BRANCHES = [
  "Türkçe", "Türk Dili ve Edebiyatı", "Matematik", "Fen Bilimleri", "Fizik", "Kimya", "Biyoloji", 
  "Sosyal Bilgiler", "T.C. İnkılap Tarihi ve Atatürkçülük", "Tarih", "Coğrafya", "Felsefe", 
  "Psikoloji", "Sosyoloji", "Mantık", "İngilizce", "Almanca", "Fransızca", "Arapça", 
  "Din Kültürü ve Ahlak Bilgisi", "Bilişim Teknolojileri", "Görsel Sanatlar", "Müzik", 
  "Beden Eğitimi ve Spor", "Teknoloji ve Tasarım", "Rehberlik", "Osmanlı Türkçesi"
];

export const SUBJECTS = [
  { id: 'sosyal', name: 'Sosyal Bilgiler', icon: '🌍' },
  { id: 'inkılap', name: 'İnkılap Tarihi', icon: '⚡' },
  { id: 'tarih', name: 'Tarih', icon: '📜' },
  { id: 'tyt', name: 'TYT', icon: '📝' },
  { id: 'ayt', name: 'AYT', icon: '🎯' },
  { id: 'osmanlıca', name: 'Osmanlı Türkçesi', icon: '📖' },
  { id: 'matematik', name: 'Matematik', icon: '🔢' },
  { id: 'turkce', name: 'Türkçe', icon: '✍️' },
  { id: 'fen_bilimleri', name: 'Fen Bilimleri', icon: '🧪' },
];

export const SUBJECT_GRADES = {
  'sosyal':    ['5. Sınıf', '6. Sınıf', '7. Sınıf'],
  'inkılap':   ['8. Sınıf'],
  'tarih':     ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'tyt':       ['12. Sınıf', 'Mezun'],
  'ayt':       ['12. Sınıf', 'Mezun'],
  'osmanlıca': ['Diğer'],
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
        id: 'u1', name: '1. Ünite: Birey ve Toplum',
        topics: [
          { id: 't1_1', name: 'Sosyal Rollerin Zaman İçindeki Değişimi' },
          { id: 't1_2', name: 'Kültürel Gelişim' },
          { id: 't1_3', name: 'Toplumsal Birliktelik' },
          { id: 't1_4', name: 'Hak ve Sorumluluklarımız' },
        ]
      },
      {
        id: 'u2', name: '2. Ünite: Kültür ve Miras',
        topics: [
          { id: 't2_1', name: 'Anadolu ve Mezopotamya Uygarlıkları' },
          { id: 't2_2', name: 'Tarihe Yolculuk' },
          { id: 't2_3', name: 'Kültürel Ögelerimiz' },
        ]
      },
      {
        id: 'u3', name: '3. Ünite: İnsanlar, Yerler ve Çevreler',
        topics: [
          { id: 't3_1', name: 'Yeryüzü Şekilleri ve İklim' },
          { id: 't3_2', name: 'Nüfus ve Yerleşme' },
          { id: 't3_3', name: 'Doğal Afetler ve Çevre' },
        ]
      },
      {
        id: 'u4', name: '4. Ünite: Bilim, Teknoloji ve Toplum',
        topics: [
          { id: 't4_1', name: 'Teknolojinin Topluma Etkisi' },
          { id: 't4_2', name: 'Doğru Bilgiye Ulaşmak' },
          { id: 't4_3', name: 'Bilim İnsanları ve Buluşlar' },
        ]
      },
    ],
    '6. Sınıf': [
      {
        id: 'u1', name: '1. Ünite: Birey ve Toplum',
        topics: [
          { id: 't1_1', name: 'Rollerimiz ve Sorumluluklarımız' },
          { id: 't1_2', name: 'Kültür ve Birlik' },
          { id: 't1_3', name: 'Ön Yargıları Kırmak' },
        ]
      },
      {
        id: 'u2', name: '2. Ünite: Kültür ve Miras',
        topics: [
          { id: 't2_1', name: 'Orta Asya İlk Türk Devletleri' },
          { id: 't2_2', name: 'İslamiyet\'in Doğuşu' },
          { id: 't2_3', name: 'İlk Türk İslam Devletleri' },
        ]
      },
      {
        id: 'u3', name: '3. Ünite: İnsanlar, Yerler ve Çevreler',
        topics: [
          { id: 't3_1', name: 'Dünyanın Konumu ve Coğrafi Koordinatlar' },
          { id: 't3_2', name: 'Türkiye\'nin Fiziki Coğrafyası' },
        ]
      },
    ],
    '7. Sınıf': [
      {
        id: 'u1', name: '1. Ünite: Birey ve Toplum',
        topics: [
          { id: 't1_1', name: 'İletişim ve İnsan İlişkileri' },
          { id: 't1_2', name: 'Kitle İletişim Araçları' },
        ]
      },
      {
        id: 'u2', name: '2. Ünite: Kültür ve Miras',
        topics: [
          { id: 't2_1', name: 'Osmanlı Devleti\'nin Kuruluşu ve Yükselişi' },
          { id: 't2_2', name: 'Avrupa\'daki Gelişmeler ve Osmanlı' },
          { id: 't2_3', name: 'Osmanlı Toplumunda Kültür ve Sanat' },
        ]
      },
      {
        id: 'u3', name: '3. Ünite: İnsanlar, Yerler ve Çevreler',
        topics: [
          { id: 't3_1', name: 'Türkiye\'de Nüfus ve Göç' },
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
          { id: 't1_2', name: 'Mustafa Kemal\'in Çocukluğu ve Eğitimi' },
          { id: 't1_3', name: 'Mustafa Kemal\'in Askerlik Hayatı' },
        ]
      },
      {
        id: 'u2', name: '2. Ünite: Millî Uyanış - Bağımsızlık Yolunda Atılan Adımlar',
        topics: [
          { id: 't2_1', name: 'Birinci Dünya Savaşı ve Osmanlı' },
          { id: 't2_2', name: 'Mondros Ateşkes Antlaşması ve İşgaller' },
          { id: 't2_3', name: 'Kuvâ-yı Millîye ve Cemiyetler' },
          { id: 't2_4', name: 'Mustafa Kemal\'in Samsun\'a Çıkışı ve Kongreler' },
          { id: 't2_5', name: 'Misak-ı Millî ve TBMM\'nin Açılışı' },
        ]
      },
      {
        id: 'u3', name: '3. Ünite: Ya İstiklal Ya Ölüm!',
        topics: [
          { id: 't3_1', name: 'Doğu ve Güney Cepheleri' },
          { id: 't3_2', name: 'Batı Cephesi Savaşları' },
          { id: 't3_3', name: 'Maarif Kongresi ve Tekâlif-i Millîye' },
          { id: 't3_4', name: 'Mudanya ve Lozan Barış Antlaşmaları' },
        ]
      },
      {
        id: 'u4', name: '4. Ünite: Atatürkçülük ve Çağdaşlaşan Türkiye',
        topics: [
          { id: 't4_1', name: 'Siyasi Alandaki İnkılaplar' },
          { id: 't4_2', name: 'Hukuk, Eğitim ve Kültür Alanındaki İnkılaplar' },
          { id: 't4_3', name: 'Toplumsal ve Ekonomik Alandaki İnkılaplar' },
          { id: 't4_4', name: 'Atatürk İlkeleri' },
        ]
      },
      {
        id: 'u5', name: '5. Ünite: Demokratikleşme Çabaları',
        topics: [
          { id: 't5_1', name: 'Çok Partili Hayata Geçiş Denemeleri' },
          { id: 't5_2', name: 'Cumhuriyete Yönelik Tehditler' },
        ]
      },
      {
        id: 'u6', name: '6. Ünite: Atatürk Dönemi Türk Dış Politikası',
        topics: [
          { id: 't6_1', name: 'Türk Dış Politikasının Temel İlkeleri' },
          { id: 't6_2', name: 'Atatürk Dönemi Dış Politika Gelişmeleri' },
        ]
      },
      {
        id: 'u7', name: '7. Ünite: Atatürk\'ün Ölümü ve Sonrası',
        topics: [
          { id: 't7_1', name: 'Atatürk\'ün Vefatı' },
          { id: 't7_2', name: 'İkinci Dünya Savaşı ve Türkiye' },
        ]
      },
    ],
    '12. Sınıf': [
      {
        id: 'u1', name: '1. Ünite: XX. Yüzyıl Başlarında Osmanlı Devleti ve Dünya',
        topics: [
          { id: 't1_1', name: 'XX. Yüzyıl Başlarında Dünya' },
          { id: 't1_2', name: 'Osmanlı Devleti\'nin Son Dönemi Düşünce Akımları' },
          { id: 't1_3', name: 'Trablusgarp ve Balkan Savaşları' },
          { id: 't1_4', name: 'I. Dünya Savaşı' },
        ]
      },
      {
        id: 'u2', name: '2. Ünite: Millî Mücadele',
        topics: [
          { id: 't2_1', name: 'Mondros Mütarekesi ve Cemiyetler' },
          { id: 't2_2', name: 'Mustafa Kemal\'in Samsun\'a Çıkışı ve Genelgeler' },
          { id: 't2_3', name: 'Büyük Millet Meclisinin Açılması ve İsyanlar' },
          { id: 't2_4', name: 'Sevr Antlaşması' },
          { id: 't2_5', name: 'Doğu, Güney ve Batı Cepheleri' },
          { id: 't2_6', name: 'Mudanya ve Lozan Barış Antlaşmaları' },
        ]
      },
      {
        id: 'u3', name: '3. Ünite: Atatürkçülük ve Türk İnkılabı',
        topics: [
          { id: 't3_1', name: 'Atatürk İlkeleri' },
          { id: 't3_2', name: 'Siyasi Alandaki İnkılaplar' },
          { id: 't3_3', name: 'Hukuk ve Eğitim Alanındaki İnkılaplar' },
          { id: 't3_4', name: 'Toplumsal ve Ekonomik Alandaki Gelişmeler' },
        ]
      },
      {
        id: 'u4', name: '4. Ünite: İki Savaş Arasındaki Dönemde Türkiye ve Dünya',
        topics: [
          { id: 't4_1', name: 'Atatürk Dönemi İç ve Dış Politika' },
          { id: 't4_2', name: 'İki Savaş Arasındaki Dönemde Dünyadaki Siyasi Gelişmeler' },
        ]
      },
      {
        id: 'u5', name: '5. Ünite: II. Dünya Savaşı Sürecinde Türkiye ve Dünya',
        topics: [
          { id: 't5_1', name: 'II. Dünya Savaşı\'nın Başlaması ve Gelişimi' },
          { id: 't5_2', name: 'Savaş Yıllarında Türkiye' },
        ]
      },
      {
        id: 'u6', name: '6. Ünite: II. Dünya Savaşı Sonrasında Türkiye ve Dünya',
        topics: [
          { id: 't6_1', name: 'Soğuk Savaş Dönemi Başlangıcı' },
          { id: 't6_2', name: 'Türkiye\'nin Çok Partili Hayata Geçişi' },
          { id: 't6_3', name: 'Demokrat Parti Dönemi' },
        ]
      },
    ],
  },
  'tarih': {
    '9. Sınıf': [
      {
        id: 'u1', name: '1. Ünite: Tarih ve Zaman',
        topics: [
          { id: 't1_1', name: 'Tarih Nedir?' },
          { id: 't1_2', name: 'Zamanın Taksimi' },
          { id: 't1_3', name: 'İnsanlığın Hafızası: Tarih' },
        ]
      },
      {
        id: 'u2', name: '2. Ünite: Kadim Dünyada İnsan',
        topics: [
          { id: 't2_1', name: 'İnsanın İlk İzleri ve Yerleşik Hayata Geçiş' },
          { id: 't2_2', name: 'Uygarlık Havzaları' },
        ]
      },
      {
        id: 'u3', name: '3. Ünite: İlk Çağ ve Göçler',
        topics: [
          { id: 't3_1', name: 'Göçlerin Nedenleri ve Sonuçları' },
          { id: 't3_2', name: 'İlk Çağ\'ın Tüccar Toplulukları' },
          { id: 't3_3', name: 'Kabileden Devlete' },
          { id: 't3_4', name: 'Kanunlar Doğuyor' },
        ]
      },
      {
        id: 'u4', name: '4. Ünite: Türklerin Ana Yurdu ve İlk Türk Devletleri',
        topics: [
          { id: 't4_1', name: 'Avrasya\'da İlk Türk İzleri' },
          { id: 't4_2', name: 'Asya Hun Devleti' },
          { id: 't4_3', name: 'Kök Türk ve Uygur Devletleri' },
          { id: 't4_4', name: 'İlk Türk Devletlerinde Teşkilat ve Kültür' },
        ]
      },
      {
        id: 'u5', name: '5. Ünite: İslamiyet\'in Doğuşu ve İlk İslam Devletleri',
        topics: [
          { id: 't5_1', name: 'İslamiyet Öncesi Arap Yarımadası' },
          { id: 't5_2', name: 'Hz. Muhammed Dönemi ve Dört Halife Dönemi' },
          { id: 't5_3', name: 'Emeviler ve Abbasiler' },
        ]
      },
      {
        id: 'u6', name: '6. Ünite: Türklerin İslamiyet\'i Kabulü ve İlk Türk İslam Devletleri',
        topics: [
          { id: 't6_1', name: 'Türk-Arap İlişkileri ve İslamiyet\'in Kabulü' },
          { id: 't6_2', name: 'Karahanlılar ve Gazneliler' },
          { id: 't6_3', name: 'Büyük Selçuklu Devleti' },
          { id: 't6_4', name: 'İlk Türk İslam Devletlerinde Kültür ve Medeniyet' },
        ]
      },
    ],
    '10. Sınıf': [
      {
        id: 'u1', name: '1. Ünite: Yerleşme ve Devletleşme Sürecinde Selçuklu Türkiyesi',
        topics: [
          { id: 't1_1', name: '1071 Malazgirt Sonrası Anadolu' },
          { id: 't1_2', name: 'Anadolu Selçuklu Devleti\'nin Kuruluşu' },
          { id: 't1_3', name: 'Anadolu Selçuklularında Teşkilat ve Kültür' },
          { id: 't1_4', name: 'Haçlı Seferleri ve Etkileri' },
          { id: 't1_5', name: 'Moğol İstilası ve Kösedağ Savaşı' },
        ]
      },
      {
        id: 'u2', name: '2. Ünite: Beylikten Devlete Osmanlı Siyaseti (1302-1453)',
        topics: [
          { id: 't2_1', name: 'Osmanlı Devleti\'nin Kuruluş Macerası' },
          { id: 't2_2', name: 'Balkanlarda Fetih ve İskan Siyaseti' },
          { id: 't2_3', name: 'Anadolu\'da Siyasi Birlik Çabaları' },
          { id: 't2_4', name: 'Ankara Savaşı ve Fetret Devri' },
        ]
      },
      {
        id: 'u3', name: '3. Ünite: Devletleşme Sürecinde Savaşçılar ve Askerler',
        topics: [
          { id: 't3_1', name: 'Tımar Sistemi' },
          { id: 't3_2', name: 'Yeniçeri Ocağı ve Kapıkulu Askerleri' },
        ]
      },
      {
        id: 'u4', name: '4. Ünite: Beylikten Devlete Osmanlı Medeniyeti',
        topics: [
          { id: 't4_1', name: 'Osmanlı Toplum Yapısı' },
          { id: 't4_2', name: 'İlim ve İrfan Erbapları' },
          { id: 't4_3', name: 'Sözlü ve Yazılı Kültür' },
        ]
      },
      {
        id: 'u5', name: '5. Ünite: Dünya Gücü Osmanlı (1453-1595)',
        topics: [
          { id: 't5_1', name: 'İstanbul\'un Fethi' },
          { id: 't5_2', name: 'Yavuz Sultan Selim ve Mısır Seferi' },
          { id: 't5_3', name: 'Kanuni Sultan Süleyman Dönemi' },
          { id: 't5_4', name: 'Akdeniz\'de Hakimiyet' },
        ]
      },
      {
        id: 'u6', name: '6. Ünite: Sultan ve Osmanlı Merkez Teşkilatı',
        topics: [
          { id: 't6_1', name: 'Topkapı Sarayı ve İşlevleri' },
          { id: 't6_2', name: 'Divan-ı Hümayun' },
          { id: 't6_3', name: 'Merkezî Otoritenin Güçlendirilmesi' },
        ]
      },
      {
        id: 'u7', name: '7. Ünite: Klasik Çağda Osmanlı Toplum Düzeni',
        topics: [
          { id: 't7_1', name: 'Millet Sistemi' },
          { id: 't7_2', name: 'Osmanlı Ekonomisinde Lonca Teşkilatı ve Tarım' },
        ]
      },
    ],
    '11. Sınıf': [
      {
        id: 'u1', name: '1. Ünite: Değişen Dünya Dengeleri Karşısında Osmanlı Siyaseti (1595-1774)',
        topics: [
          { id: 't1_1', name: 'XVII. Yüzyıl Siyasi Ortamında Osmanlı Devleti' },
          { id: 't1_2', name: 'Uzun Savaşlardan Diplomasiye' },
          { id: 't1_3', name: 'Karlofça Antlaşması Sonrası Dış Politika' },
        ]
      },
      {
        id: 'u2', name: '2. Ünite: Değişim Çağında Avrupa ve Osmanlı',
        topics: [
          { id: 't2_1', name: 'Avrupa\'da Değişim Süreci' },
          { id: 't2_2', name: 'Osmanlı Sosyo-Ekonomik Yapısında Değişiklikler' },
          { id: 't2_3', name: 'İsyanlar ve Değişim Çabaları' },
        ]
      },
      {
        id: 'u3', name: '3. Ünite: Uluslararası İlişkilerde Denge Stratejisi (1774-1914)',
        topics: [
          { id: 't3_1', name: 'XIX. Yüzyıl Siyasi Gelişmeleri ve Şark Meselesi' },
          { id: 't3_2', name: 'Osmanlı Devleti ve Denge Politikası' },
          { id: 't3_3', name: 'Kırım Savaşı ve Paris Antlaşması' },
          { id: 't3_4', name: '93 Harbi ve Berlin Antlaşması' },
        ]
      },
      {
        id: 'u4', name: '4. Ünite: Devrimler Çağında Değişen Devlet-Toplum İlişkileri',
        topics: [
          { id: 't4_1', name: 'Sanayi İnkılabı ve Fransız İhtilali\'nin Etkileri' },
          { id: 't4_2', name: 'Osmanlı Devleti\'nde İdari ve Askeri Islahatlar' },
          { id: 't4_3', name: 'Tanzimat, Islahat ve Meşrutiyet Dönemleri' },
        ]
      },
      {
        id: 'u5', name: '5. Ünite: Sermaye ve Emek',
        topics: [
          { id: 't5_1', name: 'Kapitalizm ve Klasik Üretimden Endüstriyel Üretime' },
          { id: 't5_2', name: 'Osmanlı Ekonomisinde Değişimler ve Duyun-ı Umumiye' },
        ]
      },
      {
        id: 'u6', name: '6. Ünite: XIX. ve XX. Yüzyılda Değişen Gündelik Hayat',
        topics: [
          { id: 't6_1', name: 'Ulus Devletleşme ve Modern Ordular' },
          { id: 't6_2', name: 'Osmanlı Modernleşmesi ve Nüfus Hareketleri' },
          { id: 't6_3', name: 'Matbuat ve İletişim' },
        ]
      },
    ],
    '12. Sınıf': [
      {
        id: 'u1', name: '1. Ünite: XX. Yüzyıl Başlarında Osmanlı Devleti ve Dünya',
        topics: [
          { id: 't1_1', name: 'XX. Yüzyıl Başlarında Dünya' },
          { id: 't1_2', name: 'Osmanlı Devleti\'nin Son Dönemi Düşünce Akımları' },
          { id: 't1_3', name: 'Trablusgarp ve Balkan Savaşları' },
          { id: 't1_4', name: 'I. Dünya Savaşı' },
        ]
      },
      {
        id: 'u2', name: '2. Ünite: Millî Mücadele',
        topics: [
          { id: 't2_1', name: 'Mondros Mütarekesi ve Cemiyetler' },
          { id: 't2_2', name: 'Mustafa Kemal\'in Samsun\'a Çıkışı ve Genelgeler' },
          { id: 't2_3', name: 'Büyük Millet Meclisinin Açılması ve İsyanlar' },
          { id: 't2_4', name: 'Sevr Antlaşması' },
          { id: 't2_5', name: 'Doğu, Güney ve Batı Cepheleri' },
          { id: 't2_6', name: 'Mudanya ve Lozan Barış Antlaşmaları' },
        ]
      },
      {
        id: 'u3', name: '3. Ünite: Atatürkçülük ve Türk İnkılabı',
        topics: [
          { id: 't3_1', name: 'Atatürk İlkeleri' },
          { id: 't3_2', name: 'Siyasi Alandaki İnkılaplar' },
          { id: 't3_3', name: 'Hukuk ve Eğitim Alanındaki İnkılaplar' },
          { id: 't3_4', name: 'Toplumsal ve Ekonomik Alandaki Gelişmeler' },
        ]
      },
      {
        id: 'u4', name: '4. Ünite: İki Savaş Arasındaki Dönemde Türkiye ve Dünya',
        topics: [
          { id: 't4_1', name: 'Atatürk Dönemi İç ve Dış Politika' },
          { id: 't4_2', name: 'İki Savaş Arasındaki Dönemde Dünyadaki Siyasi Gelişmeler' },
        ]
      },
      {
        id: 'u5', name: '5. Ünite: II. Dünya Savaşı Sürecinde Türkiye ve Dünya',
        topics: [
          { id: 't5_1', name: 'II. Dünya Savaşı\'nın Başlaması ve Gelişimi' },
          { id: 't5_2', name: 'Savaş Yıllarında Türkiye' },
        ]
      },
      {
        id: 'u6', name: '6. Ünite: II. Dünya Savaşı Sonrasında Türkiye ve Dünya',
        topics: [
          { id: 't6_1', name: 'Soğuk Savaş Dönemi Başlangıcı' },
          { id: 't6_2', name: 'Türkiye\'nin Çok Partili Hayata Geçişi' },
          { id: 't6_3', name: 'Demokrat Parti Dönemi' },
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
  'matematik': {
    '5. Sınıf': [
      { id: 'u1', name: '1. Ünite: Doğal Sayılar', topics: [{ id: 't1_1', name: 'Milyonlar' }, { id: 't1_2', name: 'Örüntüler' }] },
      { id: 'u2', name: '2. Ünite: İşlemler', topics: [{ id: 't1_1', name: 'Toplama ve Çıkarma' }, { id: 't1_2', name: 'Zihinden İşlemler' }] }
    ],
    '9. Sınıf': [
      { id: 'u1', name: '1. Ünite: Mantık', topics: [{ id: 't1_1', name: 'Önermeler' }, { id: 't1_2', name: 'Bileşik Önermeler' }] },
      { id: 'u2', name: '2. Ünite: Kümeler', topics: [{ id: 't2_1', name: 'Kümelerde Temel Kavramlar' }, { id: 't2_2', name: 'Alt Küme' }] }
    ]
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
