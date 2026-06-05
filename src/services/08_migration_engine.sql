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
