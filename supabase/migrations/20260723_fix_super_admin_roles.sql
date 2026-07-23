-- Fix user_roles schema to allow super_admin without an institution_id
ALTER TABLE public.user_roles ALTER COLUMN institution_id DROP NOT NULL;

ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check 
  CHECK (role in ('super_admin', 'rector', 'director_grupo', 'docente', 'secretaria', 'padre_familia', 'estudiante'));
