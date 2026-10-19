-- ============================================
-- Only create an IBA profile for users who signed up through IBA.
--
-- auth.users is shared with other apps in this Supabase project, so the
-- trigger used to give every new user (e.g. KangarooSplit accounts created
-- in the dashboard) an IBA profile. The IBA sign-up now sends
-- `app: "iba"` in the user metadata; anyone else gets a profile lazily
-- when they first add a client or save their settings.
-- ============================================

create or replace function iba.iba_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.raw_user_meta_data->>'app', '') <> 'iba' then
    return new;
  end if;

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
