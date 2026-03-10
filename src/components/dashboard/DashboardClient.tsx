'use client'

import { useState, useMemo } from 'react'
import { Keyword, ClusterGroup, KeywordStatus } from '@/types'
import StatusBadge from '@/components/ui/StatusBadge'
import AddKeywordModal from '@/components/dashboard/AddKeywordModal'
import ImportCsvModal from '@/components/dashboard/ImportCsvModal'
import { useRouter } from 'next/navigation'

interface Props {
  keywords: Keyword[]
}

export default function DashboardClient({ keywords: initialKeywords }: Props) {
  const router = useRouter()
  const [keywords, setKeywords] = useState<Keyword[]>(initialKeywords)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterPriority, setFilterPriority] = useState<string>('')
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  const filtered = useMemo(() => {
    return keywords.filter((k) => {
      if (search && !k.title.toLowerCase().includes(search.toLowerCase()) &&
          !k.primary_keyword.toLowerCase().includes(search.toLowerCase())) return false
      if (filterStatus && k.status !== filterStatus) return false
      if (filterPriority && k.priority !== filterPriority) return false
      return true
    })
  }, [keywords, search, filterStatus, filterPriority])

  const clusters = useMemo<ClusterGroup[]>(() => {
    const map = new Map<string, Keyword[]>()
    for (const k of filtered) {
      if (!map.has(k.cluster)) map.set(k.cluster, [])
      map.get(k.cluster)!.push(k)
    }
    return Array.from(map.entries()).map(([name, kws]) => ({
      name,
      keywords: kws,
      total: kws.length,
      published: kws.filter((k) => k.status === 'published').length,
      draft: kws.filter((k) => k.status === 'draft').length,
      pending: kws.filter((k) => k.status === 'pending').length,
    }))
  }, [filtered])

  const stats = useMemo(() => ({
    total: keywords.length,
    published: keywords.filter((k) => k.status === 'published').length,
    draft: keywords.filter((k) => k.status === 'draft').length,
    pending: keywords.filter((k) => k.status === 'pending').length,
  }), [keywords])

  const toggleCluster = (name: string) => {
    setExpandedClusters((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const handleActionClick = (kw: Keyword) => {
    if (kw.status === 'published' && kw.article_id) {
      router.push(`/articles/${kw.slug}/edit`)
    } else if (kw.status === 'draft' || kw.status === 'review') {
      router.push(`/articles/${kw.slug}/edit`)
    } else if (kw.status === 'brief-ready') {
      router.push(`/articles/${kw.slug}/brief`)
    } else {
      router.push(`/articles/new?keyword=${kw.id}`)
    }
  }

  const getActionLabel = (status: KeywordStatus) => {
    switch (status) {
      case 'pending': return 'เริ่มเขียน'
      case 'generating-brief': return 'กำลังสร้าง Brief...'
      case 'brief-ready': return 'Approve Brief'
      case 'generating-article': return 'กำลังเขียน...'
      case 'draft': return 'แก้ไข'
      case 'review': return 'ตรวจบทความ'
      case 'published': return 'ดูบทความ ↗'
    }
  }

  const getActionStyle = (status: KeywordStatus) => {
    switch (status) {
      case 'pending': return 'text-[#6467f2] hover:underline font-bold'
      case 'generating-brief':
      case 'generating-article': return 'text-slate-400 cursor-not-allowed font-bold'
      case 'brief-ready': return 'text-amber-600 hover:underline font-bold'
      case 'draft': return 'text-slate-600 hover:underline font-bold'
      case 'review': return 'text-orange-600 hover:underline font-bold'
      case 'published': return 'text-emerald-600 hover:underline font-bold'
    }
  }

  const onKeywordAdded = (kw: Keyword) => {
    setKeywords((prev) => [kw, ...prev])
    setShowAddModal(false)
  }

  const onKeywordsImported = (newKws: Keyword[]) => {
    setKeywords((prev) => [...newKws, ...prev])
    setShowImportModal(false)
  }

  return (
    <>
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#6467f2]">auto_awesome</span>
          <h2 className="text-lg font-bold">แดชบอร์ดภาพรวม</h2>
        </div>
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#6467f2] outline-none"
              placeholder="ค้นหาคำหลัก..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="size-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            Import CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#6467f2] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#6467f2]/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            เพิ่มคำหลัก
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'ทั้งหมด', value: stats.total },
            { label: 'เผยแพร่แล้ว', value: stats.published },
            { label: 'ร่าง', value: stats.draft },
            { label: 'รอดำเนินการ', value: stats.pending },
          ].map((s) => (
            <div key={s.label} className="bg-white p-6 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500 font-medium">{s.label}</p>
              <div className="flex items-end justify-between mt-2">
                <h3 className="text-3xl font-bold">{s.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#6467f2] outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">สถานะทั้งหมด</option>
            <option value="pending">รอดำเนินการ</option>
            <option value="brief-ready">Brief พร้อม</option>
            <option value="draft">ร่าง</option>
            <option value="review">รอตรวจสอบ</option>
            <option value="published">เผยแพร่แล้ว</option>
          </select>
          <select
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#6467f2] outline-none"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">ความสำคัญทั้งหมด</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
          </select>
          <div className="ml-auto text-sm text-slate-500">
            แสดง {filtered.length} / {keywords.length} คำหลัก
          </div>
        </div>

        {/* Cluster Accordions */}
        <div className="space-y-4">
          {clusters.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
              ไม่พบคำหลัก — ลองเพิ่มหรือ import CSV
            </div>
          )}
          {clusters.map((cluster) => {
            const isExpanded = expandedClusters.has(cluster.name)
            const pct = cluster.total > 0 ? Math.round((cluster.published / cluster.total) * 100) : 0
            return (
              <div key={cluster.name} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Cluster Header */}
                <div
                  className="p-5 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleCluster(cluster.name)}
                >
                  <span className="material-symbols-outlined text-slate-400">
                    {isExpanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold">{cluster.name}</h4>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#6467f2] h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">
                        {pct}% ({cluster.published}/{cluster.total} คำหลัก)
                      </span>
                    </div>
                  </div>
                  <button className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
                    <span className="material-symbols-outlined text-slate-400">more_vert</span>
                  </button>
                </div>

                {/* Keyword Table */}
                {isExpanded && (
                  <div className="border-t border-slate-100">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                          <th className="px-6 py-3">คำหลัก</th>
                          <th className="px-6 py-3">ประเภท</th>
                          <th className="px-6 py-3">ความสำคัญ</th>
                          <th className="px-6 py-3">สถานะ</th>
                          <th className="px-6 py-3 text-right">การดำเนินการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {cluster.keywords.map((kw) => (
                          <tr key={kw.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">{kw.title}</div>
                              <div className="text-xs text-slate-400 mt-0.5">{kw.primary_keyword}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                {kw.content_type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                kw.priority === 'High'
                                  ? 'bg-[#6467f2]/10 text-[#6467f2]'
                                  : 'bg-slate-100 text-slate-500'
                              }`}>
                                {kw.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={kw.status} />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleActionClick(kw)}
                                disabled={kw.status === 'generating-brief' || kw.status === 'generating-article'}
                                className={getActionStyle(kw.status)}
                              >
                                {getActionLabel(kw.status)}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddKeywordModal
          onClose={() => setShowAddModal(false)}
          onSuccess={onKeywordAdded}
        />
      )}
      {showImportModal && (
        <ImportCsvModal
          onClose={() => setShowImportModal(false)}
          onSuccess={onKeywordsImported}
        />
      )}
    </>
  )
}
