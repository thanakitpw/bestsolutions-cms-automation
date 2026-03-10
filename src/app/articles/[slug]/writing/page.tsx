'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WritingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()

  const [text, setText] = useState('')
  const [status, setStatus] = useState<'streaming' | 'done' | 'error'>('streaming')
  const [error, setError] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [tokenInfo, setTokenInfo] = useState<{ input: number; output: number; total: number } | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    startArticle()
    return () => abortRef.current?.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    setWordCount(words)
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [text])

  const startArticle = async () => {
    abortRef.current = new AbortController()
    setText('')
    setStatus('streaming')
    setError('')

    try {
      const res = await fetch('/api/ai/article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) throw new Error('Failed to start article generation')

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
            if (json.text) setText((prev) => prev + json.text)
            if (json.done) {
              setStatus('done')
              setTokenInfo(json.usage)
            }
          } catch {
            // skip
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
      setStatus('error')
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
    setStatus('done')
  }

  const handleGoToEditor = () => {
    router.push(`/articles/${slug}/edit`)
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-[#6467f2] rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[18px]">rocket_launch</span>
          </div>
          <span className="text-slate-300 text-sm font-semibold">SEO Studio</span>
          <span className="text-slate-600 text-xs">— AI Writing</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full">
              <span className="material-symbols-outlined text-slate-400 text-sm">text_fields</span>
              <span className="text-slate-300 text-xs font-mono font-bold">{wordCount.toLocaleString()} words</span>
            </div>
            {tokenInfo && (
              <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full">
                <span className="material-symbols-outlined text-slate-400 text-sm">bolt</span>
                <span className="text-slate-300 text-xs font-mono font-bold">
                  {tokenInfo.total.toLocaleString()} tokens
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto px-8 py-6" ref={contentRef}>
          <div className="max-w-3xl mx-auto">
            {/* Title area */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="size-1.5 rounded-full bg-[#6467f2] animate-pulse" />
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                  {status === 'streaming' ? 'AI กำลังเขียนบทความ...' : status === 'done' ? 'เสร็จสิ้น' : 'เกิดข้อผิดพลาด'}
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-200 leading-relaxed">
              {text}
              {status === 'streaming' && <span className="markdown-cursor" />}
            </pre>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="h-16 border-t border-slate-800 flex items-center justify-between px-8 shrink-0 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6467f2] rounded-full transition-all duration-300"
                style={{
                  width: status === 'done' ? '100%' : `${Math.min((wordCount / 1500) * 100, 95)}%`,
                }}
              />
            </div>
            <span className="text-slate-400 text-xs">{wordCount} / ~1,500 words</span>
          </div>

          <div className="flex items-center gap-3">
            {status === 'streaming' && (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">stop</span>
                Stop Generation
              </button>
            )}
            <button
              onClick={handleGoToEditor}
              disabled={status === 'streaming' || !text}
              className="flex items-center gap-2 px-4 py-2 bg-[#6467f2] hover:bg-[#6467f2]/90 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">edit_document</span>
              {status === 'done' ? 'Open Editor' : 'Export Draft'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
