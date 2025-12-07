-- Recalculate ratings and review counts for all vendors
update public.vendors v
set 
  rating = (
    select coalesce(round(avg(rating)::numeric, 1), 0)
    from public.reviews r
    where r.vendor_id = v.id
    -- Count ALL reviews (approved or not) as per new logic
  ),
  reviews = (
    select count(*)
    from public.reviews r
    where r.vendor_id = v.id
    -- Count ALL reviews
  );
