import { createServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { toUrlSlug } from '@/lib/slug'

export const dynamic = 'force-dynamic'

export default async function NewArticlePage({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string }>
}) {
  const { keyword: keywordId } = await searchParams
  if (!keywordId) redirect('/dashboard')

  const supabase = createServiceClient()

  // Check if article already exists
  const { data: existing } = await supabase
    .from('articles')
    .select('slug, status')
    .eq('keyword_id', keywordId)
    .single()

  if (existing) {
    const urlSlug = toUrlSlug(existing.slug)
    const dest = ['draft', 'review', 'published'].includes(existing.status)
      ? `/articles/${urlSlug}/edit`
      : `/articles/${urlSlug}/brief`
    redirect(dest)
  }

  // Load keyword to get slug
  const { data: keyword } = await supabase
    .from('keywords')
    .select('slug')
    .eq('id', keywordId)
    .single()

  if (!keyword) redirect('/dashboard')

  const urlSlug = toUrlSlug(keyword.slug)
  redirect(`/articles/${urlSlug}/brief?keyword=${keywordId}`)
}
