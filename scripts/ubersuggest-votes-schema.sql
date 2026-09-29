-- /ubersuggest-feed/rate: people rate the Ubersuggest LinkedIn drafts.
-- New tables only, prefixed `ubs_` like the /ideas board's `yt_` tables, in the shared Boldane project.
-- RLS on with NO policies: only the service-role key used by the site's route handler gets in.

create table if not exists ubs_vote_submission (
  id          uuid primary key default gen_random_uuid(),
  voter_name  text not null check (char_length(voter_name) between 2 and 80),
  round       text not null default '2026-09-29',
  ip          text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create table if not exists ubs_vote (
  submission_id uuid not null references ubs_vote_submission(id) on delete cascade,
  post_id       text not null check (char_length(post_id) <= 60),
  rating        int  not null check (rating between 1 and 10),
  note          text check (note is null or char_length(note) <= 2000),
  created_at    timestamptz not null default now(),
  primary key (submission_id, post_id)
);

create index if not exists ubs_vote_post_idx on ubs_vote (post_id, created_at desc);

alter table ubs_vote_submission enable row level security;
alter table ubs_vote enable row level security;
