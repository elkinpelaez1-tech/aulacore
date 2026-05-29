-- =================================================================
-- AULACORE: STUDENT ENGINE & AI GAMIFICATION
-- =================================================================
-- Objetivo: Almacenar la trazabilidad del rendimiento, 
-- streaks, gamificación elegante y sugerencias IA para Estudiantes.
-- =================================================================

-- 1. Perfil de Gamificación del Estudiante
CREATE TABLE public.student_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL, -- FK a la tabla real de usuarios/estudiantes
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  
  -- Para métricas agregadas rápidas
  global_gpa NUMERIC(3,2) DEFAULT 0.00,
  progress_to_goal NUMERIC(5,2) DEFAULT 0.00,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Medallas / Badges (Logros obtenidos)
CREATE TABLE public.student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.student_gamification(student_id) ON DELETE CASCADE,
  badge_name VARCHAR(100) NOT NULL, -- ej: 'Mente Maestra', 'Lector Voraz'
  badge_type VARCHAR(50), -- 'academic', 'attendance', 'behavior'
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Insights de IA (Tutor, Riesgos y Hábitos)
CREATE TABLE public.student_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  
  -- Alertas Predictivas
  risk_level VARCHAR(20), -- 'low', 'medium', 'high'
  critical_subjects TEXT[], -- ej: ['Física', 'Matemáticas']
  
  -- Recomendaciones JSONB
  ai_study_plan JSONB, 
  ai_habit_suggestions JSONB,
  
  -- Búsqueda Semántica Vectorial
  insight_embedding VECTOR(1536),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- ROW LEVEL SECURITY (RLS) - RESTRICCIÓN MÁXIMA
-- =================================================================

ALTER TABLE public.student_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_ai_insights ENABLE ROW LEVEL SECURITY;

-- Los estudiantes SOLO PUEDEN LEER sus propios datos.
CREATE POLICY "Estudiantes leen su perfil" 
ON public.student_gamification FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Estudiantes leen sus medallas" 
ON public.student_badges FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Estudiantes leen sus insights" 
ON public.student_ai_insights FOR SELECT 
USING (auth.uid() = student_id);

-- Ningún estudiante puede insertar, modificar ni eliminar.
-- (Las políticas INSERT/UPDATE/DELETE quedan restringidas implícitamente o solo para Admins).
