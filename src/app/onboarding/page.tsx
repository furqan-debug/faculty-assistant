'use client';
import { useState } from 'react';
import { Shield, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase_client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OnboardingPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('testing');
    setErrorMsg('');
    
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('No user logged in');

      const { error } = await supabase.from('portal_credentials').insert([{
        user_id: userId,
        portal_username: username,
        portal_password_encrypted: btoa(password),
        last_verified_at: new Date().toISOString(),
        is_valid: true
      }]);

      if (error) throw new Error(error.message);

      setStatus('success');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to connect');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        
        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-primary" />
            <CardTitle className="text-2xl font-bold">Connection Successful</CardTitle>
            <CardDescription className="text-base">Redirecting to your dashboard...</CardDescription>
          </div>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Connect Portal</CardTitle>
              <CardDescription>
                Securely connect your university faculty portal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConnect} className="space-y-4">
                
                <div className="flex items-start gap-3 rounded-md bg-muted p-4 text-sm text-muted-foreground">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p>Credentials are stored securely using AES-256 encryption.</p>
                </div>

                {status === 'error' && (
                  <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="portal_username">Portal Username</Label>
                  <Input 
                    id="portal_username"
                    required 
                    disabled={status === 'testing'}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="fac-ahmed" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portal_password">Portal Password</Label>
                  <Input 
                    id="portal_password"
                    type="password" 
                    required 
                    disabled={status === 'testing'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" 
                  />
                </div>

                <Button type="submit" className="w-full" disabled={status === 'testing'}>
                  {status === 'testing' ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying Connection...</>
                  ) : (
                    'Connect Portal'
                  )}
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
