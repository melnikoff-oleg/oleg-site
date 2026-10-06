-- /wasl-rebrand: people rate the ten name candidates for the Wasl Apps rebrand.
-- New tables only, prefixed `wasl_`, in the shared Boldane project, same shape as ubs_vote*.
-- RLS on with NO policies: only the service-role key used by the site's route handler gets in.

create table if not exists wasl_vote_submission (
  id          uuid primary key default gen_random_uuid(),
  voter_name  text not null check (char_length(voter_name) between 2 and 80),
  round       text not null default '2026-10-06',
  ip          text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create table if not exists wasl_vote (
  submission_id uuid not null references wasl_vote_submission(id) on delete cascade,
  name_id       text not null check (char_length(name_id) <= 60),
  rating        int  not null check (rating between 1 and 10),
  note          text check (note is null or char_length(note) <= 2000),
  created_at    timestamptz not null default now(),
  primary key (submission_id, name_id)
);

create index if not exists wasl_vote_name_idx on wasl_vote (name_id, created_at desc);

alter table wasl_vote_submission enable row level security;
alter table wasl_vote enable row level security;
