# Design Prompt — SEO Content Pipeline Web App

Copy the prompt below and use it with AI design tools (v0.dev, Bolt, Lovable, Claude, or Cursor).

---

## Prompt

```
Design an internal web application called "SEO Studio" for a Thai digital marketing agency (Best Solutions Corp). It's an AI-powered SEO content pipeline tool for a single user — used to create, edit, and publish Thai-language SEO articles.

---

## Design System

- Color scheme: Light theme
  - Page background: #f6f6f8
  - Card/Surface: #ffffff
  - Border: #e2e8f0
  - Primary accent: #6467f2 (indigo-purple) — CTA buttons, active states, highlights
  - Success: #10b981
  - Warning: #f59e0b
  - Error: #ef4444
  - Primary text: #0f172a
  - Secondary text: #64748b
- Font: Noto Sans Thai + Inter (UI) — Noto Sans Thai first; JetBrains Mono for code/markdown
- Border radius: 8px cards, 6px buttons
- Spacing: 8px base grid
- Style: data-dense, compact — like Linear or Raycast — not a consumer app

---

## Pages to Design

### Page 1 — Dashboard (/dashboard)

Layout: fixed left sidebar + main content area

**Left Sidebar (240px, fixed):**
- App logo "SEO Studio" with a small rocket icon
- Nav menu with icons:
  - Dashboard (grid icon) — active state
  - All Articles (document icon)
  - Settings (gear icon)
- Bottom: small user avatar + "Best Solutions Corp"

**Main Content:**

Top bar:
- Page title "Dashboard"
- Stats row (4 horizontal cards):
  - Total: 75 articles
  - Published: 2 (green badge)
  - Draft: 1 (yellow badge)
  - Pending: 72 (gray badge)
- Filter bar: "All Clusters" dropdown | "All Status" dropdown | search input

Cluster section (collapsible accordion):
Each cluster shows:
- Cluster name + "(X/12)" progress ratio
- Thin horizontal progress bar (indigo fill, gray track)
- Keyword table inside, columns:
  - # (row number)
  - Article title (Thai, truncated at 60 chars)
  - Content type badge (pill: "Pillar Page" indigo, "Blog" blue, "Landing Page" orange)
  - Priority badge ("High" red-orange, "Medium" yellow)
  - Status badge ("Published" green, "Draft" yellow, "Pending" gray, "In Review" blue)
  - Action button (based on status):
    - Pending → "Start" button (primary, small)
    - Draft → "Edit" button (secondary, small)
    - Published → "View" button (ghost, small)

First 3 clusters open by default, rest collapsed.

---

### Page 2 — Import CSV Modal (overlay on Dashboard)

Center modal, dark backdrop blur, 640px wide

**Header:**
- Small gray upload icon + title "Import Keywords from CSV"
- X close button top-right

**Step Indicator (3 horizontal steps at top of modal):**
```
[1. Upload] ──── [2. Review] ──── [3. Confirm]
  ● active            ○                   ○
```

**Step 1 — Upload:**
- Large drag & drop zone, white bg, dashed border
- Cloud upload icon centered
- Text: "Drag your CSV file here, or click to browse"
- Small text below: "Supports .csv only — max 1MB"
- "Download CSV template" link (indigo) below zone
- "Next →" button (disabled until file selected)

**Step 2 — Review:**
- Summary at top: "Found 75 keywords — skipping 3 duplicate slugs"
  - Green badge: "72 new items"
  - Yellow badge: "3 duplicates (will be skipped)"
- Preview table showing first 5 rows: title (50 chars), cluster badge, content_type badge, priority badge
- Duplicate rows: light yellow highlight + warning icon
- "← Back" button + "Import 72 Keywords →" button (primary indigo)

**Step 3 — Success:**
- Animated green checkmark circle (bounce in)
- "72 Keywords imported successfully!"
- Subtext "Dashboard has been updated"
- "Close" button (full width, secondary)

---

### Page 3 — Add Keyword Modal (overlay on Dashboard)

Center modal, 480px wide

**Header:**
- Title "+ Add New Keyword"
- X close button top-right

**Form fields (vertical stack, 16px spacing):**
- Article Title (textarea 2 rows, placeholder: "What is AI Chatbot? How to install on LINE OA")
- Primary Keyword (input, placeholder: "ai chatbot what is it")
- Slug (input, auto-generated from keyword — show lock icon + "Edit" button)
  - Text below field: "bestsolutionscorp.com/blog/ai-chatbot-คืออะไร" in gray
- Cluster (select dropdown with 8 options)
- Content Type + Priority (2 selects side by side 50/50)

**Footer:**
- "Cancel" (ghost) + "Add Keyword" (primary indigo)

---

### Page 4 — New Article Wizard (/articles/new)

Stepper/wizard layout with step indicator at top

**Step indicator (4 horizontal steps):**
```
[1. Brief] ──── [2. Write] ──── [3. Review] ──── [4. Publish]
  ● active          ○                ○                ○
```

**Step 1 — Create Brief (currently active):**

Left panel (400px):
- Title "Article Brief"
- Keyword info card showing:
  - Primary Keyword: "claude ai คืออะไร"
  - Content Type: Blog (badge)
  - Cluster: AI & Automation (badge)
  - Word Limit: 1,000–1,500 words
  - Target Audience: "Thai SME business owners"
- "Generate Brief" button (large, full width, indigo) with sparkle icon
- Small text: "~15,000 tokens · ~฿4"

Right panel (flex remaining width):
- Empty state with dashed border: "Brief will appear here after generation"
- Or (after generation) shows brief streaming as markdown:
  - H1, H2/H3 outline visible
  - LSI keywords as tag chips
  - Word budget table per section
  - "Approve Brief →" button bottom-right (green)
  - "Regenerate" text button below

---

### Page 5 — Article Editor (/articles/[slug]/edit)

Most important page. 3-column layout on wide screens, 2-column on medium.

**Top bar:**
- Back arrow → Dashboard
- Article title (inline editable, large text)
- "Draft" status badge
- Right side: "Save" button (secondary) + "Publish →" button (primary green)
- Word count: "1,247 / 1,500 words" — green if in range, red if over

**Left column (280px, fixed):**

Tab 1 — Frontmatter:
- Form fields:
  - Title (textarea, 1 row)
  - Meta Title (input + char count "52/60" gray, turns red at 58+)
  - Meta Description (textarea + char count "127/155")
  - Excerpt (textarea)
  - Tags (tag input with deletable chips)
  - Cluster (select dropdown)
  - Content Type (select dropdown)
- "Google Preview" section (collapsible, collapsed by default):
  - Simulated Google SERP result with blue title, green URL, gray description

Tab 2 — SEO Checklist:
- Checklist with icons:
  - ✅ Primary keyword in first 100 words
  - ✅ Keyword in H1
  - ✅ Featured snippet paragraph (40-60 words)
  - ✅ FAQ section present
  - ✅ Internal links (found 3 links)
  - ✅ Meta title ≤ 60 chars
  - ✅ Meta description ≤ 155 chars
  - ❌ Word count too low (847/1000)
- Overall score: "7/8 checks passed" with circular progress indicator

**Middle column (flex, ~600px):**
- Markdown source editor
- Monospace font (JetBrains Mono)
- Markdown syntax highlighting (headings bold+colored, bold, links underlined)
- Line numbers on left
- Toolbar: B I H1 H2 H3 | Link Image | Undo Redo

**Right column (flex, ~400px):**
- "Preview" label
- Rendered HTML from markdown
- Thai language, correct heading hierarchy
- Internal links highlighted as text
- Scroll-synced with editor

**Cover image section (below editor, full width):**
- 2 options side by side:
  - Left card: "Upload Image" — drag & drop zone with image icon, "Drag JPG/PNG here or click to browse", small note "Auto-converted to WebP"
  - Right card: "Generate Cover Prompt" — shows AI-generated image prompt in a code block with "Copy Prompt" button and Gemini/Midjourney icons
- If image uploaded: thumbnail preview + "Remove" button + Supabase URL

---

### Page 6 — Publish Confirmation (/articles/[slug]/publish)

Clean centered page, modal-like style

Title: "Ready to publish?"

Pre-publish checklist:
- ✅ Content: 1,247 words
- ✅ Meta title: 52 chars
- ✅ Meta description: 127 chars
- ✅ Cover image: uploaded
- ✅ Tags: 6 tags
- ⚠️ published_at: will be set to null (draft mode on site)

Payload Preview (collapsible, collapsed by default):
- Code block showing JSON payload to be sent to Supabase
- Monospace font, syntax highlighted

2 buttons:
- "Cancel" (ghost, left)
- "Publish to Supabase →" (large, green, right) with database icon

Success state (after publishing):
- Green checkmark animation
- "Published successfully!"
- Supabase Record ID: shown as monospace code
- "View on website →" link
- "Back to Dashboard" button

---

### Page 7 — AI Writing in Progress (overlay/state in Page 4 Step 2)

Shown while AI is generating the article

Full-screen overlay or dedicated view:
- Large heading: "AI is writing your article..."
- Real-time streaming typewriter effect showing the article as it's generated
- Live stats in top-right corner:
  - Words written: "847" (counting up live)
  - Tokens used: "18,432" (counting up live)
  - Estimated cost: "฿5.20" (updating live)
- Stop button (red, secondary): "Stop Generation"
- Markdown stream with visible formatting as it types

---

## Component Details

**Status Badges:**
- Published: bg-emerald-100 text-emerald-700, dot indicator
- Draft: bg-amber-100 text-amber-700
- Pending: bg-slate-100 text-slate-600
- In Review: bg-blue-100 text-blue-700

**Content Type Badges:**
- Pillar Page: bg-indigo-100 text-indigo-700
- Blog: bg-blue-100 text-blue-700
- Landing Page: bg-orange-100 text-orange-700

**Action Buttons (small, in table rows):**
- Start: indigo filled, "Start →"
- Edit: gray filled, "Edit"
- View: ghost with border, "View ↗"

**Cluster Progress Bar:**
- Track: bg-slate-200
- Fill: bg-indigo-500 (gradient to purple-500 optional)
- Height: 4px, full container width
- Animate fill on page load

---

## Responsive Behavior

- Desktop (1280px+): Full 3-column editor layout
- Laptop (1024px): Hide right preview column, toggle via button
- Tablet: Sidebar collapses to icon-only, 2-column editor
- Mobile: Not required (internal tool, desktop-only)

---

## Micro-interactions

- Click "Start" on a keyword: smooth transition to wizard page
- AI streaming text: blinking cursor at end of text
- Publish button: loading spinner → success checkmark animation
- Status badge: fade transition when status changes
- SEO checklist items: spring-animated check icon when condition passes
- Auto-save: small "Saved" toast bottom-right every 30 seconds

---

## Tech Stack (for code generation)

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- @uiw/react-md-editor for markdown editor
- Framer Motion for animations
- Supabase for database

Build the complete UI for all 7 pages/states with production-ready code. Use real Thai content in mockups (keyword: "claude ai คืออะไร", cluster: "AI & Automation"). Light theme throughout. Data-dense professional design. Include the 3-step Import CSV modal and the Add Keyword modal.
```
