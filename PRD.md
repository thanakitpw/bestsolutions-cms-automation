# PRD — SEO Content Pipeline Web App
## Best Solutions Corp — Internal Tool (v1.0)

**วันที่:** 2026-03-08
**สถานะ:** Draft
**เวอร์ชัน:** 1.0 (Internal Tool — ใช้เองก่อน)

---

## 1. Overview

### 1.1 ปัญหาที่แก้

ปัจจุบัน workflow เขียนบทความ SEO ต้องรันผ่าน Claude Code CLI บนเครื่อง developer ทุกครั้ง ทำให้:
- ต้องมีคนที่รู้จัก terminal และ Claude Code ถึงจะใช้ได้
- ไม่มี UI ให้ตรวจบทความก่อน publish
- ไม่มี dashboard ติดตาม status บทความทั้งหมด
- Publish ขึ้น Supabase ต้องรันคำสั่งเองทุกครั้ง

### 1.2 เป้าหมาย

สร้าง web app สำหรับใช้งานภายใน (internal tool) ที่ทำให้ workflow ทั้งหมดทำได้ผ่าน browser:
กรอก keyword → AI เขียนบทความ → ตรวจและแก้ไข → กด Publish

### 1.3 Scope (v1.0 — Internal Only)

- ผู้ใช้ 1 คน (เจ้าของโปรเจค)
- ไม่มี multi-tenant, ไม่มี billing
- ไม่มี SERP analyzer — ใช้ keyword list ที่เตรียมไว้แล้ว
- เชื่อมต่อ Supabase เดิม (`blog_posts` table + `images` bucket)

---

## 2. Workflow ที่แก้ไขแล้ว (ตัด SERP ออก)

```
[เลือก keyword จาก list]
        |
        v
1. content-brief  ←  AI สร้าง brief จาก keyword + metadata
        |
        v
2. seo-writer     ←  AI เขียนบทความตาม brief (พร้อม internal links)
        |
        v
3. [ตรวจ + แก้ไขใน Editor]
        |
        v
4. cover-image    ←  AI สร้าง prompt รูปปก / Upload รูปที่มีอยู่
        |
        v
5. [กด Publish]  →  POST/PATCH ไป Supabase blog_posts
```

**เหตุที่ตัด SERP ออก:**
- มี keyword list ครบ 75 ตัวแล้ว พร้อม content type และ priority
- SERP analysis ใช้ token สูง (~45K tokens = ~38% ของ cost ต่อบทความ)
- Content brief สามารถ encode SEO best practices ได้โดยตรงโดยไม่ต้องวิเคราะห์ SERP real-time

---

## 3. User Stories

### Core Flow
| # | As a user, I want to... | So that... |
|---|---|---|
| US-01 | เห็น dashboard รายการ keyword ทั้งหมดพร้อม status | รู้ว่าบทความไหนเขียนแล้ว รออยู่ หรือ publish แล้ว |
| US-02 | คลิก keyword แล้วให้ AI สร้าง brief ให้อัตโนมัติ | ไม่ต้องเขียน brief เอง |
| US-03 | approve brief แล้วให้ AI เขียนบทความเลย | ได้บทความที่ตรงกับโครงสร้างที่ต้องการ |
| US-04 | แก้ไขบทความใน editor ก่อน publish | ปรับ tone หรือแก้ข้อมูลที่ AI เขียนผิด |
| US-05 | upload รูปปก แล้วให้ระบบ convert เป็น WebP และ upload ขึ้น Supabase Storage | ไม่ต้องรันสคริปต์ Python เอง |
| US-06 | กด Publish แล้วบทความขึ้นเว็บได้เลย | ไม่ต้องรัน curl command เอง |
| US-07 | เห็น real-time streaming ขณะ AI เขียนบทความ | รู้ว่าระบบกำลังทำงาน ไม่ต้องรอแบบ blind |

### Secondary
| # | As a user, I want to... | So that... |
|---|---|---|
| US-08 | ดู token usage และ cost ต่อบทความ | ติดตาม cost |
| US-09 | generate cover image prompt แล้ว copy ไปใช้ใน Gemini | สร้างรูปนอกระบบได้สะดวก |
| US-10 | แก้ไขบทความที่ publish แล้วและ re-publish | อัปเดตเนื้อหาได้ |

---

## 4. Functional Requirements

### 4.1 Keyword Dashboard

**FR-01 — Keyword List View**
- Dashboard หลัก = keyword list (ไม่แยกหน้า)
- แสดงแบบ accordion พับได้ตาม cluster
- แต่ละ cluster มี progress bar + "(X/12)"
- แต่ละแถว: title, content_type badge, priority badge, status badge, action button
- Filter: cluster, priority, status
- Search: ค้นหาจาก title หรือ primary_keyword
- Overall progress bar ด้านบน (เช่น 3/75 · 4%)

**FR-02 — Status Flow**
```
pending → generating-brief → brief-ready → generating-article
→ draft → review → published
```

**FR-02b — Action Button ตาม Status**
| Status | ปุ่ม | สี |
|---|---|---|
| pending | เริ่มเขียน | indigo (primary) |
| generating-brief | กำลังสร้าง Brief... | gray + spinner |
| brief-ready | Approve Brief | amber |
| generating-article | กำลังเขียน... | gray + spinner |
| draft | แก้ไข | secondary |
| review | ตรวจบทความ | orange |
| published | ดูบทความ ↗ | green + external link |

---

### 4.2 Keyword Management

**FR-03 — Add Single Keyword**
- ปุ่ม "+ Add Keyword" เปิด modal form
- Fields: title, primary_keyword, slug (auto-generate จาก keyword), cluster (select), content_type (select), priority (select)
- Validate: slug ต้อง unique
- บันทึกลง `keywords` table

**FR-04 — CSV Import**
- ปุ่ม "↑ Import CSV" เปิด modal (3 ขั้น):
  1. **Upload** — drag & drop หรือคลิกเลือกไฟล์ .csv
  2. **Preview** — ตารางแสดง 5 แถวแรก, สรุปจำนวน, highlight แถวที่มี slug ซ้ำ (warning)
  3. **Confirm** — "Import X keywords" (ข้าม slug ซ้ำอัตโนมัติ)
- CSV format:
  ```
  title,primary_keyword,slug,cluster,content_type,priority
  ```
- ดาวน์โหลด template CSV ได้จากในหน้า
- หลัง import: refresh list, แสดง toast "เพิ่ม X keywords แล้ว"

**FR-05 — Cluster Progress Overview**
- ด้านบน dashboard: overall progress bar
- แต่ละ cluster header: แสดง X/Y และ progress bar
- สีแตกต่างตาม status: published (เขียว), draft (เหลือง), pending (เทา)

---

### 4.3 Brief Generation

**FR-06 — Auto Brief**
- Input: primary keyword, content type, cluster, word limit, target audience
- ระบบส่ง prompt ไป Claude API และ stream response
- Output: structured brief พร้อม H1, H2/H3 outline, LSI keywords, word budget per section, CTA
- ใช้ Prompt Caching สำหรับ system prompt ของ brief agent

**FR-07 — Brief Editor**
- แสดง brief ที่ AI สร้างในรูปแบบที่แก้ไขได้ (textarea หรือ markdown editor)
- ปุ่ม "Approve Brief" เพื่อเริ่ม step ถัดไป
- ปุ่ม "Regenerate" เพื่อสร้างใหม่

---

### 4.4 Article Generation

**FR-08 — AI Writing with Streaming**
- รับ brief ที่ approve แล้วเป็น input
- Stream บทความออกมา real-time ผ่าน Server-Sent Events
- แสดง word count live ขณะ generate
- หยุดได้ถ้า word count เกิน limit

**FR-09 — Writing Rules (hard-coded ใน system prompt)**
- ห้ามใช้ ":" ในเนื้อหา
- ห้ามใช้ "สำหรับ SME" ใน heading
- ต้องมี Featured Snippet paragraph (40-60 คำ)
- ต้องมี FAQ 5 ข้อ + JSON-LD schema
- Internal links ตาม site-inventory

**FR-10 — Internal Links Auto-insert**
- ระบบ fetch site-inventory (cached) แล้วแนะนำ anchor text + URL
- Insert links อัตโนมัติหลังเขียนเสร็จ (ไม่ต้องเป็น agent แยก)
- ประหยัด 1 API round-trip เทียบกับ workflow เดิม

---

### 4.5 Editor

**FR-11 — Markdown Editor**
- Split view: Markdown source (ซ้าย) + Preview (ขวา)
- Syntax highlighting สำหรับ Markdown
- แสดง word count และ reading time
- Auto-save draft ทุก 30 วินาที

**FR-12 — Frontmatter Panel**
- Form fields แยกสำหรับ: title, meta_title, meta_description, excerpt, tags, cluster, content_type
- แสดง character count สำหรับ meta fields (limit: title 60 chars, desc 155 chars)
- Preview meta snippet เหมือน Google SERP

**FR-13 — SEO Checklist**
- Checklist real-time ตรวจ:
  - [ ] Primary keyword ใน 100 คำแรก
  - [ ] Primary keyword ใน H1
  - [ ] Featured Snippet paragraph มี (40-60 คำ)
  - [ ] มี FAQ section
  - [ ] มี internal links อย่างน้อย 2 ลิงก์
  - [ ] Meta title ≤ 60 chars
  - [ ] Meta description ≤ 155 chars
  - [ ] Word count อยู่ใน range ของ content type

---

### 4.6 Cover Image

**FR-14 — Cover Image Prompt Generator**
- รับ title + cluster → AI สร้าง image prompt ตาม CI style (deep navy + neon cyan)
- แสดง prompt ที่ copy ไปใช้ใน Gemini / Midjourney ได้เลย
- บันทึก cover_image_prompt ลงใน article record

**FR-15 — Cover Image Upload**
- Upload รูปจากเครื่อง (jpg/png/webp)
- ระบบ convert เป็น WebP quality=85 (ใช้ sharp library บน server)
- Upload ไป Supabase Storage bucket `images` path `blog-covers/[ascii-slug].webp`
- บันทึก cover_image URL ลงใน article record

---

### 4.7 Publish

**FR-16 — Publish to Supabase**
- แปลง Markdown → HTML ก่อน publish (ตัด H1 ออก, ตัด json-ld code block ออก)
- ถ้าบทความใหม่ → POST `/rest/v1/blog_posts`
- ถ้า update → PATCH `/rest/v1/blog_posts?slug=eq.[slug]`
- Payload: slug, title, excerpt, content (HTML), category, tags, author_name, cover_image, seo_title, seo_description, published_at: null
- ห้ามส่ง field `status` (ไม่มีใน schema)
- แสดง Supabase record ID หลัง publish สำเร็จ

**FR-17 — Publish Confirmation**
- แสดง preview ของ payload ก่อน publish
- ยืนยันด้วย dialog "Publish บทความนี้?"
- แสดง success/error state ชัดเจน

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Brief generation: streaming เริ่มแสดงผลภายใน 2 วินาที
- Article generation: streaming เริ่มแสดงผลภายใน 2 วินาที
- Cover image upload + convert + Supabase upload: ภายใน 10 วินาที
- Dashboard load: ภายใน 1 วินาที

### 5.2 Token Optimization
- **Prompt Caching** สำหรับ:
  - System prompt ของ brief agent (cache_control: ephemeral)
  - System prompt ของ writer agent
  - Site inventory (สำหรับ internal links)
  - Writing rules / guidelines
- คาดการณ์ลด cost ~35% เทียบกับ CLI workflow ปัจจุบัน

### 5.3 Cost Target
- Brief + Article generation: ≤ 25 บาท/บทความ (ลดจาก ~38 บาท)

---

## 6. Tech Stack

```
Framework:    Next.js 15 App Router
Language:     TypeScript
Database:     Supabase (Postgres + Storage + Auth)
AI:           Anthropic SDK (claude-sonnet-4-6)
Streaming:    Vercel AI SDK (useChat / streamText)
Editor:       @uiw/react-md-editor หรือ CodeMirror
Image:        sharp (WebP conversion บน Next.js API Route)
Styling:      Tailwind CSS + shadcn/ui
Hosting:      Vercel
```

---

## 7. Architecture

### 7.1 Database Schema

ใช้ Supabase ที่มีอยู่ + เพิ่ม 2 tables:

```sql
-- table สำหรับ keyword list (source of truth)
create table keywords (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  primary_keyword text not null,
  slug text unique not null,
  cluster text not null,
  content_type text not null,   -- Blog / Pillar Page / Landing Page
  priority text not null,       -- High / Medium
  status text default 'pending',
  -- 'pending' | 'generating-brief' | 'brief-ready'
  -- | 'generating-article' | 'draft' | 'review' | 'published'
  article_id uuid,              -- link ไป articles.id เมื่อเริ่มเขียน
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- table สำหรับ article draft management (แยกจาก blog_posts)
create table articles (
  id uuid primary key default gen_random_uuid(),
  keyword_id uuid references keywords(id),
  slug text unique not null,
  title text,
  primary_keyword text,
  cluster text,
  content_type text,
  priority text,
  status text default 'draft',
  brief_md text,              -- content brief (markdown)
  content_md text,            -- draft article (markdown)
  content_html text,          -- converted HTML (สำหรับ publish)
  meta_title text,
  meta_description text,
  excerpt text,
  tags text[],
  cover_image_url text,
  cover_image_prompt text,
  supabase_post_id uuid,      -- ID จาก blog_posts หลัง publish
  token_usage jsonb,          -- { brief: N, article: N, total: N }
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**Seed ครั้งแรก:** Import จาก keywords.md ทั้ง 75 rows เข้า `keywords` table ผ่าน CSV import หรือ SQL seed script

### 7.2 API Routes

```
-- Keyword Management
GET    /api/keywords              — list all keywords (filter: cluster, status, priority)
POST   /api/keywords              — add single keyword
POST   /api/keywords/import       — bulk import from CSV (parse + validate + insert)
GET    /api/keywords/template     — download CSV template
PATCH  /api/keywords/[id]         — update keyword status

-- AI Pipeline
POST   /api/ai/brief              — generate content brief (streaming)
POST   /api/ai/article            — generate article (streaming)
POST   /api/ai/cover-prompt       — generate cover image prompt

-- Article Management
GET    /api/articles              — list articles
GET    /api/articles/[slug]       — get article detail
PATCH  /api/articles/[slug]       — update draft

-- Publishing
POST   /api/upload/cover          — upload + convert image → WebP → Supabase Storage
POST   /api/publish               — POST/PATCH ไป Supabase blog_posts
```

### 7.3 Page Structure

```
/                              → redirect → /dashboard
/dashboard                     → Keyword Dashboard (list + filter + import + add)
/articles/new?keyword=[id]     → เริ่ม workflow ใหม่จาก keyword
/articles/[slug]/brief         → Brief Review + Approve
/articles/[slug]/edit          → Markdown Editor + SEO Checklist
/articles/[slug]/publish       → Publish Preview + Confirm
```

**Modals (ใน /dashboard):**
```
[+ Add Keyword]  → modal: form เพิ่ม keyword เดียว
[↑ Import CSV]   → modal: 3-step wizard (upload → preview → confirm)
```

### 7.4 AI Prompt Architecture

**Brief Agent System Prompt (cached):**
```
- Role: SEO Content Strategist
- Output: structured brief (H1, outline, word budget, LSI, CTA)
- Rules: ห้าม SERP data, ใช้ keyword + content type + cluster เป็น input เท่านั้น
- Tone: ภาษาไทย, เหมาะ SME ไทย
```

**Writer Agent System Prompt (cached):**
```
- Role: Thai SEO Content Writer
- Rules: ห้ามใช้ ":", ห้าม "สำหรับ SME" ใน heading, ย่อหน้าสั้น
- Must-have: Featured Snippet, FAQ + JSON-LD, internal links
- Word limit: ตาม content type (Pillar 2000-2500, Blog 1000-1500, Landing 800-1200)
```

---

## 8. UI Wireframes (Text)

### Dashboard
```
┌─────────────────────────────────────────────────────┐
│  SEO Dashboard          [Filter: All ▾] [Cluster ▾] │
├─────────────────────────────────────────────────────┤
│  AI & Automation (2/12)  ████░░░░░░ 17%             │
│                                                     │
│  ● AI Automation คืออะไร    Published  [View]       │
│  ● n8n คืออะไร              Published  [View]       │
│  ● Claude AI คืออะไร        Draft      [Edit]       │
│  ○ ระบบ AI Automation...    Pending    [Start]      │
│  ○ AI Chatbot คืออะไร...    Pending    [Start]      │
│  ...                                                │
└─────────────────────────────────────────────────────┘
```

### Editor
```
┌──────────────────┬──────────────────┬──────────────┐
│ Frontmatter      │ Markdown Source  │ Preview      │
│                  │                  │              │
│ Title: [____]    │ # H1...          │ rendered     │
│ Meta: [____]     │ ## H2...         │ markdown     │
│ Tags: [____]     │ content...       │              │
│                  │                  │              │
│ SEO Checklist:   │                  │              │
│ ✅ Keyword in H1 │                  │              │
│ ✅ Featured Snip │                  │              │
│ ❌ FAQ missing   │                  │              │
│                  │                  │              │
│ Words: 1,247     │                  │              │
└──────────────────┴──────────────────┴──────────────┘
                        [Save Draft]  [→ Publish]
```

---

## 9. Development Phases

### Phase 1 — Foundation (สัปดาห์ 1-2)
- [ ] Next.js project setup + Supabase connection
- [ ] สร้าง `keywords` table + `articles` table
- [ ] CSV Import (upload + parse + preview + confirm)
- [ ] Add single keyword (modal form)
- [ ] Dashboard page (accordion by cluster + progress bars + filter)
- [ ] Seed 75 keywords จาก keywords.md
- [ ] Auth ด้วย Supabase Auth (email magic link)

### Phase 2 — AI Pipeline (สัปดาห์ 3-4)
- [ ] Brief generation API + streaming UI
- [ ] Article generation API + streaming UI
- [ ] Prompt Caching สำหรับ system prompts
- [ ] Internal links auto-insert (รวมเข้าใน writer prompt)
- [ ] Token usage tracking

### Phase 3 — Editor + Publish (สัปดาห์ 5-6)
- [ ] Markdown editor (split view)
- [ ] Frontmatter panel + character count
- [ ] SEO checklist real-time
- [ ] Cover image upload → WebP → Supabase Storage
- [ ] Cover image prompt generator
- [ ] Publish flow (Markdown → HTML → Supabase PATCH/POST)

### Phase 4 — Polish (สัปดาห์ 7)
- [ ] Cost tracking dashboard (token ต่อบทความ)
- [ ] Auto-save draft
- [ ] Error handling ครบ (API timeout, Supabase error)
- [ ] Deploy บน Vercel

---

## 10. สิ่งที่ไม่ทำใน v1.0

- ❌ SERP Analyzer (ตัดออก — ใช้ keyword list ที่มีอยู่)
- ❌ Multi-tenant / Organization
- ❌ Billing / Subscription
- ❌ Team collaboration
- ❌ Cover image generation in-app (ใช้ Gemini นอกระบบ แล้ว upload เข้า)
- ❌ Scheduled publishing
- ❌ Analytics / SEO score tracking

---

## 11. Open Questions

| # | คำถาม | ผลกระทบ |
|---|---|---|
| Q1 | ~~จะ import keyword list จาก keywords.md หรือ hardcode ใน DB?~~ | **ตัดสินใจแล้ว: ใช้ DB (`keywords` table) + seed จาก CSV ครั้งแรก** |
| Q2 | Editor ต้องการ WYSIWYG หรือ Markdown source พอ? | WYSIWYG (Tiptap) ใช้ง่ายกว่าแต่ซับซ้อนกว่า |
| Q3 | Brief ต้องแก้ได้ก่อน generate article ไหม? | ถ้าต้องแก้ → ต้องมี brief editor; ถ้าไม่ → ลด scope ได้ |
| Q4 | ต้องการ version history ของบทความไหม? | ถ้าต้องการ → ต้องเก็บ revision log |
