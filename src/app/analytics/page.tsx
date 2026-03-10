import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  let totalTokens = 0
  let articlesGenerated = 0
  let publishedCount = 0
  let draftCount = 0
  const clusterTokens: Record<string, number> = {}

  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('articles')
      .select('status, cluster, token_usage')
    if (data) {
      for (const art of data) {
        if (art.status === 'published') publishedCount++
        if (art.status === 'draft') draftCount++
        if (art.token_usage?.total) {
          totalTokens += art.token_usage.total
          articlesGenerated++
          const cl = art.cluster ?? 'Other'
          clusterTokens[cl] = (clusterTokens[cl] ?? 0) + art.token_usage.total
        }
      }
    }
  } catch { /* empty */ }

  const estimatedCostTHB = Math.round((totalTokens / 1_000_000) * 6 * 35)
  const avgTokens = articlesGenerated > 0 ? Math.round(totalTokens / articlesGenerated) : 0
  const avgCostTHB = articlesGenerated > 0 ? Math.round(estimatedCostTHB / articlesGenerated) : 0

  const topClusters = Object.entries(clusterTokens)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
  const maxClusterTokens = topClusters[0]?.[1] ?? 1

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center sticky top-0 z-10">
        <h2 className="text-xl font-bold text-slate-900">การวิเคราะห์</h2>
      </header>

      <div className="p-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">บทความที่สร้าง</p>
            <p className="text-3xl font-bold mt-1 text-slate-900">{articlesGenerated}</p>
            <p className="text-xs text-slate-400 mt-1">มี token usage</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Published</p>
            <p className="text-3xl font-bold mt-1 text-emerald-600">{publishedCount}</p>
            <p className="text-xs text-slate-400 mt-1">{draftCount} ยังเป็น draft</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Tokens</p>
            <p className="text-3xl font-bold mt-1 text-[#6467f2]">{totalTokens.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">เฉลี่ย {avgTokens.toLocaleString()}/บทความ</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">ค่าใช้จ่ายรวม</p>
            <p className="text-3xl font-bold mt-1 text-slate-900">฿{estimatedCostTHB.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">เฉลี่ย ฿{avgCostTHB}/บทความ</p>
          </div>
        </div>

        {/* Token Usage by Cluster */}
        {topClusters.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-5">Token Usage ตาม Cluster</h3>
            <div className="space-y-3">
              {topClusters.map(([name, tokens]) => {
                const pct = Math.round((tokens / maxClusterTokens) * 100)
                const cost = Math.round((tokens / 1_000_000) * 6 * 35)
                return (
                  <div key={name} className="flex items-center gap-4">
                    <p className="text-sm text-slate-700 w-48 shrink-0 truncate font-medium">{name}</p>
                    <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#6467f2] h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 font-mono w-28 text-right shrink-0">
                      {tokens.toLocaleString()} tokens
                    </span>
                    <span className="text-xs text-slate-400 font-mono w-16 text-right shrink-0">
                      ฿{cost}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {articlesGenerated === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-2 block">bar_chart</span>
            ยังไม่มีข้อมูล — เริ่มสร้างบทความก่อน
          </div>
        )}
      </div>
    </div>
  )
}
