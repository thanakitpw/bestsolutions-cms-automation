export type KeywordStatus =
  | 'pending'
  | 'generating-brief'
  | 'brief-ready'
  | 'generating-article'
  | 'draft'
  | 'review'
  | 'published'

export type ContentType = 'Blog' | 'Pillar Page' | 'Landing Page'
export type Priority = 'High' | 'Medium'

export interface Keyword {
  id: string
  title: string
  primary_keyword: string
  slug: string
  cluster: string
  content_type: ContentType
  priority: Priority
  status: KeywordStatus
  article_id: string | null
  created_at: string
  updated_at: string
}

export interface Article {
  id: string
  keyword_id: string | null
  slug: string
  title: string | null
  primary_keyword: string | null
  cluster: string | null
  content_type: ContentType | null
  priority: Priority | null
  status: string
  brief_md: string | null
  content_md: string | null
  content_html: string | null
  meta_title: string | null
  meta_description: string | null
  excerpt: string | null
  tags: string[] | null
  cover_image_url: string | null
  cover_image_prompt: string | null
  supabase_post_id: string | null
  token_usage: { brief: number; article: number; total: number } | null
  created_at: string
  updated_at: string
}

export interface ClusterGroup {
  name: string
  keywords: Keyword[]
  total: number
  published: number
  draft: number
  pending: number
}
