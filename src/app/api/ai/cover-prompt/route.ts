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

  const prompt = `สร้าง image generation prompt (ภาษาอังกฤษ) สำหรับรูปปกบทความ

ชื่อบทความ: ${article.title}
Cluster: ${article.cluster}
Primary Keyword: ${article.primary_keyword}

Style ที่ต้องใช้ (CI ของ Best Solutions Corp):
- Deep navy blue background (#0B1437 หรือ #101122)
- Neon cyan/electric blue accent (#00D4FF หรือ #38BDF8)
- Minimal, clean, professional tech aesthetic
- Abstract geometric shapes หรือ data visualization elements
- NO people, NO faces, NO text in image

ตอบด้วย prompt ภาษาอังกฤษ 1 ย่อหน้า (50-80 คำ) พร้อมใช้ใน Midjourney/Stable Diffusion ได้ทันที
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
