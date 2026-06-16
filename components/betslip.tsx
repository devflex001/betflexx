"use client"

import * as React from "react"
import { useBetStore } from "@/hooks/use-bet-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, X, Wallet, AlertCircle, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BetslipProps {
  onClose?: () => void
}

export function Betslip({ onClose }: BetslipProps) {
  const {
    betslip,
    walletBalance,
    user,
    removeFromBetslip,
    clearBetslip,
    placeBet,
  } = useBetStore()

  const [stake, setStake] = React.useState("100")
  const [betType, setBetType] = React.useState<"multi" | "single">("multi")

  // Fast preset stake buttons
  const presets = [50, 100, 200, 500, 1000]

  // Calculate total odds
  const totalOdds = React.useMemo(() => {
    if (betslip.length === 0) return 0
    return parseFloat(betslip.reduce((acc, item) => acc * item.odds, 1).toFixed(2))
  }, [betslip])

  // Calculate potential returns
  const parsedStake = parseFloat(stake) || 0
  const potentialReturn = React.useMemo(() => {
    if (betType === "multi") {
      return parseFloat((parsedStake * totalOdds).toFixed(2))
    } else {
      // Sum of returns for each single bet (assuming same stake per single)
      return parseFloat(betslip.reduce((acc, item) => acc + (parsedStake * item.odds), 0).toFixed(2))
    }
  }, [betslip, totalOdds, parsedStake, betType])

  const handlePlaceBet = () => {
    if (!user) {
      toast.error("Please login to place bets")
      return
    }

    if (betslip.length === 0) {
      toast.error("Your betslip is empty")
      return
    }

    if (isNaN(parsedStake) || parsedStake <= 0) {
      toast.error("Please enter a valid stake amount")
      return
    }

    const actualCost = betType === "multi" ? parsedStake : parsedStake * betslip.length

    if (actualCost > walletBalance) {
      toast.error("Insufficient wallet balance. Please deposit funds first.")
      return
    }

    // Call store methods
    if (betType === "multi") {
      const success = placeBet(parsedStake)
      if (success) {
        toast.success(`Bet placed successfully! Accumulator return: KES ${potentialReturn.toLocaleString()}`)
        if (onClose) onClose()
      } else {
        toast.error("Failed to place bet. Try again.")
      }
    } else {
      // Place as a bundle fallback
      const success = placeBet(actualCost)
      if (success) {
        toast.success(`Single bets placed successfully! Est. return: KES ${potentialReturn.toLocaleString()}`)
        if (onClose) onClose()
      } else {
        toast.error("Failed to place bets.")
      }
    }
  }

  const selectPreset = (val: number) => {
    setStake(val.toString())
  }

  if (betslip.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-8 text-center text-muted-foreground h-full gap-3">
        <div className="rounded-full bg-muted/60 p-4 border border-dashed border-border">
          <Trash2 className="size-8 text-muted-foreground/50" />
        </div>
        <p className="font-semibold text-foreground text-sm">Betslip is empty</p>
        <p className="text-xs max-w-[200px]">
          Click on any odds (1, X, 2) on match cards to add selections.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-card text-card-foreground">
      {/* Header bar actions */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/10 text-xs">
        <span className="font-semibold text-muted-foreground">{betslip.length} Selections</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearBetslip}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-7 px-2"
        >
          Clear All
        </Button>
      </div>

      {/* Selections scroll area */}
      <ScrollArea className="flex-1 px-4 py-2 border-b border-border">
        <div className="space-y-3 py-2">
          {betslip.map((item) => (
            <div key={item.id} className="relative flex flex-col gap-1 p-3 rounded-md border border-border bg-muted/30 text-xs">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 size-5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                onClick={() => removeFromBetslip(item.id)}
              >
                <X className="size-3" />
              </Button>

              {/* Match details */}
              <span className="font-semibold text-muted-foreground max-w-[85%] truncate">{item.matchName}</span>
              <span className="font-medium text-[10px] text-muted-foreground">{item.market}</span>

              {/* Chosen outcome and odds */}
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-foreground">
                  Your pick: {item.selectionName} ({item.selection})
                </span>
                <span className="font-bold text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">
                  @ {item.odds.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Betting actions and inputs */}
      <div className="p-4 bg-muted/20 border-t border-border space-y-4">
        {/* Bet type selector */}
        {betslip.length > 1 && (
          <Tabs value={betType} onValueChange={(v) => setBetType(v as "multi" | "single")} className="w-full">
            <TabsList className="grid grid-cols-2 h-8 w-full bg-muted/50 border border-border p-0.5">
              <TabsTrigger value="multi" className="text-xs h-7">Accumulator (Multi)</TabsTrigger>
              <TabsTrigger value="single" className="text-xs h-7">Single Bets</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Stake entry and preset selectors */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Enter Stake (KES)</span>
            {user && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Wallet className="size-3" /> Balance: KES {walletBalance.toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              type="number"
              min="10"
              placeholder="Min KES 10"
              value={stake}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStake(e.target.value)}
              className="focus-visible:ring-primary h-9"
            />
            {betType === "single" && betslip.length > 1 && (
              <span className="text-[10px] text-muted-foreground self-center shrink-0">
                x {betslip.length} slips
              </span>
            )}
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {presets.map((val) => (
              <Button
                key={val}
                variant="outline"
                size="sm"
                className={`h-7 px-2 text-xs font-mono border-border hover:bg-accent/40 ${
                  stake === val.toString() ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" : ""
                }`}
                onClick={() => selectPreset(val)}
              >
                {val}
              </Button>
            ))}
          </div>
        </div>

        {/* Odds Summary Card */}
        <div className="rounded-lg border border-border bg-card p-3.5 space-y-2 text-xs">
          {betType === "multi" ? (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Total Odds:</span>
              <span className="font-bold text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1">
                {betslip.length > 1 && <Sparkles className="size-3 text-primary animate-bounce" />}
                {totalOdds.toFixed(2)}
              </span>
            </div>
          ) : (
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Selections:</span>
              <span className="font-semibold">{betslip.length} separate bets</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-1 border-t border-border">
            <span className="text-muted-foreground font-medium">Total Cost:</span>
            <span className="font-bold font-mono">
              KES {(betType === "multi" ? parsedStake : parsedStake * betslip.length).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center pt-1.5 border-t border-border">
            <span className="text-foreground font-bold text-sm">Potential Returns:</span>
            <span className="font-extrabold font-mono text-sm text-foreground">
              KES {potentialReturn.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Place bet submit button */}
        <div className="space-y-2">
          {user && (betType === "multi" ? parsedStake : parsedStake * betslip.length) > walletBalance && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-destructive justify-center bg-destructive/10 p-2 rounded">
              <AlertCircle className="size-3.5 shrink-0" />
              Insufficient wallet balance.
            </div>
          )}

          <Button
            onClick={handlePlaceBet}
            className="w-full bg-primary text-primary-foreground font-bold hover:opacity-95 text-xs h-10"
            disabled={
              user ? (betType === "multi" ? parsedStake : parsedStake * betslip.length) > walletBalance : false
            }
          >
            {!user
              ? "Log In to Place Bet"
              : `Place Bet (KES ${(betType === "multi" ? parsedStake : parsedStake * betslip.length).toLocaleString()})`}
          </Button>
        </div>
      </div>
    </div>
  )
}
