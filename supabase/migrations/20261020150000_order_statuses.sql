-- 0017 · Two more order states, added on their own because a new enum value
-- can't be used in the same transaction that adds it (0018 uses them).
--   pending    the couple placed the order; payment not confirmed yet
--   cancelled  closed without payment
alter type public.order_status add value if not exists 'pending' before 'paid';
alter type public.order_status add value if not exists 'cancelled';
