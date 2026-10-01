-- Run this once in the Supabase SQL Editor if you see:
-- "permission denied for table dogs"

grant usage on schema public to authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.dogs to authenticated;
grant select, insert, update, delete on public.walks to authenticated;
grant select, insert, update, delete on public.training_sessions to authenticated;
grant select, insert, update, delete on public.notification_preferences to authenticated;

-- Ensure your signed-in user has a profile row (needed for dog ownership).
insert into public.profiles (id, full_name)
select id, coalesce(raw_user_meta_data ->> 'full_name', '')
from auth.users
on conflict (id) do nothing;

insert into public.notification_preferences (user_id)
select id from auth.users
on conflict (user_id) do nothing;
