import { createServiceClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import BriefClient from './BriefClient'

export const dynamic = 'force-dynamic'

export default async function BriefPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ keyword?: string }>
}) {
  const { slug } = await params
  const { keyword: keywordId } = await searchParams
  const supabase = createServiceClient()

  // Load article if exists
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single()

  // Load keyword (either from article or from query param)
  const kwId = article?.keyword_id ?? keywordId
  if (!kwId) notFound()

  const { data: keyword } = await supabase
    .from('keywords')
    .select('*')
    .eq('id', kwId)
    .single()

  if (!keyword) notFound()

  return (
    <BriefClient
      keyword={keyword}
      article={article ?? null}
      keywordId={kwId}
    />
  )
}
