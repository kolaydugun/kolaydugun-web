-- Add foreign key from reviews.user_id to profiles.id to enable joins
alter table public.reviews
  add constraint reviews_user_id_profiles_fkey
  foreign key (user_id)
  references public.profiles(id)
  on delete cascade;
