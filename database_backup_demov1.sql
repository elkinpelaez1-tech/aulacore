-- =================================================================
-- AulaCore - FULL BACKUP (AulaCore Demo v1)
-- Generated: 2026-06-25T15:46:30.449Z
-- =================================================================


-- -----------------------------------------------------------------
-- 1. SCHEMA DEFINITIONS (Concatenated from source files)
-- -----------------------------------------------------------------

-- FILE: database.sql
-- =================================================================
-- AulaCore - Supabase Database Schema & Seed Script (Enterprise SaaS)
-- =================================================================

-- Habilitar extensión pgcrypto para manejo seguro de encriptación bcrypt
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------
-- 1. CREACIÓN DE TABLAS
-- -----------------------------------------------------------------

-- TABLA: institutions (Colegios / Tenants)
create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: profiles (Perfiles de usuario)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: user_roles (Mapeo de roles de usuario por institución)
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete cascade,
  role text not null check (role in ('rector', 'director_grupo', 'docente', 'secretaria', 'padre_familia', 'estudiante')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Evitar que un usuario tenga el mismo rol duplicado en la misma institución
  unique (user_id, institution_id, role)
);

-- -----------------------------------------------------------------
-- 2. POLÍTICAS DE SEGURIDAD (Row Level Security - RLS)
-- -----------------------------------------------------------------

alter table public.institutions enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

-- Políticas para institutions
create policy "Permitir lectura de instituciones a usuarios autenticados"
  on public.institutions for select
  to authenticated
  using (true);

create policy "Restringir escritura de instituciones a administradores globales"
  on public.institutions for all
  to service_role
  using (true);

-- Políticas para profiles
create policy "Permitir lectura de perfiles a usuarios autenticados"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Permitir a usuarios actualizar su propio perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Políticas para user_roles
create policy "Permitir a usuarios ver sus propios roles asignados"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Restringir modificación de roles a servicio administrativo"
  on public.user_roles for all
  to service_role
  using (true);

-- -----------------------------------------------------------------
-- 3. TRIGGERS AUTOMÁTICOS (Sincronización auth.users -> profiles)
-- -----------------------------------------------------------------

-- Función de trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', 'Usuario'),
    coalesce(new.raw_user_meta_data->>'last_name', 'AulaCore'),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do update
  set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    avatar_url = excluded.avatar_url;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------
-- 4. SEMILLA DE DATOS (Seed Data)
-- -----------------------------------------------------------------

-- A. Insertar Institución Demo
insert into public.institutions (id, name, slug, logo_url)
values (
  '11111111-1111-1111-1111-111111111111',
  'Colegio AulaCore Central',
  'aulacore-central',
  '/logo-aulacore.png'
) on conflict (id) do update 
set name = excluded.name, slug = excluded.slug, logo_url = excluded.logo_url;

-- B. Insertar Usuarios de Prueba en auth.users (Contraseña para todos: AulaCore2026!)
-- Nota: La contraseña está cifrada de forma segura con la función bcrypt en Postgres (salt rounds 10)

-- 1. Rector (rector@aulacore.com)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated',
  'rector@aulacore.com',
  crypt('AulaCore2026!', gen_salt('bf', 10)),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Ramón","last_name":"Ramírez","avatar_url":""}',
  now(), now(), '', '', '', ''
) on conflict (id) do nothing;

-- 2. Director de Grupo (director@aulacore.com)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-3333-3333-333333333333',
  'authenticated', 'authenticated',
  'director@aulacore.com',
  crypt('AulaCore2026!', gen_salt('bf', 10)),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Patricia","last_name":"Martínez","avatar_url":""}',
  now(), now(), '', '', '', ''
) on conflict (id) do nothing;

-- 3. Docente (docente@aulacore.com)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '44444444-4444-4444-4444-444444444444',
  'authenticated', 'authenticated',
  'docente@aulacore.com',
  crypt('AulaCore2026!', gen_salt('bf', 10)),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Profesor","last_name":"Gómez","avatar_url":""}',
  now(), now(), '', '', '', ''
) on conflict (id) do nothing;

-- 4. Secretaría (secretaria@aulacore.com)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '55555555-5555-5555-5555-555555555555',
  'authenticated', 'authenticated',
  'secretaria@aulacore.com',
  crypt('AulaCore2026!', gen_salt('bf', 10)),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Elena","last_name":"Toro","avatar_url":""}',
  now(), now(), '', '', '', ''
) on conflict (id) do nothing;

-- 5. Padre de Familia (padre@aulacore.com)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '66666666-6666-6666-6666-666666666666',
  'authenticated', 'authenticated',
  'padre@aulacore.com',
  crypt('AulaCore2026!', gen_salt('bf', 10)),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Carlos","last_name":"Ortiz","avatar_url":""}',
  now(), now(), '', '', '', ''
) on conflict (id) do nothing;

-- C. Insertar Mapeo de Roles en public.user_roles
-- Nota: La inserción de perfiles de los usuarios anteriores se ejecutó automáticamente
-- gracias al trigger 'on_auth_user_created' conectado a 'auth.users'.

insert into public.user_roles (user_id, institution_id, role)
values 
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'rector'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'director_grupo'),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'docente'),
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'secretaria'),
  ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'padre_familia')
on conflict (user_id, institution_id, role) do nothing;


-- FILE: database_student_360.sql
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


-- FILE: db_migration.sql
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


-- FILE: 02_create_documents_vault.sql
-- =================================================================
-- AulaCore - Phase V: DocumentEngine Vault & Criptográfico Schema
-- =================================================================

-- -----------------------------------------------------------------
-- 1. CREACIÓN DE NUEVAS TABLAS DE GENERACIÓN Y AUDITORÍA
-- -----------------------------------------------------------------

-- TABLA: institution_document_templates (Plantillas por Colegio)
create table if not exists public.institution_document_templates (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  template_type text not null check (template_type in ('academic', 'disciplinary', 'administrative', 'psychosocial', 'rectoral')),
  header_logo_url text,
  footer_text text,
  rector_signature_url text,
  secretary_signature_url text,
  watermark_url text,
  primary_color text not null default '#1e293b',
  secondary_color text not null default '#4f46e5',
  legal_text text,
  qr_position text not null default 'bottom_left' check (qr_position in ('bottom_left', 'bottom_right', 'top_right')),
  page_format text not null default 'letter' check (page_format in ('letter', 'a4')),
  margins jsonb not null default '{"top": 15, "bottom": 15, "left": 15, "right": 15}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: institution_documents (Snapshots e Integridad Criptográfica)
create table if not exists public.institution_documents (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  template_id uuid references public.institution_document_templates(id) on delete set null,
  document_type text not null check (document_type in (
    'academic_report', 'annual_consolidated', 'student_observador', 'early_alerts', 'citations',
    'disciplinary_acta', 'academic_compromise', 'attendance_report', 'psychosocial_followup',
    'communication_history', 'academic_certificate', 'rectoral_report'
  )),
  generated_by uuid references public.profiles(id) on delete set null,
  student_id uuid references public.students(id) on delete cascade,
  verification_code text not null unique,
  digital_signature_hash text not null,
  document_metadata jsonb not null, -- Snapshot inmutable de las calificaciones o actas al emitirse
  pdf_url text,
  email_sent boolean not null default false,
  printed boolean not null default false,
  status text not null default 'generated' check (status in ('generated', 'signed', 'emailed', 'printed', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: institution_document_audit (Trazabilidad estricta)
create table if not exists public.institution_document_audit (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.institution_documents(id) on delete cascade,
  action_type text not null check (action_type in ('generated', 'viewed', 'downloaded', 'printed', 'emailed', 'signed')),
  performed_by uuid references public.profiles(id) on delete set null,
  client_ip text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -----------------------------------------------------------------
-- 2. ÍNDICES DE DESEMPEÑO
-- -----------------------------------------------------------------
create index if not exists idx_doc_templates_inst on public.institution_document_templates(institution_id, template_type);
create index if not exists idx_docs_verification on public.institution_documents(verification_code);
create index if not exists idx_docs_student on public.institution_documents(student_id);
create index if not exists idx_doc_audit_doc on public.institution_document_audit(document_id);

-- -----------------------------------------------------------------
-- 3. HABILITACIÓN DE RLS Y POLÍTICAS DE ACCESO
-- -----------------------------------------------------------------
alter table public.institution_document_templates enable row level security;
alter table public.institution_documents enable row level security;
alter table public.institution_document_audit enable row level security;

-- Políticas para plantillas
create policy "Lectura de plantillas a autenticados"
  on public.institution_document_templates for select to authenticated using (true);

create policy "Gestión de plantillas reservada a Rectores"
  on public.institution_document_templates for all to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'rector'));

-- Políticas para documentos (La validación pública debe poder leer de forma anónima)
create policy "Lectura pública anónima por código de verificación"
  on public.institution_documents for select to anon, authenticated
  using (true);

create policy "Creación de documentos a Rectores, Directores y Docentes"
  on public.institution_documents for insert to authenticated
  with check (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'director_grupo', 'docente', 'secretaria')));

create policy "Actualización de estado a Rectores, Directores, Padres y Docentes"
  on public.institution_documents for update to authenticated
  using (true) with check (true);

-- Políticas para logs de auditoría
create policy "Lectura de auditoría a personal autorizado"
  on public.institution_document_audit for select to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'director_grupo')));

create policy "Inserción de auditoría libre para logs de interacción"
  on public.institution_document_audit for insert to authenticated, anon
  with check (true);

-- -----------------------------------------------------------------
-- 4. SEMILLA DE DATOS (Seed Data)
-- -----------------------------------------------------------------

-- A. Plantilla Académica Oficial
insert into public.institution_document_templates (
  id, institution_id, template_type, header_logo_url, footer_text,
  rector_signature_url, secretary_signature_url, watermark_url,
  primary_color, secondary_color, legal_text, qr_position, page_format
) values (
  '99999999-9999-9999-aaaa-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'academic',
  '/logo-aulacore.png',
  'Colegio AulaCore Central - Licencia Oficial del Ministerio de Educación Resolución 4028. Bogotá, D.C.',
  '/signature-rector.png',
  '/signature-secretary.png',
  '/watermark-logo.png',
  '#0f172a',
  '#4338ca',
  'El suscrito Rector y Secretaria Académica certifican que los datos consignados en este informe representan fielmente la trazabilidad del estudiante en el año académico respectivo.',
  'bottom_left',
  'letter'
) on conflict (id) do nothing;

-- B. Snapshot Inicial de Boletín Académico de Alejandro Ortiz
insert into public.institution_documents (
  id, institution_id, template_id, document_type, generated_by, student_id,
  verification_code, digital_signature_hash, status, document_metadata
) values (
  '99999999-9999-9999-bbbb-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '99999999-9999-9999-aaaa-111111111111',
  'academic_report',
  '33333333-3333-3333-3333-333333333333', -- Patricia Martínez (Directora)
  '77777777-7777-7777-7777-777777777777', -- Alejandro Ortiz (Estudiante)
  'AC-VERIFY-777A',
  '3a29f8c6d5e4b3a29f8c6d5e4b3a29f8c6d5e4b3a29f8c6d5e4b3a29f8c6d5e4',
  'signed',
  '{
    "studentName": "Alejandro Ortiz",
    "courseName": "Grado Décimo A (10-A)",
    "academicYear": 2026,
    "generalGpa": 9.4,
    "attendanceRate": 98.2,
    "grades": [
      {"subject": "Matemáticas", "exams": [9.0, 9.5], "homeworks": [9.2, 9.8], "participation": [10.0], "finalGrade": 9.4},
      {"subject": "Ciencias Naturales", "exams": [8.5, 9.0], "homeworks": [9.0, 9.2], "participation": [9.5], "finalGrade": 9.0},
      {"subject": "Inglés", "exams": [9.8, 10.0], "homeworks": [9.8, 9.8], "participation": [10.0], "finalGrade": 9.8}
    ]
  }'::jsonb
) on conflict (id) do nothing;

-- C. Snapshot Inicial de Compromiso Académico de Mateo Gómez
insert into public.institution_documents (
  id, institution_id, template_id, document_type, generated_by, student_id,
  verification_code, digital_signature_hash, status, document_metadata
) values (
  '99999999-9999-9999-cccc-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '99999999-9999-9999-aaaa-111111111111',
  'academic_compromise',
  '33333333-3333-3333-3333-333333333333', -- Patricia Martínez (Directora)
  '99999999-9999-9999-9999-999999999999', -- Mateo Gómez (Estudiante)
  'AC-VERIFY-999C',
  '7b8a9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
  'signed',
  '{
    "studentName": "Mateo Gómez",
    "courseName": "Grado Décimo A (10-A)",
    "academicYear": 2026,
    "remedialSubject": "Matemáticas & Ciencias Naturales",
    "academicGpa": 6.5,
    "failuresCount": 3,
    "compromises": [
      "Asistir diariamente a las monitorías académicas los días martes y jueves en jornada de la tarde.",
      "Entregar bitácora de repaso firmada por el acudiente (Sara Gómez) en cada clase de Ciencias Naturales/Álgebra.",
      "Desarrollar el taller remedial práctico asignado por el Prof. Gómez con fecha límite del 12 de junio."
    ],
    "parentName": "Sara Gómez"
  }'::jsonb
) on conflict (id) do nothing;

-- D. Snapshot de Citación a Consejo Académico de Sofía Ramírez
insert into public.institution_documents (
  id, institution_id, template_id, document_type, generated_by, student_id,
  verification_code, digital_signature_hash, status, document_metadata
) values (
  '99999999-9999-9999-dddd-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '99999999-9999-9999-aaaa-111111111111',
  'citations',
  '33333333-3333-3333-3333-333333333333', -- Patricia Martínez
  '88888888-8888-8888-8888-888888888888', -- Sofía Ramírez
  'AC-VERIFY-888B',
  'fc3d2a1b9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b',
  'signed',
  '{
    "studentName": "Sofía Ramírez",
    "courseName": "Grado Décimo A (10-A)",
    "citationType": "Comité Convivencial Disciplinario",
    "dateTime": "Bogotá D.C., 28 de Mayo de 2026, 09:30 AM",
    "location": "Sala de Juntas de Rectoría / Rector Ramón Ramírez",
    "reason": "Revisión conjunta de inasistencias RFID injustificadas acumuladas (Asistencia: 72.5%) y establecimiento del compromiso disciplinario."
  }'::jsonb
) on conflict (id) do nothing;

-- E. Logs iniciales de auditoría
insert into public.institution_document_audit (document_id, action_type, performed_by, client_ip, user_agent)
values 
  ('99999999-9999-9999-bbbb-111111111111', 'generated', '33333333-3333-3333-3333-333333333333', '192.168.1.50', 'Next.js Server Actions SSR'),
  ('99999999-9999-9999-bbbb-111111111111', 'signed', '33333333-3333-3333-3333-333333333333', '192.168.1.50', 'Next.js Crypto Signatures'),
  ('99999999-9999-9999-cccc-111111111111', 'generated', '33333333-3333-3333-3333-333333333333', '192.168.1.50', 'Next.js Server Actions SSR'),
  ('99999999-9999-9999-cccc-111111111111', 'signed', '22222222-2222-2222-2222-222222222222', '192.168.1.10', 'Rector Digital Stamp PKI');


-- FILE: 03_curriculum_engine.sql
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


-- FILE: 04_student_engine.sql
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
  critical_subjects TEXT[], -- ej: ['Tecnología e Informática', 'Matemáticas']
  
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


-- FILE: 05_pei_engine.sql
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


-- FILE: 06_school_government_adv.sql
-- =================================================================
-- AulaCore - Phase VI: Gobierno Escolar Avanzado (Convocatorias, Reuniones y Actas)
-- =================================================================

-- 1. MODIFICACIÓN DE LA TABLA DE INTEGRANTES EXISTENTE
alter table public.pei_school_government 
  add column if not exists document_number varchar(100),
  add column if not exists email varchar(255),
  add column if not exists phone varchar(100);

-- Actualizar integrantes existentes con datos ficticios para evitar nulos en demostraciones
update public.pei_school_government set document_number = '1010202030', email = 'ramon.ramirez@aulacore.edu.co', phone = '+573001234567' where member_name = 'Dr. Ramón Ramírez';
update public.pei_school_government set document_number = '52190180', email = 'diana.reyes@aulacore.edu.co', phone = '+573123456789' where member_name = 'Dra. Diana Carolina Reyes';
update public.pei_school_government set document_number = '79820300', email = 'carlos.martinez@aulacore.edu.co', phone = '+573104567890' where member_name = 'Lic. Carlos Martínez';
update public.pei_school_government set document_number = '1000123456', email = 'mateo.gomez@aulacore.edu.co', phone = '+573157890123' where member_name = 'Mateo Gómez';
update public.pei_school_government set document_number = '1000987654', email = 'alejandro.ortiz@aulacore.edu.co', phone = '+573204561234' where member_name = 'Alejandro Ortiz';
update public.pei_school_government set document_number = '1000543210', email = 'sofia.ramirez@aulacore.edu.co', phone = '+573183214321' where member_name = 'Sofía Ramírez';
update public.pei_school_government set document_number = '19820300', email = 'carlos.ortiz@parent.aulacore.com', phone = '+573111223344' where member_name = 'Carlos Ortiz';

-- Llenar cualquier otro integrante nulo
update public.pei_school_government set document_number = '12345678', email = 'integrante@aulacore.edu.co', phone = '+573000000000' where document_number is null;

-- 2. TABLA: pei_gov_convocatorias (Convocatorias oficiales)
create table if not exists public.pei_gov_convocatorias (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  title varchar(255) not null,
  body_type varchar(100) not null, -- Consejo Académico, Consejo Directivo, etc.
  meeting_date date not null,
  meeting_time time not null,
  location varchar(255) not null,
  description text,
  attachments text[], -- Documentos adjuntos (pdf, doc, xls, img)
  status varchar(50) default 'Planeada' not null, -- 'Planeada', 'Enviada', 'Realizada', 'Cancelada'
  recipients jsonb, -- Destinatarios de la notificación [{name, email, phone, status}]
  sent_at timestamp with time zone,
  calendar_event_id uuid, -- Enlace futuro a Calendario Institucional
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TABLA: pei_gov_meetings (Trazabilidad de Reuniones y Decisiones)
create table if not exists public.pei_gov_meetings (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  convocatoria_id uuid references public.pei_gov_convocatorias(id) on delete set null,
  title varchar(255) not null,
  body_type varchar(100) not null,
  meeting_date date not null,
  meeting_time time not null,
  location varchar(255) not null,
  description text,
  attendance jsonb, -- Control de asistencia [{member_id, name, role_title, attended}]
  status varchar(50) default 'Programada' not null, -- 'Programada', 'Realizada', 'Cancelada'
  decisions text, -- Decisiones claves
  evidences text[], -- Soporte de evidencias complementarias
  calendar_event_id uuid, -- Evento de calendario institucional
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TABLA: pei_gov_actas (Firmas y transcripción de Actas de Reunión)
create table if not exists public.pei_gov_actas (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  meeting_id uuid references public.pei_gov_meetings(id) on delete cascade,
  acta_number varchar(100) not null, -- Ej: Acta No. CD-001-2026
  content text,
  pdf_url text, -- Acta final formalizada
  evidences text[], -- Anexos en Excel/Word/Imágenes
  signers jsonb, -- Control de firmas [{name, role_title, signed, signed_at}]
  status varchar(50) default 'Borrador' not null, -- 'Borrador', 'Firmada', 'Publicada'
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. HABILITACIÓN DE RLS Y POLÍTICAS MULTITENANT
alter table public.pei_gov_convocatorias enable row level security;
alter table public.pei_gov_meetings enable row level security;
alter table public.pei_gov_actas enable row level security;

-- Políticas de Select para usuarios autenticados
create policy "Lectura de convocatorias por tenant"
  on public.pei_gov_convocatorias for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de reuniones por tenant"
  on public.pei_gov_meetings for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de actas por tenant"
  on public.pei_gov_actas for select to authenticated
  using (institution_id = public.active_institution_id());

-- Políticas de Modificación Completa para Rector, Coordinación y Secretaría
create policy "Gestión de convocatorias por directivos"
  on public.pei_gov_convocatorias for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador'))
  );

create policy "Gestión de reuniones por directivos"
  on public.pei_gov_meetings for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador'))
  );

create policy "Gestión de actas por directivos"
  on public.pei_gov_actas for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador'))
  );

-- 6. SEMILLA DE DATOS (Mocks de Trazabilidad)

-- Convocatoria Ficticia 1 (Realizada)
insert into public.pei_gov_convocatorias (
  id, institution_id, title, body_type, meeting_date, meeting_time, location, description, status, recipients, sent_at, created_at, updated_at
) values (
  '88888888-8888-8888-8888-f00111112222',
  '11111111-1111-1111-1111-111111111111',
  'Primera Sesión Ordinaria de Consejo Directivo',
  'Consejo Directivo',
  '2026-02-10',
  '08:00:00',
  'Sala de Juntas Rectoría',
  'Revisión y aprobación del presupuesto anual 2026 e informe de gestión del periodo anterior.',
  'Realizada',
  '[
    {"name": "Dr. Ramón Ramírez", "email": "ramon.ramirez@aulacore.edu.co", "phone": "+573001234567", "status": "Enviado"},
    {"name": "Dra. Diana Carolina Reyes", "email": "diana.reyes@aulacore.edu.co", "phone": "+573123456789", "status": "Enviado"}
  ]'::jsonb,
  now() - interval '4 months',
  now() - interval '4 months',
  now() - interval '4 months'
) on conflict (id) do nothing;

-- Convocatoria Ficticia 2 (Pendiente)
insert into public.pei_gov_convocatorias (
  id, institution_id, title, body_type, meeting_date, meeting_time, location, description, status, recipients, sent_at, created_at, updated_at
) values (
  '88888888-8888-8888-8888-f00211112222',
  '11111111-1111-1111-1111-111111111111',
  'Planeación Curricular Segundo Trimestre',
  'Consejo Académico',
  '2026-06-15',
  '14:00:00',
  'Biblioteca Principal',
  'Ajustes de mallas curriculares según la Ley 115 e integración del modelo Constructivista.',
  'Enviada',
  '[
    {"name": "Lic. Carlos Martínez", "email": "carlos.martinez@aulacore.edu.co", "phone": "+573104567890", "status": "Enviado"}
  ]'::jsonb,
  now(),
  now(),
  now()
) on conflict (id) do nothing;

-- Reunión Ficticia 1
insert into public.pei_gov_meetings (
  id, institution_id, convocatoria_id, title, body_type, meeting_date, meeting_time, location, description, status, decisions, attendance, evidences, created_at, updated_at
) values (
  '88888888-8888-8888-8888-f00311112222',
  '11111111-1111-1111-1111-111111111111',
  '88888888-8888-8888-8888-f00111112222',
  'Primera Sesión Ordinaria de Consejo Directivo',
  'Consejo Directivo',
  '2026-02-10',
  '08:00:00',
  'Sala de Juntas Rectoría',
  'Revisión y aprobación del presupuesto anual 2026 e informe de gestión del periodo anterior.',
  'Realizada',
  'Se aprueba por unanimidad el presupuesto institucional de 2026. Se acuerda iniciar cotización para renovación del Aula de Tecnología en Marzo.',
  '[
    {"member_id": "gov-1", "name": "Dr. Ramón Ramírez", "role_title": "Presidente", "attended": true},
    {"member_id": "gov-3", "name": "Dra. Diana Carolina Reyes", "role_title": "Representante de Docentes", "attended": true}
  ]'::jsonb,
  array['/evidencias/presupuesto_aprobado_2026.xlsx', '/evidencias/cotizacion_aulas.pdf'],
  now() - interval '4 months',
  now() - interval '4 months'
) on conflict (id) do nothing;

-- Acta Ficticia 1
insert into public.pei_gov_actas (
  id, institution_id, meeting_id, acta_number, content, pdf_url, status, signers, evidences, created_at, updated_at
) values (
  '88888888-8888-8888-8888-f00411112222',
  '11111111-1111-1111-1111-111111111111',
  '88888888-8888-8888-8888-f00311112222',
  'Acta No. CD-001-2026',
  'En la ciudad de Bogotá D.C., siendo las 08:00 AM del 10 de Febrero de 2026, se reunieron en la Sala de Juntas los integrantes del Consejo Directivo. El Rector Ramón Ramírez abrió la sesión explicando el orden del día. Se discutió el balance de gastos del año anterior y las metas financieras 2026. Tras someter a votación, se aprobó el rubro de infraestructura tecnológica.',
  '/actas/acta-cd-001-2026.pdf',
  'Firmada',
  '[
    {"name": "Dr. Ramón Ramírez", "role_title": "Presidente", "signed": true, "signed_at": "2026-02-10T11:00:00Z"},
    {"name": "Dra. Diana Carolina Reyes", "role_title": "Representante de Docentes", "signed": true, "signed_at": "2026-02-10T11:15:00Z"}
  ]'::jsonb,
  array['/evidencias/anexo_firmas.jpg'],
  now() - interval '4 months',
  now() - interval '4 months'
) on conflict (id) do nothing;


-- FILE: 07_pae_engine.sql
-- =================================================================
-- AulaCore - Phase VII: Programa de Alimentación Escolar (PAE) Schema
-- =================================================================

-- -----------------------------------------------------------------
-- 1. CREACIÓN DE TABLAS EXCLUSIVAS PARA PAE
-- -----------------------------------------------------------------

-- TABLA: pae_financial_resources (Recursos Financieros PAE)
create table if not exists public.pae_financial_resources (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  source_name varchar(255) not null, -- e.g. 'SGP', 'Regalías', 'Recursos Propios', 'Cofinanciación MEN'
  allocated_value numeric(15,2) not null default 0.00,
  allocation_date date not null,
  support_document varchar(255),
  pdf_url text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: pae_prioritization (Priorización de cupos por sedes y jornadas)
create table if not exists public.pae_prioritization (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  school_sede varchar(255) not null, -- e.g. 'Sede Principal', 'Sede Primaria'
  school_shift varchar(100) not null, -- e.g. 'Mañana', 'Tarde', 'Única'
  projected_beneficiaries integer not null default 0,
  assigned_slots integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: pae_infrastructure_diagnostic (Diagnósticos de comedores, cocinas y bodegas)
create table if not exists public.pae_infrastructure_diagnostic (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  school_sede varchar(255) not null,
  dining_room_status varchar(100) not null, -- 'Bueno', 'Regular', 'Malo', 'No cuenta'
  kitchen_status varchar(100) not null, -- 'Bueno', 'Regular', 'Malo'
  pantry_status varchar(100) not null, -- 'Bueno', 'Regular', 'Malo'
  utensils_status varchar(100) not null, -- 'Bueno', 'Regular', 'Malo'
  equipment_status varchar(100) not null, -- 'Bueno', 'Regular', 'Malo'
  observaciones text,
  photos text[], -- Fotos de evidencia
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: pae_operators (Operadores del Contrato PAE)
create table if not exists public.pae_operators (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  operator_name varchar(255) not null,
  nit varchar(50) not null,
  representative varchar(255),
  contract_number varchar(100) not null,
  start_date date not null,
  end_date date not null,
  policies text[], -- Pólizas constituidas
  pdf_url text,
  is_active boolean default true not null,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: pae_team (Equipo Técnico y Personal PAE)
create table if not exists public.pae_team (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  member_name varchar(255) not null,
  role_title varchar(255) not null, -- 'Nutricionista', 'Manipuladora de Alimentos', 'Coordinador PAE', 'Supervisor'
  document_number varchar(50),
  email varchar(255),
  phone varchar(50),
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: pae_menu_cycles (Ciclo de Menús y Minutas patrón)
create table if not exists public.pae_menu_cycles (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  week_number integer not null, -- e.g. 1, 2, 3, 4
  menu_details text not null, -- Descripción del menú
  minuta_pdf_url text,
  nutrition_analysis_url text,
  preparation_guides_url text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: pae_beneficiaries (Afiliación de estudiantes a PAE - Relaciona con students)
create table if not exists public.pae_beneficiaries (
  student_id uuid primary key references public.students(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete cascade,
  is_beneficiary boolean default true not null,
  entry_date date default current_date not null,
  exit_date date,
  modality varchar(100) not null, -- 'Ración Industrializada', 'Almuerzo Caliente Preparado en Sitio', 'Ración Transportada'
  prioritization_reason varchar(255), -- 'Ruralidad', 'Discapacidad', 'Víctima Conflicto', 'Jornada Única', 'Extrema Pobreza'
  classifications text[], -- array['Rural', 'Discapacidad', 'Comunidad étnica', 'Jornada única', 'Vulnerabilidad']
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: pae_daily_deliveries (Entregas de Raciones Diarias por Sede/Jornada)
create table if not exists public.pae_daily_deliveries (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  delivery_date date default current_date not null,
  school_sede varchar(255) not null,
  school_shift varchar(100) not null,
  ration_type varchar(100) not null, -- 'Industrializada', 'Preparada en Sitio'
  scheduled_rations integer not null default 0,
  delivered_rations integer not null default 0,
  missing_rations integer not null default 0,
  observaciones text,
  photos text[], -- Fotos de actas o raciones entregadas
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: pae_daily_attendance (Bitácora de consumo de alimentos diaria por estudiante)
create table if not exists public.pae_daily_attendance (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  delivery_id uuid references public.pae_daily_deliveries(id) on delete cascade,
  attendance_date date default current_date not null,
  consumed boolean default true not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (student_id, attendance_date)
);

-- TABLA: pae_controls (Controles higiénicos, gramajes y bodega)
create table if not exists public.pae_controls (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  control_type varchar(100) not null, -- 'Control Gramaje', 'Verificación Bodega', 'Lista Chequeo Comedor'
  control_date date default current_date not null,
  inspector_name varchar(255) not null,
  score_percentage numeric(5,2) not null, -- Porcentaje de cumplimiento
  findings text,
  action_plan text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: pae_local_purchases (Compras Locales a pequeños productores locales - Min 20% legal)
create table if not exists public.pae_local_purchases (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  supplier_name varchar(255) not null,
  municipality varchar(100) not null,
  product_name varchar(255) not null, -- e.g. 'Plátano', 'Yuca', 'Hortalizas'
  purchase_value numeric(12,2) not null default 0.00,
  purchase_date date not null,
  invoice_pdf text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: pae_incidents (Registro de incidencias y reportes ETA)
create table if not exists public.pae_incidents (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  incident_type varchar(100) not null, -- 'Retraso', 'Mala Calidad', 'Alimento Insuficiente', 'Falta de Operador', 'ETA'
  title varchar(255) not null,
  description text not null,
  incident_date date default current_date not null,
  affected_count integer default 0, -- Útil para reportes ETA
  symptoms text, -- Síntomas en caso de ETA
  medical_attention boolean default false, -- Si requirieron atención médica en caso de ETA
  status varchar(50) default 'Abierto' not null, -- 'Abierto', 'En proceso', 'Cerrado'
  photos text[], -- Fotos de alimentos en mal estado
  report_pdf_url text, -- Reporte oficial de salud pública (ETA)
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: pae_spqr (Trazabilidad de Peticiones, Quejas, Reclamos y Sugerencias)
create table if not exists public.pae_spqr (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  spqr_type varchar(100) not null, -- 'Petición', 'Queja', 'Reclamo', 'Sugerencia'
  requester_name varchar(255) not null,
  description text not null,
  spqr_date date default current_date not null,
  status varchar(50) default 'Abierto' not null, -- 'Abierto', 'Respondido', 'Cerrado'
  response_text text,
  response_date date,
  evidences text[],
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: pae_improvement_plans (Planes de mejoramiento institucional)
create table if not exists public.pae_improvement_plans (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  finding text not null, -- Hallazgo o problema detectado
  corrective_action text not null, -- Acción correctiva propuesta
  responsible_name varchar(255) not null,
  due_date date not null,
  status varchar(50) default 'Abierto' not null, -- 'Abierto', 'Cumplido', 'Vencido'
  completion_percentage integer default 0 not null,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: pae_committees (Comités de Alimentación Escolar CAE y Comités Operativos)
create table if not exists public.pae_committees (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  committee_type varchar(100) not null, -- 'CAE', 'Comité Operativo'
  meeting_date date not null,
  meeting_time varchar(50) not null,
  location varchar(255) not null,
  description text,
  members jsonb not null, -- Lista de integrantes asistentes y roles
  decisions text,
  acta_pdf_url text,
  evidences text[],
  status varchar(50) default 'Planeado' not null, -- 'Planeado', 'Realizado'
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: pae_mesas_publicas (Rendición de cuentas de Mesas Públicas)
create table if not exists public.pae_mesas_publicas (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  vigencia_year varchar(10) not null, -- e.g. '2026'
  mesa_number integer not null, -- e.g. 1 o 2
  meeting_date date not null,
  attendees_count integer default 0 not null,
  compromisos text,
  acta_pdf_url text,
  evidences text[],
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -----------------------------------------------------------------
-- 2. HABILITACIÓN DE RLS Y POLÍTICAS DE ACCESO MULTITENANT
-- -----------------------------------------------------------------

alter table public.pae_financial_resources enable row level security;
alter table public.pae_prioritization enable row level security;
alter table public.pae_infrastructure_diagnostic enable row level security;
alter table public.pae_operators enable row level security;
alter table public.pae_team enable row level security;
alter table public.pae_menu_cycles enable row level security;
alter table public.pae_beneficiaries enable row level security;
alter table public.pae_daily_deliveries enable row level security;
alter table public.pae_daily_attendance enable row level security;
alter table public.pae_controls enable row level security;
alter table public.pae_local_purchases enable row level security;
alter table public.pae_incidents enable row level security;
alter table public.pae_spqr enable row level security;
alter table public.pae_improvement_plans enable row level security;
alter table public.pae_committees enable row level security;
alter table public.pae_mesas_publicas enable row level security;

-- Políticas: select disponible para cualquier usuario autenticado (incluye directivos, coordinadores, docentes)
create policy "Lectura de recursos financieros PAE por tenant"
  on public.pae_financial_resources for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de priorizacion PAE por tenant"
  on public.pae_prioritization for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de diagnósticos PAE por tenant"
  on public.pae_infrastructure_diagnostic for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de operadores PAE por tenant"
  on public.pae_operators for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de equipo PAE por tenant"
  on public.pae_team for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de ciclos de menú PAE por tenant"
  on public.pae_menu_cycles for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de beneficiarios PAE por tenant"
  on public.pae_beneficiaries for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de entregas diarias PAE por tenant"
  on public.pae_daily_deliveries for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de asistencia diaria PAE por tenant"
  on public.pae_daily_attendance for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de controles PAE por tenant"
  on public.pae_controls for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de compras locales PAE por tenant"
  on public.pae_local_purchases for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de incidencias PAE por tenant"
  on public.pae_incidents for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de SPQR PAE por tenant"
  on public.pae_spqr for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de planes de mejoramiento PAE por tenant"
  on public.pae_improvement_plans for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de comités PAE por tenant"
  on public.pae_committees for select to authenticated
  using (institution_id = public.active_institution_id());

create policy "Lectura de mesas públicas PAE por tenant"
  on public.pae_mesas_publicas for select to authenticated
  using (institution_id = public.active_institution_id());

-- Políticas: lectura pública sin login para el portal de transparencia (únicamente para select)
create policy "Lectura pública de recursos financieros PAE"
  on public.pae_financial_resources for select to anon
  using (institution_id = '11111111-1111-1111-1111-111111111111');

create policy "Lectura pública de priorización PAE"
  on public.pae_prioritization for select to anon
  using (institution_id = '11111111-1111-1111-1111-111111111111');

create policy "Lectura pública de diagnósticos PAE"
  on public.pae_infrastructure_diagnostic for select to anon
  using (institution_id = '11111111-1111-1111-1111-111111111111');

create policy "Lectura pública de operadores PAE"
  on public.pae_operators for select to anon
  using (institution_id = '11111111-1111-1111-1111-111111111111');

create policy "Lectura pública de ciclos de menú PAE"
  on public.pae_menu_cycles for select to anon
  using (institution_id = '11111111-1111-1111-1111-111111111111');

create policy "Lectura pública de comités PAE"
  on public.pae_committees for select to anon
  using (institution_id = '11111111-1111-1111-1111-111111111111');

create policy "Lectura pública de compras locales PAE"
  on public.pae_local_purchases for select to anon
  using (institution_id = '11111111-1111-1111-1111-111111111111');

create policy "Lectura pública de mesas públicas PAE"
  on public.pae_mesas_publicas for select to anon
  using (institution_id = '11111111-1111-1111-1111-111111111111');

-- Políticas: escritura reservada a roles permitidos del mismo tenant (Rector, Secretaria, Coordinador)
create policy "Gestión completa de recursos financieros PAE para directivos"
  on public.pae_financial_resources for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador'))
  );

create policy "Gestión completa de priorización PAE para directivos"
  on public.pae_prioritization for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador'))
  );

create policy "Gestión completa de diagnósticos PAE para directivos"
  on public.pae_infrastructure_diagnostic for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador'))
  );

create policy "Gestión completa de operadores PAE para directivos"
  on public.pae_operators for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador'))
  );

create policy "Gestión completa de equipo PAE para directivos"
  on public.pae_team for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador'))
  );

create policy "Gestión completa de ciclos de menú PAE para directivos"
  on public.pae_menu_cycles for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador'))
  );

create policy "Gestión completa de beneficiarios PAE para directivos"
  on public.pae_beneficiaries for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador'))
  );

create policy "Gestión completa de entregas diarias PAE para directivos y docentes"
  on public.pae_daily_deliveries for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador', 'docente', 'director_grupo'))
  );

create policy "Gestión completa de asistencia diaria PAE para directivos y docentes"
  on public.pae_daily_attendance for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador', 'docente', 'director_grupo'))
  );

create policy "Gestión completa de controles PAE para directivos"
  on public.pae_controls for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador'))
  );

create policy "Gestión completa de compras locales PAE para directivos"
  on public.pae_local_purchases for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador'))
  );

create policy "Gestión completa de incidencias PAE para directivos y docentes"
  on public.pae_incidents for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador', 'docente', 'director_grupo'))
  );

create policy "Gestión completa de SPQR PAE para directivos"
  on public.pae_spqr for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador'))
  );

create policy "Gestión completa de planes de mejoramiento PAE para directivos"
  on public.pae_improvement_plans for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador'))
  );

create policy "Gestión completa de comités PAE para directivos"
  on public.pae_committees for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador'))
  );

create policy "Gestión completa de mesas públicas PAE para directivos"
  on public.pae_mesas_publicas for all to authenticated
  using (
    institution_id = public.active_institution_id() and
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role in ('rector', 'secretaria', 'coordinador'))
  );

-- -----------------------------------------------------------------
-- 3. SEMILLA DE DATOS (Seed Data para Demo)
-- -----------------------------------------------------------------

-- 3.1 Recursos Financieros
insert into public.pae_financial_resources (
  id, institution_id, source_name, allocated_value, allocation_date, support_document, pdf_url
) values 
  ('aa777777-1111-1111-1111-000000000001', '11111111-1111-1111-1111-111111111111', 'SGP - Sistema General de Participación', 125000000.00, '2026-01-15', 'Resolución MEN 0451 de 2026', '/documentos/res_sgp_0451.pdf'),
  ('aa777777-1111-1111-1111-000000000002', '11111111-1111-1111-1111-111111111111', 'Cofinanciación Municipal', 45000000.00, '2026-02-01', 'Acuerdo Municipal 012 de 2026', '/documentos/acuerdo_mun_012.pdf')
on conflict (id) do nothing;

-- 3.2 Priorización por Sedes
insert into public.pae_prioritization (
  id, institution_id, school_sede, school_shift, projected_beneficiaries, assigned_slots
) values 
  ('aa777777-2222-2222-2222-000000000001', '11111111-1111-1111-1111-111111111111', 'Sede Principal Campestre', 'Única', 320, 320),
  ('aa777777-2222-2222-2222-000000000002', '11111111-1111-1111-1111-111111111111', 'Sede Anexa Primaria', 'Mañana', 180, 180)
on conflict (id) do nothing;

-- 3.3 Diagnóstico de Infraestructura
insert into public.pae_infrastructure_diagnostic (
  id, institution_id, school_sede, dining_room_status, kitchen_status, pantry_status, utensils_status, equipment_status, observaciones, photos
) values 
  ('aa777777-3333-3333-3333-000000000001', '11111111-1111-1111-1111-111111111111', 'Sede Principal Campestre', 'Bueno', 'Bueno', 'Bueno', 'Bueno', 'Bueno', 'El comedor cuenta con capacidad para 120 estudiantes por turno. Equipos de refrigeración en óptimo estado.', array['/evidencias/comedor_principal_1.jpg']),
  ('aa777777-3333-3333-3333-000000000002', '11111111-1111-1111-1111-111111111111', 'Sede Anexa Primaria', 'Regular', 'Regular', 'Regular', 'Bueno', 'Malo', 'Se requiere reposición urgente de la licuadora industrial y mantenimiento de las hornillas de gas.', array['/evidencias/cocina_primaria_1.jpg'])
on conflict (id) do nothing;

-- 3.4 Operadores PAE
insert into public.pae_operators (
  id, institution_id, operator_name, nit, representative, contract_number, start_date, end_date, policies, pdf_url, is_active
) values 
  ('aa777777-4444-4444-4444-000000000001', '11111111-1111-1111-1111-111111111111', 'Consorcio Alimentando Futuro 2026', '901.458.123-5', 'Dra. Patricia Gómez Ruiz', 'Licitación Pública No. LP-PAE-001-2026', '2026-01-20', '2026-11-30', array['Póliza de Calidad de Alimentos - Suramericana No. 45102', 'Póliza de Cumplimiento - Seguros del Estado No. 90291'], '/documentos/contrato_pae_2026.pdf', true)
on conflict (id) do nothing;

-- 3.5 Equipo PAE
insert into public.pae_team (
  id, institution_id, member_name, role_title, document_number, email, phone
) values 
  ('aa777777-5555-5555-5555-000000000001', '11111111-1111-1111-1111-111111111111', 'Dra. Claudia Marcela Pérez', 'Nutricionista - Supervisor de Contrato', '52.321.456', 'claudia.perez@consorcio.com', '+573124567891'),
  ('aa777777-5555-5555-5555-000000000002', '11111111-1111-1111-1111-111111111111', 'María del Carmen Suárez', 'Manipuladora de Alimentos Líder', '20.123.456', 'maria.carmen@gmail.com', '+573219876543')
on conflict (id) do nothing;

-- 3.6 Ciclos de Menú
insert into public.pae_menu_cycles (
  id, institution_id, week_number, menu_details, minuta_pdf_url, nutrition_analysis_url, preparation_guides_url
) values 
  ('aa777777-6666-6666-6666-000000000001', '11111111-1111-1111-1111-111111111111', 1, 'Lunes: Arroz con pollo, ensalada verde, banano y jugo de guayaba. Martes: Carne de res sudada, arroz, lentejas, papaya y jugo de mango. Miércoles: Pollo al horno, puré de papa, zanahoria, manzana y leche. Jueves: Cerdo asado, arroz, fríjoles, melón y limonada. Viernes: Pescado frito, arroz con coco, patacón, ensalada de repollo y jugo de piña.', '/minutas/minuta_semana_1.pdf', '/minutas/analisis_nutri_s1.pdf', '/minutas/guia_prep_s1.pdf')
on conflict (id) do nothing;

-- 3.7 Beneficiarios (Asociados a los estudiantes existentes)
insert into public.pae_beneficiaries (
  student_id, institution_id, is_beneficiary, entry_date, exit_date, modality, prioritization_reason, classifications
) values 
  ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', true, '2026-01-20', null, 'Almuerzo Caliente Preparado en Sitio', 'Jornada Única', array['Jornada única']),
  ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', true, '2026-01-20', null, 'Almuerzo Caliente Preparado en Sitio', 'Ruralidad', array['Rural', 'Jornada única']),
  ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', true, '2026-01-20', null, 'Ración Industrializada', 'Extrema Pobreza', array['Vulnerabilidad'])
on conflict (student_id) do nothing;

-- 3.8 Compras Locales (A productores del municipio - Meta del 20%)
-- Valor total compras locales: 16.000.000 / Valor total contrato: 80.000.000 (aprox. 20%)
insert into public.pae_local_purchases (
  id, institution_id, supplier_name, municipality, product_name, purchase_value, purchase_date, invoice_pdf
) values 
  ('aa777777-7777-7777-7777-000000000001', '11111111-1111-1111-1111-111111111111', 'Cooperativa Agropecuaria de San Antonio', 'San Antonio de Tequendama', 'Frutas y Verduras (Banano, Guayaba, Tomate)', 8500000.00, '2026-05-10', '/facturas/factura_agro_012.pdf'),
  ('aa777777-7777-7777-7777-000000000002', '11111111-1111-1111-1111-111111111111', 'Asociación de Lecheros de la Vereda El Hato', 'San Antonio de Tequendama', 'Leche entera pasteurizada y Queso campesino', 7500000.00, '2026-05-18', '/facturas/factura_lecheros_450.pdf')
on conflict (id) do nothing;

-- 3.9 Incidencias
insert into public.pae_incidents (
  id, institution_id, incident_type, title, description, incident_date, affected_count, symptoms, medical_attention, status, photos, report_pdf_url
) values 
  ('aa777777-8888-8888-8888-000000000001', '11111111-1111-1111-1111-111111111111', 'Retraso', 'Retraso de entrega de ración industrializada', 'El camión transportador del operador llegó a las 11:30 AM en lugar de las 9:30 AM programadas.', '2026-05-25', 0, null, false, 'Cerrado', null, null),
  ('aa777777-8888-8888-8888-000000000002', '11111111-1111-1111-1111-111111111111', 'Mala Calidad', 'Banano en estado de sobremaduración', 'Se recibió una caja de banano con golpes y cáscara negra no aptos para el consumo de los estudiantes.', '2026-06-02', 0, null, false, 'Abierto', array['/incidencias/banano_mal_estado.jpg'], null)
on conflict (id) do nothing;

-- 3.10 SPQR
insert into public.pae_spqr (
  id, institution_id, spqr_type, requester_name, description, spqr_date, status, response_text, response_date, evidences
) values 
  ('aa777777-9999-9999-9999-000000000001', '11111111-1111-1111-1111-111111111111', 'Queja', 'Marcos Elías Gómez (Padre de Familia)', 'Presento queja formal debido a que el menú del día jueves no coincidió con la minuta publicada en el portal.', '2026-05-18', 'Respondido', 'Apreciado acudiente, se verificó con el operador y hubo un cambio autorizado por secretaría de educación debido a problemas logísticos con el proveedor de carne de cerdo.', '2026-05-20', null)
on conflict (id) do nothing;

-- 3.11 Comités (CAE y Mesas Públicas)
insert into public.pae_committees (
  id, institution_id, committee_type, meeting_date, meeting_time, location, description, members, decisions, acta_pdf_url, status
) values 
  ('aa777777-aaaa-aaaa-aaaa-000000000001', '11111111-1111-1111-1111-111111111111', 'CAE', '2026-03-12', '10:00', 'Biblioteca Principal', 'Primera sesión del Comité de Alimentación Escolar (CAE) de la vigencia 2026.', '[{"name": "Dr. Ramón Ramírez", "role": "Rector / Presidente"}, {"name": "Lic. Diana Carolina Reyes", "role": "Docente Representante"}, {"name": "Carlos Ortiz", "role": "Representante de Padres"}, {"name": "Alejandro Ortiz", "role": "Representante de Estudiantes"}]'::jsonb, 'Se conforma formalmente el comité CAE. Se acuerda realizar veeduría semanal de la calidad de la leche recibida y programar la primera Mesa Pública en Abril.', '/actas/acta_cae_001_2026.pdf', 'Realizado')
on conflict (id) do nothing;

insert into public.pae_mesas_publicas (
  id, institution_id, vigencia_year, mesa_number, meeting_date, attendees_count, compromisos, acta_pdf_url
) values 
  ('aa777777-bbbb-bbbb-bbbb-000000000001', '11111111-1111-1111-1111-111111111111', '2026', 1, '2026-04-20', 85, '1. El operador se compromete a ajustar los tiempos de entrega. 2. La secretaría de educación municipal supervisará la cadena de frío semanalmente. 3. Mayor inclusión de frutas de productores locales.', '/actas/acta_mesa_publica_1.pdf')
on conflict (id) do nothing;


-- FILE: 08_migration_engine.sql
-- =================================================================
-- AulaCore - Phase VII: Centro de Migración Institucional
-- =================================================================

-- 1. TABLA: migration_audit_logs (Auditoría de Importación de Datos Históricos)
create table if not exists public.migration_audit_logs (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  user_name varchar(255) not null,
  ip_address varchar(100) default '127.0.0.1',
  module_type varchar(100) not null, -- 'Estudiantes', 'Padres de Familia', 'Docentes', 'Cursos', 'Asignaturas', 'Matrículas', 'Calificaciones', 'Asistencia', 'Observador', 'Seguimientos', 'Beneficiarios PAE'
  file_name varchar(255) not null,
  records_count integer not null default 0,
  created_count integer not null default 0,
  updated_count integer not null default 0,
  rejected_count integer not null default 0,
  status varchar(50) not null, -- 'Exitoso', 'Exitoso con advertencias', 'Fallido'
  details jsonb, -- [{row, field, error, value}] o detalles del resumen
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. HABILITACIÓN DE RLS Y POLÍTICAS DE SEGURIDAD
alter table public.migration_audit_logs enable row level security;

-- Política de Lectura: Solo usuarios del mismo tenant (colegio)
create policy "Lectura de logs de migración por tenant"
  on public.migration_audit_logs for select to authenticated
  using (institution_id = public.active_institution_id());

-- Política de Escritura (Inserción): Permitir solo a Rector, Coordinador y Secretaria
create policy "Inserción de logs de migración por directivos"
  on public.migration_audit_logs for insert to authenticated
  with check (
    institution_id = public.active_institution_id() and
    exists (
      select 1 from public.user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('rector', 'coordinador', 'secretaria')
    )
  );

-- 3. SEMILLAS DE AUDITORÍA HISTÓRICA (MOCKS REALISTAS)

-- Log 1: Importación exitosa de estudiantes
insert into public.migration_audit_logs (
  id, institution_id, user_id, user_name, ip_address, module_type, file_name, records_count, created_count, updated_count, rejected_count, status, details, created_at
) values (
  '99999999-9999-9999-9999-f00111112222',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222', -- Rector UID
  'Dr. Ramón Ramírez',
  '192.168.1.102',
  'Estudiantes',
  'estudiantes_historico_10a_11b.xlsx',
  35, 32, 3, 0,
  'Exitoso',
  '[{"message": "Todos los registros cargados satisfactoriamente."}]'::jsonb,
  now() - interval '10 days'
) on conflict (id) do nothing;

-- Log 2: Importación de asignaturas con algunas advertencias por registros rechazados
insert into public.migration_audit_logs (
  id, institution_id, user_id, user_name, ip_address, module_type, file_name, records_count, created_count, updated_count, rejected_count, status, details, created_at
) values (
  '99999999-9999-9999-9999-f00222223333',
  '11111111-1111-1111-1111-111111111111',
  '55555555-5555-5555-5555-555555555555', -- Secretaria UID
  'Dra. Elena Toro',
  '192.168.1.105',
  'Asignaturas',
  'plan_mallas_asignaturas_2026.csv',
  12, 10, 0, 2,
  'Exitoso con advertencias',
  '[{"row": 5, "field": "subject_name", "error": "El nombre de asignatura ya existe.", "value": "Matemáticas"}, {"row": 9, "field": "weekly_hours", "error": "Horas semanales inválidas.", "value": "-3"}]'::jsonb,
  now() - interval '5 days'
) on conflict (id) do nothing;

-- Log 3: Importación fallida (todos rechazados por documentos duplicados y estructura incorrecta)
insert into public.migration_audit_logs (
  id, institution_id, user_id, user_name, ip_address, module_type, file_name, records_count, created_count, updated_count, rejected_count, status, details, created_at
) values (
  '99999999-9999-9999-9999-f00333334444',
  '11111111-1111-1111-1111-111111111111',
  '55555555-5555-5555-5555-555555555555', -- Secretaria UID
  'Dra. Elena Toro',
  '192.168.1.105',
  'Matrículas',
  'matriculas_incorrectas_2026.xlsx',
  5, 0, 0, 5,
  'Fallido',
  '[{"row": 1, "error": "Estudiante no existe en el sistema."}, {"row": 2, "error": "Estudiante no existe en el sistema."}, {"row": 3, "error": "Curso inexistente: 12-Z"}, {"row": 4, "error": "Curso inexistente: 12-Z"}, {"row": 5, "error": "Documento duplicado de matrícula en el mismo periodo."}]'::jsonb,
  now() - interval '2 days'
) on conflict (id) do nothing;


-- FILE: 09_teacher_onboarding_schema.sql
-- =================================================================
-- AulaCore - Phase IX: Teacher Onboarding Schema & Functions
-- =================================================================

-- 1. MODIFICAR RESTRICCIÓN DE ROLES PARA COORDINADOR
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN ('rector', 'coordinador', 'director_grupo', 'docente', 'secretaria', 'padre_familia', 'estudiante'));

-- 2. TABLA DE ONBOARDING DE DOCENTES
CREATE TABLE IF NOT EXISTS public.teacher_onboardings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  document_id TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  profession TEXT,
  degree TEXT,
  experience_years TEXT,
  domain_areas TEXT[],
  sede TEXT,
  jornada TEXT,
  academic_level TEXT,
  subject_area TEXT,
  selected_slots TEXT[],
  selected_roles TEXT[],
  foto_url TEXT,
  cv_url TEXT,
  diploma_url TEXT,
  escalafon_url TEXT,
  background_check_url TEXT,
  certifications_url TEXT,
  identity_doc_url TEXT,
  signature_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'invited', 'email_sent', 'activated', 'first_access', 'rejected')),
  activation_link TEXT,
  email_logs JSONB DEFAULT '[]'::JSONB,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- HABILITAR RLS
ALTER TABLE public.teacher_onboardings ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS
DROP POLICY IF EXISTS "Candidatos pueden insertar su propio onboarding" ON public.teacher_onboardings;
CREATE POLICY "Candidatos pueden insertar su propio onboarding"
  ON public.teacher_onboardings FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Candidatos pueden ver su propio onboarding por email" ON public.teacher_onboardings;
CREATE POLICY "Candidatos pueden ver su propio onboarding por email"
  ON public.teacher_onboardings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Administrativos tienen control total de onboardings" ON public.teacher_onboardings;
CREATE POLICY "Administrativos tienen control total de onboardings"
  ON public.teacher_onboardings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. FUNCIÓN RPC PARA CREAR USUARIO EN AUTH DESDE EL SERVIDOR (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.create_teacher_auth_user(
  p_email TEXT,
  p_password TEXT,
  p_first_name TEXT,
  p_last_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Verificar si el usuario ya existe en auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  
  IF v_user_id IS NOT NULL THEN
    RETURN v_user_id;
  END IF;

  -- Generar UUID único
  v_user_id := gen_random_uuid();
  
  -- Insertar en auth.users directamente
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf', 10)),
    now(),
    '{"provider":"email","providers":["email"]}',
    json_build_object('first_name', p_first_name, 'last_name', p_last_name, 'avatar_url', ''),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );
  
  RETURN v_user_id;
END;
$$;

-- 4. CREAR EL BUCKET DE STORAGE PARA ONBOARDING DE DOCENTES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'teacher-onboarding', 
  'teacher-onboarding', 
  true, 
  10485760, -- Límite de 10MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- POLÍTICAS DE ACCESO PARA EL BUCKET EN STORAGE.OBJECTS
DROP POLICY IF EXISTS "Permitir subida pública de archivos" ON storage.objects;
CREATE POLICY "Permitir subida pública de archivos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'teacher-onboarding');

DROP POLICY IF EXISTS "Permitir lectura pública de archivos" ON storage.objects;
CREATE POLICY "Permitir lectura pública de archivos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'teacher-onboarding');


-- FILE: 10_student_onboarding_schema.sql
-- =================================================================
-- AulaCore - Phase X: Student Onboarding Schema & Functions
-- =================================================================

-- 1. TABLA DE ONBOARDING DE ESTUDIANTES
CREATE TABLE IF NOT EXISTS public.student_onboardings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  sede TEXT,
  jornada TEXT,
  periodo TEXT,
  tipo_matricula TEXT,
  student_name TEXT NOT NULL,
  student_id TEXT NOT NULL UNIQUE,
  id_type TEXT,
  birth_date TEXT,
  blood_type TEXT,
  eps_name TEXT,
  address TEXT,
  has_disability TEXT,
  disability_type TEXT,
  sisben_level TEXT,
  stratum TEXT,
  mother_name TEXT,
  mother_phone TEXT,
  father_name TEXT,
  father_phone TEXT,
  primary_guardian TEXT,
  emergency_name TEXT,
  emergency_phone TEXT,
  emergency_relation TEXT,
  previous_school TEXT,
  last_completed_grade TEXT,
  previous_school_type TEXT,
  allergies TEXT,
  medications TEXT,
  physical_restrictions TEXT,
  medical_observations TEXT,
  foto_student_url TEXT,
  eps_card_url TEXT,
  identity_doc_url TEXT,
  notes_cert_url TEXT,
  paz_salvo_url TEXT,
  medical_cert_url TEXT,
  signature_url TEXT,
  consent_habeas_data BOOLEAN DEFAULT false,
  consent_manual BOOLEAN DEFAULT false,
  consent_siee BOOLEAN DEFAULT false,
  consent_institutional BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'invited', 'email_sent', 'activated', 'first_access', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- HABILITAR RLS
ALTER TABLE public.student_onboardings ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS
DROP POLICY IF EXISTS "Candidatos pueden insertar su propio onboarding" ON public.student_onboardings;
CREATE POLICY "Candidatos pueden insertar su propio onboarding"
  ON public.student_onboardings FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Candidatos pueden ver su propio onboarding" ON public.student_onboardings;
CREATE POLICY "Candidatos pueden ver su propio onboarding"
  ON public.student_onboardings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Administrativos tienen control total de onboardings de estudiantes" ON public.student_onboardings;
CREATE POLICY "Administrativos tienen control total de onboardings de estudiantes"
  ON public.student_onboardings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 2. CREAR EL BUCKET DE STORAGE PARA ONBOARDING DE ESTUDIANTES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-onboarding', 
  'student-onboarding', 
  true, 
  10485760, -- Límite de 10MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- POLÍTICAS DE ACCESO PARA EL BUCKET EN STORAGE.OBJECTS
DROP POLICY IF EXISTS "Permitir subida pública de archivos estudiante" ON storage.objects;
CREATE POLICY "Permitir subida pública de archivos estudiante"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'student-onboarding');

DROP POLICY IF EXISTS "Permitir lectura pública de archivos estudiante" ON storage.objects;
CREATE POLICY "Permitir lectura pública de archivos estudiante"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'student-onboarding');

DROP POLICY IF EXISTS "Permitir actualización pública de archivos estudiante" ON storage.objects;
CREATE POLICY "Permitir actualización pública de archivos estudiante"
  ON storage.objects FOR UPDATE
  TO public
  USING (bucket_id = 'student-onboarding')
  WITH CHECK (bucket_id = 'student-onboarding');



-- -----------------------------------------------------------------
-- 2. DATA INSERTIONS (Seed / Current Demo Data)
-- -----------------------------------------------------------------

-- Deshabilitar triggers temporalmente para inserciones limpias
SET session_replication_role = 'replica';

-- Data for public.institutions (2 rows)
INSERT INTO public.institutions (id, name, slug, logo_url, created_at) VALUES ('11111111-1111-1111-1111-111111111111', 'Colegio AulaCore Central', 'aulacore-central', '/logo-aulacore.png', '2026-05-24T15:17:13.66951+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.institutions (id, name, slug, logo_url, created_at) VALUES ('22222222-2222-2222-2222-111111111111', 'Liceo Femenino de Prueba', 'liceo-prueba', NULL, '2026-06-02T20:34:37.673373+00:00') ON CONFLICT DO NOTHING;

-- Data for public.profiles (10 rows)
INSERT INTO public.profiles (id, first_name, last_name, avatar_url, created_at) VALUES ('22222222-2222-2222-2222-222222222222', 'Ramón', 'Ramírez', '', '2026-05-24T15:17:13.66951+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, first_name, last_name, avatar_url, created_at) VALUES ('33333333-3333-3333-3333-333333333333', 'Patricia', 'Martínez', '', '2026-05-24T15:17:13.66951+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, first_name, last_name, avatar_url, created_at) VALUES ('44444444-4444-4444-4444-444444444444', 'Profesor', 'Gómez', '', '2026-05-24T15:17:13.66951+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, first_name, last_name, avatar_url, created_at) VALUES ('55555555-5555-5555-5555-555555555555', 'Elena', 'Toro', '', '2026-05-24T15:17:13.66951+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, first_name, last_name, avatar_url, created_at) VALUES ('66666666-6666-6666-6666-666666666666', 'Carlos', 'Ortiz', '', '2026-05-24T15:17:13.66951+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, first_name, last_name, avatar_url, created_at) VALUES ('77777777-7777-7777-7777-777777777777', 'Alejandro', 'Ortiz', '', '2026-05-24T15:53:00.796569+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, first_name, last_name, avatar_url, created_at) VALUES ('88888888-8888-8888-8888-888888888888', 'Sofía', 'Ramírez', '', '2026-05-24T15:53:00.796569+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, first_name, last_name, avatar_url, created_at) VALUES ('99999999-9999-9999-9999-999999999999', 'Mateo', 'Gómez', '', '2026-05-24T15:53:00.796569+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, first_name, last_name, avatar_url, created_at) VALUES ('bafbb211-e620-4742-95c2-a930107f81ec', 'Elkin', 'Mario Pelaez Holguin', '', '2026-06-11T18:08:33.214428+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, first_name, last_name, avatar_url, created_at) VALUES ('bde9e6f0-e4c2-42cb-8328-c1e060792e31', 'Elkin', 'Pelaez', 'https://lpfblcidibnepwempwzs.supabase.co/storage/v1/object/public/teacher-onboarding/photos/98490864_1781281339419.png', '2026-06-12T16:40:23.632067+00:00') ON CONFLICT DO NOTHING;

-- Data for public.user_roles (9 rows)
INSERT INTO public.user_roles (id, user_id, institution_id, role, created_at) VALUES ('3f5ef0ad-3866-4c3d-b21c-be1dc3cb6886', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'rector', '2026-05-24T15:17:13.66951+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (id, user_id, institution_id, role, created_at) VALUES ('b9cf890a-d6b7-401f-9ada-63bcb2bc39c7', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'director_grupo', '2026-05-24T15:17:13.66951+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (id, user_id, institution_id, role, created_at) VALUES ('16993b5c-19ae-4cfc-b23f-1e7aaf8b4c41', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'docente', '2026-05-24T15:17:13.66951+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (id, user_id, institution_id, role, created_at) VALUES ('0c7f9311-070e-4c11-a299-0d3dda655bb7', '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'secretaria', '2026-05-24T15:17:13.66951+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (id, user_id, institution_id, role, created_at) VALUES ('a5e29938-c231-4fcb-a09d-7dc9da7e6a1e', '66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'padre_familia', '2026-05-24T15:17:13.66951+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (id, user_id, institution_id, role, created_at) VALUES ('dae57d32-94fa-420a-bcec-ab4e4033cb86', '77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'estudiante', '2026-05-24T15:53:00.796569+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (id, user_id, institution_id, role, created_at) VALUES ('67e6dfae-d065-47cb-adbb-8b463ff4ccab', '88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'estudiante', '2026-05-24T15:53:00.796569+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (id, user_id, institution_id, role, created_at) VALUES ('d4065ca5-b17f-4e26-9d2b-26e84e836ddc', '99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 'estudiante', '2026-05-24T15:53:00.796569+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (id, user_id, institution_id, role, created_at) VALUES ('14af4059-8165-4e2d-bf4f-778b502ef907', 'bde9e6f0-e4c2-42cb-8328-c1e060792e31', '11111111-1111-1111-1111-111111111111', 'docente', '2026-06-12T18:53:46.679867+00:00') ON CONFLICT DO NOTHING;

-- Data for public.institution_academic_settings (1 rows)
INSERT INTO public.institution_academic_settings (id, institution_id, grading_scale_type, min_passing_grade, min_attendance_percentage, decimal_places, average_calculation_type, allow_recovery, recovery_max_grade, country, calendar_type, created_at) VALUES ('adacadac-acad-1111-2222-333333333333', '11111111-1111-1111-1111-111111111111', 'numeric_1_5', 3, 80, 2, 'weighted_periods', true, 3, 'Colombia', 'calendar_a', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;

-- Data for public.academic_years (2 rows)
INSERT INTO public.academic_years (id, institution_id, year, is_active, created_at) VALUES ('11112026-1111-1111-2222-333333333333', '11111111-1111-1111-1111-111111111111', 2026, true, '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_years (id, institution_id, year, is_active, created_at) VALUES ('22222026-2222-2222-2222-333333333333', '22222222-2222-2222-2222-111111111111', 2026, true, '2026-06-02T20:34:37.673373+00:00') ON CONFLICT DO NOTHING;

-- Data for public.academic_periods (3 rows)
INSERT INTO public.academic_periods (id, academic_year_id, name, code, start_date, end_date, weight, status, created_at) VALUES ('11111111-1111-1111-2222-333333333333', '11112026-1111-1111-2222-333333333333', 'Primer Periodo', 'P1', '2026-01-15', '2026-04-15', 30, 'publicado', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_periods (id, academic_year_id, name, code, start_date, end_date, weight, status, created_at) VALUES ('22222222-2222-2222-2222-333333333333', '11112026-1111-1111-2222-333333333333', 'Segundo Periodo', 'P2', '2026-04-16', '2026-08-15', 30, 'abierto', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_periods (id, academic_year_id, name, code, start_date, end_date, weight, status, created_at) VALUES ('33333333-3333-3333-2222-333333333333', '11112026-1111-1111-2222-333333333333', 'Tercer Periodo', 'P3', '2026-08-16', '2026-11-25', 40, 'abierto', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;

-- Data for public.courses (2 rows)
INSERT INTO public.courses (id, institution_id, academic_year_id, grade_level, group_name, description, created_at) VALUES ('cccccccc-10aa-1111-2222-333333333333', '11111111-1111-1111-1111-111111111111', '11112026-1111-1111-2222-333333333333', '10', 'A', 'Grado Décimo A', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.courses (id, institution_id, academic_year_id, grade_level, group_name, description, created_at) VALUES ('55555555-5555-5555-5555-000000000000', '22222222-2222-2222-2222-111111111111', '22222026-2222-2222-2222-333333333333', '11-A', 'Grupo Once A', 'Curso de Once para Colegio B', '2026-06-02T20:34:37.673373+00:00') ON CONFLICT DO NOTHING;

-- Data for public.students (3 rows)
INSERT INTO public.students (id, enrollment_number, status, date_of_birth, medical_notes, created_at) VALUES ('77777777-7777-7777-7777-777777777777', 'MAT-2026-001', 'active', '2011-04-12', 'Alergia leve a la penicilina', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.students (id, enrollment_number, status, date_of_birth, medical_notes, created_at) VALUES ('88888888-8888-8888-8888-888888888888', 'MAT-2026-002', 'active', '2011-08-25', NULL, '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.students (id, enrollment_number, status, date_of_birth, medical_notes, created_at) VALUES ('99999999-9999-9999-9999-999999999999', 'MAT-2026-003', 'active', '2010-11-02', 'Usa gafas correctoras de miopía', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;

-- Data for public.student_enrollments (3 rows)
INSERT INTO public.student_enrollments (id, student_id, course_id, enrolled_at) VALUES ('c536df2a-5fd7-4dec-8fca-d333cacb2826', '77777777-7777-7777-7777-777777777777', 'cccccccc-10aa-1111-2222-333333333333', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.student_enrollments (id, student_id, course_id, enrolled_at) VALUES ('8053365e-51cd-40be-97cc-c736b208c08d', '88888888-8888-8888-8888-888888888888', 'cccccccc-10aa-1111-2222-333333333333', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.student_enrollments (id, student_id, course_id, enrolled_at) VALUES ('e681ec55-6179-4d47-bd8d-efd32b6da7a7', '99999999-9999-9999-9999-999999999999', 'cccccccc-10aa-1111-2222-333333333333', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;

-- Data for public.academic_records (15 rows)
INSERT INTO public.academic_records (id, student_id, academic_period_id, subject, grade, teacher_id, remarks, created_at) VALUES ('5bd3d7bf-8fe4-4219-8b30-e56b97460eda', '77777777-7777-7777-7777-777777777777', '11111111-1111-1111-2222-333333333333', 'Matemáticas', 4.2, '44444444-4444-4444-4444-444444444444', 'Buen desempeño global.', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_records (id, student_id, academic_period_id, subject, grade, teacher_id, remarks, created_at) VALUES ('76c12266-dba0-4ae3-844b-2e16ae409229', '77777777-7777-7777-7777-777777777777', '11111111-1111-1111-2222-333333333333', 'Inglés', 4.6, '44444444-4444-4444-4444-444444444444', 'Fluidez oral destacable.', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_records (id, student_id, academic_period_id, subject, grade, teacher_id, remarks, created_at) VALUES ('3d906f9f-42c2-4fc3-9c8d-076dd56bff76', '77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-333333333333', 'Matemáticas', 4.5, '44444444-4444-4444-4444-444444444444', 'Excelente progreso conceptual.', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_records (id, student_id, academic_period_id, subject, grade, teacher_id, remarks, created_at) VALUES ('5ed6dc80-c470-4779-9679-ccb61487f1a1', '77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-333333333333', 'Inglés', 4.8, '44444444-4444-4444-4444-444444444444', 'Redacción avanzada en ensayos.', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_records (id, student_id, academic_period_id, subject, grade, teacher_id, remarks, created_at) VALUES ('55610a84-6bf0-41eb-884f-ac8eed4934f1', '77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-333333333333', 'Ciencias Naturales', 4.3, '44444444-4444-4444-4444-444444444444', 'Sólido compromiso en el laboratorio.', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_records (id, student_id, academic_period_id, subject, grade, teacher_id, remarks, created_at) VALUES ('96b3cc2a-8a98-4084-a160-a52666a3b4fd', '88888888-8888-8888-8888-888888888888', '11111111-1111-1111-2222-333333333333', 'Matemáticas', 3.5, '44444444-4444-4444-4444-444444444444', 'Cumple de manera justa.', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_records (id, student_id, academic_period_id, subject, grade, teacher_id, remarks, created_at) VALUES ('8d0a3184-ec08-4553-8767-649f684acbba', '88888888-8888-8888-8888-888888888888', '11111111-1111-1111-2222-333333333333', 'Inglés', 3.9, '44444444-4444-4444-4444-444444444444', 'Esfuerzo constante.', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_records (id, student_id, academic_period_id, subject, grade, teacher_id, remarks, created_at) VALUES ('450639e1-2ae6-4e85-b587-665738e7410c', '88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-333333333333', 'Matemáticas', 3.8, '44444444-4444-4444-4444-444444444444', 'Requiere concentrarse más en exámenes directos.', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_records (id, student_id, academic_period_id, subject, grade, teacher_id, remarks, created_at) VALUES ('9e994b68-6a71-4450-b361-bffdab4ed607', '88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-333333333333', 'Inglés', 4, '44444444-4444-4444-4444-444444444444', 'Correcta asimilación del material.', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_records (id, student_id, academic_period_id, subject, grade, teacher_id, remarks, created_at) VALUES ('22ebb513-2d16-4d24-83f9-7312ae2912d5', '88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-333333333333', 'Ciencias Naturales', 3.5, '44444444-4444-4444-4444-444444444444', 'Suele distraerse en dinámicas grupales.', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_records (id, student_id, academic_period_id, subject, grade, teacher_id, remarks, created_at) VALUES ('7ac4823d-2085-422f-b668-43a99c60d74a', '99999999-9999-9999-9999-999999999999', '11111111-1111-1111-2222-333333333333', 'Matemáticas', 3.1, '44444444-4444-4444-4444-444444444444', 'Aprobación al límite, requiere refuerzo.', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_records (id, student_id, academic_period_id, subject, grade, teacher_id, remarks, created_at) VALUES ('bbb461b0-3e29-4e98-8d82-4d203cad21a9', '99999999-9999-9999-9999-999999999999', '11111111-1111-1111-2222-333333333333', 'Inglés', 3, '44444444-4444-4444-4444-444444444444', 'Presenta vacíos de gramática básica.', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_records (id, student_id, academic_period_id, subject, grade, teacher_id, remarks, created_at) VALUES ('c93ab433-c0a1-4da9-a005-30313f09fac9', '99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-333333333333', 'Matemáticas', 2.8, '44444444-4444-4444-4444-444444444444', 'Reprobó examen parcial por falta de estudio.', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_records (id, student_id, academic_period_id, subject, grade, teacher_id, remarks, created_at) VALUES ('16dbd753-7545-488b-9871-bdb346b16d96', '99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-333333333333', 'Inglés', 3.2, '44444444-4444-4444-4444-444444444444', 'Mínimo esfuerzo. No entrega tareas a tiempo.', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_records (id, student_id, academic_period_id, subject, grade, teacher_id, remarks, created_at) VALUES ('9e728723-3208-4588-994a-4a530a6059b9', '99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-333333333333', 'Ciencias Naturales', 2.9, '44444444-4444-4444-4444-444444444444', 'No presentó el informe del proyecto final.', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;

-- Data for public.attendance_records (15 rows)
INSERT INTO public.attendance_records (id, student_id, academic_period_id, record_date, status, recorded_by, qr_scanned, created_at) VALUES ('d3cc0e42-de76-499a-ae5e-62018f7fb366', '77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-333333333333', '2026-05-18', 'present', '44444444-4444-4444-4444-444444444444', true, '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance_records (id, student_id, academic_period_id, record_date, status, recorded_by, qr_scanned, created_at) VALUES ('24de00cf-5e90-4afc-958e-6094c5960061', '77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-333333333333', '2026-05-19', 'present', '44444444-4444-4444-4444-444444444444', true, '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance_records (id, student_id, academic_period_id, record_date, status, recorded_by, qr_scanned, created_at) VALUES ('dfd40e76-afca-40de-abb6-4ac1657d5c28', '77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-333333333333', '2026-05-20', 'present', '44444444-4444-4444-4444-444444444444', true, '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance_records (id, student_id, academic_period_id, record_date, status, recorded_by, qr_scanned, created_at) VALUES ('9a19718d-51f2-4223-b180-46c4e2b26b65', '77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-333333333333', '2026-05-21', 'present', '44444444-4444-4444-4444-444444444444', true, '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance_records (id, student_id, academic_period_id, record_date, status, recorded_by, qr_scanned, created_at) VALUES ('a9d30c71-4eb8-48f5-a380-39aa605da814', '77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-333333333333', '2026-05-22', 'present', '44444444-4444-4444-4444-444444444444', true, '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance_records (id, student_id, academic_period_id, record_date, status, recorded_by, qr_scanned, created_at) VALUES ('378b5f75-fa92-4880-9539-d9aa16e247b3', '88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-333333333333', '2026-05-18', 'absent', '44444444-4444-4444-4444-444444444444', false, '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance_records (id, student_id, academic_period_id, record_date, status, recorded_by, qr_scanned, created_at) VALUES ('b51d7f19-c0ef-4f42-8d03-558047e27c57', '88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-333333333333', '2026-05-19', 'present', '44444444-4444-4444-4444-444444444444', true, '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance_records (id, student_id, academic_period_id, record_date, status, recorded_by, qr_scanned, created_at) VALUES ('d14b573a-ca37-4e7e-966d-0fc3fd5d0755', '88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-333333333333', '2026-05-20', 'absent', '44444444-4444-4444-4444-444444444444', false, '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance_records (id, student_id, academic_period_id, record_date, status, recorded_by, qr_scanned, created_at) VALUES ('e374db3d-0975-40a7-916f-651e983fba36', '88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-333333333333', '2026-05-21', 'present', '44444444-4444-4444-4444-444444444444', true, '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance_records (id, student_id, academic_period_id, record_date, status, recorded_by, qr_scanned, created_at) VALUES ('15826fdb-8382-4e04-9055-00cc1e49763c', '88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-333333333333', '2026-05-22', 'absent', '44444444-4444-4444-4444-444444444444', false, '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance_records (id, student_id, academic_period_id, record_date, status, recorded_by, qr_scanned, created_at) VALUES ('4736c0ba-d7dd-4bd7-98ba-aede9233ee86', '99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-333333333333', '2026-05-18', 'present', '44444444-4444-4444-4444-444444444444', true, '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance_records (id, student_id, academic_period_id, record_date, status, recorded_by, qr_scanned, created_at) VALUES ('f2246e29-1351-4e17-b559-e9817b900547', '99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-333333333333', '2026-05-19', 'tardy', '44444444-4444-4444-4444-444444444444', false, '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance_records (id, student_id, academic_period_id, record_date, status, recorded_by, qr_scanned, created_at) VALUES ('d7fd5c07-06d4-493c-8d62-242e139902ab', '99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-333333333333', '2026-05-20', 'present', '44444444-4444-4444-4444-444444444444', true, '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance_records (id, student_id, academic_period_id, record_date, status, recorded_by, qr_scanned, created_at) VALUES ('e795326e-be1d-4ebb-a9d3-c4c211f57b16', '99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-333333333333', '2026-05-21', 'tardy', '44444444-4444-4444-4444-444444444444', false, '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.attendance_records (id, student_id, academic_period_id, record_date, status, recorded_by, qr_scanned, created_at) VALUES ('e46b2657-76b9-41f0-8214-0c5c391f866a', '99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-333333333333', '2026-05-22', 'present', '44444444-4444-4444-4444-444444444444', true, '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;

-- Data for public.behavioral_logs (2 rows)
INSERT INTO public.behavioral_logs (id, student_id, observation_type, description, commitments, teacher_id, created_at) VALUES ('420dca3a-e23d-4e5e-b7cd-681e1323d88b', '77777777-7777-7777-7777-777777777777', 'positive', 'Destacado liderazgo y proactividad guiando el equipo escolar en la Olimpiada Regional de Matemáticas y Robótica.', 'Continuar asumiendo roles de monitor estudiantil en asignaturas STEM.', '44444444-4444-4444-4444-444444444444', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.behavioral_logs (id, student_id, observation_type, description, commitments, teacher_id, created_at) VALUES ('87fd8d73-7846-4f80-8225-281292081162', '99999999-9999-9999-9999-999999999999', 'mild_negative', 'Uso reiterado y no autorizado de distractores tecnológicos (teléfono inteligente) durante las clases explicativas de física.', 'Estudiante se compromete a almacenar el celular apagado en el casillero institucional. Citación a acudiente si reincide.', '44444444-4444-4444-4444-444444444444', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;

-- Data for public.early_alerts (2 rows)
INSERT INTO public.early_alerts (id, student_id, academic_period_id, category, risk_level, description, status, created_at) VALUES ('0f4c3e2f-ba34-45e9-8a71-2979f282063b', '88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-333333333333', 'attendance', 'high', 'Registra una tasa de inasistencia acumulada del 60% en el Periodo 2 en curso. No se han recibido justificantes válidos por parte del acudiente.', 'open', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.early_alerts (id, student_id, academic_period_id, category, risk_level, description, status, created_at) VALUES ('4bb4795b-7a43-4d48-9beb-2c1c2e1f53a6', '99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-333333333333', 'academic', 'medium', 'Calificaciones del Periodo 2 por debajo del estándar mínimo de aprobación (3.00) en Matemáticas (2.80) e Informe de Ciencias (2.90).', 'in_progress', '2026-05-24T16:15:42.977667+00:00') ON CONFLICT DO NOTHING;

-- Data for public.parent_director_messages (4 rows)
INSERT INTO public.parent_director_messages (id, student_id, sender_role, message_type, content, read_confirmed, read_at, parent_reply, replied_at, created_at, priority_level, requires_confirmation, confirmation_type) VALUES ('60069f3c-3bd7-45eb-9956-1bd887911862', '77777777-7777-7777-7777-777777777777', 'director', 'internal_message', 'Estimado Carlos, felicito a Alejandro por su liderazgo voluntario en la olimpiada de matemáticas. Su apoyo a sus compañeros ha sido invaluable.', true, '2026-05-21T20:30:00+00:00', 'Muchas gracias Lic. Martínez, nos alegra mucho escuchar eso de Alejandro y siempre estamos apoyándolo desde casa.', '2026-05-21T23:45:00+00:00', '2026-05-24T17:22:53.430124+00:00', 'low', false, 'simple_read') ON CONFLICT DO NOTHING;
INSERT INTO public.parent_director_messages (id, student_id, sender_role, message_type, content, read_confirmed, read_at, parent_reply, replied_at, created_at, priority_level, requires_confirmation, confirmation_type) VALUES ('916e53b8-1b0b-4a0b-9753-d56dd0abba91', '88888888-8888-8888-8888-888888888888', 'director', 'automatic_alert', 'Alerta de Inasistencia RFID: Sofía Ramírez no ha registrado su ingreso en la portería escolar hoy. Por favor, justifique su ausencia hoy mismo.', true, '2026-05-24T13:15:00+00:00', 'Lic. Martínez, buenos días. Sofía se encuentra en una cita médica general programada. Adjuntaré la excusa física mañana en portería.', '2026-05-24T13:30:00+00:00', '2026-05-24T17:22:53.430124+00:00', 'high', true, 'parent_compromise') ON CONFLICT DO NOTHING;
INSERT INTO public.parent_director_messages (id, student_id, sender_role, message_type, content, read_confirmed, read_at, parent_reply, replied_at, created_at, priority_level, requires_confirmation, confirmation_type) VALUES ('d51f3b8e-069c-4ae9-8f2d-c286b645bae0', '88888888-8888-8888-8888-888888888888', 'director', 'behavioral_followup', 'Estimada Marta, hemos registrado una anotación de inasistencia no justificada y llegadas tarde reiteradas en el observador de Sofía. Necesitamos programar una tutoría presencial y firmar acta de compromiso.', false, NULL, NULL, NULL, '2026-05-24T17:22:53.430124+00:00', 'high', true, 'digital_signature') ON CONFLICT DO NOTHING;
INSERT INTO public.parent_director_messages (id, student_id, sender_role, message_type, content, read_confirmed, read_at, parent_reply, replied_at, created_at, priority_level, requires_confirmation, confirmation_type) VALUES ('d9378ed8-832c-46b4-b153-f52b8a9d06f1', '99999999-9999-9999-9999-999999999999', 'director', 'academic_observation', 'Estimada Sara, Mateo presenta dificultades acumuladas en Matemáticas y Ciencias en el período actual. Es imperativo revisar el plan remedial de acompañamiento en casa.', true, '2026-05-23T15:00:00+00:00', 'Entendido, Lic. Martínez. Ya revisamos el plan de mejoramiento con el Prof. Gómez y estamos repasando todas las tardes con Mateo.', '2026-05-23T19:20:00+00:00', '2026-05-24T17:22:53.430124+00:00', 'medium', true, 'parent_compromise') ON CONFLICT DO NOTHING;

-- Data for public.institution_document_templates (1 rows)
INSERT INTO public.institution_document_templates (id, institution_id, template_type, header_logo_url, footer_text, rector_signature_url, secretary_signature_url, watermark_url, primary_color, secondary_color, legal_text, qr_position, page_format, margins, created_at) VALUES ('99999999-9999-9999-aaaa-111111111111', '11111111-1111-1111-1111-111111111111', 'academic', '/logo-aulacore.png', 'Colegio AulaCore Central - Licencia Oficial del Ministerio de Educación Resolución 4028. Bogotá, D.C.', '/signature-rector.png', '/signature-secretary.png', '/watermark-logo.png', '#0f172a', '#4338ca', 'El suscrito Rector y Secretaria Académica certifican que los datos consignados en este informe representan fielmente la trazabilidad del estudiante en el año académico respectivo.', 'bottom_left', 'letter', '{"top":15,"left":15,"right":15,"bottom":15}'::jsonb, '2026-05-24T17:47:39.057906+00:00') ON CONFLICT DO NOTHING;

-- Data for public.institution_documents (3 rows)
INSERT INTO public.institution_documents (id, institution_id, template_id, document_type, generated_by, student_id, verification_code, digital_signature_hash, document_metadata, pdf_url, email_sent, printed, status, created_at) VALUES ('99999999-9999-9999-bbbb-111111111111', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-aaaa-111111111111', 'academic_report', '33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 'AC-VERIFY-777A', '3a29f8c6d5e4b3a29f8c6d5e4b3a29f8c6d5e4b3a29f8c6d5e4b3a29f8c6d5e4', '{"grades":[{"exams":[9,9.5],"subject":"Matemáticas","homeworks":[9.2,9.8],"finalGrade":9.4,"participation":[10]},{"exams":[8.5,9],"subject":"Ciencias Naturales","homeworks":[9,9.2],"finalGrade":9,"participation":[9.5]},{"exams":[9.8,10],"subject":"Inglés","homeworks":[9.8,9.8],"finalGrade":9.8,"participation":[10]}],"courseName":"Grado Décimo A (10-A)","generalGpa":9.4,"studentName":"Alejandro Ortiz","academicYear":2026,"attendanceRate":98.2}'::jsonb, NULL, false, false, 'signed', '2026-05-24T17:47:39.057906+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.institution_documents (id, institution_id, template_id, document_type, generated_by, student_id, verification_code, digital_signature_hash, document_metadata, pdf_url, email_sent, printed, status, created_at) VALUES ('99999999-9999-9999-cccc-111111111111', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-aaaa-111111111111', 'academic_compromise', '33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', 'AC-VERIFY-999C', '7b8a9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b', '{"courseName":"Grado Décimo A (10-A)","parentName":"Sara Gómez","academicGpa":6.5,"compromises":["Asistir diariamente a las monitorías académicas los días martes y jueves en jornada de la tarde.","Entregar bitácora de repaso firmada por el acudiente (Sara Gómez) en cada clase de Física/Álgebra.","Desarrollar el taller remedial práctico asignado por el Prof. Gómez con fecha límite del 12 de junio."],"studentName":"Mateo Gómez","academicYear":2026,"failuresCount":3,"remedialSubject":"Matemáticas & Ciencias Naturales"}'::jsonb, NULL, false, false, 'signed', '2026-05-24T17:47:39.057906+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.institution_documents (id, institution_id, template_id, document_type, generated_by, student_id, verification_code, digital_signature_hash, document_metadata, pdf_url, email_sent, printed, status, created_at) VALUES ('99999999-9999-9999-dddd-111111111111', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-aaaa-111111111111', 'citations', '33333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888888', 'AC-VERIFY-888B', 'fc3d2a1b9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b', '{"reason":"Revisión conjunta de inasistencias RFID injustificadas acumuladas (Asistencia: 72.5%) y establecimiento del compromiso disciplinario.","dateTime":"Bogotá D.C., 28 de Mayo de 2026, 09:30 AM","location":"Sala de Juntas de Rectoría / Rector Ramón Ramírez","courseName":"Grado Décimo A (10-A)","studentName":"Sofía Ramírez","citationType":"Comité Convivencial Disciplinario"}'::jsonb, NULL, false, false, 'signed', '2026-05-24T17:47:39.057906+00:00') ON CONFLICT DO NOTHING;

-- Data for public.institution_document_audit (4 rows)
INSERT INTO public.institution_document_audit (id, document_id, action_type, performed_by, client_ip, user_agent, created_at) VALUES ('ee62a438-bd13-439f-968c-c8b7d7e8afc1', '99999999-9999-9999-bbbb-111111111111', 'generated', '33333333-3333-3333-3333-333333333333', '192.168.1.50', 'Next.js Server Actions SSR', '2026-05-24T17:47:39.057906+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.institution_document_audit (id, document_id, action_type, performed_by, client_ip, user_agent, created_at) VALUES ('8baf5320-ea58-429d-8ffe-2bb6d05ac4a3', '99999999-9999-9999-bbbb-111111111111', 'signed', '33333333-3333-3333-3333-333333333333', '192.168.1.50', 'Next.js Crypto Signatures', '2026-05-24T17:47:39.057906+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.institution_document_audit (id, document_id, action_type, performed_by, client_ip, user_agent, created_at) VALUES ('a15e007c-8128-4551-ad86-9cf106e022f3', '99999999-9999-9999-cccc-111111111111', 'generated', '33333333-3333-3333-3333-333333333333', '192.168.1.50', 'Next.js Server Actions SSR', '2026-05-24T17:47:39.057906+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.institution_document_audit (id, document_id, action_type, performed_by, client_ip, user_agent, created_at) VALUES ('99da77db-da63-40cc-b00d-3c1a7d426d8d', '99999999-9999-9999-cccc-111111111111', 'signed', '22222222-2222-2222-2222-222222222222', '192.168.1.10', 'Rector Digital Stamp PKI', '2026-05-24T17:47:39.057906+00:00') ON CONFLICT DO NOTHING;

-- Data for public.curriculum_subjects (3 rows)
INSERT INTO public.curriculum_subjects (id, institution_id, name, description, area, created_at) VALUES ('55555555-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Matemáticas Avanzadas', NULL, 'Ciencias Exactas', '2026-05-25T21:12:06.106873+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.curriculum_subjects (id, institution_id, name, description, area, created_at) VALUES ('55555555-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Física Clásica', NULL, 'Ciencias Exactas', '2026-05-25T21:12:06.106873+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.curriculum_subjects (id, institution_id, name, description, area, created_at) VALUES ('55555555-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Inglés Nivel B2', NULL, 'Idiomas', '2026-05-25T21:12:06.106873+00:00') ON CONFLICT DO NOTHING;

-- Data for public.academic_schedules (7 rows)
INSERT INTO public.academic_schedules (id, institution_id, academic_year_id, academic_period_id, course_id, subject_id, teacher_id, classroom, day_of_week, start_time, end_time, status, created_at) VALUES ('5bec8455-bd01-4c2d-a791-835f2232e127', '11111111-1111-1111-1111-111111111111', '11112026-1111-1111-2222-333333333333', '33333333-3333-3333-2222-333333333333', 'cccccccc-10aa-1111-2222-333333333333', '55555555-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Aula 301', 1, '08:00:00', '09:30:00', 'active', '2026-05-25T21:12:06.106873+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_schedules (id, institution_id, academic_year_id, academic_period_id, course_id, subject_id, teacher_id, classroom, day_of_week, start_time, end_time, status, created_at) VALUES ('f28edf5d-c17f-451f-a7aa-1e57f29b1282', '11111111-1111-1111-1111-111111111111', '11112026-1111-1111-2222-333333333333', '33333333-3333-3333-2222-333333333333', 'cccccccc-10aa-1111-2222-333333333333', '55555555-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Laboratorio', 1, '10:00:00', '11:30:00', 'active', '2026-05-25T21:12:06.106873+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_schedules (id, institution_id, academic_year_id, academic_period_id, course_id, subject_id, teacher_id, classroom, day_of_week, start_time, end_time, status, created_at) VALUES ('90885c75-608b-4c0b-8e81-3853a59e04d9', '11111111-1111-1111-1111-111111111111', '11112026-1111-1111-2222-333333333333', '33333333-3333-3333-2222-333333333333', 'cccccccc-10aa-1111-2222-333333333333', '55555555-1111-1111-1111-111111111111', 'bde9e6f0-e4c2-42cb-8328-c1e060792e31', '201', 3, '08:00:00', '08:00:00', 'active', '2026-06-12T20:00:36.541473+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_schedules (id, institution_id, academic_year_id, academic_period_id, course_id, subject_id, teacher_id, classroom, day_of_week, start_time, end_time, status, created_at) VALUES ('f2c699ef-6be3-444e-8c69-111ef10fc530', '11111111-1111-1111-1111-111111111111', '11112026-1111-1111-2222-333333333333', '33333333-3333-3333-2222-333333333333', 'cccccccc-10aa-1111-2222-333333333333', '55555555-2222-2222-2222-222222222222', 'bde9e6f0-e4c2-42cb-8328-c1e060792e31', '210', 5, '08:00:00', '10:00:00', 'active', '2026-06-12T20:00:58.292225+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_schedules (id, institution_id, academic_year_id, academic_period_id, course_id, subject_id, teacher_id, classroom, day_of_week, start_time, end_time, status, created_at) VALUES ('39a2de0c-b6c7-4abd-bc0f-d6bc13f4ce19', '11111111-1111-1111-1111-111111111111', '11112026-1111-1111-2222-333333333333', '33333333-3333-3333-2222-333333333333', 'cccccccc-10aa-1111-2222-333333333333', '55555555-1111-1111-1111-111111111111', 'bde9e6f0-e4c2-42cb-8328-c1e060792e31', '302', 1, '08:00:00', '09:00:00', 'active', '2026-06-14T15:08:16.339741+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_schedules (id, institution_id, academic_year_id, academic_period_id, course_id, subject_id, teacher_id, classroom, day_of_week, start_time, end_time, status, created_at) VALUES ('b0a55970-4dc0-4a0d-a637-4f1e5cc7c4df', '11111111-1111-1111-1111-111111111111', '11112026-1111-1111-2222-333333333333', '33333333-3333-3333-2222-333333333333', 'cccccccc-10aa-1111-2222-333333333333', '55555555-1111-1111-1111-111111111111', 'bde9e6f0-e4c2-42cb-8328-c1e060792e31', '302', 2, '09:00:00', '10:00:00', 'active', '2026-06-14T15:09:16.990165+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.academic_schedules (id, institution_id, academic_year_id, academic_period_id, course_id, subject_id, teacher_id, classroom, day_of_week, start_time, end_time, status, created_at) VALUES ('53483365-a1b2-48e2-9b68-94c9f856c1d5', '11111111-1111-1111-1111-111111111111', '11112026-1111-1111-2222-333333333333', '33333333-3333-3333-2222-333333333333', 'cccccccc-10aa-1111-2222-333333333333', '55555555-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '202', 2, '10:00:00', '11:00:00', 'active', '2026-06-14T16:30:47.124618+00:00') ON CONFLICT DO NOTHING;

-- Data for public.pei_identity (1 rows)
INSERT INTO public.pei_identity (id, institution_id, mission, vision, principles, values, student_profile, teacher_profile, graduate_profile, created_by, updated_by, created_at, updated_at) VALUES ('88888888-8888-8888-8888-aaaa11112222', '11111111-1111-1111-1111-111111111111', 'Formar líderes éticos, creativos y competentes mediante una educación de excelencia e integral que promueva el desarrollo sostenible y la paz social.', 'Ser en el 2030 una institución educativa referente a nivel nacional por su innovación pedagógica, el liderazgo digital y el compromiso social de sus egresados.', 'La centralidad del estudiante en el aprendizaje, la justicia social, el respeto a la diversidad y la investigación científica.', 'Respeto, Honestidad, Responsabilidad, Empatía, Solidaridad, Tolerancia.', 'Estudiante crítico, indagador, ético, autónomo en su aprendizaje y comprometido con su comunidad.', 'Docente facilitador, actualizado, investigador, que promueve la creatividad y la inclusión pedagógica.', 'Ciudadano integral, emprendedor, con altas competencias académicas, comunicativas y habilidades digitales.', NULL, NULL, '2026-06-05T13:25:31.965819+00:00', '2026-06-05T13:25:31.965819+00:00') ON CONFLICT DO NOTHING;

-- Data for public.pei_pedagogical_model (1 rows)
INSERT INTO public.pei_pedagogical_model (id, institution_id, model_type, description, created_by, updated_by, created_at, updated_at) VALUES ('88888888-8888-8888-8888-bbbb11112222', '11111111-1111-1111-1111-111111111111', 'Constructivista', 'El modelo pedagógico de AulaCore se fundamenta en el constructivismo social, donde el aprendizaje es un proceso activo de construcción de significado. El estudiante conecta nuevos saberes con sus experiencias previas mediante el trabajo colaborativo, la investigación guiada y la resolución de problemas reales (ABP), acompañado por el docente como facilitador.', NULL, NULL, '2026-06-05T13:25:31.965819+00:00', '2026-06-05T13:25:31.965819+00:00') ON CONFLICT DO NOTHING;

-- Data for public.pei_school_government (8 rows)
INSERT INTO public.pei_school_government (id, institution_id, body_type, member_name, role_title, period, created_by, updated_by, created_at, updated_at, document_number, email, phone) VALUES ('88888888-8888-8888-8888-c00111112222', '11111111-1111-1111-1111-111111111111', 'Rector', 'Dr. Ramón Ramírez', 'Rector de la Institución', '2026', NULL, NULL, '2026-06-05T13:25:31.965819+00:00', '2026-06-05T13:25:31.965819+00:00', '1010202030', 'ramon.ramirez@aulacore.edu.co', '+573001234567') ON CONFLICT DO NOTHING;
INSERT INTO public.pei_school_government (id, institution_id, body_type, member_name, role_title, period, created_by, updated_by, created_at, updated_at, document_number, email, phone) VALUES ('88888888-8888-8888-8888-c00211112222', '11111111-1111-1111-1111-111111111111', 'Consejo Directivo', 'Dr. Ramón Ramírez', 'Presidente', '2026', NULL, NULL, '2026-06-05T13:25:31.965819+00:00', '2026-06-05T13:25:31.965819+00:00', '1010202030', 'ramon.ramirez@aulacore.edu.co', '+573001234567') ON CONFLICT DO NOTHING;
INSERT INTO public.pei_school_government (id, institution_id, body_type, member_name, role_title, period, created_by, updated_by, created_at, updated_at, document_number, email, phone) VALUES ('88888888-8888-8888-8888-c00311112222', '11111111-1111-1111-1111-111111111111', 'Consejo Directivo', 'Dra. Diana Carolina Reyes', 'Representante de Docentes', '2026', NULL, NULL, '2026-06-05T13:25:31.965819+00:00', '2026-06-05T13:25:31.965819+00:00', '52190180', 'diana.reyes@aulacore.edu.co', '+573123456789') ON CONFLICT DO NOTHING;
INSERT INTO public.pei_school_government (id, institution_id, body_type, member_name, role_title, period, created_by, updated_by, created_at, updated_at, document_number, email, phone) VALUES ('88888888-8888-8888-8888-c00411112222', '11111111-1111-1111-1111-111111111111', 'Consejo Académico', 'Lic. Carlos Martínez', 'Representante de Humanidades', '2026', NULL, NULL, '2026-06-05T13:25:31.965819+00:00', '2026-06-05T13:25:31.965819+00:00', '79820300', 'carlos.martinez@aulacore.edu.co', '+573104567890') ON CONFLICT DO NOTHING;
INSERT INTO public.pei_school_government (id, institution_id, body_type, member_name, role_title, period, created_by, updated_by, created_at, updated_at, document_number, email, phone) VALUES ('88888888-8888-8888-8888-c00511112222', '11111111-1111-1111-1111-111111111111', 'Consejo Estudiantil', 'Mateo Gómez', 'Representante Grado Décimo', '2026', NULL, NULL, '2026-06-05T13:25:31.965819+00:00', '2026-06-05T13:25:31.965819+00:00', '1000123456', 'mateo.gomez@aulacore.edu.co', '+573157890123') ON CONFLICT DO NOTHING;
INSERT INTO public.pei_school_government (id, institution_id, body_type, member_name, role_title, period, created_by, updated_by, created_at, updated_at, document_number, email, phone) VALUES ('88888888-8888-8888-8888-c00611112222', '11111111-1111-1111-1111-111111111111', 'Personero', 'Alejandro Ortiz', 'Personero de Estudiantes', '2026', NULL, NULL, '2026-06-05T13:25:31.965819+00:00', '2026-06-05T13:25:31.965819+00:00', '1000987654', 'alejandro.ortiz@aulacore.edu.co', '+573204561234') ON CONFLICT DO NOTHING;
INSERT INTO public.pei_school_government (id, institution_id, body_type, member_name, role_title, period, created_by, updated_by, created_at, updated_at, document_number, email, phone) VALUES ('88888888-8888-8888-8888-c00711112222', '11111111-1111-1111-1111-111111111111', 'Contralor Escolar', 'Sofía Ramírez', 'Contralora Escolar', '2026', NULL, NULL, '2026-06-05T13:25:31.965819+00:00', '2026-06-05T13:25:31.965819+00:00', '1000543210', 'sofia.ramirez@aulacore.edu.co', '+573183214321') ON CONFLICT DO NOTHING;
INSERT INTO public.pei_school_government (id, institution_id, body_type, member_name, role_title, period, created_by, updated_by, created_at, updated_at, document_number, email, phone) VALUES ('88888888-8888-8888-8888-c00811112222', '11111111-1111-1111-1111-111111111111', 'Consejo de Padres', 'Carlos Ortiz', 'Representante Grado Décimo A', '2026', NULL, NULL, '2026-06-05T13:25:31.965819+00:00', '2026-06-05T13:25:31.965819+00:00', '19820300', 'carlos.ortiz@parent.aulacore.com', '+573111223344') ON CONFLICT DO NOTHING;

-- Data for public.pei_manual_versions (2 rows)
INSERT INTO public.pei_manual_versions (id, institution_id, version, pdf_url, update_notes, is_active, created_by, updated_by, created_at, updated_at) VALUES ('88888888-8888-8888-8888-d00111112222', '11111111-1111-1111-1111-111111111111', '1.0.0', '/manual-convivencia-v1.0.pdf', 'Versión inicial aprobada por el Consejo Directivo en 2024.', false, NULL, NULL, '2026-06-05T13:25:31.965819+00:00', '2026-06-05T13:25:31.965819+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.pei_manual_versions (id, institution_id, version, pdf_url, update_notes, is_active, created_by, updated_by, created_at, updated_at) VALUES ('88888888-8888-8888-8888-d00211112222', '11111111-1111-1111-1111-111111111111', '2.0.0', '/manual-convivencia-v2.0.pdf', 'Ajuste de normativas de uso de celulares en el aula y actualización de rutas de atención de la Ley 1620.', true, NULL, NULL, '2026-06-05T13:25:31.965819+00:00', '2026-06-05T13:25:31.965819+00:00') ON CONFLICT DO NOTHING;

-- Data for public.pei_projects (3 rows)
INSERT INTO public.pei_projects (id, institution_id, project_type, objective, responsible, schedule, evidences, status, indicators, created_by, updated_by, created_at, updated_at) VALUES ('88888888-8888-8888-8888-e00111112222', '11111111-1111-1111-1111-111111111111', 'PRAE', 'Promover una cultura de reciclaje, conservación del agua y manejo adecuado de residuos sólidos dentro del colegio para mitigar el impacto ambiental.', 'Lic. Diana Carolina Reyes', 'Marzo a Noviembre - Actividades semanales de compostaje y jornadas mensuales ecológicas.', '["/evidencias/prae-jornada-siembra.jpg","/evidencias/taller-reciclaje.pdf"]'::jsonb, 'Activo', '92% de cobertura de participación estudiantil; 450 kg de material reciclable clasificado.', NULL, NULL, '2026-06-05T13:25:31.965819+00:00', '2026-06-05T13:25:31.965819+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.pei_projects (id, institution_id, project_type, objective, responsible, schedule, evidences, status, indicators, created_by, updated_by, created_at, updated_at) VALUES ('88888888-8888-8888-8888-e00211112222', '11111111-1111-1111-1111-111111111111', 'Democracia', 'Fomentar la cultura de la participación cívica y la toma de decisiones democráticas mediante el proceso de elección del Gobierno Escolar.', 'Lic. Carlos Martínez', 'Febrero a Marzo - Debates electorales, votación digital RFID y posesión oficial.', '["/evidencias/acta-posesion-personero.pdf","/evidencias/graficas-escrutinio.png"]'::jsonb, 'Completado', '100% de estudiantes habilitados votaron mediante las terminales IoT de AulaCore.', NULL, NULL, '2026-06-05T13:25:31.965819+00:00', '2026-06-05T13:25:31.965819+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.pei_projects (id, institution_id, project_type, objective, responsible, schedule, evidences, status, indicators, created_by, updated_by, created_at, updated_at) VALUES ('88888888-8888-8888-8888-e00311112222', '11111111-1111-1111-1111-111111111111', 'Orientador Escolar', 'Brindar acompañamiento psicosocial continuo y realizar talleres preventivos de salud mental, orientación vocacional y convivencia familiar.', 'Dra. Elena Toro', 'Permanente - Tutorías individuales los martes y jueves por la tarde, talleres grupales mensuales.', '["/evidencias/taller-prevencion-ansiedad.pdf"]'::jsonb, 'Activo', '45 tutorías individuales realizadas; 10 talleres grupales ejecutados con éxito.', NULL, NULL, '2026-06-05T13:25:31.965819+00:00', '2026-06-05T13:25:31.965819+00:00') ON CONFLICT DO NOTHING;

-- Data for public.pei_gov_convocatorias (2 rows)
INSERT INTO public.pei_gov_convocatorias (id, institution_id, title, body_type, meeting_date, meeting_time, location, description, attachments, status, recipients, sent_at, calendar_event_id, created_by, updated_by, created_at, updated_at) VALUES ('88888888-8888-8888-8888-f00111112222', '11111111-1111-1111-1111-111111111111', 'Primera Sesión Ordinaria de Consejo Directivo', 'Consejo Directivo', '2026-02-10', '08:00:00', 'Sala de Juntas Rectoría', 'Revisión y aprobación del presupuesto anual 2026 e informe de gestión del periodo anterior.', NULL, 'Realizada', '[{"name":"Dr. Ramón Ramírez","email":"ramon.ramirez@aulacore.edu.co","phone":"+573001234567","status":"Enviado"},{"name":"Dra. Diana Carolina Reyes","email":"diana.reyes@aulacore.edu.co","phone":"+573123456789","status":"Enviado"}]'::jsonb, '2026-02-05T13:44:26.09641+00:00', NULL, NULL, NULL, '2026-02-05T13:44:26.09641+00:00', '2026-02-05T13:44:26.09641+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.pei_gov_convocatorias (id, institution_id, title, body_type, meeting_date, meeting_time, location, description, attachments, status, recipients, sent_at, calendar_event_id, created_by, updated_by, created_at, updated_at) VALUES ('88888888-8888-8888-8888-f00211112222', '11111111-1111-1111-1111-111111111111', 'Planeación Curricular Segundo Trimestre', 'Consejo Académico', '2026-06-15', '14:00:00', 'Biblioteca Principal', 'Ajustes de mallas curriculares según la Ley 115 e integración del modelo Constructivista.', NULL, 'Enviada', '[{"name":"Lic. Carlos Martínez","email":"carlos.martinez@aulacore.edu.co","phone":"+573104567890","status":"Enviado"}]'::jsonb, '2026-06-05T13:44:26.09641+00:00', NULL, NULL, NULL, '2026-06-05T13:44:26.09641+00:00', '2026-06-05T13:44:26.09641+00:00') ON CONFLICT DO NOTHING;

-- Data for public.pei_gov_meetings (1 rows)
INSERT INTO public.pei_gov_meetings (id, institution_id, convocatoria_id, title, body_type, meeting_date, meeting_time, location, description, attendance, status, decisions, evidences, calendar_event_id, created_by, updated_by, created_at, updated_at) VALUES ('88888888-8888-8888-8888-f00311112222', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-f00111112222', 'Primera Sesión Ordinaria de Consejo Directivo', 'Consejo Directivo', '2026-02-10', '08:00:00', 'Sala de Juntas Rectoría', 'Revisión y aprobación del presupuesto anual 2026 e informe de gestión del periodo anterior.', '[{"name":"Dr. Ramón Ramírez","attended":true,"member_id":"gov-1","role_title":"Presidente"},{"name":"Dra. Diana Carolina Reyes","attended":true,"member_id":"gov-3","role_title":"Representante de Docentes"}]'::jsonb, 'Realizada', 'Se aprueba por unanimidad el presupuesto institucional de 2026. Se acuerda iniciar cotización para renovación del Aula de Tecnología en Marzo.', '["/evidencias/presupuesto_aprobado_2026.xlsx","/evidencias/cotizacion_aulas.pdf"]'::jsonb, NULL, NULL, NULL, '2026-02-05T13:44:26.09641+00:00', '2026-02-05T13:44:26.09641+00:00') ON CONFLICT DO NOTHING;

-- Data for public.pei_gov_actas (1 rows)
INSERT INTO public.pei_gov_actas (id, institution_id, meeting_id, acta_number, content, pdf_url, evidences, signers, status, created_by, updated_by, created_at, updated_at) VALUES ('88888888-8888-8888-8888-f00411112222', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-f00311112222', 'Acta No. CD-001-2026', 'En la ciudad de Bogotá D.C., siendo las 08:00 AM del 10 de Febrero de 2026, se reunieron en la Sala de Juntas los integrantes del Consejo Directivo. El Rector Ramón Ramírez abrió la sesión explicando el orden del día. Se discutió el balance de gastos del año anterior y las metas financieras 2026. Tras someter a votación, se aprobó el rubro de infraestructura tecnológica.', '/actas/acta-cd-001-2026.pdf', '["/evidencias/anexo_firmas.jpg"]'::jsonb, '[{"name":"Dr. Ramón Ramírez","signed":true,"signed_at":"2026-02-10T11:00:00Z","role_title":"Presidente"},{"name":"Dra. Diana Carolina Reyes","signed":true,"signed_at":"2026-02-10T11:15:00Z","role_title":"Representante de Docentes"}]'::jsonb, 'Firmada', NULL, NULL, '2026-02-05T13:44:26.09641+00:00', '2026-02-05T13:44:26.09641+00:00') ON CONFLICT DO NOTHING;

-- Data for public.pae_financial_resources (2 rows)
INSERT INTO public.pae_financial_resources (id, institution_id, source_name, allocated_value, allocation_date, support_document, pdf_url, created_by, updated_by, created_at, updated_at) VALUES ('aa777777-1111-1111-1111-000000000001', '11111111-1111-1111-1111-111111111111', 'SGP - Sistema General de Participación', 125000000, '2026-01-15', 'Resolución MEN 0451 de 2026', '/documentos/res_sgp_0451.pdf', NULL, NULL, '2026-06-05T19:24:50.6834+00:00', '2026-06-05T19:24:50.6834+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.pae_financial_resources (id, institution_id, source_name, allocated_value, allocation_date, support_document, pdf_url, created_by, updated_by, created_at, updated_at) VALUES ('aa777777-1111-1111-1111-000000000002', '11111111-1111-1111-1111-111111111111', 'Cofinanciación Municipal', 45000000, '2026-02-01', 'Acuerdo Municipal 012 de 2026', '/documentos/acuerdo_mun_012.pdf', NULL, NULL, '2026-06-05T19:24:50.6834+00:00', '2026-06-05T19:24:50.6834+00:00') ON CONFLICT DO NOTHING;

-- Data for public.pae_prioritization (2 rows)
INSERT INTO public.pae_prioritization (id, institution_id, school_sede, school_shift, projected_beneficiaries, assigned_slots, created_by, updated_by, created_at, updated_at) VALUES ('aa777777-2222-2222-2222-000000000001', '11111111-1111-1111-1111-111111111111', 'Sede Principal Campestre', 'Única', 320, 320, NULL, NULL, '2026-06-05T19:24:50.6834+00:00', '2026-06-05T19:24:50.6834+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.pae_prioritization (id, institution_id, school_sede, school_shift, projected_beneficiaries, assigned_slots, created_by, updated_by, created_at, updated_at) VALUES ('aa777777-2222-2222-2222-000000000002', '11111111-1111-1111-1111-111111111111', 'Sede Anexa Primaria', 'Mañana', 180, 180, NULL, NULL, '2026-06-05T19:24:50.6834+00:00', '2026-06-05T19:24:50.6834+00:00') ON CONFLICT DO NOTHING;

-- Data for public.pae_infrastructure_diagnostic (2 rows)
INSERT INTO public.pae_infrastructure_diagnostic (id, institution_id, school_sede, dining_room_status, kitchen_status, pantry_status, utensils_status, equipment_status, observaciones, photos, created_by, updated_by, created_at, updated_at) VALUES ('aa777777-3333-3333-3333-000000000001', '11111111-1111-1111-1111-111111111111', 'Sede Principal Campestre', 'Bueno', 'Bueno', 'Bueno', 'Bueno', 'Bueno', 'El comedor cuenta con capacidad para 120 estudiantes por turno. Equipos de refrigeración en óptimo estado.', '["/evidencias/comedor_principal_1.jpg"]'::jsonb, NULL, NULL, '2026-06-05T19:24:50.6834+00:00', '2026-06-05T19:24:50.6834+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.pae_infrastructure_diagnostic (id, institution_id, school_sede, dining_room_status, kitchen_status, pantry_status, utensils_status, equipment_status, observaciones, photos, created_by, updated_by, created_at, updated_at) VALUES ('aa777777-3333-3333-3333-000000000002', '11111111-1111-1111-1111-111111111111', 'Sede Anexa Primaria', 'Regular', 'Regular', 'Regular', 'Bueno', 'Malo', 'Se requiere reposición urgente de la licuadora industrial y mantenimiento de las hornillas de gas.', '["/evidencias/cocina_primaria_1.jpg"]'::jsonb, NULL, NULL, '2026-06-05T19:24:50.6834+00:00', '2026-06-05T19:24:50.6834+00:00') ON CONFLICT DO NOTHING;

-- Data for public.pae_operators (1 rows)
INSERT INTO public.pae_operators (id, institution_id, operator_name, nit, representative, contract_number, start_date, end_date, policies, pdf_url, is_active, created_by, updated_by, created_at, updated_at) VALUES ('aa777777-4444-4444-4444-000000000001', '11111111-1111-1111-1111-111111111111', 'Consorcio Alimentando Futuro 2026', '901.458.123-5', 'Dra. Patricia Gómez Ruiz', 'Licitación Pública No. LP-PAE-001-2026', '2026-01-20', '2026-11-30', '["Póliza de Calidad de Alimentos - Suramericana No. 45102","Póliza de Cumplimiento - Seguros del Estado No. 90291"]'::jsonb, '/documentos/contrato_pae_2026.pdf', true, NULL, NULL, '2026-06-05T19:24:50.6834+00:00', '2026-06-05T19:24:50.6834+00:00') ON CONFLICT DO NOTHING;

-- Data for public.pae_team (2 rows)
INSERT INTO public.pae_team (id, institution_id, member_name, role_title, document_number, email, phone, created_by, updated_by, created_at, updated_at) VALUES ('aa777777-5555-5555-5555-000000000001', '11111111-1111-1111-1111-111111111111', 'Dra. Claudia Marcela Pérez', 'Nutricionista - Supervisor de Contrato', '52.321.456', 'claudia.perez@consorcio.com', '+573124567891', NULL, NULL, '2026-06-05T19:24:50.6834+00:00', '2026-06-05T19:24:50.6834+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.pae_team (id, institution_id, member_name, role_title, document_number, email, phone, created_by, updated_by, created_at, updated_at) VALUES ('aa777777-5555-5555-5555-000000000002', '11111111-1111-1111-1111-111111111111', 'María del Carmen Suárez', 'Manipuladora de Alimentos Líder', '20.123.456', 'maria.carmen@gmail.com', '+573219876543', NULL, NULL, '2026-06-05T19:24:50.6834+00:00', '2026-06-05T19:24:50.6834+00:00') ON CONFLICT DO NOTHING;

-- Data for public.pae_menu_cycles (1 rows)
INSERT INTO public.pae_menu_cycles (id, institution_id, week_number, menu_details, minuta_pdf_url, nutrition_analysis_url, preparation_guides_url, created_by, updated_by, created_at, updated_at) VALUES ('aa777777-6666-6666-6666-000000000001', '11111111-1111-1111-1111-111111111111', 1, 'Lunes: Arroz con pollo, ensalada verde, banano y jugo de guayaba. Martes: Carne de res sudada, arroz, lentejas, papaya y jugo de mango. Miércoles: Pollo al horno, puré de papa, zanahoria, manzana y leche. Jueves: Cerdo asado, arroz, fríjoles, melón y limonada. Viernes: Pescado frito, arroz con coco, patacón, ensalada de repollo y jugo de piña.', '/minutas/minuta_semana_1.pdf', '/minutas/analisis_nutri_s1.pdf', '/minutas/guia_prep_s1.pdf', NULL, NULL, '2026-06-05T19:24:50.6834+00:00', '2026-06-05T19:24:50.6834+00:00') ON CONFLICT DO NOTHING;

-- Data for public.pae_beneficiaries (3 rows)
INSERT INTO public.pae_beneficiaries (student_id, institution_id, is_beneficiary, entry_date, exit_date, modality, prioritization_reason, classifications, created_by, updated_by, created_at, updated_at) VALUES ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', true, '2026-01-20', NULL, 'Almuerzo Caliente Preparado en Sitio', 'Jornada Única', '["Jornada única"]'::jsonb, NULL, NULL, '2026-06-05T19:24:50.6834+00:00', '2026-06-05T19:24:50.6834+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.pae_beneficiaries (student_id, institution_id, is_beneficiary, entry_date, exit_date, modality, prioritization_reason, classifications, created_by, updated_by, created_at, updated_at) VALUES ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', true, '2026-01-20', NULL, 'Almuerzo Caliente Preparado en Sitio', 'Ruralidad', '["Rural","Jornada única"]'::jsonb, NULL, NULL, '2026-06-05T19:24:50.6834+00:00', '2026-06-05T19:24:50.6834+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.pae_beneficiaries (student_id, institution_id, is_beneficiary, entry_date, exit_date, modality, prioritization_reason, classifications, created_by, updated_by, created_at, updated_at) VALUES ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', true, '2026-01-20', NULL, 'Ración Industrializada', 'Extrema Pobreza', '["Vulnerabilidad"]'::jsonb, NULL, NULL, '2026-06-05T19:24:50.6834+00:00', '2026-06-05T19:24:50.6834+00:00') ON CONFLICT DO NOTHING;

-- Data for public.pae_local_purchases (2 rows)
INSERT INTO public.pae_local_purchases (id, institution_id, supplier_name, municipality, product_name, purchase_value, purchase_date, invoice_pdf, created_by, updated_by, created_at, updated_at) VALUES ('aa777777-7777-7777-7777-000000000001', '11111111-1111-1111-1111-111111111111', 'Cooperativa Agropecuaria de San Antonio', 'San Antonio de Tequendama', 'Frutas y Verduras (Banano, Guayaba, Tomate)', 8500000, '2026-05-10', '/facturas/factura_agro_012.pdf', NULL, NULL, '2026-06-05T19:24:50.6834+00:00', '2026-06-05T19:24:50.6834+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.pae_local_purchases (id, institution_id, supplier_name, municipality, product_name, purchase_value, purchase_date, invoice_pdf, created_by, updated_by, created_at, updated_at) VALUES ('aa777777-7777-7777-7777-000000000002', '11111111-1111-1111-1111-111111111111', 'Asociación de Lecheros de la Vereda El Hato', 'San Antonio de Tequendama', 'Leche entera pasteurizada y Queso campesino', 7500000, '2026-05-18', '/facturas/factura_lecheros_450.pdf', NULL, NULL, '2026-06-05T19:24:50.6834+00:00', '2026-06-05T19:24:50.6834+00:00') ON CONFLICT DO NOTHING;

-- Data for public.pae_incidents (2 rows)
INSERT INTO public.pae_incidents (id, institution_id, incident_type, title, description, incident_date, affected_count, symptoms, medical_attention, status, photos, report_pdf_url, created_by, updated_by, created_at, updated_at) VALUES ('aa777777-8888-8888-8888-000000000001', '11111111-1111-1111-1111-111111111111', 'Retraso', 'Retraso de entrega de ración industrializada', 'El camión transportador del operador llegó a las 11:30 AM en lugar de las 9:30 AM programadas.', '2026-05-25', 0, NULL, false, 'Cerrado', NULL, NULL, NULL, NULL, '2026-06-05T19:24:50.6834+00:00', '2026-06-05T19:24:50.6834+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.pae_incidents (id, institution_id, incident_type, title, description, incident_date, affected_count, symptoms, medical_attention, status, photos, report_pdf_url, created_by, updated_by, created_at, updated_at) VALUES ('aa777777-8888-8888-8888-000000000002', '11111111-1111-1111-1111-111111111111', 'Mala Calidad', 'Banano en estado de sobremaduración', 'Se recibió una caja de banano con golpes y cáscara negra no aptos para el consumo de los estudiantes.', '2026-06-02', 0, NULL, false, 'Abierto', '["/incidencias/banano_mal_estado.jpg"]'::jsonb, NULL, NULL, NULL, '2026-06-05T19:24:50.6834+00:00', '2026-06-05T19:24:50.6834+00:00') ON CONFLICT DO NOTHING;

-- Data for public.pae_spqr (1 rows)
INSERT INTO public.pae_spqr (id, institution_id, spqr_type, requester_name, description, spqr_date, status, response_text, response_date, evidences, created_by, updated_by, created_at, updated_at) VALUES ('aa777777-9999-9999-9999-000000000001', '11111111-1111-1111-1111-111111111111', 'Queja', 'Marcos Elías Gómez (Padre de Familia)', 'Presento queja formal debido a que el menú del día jueves no coincidió con la minuta publicada en el portal.', '2026-05-18', 'Respondido', 'Apreciado acudiente, se verificó con el operador y hubo un cambio autorizado por secretaría de educación debido a problemas logísticos con el proveedor de carne de cerdo.', '2026-05-20', NULL, NULL, NULL, '2026-06-05T19:24:50.6834+00:00', '2026-06-05T19:24:50.6834+00:00') ON CONFLICT DO NOTHING;

-- Data for public.pae_committees (1 rows)
INSERT INTO public.pae_committees (id, institution_id, committee_type, meeting_date, meeting_time, location, description, members, decisions, acta_pdf_url, evidences, status, created_by, updated_by, created_at, updated_at) VALUES ('aa777777-aaaa-aaaa-aaaa-000000000001', '11111111-1111-1111-1111-111111111111', 'CAE', '2026-03-12', '10:00', 'Biblioteca Principal', 'Primera sesión del Comité de Alimentación Escolar (CAE) de la vigencia 2026.', '[{"name":"Dr. Ramón Ramírez","role":"Rector / Presidente"},{"name":"Lic. Diana Carolina Reyes","role":"Docente Representante"},{"name":"Carlos Ortiz","role":"Representante de Padres"},{"name":"Alejandro Ortiz","role":"Representante de Estudiantes"}]'::jsonb, 'Se conforma formalmente el comité CAE. Se acuerda realizar veeduría semanal de la calidad de la leche recibida y programar la primera Mesa Pública en Abril.', '/actas/acta_cae_001_2026.pdf', NULL, 'Realizado', NULL, NULL, '2026-06-05T19:24:50.6834+00:00', '2026-06-05T19:24:50.6834+00:00') ON CONFLICT DO NOTHING;

-- Data for public.pae_mesas_publicas (1 rows)
INSERT INTO public.pae_mesas_publicas (id, institution_id, vigencia_year, mesa_number, meeting_date, attendees_count, compromisos, acta_pdf_url, evidences, created_by, updated_by, created_at, updated_at) VALUES ('aa777777-bbbb-bbbb-bbbb-000000000001', '11111111-1111-1111-1111-111111111111', '2026', 1, '2026-04-20', 85, '1. El operador se compromete a ajustar los tiempos de entrega. 2. La secretaría de educación municipal supervisará la cadena de frío semanalmente. 3. Mayor inclusión de frutas de productores locales.', '/actas/acta_mesa_publica_1.pdf', NULL, NULL, NULL, '2026-06-05T19:24:50.6834+00:00', '2026-06-05T19:24:50.6834+00:00') ON CONFLICT DO NOTHING;

-- Data for public.migration_audit_logs (4 rows)
INSERT INTO public.migration_audit_logs (id, institution_id, user_id, user_name, ip_address, module_type, file_name, records_count, created_count, updated_count, rejected_count, status, details, created_at) VALUES ('99999999-9999-9999-9999-f00111112222', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Dr. Ramón Ramírez', '192.168.1.102', 'Estudiantes', 'estudiantes_historico_10a_11b.xlsx', 35, 32, 3, 0, 'Exitoso', '[{"message":"Todos los registros cargados satisfactoriamente."}]'::jsonb, '2026-05-26T20:17:28.979075+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.migration_audit_logs (id, institution_id, user_id, user_name, ip_address, module_type, file_name, records_count, created_count, updated_count, rejected_count, status, details, created_at) VALUES ('99999999-9999-9999-9999-f00222223333', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Dra. Elena Toro', '192.168.1.105', 'Asignaturas', 'plan_mallas_asignaturas_2026.csv', 12, 10, 0, 2, 'Exitoso con advertencias', '[{"row":5,"error":"El nombre de asignatura ya existe.","field":"subject_name","value":"Matemáticas"},{"row":9,"error":"Horas semanales inválidas.","field":"weekly_hours","value":"-3"}]'::jsonb, '2026-05-31T20:17:28.979075+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.migration_audit_logs (id, institution_id, user_id, user_name, ip_address, module_type, file_name, records_count, created_count, updated_count, rejected_count, status, details, created_at) VALUES ('99999999-9999-9999-9999-f00333334444', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Dra. Elena Toro', '192.168.1.105', 'Matrículas', 'matriculas_incorrectas_2026.xlsx', 5, 0, 0, 5, 'Fallido', '[{"row":1,"error":"Estudiante no existe en el sistema."},{"row":2,"error":"Estudiante no existe en el sistema."},{"row":3,"error":"Curso inexistente: 12-Z"},{"row":4,"error":"Curso inexistente: 12-Z"},{"row":5,"error":"Documento duplicado de matrícula en el mismo periodo."}]'::jsonb, '2026-06-03T20:17:28.979075+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.migration_audit_logs (id, institution_id, user_id, user_name, ip_address, module_type, file_name, records_count, created_count, updated_count, rejected_count, status, details, created_at) VALUES ('d29c8f8f-6fa9-4ff0-b8db-536a94afbe0f', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Ramón Ramírez', '192.168.1.107', 'Estudiantes', 'plantilla_estudiantes_aulacore_prueba.csv', 10, 9, 1, 0, 'Exitoso', '[]'::jsonb, '2026-06-15T15:54:49.231444+00:00') ON CONFLICT DO NOTHING;

-- Data for public.teacher_onboardings (2 rows)
INSERT INTO public.teacher_onboardings (id, institution_id, full_name, document_id, email, phone, profession, degree, experience_years, domain_areas, sede, jornada, academic_level, subject_area, selected_slots, selected_roles, foto_url, cv_url, diploma_url, escalafon_url, background_check_url, certifications_url, identity_doc_url, signature_url, status, activation_link, email_logs, user_id, created_at, updated_at) VALUES ('c2a9edcc-36bc-4e81-a058-a71130fc25a4', '11111111-1111-1111-1111-111111111111', 'Elkin Mario Pelaez Holguin', '98490864', 'elkinpelaez1@gmail.com', '3117287366', 'Comunicacion social', 'Maestría', '5', '["Tecnología e Informática"]'::jsonb, 'Sede Principal', 'Mañana', 'Bachillerato', 'Tecnología e Informática', '["Lunes-1","Martes-3","Lunes-5"]'::jsonb, '["docente","director_grupo"]'::jsonb, 'https://lpfblcidibnepwempwzs.supabase.co/storage/v1/object/public/teacher-onboarding/photos/98490864_1781201259046.jpg', NULL, NULL, NULL, NULL, NULL, NULL, 'https://lpfblcidibnepwempwzs.supabase.co/storage/v1/object/public/teacher-onboarding/signatures/98490864_1781201285681.png', 'pending_approval', NULL, '[]'::jsonb, NULL, '2026-06-11T18:08:05.812938+00:00', '2026-06-11T18:08:05.812938+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public.teacher_onboardings (id, institution_id, full_name, document_id, email, phone, profession, degree, experience_years, domain_areas, sede, jornada, academic_level, subject_area, selected_slots, selected_roles, foto_url, cv_url, diploma_url, escalafon_url, background_check_url, certifications_url, identity_doc_url, signature_url, status, activation_link, email_logs, user_id, created_at, updated_at) VALUES ('76142354-16ab-460f-a61b-f6df93fd2c2e', '11111111-1111-1111-1111-111111111111', 'Elkin Pelaez', '98490864', 'info@corporacionprofesalaula.org', '3117287366', 'Comunicador social', 'Licenciatura', '1', '["Tecnología e Informática"]'::jsonb, 'Sede Principal (Bachillerato)', 'Única', 'Básica Secundaria (6° - 9°)', 'Tecnología e Informática', '["Martes-2","Lunes-6"]'::jsonb, '["docente"]'::jsonb, 'https://lpfblcidibnepwempwzs.supabase.co/storage/v1/object/public/teacher-onboarding/photos/98490864_1781281339419.png', 'https://lpfblcidibnepwempwzs.supabase.co/storage/v1/object/public/teacher-onboarding/documents/98490864_1781281431466.pdf', 'https://lpfblcidibnepwempwzs.supabase.co/storage/v1/object/public/teacher-onboarding/documents/98490864_1781281438750.pdf', 'https://lpfblcidibnepwempwzs.supabase.co/storage/v1/object/public/teacher-onboarding/documents/98490864_1781281444780.pdf', 'https://lpfblcidibnepwempwzs.supabase.co/storage/v1/object/public/teacher-onboarding/documents/98490864_1781281450146.pdf', 'https://lpfblcidibnepwempwzs.supabase.co/storage/v1/object/public/teacher-onboarding/documents/98490864_1781281456452.pdf', 'https://lpfblcidibnepwempwzs.supabase.co/storage/v1/object/public/teacher-onboarding/documents/98490864_1781281462591.jpg', 'https://lpfblcidibnepwempwzs.supabase.co/storage/v1/object/public/teacher-onboarding/signatures/98490864_1781281517173.png', 'invited', 'https://app.aulacore.org/join/act-76142354-16ab-460f-a61b-f6df93fd2c2e', '[{"id":"eml-WM6MAXNR","body":"Estimado(a) Elkin Pelaez,\n\nNos complace darte la bienvenida al equipo docente. Tu proceso de onboarding ha sido aprobado por la Coordinación Académica.\n\nPara activar tu cuenta y configurar tu acceso a las consolas y registros RFID, haz clic en el siguiente enlace:\nhttps://app.aulacore.org/join/act-76142354-16ab-460f-a61b-f6df93fd2c2e\n\nDetalles de la cuenta:\n- Correo: info@corporacionprofesalaula.org\n- Contraseña temporal: AulaCore2026!\n\nAtentamente,\nCoordinación Académica - AulaCore","sentAt":"2026-06-12T18:53:48.224Z","status":"Enviado","subject":"✨ Bienvenido a AulaCore - Configura tu Acceso Institucional"}]'::jsonb, 'bde9e6f0-e4c2-42cb-8328-c1e060792e31', '2026-06-12T16:25:16.419298+00:00', '2026-06-12T18:53:48.231+00:00') ON CONFLICT DO NOTHING;


-- Rehabilitar triggers
SET session_replication_role = 'origin';
