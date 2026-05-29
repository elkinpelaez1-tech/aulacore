-- =================================================================
-- AulaCore - Definitive Relational Schema & Real-world Seed Data
-- Integrando: Periodos Dinámicos, Configuraciones de Colegio & Student 360
-- =================================================================

-- Habilitar extensión pgcrypto
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------
-- 0. LIMPIEZA DE TABLAS ANTERIORES (Para evitar inconsistencias de esquema)
-- -----------------------------------------------------------------
drop table if exists public.early_alerts cascade;
drop table if exists public.behavioral_logs cascade;
drop table if exists public.attendance_records cascade;
drop table if exists public.academic_records cascade;
drop table if exists public.student_enrollments cascade;
drop table if exists public.students cascade;
drop table if exists public.courses cascade;
drop table if exists public.academic_periods cascade;
drop table if exists public.academic_years cascade;
drop table if exists public.institution_academic_settings cascade;

-- -----------------------------------------------------------------
-- 1. CREACIÓN DE NUEVAS TABLAS ACADÉMICAS DINÁMICAS
-- -----------------------------------------------------------------

-- TABLA: institution_academic_settings (Reglas de negocio por Colegio)
create table if not exists public.institution_academic_settings (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null unique references public.institutions(id) on delete cascade,
  grading_scale_type text not null default 'numeric_1_5' check (grading_scale_type in ('numeric_1_5', 'numeric_1_10', 'numeric_1_100', 'gpa', 'letters')),
  min_passing_grade numeric(4, 2) not null default 3.00,
  min_attendance_percentage numeric(5, 2) not null default 80.00 check (min_attendance_percentage >= 0.00 and min_attendance_percentage <= 100.00),
  decimal_places integer not null default 2 check (decimal_places >= 0 and decimal_places <= 4),
  average_calculation_type text not null default 'weighted_periods' check (average_calculation_type in ('simple', 'weighted_periods', 'weighted_categories')),
  allow_recovery boolean not null default true,
  recovery_max_grade numeric(4, 2) not null default 3.00,
  country text not null default 'Colombia',
  calendar_type text not null default 'calendar_a' check (calendar_type in ('calendar_a', 'calendar_b', 'custom')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: academic_years (Años Lectivos)
create table if not exists public.academic_years (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  year integer not null,
  is_active boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Evitar años escolares duplicados en la misma institución
  unique (institution_id, year)
);

-- TABLA: academic_periods (Periodos Académicos)
create table if not exists public.academic_periods (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  name text not null, -- ej. 'Primer Periodo', 'Semestre I'
  code text not null, -- ej. 'P1', 'S1'
  start_date date not null,
  end_date date not null,
  weight numeric(5, 2) not null check (weight >= 0.00 and weight <= 100.00), -- Porcentaje (ej. 30.00)
  status text not null default 'active' check (status in ('active', 'inactive', 'closed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Validar fechas coherentes
  check (start_date < end_date),
  -- Códigos de periodos únicos dentro del mismo año escolar
  unique (academic_year_id, code)
);

-- TABLA: courses (Cursos enlazados al año académico dinámico)
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  grade_level text not null, -- ej. '10'
  group_name text not null,  -- ej. 'A'
  description text not null, -- ej. 'Grado Décimo A'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Evitar cursos duplicados en el mismo año escolar
  unique (academic_year_id, grade_level, group_name)
);

-- TABLA: students (Perfiles de estudiantes)
create table if not exists public.students (
  id uuid primary key references public.profiles(id) on delete cascade,
  enrollment_number text not null unique,
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended', 'graduated')),
  date_of_birth date,
  medical_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: student_enrollments (Matrículas por curso/periodo)
create table if not exists public.student_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Una matrícula única activa por estudiante en el curso
  unique (student_id, course_id)
);

-- TABLA: academic_records (Calificaciones enlazadas a periodos dinámicos)
create table if not exists public.academic_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  academic_period_id uuid not null references public.academic_periods(id) on delete cascade,
  subject text not null, -- ej. 'Matemáticas', 'Inglés', 'Física'
  grade numeric(4, 2) not null check (grade >= 0.00 and grade <= 100.00), -- Rango amplio para soportar escalas
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  remarks text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: attendance_records (Asistencias de estudiantes vinculadas a periodos)
create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  academic_period_id uuid not null references public.academic_periods(id) on delete cascade,
  record_date date not null,
  status text not null check (status in ('present', 'absent', 'tardy', 'excused')),
  recorded_by uuid not null references public.profiles(id) on delete cascade,
  qr_scanned boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Asistencia única diaria por estudiante
  unique (student_id, record_date)
);

-- TABLA: behavioral_logs (Observador del Estudiante)
create table if not exists public.behavioral_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  observation_type text not null check (observation_type in ('positive', 'neutral', 'mild_negative', 'severe_negative')),
  description text not null,
  commitments text,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: early_alerts (Alertas Tempranas asociadas a periodos)
create table if not exists public.early_alerts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  academic_period_id uuid references public.academic_periods(id) on delete set null,
  category text not null check (category in ('academic', 'attendance', 'behavioral', 'health', 'psychosocial')),
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  description text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -----------------------------------------------------------------
-- 2. ÍNDICES DE OPTIMIZACIÓN (Escalabilidad Enterprise)
-- -----------------------------------------------------------------
create index if not exists idx_academic_periods_year on public.academic_periods(academic_year_id);
create index if not exists idx_courses_year on public.courses(academic_year_id);
create index if not exists idx_student_enrollments_student on public.student_enrollments(student_id);
create index if not exists idx_student_enrollments_course on public.student_enrollments(course_id);
create index if not exists idx_academic_records_student_period on public.academic_records(student_id, academic_period_id);
create index if not exists idx_attendance_records_student_period on public.attendance_records(student_id, academic_period_id);
create index if not exists idx_behavioral_logs_student_date on public.behavioral_logs(student_id, created_at desc);
create index if not exists idx_early_alerts_student_status on public.early_alerts(student_id, status);

-- -----------------------------------------------------------------
-- 3. HABILITACIÓN DE RLS Y POLÍTICAS DE SEGURIDAD
-- -----------------------------------------------------------------
alter table public.institution_academic_settings enable row level security;
alter table public.academic_years enable row level security;
alter table public.academic_periods enable row level security;
alter table public.courses enable row level security;
alter table public.students enable row level security;
alter table public.student_enrollments enable row level security;
alter table public.academic_records enable row level security;
alter table public.attendance_records enable row level security;
alter table public.behavioral_logs enable row level security;
alter table public.early_alerts enable row level security;

-- Políticas para settings, years y periods (Lectura autenticados, Escritura Rector/Admin)
create policy "Lectura general de configuraciones a autenticados"
  on public.institution_academic_settings for select to authenticated using (true);
create policy "Escritura de configuraciones exclusiva para Rector/Admin"
  on public.institution_academic_settings for all to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'rector'));

create policy "Lectura de años lectivos a autenticados"
  on public.academic_years for select to authenticated using (true);
create policy "Escritura de años lectivos exclusiva a Rector/Admin"
  on public.academic_years for all to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'rector'));

create policy "Lectura de periodos a autenticados"
  on public.academic_periods for select to authenticated using (true);
create policy "Escritura de periodos exclusiva a Rector/Admin"
  on public.academic_periods for all to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'rector'));

-- Políticas para courses, students y enrollments
create policy "Lectura general de cursos a autenticados"
  on public.courses for select to authenticated using (true);
create policy "Lectura general de estudiantes a autenticados"
  on public.students for select to authenticated using (true);
create policy "Lectura general de matrículas a autenticados"
  on public.student_enrollments for select to authenticated using (true);

-- Políticas de escritura académica restringida a roles de sistema
create policy "Escritura de cursos reservada al sistema"
  on public.courses for all to service_role using (true);
create policy "Escritura de estudiantes reservada al sistema"
  on public.students for all to service_role using (true);
create policy "Escritura de matrículas reservada al sistema"
  on public.student_enrollments for all to service_role using (true);

-- Políticas para academic_records, attendance_records, behavioral_logs y early_alerts (Lectura general, Escritura Docentes/Rectores)
create policy "Lectura de notas generales a autenticados"
  on public.academic_records for select to authenticated using (true);
create policy "Gestión de notas a Rectores y Docentes"
  on public.academic_records for all to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'docente', 'director_grupo')));

create policy "Lectura de asistencia general a autenticados"
  on public.attendance_records for select to authenticated using (true);
create policy "Gestión de asistencia a Rectores y Docentes"
  on public.attendance_records for all to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'docente', 'director_grupo')));

create policy "Lectura de observador general a autenticados"
  on public.behavioral_logs for select to authenticated using (true);
create policy "Gestión de observador a Rectores y Docentes"
  on public.behavioral_logs for all to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'docente', 'director_grupo')));

create policy "Lectura de alertas a autenticados"
  on public.early_alerts for select to authenticated using (true);
create policy "Gestión de alertas a Rectores y Directores"
  on public.early_alerts for all to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'director_grupo')));

-- -----------------------------------------------------------------
-- 4. SEMILLA DE DATOS CONFIGURADOS EN CALENDARIO DINÁMICO
-- -----------------------------------------------------------------

-- A. Configuración Académica de AulaCore Central
insert into public.institution_academic_settings (
  id, institution_id, grading_scale_type, min_passing_grade,
  min_attendance_percentage, decimal_places, average_calculation_type,
  allow_recovery, recovery_max_grade, country, calendar_type
) values (
  'adacadac-acad-1111-2222-333333333333',
  '11111111-1111-1111-1111-111111111111', -- Colegio AulaCore Central
  'numeric_1_5', -- Escala 1.0 a 5.0 (Estándar Colombia)
  3.00,          -- Nota aprobatoria mínima
  80.00,         -- Requiere 80% mínimo de asistencia
  2,             -- 2 decimales para precisión
  'weighted_periods', -- Promedio ponderado por pesos de periodo
  true,          -- Habilita exámenes de recuperación
  3.00,          -- Nota máxima asignable en examen recuperatorio
  'Colombia',
  'calendar_a'
) on conflict (institution_id) do nothing;

-- B. Año Lectivo 2026
insert into public.academic_years (id, institution_id, year, is_active)
values (
  '11112026-1111-1111-2222-333333333333',
  '11111111-1111-1111-1111-111111111111',
  2026,
  true
) on conflict (institution_id, year) do nothing;

-- C. Periodos Académicos Dinámicos (Colombia: 3 Periodos con pesos 30%, 30%, 40%)
insert into public.academic_periods (id, academic_year_id, name, code, start_date, end_date, weight, status)
values 
  -- Periodo 1: Ya finalizado y cerrado
  ('11111111-1111-1111-2222-333333333333', '11112026-1111-1111-2222-333333333333', 'Primer Periodo', 'P1', '2026-01-15', '2026-04-15', 30.00, 'closed'),
  -- Periodo 2: Periodo en curso actualmente (Nuestras pruebas vigentes)
  ('22222222-2222-2222-2222-333333333333', '11112026-1111-1111-2222-333333333333', 'Segundo Periodo', 'P2', '2026-04-16', '2026-08-15', 30.00, 'active'),
  -- Periodo 3: Periodo futuro programado
  ('33333333-3333-3333-2222-333333333333', '11112026-1111-1111-2222-333333333333', 'Tercer Periodo', 'P3', '2026-08-16', '2026-11-25', 40.00, 'inactive')
on conflict (academic_year_id, code) do nothing;

-- D. Crear Curso Demo: Grado Décimo A (Vinculado a Año 2026)
insert into public.courses (id, institution_id, academic_year_id, grade_level, group_name, description)
values (
  'cccccccc-10aa-1111-2222-333333333333',
  '11111111-1111-1111-1111-111111111111',
  '11112026-1111-1111-2222-333333333333',
  '10',
  'A',
  'Grado Décimo A'
) on conflict (academic_year_id, grade_level, group_name) do nothing;

-- E. Asegurar Cuentas de los 3 Estudiantes Demo en auth.users (Contraseña: AulaCore2026!)
-- Sincronizados por el trigger a public.profiles

-- Estudiante 1: Alejandro Ortiz
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '77777777-7777-7777-7777-777777777777',
  'authenticated', 'authenticated',
  'estudiante1@aulacore.com',
  crypt('AulaCore2026!', gen_salt('bf', 10)),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Alejandro","last_name":"Ortiz","avatar_url":""}',
  now(), now(), '', '', '', ''
) on conflict (id) do nothing;

-- Estudiante 2: Sofía Ramírez
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '88888888-8888-8888-8888-888888888888',
  'authenticated', 'authenticated',
  'estudiante2@aulacore.com',
  crypt('AulaCore2026!', gen_salt('bf', 10)),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Sofía","last_name":"Ramírez","avatar_url":""}',
  now(), now(), '', '', '', ''
) on conflict (id) do nothing;

-- Estudiante 3: Mateo Gómez
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '99999999-9999-9999-9999-999999999999',
  'authenticated', 'authenticated',
  'estudiante3@aulacore.com',
  crypt('AulaCore2026!', gen_salt('bf', 10)),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Mateo","last_name":"Gómez","avatar_url":""}',
  now(), now(), '', '', '', ''
) on conflict (id) do nothing;

-- F. Asignar Roles de Estudiante en public.user_roles
insert into public.user_roles (user_id, institution_id, role)
values 
  ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'estudiante'),
  ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'estudiante'),
  ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 'estudiante')
on conflict (user_id, institution_id, role) do nothing;

-- G. Registrar Detalle de Ficha Técnica
insert into public.students (id, enrollment_number, status, date_of_birth, medical_notes)
values 
  ('77777777-7777-7777-7777-777777777777', 'MAT-2026-001', 'active', '2011-04-12', 'Alergia leve a la penicilina'),
  ('88888888-8888-8888-8888-888888888888', 'MAT-2026-002', 'active', '2011-08-25', NULL),
  ('99999999-9999-9999-9999-999999999999', 'MAT-2026-003', 'active', '2010-11-02', 'Usa gafas correctoras de miopía')
on conflict (id) do nothing;

-- H. Inscribir Estudiantes en Grado 10-A
insert into public.student_enrollments (student_id, course_id)
values 
  ('77777777-7777-7777-7777-777777777777', 'cccccccc-10aa-1111-2222-333333333333'),
  ('88888888-8888-8888-8888-888888888888', 'cccccccc-10aa-1111-2222-333333333333'),
  ('99999999-9999-9999-9999-999999999999', 'cccccccc-10aa-1111-2222-333333333333')
on conflict (student_id, course_id) do nothing;

-- I. Registrar Calificaciones (academic_records) Vinculadas a Periodos Dinámicos
-- Docente: Profesor Gómez ('44444444-4444-4444-4444-444444444444')

-- Estudiante 1: Alejandro Ortiz (Sobresaliente)
-- NOTAS PERIODO 1 (P1 - Cerrado)
insert into public.academic_records (student_id, academic_period_id, subject, grade, teacher_id, remarks) values
  ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-2222-333333333333', 'Matemáticas', 4.20, '44444444-4444-4444-4444-444444444444', 'Buen desempeño global.'),
  ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-2222-333333333333', 'Inglés', 4.60, '44444444-4444-4444-4444-444444444444', 'Fluidez oral destacable.')
on conflict do nothing;
-- NOTAS PERIODO 2 (P2 - Activo)
insert into public.academic_records (student_id, academic_period_id, subject, grade, teacher_id, remarks) values
  ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-333333333333', 'Matemáticas', 4.50, '44444444-4444-4444-4444-444444444444', 'Excelente progreso conceptual.'),
  ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-333333333333', 'Inglés', 4.80, '44444444-4444-4444-4444-444444444444', 'Redacción avanzada en ensayos.'),
  ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-333333333333', 'Ciencias Naturales', 4.30, '44444444-4444-4444-4444-444444444444', 'Sólido compromiso en el laboratorio.')
on conflict do nothing;

-- Estudiante 2: Sofía Ramírez (Promedio)
-- NOTAS PERIODO 1 (P1 - Cerrado)
insert into public.academic_records (student_id, academic_period_id, subject, grade, teacher_id, remarks) values
  ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-2222-333333333333', 'Matemáticas', 3.50, '44444444-4444-4444-4444-444444444444', 'Cumple de manera justa.'),
  ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-2222-333333333333', 'Inglés', 3.90, '44444444-4444-4444-4444-444444444444', 'Esfuerzo constante.')
on conflict do nothing;
-- NOTAS PERIODO 2 (P2 - Activo)
insert into public.academic_records (student_id, academic_period_id, subject, grade, teacher_id, remarks) values
  ('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-333333333333', 'Matemáticas', 3.80, '44444444-4444-4444-4444-444444444444', 'Requiere concentrarse más en exámenes directos.'),
  ('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-333333333333', 'Inglés', 4.00, '44444444-4444-4444-4444-444444444444', 'Correcta asimilación del material.'),
  ('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-333333333333', 'Ciencias Naturales', 3.50, '44444444-4444-4444-4444-444444444444', 'Suele distraerse en dinámicas grupales.')
on conflict do nothing;

-- Estudiante 3: Mateo Gómez (Riesgo Académico)
-- NOTAS PERIODO 1 (P1 - Cerrado)
insert into public.academic_records (student_id, academic_period_id, subject, grade, teacher_id, remarks) values
  ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-2222-333333333333', 'Matemáticas', 3.10, '44444444-4444-4444-4444-444444444444', 'Aprobación al límite, requiere refuerzo.'),
  ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-2222-333333333333', 'Inglés', 3.00, '44444444-4444-4444-4444-444444444444', 'Presenta vacíos de gramática básica.')
on conflict do nothing;
-- NOTAS PERIODO 2 (P2 - Activo)
insert into public.academic_records (student_id, academic_period_id, subject, grade, teacher_id, remarks) values
  ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-333333333333', 'Matemáticas', 2.80, '44444444-4444-4444-4444-444444444444', 'Reprobó examen parcial por falta de estudio.'),
  ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-333333333333', 'Inglés', 3.20, '44444444-4444-4444-4444-444444444444', 'Mínimo esfuerzo. No entrega tareas a tiempo.'),
  ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-333333333333', 'Ciencias Naturales', 2.90, '44444444-4444-4444-4444-444444444444', 'No presentó el informe del proyecto final.')
on conflict do nothing;

-- J. Registrar Asistencias Históricas en el Periodo 2 (Mayo 2026 - Activo)

-- Alejandro Ortiz (100% de asistencia)
insert into public.attendance_records (student_id, academic_period_id, record_date, status, recorded_by, qr_scanned) values
  ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-333333333333', '2026-05-18', 'present', '44444444-4444-4444-4444-444444444444', true),
  ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-333333333333', '2026-05-19', 'present', '44444444-4444-4444-4444-444444444444', true),
  ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-333333333333', '2026-05-20', 'present', '44444444-4444-4444-4444-444444444444', true),
  ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-333333333333', '2026-05-21', 'present', '44444444-4444-4444-4444-444444444444', true),
  ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-333333333333', '2026-05-22', 'present', '44444444-4444-4444-4444-444444444444', true)
on conflict do nothing;

-- Sofía Ramírez (Inasistencia Crítica de 60%)
insert into public.attendance_records (student_id, academic_period_id, record_date, status, recorded_by, qr_scanned) values
  ('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-333333333333', '2026-05-18', 'absent', '44444444-4444-4444-4444-444444444444', false),
  ('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-333333333333', '2026-05-19', 'present', '44444444-4444-4444-4444-444444444444', true),
  ('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-333333333333', '2026-05-20', 'absent', '44444444-4444-4444-4444-444444444444', false),
  ('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-333333333333', '2026-05-21', 'present', '44444444-4444-4444-4444-444444444444', true),
  ('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-333333333333', '2026-05-22', 'absent', '44444444-4444-4444-4444-444444444444', false)
on conflict do nothing;

-- Mateo Gómez (Asistencia Regular con Tardes)
insert into public.attendance_records (student_id, academic_period_id, record_date, status, recorded_by, qr_scanned) values
  ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-333333333333', '2026-05-18', 'present', '44444444-4444-4444-4444-444444444444', true),
  ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-333333333333', '2026-05-19', 'tardy', '44444444-4444-4444-4444-444444444444', false),
  ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-333333333333', '2026-05-20', 'present', '44444444-4444-4444-4444-444444444444', true),
  ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-333333333333', '2026-05-21', 'tardy', '44444444-4444-4444-4444-444444444444', false),
  ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-333333333333', '2026-05-22', 'present', '44444444-4444-4444-4444-444444444444', true)
on conflict do nothing;

-- K. Registrar Observaciones Convivenciales en el Observador

-- Alejandro Ortiz (Mérito Positivo)
insert into public.behavioral_logs (student_id, observation_type, description, commitments, teacher_id)
values (
  '77777777-7777-7777-7777-777777777777',
  'positive',
  'Destacado liderazgo y proactividad guiando el equipo escolar en la Olimpiada Regional de Matemáticas y Robótica.',
  'Continuar asumiendo roles de monitor estudiantil en asignaturas STEM.',
  '44444444-4444-4444-4444-444444444444'
) on conflict do nothing;

-- Mateo Gómez (Anotación Negativa Leve)
insert into public.behavioral_logs (student_id, observation_type, description, commitments, teacher_id)
values (
  '99999999-9999-9999-9999-999999999999',
  'mild_negative',
  'Uso reiterado y no autorizado de distractores tecnológicos (teléfono inteligente) durante las clases explicativas de física.',
  'Estudiante se compromete a almacenar el celular apagado en el casillero institucional. Citación a acudiente si reincide.',
  '44444444-4444-4444-4444-444444444444'
) on conflict do nothing;

-- L. Registrar Alertas Tempranas Dinámicas (asociadas a Periodo 2 - Activo)

-- 1. Alerta de Inasistencia de Sofía Ramírez
insert into public.early_alerts (student_id, academic_period_id, category, risk_level, description, status)
values (
  '88888888-8888-8888-8888-888888888888',
  '22222222-2222-2222-2222-333333333333',
  'attendance',
  'high',
  'Registra una tasa de inasistencia acumulada del 60% en el Periodo 2 en curso. No se han recibido justificantes válidos por parte del acudiente.',
  'open'
) on conflict do nothing;

-- 2. Alerta Académica de Mateo Gómez
insert into public.early_alerts (student_id, academic_period_id, category, risk_level, description, status)
values (
  '99999999-9999-9999-9999-999999999999',
  '22222222-2222-2222-2222-333333333333',
  'academic',
  'medium',
  'Calificaciones del Periodo 2 por debajo del estándar mínimo de aprobación (3.00) en Matemáticas (2.80) e Informe de Ciencias (2.90).',
  'in_progress'
) on conflict do nothing;
