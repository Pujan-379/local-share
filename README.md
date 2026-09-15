# local-share

Anonymous, network-scoped content sharing. Anyone connected to the same WiFi can share text or files — no login, no signup. Your network *is* your identity.

Built as a learning project to explore Next.js App Router, Supabase, and realtime data sync.

## How it works

Every visitor's public IP address is hashed and used as a `network_key`. Posts are scoped to that key — so everyone behind the same router (same WiFi/office/cafe) sees the same shared space, and no one else does.

- **Shared note** — one live, auto-saving text note per network. Edits sync instantly across every device on that network via Supabase Realtime.
- **Files** — drag-and-drop, click-to-browse, or paste-to-upload. Download or delete anytime; anyone on the network can manage anything (fully open, no ownership model).

## Tech stack

- **Next.js** (App Router, TypeScript)
- **Supabase** — Postgres database, Storage (file uploads), Realtime (live sync)
- **Tailwind CSS**
- **Vercel** (deployment)

## Getting started

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Create a [Supabase](https://supabase.com) project.

3. In the Supabase SQL Editor, create the `posts` table:
   ```sql
   create table posts (
     id uuid primary key default gen_random_uuid(),
     network_key text not null,
     type text not null check (type in ('text', 'file')),
     content text not null,
     file_name text,
     file_size integer,
     mime_type text,
     created_at timestamptz not null default now()
   );

   create index posts_network_key_created_at_idx
     on posts (network_key, created_at desc);

   alter table posts enable row level security;

   create policy "Anyone can read posts" on posts for select using (true);
   create policy "Anyone can insert posts" on posts for insert with check (true);
   create policy "Anyone can update posts" on posts for update using (true);
   create policy "Anyone can delete posts" on posts for delete using (true);
   ```

4. In Supabase **Storage**, create a public bucket named `files`, then run:
   ```sql
   create policy "Anyone can upload files" on storage.objects for insert with check (bucket_id = 'files');
   create policy "Anyone can read files" on storage.objects for select using (bucket_id = 'files');
   ```

5. In Supabase **Database → Replication**, enable Realtime on the `posts` table.

6. Create `.env.local` in the project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

7. Run the dev server:
   ```bash
   npm run dev
   ```

## Notes

- Uses `x-forwarded-for` to identify the visitor's public IP; works when deployed (e.g. Vercel), and falls back to a shared `'unknown'` key during local development.
- File uploads are capped at 10 MB, enforced both client- and server-side.
- No accounts, no per-post ownership — deletion is open to anyone on the network by design.