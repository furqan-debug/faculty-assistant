-- Schema Design for Faculty Automation Assistant

-- 1. Users Table (Extending Supabase Auth)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    university_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Encrypted Credentials (Requires pgcrypto extension)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.portal_credentials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    university TEXT NOT NULL, -- e.g., 'SSUET'
    encrypted_username TEXT NOT NULL,
    encrypted_password TEXT NOT NULL,
    session_cookie JSONB, -- Cache for Playwright session
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Job Tickets (Tracking background processing)
CREATE TYPE job_status AS ENUM ('pending', 'extracting', 'needs_review', 'injecting', 'completed', 'failed');

CREATE TABLE public.job_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    section TEXT, -- e.g., 'Section A', 'Section B'
    assessment_type TEXT NOT NULL, -- e.g., 'Midterm', 'Assignment 1'
    status job_status DEFAULT 'pending',
    file_url TEXT NOT NULL, -- URL to Supabase Storage bucket
    extracted_data JSONB, -- Holds the JSON from Gemini before review
    confidence_metrics JSONB, -- Holds confidence scores for extracted fields
    screenshot_url TEXT, -- URL to Playwright success screenshot
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Audit Logs (Tracking actions and errors)
CREATE TABLE public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.job_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- e.g., 'EXTRACTION_COMPLETED', 'PORTAL_LOGIN_FAILED'
    details JSONB, -- Additional details about the action or error
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to only see their own data
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own credentials" ON public.portal_credentials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own jobs" ON public.job_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own audit logs" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);
