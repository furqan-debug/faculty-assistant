'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Clock, Settings, LogOut, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase_client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const courses = ['CS-101 Introduction to CS', 'CS-205 Database Systems', 'CS-301 Data Structures'];

  useEffect(() => {
    const fetchJobs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      
      const { data, error } = await supabase
        .from('job_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setRecentUploads(data);
      setLoading(false);
    };

    fetchJobs();
  }, [router]);

  return (
    <div className="min-h-screen bg-muted/40">
      <nav className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
            <span className="text-primary-foreground font-bold text-xs">E</span>
          </div>
          <span className="font-semibold text-sm">EduSmartz</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground font-medium">Dashboard</span>
          <div className="h-5 w-px bg-border"></div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground"
            onClick={async () => { 
              await supabase.auth.signOut(); 
              router.push('/auth'); 
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      <div className="container max-w-6xl py-8">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
          
          <aside className="space-y-6">
            <Button asChild className="w-full justify-start font-medium h-10">
              <Link href="/dashboard/upload">
                <Plus className="mr-2 h-4 w-4" /> New Upload
              </Link>
            </Button>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Your Courses</h3>
              <ul className="space-y-1">
                {courses.map((course, i) => (
                  <li key={i}>
                    <Button variant="ghost" className="w-full justify-start text-sm font-normal h-9">
                      {course}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <main className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Recent Uploads</h1>
            </div>
            
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p className="text-sm font-medium">Loading your uploads...</p>
                  </div>
                ) : recentUploads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Clock className="h-8 w-8 mb-4 text-muted-foreground/50" />
                    <p className="text-sm font-medium">No activity yet.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentUploads.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-6 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          {job.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : job.status === 'processing' ? (
                            <div className="h-5 w-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive" />
                          )}
                          <div>
                            <p className="font-semibold text-sm">
                              {job.course_id} — {job.assessment_type}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">
                              {new Date(job.created_at).toLocaleString()} • {job.extracted_data?.length || 0} Students
                            </p>
                          </div>
                        </div>
                        
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          asChild
                        >
                          <Link href={job.status === 'processing' ? `/dashboard/verify/${job.id}` : `/dashboard/report/${job.id}`}>
                            {job.status === 'processing' ? 'Verify Data' : 'View Report'}
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>

        </div>
      </div>
    </div>
  );
}
