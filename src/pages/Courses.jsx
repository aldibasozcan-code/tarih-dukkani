import React, { useState } from 'react';
import { useCourseStore } from '../store/courseStore';
import { Plus, Search, MoreVertical, BookOpen, Clock, BarChart } from 'lucide-react';
import AddCourseModal from '../components/AddCourseModal';
import EditCourseModal from '../components/EditCourseModal';
import ViewCourseModal from '../components/ViewCourseModal';

const Courses = () => {
  const { courses } = useCourseStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editCourseId, setEditCourseId] = useState(null);
  const [viewCourseId, setViewCourseId] = useState(null);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || course.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="fade-in">
      <div className="page-header" style={{ background: 'linear-gradient(135deg, var(--brand-green-soft) 0%, rgba(255,255,255,1) 100%)', padding: '32px 24px', borderRadius: '20px', marginBottom: '32px', border: '1px solid rgba(16,185,129,0.15)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--brand-green)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.5px' }}>
            <BookOpen size={32} />
            Kurslar & Müfredat
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', fontWeight: 500 }}>
            Tüm kursları, müfredatları ve modülleri bu panelden yönetin
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Kurs veya eğitmen ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px', minWidth: '250px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ minWidth: '150px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <option value="All">Tüm Durumlar</option>
            <option value="Aktif">Aktif</option>
            <option value="Taslak">Taslak</option>
            <option value="Pasif">Pasif</option>
          </select>
          <button className="btn btn-primary hover-lift" onClick={() => setIsAddModalOpen(true)} style={{ boxShadow: '0 8px 20px rgba(16,185,129,0.3)', padding: '10px 20px', fontWeight: 700, fontSize: '15px' }}>
            <Plus size={18} />
            Yeni Kurs Ekle
          </button>
        </div>
      </div>

      <div className="grid grid-3">
        {filteredCourses.map(course => (
          <div key={course.id} className="card premium-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div 
              style={{ 
                height: '160px',
                backgroundImage: `url(${course.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => setViewCourseId(course.id)}
            >
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
                <span className={`badge ${course.status === 'Aktif' ? 'badge-success' : course.status === 'Pasif' ? 'badge-danger' : 'badge-muted'}`} style={{ backdropFilter: 'blur(4px)', background: course.status === 'Aktif' ? 'rgba(209,250,229,0.9)' : course.status === 'Pasif' ? 'rgba(254,226,226,0.9)' : 'rgba(241,245,249,0.9)', color: course.status === 'Pasif' ? '#dc2626' : undefined }}>
                  {course.status}
                </span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--text-primary)', backdropFilter: 'blur(4px)' }}>
                  {course.grade}
                </span>
              </div>
              <button 
                className="btn-icon hover-scale" 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditCourseId(course.id); }}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', border: 'none', width: '32px', height: '32px', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <MoreVertical size={18} />
              </button>
            </div>
            
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 
                onClick={() => setViewCourseId(course.id)}
                style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', cursor: 'pointer' }}
              >
                {course.title}
              </h3>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>
                {course.instructor}
              </p>
              
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BookOpen size={16} color="var(--brand-green)"/> {course.subject}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} color="var(--warning)"/> {course.duration}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BarChart size={16} color="var(--success)"/> {course.curriculum?.length || 0} Modül</span>
              </div>
              
              <div style={{ marginTop: 'auto', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  <span>Tamamlanma Oranı</span>
                  <span style={{ color: 'var(--brand-green)' }}>%{course.progress}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${course.progress}%`, height: '100%', background: 'var(--brand-green)', borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredCourses.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '20px' }}>
            <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
            <h3 style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Sonuç bulunamadı</h3>
            <p style={{ color: 'var(--text-muted)' }}>Arama kriterlerinize uygun kurs bulunamadı.</p>
          </div>
        )}
      </div>

      {isAddModalOpen && <AddCourseModal onClose={() => setIsAddModalOpen(false)} />}
      {editCourseId && <EditCourseModal courseId={editCourseId} onClose={() => setEditCourseId(null)} />}
      {viewCourseId && <ViewCourseModal courseId={viewCourseId} onClose={() => setViewCourseId(null)} />}
    </div>
  );
};

export default Courses;
