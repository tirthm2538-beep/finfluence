-- ========================================================
-- FinFluence: Supabase Production Database Schema (Phase 5)
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES & USER PROGRESSION
create table if not exists public.profiles (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users on delete cascade unique,
    username text unique,
    display_name text,
    avatar_url text,
    xp_points integer default 0,
    current_streak integer default 1,
    longest_streak integer default 1,
    last_active_date date default current_date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. COMPLETED CARDS & QUIZZES
create table if not exists public.completed_cards (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users on delete cascade not null,
    card_id text not null,
    track text not null,
    score integer default 10,
    completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, card_id)
);

-- 3. SAVED CARDS / BOOKMARKS
create table if not exists public.bookmarks (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users on delete cascade not null,
    card_id text not null,
    saved_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, card_id)
);

-- 4. SIMULATED PORTFOLIO (Business Tie-In Module)
create table if not exists public.virtual_portfolios (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users on delete cascade not null unique,
    cash_balance numeric(12, 2) default 100000.00,
    invested_amount numeric(12, 2) default 0.00,
    holdings jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
alter table public.profiles enable row level security;
alter table public.completed_cards enable row level security;
alter table public.bookmarks enable row level security;
alter table public.virtual_portfolios enable row level security;

-- Profiles: users can read all profiles, insert their own, and edit only their own
create policy "Public profiles are viewable by everyone" 
    on public.profiles for select using (true);

create policy "Users can insert own profile" 
    on public.profiles for insert with check (auth.uid() = user_id);

create policy "Users can update own profile" 
    on public.profiles for update using (auth.uid() = user_id);

-- Completed Cards: users can view and insert only their own
create policy "Users can view own completions" 
    on public.completed_cards for select using (auth.uid() = user_id);

create policy "Users can insert own completions" 
    on public.completed_cards for insert with check (auth.uid() = user_id);

-- Bookmarks: users can manage only their own
create policy "Users can manage own bookmarks" 
    on public.bookmarks for all using (auth.uid() = user_id);

-- Portfolios: users can view, insert, and update only their own
create policy "Users can manage own portfolio" 
    on public.virtual_portfolios for all 
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
