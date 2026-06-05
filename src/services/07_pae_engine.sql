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
