import Link from 'next/link';
import { Plus, Clock, Settings, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const courses = ['CS-101 Introduction to CS', 'CS-205 Database Systems', 'CS-301 Data Structures'];

  const recentUploads = [
    { id: '1', course: 'CS-301', type: 'Midterm Exam', status: 'completed', date: 'Today, 10:30 AM', students: 42 },
    { id: '2', course: 'CS-205', type: 'Quiz 2', status: 'completed', date: 'Yesterday, 02:15 PM', students: 50 },
    { id: '3', course: 'CS-101', type: 'Attendance', status: 'failed', date: '2 days ago', students: 120 },
  ];

  return (
    <>
      <nav style={{
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div className="flex-center gap-2">
          <div style={{ width: '16px', height: '16px', backgroundColor: 'var(--text-primary)', borderRadius: '2px' }}></div>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>EduSmartz</span>
        </div>
        <div className="flex-center gap-4">
          <span className="text-sm text-secondary">Prof. Ahmed</span>
          <div className="divider" style={{ width: '1px', height: '24px' }}></div>
          <button className="btn-ghost" style={{ padding: '0.25rem' }}><Settings size={18} /></button>
          <Link href="/auth" className="btn-ghost" style={{ padding: '0.25rem' }}><LogOut size={18} /></Link>
        </div>
      </nav>

      <div className="container" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '3rem', paddingTop: '3rem' }}>
        
        {/* Sidebar area */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div>
            <Link 
              href="/dashboard/upload" 
              className="btn btn-primary w-full"
              style={{ padding: '0.75rem', justifyContent: 'center' }}
            >
              <Plus size={16} /> New Upload
            </Link>
          </div>

          <div>
            <h3 className="text-xs mb-2">Your Courses</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {courses.map((course, i) => (
                <li key={i} style={{
                  fontSize: '0.875rem', 
                  color: 'var(--text-primary)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)'
                }}>
                  {course}
                </li>
              ))}
            </ul>
          </div>

        </aside>

        {/* Main Content */}
        <main>
          <div className="flex-between mb-4">
            <h1 className="heading-1" style={{ fontSize: '1.25rem', margin: 0 }}>Recent Uploads</h1>
          </div>
          
          <div className="panel" style={{ padding: 0 }}>
            {recentUploads.length === 0 ? (
              <div className="flex-col flex-center" style={{ padding: '4rem 2rem', color: 'var(--text-tertiary)' }}>
                <Clock size={32} style={{ marginBottom: '1rem' }} />
                <p className="text-sm">No activity yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentUploads.map((job, idx) => (
                  <div key={job.id} style={{
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: idx === recentUploads.length - 1 ? 'none' : '1px solid var(--border-color)',
                  }}>
                    <div className="flex-center gap-3">
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: job.status === 'completed' ? 'var(--color-success)' : 'var(--color-danger)'
                      }}></div>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          {job.course} — {job.type}
                        </p>
                        <p className="text-subtitle" style={{ fontSize: '0.8125rem', marginTop: '0.125rem' }}>
                          {job.date} • {job.students} Students
                        </p>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/dashboard/report/${job.id}`} 
                      className="btn btn-secondary text-xs"
                      style={{ padding: '0.375rem 0.75rem' }}
                    >
                      View Report
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

      </div>
    </>
  );
}
