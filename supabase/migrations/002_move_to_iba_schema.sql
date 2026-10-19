-- ============================================
-- Move IBA out of `public` into its own `iba` schema.
--
-- The Supabase project is shared with other apps, so IBA gets its own
-- schema. Run in the Dashboard SQL Editor, then:
--   1. Dashboard -> Project Settings -> Data API -> Exposed schemas: add `iba`.
--   2. Deploy the app (clients now use `db: { schema: "iba" }`).
--   3. Run 003_drop_public_views.sql.
--
-- Until step 2 is live, the old app keeps working through the views this
-- migration leaves in `public`.
-- ============================================

begin;

create schema if not exists iba;

grant usage on schema iba to anon, authenticated, service_role;
alter default privileges in schema iba
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema iba
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema iba
  grant all on functions to anon, authenticated, service_role;

-- Tables keep their data, indexes, policies, triggers and grants.
alter table public.iba_profiles     set schema iba;
alter table public.iba_clients      set schema iba;
alter table public.iba_vehicles     set schema iba;
alter table public.iba_iuc_payments set schema iba;

alter function public.iba_update_updated_at() set schema iba;
alter function public.iba_handle_new_user()   set schema iba;

-- The auth.users trigger named public.iba_profiles explicitly. It also fires
-- for users of the other apps in this project, so it must never fail.
create or replace function iba.iba_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into iba.iba_profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Profile the trigger created for a KangarooSplit-only user. Skipped if it
-- has any IBA data, since deleting the profile would cascade to it.
delete from iba.iba_profiles p
where p.id::text like '0d20341b%'
  and not exists (select 1 from iba.iba_clients c where c.user_id = p.id)
  and not exists (select 1 from iba.iba_vehicles v where v.user_id = p.id)
  and not exists (select 1 from iba.iba_iuc_payments i where i.user_id = p.id);

-- Temporary views so the currently deployed app keeps working. RLS of the
-- underlying tables applies (security_invoker).
create view public.iba_profiles with (security_invoker = true)
  as select * from iba.iba_profiles;
create view public.iba_clients with (security_invoker = true)
  as select * from iba.iba_clients;
create view public.iba_vehicles with (security_invoker = true)
  as select * from iba.iba_vehicles;
create view public.iba_iuc_payments with (security_invoker = true)
  as select * from iba.iba_iuc_payments;

grant select, insert, update, delete
  on public.iba_profiles, public.iba_clients, public.iba_vehicles, public.iba_iuc_payments
  to anon, authenticated, service_role;

commit;
