# SEO Content Pipeline — Project Checklist
**โปรเจค:** AI SEO Generation Web App (Best Solutions Corp)
**อัพเดทล่าสุด:** 2026-03-10

---

## Overall Progress: 7 / 38 tasks (18%)

---

## Phase 1 — Foundation (สัปดาห์ 1-2)
**Progress: 7 / 9**

- [x] Next.js 15 project setup + Tailwind CSS (2026-03-10)
- [x] Supabase connection + environment variables (2026-03-10)
- [x] สร้าง `keywords` table SQL migration (2026-03-10) ✅ run แล้ว
- [x] สร้าง `articles` table SQL migration (2026-03-10) ✅ run แล้ว
- [x] Dashboard page — accordion by cluster + progress bars + filter + search (2026-03-10)
- [x] Add single keyword — modal form (2026-03-10)
- [x] CSV Import — 3-step wizard (upload → preview → confirm) (2026-03-10)
- [x] Seed 75 keywords จาก keywords.md เข้า DB (2026-03-10) ✅ 75/75 ครบทุก cluster
- [ ] Auth ด้วย Supabase Auth (email magic link)

> **Phase 1 subtotal: 7 / 9**

---

## Phase 2 — AI Pipeline (สัปดาห์ 3-4)
**Progress: 0 / 5**

- [ ] Brief generation API Route (`POST /api/ai/brief`) + streaming
- [ ] Brief streaming UI + Brief Editor (approve/regenerate)
- [ ] Article generation API Route (`POST /api/ai/article`) + streaming
- [ ] Article streaming UI + real-time word count
- [ ] Prompt Caching สำหรับ system prompts (brief agent + writer agent)
- [ ] Internal links auto-insert (embed ใน writer system prompt)
- [ ] Token usage tracking + บันทึกลง `articles.token_usage`

> **Phase 2 subtotal: 0 / 7**

---

## Phase 3 — Editor + Publish (สัปดาห์ 5-6)
**Progress: 0 / 9**

- [ ] Markdown editor — split view (source + preview)
- [ ] Frontmatter panel — title, meta_title, meta_description, excerpt, tags
- [ ] Character count + SERP preview สำหรับ meta fields
- [ ] SEO Checklist real-time (8 items ตาม FR-13)
- [ ] Cover image prompt generator (`POST /api/ai/cover-prompt`)
- [ ] Cover image upload → WebP conversion (sharp) → Supabase Storage
- [ ] Publish flow — Markdown → HTML conversion (ตัด H1 + json-ld block ออก)
- [ ] Publish API (`POST /api/publish`) — POST/PATCH ไป Supabase `blog_posts`
- [ ] Publish confirmation dialog + success/error state

> **Phase 3 subtotal: 0 / 9**

---

## Phase 4 — Polish (สัปดาห์ 7)
**Progress: 0 / 4**

- [ ] Cost tracking — token usage per article dashboard
- [ ] Auto-save draft ทุก 30 วินาที
- [ ] Error handling ครบ (API timeout, Supabase error, streaming error)
- [ ] Deploy บน Vercel + environment variables setup

> **Phase 4 subtotal: 0 / 4**

---

## API Routes Checklist
**Progress: 0 / 12**

### Keyword Management
- [ ] `GET  /api/keywords` — list + filter
- [ ] `POST /api/keywords` — add single keyword
- [ ] `POST /api/keywords/import` — bulk CSV import
- [ ] `GET  /api/keywords/template` — download CSV template
- [ ] `PATCH /api/keywords/[id]` — update status

### AI Pipeline
- [ ] `POST /api/ai/brief` — generate brief (streaming)
- [ ] `POST /api/ai/article` — generate article (streaming)
- [ ] `POST /api/ai/cover-prompt` — generate cover image prompt

### Article Management
- [ ] `GET  /api/articles` — list articles
- [ ] `GET  /api/articles/[slug]` — get detail
- [ ] `PATCH /api/articles/[slug]` — update draft

### Publishing
- [ ] `POST /api/upload/cover` — upload + WebP + Supabase Storage
- [ ] `POST /api/publish` — publish to Supabase blog_posts

> **API subtotal: 0 / 13**

---

## Pages Checklist
**Progress: 0 / 6**

- [ ] `/dashboard` — Keyword Dashboard (หน้าหลัก)
- [ ] `/articles/new?keyword=[id]` — เริ่ม workflow ใหม่
- [ ] `/articles/[slug]/brief` — Brief Review + Approve
- [ ] `/articles/[slug]/edit` — Markdown Editor + SEO Checklist
- [ ] `/articles/[slug]/publish` — Publish Preview + Confirm
- [ ] Redirect `/` → `/dashboard`

> **Pages subtotal: 0 / 6**

---

## Database Checklist
**Progress: 0 / 4**

- [ ] `keywords` table — migration + indexes
- [ ] `articles` table — migration + indexes
- [ ] Row Level Security (RLS) policies
- [ ] Seed 75 keywords จาก keywords.md

> **DB subtotal: 0 / 4**

---

## Notes

- คาดการณ์ cost ≤ 25 บาท/บทความ (ลดจาก ~38 บาท ด้วย Prompt Caching)
- ห้ามส่ง field `status` ไป Supabase `blog_posts` (ไม่มีใน schema)
- Cover image path format: `blog-covers/[ascii-slug].webp`
- Status flow: `pending → generating-brief → brief-ready → generating-article → draft → review → published`
