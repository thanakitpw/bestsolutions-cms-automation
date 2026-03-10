'use client'

export default function SettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center sticky top-0 z-10">
        <h2 className="text-xl font-bold text-slate-900">การตั้งค่า</h2>
      </header>

      <div className="p-8 max-w-2xl space-y-6">
        {/* Site Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">ข้อมูลเว็บไซต์</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">ชื่อบริษัท</label>
              <input
                type="text"
                defaultValue="Best Solutions Corp"
                disabled
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Domain</label>
              <input
                type="text"
                defaultValue="bestsolutionscorp.com"
                disabled
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">แก้ไขค่าเหล่านี้ได้ใน environment variables</p>
        </div>

        {/* AI Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">AI Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-700">Model</p>
                <p className="text-xs text-slate-400">Claude Sonnet 4.6</p>
              </div>
              <span className="px-2.5 py-1 bg-[#6467f2]/10 text-[#6467f2] text-xs font-bold rounded-lg">Active</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-700">Prompt Caching</p>
                <p className="text-xs text-slate-400">ลดต้นทุน input tokens</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">Enabled</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-700">Target cost/article</p>
                <p className="text-xs text-slate-400">เป้าหมายค่าใช้จ่ายต่อบทความ</p>
              </div>
              <span className="text-sm font-bold text-slate-700">≤ ฿25</span>
            </div>
          </div>
        </div>

        {/* Version */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-3">เวอร์ชัน</h3>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-mono font-bold rounded-lg">v1.0.0</span>
            <span className="text-xs text-slate-400">SEO Studio — Built with Next.js 16 + Supabase + Claude API</span>
          </div>
        </div>
      </div>
    </div>
  )
}
