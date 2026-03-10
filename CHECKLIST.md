# SEO Content Pipeline — Project Checklist
**โปรเจค:** AI SEO Generation Web App (Best Solutions Corp)
**อัพเดทล่าสุด:** 2026-03-10

---

## Overall Progress: 37 / 38 tasks (97%)

---

## Phase 1 — Foundation (สัปดาห์ 1-2)
**Progress: 9 / 9** ✅ COMPLETE

- [x] Next.js 15 project setup + Tailwind CSS (2026-03-10)
- [x] Supabase connection + environment variables (2026-03-10)
- [x] สร้าง `keywords` table SQL migration (2026-03-10) ✅ run แล้ว
- [x] สร้าง `articles` table SQL migration (2026-03-10) ✅ run แล้ว
- [x] Dashboard page — accordion by cluster + progress bars + filter + search (2026-03-10)
- [x] Add single keyword — modal form (2026-03-10)
- [x] CSV Import — 3-step wizard (upload → preview → confirm) (2026-03-10)
- [x] Seed 75 keywords จาก keywords.md เข้า DB (2026-03-10) ✅ 75/75 ครบทุก cluster
- [x] Auth ด้วย Supabase Auth (email magic link) (2026-03-10) ✅ middleware + /login + /auth/callback

> **Phase 1 subtotal: 9 / 9**

---

## Phase 2 — AI Pipeline (สัปดาห์ 3-4)
**Progress: 7 / 7** ✅ COMPLETE

- [x] Brief generation API Route (`POST /api/ai/brief`) + streaming (2026-03-10)
- [x] Brief streaming UI + Brief Editor (approve/regenerate) (2026-03-10)
- [x] Article generation API Route (`POST /api/ai/article`) + streaming (2026-03-10)
- [x] Article streaming UI + real-time word count (2026-03-10)
- [x] Prompt Caching สำหรับ system prompts (brief agent + writer agent) (2026-03-10)
- [x] Internal links auto-insert (embed ใน writer system prompt) (2026-03-10)
- [x] Token usage tracking + บันทึกลง `articles.token_usage` (2026-03-10)

> **Phase 2 subtotal: 7 / 7**

---

## Phase 3 — Editor + Publish (สัปดาห์ 5-6)
**Progress: 9 / 9** ✅ COMPLETE

- [x] Markdown editor — split view (source + preview) (2026-03-10)
- [x] Frontmatter panel — title, meta_title, meta_description, excerpt, tags (2026-03-10)
- [x] Character count + SERP preview สำหรับ meta fields (2026-03-10)
- [x] SEO Checklist real-time (8 items ตาม FR-13) (2026-03-10)
- [x] Cover image prompt generator (`POST /api/ai/cover-prompt`) (2026-03-10)
- [x] Cover image upload → WebP conversion (sharp) → Supabase Storage (2026-03-10)
- [x] Publish flow — Markdown → HTML conversion (ตัด H1 + json-ld block ออก) (2026-03-10)
- [x] Publish API (`POST /api/publish`) — POST/PATCH ไป Supabase `blog_posts` (2026-03-10)
- [x] Publish confirmation dialog + success/error state (2026-03-10)

> **Phase 3 subtotal: 9 / 9**

---

## Phase 4 — Polish (สัปดาห์ 7)
**Progress: 3 / 4**

- [x] Cost tracking — token usage per article dashboard (2026-03-10)
- [x] Auto-save draft ทุก 30 วินาที (2026-03-10)
- [x] Error handling ครบ (API timeout, Supabase error, streaming error) (2026-03-10)
- [ ] Deploy บน Vercel + environment variables setup

> **Phase 4 subtotal: 3 / 4**

---

## API Routes Checklist
**Progress: 0 / 12**

### Keyword Management
- [x] `GET  /api/keywords` — list + filter
- [x] `POST /api/keywords` — add single keyword
- [x] `POST /api/keywords/import` — bulk CSV import
- [x] `GET  /api/keywords/template` — download CSV template
- [x] `PATCH /api/keywords/[id]` — update status

### AI Pipeline
- [x] `POST /api/ai/brief` — generate brief (streaming)
- [x] `POST /api/ai/article` — generate article (streaming)
- [x] `POST /api/ai/cover-prompt` — generate cover image prompt

### Article Management
- [x] `GET  /api/articles` — list articles
- [x] `GET  /api/articles/[slug]` — get detail
- [x] `PATCH /api/articles/[slug]` — update draft

### Publishing
- [x] `POST /api/upload/cover` — upload + WebP + Supabase Storage
- [x] `POST /api/publish` — publish to Supabase blog_posts

> **API subtotal: 12 / 13**

---

## Pages Checklist
**Progress: 0 / 6**

- [x] `/dashboard` — Keyword Dashboard (หน้าหลัก)
- [x] `/articles/new?keyword=[id]` — เริ่ม workflow ใหม่
- [x] `/articles/[slug]/brief` — Brief Review + Approve
- [x] `/articles/[slug]/edit` — Markdown Editor + SEO Checklist
- [x] `/articles/[slug]/publish` — Publish dialog inside edit page
- [x] Redirect `/` → `/dashboard`

> **Pages subtotal: 5 / 6**

---

## Database Checklist
**Progress: 0 / 4**

- [x] `keywords` table — migration + indexes
- [x] `articles` table — migration + indexes
- [ ] Row Level Security (RLS) policies
- [x] Seed 75 keywords จาก keywords.md

> **DB subtotal: 3 / 4**

---

## Notes

- คาดการณ์ cost ≤ 25 บาท/บทความ (ลดจาก ~38 บาท ด้วย Prompt Caching)
- ห้ามส่ง field `status` ไป Supabase `blog_posts` (ไม่มีใน schema)
- Cover image path format: `blog-covers/[ascii-slug].webp`
- Status flow: `pending → generating-brief → brief-ready → generating-article → draft → review → published`
