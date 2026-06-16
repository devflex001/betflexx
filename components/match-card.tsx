"use client"

import * as React from "react"
import { type Match } from "@/lib/mock-data"
import { useBetStore } from "@/hooks/use-bet-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Share2, Flame } from "lucide-react"
import { ShareModal } from "./modals"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface MatchCardProps {
  match: Match
}

export function MatchCard({ match }: MatchCardProps) {
  const { betslip, addToBetslip } = useBetStore()
  const [shareOpen, setShareOpen] = React.useState(false)

  // Find active selections for this match
  const selected1 = betslip.find((item) => item.matchId === match.id && item.selection === "1")
  const selectedX = betslip.find((item) => item.matchId === match.id && item.selection === "X")
  const selected2 = betslip.find((item) => item.matchId === match.id && item.selection === "2")

  const handleSelection = (outcome: "1" | "X" | "2", odds: number) => {
    let selectionName = ""
    if (outcome === "1") selectionName = match.team1
    else if (outcome === "2") selectionName = match.team2
    else selectionName = "Draw"

    addToBetslip({
      id: `${match.id}-${outcome}`,
      matchId: match.id,
      matchName: `${match.team1} vs ${match.team2}`,
      team1: match.team1,
      team2: match.team2,
      market: "Full Time Result",
      selection: outcome,
      selectionName,
      odds,
    })
  }

  const matchTitle = `${match.team1} vs ${match.team2}`

  return (
    <>
      <div 
        className={`flex flex-col gap-3.5 p-4 rounded-lg bg-card border text-card-foreground hover:border-muted-foreground/30 transition-all ${
          match.isBoosted ? "border-primary/50 relative" : "border-border"
        }`}
      >
        {/* Top Info Bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium">
            <span>{match.league}</span>
            <span>•</span>
            <span>{match.marketsCount} markets</span>
          </div>

          <div className="flex items-center gap-2">
            {match.isBoosted && (
              <Badge className="bg-primary hover:bg-primary text-primary-foreground font-semibold flex items-center gap-0.5 text-[10px] h-5 px-1.5">
                <Flame className="size-3 fill-current" /> Odds Boosted
              </Badge>
            )}
            {match.status === "live" ? (
              <Badge variant="destructive" className="animate-pulse flex gap-1 items-center font-bold text-[10px] h-5 px-1.5 bg-destructive text-destructive-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                LIVE {match.time}
              </Badge>
            ) : (
              <span className="font-semibold">{match.time}</span>
            )}
          </div>
        </div>

        {/* Team Match Info */}
        <div className="flex justify-between items-center gap-4 py-1">
          <div className="flex flex-col gap-1.5 font-semibold text-sm flex-1 min-w-0">
            <div className="flex justify-between items-center gap-2">
              <span className="truncate">{match.team1}</span>
              {match.status === "live" && match.score && (
                <span className="text-primary font-bold font-mono">{match.score.split(" - ")[0]}</span>
              )}
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="truncate">{match.team2}</span>
              {match.status === "live" && match.score && (
                <span className="text-primary font-bold font-mono">{match.score.split(" - ")[1]}</span>
              )}
            </div>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground shrink-0 border border-transparent hover:border-border"
                onClick={() => setShareOpen(true)}
              >
                <Share2 className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-[10px]">Share Match Odds</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Odds Button Grid */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {/* Outcome 1 (Home Win) */}
          <Button
            variant="outline"
            className={`flex flex-col gap-0.5 h-11 py-1 px-2 border-border font-medium hover:bg-accent/40 ${
              selected1 
                ? "bg-primary text-primary-foreground border-primary hover:bg-primary/95" 
                : "text-foreground"
            }`}
            onClick={() => handleSelection("1", match.odds1)}
          >
            <span className={`text-[10px] ${selected1 ? "text-primary-foreground/80" : "text-muted-foreground"}`}>1 (Home)</span>
            <span className="text-xs font-bold font-mono">{match.odds1.toFixed(2)}</span>
          </Button>

          {/* Outcome X (Draw) */}
          {match.oddsX !== undefined ? (
            <Button
              variant="outline"
              className={`flex flex-col gap-0.5 h-11 py-1 px-2 border-border font-medium hover:bg-accent/40 ${
                selectedX 
                  ? "bg-primary text-primary-foreground border-primary hover:bg-primary/95" 
                  : "text-foreground"
              }`}
              onClick={() => handleSelection("X", match.oddsX!)}
            >
              <span className={`text-[10px] ${selectedX ? "text-primary-foreground/80" : "text-muted-foreground"}`}>X (Draw)</span>
              <span className="text-xs font-bold font-mono">{match.oddsX.toFixed(2)}</span>
            </Button>
          ) : (
            <div className="flex items-center justify-center bg-muted/20 border border-dashed border-border rounded text-[11px] text-muted-foreground h-11">
              No Draw
            </div>
          )}

          {/* Outcome 2 (Away Win) */}
          <Button
            variant="outline"
            className={`flex flex-col gap-0.5 h-11 py-1 px-2 border-border font-medium hover:bg-accent/40 ${
              selected2 
                ? "bg-primary text-primary-foreground border-primary hover:bg-primary/95" 
                : "text-foreground"
            }`}
            onClick={() => handleSelection("2", match.odds2)}
          >
            <span className={`text-[10px] ${selected2 ? "text-primary-foreground/80" : "text-muted-foreground"}`}>2 (Away)</span>
            <span className="text-xs font-bold font-mono">{match.odds2.toFixed(2)}</span>
          </Button>
        </div>
      </div>

      <ShareModal open={shareOpen} onOpenChange={setShareOpen} matchName={matchTitle} />
    </>
  )
}
