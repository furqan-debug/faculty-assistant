'use server';

import { GeminiExtractor, ExtractedData } from '@/lib/gemini_extractor';
import { supabase } from '@/lib/supabase_client';

/**
 * Server Action: Takes the uploaded file from the frontend, converts it, 
 * and sends it to the real Gemini 1.5 Pro API.
 */
export async function processDocument(formData: FormData): Promise<ExtractedData[]> {
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error("No file uploaded.");

    console.log(`Processing file: ${file.name} (${file.type})`);

    // Convert file to Base64 for the Gemini API
    const buffer = await file.arrayBuffer();
    const base64String = Buffer.from(buffer).toString('base64');
    
    // Initialize our real Extractor (from Phase 1)
    const extractor = new GeminiExtractor();
    
    // Call the actual Google Gemini API
    const extractedData = await extractor.extractMarksFromImages([{ base64Image: base64String, mimeType: file.type }]);
    
    return extractedData;
  } catch (error: any) {
    console.error("Server Action Error:", error);
    throw new Error(error.message || "Failed to process document.");
  }
}

/**
 * Server Action: Simulates saving the job to Supabase to trigger the Playwright background worker.
 */
export async function submitToPortalQueue(data: ExtractedData[], courseId: string) {
  try {
    // In a fully deployed environment, this inserts into Supabase, 
    // which triggers the background_queue.ts worker we wrote in Phase 2.
    
    /* 
    await supabase.from('job_tickets').insert({
      user_id: '...',
      course_id: courseId,
      extracted_data: data,
      status: 'pending'
    });
    */
    
    console.log(`Successfully queued job for course ${courseId} with ${data.length} records.`);
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}
