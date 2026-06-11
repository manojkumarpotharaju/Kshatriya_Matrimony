-- ============================================================
-- Kshatriya Matrimony — Supabase schema
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ---------- Tables ----------

-- Extra data per registered user (auth.users stores email+password securely)
create table public.members (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  gender text,
  plan text,                      -- silver | gold | platinum | null
  plan_expiry timestamptz,
  is_admin boolean not null default false,
  joined timestamptz not null default now()
);

create table public.profiles (
  id text primary key,
  created_by uuid references public.members(id) on delete cascade,  -- null = seed data
  relation text default 'Myself',
  name text not null,
  age int not null check (age >= 18),
  gender text,
  height text default '',
  city text default '',
  lat double precision,
  lng double precision,
  sub_caste text default '',
  gotra text default '',
  education text default '',
  profession_category text default '',
  profession text default '',
  income text default '',
  family text default '',
  about text default '',
  diet text default 'Vegetarian',
  marital_status text default 'Never Married',
  horoscope text default 'Available on request',
  photo text default '',
  interests text[] not null default '{}',
  verified boolean not null default false,
  premium boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.offers (
  id text primary key,
  title text not null,
  discount int not null check (discount between 1 and 90),
  code text not null,
  valid_till date not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.payments (
  id text primary key,
  user_id uuid references public.members(id) on delete set null,
  user_name text default '',
  plan_id text not null,
  amount int not null,
  method text not null,                     -- card | upi | cash
  details jsonb not null default '{}',
  status text not null default 'pending',  -- pending | success
  offer_applied text,
  created_at timestamptz not null default now()
);

create table public.interests_sent (
  user_id uuid references public.members(id) on delete cascade,
  profile_id text references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, profile_id)
);

-- ---------- Auto-create member row on signup ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.members (id, email, name, gender)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'gender'
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Admin helper (security definer avoids recursive RLS) ----------
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select coalesce((select is_admin from public.members where id = auth.uid()), false)
$$;

-- ---------- Row Level Security ----------
alter table public.members enable row level security;
alter table public.profiles enable row level security;
alter table public.offers enable row level security;
alter table public.payments enable row level security;
alter table public.interests_sent enable row level security;

-- members: see/edit own row; admin sees & edits everyone (needed to activate plans)
create policy members_select on public.members for select
  using (id = auth.uid() or public.is_admin());
create policy members_update on public.members for update
  using (id = auth.uid() or public.is_admin());

-- profiles: anyone (even logged out) sees VERIFIED profiles;
-- owners also see their own pending ones; admin sees all
create policy profiles_select on public.profiles for select
  using (verified or created_by = auth.uid() or public.is_admin());
create policy profiles_insert on public.profiles for insert
  with check (created_by = auth.uid());
create policy profiles_update on public.profiles for update
  using (created_by = auth.uid() or public.is_admin());
create policy profiles_delete on public.profiles for delete
  using (created_by = auth.uid() or public.is_admin());

-- offers: public read; only admin manages
create policy offers_select on public.offers for select using (true);
create policy offers_insert on public.offers for insert with check (public.is_admin());
create policy offers_update on public.offers for update using (public.is_admin());
create policy offers_delete on public.offers for delete using (public.is_admin());

-- payments: members see their own; admin sees all; only admin can update (approve cash)
create policy payments_select on public.payments for select
  using (user_id = auth.uid() or public.is_admin());
create policy payments_insert on public.payments for insert
  with check (user_id = auth.uid());
create policy payments_update on public.payments for update
  using (public.is_admin());

-- interests: your own only
create policy interests_select on public.interests_sent for select using (user_id = auth.uid());
create policy interests_insert on public.interests_sent for insert with check (user_id = auth.uid());
create policy interests_delete on public.interests_sent for delete using (user_id = auth.uid());
