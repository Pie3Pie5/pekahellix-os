-- PEKAHELLIX V0.5-G.1 — réponses Communication Employé anonymisées
create table if not exists public.communication_employee_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  responses jsonb not null,
  external_score integer not null,
  internal_score integer not null,
  satisfaction_score smallint check (satisfaction_score between 0 and 10)
);

alter table public.communication_employee_responses enable row level security;
revoke all on table public.communication_employee_responses from anon, authenticated;
grant insert on table public.communication_employee_responses to authenticated;

create policy "Employe envoie reponse anonymisee"
on public.communication_employee_responses
for insert
to authenticated
with check (true);

-- Aucun SELECT direct n'est accordé aux utilisateurs authentifiés.
-- Synthèse réservée aux administrateurs. La restitution au gérant doit rester agrégée.
create or replace function public.admin_communication_employee_summary()
returns table (
  response_count bigint,
  avg_external_score numeric,
  avg_internal_score numeric,
  avg_satisfaction numeric,
  satisfaction_0_3 bigint,
  satisfaction_4_6 bigint,
  satisfaction_7_8 bigint,
  satisfaction_9_10 bigint
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_pekahellix_admin() then
    raise exception 'Accès administrateur requis' using errcode='42501';
  end if;
  return query
  select count(*),
    case when count(*) >= 5 then round(avg(r.external_score),2) end,
    case when count(*) >= 5 then round(avg(r.internal_score),2) end,
    case when count(*) >= 5 then round(avg(r.satisfaction_score),2) end,
    case when count(*) >= 5 then count(*) filter (where r.satisfaction_score between 0 and 3) end,
    case when count(*) >= 5 then count(*) filter (where r.satisfaction_score between 4 and 6) end,
    case when count(*) >= 5 then count(*) filter (where r.satisfaction_score between 7 and 8) end,
    case when count(*) >= 5 then count(*) filter (where r.satisfaction_score between 9 and 10) end
  from public.communication_employee_responses r;
end;
$$;
revoke all on function public.admin_communication_employee_summary() from public;
grant execute on function public.admin_communication_employee_summary() to authenticated;
