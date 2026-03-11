import { createServiceClient } from '@/lib/supabase'
import { Article } from '@/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  'pending':             { label: 'Pending',      bg: 'bg-amber-100',   text: 'text-amber-700' },
  'generating-brief':   { label: 'Generating...', bg: 'bg-indigo-100',  text: 'text-indigo-700' },
  'brief-ready':        { label: 'Brief Ready',   bg: 'bg-blue-100',    text: 'text-blue-700' },
  'generating-article': { label: 'Writing...',    bg: 'bg-indigo-100',  text: 'text-indigo-700' },
  'draft':              { label: 'Draft',          bg: 'bg-slate-100',   text: 'text-slate-600' },
  'review':             { label: 'In Review',      bg: 'bg-blue-100',    text: 'text-blue-700' },
  'published':          { label: 'Published',      bg: 'bg-emerald-100', text: 'text-emerald-700' },
}

export default async function ArticlesPage() {
  let articles: Article[] = []
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('articles')
      .select('*')
      .order('updated_at', { ascending: false })
    if (data) articles = data
  } catch { /* empty */ }

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center sticky top-0 z-10">
        <h2 className="text-xl font-bold text-slate-900">เนื้อหาทั้งหมด</h2>
        <span className="ml-3 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded">
          {articles.length} articles
        </span>
      </header>

      <div className="p-8">
        {articles.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-2 block">description</span>
            ยังไม่มีบทความ — เริ่มจาก Dashboard
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-3 font-semibold text-slate-500">บทความ</th>
                  <th className="px-6 py-3 font-semibold text-slate-500">Keyword</th>
                  <th className="px-6 py-3 font-semibold text-slate-500">Cluster</th>
                  <th className="px-6 py-3 font-semibold text-slate-500">Type</th>
                  <th className="px-6 py-3 font-semibold text-slate-500">Status</th>
                  <th className="px-6 py-3 font-semibold text-slate-500">Tokens</th>
                  <th className="px-6 py-3 font-semibold text-slate-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((art) => {
                  const sc = statusConfig[art.status] ?? statusConfig['pending']
                  return (
                    <tr key={art.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 line-clamp-1">{art.title ?? art.slug}</p>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">{art.slug}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#6467f2]/10 text-[#6467f2] text-xs font-medium rounded">
                          <span className="material-symbols-outlined text-sm">key</span>
                          {art.primary_keyword ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs">{art.cluster ?? '—'}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{art.content_type ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                        {art.token_usage?.total ? art.token_usage.total.toLocaleString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(art.status === 'draft' || art.status === 'review' || art.status === 'published') && (
                          <Link
                            href={`/articles/${art.slug}/edit`}
                            className="px-3 py-1.5 bg-[#6467f2] text-white text-xs font-bold rounded-lg hover:bg-[#6467f2]/90 transition-colors"
                          >
                            Edit
                          </Link>
                        )}
                        {art.status === 'brief-ready' && (
                          <Link
                            href={`/articles/${art.slug}/brief`}
                            className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Review Brief
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
