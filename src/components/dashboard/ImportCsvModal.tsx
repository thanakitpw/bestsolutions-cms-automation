'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Keyword } from '@/types'
import Papa from 'papaparse'

interface CsvRow {
  title: string
  primary_keyword: string
  slug: string
  cluster: string
  content_type: string
  priority: string
}

interface Props {
  onClose: () => void
  onSuccess: (keywords: Keyword[]) => void
}

const STEP_LABELS = ['Upload CSV', 'Review Keywords', 'Complete']

export default function ImportCsvModal({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState(1)
  const [rows, setRows] = useState<CsvRow[]>([])
  const [fileName, setFileName] = useState('')
  const [duplicateSlugs, setDuplicateSlugs] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ inserted: number; skipped: number; message: string } | null>(null)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const parseFile = (file: File) => {
    setFileName(file.name)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as CsvRow[]
        const slugMap = new Map<string, number>()
        const dupes = new Set<string>()
        for (const row of data) {
          const count = slugMap.get(row.slug) ?? 0
          if (count > 0) dupes.add(row.slug)
          slugMap.set(row.slug, count + 1)
        }
        setRows(data)
        setDuplicateSlugs(dupes)
        setStep(2)
      },
      error: () => setError('ไม่สามารถอ่านไฟล์ได้'),
    })
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.csv')) parseFile(file)
    else setError('รองรับเฉพาะไฟล์ .csv เท่านั้น')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
  }

  const handleConfirm = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/keywords/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      setStep(3)
      if (data.inserted > 0) {
        const kwRes = await fetch('/api/keywords')
        const keywords = await kwRes.json()
        setTimeout(() => onSuccess(keywords), 1500)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const stepPct = step === 1 ? 33 : step === 2 ? 66 : 100
  const newCount = rows.length - duplicateSlugs.size

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[640px] rounded-xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-[#6467f2]/10 text-[#6467f2] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
            </div>
            <div>
              <h2 className="text-slate-900 text-lg font-bold leading-tight">Import Keywords</h2>
              <p className="text-slate-500 text-xs font-medium">SEO Studio Professional</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Progress */}
        <div className="px-8 pt-6 pb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-[#6467f2]">
              Step {step}: {STEP_LABELS[step - 1]}
            </span>
            <span className="text-xs font-medium text-slate-400">{stepPct}% Complete</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#6467f2] rounded-full transition-all duration-500"
              style={{ width: `${stepPct}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <main className="p-8 overflow-y-auto max-h-[60vh]">

          {/* Step 1 — Upload */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900">Upload your CSV file</h3>
                <p className="text-slate-500 mt-1 text-sm">Select a file containing your SEO keywords data.</p>
              </div>
              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
              )}
              <div
                onDrop={handleFileDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileRef.current?.click()}
                className={`flex flex-col items-center gap-4 rounded-xl border-2 border-dashed px-6 py-12 transition-all cursor-pointer ${
                  isDragging
                    ? 'border-[#6467f2] bg-[#6467f2]/5'
                    : 'border-slate-200 bg-slate-50/50 hover:border-[#6467f2]/50 hover:bg-[#6467f2]/5'
                }`}
              >
                <div className="size-16 bg-white rounded-full shadow-sm flex items-center justify-center text-[#6467f2]">
                  <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                </div>
                <div className="text-center">
                  <p className="text-slate-900 text-base font-bold">Drag and drop CSV file here</p>
                  <p className="text-slate-500 text-sm mt-1">or click to browse from your computer</p>
                  <p className="text-slate-400 text-xs mt-3">
                    Required columns: title, primary_keyword, slug, cluster, content_type, priority
                  </p>
                </div>
              </div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              <div className="text-center">
                <Link href="/api/keywords/template" className="text-xs font-bold text-[#6467f2] hover:underline">
                  Download CSV template
                </Link>
              </div>
            </div>
          )}

          {/* Step 2 — Review */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Review Data</h3>
                  <p className="text-slate-500 mt-1 text-sm">
                    {rows.length} keywords detected in &quot;{fileName}&quot;
                  </p>
                </div>
                <div className="bg-[#6467f2]/10 text-[#6467f2] px-3 py-1 rounded-full text-xs font-bold">
                  {rows.length} Total
                </div>
              </div>
              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
              )}
              {duplicateSlugs.size > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                    {newCount} new
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                    {duplicateSlugs.size} duplicates (will be skipped)
                  </span>
                </div>
              )}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Keyword</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Cluster</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.slice(0, 5).map((row, i) => (
                      <tr key={i} className={duplicateSlugs.has(row.slug) ? 'bg-amber-50' : ''}>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900 max-w-[220px] truncate">
                          {row.title}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">{row.cluster}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            row.priority === 'High'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {row.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 5 && (
                  <div className="px-4 py-3 bg-slate-50 text-center border-t border-slate-100">
                    <span className="text-xs font-bold text-[#6467f2]">
                      View all {rows.length} keywords
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3 — Success */}
          {step === 3 && result && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="size-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-5xl">check_circle</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Success!</h3>
              <p className="text-slate-500 max-w-xs mx-auto">
                {result.inserted} keywords have been successfully imported into your dashboard.
              </p>
              {result.skipped > 0 && (
                <p className="text-slate-400 text-sm mt-1">{result.skipped} duplicates skipped</p>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-slate-100 px-8 py-6 bg-slate-50">
          {step === 1 && (
            <>
              <button
                onClick={onClose}
                className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2"
              >
                Cancel
              </button>
              <button
                disabled
                className="bg-[#6467f2]/40 text-white text-sm font-bold px-6 py-2 rounded-lg cursor-not-allowed"
              >
                Next →
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
                className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2"
              >
                Back
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="bg-[#6467f2] text-white text-sm font-bold px-6 py-2 rounded-lg hover:bg-[#6467f2]/90 shadow-lg shadow-[#6467f2]/20 transition-all disabled:opacity-60"
                >
                  {loading ? 'Importing...' : 'Import Keywords'}
                </button>
              </div>
            </>
          )}
          {step === 3 && (
            <button
              onClick={onClose}
              className="w-full bg-white border border-slate-200 text-slate-700 text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}
