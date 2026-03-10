import { createServiceClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { marked } from 'marked'

function markdownToHtml(md: string): string {
  // Remove H1 (first # heading)
  const withoutH1 = md.replace(/^#\s+.+\n?/m, '')

  // Remove JSON-LD code blocks
  const withoutJsonLd = withoutH1.replace(/```json[\s\S]*?@context[\s\S]*?```/g, '')

  return marked.parse(withoutJsonLd) as string
}

export async function POST(req: NextRequest) {
  let slug: string
  try {
    const body = await req.json()
    slug = body.slug
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  const supabase = createServiceClient()

  const { data: article, error: artErr } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (artErr || !article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }

  if (!article.content_md) {
    return NextResponse.json({ error: 'No content to publish' }, { status: 400 })
  }

  let contentHtml: string
  try {
    contentHtml = markdownToHtml(article.content_md)
  } catch {
    return NextResponse.json({ error: 'Failed to convert markdown' }, { status: 500 })
  }

  const payload = {
    slug: article.slug,
    title: article.meta_title || article.title,
    excerpt: article.excerpt || '',
    content: contentHtml,
    category: article.cluster || '',
    tags: article.tags || [],
    author_name: 'Best Solutions Corp',
    cover_image: article.cover_image_url || '',
    seo_title: article.meta_title || article.title,
    seo_description: article.meta_description || '',
    published_at: null,
  }

  // Check if already published
  const { data: existing } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('slug', slug)
    .single()

  let postId: string | null = null

  if (existing?.id) {
    const { error } = await supabase
      .from('blog_posts')
      .update(payload)
      .eq('slug', slug)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    postId = existing.id
  } else {
    const { data: created, error } = await supabase
      .from('blog_posts')
      .insert(payload)
      .select('id')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    postId = created?.id ?? null
  }

  // Save HTML + update status
  await Promise.all([
    supabase
      .from('articles')
      .update({
        content_html: contentHtml,
        status: 'published',
        supabase_post_id: postId,
      })
      .eq('slug', slug),
    supabase
      .from('keywords')
      .update({ status: 'published' })
      .eq('id', article.keyword_id),
  ])

  return NextResponse.json({ ok: true, postId, isUpdate: !!existing })
}
