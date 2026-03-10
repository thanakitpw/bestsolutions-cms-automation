import { createServiceClient } from '@/lib/supabase'
import { Keyword } from '@/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ClustersPage() {
  let keywords: Keyword[] = []
  try {
    const supabase = createServiceClient()
    const { data } = await supabase.from('keywords').select('*').order('cluster').order('priority')
    if (data) keywords = data
  } catch { /* empty */ }

  const clusterMap = new Map<string, Keyword[]>()
  for (const kw of keywords) {
    if (!clusterMap.has(kw.cluster)) clusterMap.set(kw.cluster, [])
    clusterMap.get(kw.cluster)!.push(kw)
  }

  const clusters = Array.from(clusterMap.entries()).map(([name, kws]) => ({
    name,
    total: kws.length,
    published: kws.filter((k) => k.status === 'published').length,
    draft: kws.filter((k) => k.status === 'draft').length,
    pending: kws.filter((k) => k.status === 'pending').length,
    highPriority: kws.filter((k) => k.priority === 'High').length,
  }))

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center sticky top-0 z-10">
        <h2 className="text-xl font-bold text-slate-900">คลาสเตอร์คำหลัก</h2>
        <span className="ml-3 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded">
          {clusters.length} clusters
        </span>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clusters.map((c) => {
            const pct = c.total > 0 ? Math.round((c.published / c.total) * 100) : 0
            return (
              <Link
                key={c.name}
                href={`/dashboard?cluster=${encodeURIComponent(c.name)}`}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:border-[#6467f2]/40 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="material-symbols-outlined text-[#6467f2] text-2xl group-hover:scale-110 transition-transform inline-block">auto_awesome</span>
                    <h3 className="font-bold text-slate-900 mt-1">{c.name}</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{c.total} keywords</span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#6467f2] h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-700">{pct}%</span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                    {c.published} published
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    <span className="size-1.5 rounded-full bg-amber-500 inline-block" />
                    {c.draft} draft
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 font-medium">
                    <span className="size-1.5 rounded-full bg-slate-300 inline-block" />
                    {c.pending} pending
                  </span>
                </div>

                {c.highPriority > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs text-rose-500 font-medium">
                    <span className="material-symbols-outlined text-sm">priority_high</span>
                    {c.highPriority} High Priority
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
