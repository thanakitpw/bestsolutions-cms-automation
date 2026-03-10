-- Migration: Create keywords and articles tables
-- Run this in Supabase SQL Editor

-- ==========================================
-- Table: keywords
-- ==========================================
create table if not exists keywords (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  primary_keyword text not null,
  slug text unique not null,
  cluster text not null,
  content_type text not null check (content_type in ('Blog', 'Pillar Page', 'Landing Page')),
  priority text not null check (priority in ('High', 'Medium')),
  status text not null default 'pending' check (status in (
    'pending',
    'generating-brief',
    'brief-ready',
    'generating-article',
    'draft',
    'review',
    'published'
  )),
  article_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for faster cluster grouping
create index if not exists keywords_cluster_idx on keywords(cluster);
create index if not exists keywords_status_idx on keywords(status);
create index if not exists keywords_priority_idx on keywords(priority);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger keywords_updated_at
  before update on keywords
  for each row execute function update_updated_at();

-- ==========================================
-- Table: articles
-- ==========================================
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  keyword_id uuid references keywords(id) on delete set null,
  slug text unique not null,
  title text,
  primary_keyword text,
  cluster text,
  content_type text check (content_type in ('Blog', 'Pillar Page', 'Landing Page')),
  priority text check (priority in ('High', 'Medium')),
  status text not null default 'draft',
  brief_md text,
  content_md text,
  content_html text,
  meta_title text,
  meta_description text,
  excerpt text,
  tags text[],
  cover_image_url text,
  cover_image_prompt text,
  supabase_post_id uuid,
  token_usage jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_keyword_id_idx on articles(keyword_id);
create index if not exists articles_status_idx on articles(status);
create index if not exists articles_slug_idx on articles(slug);

create trigger articles_updated_at
  before update on articles
  for each row execute function update_updated_at();

-- ==========================================
-- RLS: Allow all for now (internal tool, 1 user)
-- ==========================================
alter table keywords enable row level security;
alter table articles enable row level security;

-- Temp: allow all operations (will tighten with auth later)
create policy "allow_all_keywords" on keywords for all using (true) with check (true);
create policy "allow_all_articles" on articles for all using (true) with check (true);
