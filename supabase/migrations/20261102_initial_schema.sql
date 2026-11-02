-- Migration: 20261102_initial_schema.sql
-- Description: Initial schema for Language Learning Progress Tracker

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  language text not null,
  current_level text not null check (current_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  target_level text not null check (target_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  learning_start_date date not null default current_date,
  daily_study_goal_minutes integer not null default 30,
  daily_vocab_goal integer not null default 5,
  daily_grammar_goal integer not null default 1,
  timezone text not null default 'UTC',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. STUDY SESSIONS TABLE
create table if not exists public.study_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  study_date date not null default current_date,
  start_time text,
  end_time text,
  duration_minutes integer not null check (duration_minutes > 0),
  activity text not null,
  skill text not null check (skill in ('Vocabulary', 'Grammar', 'Reading', 'Listening', 'Speaking', 'Writing')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists study_sessions_user_id_date_idx on public.study_sessions(user_id, study_date desc);
create index if not exists study_sessions_skill_idx on public.study_sessions(user_id, skill);

-- 3. VOCABULARY TABLE
create table if not exists public.vocabulary (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  word text not null,
  category text not null default 'General',
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  status text not null check (status in ('Not started', 'Learning', 'Mastered')),
  date_added date not null default current_date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists vocabulary_user_id_status_idx on public.vocabulary(user_id, status);
create index if not exists vocabulary_user_id_cat_idx on public.vocabulary(user_id, category);

-- 4. GRAMMAR TOPICS TABLE
create table if not exists public.grammar_topics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  topic text not null,
  category text not null default 'General',
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  status text not null check (status in ('Not started', 'Learning', 'Completed')),
  date_added date not null default current_date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists grammar_user_id_status_idx on public.grammar_topics(user_id, status);

-- 5. SKILL PROGRESS TABLE
create table if not exists public.skill_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  skill text not null check (skill in ('Reading', 'Listening', 'Speaking', 'Writing')),
  current_level text not null check (current_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  target_level text not null check (target_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  progress_percentage integer not null check (progress_percentage >= 0 and progress_percentage <= 100),
  notes text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, skill)
);

-- 6. GOALS TABLE
create table if not exists public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  goal_type text not null check (goal_type in ('daily', 'weekly', 'monthly', 'custom')),
  target_value numeric not null check (target_value > 0),
  measurement_type text not null check (measurement_type in ('minutes', 'hours', 'words', 'topics', 'sessions', 'percentage')),
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'custom')),
  skill text,
  start_date date not null default current_date,
  end_date date,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. GOAL PROGRESS RECORDS TABLE
create table if not exists public.goal_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  goal_id uuid references public.goals on delete cascade not null,
  date date not null default current_date,
  actual_value numeric not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. PLANNED ACTIVITIES TABLE
create table if not exists public.planned_activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  activity text not null,
  skill text not null check (skill in ('Vocabulary', 'Grammar', 'Reading', 'Listening', 'Speaking', 'Writing')),
  planned_date date not null default current_date,
  planned_duration integer not null default 30,
  priority text not null check (priority in ('Low', 'Medium', 'High')),
  notes text,
  completed boolean not null default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. REST DAYS TABLE
create table if not exists public.rest_days (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  rest_date date not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, rest_date)
);

-- 10. USER SETTINGS TABLE
create table if not exists public.settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  theme text not null default 'light' check (theme in ('light', 'dark')),
  notifications_enabled boolean not null default false,
  reminder_streak boolean not null default true,
  reminder_daily_goal boolean not null default true,
  reminder_time text not null default '20:00',
  timezone text not null default 'UTC',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.profiles enable row level security;
alter table public.study_sessions enable row level security;
alter table public.vocabulary enable row level security;
alter table public.grammar_topics enable row level security;
alter table public.skill_progress enable row level security;
alter table public.goals enable row level security;
alter table public.goal_progress enable row level security;
alter table public.planned_activities enable row level security;
alter table public.rest_days enable row level security;
alter table public.settings enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can view own study sessions" on public.study_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own study sessions" on public.study_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own study sessions" on public.study_sessions for update using (auth.uid() = user_id);
create policy "Users can delete own study sessions" on public.study_sessions for delete using (auth.uid() = user_id);

create policy "Users can view own vocabulary" on public.vocabulary for select using (auth.uid() = user_id);
create policy "Users can insert own vocabulary" on public.vocabulary for insert with check (auth.uid() = user_id);
create policy "Users can update own vocabulary" on public.vocabulary for update using (auth.uid() = user_id);
create policy "Users can delete own vocabulary" on public.vocabulary for delete using (auth.uid() = user_id);

create policy "Users can view own grammar" on public.grammar_topics for select using (auth.uid() = user_id);
create policy "Users can insert own grammar" on public.grammar_topics for insert with check (auth.uid() = user_id);
create policy "Users can update own grammar" on public.grammar_topics for update using (auth.uid() = user_id);
create policy "Users can delete own grammar" on public.grammar_topics for delete using (auth.uid() = user_id);

create policy "Users can view own skill progress" on public.skill_progress for select using (auth.uid() = user_id);
create policy "Users can insert own skill progress" on public.skill_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own skill progress" on public.skill_progress for update using (auth.uid() = user_id);
create policy "Users can delete own skill progress" on public.skill_progress for delete using (auth.uid() = user_id);

create policy "Users can view own goals" on public.goals for select using (auth.uid() = user_id);
create policy "Users can insert own goals" on public.goals for insert with check (auth.uid() = user_id);
create policy "Users can update own goals" on public.goals for update using (auth.uid() = user_id);
create policy "Users can delete own goals" on public.goals for delete using (auth.uid() = user_id);

create policy "Users can view own goal progress" on public.goal_progress for select using (auth.uid() = user_id);
create policy "Users can insert own goal progress" on public.goal_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own goal progress" on public.goal_progress for update using (auth.uid() = user_id);
create policy "Users can delete own goal progress" on public.goal_progress for delete using (auth.uid() = user_id);

create policy "Users can view own planned activities" on public.planned_activities for select using (auth.uid() = user_id);
create policy "Users can insert own planned activities" on public.planned_activities for insert with check (auth.uid() = user_id);
create policy "Users can update own planned activities" on public.planned_activities for update using (auth.uid() = user_id);
create policy "Users can delete own planned activities" on public.planned_activities for delete using (auth.uid() = user_id);

create policy "Users can view own rest days" on public.rest_days for select using (auth.uid() = user_id);
create policy "Users can insert own rest days" on public.rest_days for insert with check (auth.uid() = user_id);
create policy "Users can update own rest days" on public.rest_days for update using (auth.uid() = user_id);
create policy "Users can delete own rest days" on public.rest_days for delete using (auth.uid() = user_id);

create policy "Users can view own settings" on public.settings for select using (auth.uid() = user_id);
create policy "Users can insert own settings" on public.settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings" on public.settings for update using (auth.uid() = user_id);
