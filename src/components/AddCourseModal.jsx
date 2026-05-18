import React, { useState } from 'react';
import { useCourseStore } from '../store/courseStore';
import { getState } from '../store/store.js';
import { X } from 'lucide-react';

const AddCourseModal = ({ onClose }) => {
  const addCourse = useCourseStore(state => state.addCourse);
  
  const [formData, setFormData] = useState({
    title: '',
    grade: '5. Sınıf',
    subject: 'Matematik',
    duration: '',
    instructor: getState()?.profile?.name || '',
    status: 'Aktif'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addCourse(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h3>Yeni Kurs Ekle</h3>
          <button type="button" className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Kurs Adı</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Örn: YKS Matematik Kampı"
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
                  placeholder="Örn: 8 Hafta"
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
                placeholder="Örn: Ali Yılmaz"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>İptal</button>
            <button type="submit" className="btn btn-primary">Kursu Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourseModal;
