"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { ArrowLeft } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MarketsBrowser,
  type SportsMatchWithOdds,
} from "@/components/markets-panel"

export default function MatchMarketsPage() {
  const params = useParams<{ sourceMatchId: string }>()
  const router = useRouter()
  const sourceMatchId = params.sourceMatchId
  const match = useQuery(
    api.sportsData.getMatchWithMainOdds,
    sourceMatchId ? { sourceMatchId } : "skip"
  ) as SportsMatchWithOdds | null | undefined

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b border-border bg-background px-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          onClick={() => router.back()}
          aria-label="Back"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold">
            {match ? `${match.homeTeam} vs ${match.awayTeam}` : "Markets"}
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            {match?.competitionName ?? "Loading match details"}
          </p>
        </div>
      </header>

      {!match && match !== null && (
        <div className="space-y-3 p-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      )}

      {match === null && (
        <div className="p-6 text-center text-sm text-muted-foreground">
          Match not found.
        </div>
      )}

      {match && (
        <MarketsBrowser
          match={match}
          queryEnabled
          mode="page"
          className="pb-6"
        />
      )}
    </main>
  )
}
