import { createServiceClient } from '@/lib/supabase'
import { Keyword } from '@/types'
import DashboardClient from '@/components/dashboard/DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  let keywords: Keyword[] = []
  let totalTokens = 0
  let articlesGenerated = 0

  try {
    const supabase = createServiceClient()
    const [kwResult, artResult] = await Promise.all([
      supabase.from('keywords').select('*').order('cluster').order('created_at'),
      supabase.from('articles').select('token_usage, status'),
    ])

    if (!kwResult.error && kwResult.data) keywords = kwResult.data

    if (!artResult.error && artResult.data) {
      for (const art of artResult.data) {
        if (art.token_usage?.total) {
          totalTokens += art.token_usage.total
          articlesGenerated++
        }
      }
    }
  } catch {
    // Table not yet created — show empty state
  }

  // Estimate cost: ~$3/MTok input + $15/MTok output, roughly $6/MTok avg, 1 USD ≈ 35 THB
  const estimatedCostTHB = Math.round((totalTokens / 1_000_000) * 6 * 35)

  return (
    <DashboardClient
      keywords={keywords}
      totalTokens={totalTokens}
      articlesGenerated={articlesGenerated}
      estimatedCostTHB={estimatedCostTHB}
    />
  )
}
