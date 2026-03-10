'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', icon: 'dashboard', label: 'แดชบอร์ด' },
  { href: '/clusters', icon: 'layers', label: 'คลาสเตอร์คำหลัก' },
  { href: '/articles', icon: 'description', label: 'เนื้อหา' },
  { href: '/analytics', icon: 'bar_chart', label: 'การวิเคราะห์' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-screen">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-[#6467f2] rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined">rocket_launch</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-slate-900 text-base font-bold leading-tight">SEO Studio</h1>
            <p className="text-slate-500 text-xs">เครื่องมือจัดการ SEO</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-[#6467f2]/10 text-[#6467f2]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-slate-200 space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-[24px]">settings</span>
          <span>การตั้งค่า</span>
        </Link>
        <div className="flex items-center gap-3 px-3 py-3 mt-2">
          <div className="size-8 rounded-full bg-[#6467f2]/20 flex items-center justify-center text-[#6467f2] font-bold text-xs shrink-0">
            BS
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <p className="text-sm font-medium truncate">Best Solutions</p>
            <p className="text-xs text-slate-500 truncate">Pro Plan</p>
          </div>
          <button
            onClick={handleSignOut}
            title="ออกจากระบบ"
            className="size-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
