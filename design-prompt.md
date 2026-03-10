# Design Prompt — SEO Content Pipeline Web App

คัดลอก prompt ด้านล่างไปใช้กับ AI design tool (v0.dev, Bolt, Lovable, Claude, หรือ Cursor)

---

## Prompt

```
ออกแบบ web application สำหรับใช้ภายในองค์กร ชื่อ "SEO Studio" สำหรับบริษัทดิจิทัลมาร์เก็ตติ้งไทย (Best Solutions Corp) เป็นเครื่องมือ AI-powered SEO content pipeline สำหรับผู้ใช้คนเดียว ใช้สร้าง แก้ไข และ publish บทความ SEO ภาษาไทย

---

## ระบบการออกแบบ (Design System)

- โทนสี: Dark theme
  - พื้นหลัง: #0F1117 (ดำเกือบสนิท)
  - การ์ด/Surface: #1A1D27
  - เส้นขอบ: #2A2D3E
  - สีหลัก accent: #6366F1 (indigo) สำหรับปุ่ม CTA และ active state
  - สีสำเร็จ: #22C55E
  - สีเตือน: #F59E0B
  - สีผิดพลาด: #EF4444
  - ตัวหนังสือหลัก: #F1F5F9
  - ตัวหนังสือรอง: #94A3B8
- ฟอนต์: Inter (UI) + JetBrains Mono (โค้ด/markdown)
- มุมโค้ง: 8px การ์ด, 6px ปุ่ม
- ระยะห่าง: grid ฐาน 8px
- สไตล์: layout ข้อมูลหนาแน่น กระชับ เหมือน Linear หรือ Raycast — ไม่ใช่ consumer app

---

## หน้าที่ต้องออกแบบ

### หน้า 1 — Dashboard (/dashboard)

Layout: sidebar ซ้าย + content หลัก

**Sidebar ซ้าย (240px, fixed):**
- โลโก้แอป "SEO Studio" พร้อมไอคอนสายฟ้าเล็กๆ
- เมนูหลักพร้อมไอคอน:
  - Dashboard (ไอคอน grid) — active state
  - บทความทั้งหมด (ไอคอนเอกสาร)
  - ตั้งค่า (ไอคอนเฟือง)
- ล่างสุด: avatar ผู้ใช้ขนาดเล็ก + ชื่อ "Best Solutions Corp"

**Content หลัก:**

แถบบนสุด:
- หัวข้อ "Dashboard"
- แถบสถิติ (4 การ์ดแนวนอน):
  - ทั้งหมด: 75 บทความ
  - เผยแพร่แล้ว: 2 (badge เขียว)
  - แบบร่าง: 1 (badge เหลือง)
  - รอดำเนินการ: 72 (badge เทา)
- แถบกรอง: dropdown "Cluster ทั้งหมด" | dropdown "สถานะทั้งหมด" | ช่องค้นหา

ส่วน Cluster (accordion พับได้):
แต่ละ cluster แสดง:
- ชื่อ cluster + "(X/12)" สัดส่วนความคืบหน้า
- progress bar บางแนวนอน (สี indigo เติม, เทาเป็นพื้น)
- ตาราง keyword ภายใน มีคอลัมน์:
  - # (ลำดับ)
  - ชื่อบทความ (ภาษาไทย, ตัดที่ 60 ตัวอักษร)
  - badge ประเภทเนื้อหา (pill: "Pillar Page" indigo, "Blog" น้ำเงิน, "Landing Page" ส้ม)
  - badge ความสำคัญ ("High" แดง-ส้ม, "Medium" เหลือง)
  - badge สถานะ ("เผยแพร่แล้ว" เขียว, "แบบร่าง" เหลือง, "รอดำเนินการ" เทา, "รอตรวจ" น้ำเงิน)
  - ปุ่มดำเนินการ (ตามสถานะ):
    - รอดำเนินการ → ปุ่ม "เริ่ม" (primary, เล็ก)
    - แบบร่าง → ปุ่ม "แก้ไข" (secondary, เล็ก)
    - เผยแพร่แล้ว → ปุ่ม "ดู" (ghost, เล็ก)

เปิด 3 cluster แรกไว้ก่อน ที่เหลือพับ

---

---

### หน้า 2 — Import CSV Modal (overlay บน Dashboard)

Modal กลางหน้าจอ พื้นหลัง backdrop blur มืด ขนาด 640px กว้าง

**Header:**
- ไอคอน upload เล็กสีเทา + หัวข้อ "นำเข้า Keywords จาก CSV"
- X ปิด มุมขวาบน

**Step Indicator (3 ขั้น แนวนอน ด้านบน modal):**
```
[1. อัปโหลด] ──── [2. ตรวจสอบ] ──── [3. ยืนยัน]
  ● active            ○                   ○
```

**ขั้นที่ 1 — อัปโหลด:**
- Drag & drop zone ขนาดใหญ่ พื้น #1A1D27 เส้นขอบประ #2A2D3E
- ไอคอน upload สีเทา กลางกล่อง
- ข้อความ "ลากไฟล์ CSV มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์"
- ข้อความเล็กด้านล่าง: "รองรับ .csv เท่านั้น — ขนาดไม่เกิน 1MB"
- ลิงก์ "ดาวน์โหลด template CSV" สี indigo ใต้กล่อง
- ปุ่ม "ถัดไป →" (disabled จนกว่าจะเลือกไฟล์)

**ขั้นที่ 2 — ตรวจสอบ:**
- สรุปด้านบน: "พบ 75 keywords — ข้าม 3 รายการที่ slug ซ้ำ"
  - badge เขียว: "72 รายการใหม่"
  - badge เหลือง: "3 รายการซ้ำ (จะถูกข้าม)"
- ตาราง preview 5 แถวแรก มีคอลัมน์: title (ตัด 50 chars), cluster badge, content_type badge, priority badge
- แถวที่ slug ซ้ำ: พื้น highlight เหลืองอ่อน + icon warning
- ปุ่ม "← ย้อนกลับ" + ปุ่ม "นำเข้า 72 Keywords →" (primary indigo)

**ขั้นที่ 3 — สำเร็จ:**
- animation checkmark วงกลมเขียว bounce เข้ามา
- ข้อความ "นำเข้า 72 Keywords สำเร็จแล้ว!"
- ข้อความรอง "Dashboard อัปเดตแล้ว"
- ปุ่ม "ปิด" (full width, secondary)

---

### หน้า 3 — Add Keyword Modal (overlay บน Dashboard)

Modal กลางหน้าจอ ขนาด 480px กว้าง

**Header:**
- หัวข้อ "+ เพิ่ม Keyword ใหม่"
- X ปิด มุมขวาบน

**Form fields (stack แนวตั้ง spacing 16px):**
- ชื่อบทความ (textarea 2 แถว, placeholder: "AI Chatbot คืออะไร? วิธีติดตั้งบน LINE OA")
- Primary Keyword (input, placeholder: "ai chatbot คืออะไร")
- Slug (input, auto-generate จาก keyword — แสดง lock icon + ปุ่ม "แก้ไข")
  - ข้อความใต้ช่อง: "bestsolutionscorp.com/blog/ai-chatbot-คืออะไร" สีเทา
- Cluster (select dropdown มี 8 ตัวเลือก)
- Content Type + Priority (2 select เคียงกัน 50/50)

**Footer:**
- "ยกเลิก" (ghost) + "เพิ่ม Keyword" (primary indigo)

---

### หน้า 4 — สร้างบทความใหม่ — Wizard (/articles/new)

Layout แบบ stepper/wizard มี step indicator ด้านบน

**Step indicator (แนวนอน 4 ขั้น):**
```
[1. Brief] ──── [2. เขียน] ──── [3. ตรวจ] ──── [4. เผยแพร่]
  ● active          ○                ○                ○
```

**ขั้นที่ 1 — สร้าง Brief (กำลัง active):**

Panel ซ้าย (400px):
- หัวข้อ "Article Brief"
- การ์ดข้อมูล keyword แสดง:
  - Keyword หลัก: "claude ai คืออะไร"
  - ประเภทเนื้อหา: Blog (badge)
  - Cluster: AI & Automation (badge)
  - ขีดจำกัดคำ: 1,000–1,500 คำ
  - กลุ่มเป้าหมาย: "เจ้าของธุรกิจ SME ไทย"
- ปุ่ม "สร้าง Brief" (ใหญ่, เต็มความกว้าง, indigo) พร้อมไอคอนประกาย
- ข้อความเล็ก: "~15,000 tokens · ~฿4"

Panel ขวา (ขยายเต็มที่เหลือ):
- สถานะว่าง มีเส้นขอบประ: "Brief จะแสดงที่นี่หลัง generate"
- หรือ (หลัง generate) แสดง brief แบบ streaming เป็น markdown:
  - H1, H2/H3 outline มองเห็นได้
  - LSI keywords เป็น tag chips
  - ตารางงบประมาณคำต่อ section
  - ปุ่ม "อนุมัติ Brief →" ล่างขวา (เขียว)
  - ปุ่มข้อความ "สร้างใหม่" ด้านล่าง

---

### หน้า 5 — Editor บทความ (/articles/[slug]/edit)

หน้านี้สำคัญที่สุด Layout 3 คอลัมน์บนหน้าจอกว้าง, 2 คอลัมน์บนหน้าจอขนาดกลาง

**แถบบนสุด:**
- ลูกศรย้อนกลับ → Dashboard
- ชื่อบทความ (แก้ไข inline ได้, ตัวหนังสือใหญ่)
- badge สถานะ "แบบร่าง"
- ขวา: ปุ่ม "บันทึก" (secondary) + ปุ่ม "เผยแพร่ →" (primary เขียว)
- จำนวนคำ: "1,247 / 1,500 คำ" สีเขียวถ้าอยู่ใน range, แดงถ้าเกิน

**คอลัมน์ซ้าย (280px, fixed):**

แท็บ 1 — Frontmatter:
- ฟิลด์ฟอร์ม:
  - ชื่อเรื่อง (textarea, 1 แถว)
  - Meta Title (input + นับตัวอักษร "52/60" สีเทา, เปลี่ยนเป็นแดงที่ 58+)
  - Meta Description (textarea + นับตัวอักษร "127/155")
  - Excerpt (textarea)
  - Tags (tag input, ลบ chips ได้)
  - Cluster (select dropdown)
  - ประเภทเนื้อหา (select dropdown)
- ส่วน "ตัวอย่าง Google" (พับได้) แสดง:
  - จำลองผลลัพธ์ Google มีชื่อสีน้ำเงิน, URL สีเขียว, คำอธิบายสีเทา
  - เหมือน Google snippet จริงทุกประการ

แท็บ 2 — SEO Checklist:
- รายการตรวจพร้อมไอคอน:
  - ✅ keyword หลักอยู่ใน 100 คำแรก
  - ✅ keyword อยู่ใน H1
  - ✅ มีย่อหน้า featured snippet (40-60 คำ)
  - ✅ มีส่วน FAQ
  - ✅ Internal links (พบ 3 ลิงก์)
  - ✅ Meta title ≤ 60 ตัวอักษร
  - ✅ Meta description ≤ 155 ตัวอักษร
  - ❌ จำนวนคำน้อยเกินไป (847/1000)
- คะแนนรวม: "ผ่าน 7/8 รายการ" พร้อม circular progress indicator

**คอลัมน์กลาง (flex, ~600px):**
- Markdown source editor
- ฟอนต์ monospace (JetBrains Mono)
- syntax highlighting สำหรับ Markdown (heading ตัวหนา+มีสี, bold, ลิงก์ขีดเส้นใต้)
- เลขบรรทัดทางซ้าย
- Toolbar ด้านบน: B I H1 H2 H3 | ลิงก์ รูปภาพ | Undo Redo

**คอลัมน์ขวา (flex, ~400px):**
- ป้าย "Preview"
- แสดงผล HTML ที่ render จาก markdown
- ภาษาไทย, ลำดับ heading ถูกต้อง
- internal links แสดงเป็น text ไฮไลท์
- scroll sync กับ editor

**ส่วนรูปปก (ด้านล่าง editor, เต็มความกว้าง):**
- 2 ตัวเลือกเคียงกัน:
  - การ์ดซ้าย: "อัปโหลดรูป" — drag & drop zone พร้อมไอคอนรูปภาพ, "ลากไฟล์ JPG/PNG มาวาง หรือคลิกเพื่อเลือก", หมายเหตุเล็ก "แปลงเป็น WebP อัตโนมัติ"
  - การ์ดขวา: "สร้าง Prompt รูปปก" — แสดง AI-generated image prompt ใน code block พร้อมปุ่ม "คัดลอก Prompt" และไอคอน Gemini/Midjourney
- ถ้าอัปโหลดรูปแล้ว: แสดง thumbnail preview + ปุ่ม "ลบ" + Supabase URL

---

### หน้า 6 — ยืนยันการเผยแพร่ (/articles/[slug]/publish)

หน้าสะอาด กึ่งกลาง สไตล์ modal

หัวข้อ: "พร้อมเผยแพร่แล้วใช่ไหม?"

สรุปการตรวจสอบ:
- ✅ เนื้อหา: 1,247 คำ
- ✅ Meta title: 52 ตัวอักษร
- ✅ Meta description: 127 ตัวอักษร
- ✅ รูปปก: อัปโหลดแล้ว
- ✅ Tags: 6 tags
- ⚠️ published_at: จะตั้งเป็น null (draft mode บนเว็บ)

ตัวอย่าง Payload (พับได้, พับไว้ก่อน):
- code block แสดง JSON ที่จะส่งไป Supabase
- ฟอนต์ monospace, syntax highlighted

2 ปุ่ม:
- "ยกเลิก" (ghost, ซ้าย)
- "เผยแพร่ขึ้น Supabase →" (ใหญ่, เขียว, ขวา) พร้อมไอคอนฐานข้อมูล

สถานะสำเร็จ (หลังเผยแพร่):
- animation checkmark สีเขียว
- "เผยแพร่สำเร็จแล้ว!"
- Supabase Record ID: แสดงเป็น monospace code
- ลิงก์ "ดูบนเว็บไซต์ →"
- ปุ่ม "กลับ Dashboard"

---

### หน้า 7 — AI กำลังเขียนบทความ (overlay/state ใน หน้า 4 ขั้นที่ 2)

แสดงสถานะนี้เมื่อ AI กำลัง generate บทความอยู่

Full-screen overlay หรือ dedicated view:
- หัวข้อใหญ่: "AI กำลังเขียนบทความ..."
- Typewriter effect แบบ animation แสดงบทความที่ streaming แบบ real-time
- สถิติมุมบนขวา:
  - จำนวนคำที่เขียน: "847" (นับขึ้น live)
  - Tokens ที่ใช้: "18,432" (นับขึ้น live)
  - ค่าใช้จ่ายโดยประมาณ: "฿5.20" (อัปเดต live)
- ปุ่มหยุด (แดง, secondary): "หยุดการสร้าง"
- markdown stream พร้อม formatting มองเห็นได้ขณะพิมพ์

---

## รายละเอียด Component

**Badge สถานะ:**
- เผยแพร่แล้ว: พื้นหลังเขียว #166534, ตัวหนังสือ #4ADE80, dot indicator
- แบบร่าง: พื้นหลังเหลือง #713F12, ตัวหนังสือ #FDE047
- รอดำเนินการ: พื้นหลังเทา #1E293B, ตัวหนังสือ #94A3B8
- รอตรวจ: พื้นหลังน้ำเงิน #1E3A5F, ตัวหนังสือ #60A5FA

**Badge ประเภทเนื้อหา:**
- Pillar Page: พื้นหลัง indigo #4338CA, ตัวหนังสือขาว
- Blog: พื้นหลังน้ำเงิน #1D4ED8, ตัวหนังสือขาว
- Landing Page: พื้นหลังส้ม #92400E, ตัวหนังสือขาว

**ปุ่มดำเนินการ (เล็ก, ในแถวตาราง):**
- เริ่ม: indigo เติมสี, "เริ่ม →"
- แก้ไข: เทาเติมสี, "แก้ไข"
- ดู: โปร่งใสมีเส้นขอบ, "ดู ↗"

**Progress Bar (ความคืบหน้า cluster):**
- พื้น track: #2A2D3E
- เติมสี: gradient จาก #6366F1 ถึง #8B5CF6
- ความสูง: 4px, เต็มความกว้าง container
- animation fill เมื่อโหลดหน้า

---

## Responsive

- Desktop (1280px+): Editor 3 คอลัมน์เต็ม
- Laptop (1024px): ซ่อนคอลัมน์ preview ขวา, toggle ด้วยปุ่ม
- Tablet: Sidebar พับเหลือแค่ไอคอน, editor 2 คอลัมน์
- Mobile: ไม่จำเป็น (internal tool, ใช้ desktop เท่านั้น)

---

## Micro-interactions

- คลิก "เริ่ม" บน keyword: transition เรียบเนียนไปหน้า wizard
- AI streaming text: cursor บลิ้งที่ท้ายข้อความ
- ปุ่มเผยแพร่: loading spinner → animation checkmark สำเร็จ
- badge สถานะ: fade transition เมื่อสถานะเปลี่ยน
- รายการ SEO checklist: check icon animate แบบ spring เมื่อผ่านเงื่อนไข
- Auto-save: toast "บันทึกแล้ว" เล็กๆ มุมขวาล่างทุก 30 วินาที

---

## Tech Stack (สำหรับ generate code)

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- @uiw/react-md-editor สำหรับ markdown editor
- Framer Motion สำหรับ animation
- Supabase สำหรับฐานข้อมูล

สร้าง UI ครบทั้ง 7 หน้า/สถานะ พร้อม production-ready code ใช้เนื้อหาภาษาไทยจริงใน mockup (keyword: "claude ai คืออะไร", cluster: "AI & Automation") dark theme ตลอด การออกแบบข้อมูลหนาแน่นและเป็นมืออาชีพ รวม modal Import CSV (3-step) และ modal Add Keyword
```
