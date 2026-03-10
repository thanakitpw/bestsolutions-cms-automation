import { createServiceClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import EditorClient from './EditorClient'

export const dynamic = 'force-dynamic'

export default async function EditPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createServiceClient()

  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !article) notFound()

  return <EditorClient article={article} />
}
