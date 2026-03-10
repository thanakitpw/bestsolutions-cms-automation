'use client'

import { useState } from 'react'
import { Keyword } from '@/types'

interface Props {
  onClose: () => void
  onSuccess: (kw: Keyword) => void
}

export default function AddKeywordModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    title: '',
    primary_keyword: '',
    slug: '',
    cluster: '',
    content_type: 'Blog',
    priority: 'High',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    setForm((p) => ({ ...p, title, slug }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'เกิดข้อผิดพลาด')
      onSuccess(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-200/50">
      <div className="w-full max-w-[480px] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-slate-900 text-xl font-bold leading-tight">Add New Keyword</h2>
              <p className="text-slate-500 text-sm mt-1">เพิ่มรายละเอียดสำหรับบทความ SEO ใหม่ของคุณ</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Article Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-semibold">
                Article Title / หัวข้อบทความ
              </label>
              <textarea
                required
                className="w-full rounded-lg border border-slate-200 focus:border-[#6467f2] focus:ring-2 focus:ring-[#6467f2]/20 text-slate-900 placeholder:text-slate-400 text-sm min-h-[80px] px-3 py-2.5 transition-all resize-none outline-none"
                placeholder="Enter the full title of your article..."
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            {/* Primary Keyword */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-semibold">
                Primary Keyword / คีย์เวิร์ดหลัก
              </label>
              <input
                required
                type="text"
                className="h-11 w-full rounded-lg border border-slate-200 focus:border-[#6467f2] focus:ring-2 focus:ring-[#6467f2]/20 text-slate-900 placeholder:text-slate-400 text-sm px-3 transition-all outline-none"
                placeholder="e.g. SEO Best Practices 2024"
                value={form.primary_keyword}
                onChange={(e) => setForm((p) => ({ ...p, primary_keyword: e.target.value }))}
              />
            </div>

            {/* Slug */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-semibold">
                Slug / ลิงก์ถาวร
              </label>
              <div className="relative flex items-center">
                <input
                  required
                  type="text"
                  className="h-11 w-full rounded-lg border border-slate-200 focus:border-[#6467f2] focus:ring-2 focus:ring-[#6467f2]/20 text-slate-900 placeholder:text-slate-400 text-sm px-3 pr-10 transition-all outline-none"
                  placeholder="seo-best-practices-2024"
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                />
                <div className="absolute right-3 text-slate-400">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
              </div>
            </div>

            {/* Cluster */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-semibold">
                Cluster / กลุ่มเนื้อหา
              </label>
              <input
                required
                type="text"
                list="cluster-suggestions"
                className="h-11 w-full rounded-lg border border-slate-200 focus:border-[#6467f2] focus:ring-2 focus:ring-[#6467f2]/20 text-slate-900 placeholder:text-slate-400 text-sm px-3 transition-all outline-none"
                placeholder="e.g. AI & Automation"
                value={form.cluster}
                onChange={(e) => setForm((p) => ({ ...p, cluster: e.target.value }))}
              />
              <datalist id="cluster-suggestions">
                <option value="AI & Automation" />
                <option value="Technical SEO & Core Web Vitals" />
                <option value="Content Marketing" />
                <option value="Digital Marketing" />
              </datalist>
            </div>

            {/* Content Type + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 text-sm font-semibold">Content Type</label>
                <select
                  className="h-11 w-full rounded-lg border border-slate-200 focus:border-[#6467f2] focus:ring-2 focus:ring-[#6467f2]/20 text-slate-900 text-sm px-3 transition-all outline-none"
                  value={form.content_type}
                  onChange={(e) => setForm((p) => ({ ...p, content_type: e.target.value }))}
                >
                  <option value="Blog">Blog Post</option>
                  <option value="Pillar Page">Pillar Page</option>
                  <option value="Landing Page">Landing Page</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 text-sm font-semibold">Priority</label>
                <select
                  className="h-11 w-full rounded-lg border border-slate-200 focus:border-[#6467f2] focus:ring-2 focus:ring-[#6467f2]/20 text-slate-900 text-sm px-3 transition-all outline-none"
                  value={form.priority}
                  onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                >
                  <option value="High">🔥 High</option>
                  <option value="Medium">⚡ Medium</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-[#6467f2] text-white font-semibold text-sm hover:bg-[#6467f2]/90 shadow-sm shadow-[#6467f2]/20 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              <span>{loading ? 'Saving...' : 'Add Keyword'}</span>
              {!loading && <span className="material-symbols-outlined text-[18px]">add</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
