import { getServiceRoleClient } from './supabase_client';
import { GeminiExtractor } from './gemini_extractor';
import { SsuetAdapter } from './ssuet_adapter';

/**
 * MOCK BACKGROUND QUEUE WORKER
 * In a real production app, you would use a robust queue like BullMQ (Redis) or AWS SQS.
 * This function simulates what the background worker does when it picks up a "Job Ticket" 
 * from the database after a teacher clicks "Submit to Portal".
 */
export async function processJobTicket(jobId: string) {
    const supabaseAdmin = getServiceRoleClient();
    let job: any = null;
    
    try {
        // 1. Fetch the job details
        console.log(`[Worker] Picking up job ${jobId}...`);
        const { data, error: jobError } = await supabaseAdmin
            .from('job_tickets')
            .select('*, portal_credentials(*)')
            .eq('id', jobId)
            .single();
            
        job = data;
        if (jobError || !job) throw new Error("Job not found.");

        // 2. Mark job as processing
        await supabaseAdmin.from('job_tickets').update({ status: 'injecting' }).eq('id', jobId);

        // 3. Initialize Playwright Adapter for the correct university
        if (job.portal_credentials.university !== 'SSUET') {
            throw new Error(`Unsupported university: ${job.portal_credentials.university}`);
        }

        const adapter = new SsuetAdapter();
        // Passing the cached session cookie if we have one to bypass login
        await adapter.init(job.portal_credentials.session_cookie); 

        // 4. Perform Login (or it will bypass if session exists)
        // Note: Decrypting the password securely before passing it here is required in production
        const loggedIn = await adapter.login(
            job.portal_credentials.encrypted_username, 
            job.portal_credentials.encrypted_password 
        );

        if (!loggedIn) throw new Error("Failed to log into the portal.");

        // 5. Inject the verified data and capture Audit Trail Receipt
        // We save a screenshot as undeniable proof the marks were entered into the University portal.
        const screenshotPath = `./tmp/receipts/job_${jobId}_receipt.png`;
        await adapter.injectMarks(job.course_id, job.extracted_data, screenshotPath);

        // 6. Save the new session cookie and close browser
        const sessionPath = `./tmp/sessions/${job.user_id}.json`;
        await adapter.close(sessionPath);
        
        // (In production: Upload `screenshotPath` and `sessionPath` to Supabase Storage bucket here)

        // 7. Mark Job as Completed and attach the Audit Trail Receipt URL
        await supabaseAdmin.from('job_tickets').update({ 
            status: 'completed',
            screenshot_url: screenshotPath // In production, this would be the Storage bucket URL
        }).eq('id', jobId);
        
        // 8. Log the successful injection in the audit trail
        await supabaseAdmin.from('audit_logs').insert({
            job_id: jobId,
            user_id: job.user_id,
            action: 'EXTRACTION_INJECTED_TO_PORTAL',
            details: { records_injected: job.extracted_data.length, screenshot: screenshotPath }
        });

        console.log(`[Worker] Job ${jobId} completed successfully! Audit receipt saved.`);

    } catch (error: any) {
        console.error(`[Worker] Job ${jobId} failed:`, error.message);
        // Mark job as failed so the user knows
        await supabaseAdmin.from('job_tickets').update({ 
            status: 'failed', 
            error_message: error.message 
        }).eq('id', jobId);

        // Log the failure
        if (job && job.user_id) {
            await supabaseAdmin.from('audit_logs').insert({
                job_id: jobId,
                user_id: job.user_id, // ensure user_id is passed
                action: 'PORTAL_INJECTION_FAILED',
                details: { error: error.message }
            });
        }
    }
}
