import { createClient } from '@supabase/supabase-js';

// These should be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Standard Supabase client for frontend usage (honors RLS)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Service Role client for backend background jobs (bypasses RLS).
 * NEVER expose this to the frontend.
 */
export const getServiceRoleClient = () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for background task.");
    }
    return createClient(supabaseUrl, serviceRoleKey);
};
