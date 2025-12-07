-- Create a function to calculate and update vendor rating
create or replace function public.update_vendor_rating()
returns trigger as $$
begin
  update public.vendors
  set 
    rating = (
      select coalesce(round(avg(rating)::numeric, 1), 0)
      from public.reviews
      where vendor_id = coalesce(new.vendor_id, old.vendor_id)
      -- Count ALL ratings immediately, even if comment is not approved yet
    ),
    reviews = (
      select count(*)
      from public.reviews
      where vendor_id = coalesce(new.vendor_id, old.vendor_id)
      -- Count ALL reviews so the average rating makes sense mathematically
    )
  where id = coalesce(new.vendor_id, old.vendor_id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
drop trigger if exists on_review_change on public.reviews;
create trigger on_review_change
after insert or update or delete on public.reviews
for each row execute procedure public.update_vendor_rating();
