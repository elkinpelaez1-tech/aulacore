-- =================================================================
-- AulaCore - Phase VI: Proyecto Educativo Institucional (PEI) Schema
-- =================================================================

-- -----------------------------------------------------------------
-- 1. CREACIÓN DE TABLAS EXCLUSIVAS PARA PEI
-- -----------------------------------------------------------------

-- TABLA: pei_identity (Misión, Visión, Valores, Principios y Perfiles)
create table if not exists public.pei_identity (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  mission text,
  vision text,
  principles text,
  values text,
  student_profile text,
  teacher_profile text,
  graduate_profile text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: pei_pedagogical_model (Modelo Pedagógico y descripción)
create table if not exists public.pei_pedagogical_model (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  model_type varchar(100) not null, -- 'Tradicional', 'Constructivista', 'Montessori', 'Reggio Emilia', 'ABP', 'Aprendizaje Significativo', 'Personalizado'
  description text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: pei_school_government (Gobierno Escolar: Integrantes, Cargos y Periodos)
create table if not exists public.pei_school_government (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  body_type varchar(100) not null, -- 'Rector', 'Consejo Directivo', 'Consejo Académico', 'Consejo Estudiantil', 'Personero', 'Contralor Escolar', 'Consejo de Padres'
  member_name varchar(255) not null,
  role_title varchar(255) not null,
  period varchar(50) not null, -- e.g. '2026'
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: pei_manual_versions (Manual de Convivencia: Control de Versiones e Historial)
create table if not exists public.pei_manual_versions (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  version varchar(50) not null, -- e.g. '1.0.0'
  pdf_url text not null,
  update_notes text,
  is_active boolean default true not null,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: pei_projects (Proyectos Institucionales y Transversales)
create table if not exists public.pei_projects (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  project_type varchar(100) not null, -- 'PRAE', 'Democracia', 'Educación Sexual', 'Derechos Humanos', 'Competencias Ciudadanas', 'Proyecto Personalizado', 'Orientador Escolar'
  objective text,
  responsible varchar(255),
  schedule text, -- Cronograma
  evidences text[], -- Colección de evidencias (archivos o URLs)
  status varchar(50) default 'Planeado' not null, -- 'Planeado', 'Activo', 'Completado', 'Suspendido'
  indicators text, -- Indicadores de avance
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -----------------------------------------------------------------
-- 2. HABILITACIÓN DE RLS Y POLÍTICAS DE ACCESO MULTITENANT
-- -----------------------------------------------------------------
alter table public.pei_identity enable row level security;
alter table public.pei_pedagogical_model enable row level security;
alter table public.pei_school_government enable row level security;
alter table public.pei_manual_versions enable row level security;
alter table public.pei_projects enable row level security;

-- Políticas: select disponible para usuarios del mismo tenant (Rector, Coordinador, Docente, Secretaria)
create policy "Lectura de identidad PEI por tenant"
  on public.pei_identity for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de modelo pedagógico por tenant"
  on public.pei_pedagogical_model for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de gobierno escolar por tenant"
  on public.pei_school_government for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de manual de convivencia por tenant"
  on public.pei_manual_versions for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de proyectos por tenant"
  on public.pei_projects for select to authenticated
  using (institution_id = public.active_institution_id());

-- Políticas: escritura reservada a roles permitidos del mismo tenant
create policy "Gestión de identidad PEI para Rector y Secretaria"
  on public.pei_identity for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria'))
  );

create policy "Gestión de modelo pedagógico para Rector y Secretaria"
  on public.pei_pedagogical_model for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria'))
  );

create policy "Gestión de gobierno escolar para Rector, Secretaria y Coordinador"
  on public.pei_school_government for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador'))
  );

create policy "Gestión de manual de convivencia para Rector y Secretaria"
  on public.pei_manual_versions for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria'))
  );

create policy "Gestión de proyectos para Rector, Secretaria y Coordinador"
  on public.pei_projects for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador'))
  );

-- -----------------------------------------------------------------
-- 3. SEMILLA DE DATOS (Seed Data para Demo)
-- -----------------------------------------------------------------

-- Identidad Institucional
insert into public.pei_identity (
  id, institution_id, mission, vision, principles, values, student_profile, teacher_profile, graduate_profile
) values (
  '88888888-8888-8888-8888-aaaa11112222',
  '11111111-1111-1111-1111-111111111111',
  'Formar líderes éticos, creativos y competentes mediante una educación de excelencia e integral que promueva el desarrollo sostenible y la paz social.',
  'Ser en el 2030 una institución educativa referente a nivel nacional por su innovación pedagógica, el liderazgo digital y el compromiso social de sus egresados.',
  'La centralidad del estudiante en el aprendizaje, la justicia social, el respeto a la diversidad y la investigación científica.',
  'Respeto, Honestidad, Responsabilidad, Empatía, Solidaridad, Tolerancia.',
  'Estudiante crítico, indagador, ético, autónomo en su aprendizaje y comprometido con su comunidad.',
  'Docente facilitador, actualizado, investigador, que promueve la creatividad y la inclusión pedagógica.',
  'Ciudadano integral, emprendedor, con altas competencias académicas, comunicativas y habilidades digitales.'
) on conflict (id) do nothing;

-- Modelo Pedagógico
insert into public.pei_pedagogical_model (
  id, institution_id, model_type, description
) values (
  '88888888-8888-8888-8888-bbbb11112222',
  '11111111-1111-1111-1111-111111111111',
  'Constructivista',
  'El modelo pedagógico de AulaCore se fundamenta en el constructivismo social, donde el aprendizaje es un proceso activo de construcción de significado. El estudiante conecta nuevos saberes con sus experiencias previas mediante el trabajo colaborativo, la investigación guiada y la resolución de problemas reales (ABP), acompañado por el docente como facilitador.'
) on conflict (id) do nothing;

-- Gobierno Escolar (Integrantes)
insert into public.pei_school_government (
  id, institution_id, body_type, member_name, role_title, period
) values 
  ('88888888-8888-8888-8888-c00111112222', '11111111-1111-1111-1111-111111111111', 'Rector', 'Dr. Ramón Ramírez', 'Rector de la Institución', '2026'),
  ('88888888-8888-8888-8888-c00211112222', '11111111-1111-1111-1111-111111111111', 'Consejo Directivo', 'Dr. Ramón Ramírez', 'Presidente', '2026'),
  ('88888888-8888-8888-8888-c00311112222', '11111111-1111-1111-1111-111111111111', 'Consejo Directivo', 'Dra. Diana Carolina Reyes', 'Representante de Docentes', '2026'),
  ('88888888-8888-8888-8888-c00411112222', '11111111-1111-1111-1111-111111111111', 'Consejo Académico', 'Lic. Carlos Martínez', 'Representante de Humanidades', '2026'),
  ('88888888-8888-8888-8888-c00511112222', '11111111-1111-1111-1111-111111111111', 'Consejo Estudiantil', 'Mateo Gómez', 'Representante Grado Décimo', '2026'),
  ('88888888-8888-8888-8888-c00611112222', '11111111-1111-1111-1111-111111111111', 'Personero', 'Alejandro Ortiz', 'Personero de Estudiantes', '2026'),
  ('88888888-8888-8888-8888-c00711112222', '11111111-1111-1111-1111-111111111111', 'Contralor Escolar', 'Sofía Ramírez', 'Contralora Escolar', '2026'),
  ('88888888-8888-8888-8888-c00811112222', '11111111-1111-1111-1111-111111111111', 'Consejo de Padres', 'Carlos Ortiz', 'Representante Grado Décimo A', '2026')
on conflict (id) do nothing;

-- Manual de Convivencia (Versiones)
insert into public.pei_manual_versions (
  id, institution_id, version, pdf_url, update_notes, is_active
) values 
  ('88888888-8888-8888-8888-d00111112222', '11111111-1111-1111-1111-111111111111', '1.0.0', '/manual-convivencia-v1.0.pdf', 'Versión inicial aprobada por el Consejo Directivo en 2024.', false),
  ('88888888-8888-8888-8888-d00211112222', '11111111-1111-1111-1111-111111111111', '2.0.0', '/manual-convivencia-v2.0.pdf', 'Ajuste de normativas de uso de celulares en el aula y actualización de rutas de atención de la Ley 1620.', true)
on conflict (id) do nothing;

-- Proyectos Institucionales
insert into public.pei_projects (
  id, institution_id, project_type, objective, responsible, schedule, evidences, status, indicators
) values 
  (
    '88888888-8888-8888-8888-e00111112222',
    '11111111-1111-1111-1111-111111111111',
    'PRAE',
    'Promover una cultura de reciclaje, conservación del agua y manejo adecuado de residuos sólidos dentro del colegio para mitigar el impacto ambiental.',
    'Lic. Diana Carolina Reyes',
    'Marzo a Noviembre - Actividades semanales de compostaje y jornadas mensuales ecológicas.',
    array['/evidencias/prae-jornada-siembra.jpg', '/evidencias/taller-reciclaje.pdf'],
    'Activo',
    '92% de cobertura de participación estudiantil; 450 kg de material reciclable clasificado.'
  ),
  (
    '88888888-8888-8888-8888-e00211112222',
    '11111111-1111-1111-1111-111111111111',
    'Democracia',
    'Fomentar la cultura de la participación cívica y la toma de decisiones democráticas mediante el proceso de elección del Gobierno Escolar.',
    'Lic. Carlos Martínez',
    'Febrero a Marzo - Debates electorales, votación digital RFID y posesión oficial.',
    array['/evidencias/acta-posesion-personero.pdf', '/evidencias/graficas-escrutinio.png'],
    'Completado',
    '100% de estudiantes habilitados votaron mediante las terminales IoT de AulaCore.'
  ),
  (
    '88888888-8888-8888-8888-e00311112222',
    '11111111-1111-1111-1111-111111111111',
    'Orientador Escolar',
    'Brindar acompañamiento psicosocial continuo y realizar talleres preventivos de salud mental, orientación vocacional y convivencia familiar.',
    'Dra. Elena Toro',
    'Permanente - Tutorías individuales los martes y jueves por la tarde, talleres grupales mensuales.',
    array['/evidencias/taller-prevencion-ansiedad.pdf'],
    'Activo',
    '45 tutorías individuales realizadas; 10 talleres grupales ejecutados con éxito.'
  )
on conflict (id) do nothing;
