import { KeywordStatus } from '@/types'

const STATUS_CONFIG: Record<KeywordStatus, { label: string; className: string }> = {
  pending: {
    label: 'รอดำเนินการ',
    className: 'bg-amber-100 text-amber-700',
  },
  'generating-brief': {
    label: 'กำลังสร้าง Brief...',
    className: 'bg-[#6467f2]/10 text-[#6467f2]',
  },
  'brief-ready': {
    label: 'Brief พร้อมแล้ว',
    className: 'bg-blue-100 text-blue-700',
  },
  'generating-article': {
    label: 'กำลังเขียน...',
    className: 'bg-[#6467f2]/10 text-[#6467f2]',
  },
  draft: {
    label: 'ร่าง',
    className: 'bg-slate-100 text-slate-600',
  },
  review: {
    label: 'รอตรวจสอบ',
    className: 'bg-orange-100 text-orange-700',
  },
  published: {
    label: 'เผยแพร่แล้ว',
    className: 'bg-emerald-100 text-emerald-700',
  },
}

export default function StatusBadge({ status }: { status: KeywordStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
