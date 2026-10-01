-- PawJournal database schema. Run this file in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_length check (char_length(full_name) <= 120)
);

create table if not exists public.dogs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  breed text,
  birth_date date,
  weight_kg numeric(6, 2),
  weight_unit text not null default 'kg',
  gender text not null default 'unknown',
  photo_path text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dogs_name_not_blank check (char_length(trim(name)) between 1 and 80),
  constraint dogs_breed_length check (breed is null or char_length(breed) <= 120),
  constraint dogs_birth_date_not_future check (birth_date is null or birth_date <= current_date),
  constraint dogs_weight_positive check (weight_kg is null or weight_kg > 0),
  constraint dogs_weight_unit_valid check (weight_unit in ('kg', 'lb')),
  constraint dogs_gender_valid check (
    gender in ('female', 'male', 'unknown')
  ),
  constraint dogs_id_owner_unique unique (id, owner_id)
);

create table if not exists public.walks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  dog_id uuid not null,
  started_at timestamptz not null default now(),
  duration_minutes integer not null,
  distance_km numeric(8, 2),
  location text,
  weather text,
  behaviour_notes text,
  rating smallint,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint walks_dog_owner_fk foreign key (dog_id, owner_id)
    references public.dogs(id, owner_id) on delete cascade,
  constraint walks_duration_positive check (duration_minutes > 0),
  constraint walks_distance_nonnegative check (distance_km is null or distance_km >= 0),
  constraint walks_rating_range check (rating is null or rating between 1 and 5)
);

create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  dog_id uuid not null,
  occurred_at timestamptz not null default now(),
  duration_minutes integer not null,
  location text,
  training_type text not null default 'general',
  skills text[] not null default '{}',
  exercises text,
  went_well text,
  issues text,
  improvements text,
  success_rating smallint,
  focus_rating smallint,
  rating smallint,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint training_dog_owner_fk foreign key (dog_id, owner_id)
    references public.dogs(id, owner_id) on delete cascade,
  constraint training_duration_positive check (duration_minutes > 0),
  constraint training_type_not_blank check (char_length(trim(training_type)) between 1 and 80),
  constraint training_success_rating_range check (
    success_rating is null or success_rating between 1 and 5
  ),
  constraint training_focus_rating_range check (
    focus_rating is null or focus_rating between 1 and 5
  ),
  constraint training_rating_range check (rating is null or rating between 1 and 5)
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  reminders_enabled boolean not null default false,
  walk_reminders_enabled boolean not null default false,
  walk_reminder_time time not null default '09:00',
  training_reminders_enabled boolean not null default false,
  training_reminder_time time not null default '18:00',
  daily_check_in_enabled boolean not null default false,
  daily_check_in_time time not null default '20:00',
  updated_at timestamptz not null default now()
);

create index if not exists dogs_owner_created_idx
  on public.dogs (owner_id, created_at desc);
create index if not exists walks_owner_started_idx
  on public.walks (owner_id, started_at desc);
create index if not exists walks_dog_started_idx
  on public.walks (dog_id, started_at desc);
create index if not exists training_owner_occurred_idx
  on public.training_sessions (owner_id, occurred_at desc);
create index if not exists training_dog_occurred_idx
  on public.training_sessions (dog_id, occurred_at desc);
create index if not exists training_skills_gin_idx
  on public.training_sessions using gin (skills);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists dogs_set_updated_at on public.dogs;
create trigger dogs_set_updated_at
before update on public.dogs
for each row execute function public.set_updated_at();

drop trigger if exists walks_set_updated_at on public.walks;
create trigger walks_set_updated_at
before update on public.walks
for each row execute function public.set_updated_at();

drop trigger if exists training_set_updated_at on public.training_sessions;
create trigger training_set_updated_at
before update on public.training_sessions
for each row execute function public.set_updated_at();

drop trigger if exists notification_preferences_set_updated_at
  on public.notification_preferences;
create trigger notification_preferences_set_updated_at
before update on public.notification_preferences
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')
  )
  on conflict (id) do nothing;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.dogs to authenticated;
grant select, insert, update, delete on public.walks to authenticated;
grant select, insert, update, delete on public.training_sessions to authenticated;
grant select, insert, update, delete on public.notification_preferences to authenticated;

alter table public.profiles enable row level security;
alter table public.dogs enable row level security;
alter table public.walks enable row level security;
alter table public.training_sessions enable row level security;
alter table public.notification_preferences enable row level security;

drop policy if exists "profiles_owner_select" on public.profiles;
create policy "profiles_owner_select" on public.profiles
for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "profiles_owner_update" on public.profiles;
create policy "profiles_owner_update" on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "dogs_owner_all" on public.dogs;
create policy "dogs_owner_all" on public.dogs
for all to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists "walks_owner_all" on public.walks;
create policy "walks_owner_all" on public.walks
for all to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists "training_owner_all" on public.training_sessions;
create policy "training_owner_all" on public.training_sessions
for all to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists "notification_preferences_owner_all"
  on public.notification_preferences;
create policy "notification_preferences_owner_all"
on public.notification_preferences
for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dog-photos',
  'dog-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "dog_photos_owner_select" on storage.objects;
create policy "dog_photos_owner_select" on storage.objects
for select to authenticated
using (
  bucket_id = 'dog-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "dog_photos_owner_insert" on storage.objects;
create policy "dog_photos_owner_insert" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'dog-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "dog_photos_owner_update" on storage.objects;
create policy "dog_photos_owner_update" on storage.objects
for update to authenticated
using (
  bucket_id = 'dog-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'dog-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "dog_photos_owner_delete" on storage.objects;
create policy "dog_photos_owner_delete" on storage.objects
for delete to authenticated
using (
  bucket_id = 'dog-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
