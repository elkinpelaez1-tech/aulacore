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

-- Funciones auxiliares multi-tenant de alto rendimiento para RLS
create or replace function public.get_auth_user_institution_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select institution_id
  from public.user_roles
  where user_id = auth.uid() and institution_id is not null;
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'super_admin'
  );
$$;

-- Políticas para institutions
create policy "Lectura de instituciones por tenant o superadmin"
  on public.institutions for select
  to authenticated
  using (
    id in (select public.get_auth_user_institution_ids())
    or public.is_super_admin()
  );

create policy "Restringir escritura de instituciones a administradores globales"
  on public.institutions for all
  to service_role
  using (true);

-- Políticas para profiles
create policy "Lectura de perfiles del mismo colegio o propio"
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or public.is_super_admin()
    or exists (
      select 1 from public.user_roles ur
      where ur.user_id = profiles.id
        and ur.institution_id in (select public.get_auth_user_institution_ids())
    )
  );

create policy "Permitir a usuarios actualizar su propio perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Políticas para user_roles
create policy "Lectura de roles propia o directivos del mismo colegio"
  on public.user_roles for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_super_admin()
    or (
      institution_id in (select public.get_auth_user_institution_ids())
      and exists (
        select 1 from public.user_roles admin_ur
        where admin_ur.user_id = auth.uid()
          and admin_ur.role in ('rector', 'coordinador', 'secretaria')
      )
    )
  );

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
