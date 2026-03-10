import { createServiceClient } from '@/lib/supabase'
import { Keyword } from '@/types'
import DashboardClient from '@/components/dashboard/DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  let keywords: Keyword[] = []

  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('keywords')
      .select('*')
      .order('cluster')
      .order('created_at')

    if (!error && data) keywords = data
  } catch {
    // Table not yet created — show empty state
  }

  return <DashboardClient keywords={keywords} />
}
