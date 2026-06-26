'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase_client';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const university = formData.get('university') as string;

    try {
      if (isLogin) {
        const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
        if (error || !data) throw new Error('Invalid credentials');
        
        localStorage.setItem('user_id', data.id);
        router.push('/dashboard');
      } else {
        const { data, error } = await supabase.from('users').insert([{
          full_name: name,
          university: university,
          email: email
        }]).select().single();
        
        if (error) throw new Error(error.message);
        
        localStorage.setItem('user_id', data.id);
        router.push('/onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
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

        {error && <div className="text-danger text-sm mb-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" name="name" required className="input-field" placeholder="Dr. Ahmed" />
              </div>
              
              <div className="input-group">
                <label className="input-label">University</label>
                <select name="university" required className="input-field">
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
            <input type="email" name="email" required className="input-field" placeholder="ahmed@ssuet.edu.pk" />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input type="password" name="password" required className="input-field" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2">
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="text-center mt-4">
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }} 
            className="btn btn-ghost text-sm w-full"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
        
      </div>
    </div>
  );
}
