import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { rows } = body as {
    rows: Array<{
      title: string
      primary_keyword: string
      slug: string
      cluster: string
      content_type: string
      priority: string
    }>
  }

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'ไม่มีข้อมูลที่จะ import' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Fetch existing slugs to skip duplicates
  const { data: existing } = await supabase.from('keywords').select('slug')
  const existingSlugs = new Set((existing ?? []).map((r: { slug: string }) => r.slug))

  const toInsert = rows.filter((r) => !existingSlugs.has(r.slug))
  const skipped = rows.length - toInsert.length

  if (toInsert.length === 0) {
    return NextResponse.json({ inserted: 0, skipped, message: 'ทุก slug ซ้ำกับที่มีอยู่แล้ว' })
  }

  const { data, error } = await supabase.from('keywords').insert(toInsert).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    inserted: data.length,
    skipped,
    message: `เพิ่ม ${data.length} keywords แล้ว (ข้าม ${skipped} slug ซ้ำ)`,
  })
}
