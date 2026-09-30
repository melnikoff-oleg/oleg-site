-- /ubernatural: the übernatural founders rate their 30 LinkedIn post drafts.
-- New tables only, prefixed `ubn_`, in the shared Boldane project.
-- RLS on with NO policies: only the service-role key used by the site's route handler gets in.

create table if not exists ubn_vote_submission (
  id          uuid primary key default gen_random_uuid(),
  voter_name  text not null check (char_length(voter_name) between 2 and 80),
  round       text not null default '2026-09-30',
  ip          text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create table if not exists ubn_vote (
  submission_id uuid not null references ubn_vote_submission(id) on delete cascade,
  post_id       text not null check (char_length(post_id) <= 60),
  rating        int  check (rating is null or rating between 1 and 10),
  note          text check (note is null or char_length(note) <= 2000),
  created_at    timestamptz not null default now(),
  primary key (submission_id, post_id),
  check (rating is not null or note is not null)
);

create index if not exists ubn_vote_post_idx on ubn_vote (post_id, created_at desc);

alter table ubn_vote_submission enable row level security;
alter table ubn_vote enable row level security;
