// ═════════════════════════════════════════════════
// KONU İLERLEMESİ (grup ve öğrenci)
// ─────────────────────────────────────────────────
// Her grup/öğrenci için konu bazında durum tutulur:
//   entity.topicProgress = { [topicId]: { s: 'done' | 'partial', note?: string, date: 'YYYY-MM-DD' } }
// Kaydı olmayan konu "işlenmedi" sayılır. Geriye dönük uyumluluk için
// entity.completedTopics (bitti listesi) her zaman 'done' olanlarla senkron tutulur.
// ═════════════════════════════════════════════════
import { getSubjectsForBranches, SUBJECTS } from '../data/curriculum.js';

export const STATUS = {
  done: { label: 'Bitti', color: '#10b981', soft: 'rgba(16,185,129,0.10)' },
  partial: { label: 'Yarım kaldı', color: '#f59e0b', soft: 'rgba(245,158,11,0.12)' },
  none: { label: 'İşlenmedi', color: '#94a3b8', soft: 'transparent' },
};

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

/** Bir konunun güncel durumu */
export function topicState(entity, topicId) {
  const p = entity?.topicProgress?.[topicId];
  if (p) return { s: p.s, note: p.note || '', date: p.date || null };
  if ((entity?.completedTopics || []).includes(topicId)) return { s: 'done', note: '', date: null };
  return { s: 'none', note: '', date: null };
}

/** Müfredat + durumlar */
export function topicsWithState(state, entity) {
  return flatTopics(state, entity).map((t) => ({ ...t, ...topicState(entity, t.topicId) }));
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
 * items: [{ topicId, s: 'done'|'partial'|'none', note? }]
 */
export function applyProgress(entity, items, date) {
  const progress = { ...(entity.topicProgress || {}) };
  // eski "bitti listesi"ndeki konuları da haritaya taşı (ilk kullanımda)
  for (const id of entity.completedTopics || []) if (!progress[id]) progress[id] = { s: 'done', date: null };
  for (const it of items) {
    if (it.s === 'none') delete progress[it.topicId];
    else progress[it.topicId] = { s: it.s, date, ...(it.s === 'partial' && it.note ? { note: it.note.trim() } : {}) };
  }
  const completedTopics = Object.keys(progress).filter((id) => progress[id].s === 'done');
  return { topicProgress: progress, completedTopics };
}
