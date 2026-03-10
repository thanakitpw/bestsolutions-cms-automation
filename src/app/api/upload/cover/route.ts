import { createServiceClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const slug = formData.get('slug') as string | null

  if (!file || !slug) {
    return NextResponse.json({ error: 'file and slug required' }, { status: 400 })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPG/PNG/WebP/GIF allowed' }, { status: 400 })
  }

  // Convert to WebP
  const buffer = Buffer.from(await file.arrayBuffer())
  const webpBuffer = await sharp(buffer)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .webp({ quality: 85 })
    .toBuffer()

  // Upload to Supabase Storage
  const supabase = createServiceClient()
  const storagePath = `blog-covers/${slug}.webp`

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(storagePath, webpBuffer, {
      contentType: 'image/webp',
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = supabase.storage.from('images').getPublicUrl(storagePath)
  const publicUrl = urlData.publicUrl

  // Save to article
  await supabase
    .from('articles')
    .update({ cover_image_url: publicUrl })
    .eq('slug', slug)

  return NextResponse.json({ url: publicUrl })
}
