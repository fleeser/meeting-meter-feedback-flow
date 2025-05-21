-- Create profiles table with all fields and RLS setup
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'User',
  department TEXT,
  position TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  join_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all users to read all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow users to update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Allow users to create profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Create questions table with RLS setup
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read questions" 
ON public.questions 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to create questions" 
ON public.questions 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own questions" 
ON public.questions 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by);

CREATE POLICY "Allow users to delete their own questions" 
ON public.questions 
FOR DELETE 
TO authenticated 
USING (auth.uid() = created_by);

-- Create templates table with RLS setup
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  is_used_in_surveys BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read templates" 
ON public.templates 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to create templates" 
ON public.templates 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own templates" 
ON public.templates 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by);

CREATE POLICY "Allow users to delete their own templates" 
ON public.templates 
FOR DELETE 
TO authenticated 
USING (auth.uid() = created_by);

-- Create template_questions table with RLS setup
CREATE TABLE public.template_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  order_position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(template_id, question_id)
);

ALTER TABLE public.template_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage template_questions" 
ON public.template_questions 
FOR ALL 
TO authenticated 
USING (auth.role() = 'authenticated');

-- Create function to generate a random survey share link
CREATE OR REPLACE FUNCTION public.generate_share_link() 
RETURNS TEXT AS $$
DECLARE
  base_url TEXT := 'https://meetingfeedback.app/survey/';
  random_id TEXT;
BEGIN
  random_id := encode(gen_random_bytes(8), 'hex');
  RETURN base_url || random_id;
END;
$$ LANGUAGE plpgsql;

-- Create surveys table with all fields (including due_date) and RLS setup
CREATE TABLE public.surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Active', 'Closed')) DEFAULT 'Draft',
  template_id UUID NOT NULL REFERENCES public.templates(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  share_link TEXT NOT NULL DEFAULT public.generate_share_link(),
  due_date DATE
);

ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read surveys" 
ON public.surveys 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to create surveys" 
ON public.surveys 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own surveys" 
ON public.surveys 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by);

CREATE POLICY "Allow users to delete their own surveys" 
ON public.surveys 
FOR DELETE 
TO authenticated 
USING (auth.uid() = created_by);

-- Create survey_participants table with RLS setup
CREATE TABLE public.survey_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(survey_id, profile_id)
);

ALTER TABLE public.survey_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage survey_participants" 
ON public.survey_participants 
FOR ALL 
TO authenticated 
USING (auth.role() = 'authenticated');

-- Create survey_responses table with RLS setup
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  respondent_id UUID REFERENCES public.profiles(id),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to submit responses" 
ON public.survey_responses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read responses" 
ON public.survey_responses 
FOR SELECT 
TO authenticated 
USING (auth.role() = 'authenticated');

-- Create response_answers table with RLS setup
CREATE TABLE public.response_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id UUID NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 4),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.response_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to submit response answers" 
ON public.response_answers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read response answers" 
ON public.response_answers 
FOR SELECT 
TO authenticated 
USING (auth.role() = 'authenticated');

-- Create trigger function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', 'RateLiner'), new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();