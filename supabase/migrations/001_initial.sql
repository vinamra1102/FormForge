-- FormForge initial schema.
-- Note: `id` is text, not uuid — FormForge generates its own form ids
-- (e.g. "form_ab12cd34") in the client and they must round-trip unchanged.

-- Helper to get the Clerk user id from the request JWT.
create or replace function requesting_user_id()
returns text as $$
  select nullif(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::text;
$$ language sql stable;

create table public.forms (
  id           text primary key,
  user_id      text not null,           -- Clerk user id
  title        text not null default 'Untitled Form',
  description  text,
  schema       jsonb not null,
  version      integer not null default 1,
  saved_at     timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.forms enable row level security;

create policy "Users can only access their own forms"
  on public.forms for all
  using (user_id = requesting_user_id())
  with check (user_id = requesting_user_id());

create index forms_user_id_idx on public.forms(user_id);
create index forms_updated_at_idx on public.forms(updated_at desc);
