// ═══════════════════════════════════════════════════
// CURRICULUM SEED DATA
// ═══════════════════════════════════════════════════

export const SUBJECTS = [
  { id: 'sosyal', name: 'Sosyal Bilgiler', icon: '🌍' },
  { id: 'inkılap', name: 'İnkılap Tarihi', icon: '⚡' },
  { id: 'tarih', name: 'Tarih', icon: '📜' },
  { id: 'tyt', name: 'TYT', icon: '📝' },
  { id: 'ayt', name: 'AYT', icon: '🎯' },
  { id: 'osmanlıca', name: 'Osmanlıca', icon: '📖' },
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

// Default curriculum structure
export const DEFAULT_CURRICULUM = {
  'sosyal': {
    '5. Sınıf': [
      {
        id: 'u1', name: 'Ünite 1: Bireysel Gelişim',
        topics: [
          { id: 't1_1', name: 'Kişisel Gelişim' },
          { id: 't1_2', name: 'Aile ve Sosyal Çevre' },
          { id: 't1_3', name: 'Hak ve Sorumluluklar' },
        ]
      },
      {
        id: 'u2', name: 'Ünite 2: Kültür ve Miras',
        topics: [
          { id: 't2_1', name: 'Kültür Nedir?' },
          { id: 't2_2', name: 'Somut ve Somut Olmayan Miras' },
          { id: 't2_3', name: 'Türk Kültürü' },
        ]
      },
      {
        id: 'u3', name: 'Ünite 3: İnsanlar, Yerler ve Çevreler',
        topics: [
          { id: 't3_1', name: 'Türkiye\'nin Coğrafyası' },
          { id: 't3_2', name: 'Doğal Afetler' },
          { id: 't3_3', name: 'Çevre ve İnsan' },
        ]
      },
    ],
    '6. Sınıf': [
      {
        id: 'u1', name: 'Ünite 1: Sosyal Bilgiler Öğreniyorum',
        topics: [
          { id: 't1_1', name: 'Harita Bilgisi' },
          { id: 't1_2', name: 'Ülkemiz ve Dünya' },
        ]
      },
      {
        id: 'u2', name: 'Ünite 2: Yeryüzünde Yaşam',
        topics: [
          { id: 't2_1', name: 'İklim Bölgeleri' },
          { id: 't2_2', name: 'Dünya\'da Nüfus' },
          { id: 't2_3', name: 'Göç' },
        ]
      },
    ],
    '7. Sınıf': [
      {
        id: 'u1', name: 'Ünite 1: İletişim ve İnsan İlişkileri',
        topics: [
          { id: 't1_1', name: 'İletişim Nedir?' },
          { id: 't1_2', name: 'Kitle İletişim Araçları' },
        ]
      },
      {
        id: 'u2', name: 'Ünite 2: Ülkemizde Nüfus',
        topics: [
          { id: 't2_1', name: 'Türkiye Nüfusu' },
          { id: 't2_2', name: 'Nüfus Hareketleri' },
        ]
      },
    ],
  },
  'inkılap': {
    '8. Sınıf': [
      {
        id: 'u1', name: 'Ünite 1: Bir Kahraman Doğuyor',
        topics: [
          { id: 't1_1', name: 'Mustafa Kemal\'in Çocukluğu' },
          { id: 't1_2', name: 'Askeri Eğitim Yılları' },
          { id: 't1_3', name: 'İlk Görevler' },
        ]
      },
      {
        id: 'u2', name: 'Ünite 2: Milli Uyanış',
        topics: [
          { id: 't2_1', name: 'Osmanlı\'nın Son Dönemi' },
          { id: 't2_2', name: 'Mondros Mütarekesi' },
          { id: 't2_3', name: 'Mustafa Kemal\'in Samsun\'a Çıkışı' },
        ]
      },
      {
        id: 'u3', name: 'Ünite 3: Ya İstiklal Ya Ölüm',
        topics: [
          { id: 't3_1', name: 'Müdafaa-i Hukuk Cemiyetleri' },
          { id: 't3_2', name: 'Erzurum ve Sivas Kongreleri' },
          { id: 't3_3', name: 'Misak-ı Millî' },
        ]
      },
      {
        id: 'u4', name: 'Ünite 4: Atatürk İlkeleri ve İnkılaplar',
        topics: [
          { id: 't4_1', name: 'Siyasi Alanda İnkılaplar' },
          { id: 't4_2', name: 'Sosyal Alanda İnkılaplar' },
          { id: 't4_3', name: 'Ekonomi ve Eğitim İnkılapları' },
          { id: 't4_4', name: 'Atatürk İlkeleri' },
        ]
      },
    ],
  },
  'tarih': {
    '9. Sınıf': [
      {
        id: 'u1', name: 'Ünite 1: Tarih ve Zaman',
        topics: [
          { id: 't1_1', name: 'Tarihin Tanımı ve Önemi' },
          { id: 't1_2', name: 'Zaman ve Takvim' },
          { id: 't1_3', name: 'Tarih Bilimine Yardımcı Bilimler' },
        ]
      },
      {
        id: 'u2', name: 'Ünite 2: İnsanlığın İlk Dönemleri',
        topics: [
          { id: 't2_1', name: 'İnsanın Ortaya Çıkışı' },
          { id: 't2_2', name: 'Yapılan Keşifler' },
          { id: 't2_3', name: 'İlk Uygarlıklar' },
        ]
      },
    ],
    '10. Sınıf': [
      {
        id: 'u1', name: 'Ünite 1: Osmanlı Devleti\'nin Kuruluşu',
        topics: [
          { id: 't1_1', name: 'Kuruluş Dönemi' },
          { id: 't1_2', name: 'Beylikten Devlete' },
        ]
      },
      {
        id: 'u2', name: 'Ünite 2: Osmanlı Devleti\'nin Yükselme Dönemi',
        topics: [
          { id: 't2_1', name: 'Fatih Sultan Mehmet' },
          { id: 't2_2', name: 'İstanbul\'un Fethi' },
          { id: 't2_3', name: 'Kanuni Sultan Süleyman' },
        ]
      },
    ],
    '11. Sınıf': [
      {
        id: 'u1', name: 'Ünite 1: Osmanlı\'nın Duraklama ve Gerileme Dönemi',
        topics: [
          { id: 't1_1', name: 'Duraklama Dönemi Nedenleri' },
          { id: 't1_2', name: 'Islahat Hareketleri' },
        ]
      },
      {
        id: 'u2', name: 'Ünite 2: Tanzimat ve Reform Dönemi',
        topics: [
          { id: 't2_1', name: 'Tanzimat Fermanı' },
          { id: 't2_2', name: 'Islahat Fermanı' },
          { id: 't2_3', name: 'Meşrutiyet Dönemi' },
        ]
      },
    ],
    '12. Sınıf': [
      {
        id: 'u1', name: 'Ünite 1: Osmanlı\'nın Çöküşü ve Millî Mücadele',
        topics: [
          { id: 't1_1', name: 'Birinci Dünya Savaşı' },
          { id: 't1_2', name: 'Mondros ve Sevr' },
          { id: 't1_3', name: 'Millî Mücadele\'nin Başlaması' },
        ]
      },
      {
        id: 'u2', name: 'Ünite 2: Türkiye Cumhuriyeti\'nin Kuruluşu',
        topics: [
          { id: 't2_1', name: 'Lozan Barışı' },
          { id: 't2_2', name: 'Cumhuriyetin İlanı' },
          { id: 't2_3', name: 'Atatürk Dönemi Politikaları' },
        ]
      },
    ],
  },
  'tyt': {
    '12. Sınıf': [
      {
        id: 'u1', name: 'TYT Tarih Konuları',
        topics: [
          { id: 't1_1', name: 'Tarih Öncesi ve İlk Çağ' },
          { id: 't1_2', name: 'Orta Çağ Tarihi' },
          { id: 't1_3', name: 'Osmanlı Tarihi Temel Konular' },
          { id: 't1_4', name: 'Millî Mücadele' },
        ]
      },
    ],
    'Mezun': [
      {
        id: 'u1', name: 'TYT Tarih Konuları (Tekrar)',
        topics: [
          { id: 't1_1', name: 'Tüm konuların özeti' },
          { id: 't1_2', name: 'Soru tipi analizi' },
        ]
      },
    ],
  },
  'ayt': {
    '12. Sınıf': [
      {
        id: 'u1', name: 'AYT Tarih Konuları',
        topics: [
          { id: 't1_1', name: 'Osmanlı\'nın Yükselme Dönemi' },
          { id: 't1_2', name: 'Osmanlı\'da Reform Hareketleri' },
          { id: 't1_3', name: 'Millî Mücadele Detaylı' },
          { id: 't1_4', name: 'Cumhuriyet Dönemi' },
        ]
      },
    ],
    'Mezun': [
      {
        id: 'u1', name: 'AYT Tarih (Pekiştirme)',
        topics: [
          { id: 't1_1', name: 'Kronoloji ve Bağlantılar' },
          { id: 't1_2', name: 'Zor Sorular Analizi' },
        ]
      },
    ],
  },
  'osmanlıca': {
    'Diğer': [
      {
        id: 'u1', name: 'Osmanlı Türkçesi Temel',
        topics: [
          { id: 't1_1', name: 'Alfabe ve Harfler' },
          { id: 't1_2', name: 'Kelime Hazinesi' },
          { id: 't1_3', name: 'Metin Okuma' },
        ]
      },
      {
        id: 'u2', name: 'Osmanlı Türkçesi İleri',
        topics: [
          { id: 't2_1', name: 'Divan Edebiyatı Metinleri' },
          { id: 't2_2', name: 'Belgeler ve Fermanlar' },
        ]
      },
    ],
  },
};

// All possible grade values (for student form dropdown)
export const ALL_GRADES = [
  '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf',
  '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf', 'Mezun', 'Diğer'
];

// Grade → Subject mapping for auto-curriculum assignment
export const GRADE_TO_SUBJECTS = {
  '5. Sınıf':  [{ subject: 'sosyal', grade: '5. Sınıf' }],
  '6. Sınıf':  [{ subject: 'sosyal', grade: '6. Sınıf' }],
  '7. Sınıf':  [{ subject: 'sosyal', grade: '7. Sınıf' }],
  '8. Sınıf':  [{ subject: 'inkılap', grade: '8. Sınıf' }],
  '9. Sınıf':  [{ subject: 'tarih', grade: '9. Sınıf' }],
  '10. Sınıf': [{ subject: 'tarih', grade: '10. Sınıf' }],
  '11. Sınıf': [{ subject: 'tarih', grade: '11. Sınıf' }],
  '12. Sınıf': [
    { subject: 'tarih', grade: '12. Sınıf' },
    { subject: 'tyt', grade: '12. Sınıf' },
    { subject: 'ayt', grade: '12. Sınıf' },
  ],
  'Mezun':     [
    { subject: 'tyt', grade: 'Mezun' },
    { subject: 'ayt', grade: 'Mezun' },
  ],
  'Diğer':     [{ subject: 'osmanlıca', grade: 'Diğer' }],
};

export const DAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
export const DAYS_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
export const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];
