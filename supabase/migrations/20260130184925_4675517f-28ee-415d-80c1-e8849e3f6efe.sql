-- Create storage bucket for PDF uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', false);

-- Create RLS policies for study-materials bucket
CREATE POLICY "Anyone can upload PDFs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'study-materials');

CREATE POLICY "Anyone can read their uploaded PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'study-materials');

CREATE POLICY "Anyone can delete their PDFs"
ON storage.objects FOR DELETE
USING (bucket_id = 'study-materials');

-- Create table for study sessions
CREATE TABLE public.study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pdf_name TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  pdf_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create sessions (no auth required for this app)
CREATE POLICY "Anyone can create study sessions"
ON public.study_sessions
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read study sessions
CREATE POLICY "Anyone can read study sessions"
ON public.study_sessions
FOR SELECT
USING (true);

-- Allow anyone to update study sessions
CREATE POLICY "Anyone can update study sessions"
ON public.study_sessions
FOR UPDATE
USING (true);

-- Create table for mock test results
CREATE TABLE public.mock_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  wrong_answers INTEGER NOT NULL,
  accuracy DECIMAL(5,2) NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mock_test_results ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create results
CREATE POLICY "Anyone can create mock test results"
ON public.mock_test_results
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read results
CREATE POLICY "Anyone can read mock test results"
ON public.mock_test_results
FOR SELECT
USING (true);