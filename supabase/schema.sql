create extension if not exists pgcrypto;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.students
  add column if not exists photo_data_url text;

create table if not exists public.daily_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  student_name text not null,
  date_key date not null,
  total_score integer not null,
  max_score integer not null,
  medal text not null check (medal in ('gold', 'silver', 'bronze', 'practice')),
  completed_at timestamptz not null,
  share_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, date_key)
);

create table if not exists public.question_results (
  id uuid primary key default gen_random_uuid(),
  daily_result_id uuid not null references public.daily_results(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  student_name text not null,
  date_key date not null,
  question_index integer not null check (question_index >= 0),
  problem_id text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'stretch')),
  selected_choice_ids text[] not null,
  correct_choice_id text not null,
  attempts_used integer not null,
  solved boolean not null,
  elapsed_seconds numeric(8, 1) not null,
  attempt_points integer not null,
  speed_bonus integer not null,
  score integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (daily_result_id, question_index)
);

create index if not exists daily_results_student_date_idx
  on public.daily_results(student_id, date_key desc);

create index if not exists question_results_daily_idx
  on public.question_results(daily_result_id, question_index);

comment on table public.students is
  'Three Qs students. Names are normalized and intentionally act as the only login identity.';
comment on column public.students.name is
  'Display name typed by the student.';
comment on column public.students.name_key is
  'Lowercase normalized unique key for name-only login.';
comment on column public.students.photo_data_url is
  'Small client-resized profile image data URL. Intentionally editable by anyone who knows the student name.';

comment on table public.daily_results is
  'Completed Three Qs daily results, one row per student and Pacific date.';
comment on column public.daily_results.date_key is
  'Pacific calendar date for the daily challenge.';
comment on column public.daily_results.total_score is
  'Final daily score after attempt points and speed bonuses.';
comment on column public.daily_results.medal is
  'Daily medal bucket: gold, silver, bronze, or practice.';

comment on table public.question_results is
  'Finalized per-question results. A question is inserted only after it is correct, after a second attempt, or after the student asks for the explanation.';
comment on column public.question_results.question_index is
  'Zero-based position in the daily three-question set.';
comment on column public.question_results.selected_choice_ids is
  'Final list of answer choices tried, in order.';
comment on column public.question_results.elapsed_seconds is
  'Total seconds spent on this question before it was finalized.';

alter table public.students enable row level security;
alter table public.daily_results enable row level security;
alter table public.question_results enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.students to anon, authenticated;
grant select, insert on public.daily_results to anon, authenticated;
grant select, insert on public.question_results to anon, authenticated;
revoke delete on public.students from anon, authenticated;
revoke update, delete on public.daily_results from anon, authenticated;
revoke update, delete on public.question_results from anon, authenticated;

drop policy if exists "Enable read access for all users" on public.students;
create policy "Enable read access for all users"
  on public.students
  as permissive
  for select
  to public
  using (true);

drop policy if exists "Enable insert for all users" on public.students;
create policy "Enable insert for all users"
  on public.students
  as permissive
  for insert
  to public
  with check (true);

drop policy if exists "Enable profile updates for all users" on public.students;
create policy "Enable profile updates for all users"
  on public.students
  as permissive
  for update
  to public
  using (true)
  with check (true);

drop policy if exists "Enable read access for all users" on public.daily_results;
create policy "Enable read access for all users"
  on public.daily_results
  as permissive
  for select
  to public
  using (true);

drop policy if exists "Enable insert for all users" on public.daily_results;
create policy "Enable insert for all users"
  on public.daily_results
  as permissive
  for insert
  to public
  with check (true);

drop policy if exists "Enable read access for all users" on public.question_results;
create policy "Enable read access for all users"
  on public.question_results
  as permissive
  for select
  to public
  using (true);

drop policy if exists "Enable insert for all users" on public.question_results;
create policy "Enable insert for all users"
  on public.question_results
  as permissive
  for insert
  to public
  with check (true);
