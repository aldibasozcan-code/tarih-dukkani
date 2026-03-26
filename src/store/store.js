// ═══════════════════════════════════════════════════
// GLOBAL APP STATE - Firebase Firestore backed
// ═══════════════════════════════════════════════════
import { DEFAULT_CURRICULUM, GRADE_TO_SUBJECTS, CONTENT_TYPES, getSubjectsForBranches } from '../data/curriculum.js';
import { db, auth } from '../lib/firebase.js';
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { deleteUser } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

let STORAGE_KEY = 'tarih_dukkani_v1';
let docRef = null;

// ─── Helpers ───
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

let _saveTimeout = null;

async function save(state) {
  try { 
    // Save locally immediately for fast load next time
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); 
    
    // Debounce Firebase remote writes to avoid 1 write/second limit quotas
    if (_saveTimeout) clearTimeout(_saveTimeout);
    _saveTimeout = setTimeout(async () => {
      try {
        if (auth.currentUser && docRef) {
          await setDoc(docRef, _state);
        }
      } catch (err) {
        console.error("Firebase debounced save error:", err);
      }
    }, 1000);
  } catch (err) {
    console.error("Local save error:", err);
  }
}

// ─── Default State ───
function createDefaultState() {
  return {
    profile: {
      name: '',
      title: 'Öğretmen',
      email: '',
      phone: '',
      city: '',
      bio: '',
      experience: '',
      rate: '',
      avatar: null,
      onboarded: false,
      grades: [],
      branches: [],
    },
    settings: {
      appName: 'Öğretmen Paneli',
      logo: null,
      calendarId: '',
      calendarApiKey: '',
    },
    notifications: [
      { id: 'n_welcome', type: 'success', text: 'Sisteme hoş geldiniz! Uygulamayı kendi derslerinize göre şekillendirebilirsiniz.', time: new Date().toISOString(), read: false, link: 'dashboard' }
    ],
    // Curriculum materials: { key: { subject, grade, unitId, topicId, type, title, link, id } }
    materials: {},
    // Custom curriculum structure
    curriculum: JSON.parse(JSON.stringify(DEFAULT_CURRICULUM)),
    // Students list
    students: [],
    // Groups
    groups: [],
    // Lessons list: { id, type:'student'|'group', refId, title, date, startTime, endTime, status:'upcoming'|'ongoing'|'waiting'|'completed'|'postponed', subject, grade, unitId, topicId, homework, notes }
    lessons: [],
    // Transactions: { id, type:'income'|'expense', amount, description, date, lessonId }
    transactions: [],
  };
}

// ─── State Singleton ───
let _state = null;
const _listeners = new Set();

export async function initStore() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("initStore called without authenticated user");
      return null;
    }
    
    // Set dynamic keys based on UID for Data Isolation
    STORAGE_KEY = `td_state_${user.uid}`;
    docRef = doc(db, 'users', user.uid);

    // 1. Instantly load local cache if available
    const local = loadLocal();
    if (local) {
      _state = local;
      // Migration: Inject curriculum if missing in old local state
      if (!_state.curriculum) {
        _state.curriculum = JSON.parse(JSON.stringify(DEFAULT_CURRICULUM));
      }
    } else {
      _state = createDefaultState();
      if (!_state.lessons) _state.lessons = [];
      if (!_state.transactions) _state.transactions = [];
      if (!_state.materials) _state.materials = {};
      // Ensure curriculum exists even if createDefaultState somehow missed it
      if (!_state.curriculum) _state.curriculum = JSON.parse(JSON.stringify(DEFAULT_CURRICULUM));
      
      if (_state.lessons.length === 0) {
        _generateGroupLessons();
        _generateStudentLessons();
      }
    }

    // 2. Fetch latest actual from Firebase (await)
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      _state = snap.data();
      // Migration: Inject curriculum if missing in old Firebase state
      if (!_state.curriculum) {
        _state.curriculum = JSON.parse(JSON.stringify(DEFAULT_CURRICULUM));
        // Save the migrated state back to Firebase
        await setDoc(docRef, _state);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
    } else {
      // First time on Firebase: upload the default state
      await setDoc(docRef, _state);
    }

    // 3. Listen for changes from other devices/tabs
    onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const remoteData = docSnap.data();
        // Stringify comparison to prevent unnecessary re-renders when WE saved it
        if (JSON.stringify(remoteData) !== JSON.stringify(_state)) {
          _state = remoteData;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
          _listeners.forEach(fn => fn(_state));
        }
      }
    });

  } catch (err) {
    console.error("Firebase init fallback to local:", err);
    if (!_state) {
      _state = createDefaultState();
      if (_state.lessons.length === 0) {
        _generateGroupLessons();
        _generateStudentLessons();
      }
    }
  }

  return _state;
}

export function getState() {
  if (!_state) {
    console.warn("getState called before initStore finished. Returning default.");
    return createDefaultState();
  }
  return _state;
}

function _generateGroupLessons() {
  const today = new Date();
  _state.groups.forEach(group => {
    // Generate lessons for next 52 weeks
    for (let w = -4; w < 52; w++) {
      const d = new Date(today);
      const dayDiff = (group.dayOfWeek - d.getDay() + 7) % 7 || 7;
      d.setDate(d.getDate() + dayDiff + w * 7);
      const dateStr = d.toISOString().split('T')[0];
      const lessonId = generateId();
      _state.lessons.push({
        id: lessonId,
        type: 'group',
        refId: group.id,
        title: group.name,
        date: dateStr,
        startTime: group.time,
        endTime: _addMinutes(group.time, group.duration || 60),
        status: d < today ? 'completed' : 'upcoming',
        subject: _getSubjectForGrade(group.grade),
        grade: group.grade,
        unitId: null,
        topicId: null,
        homework: null,
        notes: '',
        fee: group.rate,
      });
    }
  });
}

function _generateStudentLessons() {
  // No auto-generation for individual students (flexible scheduling)
}

function _getSubjectForGrade(grade) {
  const mapping = {
    '5. Sınıf': 'sosyal', '6. Sınıf': 'sosyal', '7. Sınıf': 'sosyal',
    '8. Sınıf': 'inkılap',
    '9. Sınıf': 'tarih', '10. Sınıf': 'tarih', '11. Sınıf': 'tarih', '12. Sınıf': 'tarih',
    'Mezun': 'ayt', 'Osmanlı Türkçesi': 'osmanlıca',
  };
  return mapping[grade] || 'tarih';
}

function _addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function setState(updater) {
  if (typeof updater === 'function') {
    _state = { ..._state, ...updater(_state) };
  } else {
    _state = { ..._state, ...updater };
  }
  save(_state);
  _listeners.forEach(fn => fn(_state));
}

function subscribe(fn) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

// ─── Actions ───

export function addStudent(data) {
  const id = generateId();
  // Auto-assign curriculum from grade
  const stateCurriculum = getState().curriculum || {};
  const subjects = GRADE_TO_SUBJECTS[data.grade] || [];
  const curriculum = subjects.map(({ subject, grade }) => ({
    subject,
    grade,
    units: stateCurriculum[subject]?.[grade] || [],
  }));
  const student = { id, ...data, curriculum, completedTopics: [], homework: [] };
  setState(s => ({ students: [...s.students, student] }));
  return student;
}

export function updateStudent(id, data) {
  setState(s => ({
    students: s.students.map(st => st.id === id ? { ...st, ...data } : st)
  }));
}

export function deleteStudent(id) {
  setState(s => ({ students: s.students.filter(st => st.id !== id) }));
}

export function addGroup(data) {
  const id = generateId();
  const stateCurriculum = getState().curriculum || {};
  const subjects = GRADE_TO_SUBJECTS[data.grade] || [];
  const curriculum = subjects.map(({ subject, grade }) => ({
    subject,
    grade,
    units: stateCurriculum[subject]?.[grade] || [],
  }));
  const group = { id, ...data, curriculum, completedTopics: [], zoomLink: data.zoomLink || '' };
  setState(s => ({ groups: [...s.groups, group] }));
  // Auto-generate lessons for 52 weeks
  _generateGroupLessonsForGroup(group);
  return group;
}

function _generateGroupLessonsForGroup(group) {
  const today = new Date();
  const newLessons = [];
  for (let w = 0; w < 52; w++) {
    const d = new Date(today);
    const dayDiff = ((group.dayOfWeek - d.getDay()) + 7) % 7 || 7;
    d.setDate(d.getDate() + dayDiff + w * 7);
    const dateStr = d.toISOString().split('T')[0];
    newLessons.push({
      id: generateId(),
      type: 'group',
      refId: group.id,
      title: group.name,
      date: dateStr,
      startTime: group.time,
      endTime: _addMinutes(group.time, group.duration || 60),
      status: 'upcoming',
      subject: _getSubjectForGrade(group.grade),
      grade: group.grade,
      unitId: null,
      topicId: null,
      homework: null,
      notes: '',
      fee: group.rate,
    });
  }
  setState(s => ({ lessons: [...s.lessons, ...newLessons] }));
}

export function updateGroup(id, data) {
  setState(s => ({
    groups: s.groups.map(g => g.id === id ? { ...g, ...data } : g)
  }));
}

export function deleteGroup(id) {
  setState(s => ({
    groups: s.groups.filter(g => g.id !== id),
    lessons: s.lessons.filter(l => !(l.type === 'group' && l.refId === id)),
  }));
}

async function addEventToGoogleCalendar(lesson) {
  const token = localStorage.getItem('_gcal_token');
  const state = getState();
  const calId = state.settings?.calendarId || 'primary';
  const encodedCalId = encodeURIComponent(calId);

  // Doğrudan yetki yoksa (veya süresi dolduysa) Google Takvim Ekleme sayfasını yeni sekmede aç.
  if (!token) {
    const url = generateGoogleCalendarUrl(lesson);
    window.open(url, '_blank');
    return;
  }

  const start = new Date(`${lesson.date}T${lesson.startTime}:00`);
  const end = new Date(`${lesson.date}T${lesson.endTime}:00`);

  const event = {
    summary: `${lesson.title} - Tarih Dükkanı`,
    description: lesson.notes ? `Ders Notları:\n${lesson.notes}` : 'Tarih Dükkanı üzerinden otomatik oluşturuldu.',
    start: {
      dateTime: start.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Istanbul'
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Istanbul'
    }
  };

  try {
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodedCalId}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });
    
    if (!res.ok) {
      if (res.status === 401 || res.status === 403 || res.status === 404) {
         console.warn("Google Takvim Yetki Hatası veya Takvim Bulunamadı. Otomatik sekme açılıyor.");
         const url = generateGoogleCalendarUrl(lesson);
         window.open(url, '_blank');
      } else {
         console.error("Google Calendar API Error:", await res.text());
      }
    }
  } catch (err) {
    console.error("Google Calendar Fetch Error:", err);
    const url = generateGoogleCalendarUrl(lesson);
    window.open(url, '_blank');
  }
}

export function addLesson(data) {
  const id = generateId();
  const lesson = { id, ...data, status: 'upcoming', homework: null };
  setState(s => ({ lessons: [...s.lessons, lesson] }));
  
  // Arkaplanda Google Takvim'e Senkronize Et
  addEventToGoogleCalendar(lesson);
  
  return lesson;
}

export function completeLesson(lessonId, extraOpts = {}) {
  const state = getState();
  const lesson = state.lessons.find(l => l.id === lessonId);
  if (!lesson) return;

  const updates = {};
  // Update lesson status
  updates.lessons = state.lessons.map(l =>
    l.id === lessonId ? { ...l, status: 'completed', ...extraOpts } : l
  );

  // Auto-add transaction
  const ref = lesson.type === 'student'
    ? state.students.find(s => s.id === lesson.refId)
    : state.groups.find(g => g.id === lesson.refId);

  const fee = lesson.fee || ref?.rate || 0;
  if (fee > 0) {
    const transaction = {
      id: generateId(),
      type: 'income',
      amount: fee,
      description: `${lesson.title} - ${lesson.date} Dersi`,
      date: lesson.date,
      lessonId: lessonId,
    };
    updates.transactions = [...state.transactions, transaction];
  }

  // Mark topic as completed for student/group
  if (lesson.topicId && lesson.type === 'student') {
    updates.students = (updates.students || state.students).map(s =>
      s.id === lesson.refId
        ? { ...s, completedTopics: [...new Set([...s.completedTopics, lesson.topicId])] }
        : s
    );
  }

  setState(s => ({ ...s, ...updates }));

  // Add notification
  addNotification({
    type: 'success',
    text: `${lesson.title} dersi tamamlandı (+₺${fee})`,
    link: 'finance',
  });

  if (extraOpts.homework) {
    addHomeworkNotification(lesson, extraOpts.homework);
  }
}

export function postponeLesson(lessonId, newDate, newTime) {
  setState(s => ({
    lessons: s.lessons.map(l =>
      l.id === lessonId
        ? { ...l, status: 'postponed', newDate, newTime }
        : l
    )
  }));
}

export function addNextWeekLesson(lesson) {
  // Create same lesson +7 days
  const d = new Date(lesson.date);
  d.setDate(d.getDate() + 7);
  addLesson({
    type: lesson.type,
    refId: lesson.refId,
    title: lesson.title,
    date: d.toISOString().split('T')[0],
    startTime: lesson.startTime,
    endTime: lesson.endTime,
    subject: lesson.subject,
    grade: lesson.grade,
    unitId: lesson.unitId,
    topicId: lesson.topicId,
    notes: '',
    fee: lesson.fee,
  });
}

export function addMaterial(data) {
  const id = generateId();
  setState(s => ({
    materials: { ...s.materials, [id]: { id, ...data } }
  }));
}

export function deleteMaterial(id) {
  setState(s => {
    const m = { ...s.materials };
    delete m[id];
    return { materials: m };
  });
}

export function addTransaction(data) {
  const id = generateId();
  setState(s => ({
    transactions: [...s.transactions, { id, ...data }]
  }));
}

export function deleteTransaction(id) {
  setState(s => ({
    transactions: s.transactions.filter(t => t.id !== id)
  }));
}

export function addNotification(data) {
  const notif = {
    id: generateId(),
    time: new Date().toISOString(),
    read: false,
    ...data,
  };
  setState(s => ({ notifications: [notif, ...s.notifications].slice(0, 50) }));
}

function addHomeworkNotification(lesson, hw) {
  addNotification({
    type: 'info',
    text: `${lesson.title} için ödev oluşturuldu: ${hw}`,
    link: 'students',
  });
}

export function markAllNotificationsRead() {
  setState(s => ({
    notifications: s.notifications.map(n => ({ ...n, read: true }))
  }));
}

export function updateProfile(data) {
  setState(s => ({ profile: { ...s.profile, ...data } }));
  if (data.branches || data.grades) {
    syncCurriculumWithBranches(data.branches || getState().profile.branches, data.grades || getState().profile.grades);
  }
}

export function syncCurriculumWithBranches(branches, grades, force = false) {
  const activeSubjects = getSubjectsForBranches(branches);
  if (!activeSubjects || activeSubjects.length === 0) return;
  const activeGrades = grades || [];

  setState(s => {
    let curr = s.curriculum;
    if (!curr) curr = {};
    else curr = JSON.parse(JSON.stringify(curr));

    let changed = false;

    // Remove subjects completely if they are no longer in our branches (when force is true)
    if (force) {
      Object.keys(curr).forEach(subj => {
        if (!activeSubjects.includes(subj)) {
           delete curr[subj];
           changed = true;
        }
      });
    }

    activeSubjects.forEach(subj => {
      // 1) Ensure the subject object exists
      if (!curr[subj]) {
         curr[subj] = {};
         changed = true;
      }

      if (DEFAULT_CURRICULUM[subj]) {
        // Iterate only through the grades available in the MEB template for this subject
        Object.keys(DEFAULT_CURRICULUM[subj]).forEach(grade => {
          // If the teacher has selected this grade in their profile
          if (activeGrades.includes(grade)) {
            // Populate if it doesn't exist or if force is true
            if (force || !curr[subj][grade] || curr[subj][grade].length === 0) {
                curr[subj][grade] = JSON.parse(JSON.stringify(DEFAULT_CURRICULUM[subj][grade]));
                changed = true;
            }
          } else {
             // If forcefully resetting and the user doesn't have this grade, clean it up
             if (force && curr[subj][grade]) {
                 delete curr[subj][grade];
                 changed = true;
             }
          }
        });
      }
    });

    if (changed) return { curriculum: curr };
    return {};
  });
}

export function updateSettings(data) {
  setState(s => ({ settings: { ...s.settings, ...data } }));
}

// ─── Computed ───
export function getLessonStatus(lesson) {
  const now = new Date();
  const start = new Date(`${lesson.date}T${lesson.startTime}:00`);
  const end = new Date(`${lesson.date}T${lesson.endTime}:00`);
  const oneHourAfterEnd = new Date(end.getTime() + 3600000);

  if (['completed', 'postponed'].includes(lesson.status)) return lesson.status;
  if (now < start) return 'upcoming';
  if (now >= start && now < end) return 'ongoing';
  if (now >= end && now < oneHourAfterEnd) return 'ongoing'; // still ongoing grace
  return 'waiting'; // needs confirmation
}

export function getPendingLessons() {
  const state = getState();
  return state.lessons.filter(l => {
    if (l.status !== 'upcoming') return false;
    return getLessonStatus(l) === 'waiting';
  });
}

export function getTodayLessons() {
  const state = getState();
  const today = new Date().toISOString().split('T')[0];
  return state.lessons
    .filter(l => l.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function getWeekLessons(weekStart) {
  const state = getState();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
  return state.lessons.filter(l => days.includes(l.date));
}

export function getMonthlyStats() {
  const state = getState();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const monthTransactions = state.transactions.filter(t =>
    t.date >= monthStart && t.date <= monthEnd
  );

  const income = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return { income, expense, net: income - expense };
}

// ─── Curriculum CRUD ───

export function addUnit(subject, grade, name) {
  setState(s => {
    const curr = JSON.parse(JSON.stringify(s.curriculum));
    if (!curr[subject]) curr[subject] = {};
    if (!curr[subject][grade]) curr[subject][grade] = [];
    
    curr[subject][grade].push({ id: generateId(), name, topics: [] });
    return { curriculum: curr };
  });
}

export function updateUnit(subject, grade, unitId, name) {
  setState(s => {
    const curr = JSON.parse(JSON.stringify(s.curriculum));
    if (curr[subject]?.[grade]) {
      curr[subject][grade] = curr[subject][grade].map(u => u.id === unitId ? { ...u, name } : u);
    }
    return { curriculum: curr };
  });
}

export function deleteUnit(subject, grade, unitId) {
  setState(s => {
    const curr = JSON.parse(JSON.stringify(s.curriculum));
    if (curr[subject]?.[grade]) {
      curr[subject][grade] = curr[subject][grade].filter(u => u.id !== unitId);
    }
    return { curriculum: curr };
  });
}

export function addTopic(subject, grade, unitId, name) {
  setState(s => {
    const curr = JSON.parse(JSON.stringify(s.curriculum));
    if (curr[subject]?.[grade]) {
      curr[subject][grade] = curr[subject][grade].map(u => {
        if (u.id === unitId) {
          u.topics.push({ id: generateId(), name });
        }
        return u;
      });
    }
    return { curriculum: curr };
  });
}

export function updateTopic(subject, grade, unitId, topicId, name) {
  setState(s => {
    const curr = JSON.parse(JSON.stringify(s.curriculum));
    if (curr[subject]?.[grade]) {
      curr[subject][grade] = curr[subject][grade].map(u => {
        if (u.id === unitId) {
          u.topics = u.topics.map(t => t.id === topicId ? { ...t, name } : t);
        }
        return u;
      });
    }
    return { curriculum: curr };
  });
}

export function deleteTopic(subject, grade, unitId, topicId) {
  setState(s => {
    const curr = JSON.parse(JSON.stringify(s.curriculum));
    if (curr[subject]?.[grade]) {
      curr[subject][grade] = curr[subject][grade].map(u => {
        if (u.id === unitId) {
          u.topics = u.topics.filter(t => t.id !== topicId);
        }
        return u;
      });
    }
    return { curriculum: curr };
  });
}

// ─── Export ───

export function generateGoogleCalendarUrl(lesson) {
  const state = getState();
  const calId = state.settings.calendarId || '';
  
  const text = encodeURIComponent(lesson.title);
  
  // Format dates to YYYYMMDDTHHmmssZ
  const start = new Date(`${lesson.date}T${lesson.startTime}:00`);
  const end = new Date(`${lesson.date}T${lesson.endTime}:00`);
  
  const formatComponent = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  
  const dates = `${formatComponent(start)}/${formatComponent(end)}`;
  
  const details = encodeURIComponent(`Öğrenci/Grup: ${lesson.title}
Ders: ${lesson.subject} / ${lesson.grade}
Tarih Dükkanı Uygulamasından eklendi.`);

  let url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
  if (calId) {
    url += `&src=${encodeURIComponent(calId)}`;
  }
  return url;
}

async function importData(data) {
  if (!docRef) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  await setDoc(docRef, data);
  window.location.reload();
}

async function resetData() {
  if (!docRef) return;
  localStorage.removeItem(STORAGE_KEY);
  await setDoc(docRef, createDefaultState());
  window.location.reload();
}

async function deleteAccount() {
  if (!auth.currentUser || !docRef) return;
  try {
    // 1. Delete Firestore Document
    try {
      await deleteDoc(docRef);
    } catch (e) {
      console.warn("Firestore 'delete' kuralı aktif değil, bulut verisi silinemedi. Devam ediliyor...", e);
    }
    
    // 2. Clear Local Storage
    localStorage.removeItem(STORAGE_KEY);
    
    // 3. Delete Auth User
    await deleteUser(auth.currentUser);
    
    // 4. Return success to triggers UI
    return true;
  } catch (error) {
    if (error.code === 'auth/requires-recent-login') {
      throw new Error("Güvenlik nedeniyle hesabınızı silebilmek için lütfen önce çıkış yapıp tekrar giriş yapın.");
    }
    throw error;
  }
}

export { setState, subscribe, generateId, _addMinutes, importData, resetData, deleteAccount };
