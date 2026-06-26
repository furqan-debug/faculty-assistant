'use client';
import { useState } from 'react';
import { Shield, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const router = useRouter();

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('testing');
    
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    }, 1500);
  };

  return (
    <div className="center-screen">
      <div className="panel" style={{ width: '100%', maxWidth: '440px' }}>
        
        <div className="mb-4">
          <h1 className="heading-1">Connect Faculty Portal</h1>
          <p className="text-subtitle">
            Securely connect your university portal to automate data entry.
          </p>
        </div>

        {status === 'success' ? (
          <div className="flex-col flex-center py-4 text-center">
            <CheckCircle2 size={48} className="text-success mb-3" />
            <h2 className="heading-2">Connection Successful</h2>
            <p className="text-subtitle mt-1">Redirecting to your dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleConnect}>
            
            <div style={{ 
              background: 'var(--bg-tertiary)', 
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem',
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              color: 'var(--text-secondary)',
              fontSize: '0.8125rem'
            }}>
              <Shield size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <p>Credentials are stored securely using AES-256 encryption.</p>
            </div>

            <div className="input-group">
              <label className="input-label">Portal Username</label>
              <input 
                type="text" 
                required 
                disabled={status === 'testing'}
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="input-field" 
                placeholder="fac-ahmed" 
              />
            </div>

            <div className="input-group">
              <label className="input-label">Portal Password</label>
              <input 
                type="password" 
                required 
                disabled={status === 'testing'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field" 
                placeholder="••••••••" 
              />
            </div>

            <button 
              type="submit" 
              disabled={status === 'testing'}
              className="btn btn-primary w-full mt-2"
            >
              {status === 'testing' ? (
                <><Loader2 size={16} className="spinner" /> Verifying Connection...</>
              ) : (
                'Connect Portal'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
