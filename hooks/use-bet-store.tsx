"use client"

import * as React from "react"

export interface Selection {
  id: string          // unique identifier, e.g., matchId-outcome
  matchId: string
  matchName: string
  team1: string
  team2: string
  market: string      // e.g. "Full Time"
  selection: "1" | "X" | "2"
  selectionName: string // e.g. team name or "Draw"
  odds: number
}

export interface PlacedBet {
  id: string
  time: string
  selections: Selection[]
  totalOdds: number
  stake: number
  potentialReturn: number
  status: "active" | "won" | "lost"
}

export interface Transaction {
  id: string
  type: "deposit" | "withdrawal"
  amount: number
  phone?: string
  time: string
  status: "success" | "pending" | "failed"
}

interface BetStoreContextType {
  betslip: Selection[]
  walletBalance: number
  myBets: PlacedBet[]
  transactions: Transaction[]
  user: { username: string } | null
  activeTab: string
  searchQuery: string
  selectedSport: string // 'all' | 'football' | 'basketball' | 'tennis' | 'american-football'
  selectedLeague: string // e.g. 'All Leagues' | 'Premier League' etc.
  addToBetslip: (selection: Selection) => void
  removeFromBetslip: (id: string) => void
  clearBetslip: () => void
  deposit: (amount: number, phone: string) => Promise<boolean>
  withdraw: (amount: number) => Promise<boolean>
  placeBet: (stake: number) => boolean
  login: (username: string) => void
  logout: () => void
  setActiveTab: (tab: string) => void
  setSearchQuery: (query: string) => void
  setSelectedSport: (sport: string) => void
  setSelectedLeague: (league: string) => void
  settleAllBets: () => void
}

const BetStoreContext = React.createContext<BetStoreContextType | undefined>(undefined)

export function BetStoreProvider({ children }: { children: React.ReactNode }) {
  const [betslip, setBetslip] = React.useState<Selection[]>([])
  const [walletBalance, setWalletBalance] = React.useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bet_wallet_balance")
      if (stored) return parseFloat(stored)
    }
    return 1000
  })
  const [myBets, setMyBets] = React.useState<PlacedBet[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bet_my_bets")
      if (stored) return JSON.parse(stored)
    }
    return []
  })
  const [transactions, setTransactions] = React.useState<Transaction[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bet_transactions")
      if (stored) return JSON.parse(stored)
    }
    return []
  })
  const [user, setUser] = React.useState<{ username: string } | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bet_user")
      if (stored) return JSON.parse(stored)
    }
    return null
  })
  const [activeTab, setActiveTabState] = React.useState<string>("home")
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [selectedSport, setSelectedSport] = React.useState<string>("all")
  const [selectedLeague, setSelectedLeague] = React.useState<string>("All Leagues")

  // Sync state helpers
  const saveBalance = (newBalance: number) => {
    setWalletBalance(newBalance)
    localStorage.setItem("bet_wallet_balance", newBalance.toString())
  }

  const saveBets = (newBets: PlacedBet[]) => {
    setMyBets(newBets)
    localStorage.setItem("bet_my_bets", JSON.stringify(newBets))
  }

  const saveTx = (newTx: Transaction[]) => {
    setTransactions(newTx)
    localStorage.setItem("bet_transactions", JSON.stringify(newTx))
  }

  const login = (username: string) => {
    const newUser = { username }
    setUser(newUser)
    localStorage.setItem("bet_user", JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("bet_user")
    setBetslip([])
  }

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab)
    // Clear search and filters on navigation if necessary, or preserve them
    if (tab !== "home" && !tab.startsWith("sport-")) {
      setSelectedSport("all")
      setSelectedLeague("All Leagues")
    }
  }

  const addToBetslip = (selection: Selection) => {
    setBetslip((prev) => {
      // 1. If identical selection exists, toggle/remove it
      const exists = prev.find((item) => item.id === selection.id)
      if (exists) {
        return prev.filter((item) => item.id !== selection.id)
      }

      // 2. If same match selection exists with a different outcome, replace it
      const matchExists = prev.find((item) => item.matchId === selection.matchId)
      if (matchExists) {
        return prev.map((item) => (item.matchId === selection.matchId ? selection : item))
      }

      // 3. Otherwise add new selection
      return [...prev, selection]
    })
  }

  const removeFromBetslip = (id: string) => {
    setBetslip((prev) => prev.filter((item) => item.id !== id))
  }

  const clearBetslip = () => {
    setBetslip([])
  }

  const deposit = async (amount: number, phone: string): Promise<boolean> => {
    // Simulate API delay for M-Pesa push request
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const newBalance = walletBalance + amount
    saveBalance(newBalance)

    const newTx: Transaction = {
      id: "TX-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      type: "deposit",
      amount,
      phone,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " " + new Date().toLocaleDateString(),
      status: "success",
    }
    saveTx([newTx, ...transactions])
    return true
  }

  const withdraw = async (amount: number): Promise<boolean> => {
    if (amount > walletBalance) return false
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const newBalance = walletBalance - amount
    saveBalance(newBalance)

    const newTx: Transaction = {
      id: "TX-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      type: "withdrawal",
      amount,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " " + new Date().toLocaleDateString(),
      status: "success",
    }
    saveTx([newTx, ...transactions])
    return true
  }

  const placeBet = (stake: number): boolean => {
    if (stake <= 0 || betslip.length === 0) return false
    if (stake > walletBalance) return false

    const newBalance = walletBalance - stake
    saveBalance(newBalance)

    const totalOdds = parseFloat(
      betslip.reduce((acc, sel) => acc * sel.odds, 1).toFixed(2)
    )

    const newBet: PlacedBet = {
      id: "BET-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " " + new Date().toLocaleDateString(),
      selections: [...betslip],
      totalOdds,
      stake,
      potentialReturn: parseFloat((stake * totalOdds).toFixed(2)),
      status: "active",
    }

    saveBets([newBet, ...myBets])
    setBetslip([])
    return true
  }

  // Helper to resolve random match outcomes for entertainment/mocking purposes
  const settleAllBets = () => {
    const updated = myBets.map((bet) => {
      if (bet.status !== "active") return bet
      // Simulate random win/loss
      const won = Math.random() > 0.4
      return {
        ...bet,
        status: won ? ("won" as const) : ("lost" as const),
      }
    })
    saveBets(updated)
  }

  return (
    <BetStoreContext.Provider
      value={{
        betslip,
        walletBalance,
        myBets,
        transactions,
        user,
        activeTab,
        searchQuery,
        selectedSport,
        selectedLeague,
        addToBetslip,
        removeFromBetslip,
        clearBetslip,
        deposit,
        withdraw,
        placeBet,
        login,
        logout,
        setActiveTab,
        setSearchQuery,
        setSelectedSport,
        setSelectedLeague,
        settleAllBets,
      }}
    >
      {children}
    </BetStoreContext.Provider>
  )
}

export function useBetStore() {
  const context = React.useContext(BetStoreContext)
  if (context === undefined) {
    throw new Error("useBetStore must be used within a BetStoreProvider")
  }
  return context
}
