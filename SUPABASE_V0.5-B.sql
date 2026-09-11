-- ============================================================
-- PEKAHELLIX OS V0.5-B — Fonctions d'administration sécurisées
-- À exécuter UNE FOIS dans Supabase > SQL Editor
-- ============================================================

create or replace function public.is_pekahellix_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  );
$$;

revoke all on function public.is_pekahellix_admin() from public;
grant execute on function public.is_pekahellix_admin() to authenticated;

create or replace function public.admin_list_profiles()
returns table (
  id uuid,
  first_name text,
  last_name text,
  email text,
  role text,
  is_active boolean,
  access_temps boolean,
  access_communication boolean,
  access_cyber boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_pekahellix_admin() then
    raise exception 'Accès administrateur requis' using errcode = '42501';
  end if;

  return query
    select p.id, p.first_name, p.last_name, p.email, p.role, p.is_active,
           p.access_temps, p.access_communication, p.access_cyber,
           p.created_at, p.updated_at
    from public.profiles p
    order by p.created_at desc;
end;
$$;

revoke all on function public.admin_list_profiles() from public;
grant execute on function public.admin_list_profiles() to authenticated;

create or replace function public.admin_update_user_access(
  p_target_id uuid,
  p_is_active boolean,
  p_access_temps boolean,
  p_access_communication boolean,
  p_access_cyber boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text;
begin
  if not public.is_pekahellix_admin() then
    raise exception 'Accès administrateur requis' using errcode = '42501';
  end if;

  select p.role into v_role
  from public.profiles p
  where p.id = p_target_id;

  if v_role is null then
    raise exception 'Utilisateur introuvable';
  end if;

  -- Les comptes techniques admin/test restent protégés.
  if v_role <> 'user' then
    raise exception 'Les droits des comptes admin/test sont protégés';
  end if;

  update public.profiles
  set is_active = coalesce(p_is_active, true),
      access_temps = coalesce(p_access_temps, false),
      access_communication = coalesce(p_access_communication, false),
      access_cyber = coalesce(p_access_cyber, false),
      updated_at = now()
  where id = p_target_id;
end;
$$;

revoke all on function public.admin_update_user_access(uuid,boolean,boolean,boolean,boolean) from public;
grant execute on function public.admin_update_user_access(uuid,boolean,boolean,boolean,boolean) to authenticated;
