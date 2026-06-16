"use client"

import * as React from "react"
import { useBetStore } from "@/hooks/use-bet-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Wallet, 
  User, 
  LogOut, 
  History, 
  ArrowUpRight, 
  ArrowDownLeft,
  X 
} from "lucide-react"
import { 
  LoginModal, 
  RegisterModal, 
  DepositModal, 
  WithdrawModal 
} from "./modals"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Betslip } from "./betslip"

export function Header() {
  const { 
    user, 
    walletBalance, 
    logout, 
    searchQuery, 
    setSearchQuery, 
    setActiveTab,
    betslip
  } = useBetStore()

  const [loginOpen, setLoginOpen] = React.useState(false)
  const [registerOpen, setRegisterOpen] = React.useState(false)
  const [depositOpen, setDepositOpen] = React.useState(false)
  const [withdrawOpen, setWithdrawOpen] = React.useState(false)
  const [betslipOpen, setBetslipOpen] = React.useState(false)

  const handleLogoClick = () => {
    setActiveTab("home")
    setSearchQuery("")
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:grid md:grid-cols-3">
          {/* Brand/Logo */}
          <div className="flex items-center gap-2 cursor-pointer md:justify-self-start" onClick={handleLogoClick}>
            <span className="text-xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
              <span className="bg-primary text-primary-foreground font-black px-2 py-0.5 rounded text-sm tracking-wider">PRO</span>
              BetixPro
            </span>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex relative max-w-md w-full justify-self-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search teams, leagues or match IDs..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 focus-visible:ring-primary h-9 w-full bg-muted/40 border-muted"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 size-7 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery("")}
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>

          {/* User Operations */}
          <div className="flex items-center justify-end gap-3 md:justify-self-end">
            {/* Search toggler for mobile */}
            <div className="md:hidden relative w-36">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 w-full text-xs bg-muted/40"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 size-6 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="size-3" />
                </Button>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                {/* Wallet Balance Display */}
                <div className="hidden sm:flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-md text-xs font-semibold border border-border">
                  <Wallet className="size-3.5 text-primary" />
                  <span>KES {walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                {/* Deposit action */}
                <Button
                  onClick={() => setDepositOpen(true)}
                  size="sm"
                  className="bg-primary text-primary-foreground font-semibold px-3 h-8 text-xs hover:opacity-90 flex items-center gap-1"
                >
                  <ArrowUpRight className="size-3" /> Deposit
                </Button>

                {/* Betslip Sheet trigger for mobile/desktop toggle if preferred */}
                <Sheet open={betslipOpen} onOpenChange={setBetslipOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="relative h-8 px-2.5 text-xs font-medium border-border"
                    >
                      Betslip
                      {betslip.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                          {betslip.length}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-md p-0 flex flex-col gap-0 border-l border-border bg-card">
                    <SheetHeader className="p-4 border-b border-border bg-muted/20">
                      <SheetTitle className="text-lg font-bold">Betslip Manager</SheetTitle>
                      <SheetDescription className="text-xs">
                        Review your selections and place your accumulator or single bets.
                      </SheetDescription>
                    </SheetHeader>
                    <Betslip onClose={() => setBetslipOpen(false)} />
                  </SheetContent>
                </Sheet>

                {/* User menu dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 rounded-full border border-border hover:bg-muted/50">
                      <User className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">{user.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">Registered User</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="sm:hidden flex items-center justify-between text-xs py-2">
                      <span className="flex items-center gap-2"><Wallet className="size-3.5" /> Balance:</span>
                      <span className="font-semibold">KES {walletBalance.toLocaleString()}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDepositOpen(true)}>
                      <ArrowUpRight className="mr-2 h-4 w-4 text-emerald-500" />
                      <span>Deposit (M-Pesa)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setWithdrawOpen(true)}>
                      <ArrowDownLeft className="mr-2 h-4 w-4 text-rose-500" />
                      <span>Withdraw Winnings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTab("mybets")}>
                      <History className="mr-2 h-4 w-4 text-blue-500" />
                      <span>My Placed Bets</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setLoginOpen(true)}
                  size="sm"
                  className="h-8 text-xs font-semibold hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => setRegisterOpen(true)}
                  size="sm"
                  className="bg-primary text-primary-foreground font-semibold px-4 h-8 text-xs hover:opacity-90"
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal Dialog wrappers */}
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      <RegisterModal open={registerOpen} onOpenChange={setRegisterOpen} />
      <DepositModal open={depositOpen} onOpenChange={setDepositOpen} />
      <WithdrawModal open={withdrawOpen} onOpenChange={setWithdrawOpen} />
    </>
  )
}
