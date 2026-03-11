import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { slug } = await req.json()
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  const supabase = createServiceClient()
  const { data: article } = await supabase
    .from('articles')
    .select('title, cluster, primary_keyword')
    .eq('slug', slug)
    .single()

  if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 })

  const prompt = `สร้าง image generation prompt (ภาษาอังกฤษ) สำหรับรูปปกบทความ SEO

ชื่อบทความ: ${article.title}
Cluster: ${article.cluster}
Primary Keyword: ${article.primary_keyword}

สไตล์ที่ต้องการ (ดูจากรูปตัวอย่าง):
- Deep navy blue gradient background (จากมุมซ้ายบนเข้มสุด #0B1437 ไล่ไปขวาล่างเข้า #1a1040 มี hint สีแดงเข้มมุมซ้ายล่าง)
- ข้อความชื่อบทความภาษาไทย "${article.title}" แสดงเป็น bold typography ขนาดใหญ่ บริเวณบน-ซ้ายของรูป ครึ่งแรกสีขาว ครึ่งหลังสีฟ้า neon cyan (#00D4FF)
- ใต้ข้อความไทย มีข้อความภาษาอังกฤษที่เป็นแปลของชื่อบทความ ขนาดเล็กกว่า สี slate gray
- ด้านล่าง-ขวา มี abstract tech illustration ที่เกี่ยวข้องกับเนื้อหาบทความ (เช่น charts, upward arrows, rockets, cloud icons, data visualization, browser windows, circuit board lines) สี neon cyan/electric blue กับ purple accents
- Subtle geometric grid lines เป็น pattern จางๆ ทั่วรูป
- Glow effects, particle dots, light streaks
- มี diamond shape icon เล็กๆ มุมขวาล่าง สี cyan (logo mark)
- Professional, corporate, modern tech aesthetic
- 16:9 aspect ratio, 1200x630px
- NO people, NO faces, NO photographs

ตอบด้วย prompt ภาษาอังกฤษ 1 ย่อหน้า (60-100 คำ) พร้อมใช้ใน Midjourney/DALL-E ได้ทันที
เพิ่ม --ar 16:9 --v 6 ท้าย prompt
ห้ามอธิบายเพิ่มเติม ให้ตอบแค่ prompt เท่านั้น`

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  const coverPrompt = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''

  await supabase
    .from('articles')
    .update({ cover_image_prompt: coverPrompt })
    .eq('slug', slug)

  return NextResponse.json({ prompt: coverPrompt })
}
