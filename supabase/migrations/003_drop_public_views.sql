-- Run only after the app using `db: { schema: "iba" }` is deployed.
-- Drops the temporary views left in `public` by 002_move_to_iba_schema.sql.

drop view if exists public.iba_iuc_payments;
drop view if exists public.iba_vehicles;
drop view if exists public.iba_clients;
drop view if exists public.iba_profiles;
