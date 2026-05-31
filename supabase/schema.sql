-- Supabase SQL — à coller dans l'éditeur SQL de votre projet Supabase
-- Table principale des véhicules

create table if not exists vehicles (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),

  immat        text not null,
  model        text not null,
  assurance    text,
  date_assurance date,
  date_sinistre  date,
  conducteur   text,
  tel          text,
  commentaire  text,

  ct_ok        boolean default false,
  cg_ok        boolean default false,
  entretien_ok boolean default false
);

-- Mise à jour automatique de updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger vehicles_updated_at
  before update on vehicles
  for each row execute function update_updated_at();

-- Row Level Security (désactivé pour simplifier, à activer si auth)
alter table vehicles enable row level security;

-- Politique publique pour démo (à restreindre avec auth en production)
create policy "allow_all" on vehicles for all using (true) with check (true);
