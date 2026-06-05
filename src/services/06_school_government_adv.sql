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
