'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Keyword, Article } from '@/types'

interface Props {
  keyword: Keyword
  article: Article | null
  keywordId: string
}

const STEPS = ['Brief', 'Write', 'Review', 'Publish']

export default function BriefClient({ keyword, article: initialArticle, keywordId }: Props) {
  const router = useRouter()
  const [briefText, setBriefText] = useState(initialArticle?.brief_md ?? '')
  const [status, setStatus] = useState<'idle' | 'streaming' | 'done' | 'error'>(
    initialArticle?.brief_md ? 'done' : 'idle'
  )
  const [error, setError] = useState('')
  const [approving, setApproving] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const autoStart =
    !initialArticle?.brief_md ||
    initialArticle?.status === 'generating-brief'

  useEffect(() => {
    if (autoStart) startBrief()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [briefText])

  const startBrief = async () => {
    setBriefText('')
    setStatus('streaming')
    setError('')

    try {
      const res = await fetch('/api/ai/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywordId }),
      })

      if (!res.ok || !res.body) throw new Error('Failed to start brief generation')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const json = JSON.parse(line.slice(6))
            if (json.error) throw new Error(json.error)
            if (json.text) setBriefText((prev) => prev + json.text)
            if (json.done) {
              setStatus('done')
              router.refresh()
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
      setStatus('error')
    }
  }

  const handleApprove = async () => {
    setApproving(true)
    router.push(`/articles/${keyword.slug}/writing`)
  }

  const wordLimit: Record<string, string> = {
    'Pillar Page': '2,000–2,500',
    'Blog': '1,000–1,500',
    'Landing Page': '800–1,200',
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <p className="text-xs text-slate-400 font-medium">Dashboard / Content Brief</p>
            <h2 className="text-base font-bold text-slate-900 leading-tight truncate max-w-md">
              {keyword.title}
            </h2>
          </div>
        </div>

        {/* Progress tabs */}
        <div className="flex items-center gap-1">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-1">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                i === 0 ? 'bg-[#6467f2]/10 text-[#6467f2]' : 'text-slate-400'
              }`}>
                <span className={`size-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-[#6467f2] text-white' : 'bg-slate-200 text-slate-500'
                }`}>{i + 1}</span>
                {step}
              </div>
              {i < STEPS.length - 1 && (
                <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
              )}
            </div>
          ))}
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex gap-0 overflow-hidden">
        {/* Left panel — Keyword info */}
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto p-6 gap-5">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Keyword Info</p>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs text-slate-400">Primary Keyword</p>
                <p className="text-sm font-semibold text-slate-900">{keyword.primary_keyword}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Content Type</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded">
                  {keyword.content_type}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400">Cluster</p>
                <p className="text-sm font-medium text-slate-700">{keyword.cluster}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Priority</p>
                <span className={`text-xs font-bold ${keyword.priority === 'High' ? 'text-rose-500' : 'text-amber-500'}`}>
                  {keyword.priority}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400">Word Target</p>
                <p className="text-sm font-medium text-slate-700">
                  {wordLimit[keyword.content_type] ?? '1,000–1,500'} words
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#6467f2]/5 border border-[#6467f2]/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#6467f2] text-lg">auto_awesome</span>
              <p className="text-xs font-bold text-[#6467f2] uppercase tracking-wider">AI Suggestion</p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Brief จะถูก generate อัตโนมัติตาม keyword และ content type ที่เลือก
              ตรวจสอบโครงสร้างและ approve เพื่อเริ่มเขียนบทความ
            </p>
          </div>

          {/* Actions */}
          <div className="mt-auto space-y-2">
            {status === 'done' && (
              <button
                onClick={handleApprove}
                disabled={approving}
                className="w-full flex items-center justify-center gap-2 bg-[#6467f2] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-[#6467f2]/90 shadow-md shadow-[#6467f2]/20 transition-all disabled:opacity-60 cursor-pointer"
              >
                {approving ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                    กำลังโหลด...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    Approve Brief
                  </>
                )}
              </button>
            )}
            {(status === 'done' || status === 'error') && (
              <button
                onClick={startBrief}
                className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">refresh</span>
                Regenerate
              </button>
            )}
          </div>
        </aside>

        {/* Right panel — Brief content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div ref={contentRef} className="flex-1 overflow-y-auto p-8">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            {status === 'idle' && !briefText && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-5xl mb-3">description</span>
                <p className="text-sm">กำลังเตรียมสร้าง brief...</p>
              </div>
            )}

            {(status === 'streaming' || status === 'done' || briefText) && (
              <div className="max-w-3xl">
                <div className="bg-white rounded-xl border border-slate-200 p-8">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                    <span className="material-symbols-outlined text-[#6467f2]">article</span>
                    <h3 className="font-bold text-slate-900">Content Brief</h3>
                    {status === 'streaming' && (
                      <span className="ml-auto flex items-center gap-1.5 text-xs text-[#6467f2] font-medium">
                        <span className="size-1.5 bg-[#6467f2] rounded-full animate-pulse" />
                        Generating...
                      </span>
                    )}
                    {status === 'done' && (
                      <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Ready
                      </span>
                    )}
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                    {briefText}
                    {status === 'streaming' && (
                      <span className="markdown-cursor" />
                    )}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
