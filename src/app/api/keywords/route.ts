import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cluster = searchParams.get('cluster')
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const q = searchParams.get('q')

  const supabase = createServiceClient()
  let query = supabase.from('keywords').select('*').order('cluster').order('created_at')

  if (cluster) query = query.eq('cluster', cluster)
  if (status) query = query.eq('status', status)
  if (priority) query = query.eq('priority', priority)
  if (q) query = query.or(`title.ilike.%${q}%,primary_keyword.ilike.%${q}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, primary_keyword, slug, cluster, content_type, priority } = body

  if (!title || !primary_keyword || !slug || !cluster || !content_type || !priority) {
    return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('keywords')
    .insert({ title, primary_keyword, slug, cluster, content_type, priority })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'slug นี้ถูกใช้ไปแล้ว' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
