// ═════════════════════════════════════════════════
// KONU İLERLEMESİ (grup ve öğrenci)
// ─────────────────────────────────────────────────
// Her grup/öğrenci için konu bazında durum tutulur:
//   entity.topicProgress = { [konuAnahtarı]: { s: 'done' | 'partial', note?: string, date: 'YYYY-MM-DD' } }
// Konu anahtarı "ders|sınıf|ünite|konu" biçimindedir; çünkü müfredattaki konu kimlikleri
// (t1_1 gibi) farklı dersler ve sınıflarda tekrar ediyor.
// Kaydı olmayan konu "işlenmedi" sayılır.
// Geriye dönük uyumluluk: topicProgress henüz yoksa eski entity.completedTopics (bitti listesi) okunur;
// ilk değişiklikte o liste yeni yapıya taşınır ve sonrasında 'done' olanlarla senkron tutulur.
// ═════════════════════════════════════════════════
import { getSubjectsForBranches, SUBJECTS } from '../data/curriculum.js';

export const STATUS = {
  done: { label: 'Bitti', color: '#10b981', soft: 'rgba(16,185,129,0.10)' },
  partial: { label: 'Yarım kaldı', color: '#f59e0b', soft: 'rgba(245,158,11,0.12)' },
  none: { label: 'İşlenmedi', color: '#94a3b8', soft: 'transparent' },
};

/** Bir konunun benzersiz anahtarı */
export const topicKey = (subject, grade, unitId, topicId) => `${subject}|${grade}|${unitId}|${topicId}`;

/**
 * Değerlendirme bölümleri ("Kendimi Değerlendiriyorum", "Ölçme ve Değerlendirme Soruları").
 * Bunlar telafiyle ayrıca yapıldığı için hiçbir zaman "sıradaki konu" sayılmaz.
 */
export function isAssessment(name = '') {
  return /kendimi\s+de[ğg]erlendiriyorum|ölçme\s+ve\s+de[ğg]erlendirme/iu.test(name);
}

/** Grubun/öğrencinin takip ettiği ders-sınıf çiftleri */
export function getEntitySubjects(state, entity) {
  if (entity?.curriculum && entity.curriculum.length > 0) {
    return entity.curriculum.map((c) => ({ subject: c.subject, grade: c.grade || entity.grade }));
  }
  return getSubjectsForBranches(state.profile?.branches || []).map((s) => ({ subject: s, grade: entity?.grade }));
}

/** Müfredattaki tüm konular, sırasıyla (ünite bilgisiyle) */
export function flatTopics(state, entity) {
  const out = [];
  for (const { subject, grade } of getEntitySubjects(state, entity)) {
    const units = state.curriculum?.[subject]?.[grade] || [];
    const subjectName = SUBJECTS.find((s) => s.id === subject)?.name || subject;
    for (const unit of units) {
      for (const topic of unit.topics || []) {
        out.push({
          key: topicKey(subject, grade, unit.id, topic.id),
          subject,
          subjectName,
          grade,
          unitId: unit.id,
          unitName: unit.name,
          topicId: topic.id,
          name: topic.name,
          index: out.length,
          assessment: isAssessment(topic.name),
        });
      }
    }
  }
  return out;
}

/** Bir konunun güncel durumu. t: { key, topicId } */
export function topicState(entity, t) {
  if (entity?.topicProgress) {
    const p = entity.topicProgress[t.key];
    return p ? { s: p.s, note: p.note || '', date: p.date || null } : { s: 'none', note: '', date: null };
  }
  // eski veri: sadece "bitti" listesi
  if ((entity?.completedTopics || []).includes(t.topicId)) return { s: 'done', note: '', date: null };
  return { s: 'none', note: '', date: null };
}

/** Müfredat + durumlar */
export function topicsWithState(state, entity) {
  return flatTopics(state, entity).map((t) => ({ ...t, ...topicState(entity, t) }));
}

/** Sıradaki (ya da yarım kalmış) konu — değerlendirme bölümleri atlanır */
export function nextTopic(state, entity) {
  return topicsWithState(state, entity).find((t) => t.s !== 'done' && !t.assessment) || null;
}

export function progressCounts(state, entity) {
  const list = topicsWithState(state, entity);
  const done = list.filter((t) => t.s === 'done').length;
  const partial = list.filter((t) => t.s === 'partial').length;
  return { total: list.length, done, partial, none: list.length - done - partial, pct: list.length ? Math.round((done / list.length) * 100) : 0 };
}

/**
 * Yeni ilerleme haritasını hesaplar (saf fonksiyon).
 * items: [{ key, s: 'done'|'partial'|'none', note? }]
 * flat:  flatTopics(state, entity) — eski "bitti listesi"ni ilk kullanımda taşımak için
 */
export function applyProgress(entity, items, date, flat = []) {
  let progress;
  if (entity.topicProgress) {
    progress = { ...entity.topicProgress };
    // geliştirme sırasında oluşmuş, ders bilgisi olmayan geçersiz anahtarları temizle
    for (const k of Object.keys(progress)) if (!k.includes('|')) delete progress[k];
  } else {
    // ilk kullanım: eski bitti listesini yeni yapıya taşı
    progress = {};
    const legacy = new Set(entity.completedTopics || []);
    for (const t of flat) if (legacy.has(t.topicId)) progress[t.key] = { s: 'done', date: null };
  }
  for (const it of items) {
    if (!it.key) continue;
    if (it.s === 'none') delete progress[it.key];
    else progress[it.key] = { s: it.s, date, ...(it.s === 'partial' && it.note ? { note: it.note.trim() } : {}) };
  }
  // eski ekranlar için "bitti listesi" (sadece konu kimlikleri)
  const completedTopics = [...new Set(Object.keys(progress).filter((k) => progress[k].s === 'done').map((k) => k.split('|')[3]))];
  return { topicProgress: progress, completedTopics };
}
