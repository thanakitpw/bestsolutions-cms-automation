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
    priority: 'Medium',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-[560px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-8 rounded-lg bg-[#6467f2]/10 text-[#6467f2]">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
            </div>
            <div>
              <h2 className="text-slate-900 text-lg font-bold leading-tight">เพิ่มคำหลักใหม่</h2>
              <p className="text-slate-500 text-xs font-normal">SEO Studio Project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full size-8 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-slate-700 text-sm font-semibold">ชื่อบทความ</label>
              <input
                required
                className="w-full h-12 px-4 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#6467f2]/20 focus:border-[#6467f2] outline-none transition-all placeholder:text-slate-400"
                placeholder="ระบุชื่อบทความที่ต้องการสร้าง"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-slate-700 text-sm font-semibold">คำหลัก (Keyword)</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">key</span>
                <input
                  required
                  className="w-full h-12 pl-11 pr-4 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#6467f2]/20 focus:border-[#6467f2] outline-none transition-all placeholder:text-slate-400"
                  placeholder="ระบุคำหลักเป้าหมาย"
                  value={form.primary_keyword}
                  onChange={(e) => setForm((p) => ({ ...p, primary_keyword: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-700 text-sm font-semibold">สลัก (Slug)</label>
              <div className="flex items-center">
                <span className="h-12 px-3 flex items-center bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-slate-400 text-sm whitespace-nowrap">
                  bestsolution.co.th/blog/
                </span>
                <input
                  required
                  className="flex-1 h-12 px-4 rounded-r-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#6467f2]/20 focus:border-[#6467f2] outline-none transition-all placeholder:text-slate-400"
                  placeholder="my-new-article"
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-slate-700 text-sm font-semibold">กลุ่มเนื้อหา (Cluster)</label>
                <input
                  required
                  className="w-full h-12 px-4 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#6467f2]/20 focus:border-[#6467f2] outline-none transition-all placeholder:text-slate-400"
                  placeholder="เช่น AI & Automation"
                  value={form.cluster}
                  onChange={(e) => setForm((p) => ({ ...p, cluster: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-slate-700 text-sm font-semibold">ประเภทเนื้อหา</label>
                <select
                  className="w-full h-12 px-4 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#6467f2]/20 focus:border-[#6467f2] outline-none transition-all"
                  value={form.content_type}
                  onChange={(e) => setForm((p) => ({ ...p, content_type: e.target.value }))}
                >
                  <option value="Blog">Blog</option>
                  <option value="Pillar Page">Pillar Page</option>
                  <option value="Landing Page">Landing Page</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-700 text-sm font-semibold">ความสำคัญ (Priority)</label>
              <div className="flex gap-3">
                {(['Medium', 'High'] as const).map((p) => (
                  <label key={p} className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value={p}
                      checked={form.priority === p}
                      onChange={() => setForm((prev) => ({ ...prev, priority: p }))}
                      className="hidden peer"
                    />
                    <div className="flex items-center justify-center h-11 rounded-lg border border-slate-200 peer-checked:bg-[#6467f2]/10 peer-checked:border-[#6467f2] peer-checked:text-[#6467f2] text-slate-600 font-medium transition-all">
                      {p === 'High' ? 'สูง' : 'ปานกลาง'}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 h-11 rounded-lg text-slate-600 font-bold hover:bg-slate-200/50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 h-11 rounded-lg bg-[#6467f2] text-white font-bold hover:bg-[#6467f2]/90 shadow-lg shadow-[#6467f2]/20 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
