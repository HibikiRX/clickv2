-- Schéma appliqué sur le projet Supabase (déjà exécuté via migration).
create table public.confessions (
  id bigint generated always as identity primary key,
  body text not null check (char_length(body) between 1 and 300),
  status text not null check (status in ('posted','queued','failed')),
  error text,
  created_at timestamptz not null default now()
);
create table public.hits (ip_hash text not null, created_at timestamptz not null default now());
create index on public.hits (ip_hash, created_at desc);
alter table public.confessions enable row level security;
alter table public.hits enable row level security;
-- rate_ok(ip_hash) : 3 messages / 10 min par IP, 30 / min au total.
-- log_confession(body, status, error) : enregistre le message (SECURITY DEFINER, aucune lecture publique).
