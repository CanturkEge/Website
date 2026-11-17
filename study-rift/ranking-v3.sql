-- Daily mastery uses service-graded submissions, never character XP or client score.
create table public.study_rift_exams (
 course text not null,
 exam_date date not null,
 questions jsonb not null check(jsonb_typeof(questions)='array' and jsonb_array_length(questions)=10),
 created_at timestamptz not null default now(),
 primary key(course,exam_date)
);
create table public.study_rift_attempts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.study_rift_profiles(user_id) on delete cascade,
 course text not null,
 exam_date date not null,
 cursor integer not null default 0 check(cursor between 0 and 10),
 score integer not null default 0 check(score between 0 and 200),
 correct integer not null default 0 check(correct between 0 and 10),
 answers jsonb not null default '[]'::jsonb,
 completed boolean not null default false,
 started_at timestamptz not null default now(),
 finished_at timestamptz,
 unique(user_id,course,exam_date),
 foreign key(course,exam_date) references public.study_rift_exams(course,exam_date)
);
create index study_rift_daily_ranking on public.study_rift_attempts(course,exam_date,score desc,correct desc) where completed;
alter table public.study_rift_exams enable row level security;
alter table public.study_rift_attempts enable row level security;
revoke all on public.study_rift_exams,public.study_rift_attempts from public,anon,authenticated;
grant all on public.study_rift_exams,public.study_rift_attempts to service_role;
comment on table public.study_rift_exams is 'Private frozen daily exam; answers are never exposed to normal clients before submission.';
comment on table public.study_rift_attempts is 'Service-only mastery attempts; skill, equipment, XP, hints and elapsed time do not affect score.';
