'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase_client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function VerifyPage() {
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data: job, error } = await supabase.from('job_tickets').select('*').eq('id', params.jobId).single();
        if (error) throw new Error(error.message);

        const mockData = [
          { studentName: 'Ali Khan', studentId: 'CS-101', marks: '85', confidenceScore: 98, status: 'verified' },
          { studentName: 'Sara Ahmed', studentId: 'CS-102', marks: '72', confidenceScore: 65, status: 'review' },
        ];
        
        setData(job.extracted_data || mockData);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load job');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [params.jobId]);

  const handleMarkUpdate = (index: number, newMarks: string) => {
    const newData = [...data];
    newData[index].marks = newMarks;
    newData[index].confidenceScore = 100;
    newData[index].status = 'verified';
    setData(newData);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.from('job_tickets').update({
        status: 'completed',
        extracted_data: data
      }).eq('id', params.jobId);

      if (error) throw new Error(error.message);

      router.push(`/dashboard/report/${params.jobId}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit');
      setIsSubmitting(false);
    }
  };

  const hasReviewItems = data.some(d => d.status === 'review');

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <nav className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-semibold text-sm">Verify Data</h1>
            <p className="text-xs text-muted-foreground">ID: {params.jobId}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || hasReviewItems}
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Syncing...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Submit to Portal</>
            )}
          </Button>
        </div>
      </nav>

      <div className="container max-w-5xl py-8">
        
        {errorMsg && (
          <div className="mb-6 p-4 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {hasReviewItems && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-500">Review Required</h3>
              <p className="text-sm text-amber-700/90 dark:text-amber-500/90 mt-1">
                Please check the records highlighted below where the AI confidence was low before submitting.
              </p>
            </div>
          </div>
        )}

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-6 py-4 font-medium text-muted-foreground">Student Name</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Roll Number</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Extracted Marks</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Confidence</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((row, index) => (
                  <tr key={index} className={row.status === 'review' ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-muted/50 transition-colors'}>
                    <td className="px-6 py-4 font-medium">{row.studentName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{row.studentId}</td>
                    <td className="px-6 py-4">
                      <Input 
                        value={row.marks}
                        onChange={(e) => handleMarkUpdate(index, e.target.value)}
                        className={row.status === 'review' ? 'border-amber-500 ring-amber-500 w-24' : 'w-24'}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className={
                        row.confidenceScore > 85 ? 'text-emerald-500 font-medium' : 
                        row.confidenceScore > 50 ? 'text-amber-500 font-medium' : 'text-destructive font-medium'
                      }>
                        {row.confidenceScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {row.status === 'review' ? (
                        <span className="inline-flex items-center rounded-full border border-transparent bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                          Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-transparent bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          Verified
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
