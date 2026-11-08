-- /fitness: Oleg logs each set (weight, reps) from the program page in the gym.
-- New tables only, prefixed `fit_`, in the shared Boldane project.
-- RLS on with NO policies: only the service-role key used by the site's route handler gets in.
-- Applied 2026-11-08 through the Supabase Management API.

create table if not exists fit_session (
  session_date date primary key,
  day_id       text not null,             -- tue..sun, the program's weekday id
  started_at   timestamptz,               -- "left home", the 90-minute clock starts here
  finished_at  timestamptz,
  note         text,                      -- how it felt, soreness, anything
  updated_at   timestamptz not null default now()
);

create table if not exists fit_set (
  session_date date not null references fit_session(session_date) on delete cascade,
  exercise_idx int  not null,             -- position in that day's list, 0-based
  movement_idx int  not null default 0,   -- 0, or the part of a superset / circuit
  set_idx      int  not null,             -- 0-based
  exercise     text not null,             -- name at the time of logging
  movement     text,                      -- movement name inside a superset
  weight       numeric,                   -- kg, null for bodyweight
  reps         numeric,                   -- reps, or seconds / minutes per `unit`
  unit         text not null default 'reps',
  updated_at   timestamptz not null default now(),
  primary key (session_date, exercise_idx, movement_idx, set_idx)
);

alter table fit_session enable row level security;
alter table fit_set     enable row level security;
