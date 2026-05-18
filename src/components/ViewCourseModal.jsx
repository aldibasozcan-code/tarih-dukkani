import React from 'react';
import { useCourseStore } from '../store/courseStore';
import { X, PlayCircle, FileText, CheckCircle, Lock, BookOpen, Edit2 } from 'lucide-react';
import EditCourseModal from './EditCourseModal';

const ViewCourseModal = ({ courseId, onClose }) => {
  const { courses } = useCourseStore();
  const course = courses.find(c => c.id === courseId);
  const [isEditing, setIsEditing] = React.useState(false);

  if (!course) return null;

  if (isEditing) {
    return <EditCourseModal courseId={courseId} onClose={onClose} />;
  }

  const renderModuleIcon = (type) => {
    if (type === 'video') return <PlayCircle size={20} color="var(--brand-green)" />;
    if (type === 'pdf') return <FileText size={20} color="var(--brand-green)" />;
    return <FileText size={20} color="var(--brand-green)" />;
  };

  const renderStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle size={20} color="var(--success)" />;
    if (status === 'locked') return <Lock size={20} color="var(--text-muted)" />;
    return <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--brand-green)', boxShadow: '0 0 10px var(--brand-green)', animation: 'pulse 2s infinite' }}></div>;
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, display: 'flex', gap: '8px' }}>
          <button 
            className="btn-icon hover-scale" 
            onClick={() => setIsEditing(true)}
            title="Kursu Düzenle"
            style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', boxShadow: 'var(--shadow-sm)' }}
          >
            <Edit2 size={18} color="var(--brand-green)" />
          </button>
          <button 
            className="close-btn hover-scale" 
            onClick={onClose}
            title="Kapat"
            style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', boxShadow: 'var(--shadow-sm)' }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div 
          style={{ 
            backgroundImage: `url(${course.image})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            height: '280px',
            position: 'relative'
          }}
        >
          <div 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'linear-gradient(to top, rgba(0, 69, 38, 0.9), rgba(0, 69, 38, 0.2))',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '32px',
              color: 'white'
            }}
          >
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: 'white' }}>{course.grade}</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: 'white' }}>{course.subject}</span>
              <span className={`badge ${course.status === 'Aktif' ? 'badge-success' : course.status === 'Pasif' ? 'badge-danger' : 'badge-muted'}`}>
                {course.status}
              </span>
            </div>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px' }}>{course.title}</h2>
            <div style={{ display: 'flex', gap: '24px', fontSize: '15px', fontWeight: 600, opacity: 0.9 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BookOpen size={16}/> Eğitmen: {course.instructor}</span>
              <span>Süre: {course.duration}</span>
              <span>Tamamlanma: %{course.progress}</span>
            </div>
          </div>
        </div>

        <div className="modal-body" style={{ background: 'var(--bg-secondary)', padding: '32px' }}>
          <div className="section-title">
            <h3>Müfredat Özeti</h3>
          </div>
          
          {course.curriculum && course.curriculum.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {course.curriculum.map((module, index) => (
                <div 
                  key={module.id || index} 
                  className="card hover-lift"
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '20px',
                    borderLeft: module.status === 'active' ? '4px solid var(--brand-green)' : '1px solid var(--border)',
                    opacity: module.status === 'locked' ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--brand-green-soft)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {renderModuleIcon(module.type)}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{module.title}</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{module.type.toUpperCase()} İÇERİK</p>
                    </div>
                  </div>
                  <div>
                    {renderStatusIcon(module.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--border)', borderRadius: '20px', background: 'white' }}>
              <BookOpen size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
              <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Bu kurs için henüz müfredat modülü eklenmemiş.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewCourseModal;
