'use client';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Download, Check, X } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function ReportPage() {
  const params = useParams();
  
  const report = {
    course: 'CS-301',
    assessment: 'Quiz 2',
    section: 'Section B',
    studentsProcessed: 42,
    successfulUploads: 42,
    failedUploads: 0,
    processingTime: '2m 18s',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

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
        <div className="flex-center gap-4">
          <Link href="/dashboard" className="btn-ghost" style={{ padding: '0.25rem' }}>
            <ArrowLeft size={18} />
          </Link>
          <span style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Report</span>
        </div>
      </nav>

      <div className="container" style={{ maxWidth: '640px', paddingTop: '4rem' }}>
        
        <div style={{ marginBottom: '3rem' }}>
          <div className="flex-center gap-3 mb-2" style={{ justifyContent: 'flex-start' }}>
            <CheckCircle2 size={24} style={{ color: 'var(--color-success)' }} />
            <h1 className="heading-1" style={{ margin: 0 }}>Submission Complete</h1>
          </div>
          <p className="text-subtitle">Data for {report.assessment} has been successfully synced to the portal.</p>
        </div>

        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <p className="text-xs mb-1">Course</p>
              <p style={{ fontWeight: 500 }}>{report.course} - {report.section}</p>
            </div>
            <div>
              <p className="text-xs mb-1">Date</p>
              <p style={{ fontWeight: 500 }}>{report.date}</p>
            </div>
          </div>

          <div className="divider"></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex-between">
              <span className="text-sm text-secondary">Total Processed</span>
              <span style={{ fontWeight: 500 }}>{report.studentsProcessed}</span>
            </div>
            <div className="flex-between">
              <span className="text-sm text-secondary flex-center gap-2">
                <Check size={14} className="text-success" /> Successful
              </span>
              <span style={{ fontWeight: 500 }}>{report.successfulUploads}</span>
            </div>
            <div className="flex-between">
              <span className="text-sm text-secondary flex-center gap-2">
                <X size={14} className="text-danger" /> Failed
              </span>
              <span style={{ fontWeight: 500 }}>{report.failedUploads}</span>
            </div>
            <div className="flex-between pt-2">
              <span className="text-sm text-secondary">Duration</span>
              <span style={{ fontWeight: 500 }}>{report.processingTime}</span>
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <Link href="/dashboard" className="btn btn-primary" style={{ flex: 1 }}>
            Return to Dashboard
          </Link>
          <button className="btn btn-secondary">
            <Download size={16} /> JSON
          </button>
        </div>

      </div>
    </>
  );
}
