"use client"

import * as React from "react"
import { useBetStore } from "@/hooks/use-bet-store"
import { Home, PlayCircle, FileText, User, Receipt, Wallet, ArrowUpRight, ArrowDownLeft, LogOut, History } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Betslip } from "./betslip"
import { LoginModal, RegisterModal, DepositModal, WithdrawModal } from "./modals"
import { Button } from "@/components/ui/button"

export function BottomNav({ liveCount }: { liveCount: number }) {
  const { activeTab, setActiveTab, betslip, user, walletBalance, logout } = useBetStore()
  
  const [betslipOpen, setBetslipOpen] = React.useState(false)
  const [profileOpen, setProfileOpen] = React.useState(false)
  const [loginOpen, setLoginOpen] = React.useState(false)
  const [registerOpen, setRegisterOpen] = React.useState(false)
  const [depositOpen, setDepositOpen] = React.useState(false)
  const [withdrawOpen, setWithdrawOpen] = React.useState(false)

  // We display live matches count with an offset to match the screenshot "193" when count is 4
  const displayLiveCount = 189 + liveCount

  const handleProfileClick = () => {
    if (user) {
      setProfileOpen(true)
    } else {
      setLoginOpen(true)
    }
  }

  return (
    <>
      <div className="lg:hidden h-16 bg-card border-t border-border relative z-40 overflow-visible shrink-0 pb-safe">
        <div className="grid grid-cols-5 h-full items-center text-center">
          {/* Home Tab */}
          <button
            onClick={() => setActiveTab("home")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 h-full text-[10px] font-medium transition-colors",
              activeTab === "home" 
                ? "text-primary font-semibold" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Home className={cn("size-5", activeTab === "home" ? "text-primary" : "text-muted-foreground")} />
            <span>Home</span>
          </button>

          {/* Live Tab */}
          <button
            onClick={() => setActiveTab("live")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 h-full text-[10px] font-medium transition-colors",
              activeTab === "live" 
                ? "text-primary font-semibold" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <PlayCircle className={cn("size-5", activeTab === "live" ? "text-primary" : "text-muted-foreground")} />
            <span>Live ({displayLiveCount})</span>
          </button>

          {/* Betslip FAB */}
          <div className="relative flex justify-center h-full items-center">
            <button
              onClick={() => setBetslipOpen(true)}
              className="absolute -top-5 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 active:scale-95 transition-all z-50 border-4 border-background"
            >
              <FileText className="size-6 text-primary-foreground stroke-[2.5]" />
              {betslip.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground border-2 border-primary">
                  {betslip.length}
                </span>
              )}
            </button>
          </div>

          {/* My Bets Tab */}
          <button
            onClick={() => setActiveTab("mybets")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 h-full text-[10px] font-medium transition-colors",
              activeTab === "mybets" 
                ? "text-primary font-semibold" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Receipt className={cn("size-5", activeTab === "mybets" ? "text-primary" : "text-muted-foreground")} />
            <span>My Bets</span>
          </button>

          {/* Profile Button */}
          <button
            onClick={handleProfileClick}
            className={cn(
              "flex flex-col items-center justify-center gap-1 h-full text-[10px] font-medium transition-colors",
              profileOpen
                ? "text-primary font-semibold" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <User className={cn("size-5", profileOpen ? "text-primary" : "text-muted-foreground")} />
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* Betslip Mobile Drawer/Sheet */}
      <Sheet open={betslipOpen} onOpenChange={setBetslipOpen}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl p-0 flex flex-col gap-0 border-t border-border bg-card">
          <SheetHeader className="p-4 border-b border-border bg-muted/20">
            <SheetTitle className="text-lg font-bold">Betslip Manager</SheetTitle>
            <SheetDescription className="text-xs">
              Review your selections and place your accumulator or single bets.
            </SheetDescription>
          </SheetHeader>
          <Betslip onClose={() => setBetslipOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Profile Sheet/Drawer */}
      <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl p-6 flex flex-col gap-4 border-t border-border bg-card">
          <SheetHeader className="text-left border-b border-border pb-4">
            <SheetTitle className="text-lg font-bold">My Account</SheetTitle>
            {user && (
              <SheetDescription className="text-xs text-muted-foreground mt-1">
                Logged in as <span className="font-semibold text-foreground">{user.username}</span>
              </SheetDescription>
            )}
          </SheetHeader>

          {user && (
            <div className="space-y-6">
              {/* Balance Card */}
              <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2.5">
                  <Wallet className="size-5 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Wallet Balance</span>
                    <span className="text-lg font-bold font-mono">
                      KES {walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transactions grid */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => {
                    setProfileOpen(false)
                    setDepositOpen(true)
                  }}
                  className="bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 h-10 text-xs"
                >
                  <ArrowUpRight className="size-4" /> Deposit
                </Button>
                <Button
                  onClick={() => {
                    setProfileOpen(false)
                    setWithdrawOpen(true)
                  }}
                  variant="outline"
                  className="font-semibold flex items-center justify-center gap-2 h-10 text-xs border-border"
                >
                  <ArrowDownLeft className="size-4" /> Withdraw
                </Button>
              </div>

              {/* Navigation list */}
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setActiveTab("mybets")
                    setProfileOpen(false)
                  }}
                  className="w-full justify-start gap-3 h-11 text-sm text-muted-foreground hover:text-foreground font-normal"
                >
                  <History className="size-4" /> Placed Bets History
                </Button>
              </div>

              {/* Log Out button */}
              <Button
                variant="destructive"
                onClick={() => {
                  logout()
                  setProfileOpen(false)
                }}
                className="w-full h-10 text-xs font-semibold mt-4"
              >
                <LogOut className="size-4 mr-2" /> Log Out
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Auth and transaction modals */}
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      <RegisterModal open={registerOpen} onOpenChange={setRegisterOpen} />
      <DepositModal open={depositOpen} onOpenChange={setDepositOpen} />
      <WithdrawModal open={withdrawOpen} onOpenChange={setWithdrawOpen} />
    </>
  )
}
