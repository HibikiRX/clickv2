-- À exécuter une fois dans Supabase : SQL Editor > New query > Run.
-- Dans Authentication > Providers > Email, désactive "Confirm email" pour tester sans mail.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_.]{3,20}$'),
  question text not null default 'envoie-moi des messages anonymes !' check (char_length(question) <= 80),
  created_at timestamptz not null default now()
);

create table public.messages (
  id bigint generated always as identity primary key,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 300),
  created_at timestamptz not null default now()
);
create index on public.messages (recipient_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.messages enable row level security;

-- Profils : lisibles par tous (pour afficher la page d'envoi), modifiables par leur propriétaire.
create policy "profiles lisibles" on public.profiles for select using (true);
create policy "profil: créer le sien" on public.profiles for insert with check (auth.uid() = id);
create policy "profil: modifier le sien" on public.profiles for update using (auth.uid() = id);

-- Messages : seul le destinataire lit et supprime. Aucun insert direct : on passe par send_message().
create policy "messages: lire les siens" on public.messages for select using (auth.uid() = recipient_id);
create policy "messages: supprimer les siens" on public.messages for delete using (auth.uid() = recipient_id);

-- Envoi anonyme avec limite de débit : 20 messages / minute par destinataire.
create or replace function public.send_message(p_username text, p_body text)
returns void language plpgsql security definer set search_path = public as $$
declare rid uuid;
begin
  select id into rid from profiles where username = lower(p_username);
  if rid is null then raise exception 'unknown user'; end if;
  p_body := btrim(p_body);
  if char_length(p_body) not between 1 and 300 then raise exception 'invalid message'; end if;
  if (select count(*) from messages where recipient_id = rid and created_at > now() - interval '1 minute') >= 20 then
    raise exception 'rate limited';
  end if;
  insert into messages (recipient_id, body) values (rid, p_body);
end $$;

revoke all on function public.send_message(text, text) from public;
grant execute on function public.send_message(text, text) to anon, authenticated;
