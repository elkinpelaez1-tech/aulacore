-- =========================================================================================
-- 🏛️ AULACORE ENTERPRISE - CURRICULUM ENGINE SCHEMA
-- =========================================================================================
-- Descripción: Motor pedagógico y metodológico. Transforma los documentos de planeación
--              aislados en un grafo relacional vivo con auditoría y versionado JSONB.
-- Autor: AulaCore Core Team
-- =========================================================================================

-- 1. TIPOS ENUMERADOS
CREATE TYPE curriculum_status AS ENUM ('draft', 'submitted', 'revision', 'approved', 'archived');
CREATE TYPE ai_confidence_level AS ENUM ('low', 'medium', 'high', 'verified');

-- =================================================================
-- 📚 TABLAS BASE: ÁREAS Y ASIGNATURAS
-- =================================================================

-- Áreas Fundamentales (ej. Matemáticas, Humanidades)
CREATE TABLE public.curriculum_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color_hex VARCHAR(7) DEFAULT '#4F46E5', -- Color para la UI
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asignaturas (ej. Álgebra, Tecnología e Informática, dependientes de un Área)
CREATE TABLE public.curriculum_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID REFERENCES public.curriculum_areas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  intensity_hours INTEGER DEFAULT 4,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- 🗺️ CABECERA: MALLAS CURRICULARES
-- =================================================================

CREATE TABLE public.curriculum_grids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.curriculum_subjects(id) ON DELETE CASCADE,
  grade_id UUID REFERENCES public.grades(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,     -- Creador / Responsable
  coordinator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Aprobador
  
  academic_year VARCHAR(9) NOT NULL, -- Ej: '2026-2027'
  status curriculum_status DEFAULT 'draft',
  
  general_objective TEXT,
  justification TEXT,
  
  -- Preparación IA Futura
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt_hash TEXT,
  semantic_tags TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ
);

-- =================================================================
-- ⏱️ PERIODOS CURRICULARES
-- =================================================================

CREATE TABLE public.curriculum_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_id UUID REFERENCES public.curriculum_grids(id) ON DELETE CASCADE,
  period_number INTEGER NOT NULL, -- 1, 2, 3, 4
  name TEXT NOT NULL,             -- Ej: 'Primer Periodo', 'Trimestre 1'
  period_objective TEXT,
  estimated_weeks INTEGER DEFAULT 10,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- 🧠 NÚCLEO PEDAGÓGICO: COMPETENCIAS, INDICADORES Y EVIDENCIAS
-- =================================================================

CREATE TABLE public.curriculum_competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID REFERENCES public.curriculum_periods(id) ON DELETE CASCADE,
  competency_type VARCHAR(50) NOT NULL, -- 'saber', 'hacer', 'ser', 'convivir'
  description TEXT NOT NULL,
  
  -- Preparación IA
  ai_suggestions JSONB,
  embedding VECTOR(1536), -- Para futuras búsquedas semánticas (pgvector)
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.curriculum_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competency_id UUID REFERENCES public.curriculum_competencies(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  performance_level VARCHAR(50), -- 'bajo', 'basico', 'alto', 'superior' (Opcional, si se quiere predefinir rúbrica)
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.curriculum_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id UUID REFERENCES public.curriculum_indicators(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  evidence_type VARCHAR(50), -- 'producto', 'desempeño', 'conocimiento'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- 🛠️ METODOLOGÍAS Y EVALUACIÓN
-- =================================================================

CREATE TABLE public.curriculum_methodologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID REFERENCES public.curriculum_periods(id) ON DELETE CASCADE,
  strategy_name TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Preparación IA
  ai_metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.curriculum_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID REFERENCES public.curriculum_periods(id) ON DELETE CASCADE,
  evaluation_type VARCHAR(50), -- 'diagnostica', 'formativa', 'sumativa'
  description TEXT NOT NULL,
  weight_percentage NUMERIC(5,2), -- Peso sobre el periodo
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.curriculum_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID REFERENCES public.curriculum_periods(id) ON DELETE CASCADE,
  resource_type VARCHAR(50), -- 'fisico', 'digital', 'bibliografico', 'laboratorio'
  name TEXT NOT NULL,
  link_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- 🔒 TRAZABILIDAD, AUDITORÍA Y WORKFLOW
-- =================================================================

-- Historial Inmutable (Snapshots JSONB)
CREATE TABLE public.curriculum_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_id UUID REFERENCES public.curriculum_grids(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  status_changed_to curriculum_status NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- LA MAGIA: Un snapshot completo de todas las tablas dependientes en formato JSONB.
  -- Esto evita tener que versionar 10 tablas diferentes fila por fila.
  snapshot_data JSONB NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback y Comentarios de Revisión (Coordinador -> Docente)
CREATE TABLE public.curriculum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_id UUID REFERENCES public.curriculum_grids(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  target_section VARCHAR(50), -- 'general', 'competencies', 'methodologies', etc.
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- =================================================================
-- 🛡️ POLÍTICAS DE SEGURIDAD (RLS) - PRIVACIDAD ESTRICTA
-- =================================================================

-- Habilitar RLS en tablas principales
ALTER TABLE public.curriculum_grids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_competencies ENABLE ROW LEVEL SECURITY;

-- 1. Padres de Familia NUNCA pueden ver las mallas
-- 2. Docentes ven sus propias mallas y las mallas aprobadas de su área (si la institución lo permite)
-- 3. Coordinadores y Rectores ven todas las mallas de la institución

CREATE POLICY "Docentes ven sus mallas" ON public.curriculum_grids
  FOR SELECT USING (
    auth.uid() = teacher_id OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('rector', 'coordinador'))
  );

CREATE POLICY "Coordinadores ven todo de su institucion" ON public.curriculum_grids
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('rector', 'coordinador'))
  );

CREATE POLICY "Docentes pueden editar sus mallas en draft o revision" ON public.curriculum_grids
  FOR UPDATE USING (
    auth.uid() = teacher_id AND status IN ('draft', 'revision')
  );

-- =================================================================
-- ⚡ TRIGGERS AUTOMÁTICOS
-- =================================================================

-- Actualizar updated_at
CREATE OR REPLACE FUNCTION update_curriculum_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_grid_timestamp
BEFORE UPDATE ON public.curriculum_grids
FOR EACH ROW EXECUTE FUNCTION update_curriculum_timestamp();

CREATE TRIGGER update_period_timestamp
BEFORE UPDATE ON public.curriculum_periods
FOR EACH ROW EXECUTE FUNCTION update_curriculum_timestamp();
