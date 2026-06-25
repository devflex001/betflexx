"use client"

import React, { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Skeleton } from "@/components/ui/skeleton"
import { MatchEventDetail } from "@/components/match-event-detail"
import type { SportsMatchWithOdds } from "@/components/markets-panel"

export default function MatchMarketsPage() {
  const params = useParams<{ sourceMatchId: string }>()
  const router = useRouter()
  const sourceMatchId = params.sourceMatchId
  const isMobile = useMediaQuery("(max-width: 768px)")

  const match = useQuery(
    api.sportsData.getMatchWithMainOdds,
    sourceMatchId ? { sourceMatchId } : "skip"
  ) as SportsMatchWithOdds | null | undefined

  useEffect(() => {
    if (match) {
      document.title = `${match.homeTeam} vs ${match.awayTeam} - Markets | BetixPro`
    } else {
      document.title = "Match Markets | BetixPro"
    }
  }, [match])

  if (!sourceMatchId) {
    return <div className="p-6 text-center text-sm text-muted-foreground">Invalid match ID</div>
  }

  const matchName = match ? `${match.homeTeam} vs ${match.awayTeam}` : "Markets"
  const competition = match?.competitionName || ""

  const content = match && (
    <MatchEventDetail match={match} onBack={() => router.back()} />
  )

  if (isMobile) {
    return (
      <Drawer open={!!match} onOpenChange={(open) => !open && router.back()}>
        <DrawerContent className="h-[90vh] flex flex-col overflow-hidden p-0 bg-card">
          {!match ? (
            <DrawerHeader className="shrink-0 border-b border-border px-4 py-3">
              <Skeleton className="h-6 w-40" />
            </DrawerHeader>
          ) : (
            <>
              <DrawerHeader className="shrink-0 border-b border-border px-4 py-3 text-left">
                <DrawerTitle className="truncate text-sm font-semibold">{matchName}</DrawerTitle>
                <p className="truncate text-xs text-muted-foreground">{competition}</p>
              </DrawerHeader>
              {content}
            </>
          )}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet open={!!match} onOpenChange={(open) => !open && router.back()}>
      <SheetContent
        side="right"
        className="!w-[min(50vw,720px)] !max-w-none flex h-dvh flex-col overflow-hidden p-0 bg-card"
      >
        {!match ? (
          <SheetHeader className="shrink-0 border-b border-border px-4 py-3">
            <Skeleton className="h-6 w-40" />
          </SheetHeader>
        ) : (
          <>
            <SheetHeader className="shrink-0 border-b border-border px-4 py-3 text-left">
              <SheetTitle className="truncate text-sm font-semibold">{matchName}</SheetTitle>
              <p className="truncate text-xs text-muted-foreground">{competition}</p>
            </SheetHeader>
            {content}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
