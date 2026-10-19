-- ═══════════════════════════════════════════════════════════════════════════
-- 0009 · Lock internal helpers
-- Supabase gives anon/authenticated EXECUTE on new functions by default, so
-- `revoke … from public` alone left these internal helpers callable over the
-- API. They are only meant to be used inside the guest-facing functions.
-- ═══════════════════════════════════════════════════════════════════════════

revoke all on function public.published_wedding_id(text)            from public, anon, authenticated;
revoke all on function public.section_on(uuid, text, boolean)        from public, anon, authenticated;
revoke all on function public.replies_guest_matches()               from public, anon, authenticated;
revoke all on function public.media_path_wedding_id(text)           from public, anon;
