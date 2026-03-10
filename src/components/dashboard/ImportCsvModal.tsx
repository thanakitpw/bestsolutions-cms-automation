'use client'

import { useState, useRef } from 'react'
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

export default function ImportCsvModal({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState(1)
  const [rows, setRows] = useState<CsvRow[]>([])
  const [duplicateSlugs, setDuplicateSlugs] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ inserted: number; skipped: number; message: string } | null>(null)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const parseFile = (file: File) => {
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
        // Refresh to get the actual inserted records
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-[640px] bg-[#f6f6f8] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#6467f2]/10 rounded-lg">
              <span className="material-symbols-outlined text-[#6467f2] text-2xl">upload_file</span>
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">SEO Studio</h2>
              <p className="text-xs text-slate-500">เครื่องมือจัดการข้อมูล SEO</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-lg h-10 w-10 hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Progress */}
        <div className="flex flex-col gap-3 px-8 pt-6 bg-white">
          <div className="flex gap-6 justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[#6467f2] text-xs font-bold uppercase tracking-wider">ขั้นตอนการทำงาน</span>
              <p className="text-slate-900 text-base font-semibold leading-normal">ขั้นตอนที่ {step} จาก 3</p>
            </div>
            <p className="text-[#6467f2] text-sm font-bold bg-[#6467f2]/10 px-2 py-1 rounded">{stepPct}%</p>
          </div>
          <div className="rounded-full bg-slate-200 h-2 w-full overflow-hidden">
            <div className="h-full rounded-full bg-[#6467f2] transition-all duration-500" style={{ width: `${stepPct}%` }} />
          </div>
          <div className="flex items-center gap-2 text-slate-500 pb-4">
            <span className="material-symbols-outlined text-sm">description</span>
            <p className="text-sm font-medium">
              {step === 1 && 'อัปโหลดไฟล์ CSV สำหรับวิเคราะห์คีย์เวิร์ด'}
              {step === 2 && `ตรวจสอบ ${rows.length} rows ก่อน import`}
              {step === 3 && 'Import เสร็จสมบูรณ์'}
            </p>
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <>
            <div className="px-8 pt-8 pb-4 text-center bg-white">
              <h3 className="text-slate-900 text-2xl font-bold leading-tight tracking-tight">นำเข้าข้อมูลจากไฟล์ CSV</h3>
              <p className="text-slate-500 mt-2 text-sm">อัปโหลดไฟล์ keywords พร้อม columns: title, primary_keyword, slug, cluster, content_type, priority</p>
            </div>
            <div className="px-8 py-4 bg-white">
              <div
                onDrop={handleFileDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileRef.current?.click()}
                className={`flex flex-col items-center gap-6 rounded-xl border-2 border-dashed px-6 py-12 transition-all cursor-pointer group ${
                  isDragging ? 'border-[#6467f2] bg-[#6467f2]/5' : 'border-slate-300 bg-slate-50/50 hover:border-[#6467f2]/50 hover:bg-[#6467f2]/5'
                }`}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="size-16 rounded-full bg-[#6467f2]/10 flex items-center justify-center text-[#6467f2] group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-slate-900 text-lg font-bold">ลากและวางไฟล์ที่นี่</p>
                    <p className="text-slate-500 text-sm text-center max-w-[320px]">
                      หรือคลิกเพื่อเลือกไฟล์<br />
                      <span className="text-xs font-semibold bg-slate-200 px-2 py-0.5 rounded text-slate-600">(รองรับเฉพาะไฟล์ .csv เท่านั้น)</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex items-center justify-center rounded-lg h-11 px-6 bg-[#6467f2] text-white text-sm font-bold shadow-lg shadow-[#6467f2]/20 hover:bg-[#6467f2]/90 transition-all"
                  onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }}
                >
                  เลือกไฟล์จากเครื่อง
                </button>
              </div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            </div>
            <div className="px-8 pb-8 pt-2 bg-white">
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-lg">
                <span className="material-symbols-outlined text-amber-600">info</span>
                <div>
                  <p className="text-amber-800 text-sm font-semibold">คำแนะนำ:</p>
                  <p className="text-amber-700 text-xs leading-relaxed mt-0.5">
                    ตรวจสอบ header column ให้ตรงตามรูปแบบ{' '}
                    <a href="/api/keywords/template" className="underline font-bold hover:text-amber-900">ดาวน์โหลด template ที่นี่</a>
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                <button onClick={onClose} className="text-slate-500 font-bold text-sm hover:text-slate-900 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">arrow_back</span>ยกเลิก
                </button>
                <button disabled className="opacity-50 cursor-not-allowed flex items-center justify-center rounded-lg h-11 px-6 bg-slate-900 text-white text-sm font-bold">
                  ถัดไป
                </button>
              </div>
            </div>
          </>
        )}

        {/* Step 2: Preview */}
        {step === 2 && (
          <div className="p-8 space-y-4 bg-white">
            <div>
              <h3 className="text-xl font-bold">ตรวจสอบข้อมูลก่อน Import</h3>
              <p className="text-sm text-slate-500 mt-1">พบ {rows.length} rows · {duplicateSlugs.size > 0 ? `${duplicateSlugs.size} slug ซ้ำ (จะข้ามอัตโนมัติ)` : 'ไม่มี slug ซ้ำ'}</p>
            </div>
            {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}
            <div className="overflow-auto max-h-64 rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0">
                  <tr>
                    <th className="px-3 py-2">title</th>
                    <th className="px-3 py-2">slug</th>
                    <th className="px-3 py-2">cluster</th>
                    <th className="px-3 py-2">type</th>
                    <th className="px-3 py-2">priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.slice(0, 50).map((row, i) => (
                    <tr key={i} className={duplicateSlugs.has(row.slug) ? 'bg-amber-50' : ''}>
                      <td className="px-3 py-2 max-w-[200px] truncate">{row.title}</td>
                      <td className="px-3 py-2 max-w-[180px] truncate">{row.slug}</td>
                      <td className="px-3 py-2">{row.cluster}</td>
                      <td className="px-3 py-2">{row.content_type}</td>
                      <td className="px-3 py-2">{row.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button onClick={() => setStep(1)} className="text-slate-500 font-bold text-sm hover:text-slate-900 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">arrow_back</span>ย้อนกลับ
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg h-11 px-8 bg-[#6467f2] text-white text-sm font-bold shadow-lg shadow-[#6467f2]/20 hover:bg-[#6467f2]/90 transition-all disabled:opacity-60"
              >
                {loading ? 'กำลัง Import...' : `Import ${rows.length} keywords`}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && result && (
          <div className="p-8 bg-white text-center space-y-4">
            <div className="size-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-emerald-600 text-3xl">check_circle</span>
            </div>
            <h3 className="text-xl font-bold">{result.message}</h3>
            <p className="text-slate-500 text-sm">เพิ่ม {result.inserted} | ข้าม {result.skipped}</p>
            <button onClick={onClose} className="mt-4 px-8 h-11 rounded-lg bg-[#6467f2] text-white font-bold">
              ปิด
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
