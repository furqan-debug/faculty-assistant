'use client';
import { useState } from 'react';
import { ArrowLeft, UploadCloud, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase_client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function UploadWizard() {
  const [step, setStep] = useState(1);
  const [assessmentType, setAssessmentType] = useState('');
  const [course, setCourse] = useState('');
  const [section, setSection] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const assessmentTypes = ['Attendance', 'Quiz', 'Assignment', 'Midterm', 'Final Exam', 'Lab', 'Viva'];
  const courses = ['CS-101', 'CS-205', 'CS-301'];
  const sections = ['Section A', 'Section B', 'Section C'];

  const handleNext = () => setStep(s => Math.min(s + 1, 4));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    setErrorMsg('');
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Not logged in');

      const { data, error } = await supabase.from('job_tickets').insert([{
        user_id: user.id,
        course_id: course,
        assessment_type: assessmentType,
        status: 'processing',
        file_urls: ['uploaded_file_mock.pdf']
      }]).select().single();

      if (error) throw new Error(error.message);

      router.push(`/dashboard/verify/${data.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed');
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <nav className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background px-6 py-4">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <span className="font-semibold text-sm">New Upload</span>
        
        <div className="flex-1"></div>

        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className={cn(step >= 1 && "text-foreground")}>Type</span>
          <span>/</span>
          <span className={cn(step >= 2 && "text-foreground")}>Course</span>
          <span>/</span>
          <span className={cn(step >= 3 && "text-foreground")}>Section</span>
          <span>/</span>
          <span className={cn(step >= 4 && "text-foreground")}>Upload</span>
        </div>
      </nav>

      <div className="container max-w-2xl py-12">
          
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Assessment Type</h1>
            <p className="text-muted-foreground mb-8 text-lg">Select the type of document you are uploading.</p>
            
            <div className="grid grid-cols-2 gap-3">
              {assessmentTypes.map(type => (
                <Card 
                  key={type}
                  onClick={() => { setAssessmentType(type); handleNext(); }}
                  className={cn(
                    "cursor-pointer hover:border-primary transition-colors",
                    assessmentType === type && "border-primary ring-1 ring-primary"
                  )}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="font-medium text-sm">{type}</span>
                    {assessmentType === type && <Check className="h-4 w-4 text-primary" />}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Select Course</h1>
            <p className="text-muted-foreground mb-8 text-lg">Which course does this {assessmentType.toLowerCase()} belong to?</p>
            
            <div className="space-y-3">
              {courses.map(c => (
                <Card 
                  key={c}
                  onClick={() => { setCourse(c); handleNext(); }}
                  className={cn(
                    "cursor-pointer hover:border-primary transition-colors",
                    course === c && "border-primary ring-1 ring-primary"
                  )}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="font-medium text-sm">{c}</span>
                    {course === c && <Check className="h-4 w-4 text-primary" />}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Select Section</h1>
            <p className="text-muted-foreground mb-8 text-lg">Which section of {course}?</p>
            
            <div className="space-y-3">
              {sections.map(s => (
                <Card 
                  key={s}
                  onClick={() => { setSection(s); handleNext(); }}
                  className={cn(
                    "cursor-pointer hover:border-primary transition-colors",
                    section === s && "border-primary ring-1 ring-primary"
                  )}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="font-medium text-sm">{s}</span>
                    {section === s && <Check className="h-4 w-4 text-primary" />}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Upload Documents</h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Uploading {assessmentType} for {course} ({section})
            </p>
            
            {errorMsg && (
              <div className="mb-4 p-4 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
                {errorMsg}
              </div>
            )}

            {isUploading ? (
              <Card className="border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-1">Processing Documents</h3>
                  <p className="text-sm text-muted-foreground">Extracting marks and calculating confidence...</p>
                </CardContent>
              </Card>
            ) : (
              <label className="cursor-pointer block">
                <Card className="border-dashed border-2 hover:bg-muted/50 transition-colors">
                  <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-base font-semibold mb-1">Click or drag files</h3>
                    <p className="text-sm text-muted-foreground">PDF, PNG, or JPEG</p>
                    <input type="file" multiple accept="image/*,.pdf" className="hidden" onChange={handleUpload} />
                  </CardContent>
                </Card>
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
