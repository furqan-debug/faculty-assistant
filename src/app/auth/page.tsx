'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/onboarding');
  };

  return (
    <div className="center-screen">
      <div className="panel" style={{ width: '100%', maxWidth: '400px' }}>
        
        <div className="mb-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '24px', height: '24px', backgroundColor: 'var(--text-primary)', borderRadius: '4px' }}></div>
            <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>EduSmartz</span>
          </div>
          <h1 className="heading-1">
            {isLogin ? 'Sign in to your account' : 'Create an account'}
          </h1>
          <p className="text-subtitle">
            {isLogin ? 'Enter your credentials to access the dashboard.' : 'Enter your details to get started.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
          {!isLogin && (
            <>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" required className="input-field" placeholder="Dr. Ahmed" />
              </div>
              
              <div className="input-group">
                <label className="input-label">University</label>
                <select required className="input-field">
                  <option value="" disabled>Select your university...</option>
                  <option value="SSUET">Sir Syed University (SSUET)</option>
                  <option value="FAST">FAST NUCES</option>
                  <option value="NED">NED University</option>
                </select>
              </div>
            </>
          )}

          <div className="input-group">
            <label className="input-label">University Email</label>
            <input type="email" required className="input-field" placeholder="ahmed@ssuet.edu.pk" />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input type="password" required className="input-field" placeholder="••••••••" />
          </div>

          <button type="submit" className="btn btn-primary w-full mt-2">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)} 
            className="btn btn-ghost text-sm w-full"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
        
      </div>
    </div>
  );
}
