'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Article } from '@/types'

interface Props {
  article: Article
}

// Word limit per content type
const WORD_LIMITS: Record<string, [number, number]> = {
  'Pillar Page': [2000, 2500],
  'Blog': [1000, 1500],
  'Landing Page': [800, 1200],
}

// SEO Checklist check function
function runSeoChecklist(
  content: string,
  primaryKeyword: string,
  metaTitle: string,
  metaDesc: string,
  contentType: string
) {
  const kwLower = (primaryKeyword ?? '').toLowerCase()
  const words = content.trim() ? content.trim().split(/\s+/) : []
  const first100 = words.slice(0, 100).join(' ').toLowerCase()
  const [min, max] = WORD_LIMITS[contentType] ?? [1000, 1500]

  const hasH1 = /^#\s+/m.test(content)
  const h1Match = content.match(/^#\s+(.+)/m)
  const h1Text = h1Match ? h1Match[1].toLowerCase() : ''

  const hasSnippet = (() => {
    const paras = content.split(/\n\n+/)
    return paras.some((p) => {
      const stripped = p.replace(/[#*_`]/g, '').trim()
      const w = stripped.split(/\s+/).length
      return w >= 40 && w <= 60
    })
  })()

  const hasFaq =
    /##\s*(FAQ|คำถาม)/i.test(content) || /\*\*Q\d/i.test(content) || /\?\*\*/i.test(content)

  const internalLinks = (content.match(/\[.+?\]\(https?:\/\/bestsolutionscorp/g) || []).length

  return [
    {
      id: 'keyword-first-100',
      label: 'Primary keyword ใน 100 คำแรก',
      pass: kwLower ? first100.includes(kwLower) : false,
    },
    {
      id: 'keyword-h1',
      label: 'Primary keyword ใน H1',
      pass: hasH1 && kwLower ? h1Text.includes(kwLower) : false,
    },
    {
      id: 'featured-snippet',
      label: 'Featured Snippet paragraph (40-60 คำ)',
      pass: hasSnippet,
    },
    { id: 'faq', label: 'มี FAQ section', pass: hasFaq },
    {
      id: 'internal-links',
      label: 'Internal links ≥ 2 ลิงก์',
      pass: internalLinks >= 2,
    },
    {
      id: 'meta-title',
      label: `Meta title ≤ 60 chars (${metaTitle.length})`,
      pass: metaTitle.length > 0 && metaTitle.length <= 60,
    },
    {
      id: 'meta-desc',
      label: `Meta description ≤ 155 chars (${metaDesc.length})`,
      pass: metaDesc.length > 0 && metaDesc.length <= 155,
    },
    {
      id: 'word-count',
      label: `Word count ${min}–${max} คำ (${words.length})`,
      pass: words.length >= min && words.length <= max,
    },
  ]
}

export default function EditorClient({ article }: Props) {
  const router = useRouter()

  // Content state
  const [content, setContent] = useState(article.content_md ?? '')
  const [metaTitle, setMetaTitle] = useState(article.meta_title ?? article.title ?? '')
  const [metaDesc, setMetaDesc] = useState(article.meta_description ?? '')
  const [excerpt, setExcerpt] = useState(article.excerpt ?? '')
  const [tags, setTags] = useState((article.tags ?? []).join(', '))

  // UI state
  const [activeTab, setActiveTab] = useState<'frontmatter' | 'seo'>('frontmatter')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [publishResult, setPublishResult] = useState<{ ok: boolean; postId?: string; isUpdate?: boolean } | null>(null)
  const [coverPromptLoading, setCoverPromptLoading] = useState(false)
  const [coverPrompt, setCoverPrompt] = useState(article.cover_image_prompt ?? '')
  const [coverUploading, setCoverUploading] = useState(false)
  const [coverUrl, setCoverUrl] = useState(article.cover_image_url ?? '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  const seoChecks = runSeoChecklist(
    content,
    article.primary_keyword ?? '',
    metaTitle,
    metaDesc,
    article.content_type ?? 'Blog'
  )
  const passCount = seoChecks.filter((c) => c.pass).length

  // Auto-save every 30s
  useEffect(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(() => handleSave(true), 30000)
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, metaTitle, metaDesc, excerpt, tags])

  const handleSave = useCallback(async (silent = false) => {
    if (!silent) setSaving(true)
    try {
      await fetch(`/api/articles/${article.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_md: content,
          meta_title: metaTitle,
          meta_description: metaDesc,
          excerpt,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          status: article.status === 'draft' ? 'draft' : article.status,
        }),
      })
      setSavedAt(new Date().toLocaleTimeString('th-TH'))
    } finally {
      if (!silent) setSaving(false)
    }
  }, [article.slug, article.status, content, excerpt, metaDesc, metaTitle, tags])

  const handleGenerateCoverPrompt = async () => {
    setCoverPromptLoading(true)
    try {
      const res = await fetch('/api/ai/cover-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: article.slug }),
      })
      const data = await res.json()
      if (data.prompt) setCoverPrompt(data.prompt)
    } finally {
      setCoverPromptLoading(false)
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('slug', article.slug)
      const res = await fetch('/api/upload/cover', { method: 'POST', body: form })
      const data = await res.json()
      if (data.url) setCoverUrl(data.url)
    } finally {
      setCoverUploading(false)
    }
  }

  const handlePublish = async () => {
    setPublishing(true)
    try {
      await handleSave(true)
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: article.slug }),
      })
      const data = await res.json()
      setPublishResult(data)
      if (data.ok) setTimeout(() => router.push('/dashboard'), 2500)
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <p className="text-xs text-slate-400">Article Editor</p>
            <h2 className="text-sm font-bold text-slate-900 truncate max-w-sm leading-tight">
              {article.title}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-emerald-500">check</span>
              Saved {savedAt}
            </span>
          )}
          <span className="text-xs text-slate-400 font-mono">{wordCount.toLocaleString()} words</span>
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => setShowPublishDialog(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#6467f2] text-white text-sm font-bold rounded-lg hover:bg-[#6467f2]/90 shadow-md shadow-[#6467f2]/20 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">send</span>
            Publish
          </button>
        </div>
      </header>

      {/* 3-column body */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            {(['frontmatter', 'seo'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'text-[#6467f2] border-b-2 border-[#6467f2]'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab === 'frontmatter' ? 'Frontmatter' : `SEO (${passCount}/8)`}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'frontmatter' ? (
              <>
                {/* Meta Title */}
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Meta Title</label>
                    <span className={`text-xs font-mono ${metaTitle.length > 60 ? 'text-red-500' : 'text-slate-400'}`}>
                      {metaTitle.length}/60
                    </span>
                  </div>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6467f2]/30 focus:border-[#6467f2]"
                    placeholder="ชื่อสำหรับ Google..."
                  />
                </div>

                {/* Meta Description */}
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Meta Description</label>
                    <span className={`text-xs font-mono ${metaDesc.length > 155 ? 'text-red-500' : 'text-slate-400'}`}>
                      {metaDesc.length}/155
                    </span>
                  </div>
                  <textarea
                    value={metaDesc}
                    onChange={(e) => setMetaDesc(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#6467f2]/30 focus:border-[#6467f2]"
                    placeholder="คำอธิบายสั้นๆ สำหรับ Google..."
                  />
                </div>

                {/* SERP Preview */}
                {(metaTitle || metaDesc) && (
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">SERP Preview</p>
                    <p className="text-xs text-emerald-700 mb-0.5">bestsolutionscorp.com › blog › {article.slug}</p>
                    <p className="text-sm text-blue-700 font-medium leading-tight mb-1 line-clamp-1">
                      {metaTitle || 'Meta title...'}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {metaDesc || 'Meta description...'}
                    </p>
                  </div>
                )}

                {/* Excerpt */}
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Excerpt</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#6467f2]/30 focus:border-[#6467f2]"
                    placeholder="สรุปย่อบทความ..."
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Tags</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6467f2]/30 focus:border-[#6467f2]"
                    placeholder="SEO, Digital Marketing, ..."
                  />
                  <p className="text-xs text-slate-400 mt-1">คั่นด้วย comma</p>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Cover Image</label>
                  {coverUrl ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverUrl} alt="Cover" className="w-full h-28 object-cover rounded-lg" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 text-white text-xs font-bold rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        เปลี่ยนรูป
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={coverUploading}
                      className="w-full h-20 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center gap-2 text-slate-400 text-xs font-medium hover:border-[#6467f2]/50 hover:text-[#6467f2] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-lg">{coverUploading ? 'progress_activity' : 'upload'}</span>
                      {coverUploading ? 'กำลัง upload...' : 'อัพโหลดรูปปก'}
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                </div>

                {/* Cover Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Cover Image Prompt</label>
                    <button
                      onClick={handleGenerateCoverPrompt}
                      disabled={coverPromptLoading}
                      className="text-xs text-[#6467f2] font-bold hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      {coverPromptLoading ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                  {coverPrompt ? (
                    <div className="relative">
                      <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed pr-8">
                        {coverPrompt}
                      </p>
                      <button
                        onClick={() => navigator.clipboard.writeText(coverPrompt)}
                        className="absolute top-2 right-2 size-6 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Copy"
                      >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">คลิก Generate เพื่อสร้าง prompt สำหรับรูปปก</p>
                  )}
                </div>
              </>
            ) : (
              /* SEO Checklist */
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-700">{passCount}/8 items passed</p>
                  <div className="flex-1 ml-3 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${passCount >= 7 ? 'bg-emerald-500' : passCount >= 5 ? 'bg-amber-500' : 'bg-red-400'}`}
                      style={{ width: `${(passCount / 8) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {seoChecks.map((check) => (
                    <div key={check.id} className="flex items-start gap-2.5 py-1.5">
                      <span className={`material-symbols-outlined text-lg shrink-0 mt-0.5 ${check.pass ? 'text-emerald-500' : 'text-slate-300'}`}>
                        {check.pass ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className={`text-xs leading-relaxed ${check.pass ? 'text-slate-700' : 'text-slate-400'}`}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Markdown Editor */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-200">
          <div className="h-10 bg-white border-b border-slate-100 flex items-center px-4 gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Markdown</span>
            <span className="ml-auto text-xs text-slate-400 font-mono">{wordCount} words</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 p-6 font-mono text-sm text-slate-800 bg-white resize-none focus:outline-none leading-relaxed"
            placeholder="# บทความของคุณ..."
            spellCheck={false}
          />
        </div>

        {/* Markdown Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-10 bg-white border-b border-slate-100 flex items-center px-4 shrink-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preview</span>
          </div>
          <div
            className="flex-1 overflow-y-auto p-6 prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-[#6467f2]"
            dangerouslySetInnerHTML={{
              __html: content
                .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                .replace(/^# (.+)$/gm, '<h1>$1</h1>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
                .replace(/^- (.+)$/gm, '<li>$1</li>')
                .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/^(?!<[hul])/gm, '<p>')
                .replace(/(?<![>])$/gm, '</p>'),
            }}
          />
        </div>
      </div>

      {/* Publish Dialog */}
      {showPublishDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Publish บทความนี้?</h2>
              <p className="text-sm text-slate-500 mt-1">บทความจะถูก publish ขึ้น Supabase blog_posts</p>
            </div>

            {!publishResult ? (
              <>
                <div className="p-6 space-y-3">
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Slug</span>
                      <span className="font-mono text-slate-900">{article.slug}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Title</span>
                      <span className="font-semibold text-slate-900 text-right max-w-xs truncate">{metaTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Words</span>
                      <span className="font-mono text-slate-900">{wordCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">SEO Score</span>
                      <span className={`font-bold ${passCount >= 7 ? 'text-emerald-600' : passCount >= 5 ? 'text-amber-600' : 'text-red-600'}`}>
                        {passCount}/8
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cover Image</span>
                      <span className={coverUrl ? 'text-emerald-600' : 'text-amber-600'}>
                        {coverUrl ? 'มีรูปปก ✓' : 'ไม่มีรูปปก'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-6 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => setShowPublishDialog(false)}
                    className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2 cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="flex items-center gap-2 bg-[#6467f2] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-[#6467f2]/90 shadow-md shadow-[#6467f2]/20 transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {publishing ? (
                      <>
                        <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                        กำลัง publish...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">send</span>
                        เผยแพร่ทันที
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : publishResult.ok ? (
              <div className="p-8 flex flex-col items-center text-center">
                <div className="size-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {publishResult.isUpdate ? 'อัพเดทเรียบร้อย!' : 'Publish เรียบร้อย!'}
                </h3>
                <p className="text-slate-500 text-sm">กำลังกลับไปหน้า Dashboard...</p>
              </div>
            ) : (
              <div className="p-6">
                <p className="text-red-600 text-sm">เกิดข้อผิดพลาด กรุณาลองใหม่</p>
                <button
                  onClick={() => setShowPublishDialog(false)}
                  className="mt-4 text-sm font-bold text-slate-600 cursor-pointer"
                >
                  ปิด
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
