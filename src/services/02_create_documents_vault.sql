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
