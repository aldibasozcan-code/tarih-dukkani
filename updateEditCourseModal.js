const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import { useCourseStore } from '../store/courseStore';
import { X, Trash2, Plus } from 'lucide-react';

const EditCourseModal = ({ courseId, onClose }) => {
  const { courses, updateCourse, deleteCourse } = useCourseStore();
  const courseToEdit = courses.find(c => c.id === courseId);
  
  const [activeTab, setActiveTab] = useState('general');
  const [curriculum, setCurriculum] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    grade: '',
    subject: '',
    duration: '',
    instructor: '',
    status: ''
  });

  useEffect(() => {
    if (courseToEdit) {
      setFormData({
        title: courseToEdit.title,
        grade: courseToEdit.grade,
        subject: courseToEdit.subject,
        duration: courseToEdit.duration,
        instructor: courseToEdit.instructor,
        status: courseToEdit.status
      });
      setCurriculum(courseToEdit.curriculum || []);
    }
  }, [courseToEdit]);

  if (!courseToEdit) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateCourse(courseId, { ...formData, curriculum });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Bu kursu silmek istediğinize emin misiniz? Tüm içerikler de silinecektir.')) {
      deleteCourse(courseId);
      onClose();
    }
  };

  const handleAddModule = () => {
    setCurriculum([
      ...curriculum, 
      { id: 'm_' + Date.now(), title: 'Yeni İçerik', status: 'active', type: 'video' }
    ]);
  };

  const updateModule = (id, field, value) => {
    setCurriculum(curriculum.map(mod => 
      mod.id === id ? { ...mod, [field]: value } : mod
    ));
  };

  const deleteModule = (id) => {
    setCurriculum(curriculum.filter(mod => mod.id !== id));
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header" style={{ paddingBottom: '0', borderBottom: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '16px' }}>
            <h3>Kursu Düzenle</h3>
            <button type="button" className="close-btn" onClick={onClose}><X size={20} /></button>
          </div>
          <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border)' }}>
            <button 
              type="button"
              onClick={() => setActiveTab('general')}
              style={{ 
                padding: '8px 4px', 
                background: 'none', 
                border: 'none', 
                borderBottom: activeTab === 'general' ? '2px solid var(--brand-green)' : '2px solid transparent',
                color: activeTab === 'general' ? 'var(--brand-green)' : 'var(--text-secondary)',
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: '-1px'
              }}
            >
              Genel Bilgiler
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('curriculum')}
              style={{ 
                padding: '8px 4px', 
                background: 'none', 
                border: 'none', 
                borderBottom: activeTab === 'curriculum' ? '2px solid var(--brand-green)' : '2px solid transparent',
                color: activeTab === 'curriculum' ? 'var(--brand-green)' : 'var(--text-secondary)',
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: '-1px'
              }}
            >
              İçerik (Müfredat) Yönetimi
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ minHeight: '300px', maxHeight: '500px', overflowY: 'auto' }}>
            {activeTab === 'general' ? (
              <>
                <div className="form-group">
                  <label>Kurs Adı</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Sınıf</label>
                    <select 
                      value={formData.grade}
                      onChange={e => setFormData({...formData, grade: e.target.value})}
                    >
                      <option value="5. Sınıf">5. Sınıf</option>
                      <option value="6. Sınıf">6. Sınıf</option>
                      <option value="7. Sınıf">7. Sınıf</option>
                      <option value="8. Sınıf">8. Sınıf</option>
                      <option value="9. Sınıf">9. Sınıf</option>
                      <option value="10. Sınıf">10. Sınıf</option>
                      <option value="11. Sınıf">11. Sınıf</option>
                      <option value="12. Sınıf">12. Sınıf</option>
                      <option value="Mezun">Mezun</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Ders</label>
                    <select 
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                    >
                      <option value="Matematik">Matematik</option>
                      <option value="Türkçe">Türkçe</option>
                      <option value="Fen Bilimleri">Fen Bilimleri</option>
                      <option value="Sosyal Bilgiler">Sosyal Bilgiler</option>
                      <option value="Fizik">Fizik</option>
                      <option value="Kimya">Kimya</option>
                      <option value="Biyoloji">Biyoloji</option>
                      <option value="Edebiyat">Edebiyat</option>
                      <option value="Tarih">Tarih</option>
                      <option value="Coğrafya">Coğrafya</option>
                      <option value="İngilizce">İngilizce</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Süre</label>
                    <input 
                      type="text" 
                      required
                      value={formData.duration}
                      onChange={e => setFormData({...formData, duration: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Durum</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Taslak">Taslak</option>
                      <option value="Pasif">Pasif</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Eğitmen Adı</label>
                  <input 
                    type="text" 
                    required
                    value={formData.instructor}
                    onChange={e => setFormData({...formData, instructor: e.target.value})}
                  />
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {curriculum.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                    Henüz hiç içerik eklenmemiş.
                  </div>
                ) : (
                  curriculum.map((module, index) => (
                    <div key={module.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-muted)', width: '24px' }}>{index + 1}.</div>
                      <input 
                        type="text"
                        value={module.title}
                        onChange={e => updateModule(module.id, 'title', e.target.value)}
                        style={{ flex: 1, border: '1px solid var(--border)', padding: '8px 12px', borderRadius: '8px' }}
                        placeholder="İçerik Başlığı"
                        required
                      />
                      <select 
                        value={module.type}
                        onChange={e => updateModule(module.id, 'type', e.target.value)}
                        style={{ width: '120px', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: '8px' }}
                      >
                        <option value="video">Video</option>
                        <option value="pdf">PDF</option>
                        <option value="document">Döküman</option>
                      </select>
                      <select 
                        value={module.status}
                        onChange={e => updateModule(module.id, 'status', e.target.value)}
                        style={{ width: '110px', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: '8px' }}
                      >
                        <option value="active">Aktif</option>
                        <option value="locked">Kilitli</option>
                      </select>
                      <button 
                        type="button" 
                        onClick={() => deleteModule(module.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '8px' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
                
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={handleAddModule}
                  style={{ marginTop: '12px', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Plus size={16} /> Yeni İçerik Ekle
                </button>
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" className="btn btn-danger" onClick={handleDelete}>
              <Trash2 size={16} style={{ marginRight: '6px' }} />
              Kursu Sil
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>İptal</button>
              <button type="submit" className="btn btn-primary">Kaydet</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourseModal;
`;

fs.writeFileSync('src/components/EditCourseModal.jsx', content);
console.log('EditCourseModal.jsx updated successfully.');
