'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase_client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportPage() {
  const params = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchJob = async () => {
      const { data } = await supabase.from('job_tickets').select('*').eq('id', params.jobId).single();
      if (data) setJob(data);
      setLoading(false);
    };
    fetchJob();
  }, [params.jobId]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Report not found</h2>
          <Button asChild variant="outline"><Link href="/dashboard">Return to Dashboard</Link></Button>
        </div>
      </div>
    );
  }

  const studentsCount = job.extracted_data ? job.extracted_data.length : 0;

  return (
    <div className="min-h-screen bg-muted/40">
      <nav className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background px-6 py-4">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <span className="font-semibold text-sm">Submission Report</span>
      </nav>

      <div className="container max-w-2xl py-12">
        
        <div className="mb-10 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Submission Complete</h1>
          <p className="text-muted-foreground text-lg">
            Data for {job.assessment_type} has been successfully synced to the portal.
          </p>
        </div>

        <Card>
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-lg">Job Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Course</p>
                <p className="font-semibold text-lg">{job.course_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Date</p>
                <p className="font-semibold text-lg">{new Date(job.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Processed</span>
                <span className="font-semibold">{studentsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Successful</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{studentsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-destructive">Failed</span>
                <span className="font-semibold text-destructive">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 mt-8">
          <Button asChild className="flex-1" size="lg">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
          <Button variant="outline" size="lg">
            <Download className="mr-2 h-4 w-4" /> Download JSON
          </Button>
        </div>

      </div>
    </div>
  );
}
