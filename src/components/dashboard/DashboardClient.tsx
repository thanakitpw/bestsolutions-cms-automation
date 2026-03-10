'use client'

import { useState, useMemo } from 'react'
import { Keyword, ClusterGroup, KeywordStatus } from '@/types'
import AddKeywordModal from '@/components/dashboard/AddKeywordModal'
import ImportCsvModal from '@/components/dashboard/ImportCsvModal'
import { useRouter } from 'next/navigation'

interface Props {
  keywords: Keyword[]
}

function StatusPill({ status }: { status: KeywordStatus }) {
  const configs: Record<KeywordStatus, { label: string; dot: string; bg: string; text: string }> = {
    'pending':            { label: 'Pending AI',    dot: 'bg-amber-500',    bg: 'bg-amber-100',         text: 'text-amber-700' },
    'generating-brief':  { label: 'Generating...', dot: 'bg-[#6467f2]',    bg: 'bg-[#6467f2]/10',      text: 'text-[#6467f2]' },
    'brief-ready':       { label: 'Brief Ready',   dot: 'bg-blue-500',     bg: 'bg-blue-100',           text: 'text-blue-700' },
    'generating-article':{ label: 'Writing...',    dot: 'bg-[#6467f2]',    bg: 'bg-[#6467f2]/10',      text: 'text-[#6467f2]' },
    'draft':             { label: 'Draft',          dot: 'bg-slate-400',    bg: 'bg-slate-100',          text: 'text-slate-600' },
    'review':            { label: 'In Review',      dot: 'bg-blue-500',     bg: 'bg-blue-100',           text: 'text-blue-700' },
    'published':         { label: 'Published',      dot: 'bg-emerald-500',  bg: 'bg-emerald-100',        text: 'text-emerald-700' },
  }
  const c = configs[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`size-1.5 rounded-full ${c.dot} mr-1.5`} />
      {c.label}
    </span>
  )
}

function PriorityLabel({ priority }: { priority: string }) {
  if (priority === 'High') {
    return (
      <span className="flex items-center gap-1 text-rose-500 text-xs font-bold uppercase">
        <span className="material-symbols-outlined text-sm">priority_high</span>
        High
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-amber-500 text-xs font-bold uppercase">
      <span className="material-symbols-outlined text-sm">balance</span>
      Medium
    </span>
  )
}

function ContentTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    'Blog':         'bg-blue-50 text-blue-600',
    'Pillar Page':  'bg-indigo-50 text-indigo-600',
    'Landing Page': 'bg-orange-50 text-orange-600',
  }
  const cls = map[type] ?? 'bg-slate-50 text-slate-600'
  return (
    <span className={`px-2 py-1 rounded ${cls} text-xs font-bold uppercase`}>
      {type}
    </span>
  )
}

export default function DashboardClient({ keywords: initialKeywords }: Props) {
  const router = useRouter()
  const [keywords, setKeywords] = useState<Keyword[]>(initialKeywords)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterCluster, setFilterCluster] = useState<string>('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  const firstCluster = useMemo(
    () => (initialKeywords.length > 0 ? initialKeywords[0].cluster : ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(
    () => new Set(firstCluster ? [firstCluster] : []),
  )

  const allClusters = useMemo(
    () => Array.from(new Set(keywords.map((k) => k.cluster))).sort(),
    [keywords],
  )

  const filtered = useMemo(() => {
    return keywords.filter((k) => {
      if (
        search &&
        !k.title.toLowerCase().includes(search.toLowerCase()) &&
        !k.primary_keyword.toLowerCase().includes(search.toLowerCase())
      )
        return false
      if (filterStatus && k.status !== filterStatus) return false
      if (filterCluster && k.cluster !== filterCluster) return false
      return true
    })
  }, [keywords, search, filterStatus, filterCluster])

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

  const stats = useMemo(
    () => ({
      total: keywords.length,
      published: keywords.filter((k) => k.status === 'published').length,
      draft: keywords.filter((k) => k.status === 'draft').length,
      pending: keywords.filter((k) => k.status === 'pending').length,
    }),
    [keywords],
  )

  const toggleCluster = (name: string) => {
    setExpandedClusters((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const handleAction = (kw: Keyword) => {
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
      case 'pending':             return 'Start'
      case 'generating-brief':
      case 'generating-article':  return 'Processing...'
      case 'brief-ready':         return 'Resume'
      case 'draft':               return 'Resume'
      case 'review':              return 'Review'
      case 'published':           return 'View'
    }
  }

  const getActionStyle = (status: KeywordStatus) => {
    if (status === 'published')
      return 'px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors'
    if (status === 'generating-brief' || status === 'generating-article')
      return 'px-3 py-1 bg-slate-100 text-slate-400 text-xs font-bold rounded-lg cursor-not-allowed'
    return 'px-3 py-1 bg-[#6467f2] text-white text-xs font-bold rounded-lg hover:bg-[#6467f2]/90 transition-colors'
  }

  return (
    <>
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4 flex-1">
          <h2 className="text-xl font-bold text-slate-900 whitespace-nowrap">SEO Dashboard</h2>
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input
              className="w-full pl-10 pr-4 py-1.5 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#6467f2]/50 outline-none"
              placeholder="Search keywords or articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            title="Import CSV"
          >
            <span className="material-symbols-outlined">upload_file</span>
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#6467f2] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#6467f2]/90 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Content
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">Total Articles</p>
            <p className="text-3xl font-bold mt-1">{stats.total}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>All keywords</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">Published</p>
            <p className="text-3xl font-bold mt-1">{stats.published}</p>
            <div className="mt-2 bg-emerald-100 h-1.5 rounded-full w-full">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all"
                style={{ width: `${stats.total > 0 ? (stats.published / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">Draft</p>
            <p className="text-3xl font-bold mt-1">{stats.draft}</p>
            <div className="mt-2 bg-amber-100 h-1.5 rounded-full w-full">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all"
                style={{ width: `${stats.total > 0 ? (stats.draft / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">Pending</p>
            <p className="text-3xl font-bold mt-1">{stats.pending}</p>
            <div className="mt-2 bg-slate-100 h-1.5 rounded-full w-full">
              <div
                className="bg-[#6467f2] h-1.5 rounded-full transition-all"
                style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium">
            <span className="text-slate-500">Cluster:</span>
            <select
              className="appearance-none bg-transparent outline-none text-slate-900"
              value={filterCluster}
              onChange={(e) => setFilterCluster(e.target.value)}
            >
              <option value="">All</option>
              {allClusters.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="material-symbols-outlined text-lg text-slate-400 pointer-events-none">expand_more</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium">
            <span className="text-slate-500">Status:</span>
            <select
              className="appearance-none bg-transparent outline-none text-slate-900"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="brief-ready">Brief Ready</option>
              <option value="draft">Draft</option>
              <option value="review">In Review</option>
              <option value="published">Published</option>
            </select>
            <span className="material-symbols-outlined text-lg text-slate-400 pointer-events-none">expand_more</span>
          </button>
          <button className="ml-auto flex items-center gap-2 text-[#6467f2] text-sm font-semibold px-2">
            <span className="material-symbols-outlined text-lg">filter_alt</span>
            Advanced Filters
          </button>
        </div>

        {/* Cluster Accordions */}
        <div className="space-y-4">
          {clusters.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
              No keywords found — try adding or importing CSV
            </div>
          )}

          {clusters.map((cluster) => {
            const isExpanded = expandedClusters.has(cluster.name)
            const pct = cluster.total > 0 ? Math.round((cluster.published / cluster.total) * 100) : 0

            return (
              <div
                key={cluster.name}
                className={`bg-white rounded-xl border border-slate-200 overflow-hidden transition-opacity ${!isExpanded ? 'opacity-80' : ''}`}
              >
                {/* Cluster Header */}
                <div
                  className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleCluster(cluster.name)}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#6467f2]">auto_awesome</span>
                    <h3 className="font-bold text-lg">{cluster.name}</h3>
                    <span className="px-2 py-0.5 bg-slate-200 rounded text-xs font-semibold">
                      {cluster.total} Keywords
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                        Cluster Progress
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-[#6467f2] h-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-bold">{pct}%</span>
                      </div>
                    </div>
                    <button
                      className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors"
                      onClick={(e) => { e.stopPropagation(); toggleCluster(cluster.name) }}
                    >
                      <span className="material-symbols-outlined">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Keyword Table */}
                {isExpanded && (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="p-4 font-semibold text-slate-500">Keyword</th>
                            <th className="p-4 font-semibold text-slate-500">Content Type</th>
                            <th className="p-4 font-semibold text-slate-500">Priority</th>
                            <th className="p-4 font-semibold text-slate-500">Status</th>
                            <th className="p-4 font-semibold text-slate-500 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cluster.keywords.map((kw) => (
                            <tr
                              key={kw.id}
                              className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="p-4">
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-900">{kw.title}</span>
                                  <span className="text-xs text-slate-400">{kw.primary_keyword}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <ContentTypeBadge type={kw.content_type} />
                              </td>
                              <td className="p-4">
                                <PriorityLabel priority={kw.priority} />
                              </td>
                              <td className="p-4">
                                <StatusPill status={kw.status} />
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleAction(kw)}
                                    disabled={
                                      kw.status === 'generating-brief' ||
                                      kw.status === 'generating-article'
                                    }
                                    className={getActionStyle(kw.status)}
                                  >
                                    {getActionLabel(kw.status)}
                                  </button>
                                  <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                                    <span className="material-symbols-outlined text-xl">edit</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <p>Showing {cluster.keywords.length} of {cluster.total} keywords</p>
                      <div className="flex items-center gap-2">
                        <button className="size-7 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 transition-colors">
                          <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        <span className="font-bold text-slate-900">1</span>
                        <button className="size-7 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 transition-colors">
                          <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {showAddModal && (
        <AddKeywordModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(kw) => {
            setKeywords((prev) => [kw, ...prev])
            setShowAddModal(false)
          }}
        />
      )}
      {showImportModal && (
        <ImportCsvModal
          onClose={() => setShowImportModal(false)}
          onSuccess={(newKws) => {
            setKeywords((prev) => [...newKws, ...prev])
            setShowImportModal(false)
          }}
        />
      )}
    </>
  )
}
