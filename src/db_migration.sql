CREATE TABLE IF NOT EXISTS public.curriculum_subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  area TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.curriculum_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institutions can view their own subjects" 
ON public.curriculum_subjects FOR SELECT 
USING (institution_id = (SELECT institution_id FROM public.profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Admins can insert subjects" 
ON public.curriculum_subjects FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('rector', 'coordinador')
  )
);

CREATE POLICY "Admins can update subjects" 
ON public.curriculum_subjects FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('rector', 'coordinador')
  )
);

CREATE TABLE IF NOT EXISTS public.academic_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  academic_period_id UUID NOT NULL REFERENCES public.academic_periods(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.curriculum_subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  classroom TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_academic_schedules_course ON public.academic_schedules(course_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_academic_schedules_teacher ON public.academic_schedules(teacher_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_academic_schedules_classroom ON public.academic_schedules(classroom, day_of_week);

ALTER TABLE public.academic_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view schedules of their institution" 
ON public.academic_schedules FOR SELECT 
USING (institution_id = (SELECT institution_id FROM public.profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Admins can modify schedules" 
ON public.academic_schedules FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('rector', 'coordinador')
  )
);

CREATE TABLE IF NOT EXISTS public.schedule_change_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES public.academic_schedules(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  proposed_day INTEGER CHECK (proposed_day >= 1 AND proposed_day <= 7),
  proposed_start_time TIME,
  proposed_end_time TIME,
  proposed_classroom TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.schedule_change_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own requests and admins can view all"
ON public.schedule_change_requests FOR SELECT
USING (
  requested_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('rector', 'coordinador')
  )
);

CREATE POLICY "Teachers can create requests"
ON public.schedule_change_requests FOR INSERT
WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Admins can review requests"
ON public.schedule_change_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('rector', 'coordinador')
  )
);

-- Drop policies if they already exist to avoid errors (just in case)
-- Actually, let's just let it run. If it fails, I'll drop them first.
