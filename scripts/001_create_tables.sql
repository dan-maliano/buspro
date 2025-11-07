-- Create profiles table for user management
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Create questions table
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  question_text text not null,
  question_image_url text,
  category text not null,
  correct_answer text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  explanation text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Questions table is public read-only (no auth required)
alter table public.questions enable row level security;
create policy "questions_select_all" on public.questions for select using (true);

-- Create exam_sessions table to track user exam attempts
create table if not exists public.exam_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_type text not null, -- 'simulation', 'practice', 'errors'
  start_time timestamp with time zone default timezone('utc'::text, now()) not null,
  end_time timestamp with time zone,
  time_limit_seconds integer, -- NULL for unlimited
  score integer,
  total_questions integer not null,
  passed boolean,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.exam_sessions enable row level security;

create policy "exam_sessions_select_own"
  on public.exam_sessions for select
  using (auth.uid() = user_id);

create policy "exam_sessions_insert_own"
  on public.exam_sessions for insert
  with check (auth.uid() = user_id);

create policy "exam_sessions_update_own"
  on public.exam_sessions for update
  using (auth.uid() = user_id);

-- Create user_answers table to track individual answers
create table if not exists public.user_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.exam_sessions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  user_answer text not null,
  is_correct boolean not null,
  time_spent_seconds integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_answers enable row level security;

create policy "user_answers_select_via_session"
  on public.user_answers for select
  using (
    exists (
      select 1 from public.exam_sessions
      where exam_sessions.id = user_answers.session_id
      and exam_sessions.user_id = auth.uid()
    )
  );

create policy "user_answers_insert_via_session"
  on public.user_answers for insert
  with check (
    exists (
      select 1 from public.exam_sessions
      where exam_sessions.id = user_answers.session_id
      and exam_sessions.user_id = auth.uid()
    )
  );

-- Create a function to automatically update updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add trigger for profiles updated_at
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();
