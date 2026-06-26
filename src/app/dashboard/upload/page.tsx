'use client';
import { useState } from 'react';
import { ArrowLeft, UploadCloud, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase_client';

export default function UploadWizard() {
  const [step, setStep] = useState(1);
  const [assessmentType, setAssessmentType] = useState('');
  const [course, setCourse] = useState('');
  const [section, setSection] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const assessmentTypes = ['Attendance', 'Quiz', 'Assignment', 'Midterm', 'Final Exam', 'Lab', 'Viva'];
  const courses = ['CS-101', 'CS-205', 'CS-301'];
  const sections = ['Section A', 'Section B', 'Section C'];

  const handleNext = () => setStep(s => Math.min(s + 1, 4));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    setErrorMsg('');
    
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('Not logged in');

      // Create a new job ticket in Supabase
      const { data, error } = await supabase.from('job_tickets').insert([{
        user_id: userId,
        course_id: course,
        assessment_type: assessmentType,
        status: 'processing',
        file_urls: ['uploaded_file_mock.pdf'] // In a real app, upload to storage first
      }]).select().single();

      if (error) throw new Error(error.message);

      // Navigate to the verification page with the real DB job ID
      router.push(`/dashboard/verify/${data.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed');
      setIsUploading(false);
    }
  };

  return (
    <>
      <nav style={{
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <Link href="/dashboard" className="btn-ghost" style={{ padding: '0.25rem' }}>
          <ArrowLeft size={18} />
        </Link>
        <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>New Upload</span>
        
        <div style={{ flex: 1 }}></div>

        <div className="flex-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <span style={{ color: step >= 1 ? 'var(--text-primary)' : '' }}>Type</span>
          <span>/</span>
          <span style={{ color: step >= 2 ? 'var(--text-primary)' : '' }}>Course</span>
          <span>/</span>
          <span style={{ color: step >= 3 ? 'var(--text-primary)' : '' }}>Section</span>
          <span>/</span>
          <span style={{ color: step >= 4 ? 'var(--text-primary)' : '' }}>Upload</span>
        </div>
      </nav>

      <div className="container" style={{ maxWidth: '640px', paddingTop: '4rem' }}>
          
        {step === 1 && (
          <div>
            <h1 className="heading-1 mb-1">Assessment Type</h1>
            <p className="text-subtitle mb-4">Select the type of document you are uploading.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {assessmentTypes.map(type => (
                <button 
                  key={type}
                  onClick={() => { setAssessmentType(type); handleNext(); }}
                  className="card"
                  style={{
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderColor: assessmentType === type ? 'var(--text-primary)' : 'var(--border-color)',
                    background: 'var(--bg-primary)'
                  }}
                >
                  <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{type}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="heading-1 mb-1">Select Course</h1>
            <p className="text-subtitle mb-4">Which course does this {assessmentType.toLowerCase()} belong to?</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {courses.map(c => (
                <button 
                  key={c}
                  onClick={() => { setCourse(c); handleNext(); }}
                  className="card flex-between"
                  style={{
                    cursor: 'pointer',
                    borderColor: course === c ? 'var(--text-primary)' : 'var(--border-color)',
                  }}
                >
                  <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{c}</span>
                  {course === c && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="heading-1 mb-1">Select Section</h1>
            <p className="text-subtitle mb-4">Which section of {course}?</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sections.map(s => (
                <button 
                  key={s}
                  onClick={() => { setSection(s); handleNext(); }}
                  className="card flex-between"
                  style={{
                    cursor: 'pointer',
                    borderColor: section === s ? 'var(--text-primary)' : 'var(--border-color)',
                  }}
                >
                  <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{s}</span>
                  {section === s && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="heading-1 mb-1">Upload Documents</h1>
            <p className="text-subtitle mb-4">
              Uploading {assessmentType} for {course} ({section})
            </p>
            
            {errorMsg && <div className="text-danger text-sm mb-3">{errorMsg}</div>}

            {isUploading ? (
              <div className="panel flex-col flex-center" style={{ padding: '4rem 2rem' }}>
                <div className="spinner" style={{
                  width: '24px', height: '24px',
                  border: '2px solid var(--border-color)',
                  borderTopColor: 'var(--text-primary)',
                  borderRadius: '50%',
                  marginBottom: '1rem'
                }}></div>
                <h3 className="heading-2 mb-1">Processing Documents</h3>
                <p className="text-subtitle">Extracting marks and calculating confidence...</p>
              </div>
            ) : (
              <label className="panel" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '4rem 2rem',
                borderStyle: 'dashed',
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast)'
              }}>
                <UploadCloud size={24} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Click or drag files</h3>
                <p className="text-subtitle">PDF, PNG, or JPEG</p>
                <input type="file" multiple accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleUpload} />
              </label>
            )}
          </div>
        )}
      </div>
    </>
  );
}
