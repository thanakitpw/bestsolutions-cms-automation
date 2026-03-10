# CLAUDE.md — SEO Content Pipeline Web App
**โปรเจค:** AI SEO Generation Internal Tool สำหรับ Best Solutions Corp
**อัพเดทล่าสุด:** 2026-03-10

---

## คำสั่งสำหรับ Claude (ต้องปฏิบัติทุกครั้ง)

### ภาษา
- **ตอบเป็นภาษาไทยเสมอ** ทุก response ไม่ว่าคำถามจะเป็นภาษาอะไร

### Git & GitHub
- **GitHub repo:** https://github.com/thanakitpw/bestsolutions-cms-automation.git
- **ห้าม commit และ push ถ้ายังไม่ได้รับคำสั่ง** ไม่ว่าจะทำงานเสร็จแค่ไหน รอให้ user สั่งก่อนเสมอ

### การใช้ Skills
- **ใช้ skills ทุกครั้ง** ก่อนลงมือทำงาน โดยเลือก skill ที่เหมาะสมกับงาน เช่น:
  - งาน frontend/UI → `@ui-ux-pro-max`, `@antigravity-design-expert`
  - งาน Next.js / React → `@nextjs-best-practices`, `@react-best-practices`
  - งาน Supabase → `@supabase-automation`
  - งาน AI / Claude API → `@claude-api`
  - งาน SEO → `@seo-fundamentals`, `@seo-content-writer`
  - งาน TypeScript → `@typescript-expert`
  - งาน Database → `@postgresql`, `@database-design`
  - งาน Vercel deploy → `@vercel-deployment`
  - งาน streaming / AI pipeline → `@vercel-ai-sdk-expert`
  - งาน image processing → `@antigravity-design-expert`
  - debug → `@systematic-debugging`
  - code review → `@code-review-excellence`

### ขั้นตอน Test หลังทำงานเสร็จ (ต้องทำทุกครั้ง)

หลังจาก implement feature ใด ๆ เสร็จ ให้ทำขั้นตอนต่อไปนี้ก่อนรายงาน user ว่าเสร็จ:

1. **TypeScript check** — รัน `npx tsc --noEmit` ต้องผ่านไม่มี error
2. **ใช้ skill `verification-before-completion`** — ตรวจสอบว่า:
   - ไฟล์ที่แก้ถูกต้องและครบ
   - ไม่มี console.log หรือ debug code หลงเหลือ
   - Import paths ถูกต้องทุกไฟล์
3. **ใช้ skill `webapp-testing`** สำหรับ UI features — ตรวจสอบ:
   - Component render ได้ไม่ crash
   - Form validation ทำงานถูกต้อง
   - Error state แสดงผลถูกต้อง
4. **ใช้ skill `playwright-skill`** สำหรับ E2E flow ที่สำคัญ เช่น auth, form submit, navigation
5. **อัพเดท CHECKLIST.md** — เปลี่ยน `[ ]` → `[x]` และอัพเดท progress count

> **หมายเหตุ:** ถ้า TypeScript check fail หรือ skill ตรวจเจอปัญหา ให้แก้ให้หมดก่อน แล้วค่อยรายงาน user

### การอัพเดท Checklist
- ทุกครั้งที่ task เสร็จ ให้อัพเดท [CHECKLIST.md](./CHECKLIST.md) ทันที (เปลี่ยน `[ ]` → `[x]` และอัพเดท progress count)
- อัพเดท section "Development Progress" ในไฟล์นี้ด้วย

---

## Design System (จาก stitch_dashboard_seo_studio.zip — ต้องทำตามเป๊ะๆ)

### Colors
```js
primary: "#6467f2"          // indigo/purple — ปุ่มหลัก, active state, highlight
background-light: "#f6f6f8" // หน้า light mode
background-dark:  "#101122" // หน้า dark mode
```

### Fonts
- **Noto Sans Thai** + **Inter** — ใช้ควบคู่กัน โดย Noto Sans Thai มาก่อนเสมอ (`font-family: 'Noto Sans Thai', 'Inter', sans-serif`)
- **JetBrains Mono** — ใช้เฉพาะ Markdown editor (`markdown-editor` class)

### Border Radius
```js
DEFAULT: "0.25rem"  // rounded
lg:      "0.5rem"   // rounded-lg
xl:      "0.75rem"  // rounded-xl
full:    "9999px"   // rounded-full
```

### Icons
- ใช้ **Material Symbols Outlined** เท่านั้น (Google Fonts CDN)
- Settings: `font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`

### Layout ทั้งระบบ
- **Sidebar** กว้าง `w-64` — bg-white, border-r border-slate-200
- **Header** สูง `h-16` — sticky top-0 z-10, bg-white, border-b border-slate-200
- **Content area** — bg-background-light, `p-8 space-y-6`
- Support dark mode ด้วย `class` strategy

---

### Design Source
- **stitch_dashboard_seo_studio new.zip** — design ล่าสุด (light mode ทุก screen) ใช้เป็น source of truth

### Screens ที่ต้องทำตาม (7 screens)

#### 1. Dashboard (`/dashboard`)
- Sidebar ซ้าย (w-64): logo `rocket_launch`, nav items, user profile ล่างสุด
- Header: ชื่อหน้า + search bar (w-64) + notification bell + ปุ่ม "สร้างโครงการใหม่" (primary)
- **Stats cards** 4 cards: ทั้งหมด / เผยแพร่แล้ว / ร่าง / รอดำเนินการ
- **Filter bar**: สถานะ / วันที่แก้ไข / ผู้เขียน / ความยาก + เรียงตาม dropdown
- **Cluster accordion**: คลิก collapse/expand, แต่ละ cluster มี progress bar + keyword table
- Keyword table columns: คำหลัก | ความยาก (KD bar) | ปริมาณ | สถานะ badge | action button

#### 2. Add Keyword Modal
- Modal max-w-[560px], rounded-xl shadow-2xl
- Header: icon `add_circle` + title + close button
- Fields: ชื่อบทความ | คำหลัก (icon key) | Slug (prefix example.com/) | Cluster + ประเภท (2 col grid) | Priority (radio: ต่ำ/ปานกลาง/สูง)
- Footer: ยกเลิก + บันทึกข้อมูล (primary + save icon)

#### 3. Import CSV Modal (3-step wizard)
- Header: icon `upload_file`
- Progress bar: step X จาก 3 + % badge (primary/10 bg)
- Step 1: Drop zone (border-2 border-dashed, hover:border-primary/50) + amber info box
- Footer: ยกเลิก (ซ้าย) + ถัดไป (ขวา, disabled เมื่อยังไม่ upload)

#### 4. New Article Workflow (`/articles/new`, `/articles/[slug]/brief`)
- Header: breadcrumb + progress bar (25%/50%/75%/100%)
- **4-step tab**: Brief | Write | Review | Publish (active = border-b-2 border-primary)
- Left panel (w-[380px]): keyword info card + AI Suggestion box (primary/5 bg)
- Right panel: Brief markdown display + copy/regenerate buttons + ขั้นตอนถัดไป button

#### 5. AI Writing Progress
- Full page, no sidebar
- Header: logo + settings + avatar
- Title: "AI กำลังเขียนบทความ..." + stats chips (Words / Tokens / Cost)
- Output area: dark bg mock-terminal (bg-slate-900) with markdown cursor blink animation
- Bottom fixed bar: progress % + Stop Generation (red) + Export Draft (disabled)
- Cursor blink: `content: '█'` animate opacity 50% blink

#### 6. Article Editor (`/articles/[slug]/edit`)
- **3-column layout**: sidebar (w-80) | markdown editor (flex-1) | [preview implied]
- Left sidebar tabs: Frontmatter | Keywords | Meta
- SEO Checklist: checkbox list (5 items)
- Markdown editor: `font-family: JetBrains Mono` textarea, toolbar icons (bold/italic/link/list/image/code/undo/redo)
- Header: word count + saved status + Save button + Publish button

#### 7. Publish Confirmation Modal
- Modal max-w-2xl
- Checklist section (bg-slate-50 rounded-xl)
- JSON payload preview (bg-slate-900, font-mono, blue-300 text, scrollable max-h-[160px])
- Footer: ยกเลิก + เผยแพร่ทันที (primary + send icon)
- Success toast: bottom-right, emerald check icon

### Status Badge Colors
| Status | Style |
|---|---|
| เผยแพร่แล้ว | bg-emerald-100 text-emerald-700 |
| รอดำเนินการ | bg-amber-100 text-amber-700 |
| ร่าง | bg-slate-100 text-slate-600 |
| กำลังสร้าง | bg-primary/10 text-primary |

### KD Bar Colors
- KD ต่ำ (0-30): `bg-emerald-400`
- KD กลาง (31-60): `bg-orange-400`
- KD สูง (61+): `bg-red-400`

---

## Project Overview

Web app สำหรับใช้ภายใน (1 user) ช่วย workflow เขียนบทความ SEO:
**กรอก keyword → AI สร้าง brief → AI เขียนบทความ → แก้ไขใน Editor → Publish ขึ้น Supabase**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router |
| Language | TypeScript |
| Database | Supabase (Postgres + Storage + Auth) |
| AI | Anthropic SDK (`claude-sonnet-4-6`) |
| Streaming | Vercel AI SDK (`streamText`) |
| Editor | @uiw/react-md-editor หรือ CodeMirror |
| Image | sharp (WebP conversion บน API Route) |
| Styling | Tailwind CSS + shadcn/ui |
| Hosting | Vercel |

---

## Database Tables

### `keywords` table
- `id`, `title`, `primary_keyword`, `slug` (unique), `cluster`, `content_type`, `priority`, `status`, `article_id`, `created_at`, `updated_at`
- Status values: `pending | generating-brief | brief-ready | generating-article | draft | review | published`

### `articles` table
- `id`, `keyword_id`, `slug` (unique), `title`, `primary_keyword`, `cluster`, `content_type`, `priority`, `status`
- `brief_md`, `content_md`, `content_html`, `meta_title`, `meta_description`, `excerpt`, `tags[]`
- `cover_image_url`, `cover_image_prompt`, `supabase_post_id`, `token_usage` (jsonb)

### Existing `blog_posts` table (Supabase เดิม)
- **ห้ามส่ง field `status`** — ไม่มีใน schema
- Publish payload: `slug, title, excerpt, content (HTML), category, tags, author_name, cover_image, seo_title, seo_description, published_at: null`

---

## API Routes

```
GET    /api/keywords              — list all (filter: cluster, status, priority)
POST   /api/keywords              — add single keyword
POST   /api/keywords/import       — bulk CSV import
GET    /api/keywords/template     — download CSV template
PATCH  /api/keywords/[id]         — update status

POST   /api/ai/brief              — generate brief (streaming)
POST   /api/ai/article            — generate article (streaming)
POST   /api/ai/cover-prompt       — generate cover image prompt

GET    /api/articles              — list articles
GET    /api/articles/[slug]       — get detail
PATCH  /api/articles/[slug]       — update draft

POST   /api/upload/cover          — upload → WebP → Supabase Storage
POST   /api/publish               — POST/PATCH ไป Supabase blog_posts
```

---

## Page Structure

```
/                              → redirect → /dashboard
/dashboard                     → Keyword Dashboard
/articles/new?keyword=[id]     → เริ่ม workflow ใหม่
/articles/[slug]/brief         → Brief Review + Approve
/articles/[slug]/edit          → Markdown Editor + SEO Checklist
/articles/[slug]/publish       → Publish Preview + Confirm
```

---

## AI Rules (Hard-coded ใน System Prompts)

### Writer Agent
- ห้ามใช้ ":" ในเนื้อหา
- ห้ามใช้ "สำหรับ SME" ใน heading
- ต้องมี Featured Snippet paragraph (40-60 คำ)
- ต้องมี FAQ 5 ข้อ + JSON-LD schema
- ต้องมี internal links อย่างน้อย 2 ลิงก์ (ดึงจาก site-inventory)
- Word limit ตาม content type:
  - Pillar Page: 2000-2500 คำ
  - Blog: 1000-1500 คำ
  - Landing Page: 800-1200 คำ

### Cover Image Style
- Deep navy + neon cyan (ตาม CI ของ Best Solutions Corp)

---

## Prompt Caching

ใช้ `cache_control: ephemeral` สำหรับ:
- System prompt ของ brief agent
- System prompt ของ writer agent
- Site inventory (internal links)
- Writing rules/guidelines

คาดการณ์ลด cost ~35% → เป้าหมาย ≤ 25 บาท/บทความ

---

## Cover Image

- Upload path: `blog-covers/[ascii-slug].webp`
- Convert เป็น WebP quality=85 ด้วย `sharp` library
- Supabase Storage bucket: `images`

---

## Checklist

ดู [CHECKLIST.md](./CHECKLIST.md) สำหรับ progress ทุก task

---

## Important Files

| File | Description |
|---|---|
| [PRD.md](./PRD.md) | Product Requirements Document ฉบับเต็ม |
| [CHECKLIST.md](./CHECKLIST.md) | Task checklist + progress tracking |
| [keywords.md](./keywords.md) | Keyword list 75 ตัว (source สำหรับ seed DB) |
| [site-inventory.md](./site-inventory.md) | Internal links inventory |
| [best_solutions_content_calendar.csv](./best_solutions_content_calendar.csv) | Content calendar CSV |
| [design-prompt.md](./design-prompt.md) | Design guidelines + prompts |

---

## Development Progress (อัพเดทเมื่อทำ task เสร็จ)

**Phase 1 (Foundation):** 9/9 tasks ✅ COMPLETE — dev server: http://localhost:3000
**Phase 2 (AI Pipeline):** 7/7 tasks ✅ COMPLETE
**Phase 3 (Editor + Publish):** 0/9 tasks
**Phase 4 (Polish):** 0/4 tasks
**Overall:** 16/38 tasks (42%)

_อัพเดท section นี้ทุกครั้งที่ task เสร็จ_
