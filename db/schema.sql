create extension if not exists pgcrypto;

create table if not exists quiz_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_slug text not null,
  email text not null,
  first_name text not null,
  last_name text not null,
  company text not null,
  job_title text not null default '',
  consent_marketing boolean not null default false,
  capture_position text not null check (capture_position in ('start', 'end')),
  answers jsonb not null,
  quiz_version text not null,
  score integer not null,
  raw_payload jsonb not null
);

create index if not exists quiz_submissions_event_slug_idx
  on quiz_submissions (event_slug);

create index if not exists quiz_submissions_email_idx
  on quiz_submissions (email);
