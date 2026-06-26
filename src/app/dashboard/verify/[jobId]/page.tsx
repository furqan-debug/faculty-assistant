'use client';
import { useState } from 'react';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

export default function VerifyPage() {
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [data, setData] = useState([
    { studentName: 'Ali Khan', studentId: 'CS-101', marks: '85', confidenceScore: 98, status: 'verified' },
    { studentName: 'Sara Ahmed', studentId: 'CS-102', marks: '72', confidenceScore: 65, status: 'review' },
    { studentName: 'Zainab Bibi', studentId: 'CS-103', marks: '91', confidenceScore: 95, status: 'verified' },
    { studentName: 'Omar Farooq', studentId: 'CS-104', marks: '45', confidenceScore: 40, status: 'review' },
  ]);

  const handleMarkUpdate = (index: number, newMarks: string) => {
    const newData = [...data];
    newData[index].marks = newMarks;
    newData[index].confidenceScore = 100;
    newData[index].status = 'verified';
    setData(newData);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      router.push(`/dashboard/report/${params.jobId}`);
    }, 1500);
  };

  const hasReviewItems = data.some(d => d.status === 'review');

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
          <div>
            <h1 style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Verify Data</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>ID: {params.jobId}</p>
          </div>
        </div>

        <div className="flex-center gap-3">
          <Link href="/dashboard" className="btn btn-ghost">Cancel</Link>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting || hasReviewItems}
            className="btn btn-primary"
          >
            {isSubmitting ? 'Syncing...' : 'Submit to Portal'}
          </button>
        </div>
      </nav>

      <div className="container" style={{ maxWidth: '960px', paddingTop: '2rem' }}>
        
        {hasReviewItems && (
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--color-warning)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <AlertCircle size={18} style={{ color: 'var(--color-warning)', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Review Required</strong>
              <span className="text-subtitle" style={{ marginTop: '0.25rem', display: 'block' }}>
                Please check the records highlighted below where the AI confidence was low.
              </span>
            </div>
          </div>
        )}

        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Student</th>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Roll Number</th>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Extracted Marks</th>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Confidence</th>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} style={{
                  borderBottom: '1px solid var(--border-color)',
                  background: row.status === 'review' ? 'rgba(245, 158, 11, 0.05)' : 'transparent'
                }}>
                  <td style={{ padding: '0.75rem 1.25rem', fontWeight: 500 }}>{row.studentName}</td>
                  <td style={{ padding: '0.75rem 1.25rem', color: 'var(--text-secondary)' }}>{row.studentId}</td>
                  <td style={{ padding: '0.75rem 1.25rem' }}>
                    <input 
                      type="text" 
                      value={row.marks}
                      onChange={(e) => handleMarkUpdate(index, e.target.value)}
                      className="input-field"
                      style={{ 
                        padding: '0.375rem 0.5rem', 
                        width: '70px', 
                        borderColor: row.status === 'review' ? 'var(--color-warning)' : 'var(--border-color)',
                      }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem 1.25rem' }}>
                    <div className="flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
                      <span style={{ 
                        fontSize: '0.8125rem', 
                        color: row.confidenceScore > 85 ? 'var(--color-success)' : 
                               row.confidenceScore > 50 ? 'var(--color-warning)' : 'var(--color-danger)'
                      }}>
                        {row.confidenceScore}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1.25rem' }}>
                    {row.status === 'review' ? (
                      <span className="badge badge-warning">Review</span>
                    ) : (
                      <span className="badge badge-success">Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
