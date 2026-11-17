-- Run this SQL in Supabase > SQL Editor.
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('about','skill','certificate','project','education','contact','resume')),
  title text not null,
  description text default '',
  tech text default '',
  file_url text,
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.portfolio_items enable row level security;
alter table public.admin_users enable row level security;

-- Everyone can read published portfolio content.
create policy "Public can read portfolio items"
on public.portfolio_items for select
using (true);

-- Only user IDs listed in admin_users can add, edit or delete.
create policy "Admins can insert portfolio items"
on public.portfolio_items for insert to authenticated
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Admins can update portfolio items"
on public.portfolio_items for update to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Admins can delete portfolio items"
on public.portfolio_items for delete to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Create a Storage bucket named portfolio-files in Supabase Storage and make it public.
-- Then add these storage policies. Upload/update/delete are restricted to admins.
insert into storage.buckets (id, name, public)
values ('portfolio-files', 'portfolio-files', true)
on conflict (id) do update set public = true;

create policy "Public can view portfolio files"
on storage.objects for select
using (bucket_id = 'portfolio-files');

create policy "Admins can upload portfolio files"
on storage.objects for insert to authenticated
with check (bucket_id = 'portfolio-files' and exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Admins can update portfolio files"
on storage.objects for update to authenticated
using (bucket_id = 'portfolio-files' and exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Admins can delete portfolio files"
on storage.objects for delete to authenticated
using (bucket_id = 'portfolio-files' and exists (select 1 from public.admin_users where user_id = auth.uid()));
