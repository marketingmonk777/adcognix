-- AdCognix · Stage 1 schema (Supabase / Postgres). Safe to re-run.
create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text, is_admin boolean not null default false,
  created_at timestamptz not null default now());

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  category text not null, city text not null check (char_length(city) between 2 and 60),
  phone text not null check (phone ~ '^\+[0-9]{10,15}$'),
  website text, brand_color text not null default '#2F5BFF' check (brand_color ~ '^#[0-9A-Fa-f]{6}$'),
  logo_url text, goal text default 'leads', monthly_budget integer check (monthly_budget >= 1000),
  settings jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users default auth.uid(),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists business_members (
  business_id uuid references businesses on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(), primary key (business_id, user_id));
create index if not exists business_members_user on business_members(user_id);

create table if not exists consult_requests (
  id uuid primary key default gen_random_uuid(),
  business_name text not null check (char_length(business_name) between 2 and 120),
  phone text not null check (phone ~ '^\+[0-9]{10,15}$'),
  city text check (char_length(city) <= 60), message text check (char_length(message) <= 1000),
  source text default 'website', status text not null default 'new',
  created_at timestamptz not null default now());

create table if not exists ai_usage (
  id bigserial primary key, business_id uuid references businesses on delete cascade, user_id uuid default auth.uid(),
  task text, provider text, model text, input_tokens int, output_tokens int, cost_usd numeric(10,6), ok boolean,
  created_at timestamptz not null default now());

create table if not exists audit_log (
  id bigserial primary key, user_id uuid default auth.uid(), business_id uuid,
  action text not null, meta jsonb default '{}'::jsonb, created_at timestamptz not null default now());

-- helpers
create or replace function is_admin() returns boolean language sql stable security definer set search_path = public as
  $$ select coalesce((select is_admin from profiles where id = auth.uid()), false) $$;
create or replace function is_member(b uuid) returns boolean language sql stable security definer set search_path = public as
  $$ select exists(select 1 from business_members where business_id = b and user_id = auth.uid()) $$;

create or replace function touch() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists businesses_touch on businesses;
create trigger businesses_touch before update on businesses for each row execute function touch();

-- new auth user -> profile
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as
$$ begin insert into profiles(id) values (new.id) on conflict do nothing; return new; end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- create business + owner membership atomically
create or replace function create_business(p jsonb) returns businesses language plpgsql security definer set search_path = public as $$
declare b businesses;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into businesses(name, category, city, phone, website, brand_color, goal, monthly_budget, settings)
  values (p->>'name', p->>'category', p->>'city', p->>'phone', nullif(p->>'website',''), coalesce(p->>'brand_color','#2F5BFF'),
          coalesce(p->>'goal','leads'), (p->>'monthly_budget')::int, coalesce(p->'settings','{}'::jsonb)) returning * into b;
  insert into business_members values (b.id, auth.uid(), 'owner');
  insert into audit_log(business_id, action) values (b.id, 'business.create');
  return b;
end $$;

-- Row Level Security
alter table profiles enable row level security;
alter table businesses enable row level security;
alter table business_members enable row level security;
alter table consult_requests enable row level security;
alter table ai_usage enable row level security;
alter table audit_log enable row level security;

drop policy if exists p_self on profiles; create policy p_self on profiles for select using (id = auth.uid() or is_admin());
drop policy if exists p_upd on profiles; create policy p_upd on profiles for update using (id = auth.uid()) with check (id = auth.uid() and is_admin = (select is_admin from profiles where id = auth.uid()));
drop policy if exists b_sel on businesses; create policy b_sel on businesses for select using (is_member(id) or is_admin());
drop policy if exists b_upd on businesses; create policy b_upd on businesses for update using (is_member(id)) with check (is_member(id));
drop policy if exists m_sel on business_members; create policy m_sel on business_members for select using (user_id = auth.uid() or is_member(business_id) or is_admin());
drop policy if exists c_ins on consult_requests; create policy c_ins on consult_requests for insert to anon, authenticated with check (status = 'new');
drop policy if exists c_sel on consult_requests; create policy c_sel on consult_requests for select using (is_admin());
drop policy if exists c_upd on consult_requests; create policy c_upd on consult_requests for update using (is_admin());
drop policy if exists u_ins on ai_usage; create policy u_ins on ai_usage for insert to authenticated with check (is_member(business_id));
drop policy if exists u_sel on ai_usage; create policy u_sel on ai_usage for select using (is_member(business_id) or is_admin());
drop policy if exists a_ins on audit_log; create policy a_ins on audit_log for insert to authenticated with check (user_id = auth.uid());
drop policy if exists a_sel on audit_log; create policy a_sel on audit_log for select using (is_admin() or is_member(business_id));

-- Make yourself admin after first sign-in (run once, with your email):
-- update profiles set is_admin = true where id = (select id from auth.users where email = 'you@example.com');

-- ============================================================================================
-- Stage 2 · Campaigns (additive, safe to re-run). Ids are text so client-generated ids work.
-- ============================================================================================
create table if not exists campaigns (
  id text primary key default gen_random_uuid()::text,
  business_id uuid not null references businesses on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  objective text not null check (objective in ('leads','calls','messages','traffic','awareness','installs')),
  channels jsonb not null default '[]'::jsonb,
  daily_budget integer not null check (daily_budget between 100 and 500000),
  duration_days integer not null check (duration_days between 1 and 90),
  start_date date not null default current_date,
  status text not null default 'draft' check (status in ('draft','active','paused','ended','failed')),
  creative jsonb not null default '{}'::jsonb, copy jsonb not null default '{}'::jsonb, audience jsonb not null default '{}'::jsonb,
  publish jsonb, sim_days integer not null default 0, target_cpl integer, applied jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz);
create index if not exists campaigns_biz on campaigns(business_id, created_at desc);
alter table campaigns enable row level security;
drop policy if exists camp_all on campaigns;
create policy camp_all on campaigns for all using (is_member(business_id) or is_admin()) with check (is_member(business_id));
