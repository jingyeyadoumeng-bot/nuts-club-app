-- Security hardening for existing NUTS CLUB Supabase project.
-- Review before applying; does not change existing member records.
BEGIN;
-- The auth trigger is intended to run only via its trigger, not the public Data API.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
-- Prevent anonymous callers from accessing staff-only VIP update RPC.
REVOKE EXECUTE ON FUNCTION public.staff_set_vip_tier(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.staff_set_vip_tier(uuid,text) TO authenticated;
COMMIT;
