-- WorkFlow Pro — Supabase Schema
-- Run this in your Supabase SQL Editor

create table if not exists projects (
  id uuid primary key,
  workflow_category text not null,
  title text not null,
  description text,
  status text default 'active',
  due_date date,
  value numeric,
  agency text,
  solicitation_number text,
  naics_code text,
  set_aside text,
  bond_required boolean default false,
  bond_amount numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists stages (
  id uuid primary key,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  color text default '#6366f1',
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key,
  stage_id uuid references stages(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  status text default 'todo',
  priority text default 'medium',
  due_date date,
  assigned_to text,
  contact_id uuid,
  amount numeric,
  notes text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists contacts (
  id uuid primary key,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  company text,
  role text,
  email text,
  phone text,
  type text default 'other',
  notes text,
  created_at timestamptz default now()
);

-- Row Level Security (optional — add auth later)
alter table projects enable row level security;
alter table stages   enable row level security;
alter table tasks    enable row level security;
alter table contacts enable row level security;

-- Allow all access for now (tighten with auth later)
create policy "allow_all_projects" on projects for all using (true) with check (true);
create policy "allow_all_stages"   on stages   for all using (true) with check (true);
create policy "allow_all_tasks"    on tasks     for all using (true) with check (true);
create policy "allow_all_contacts" on contacts  for all using (true) with check (true);

-- Enable realtime
alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table stages;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table contacts;
