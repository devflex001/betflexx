"use client"

import * as React from "react"
import { useBetStore } from "@/hooks/use-bet-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { CopyIcon, CheckIcon, Loader2 } from "lucide-react"

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginModal({ open, onOpenChange }: ModalProps) {
  const { login } = useBetStore()
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      toast.error("Please enter a username")
      return
    }
    if (password.length < 4) {
      toast.error("Password must be at least 4 characters")
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      login(username)
      toast.success(`Welcome back, ${username}!`)
      setIsSubmitting(false)
      onOpenChange(false)
      setUsername("")
      setPassword("")
    }, 800)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Login to BetixPro</DialogTitle>
          <DialogDescription>
            Enter your username and password to log in to your account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground block" htmlFor="login-username">
              Username <span className="text-destructive">*</span>
            </label>
            <Input
              id="login-username"
              placeholder="e.g. jdoe"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              disabled={isSubmitting}
              required
              className="focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground block" htmlFor="login-password">
              Password <span className="text-destructive">*</span>
            </label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
              className="focus-visible:ring-primary"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground hover:opacity-90">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loggin in...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function RegisterModal({ open, onOpenChange }: ModalProps) {
  const { login } = useBetStore()
  const [username, setUsername] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      toast.error("Please enter a username")
      return
    }
    if (!phone.match(/^(\+254|0)?(7|1)\d{8}$/)) {
      toast.error("Please enter a valid Kenyan phone number (e.g., 0712345678)")
      return
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      login(username)
      toast.success("Account created successfully!")
      setIsSubmitting(false)
      onOpenChange(false)
      setUsername("")
      setPhone("")
      setPassword("")
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Join BetixPro</DialogTitle>
          <DialogDescription>
            Create an account to start tracking your bets and managing your insights.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground block" htmlFor="reg-username">
              Username <span className="text-destructive">*</span>
            </label>
            <Input
              id="reg-username"
              placeholder="e.g. jdoe"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              disabled={isSubmitting}
              required
              className="focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground block" htmlFor="reg-phone">
              M-Pesa Phone Number <span className="text-destructive">*</span>
            </label>
            <Input
              id="reg-phone"
              placeholder="e.g. 0712345678"
              value={phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
              disabled={isSubmitting}
              required
              className="focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground block" htmlFor="reg-password">
              Password <span className="text-destructive">*</span>
            </label>
            <Input
              id="reg-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
              className="focus-visible:ring-primary"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground hover:opacity-90">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DepositModal({ open, onOpenChange }: ModalProps) {
  const { deposit } = useBetStore()
  const [amount, setAmount] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount < 10) {
      toast.error("Minimum deposit amount is KES 10")
      return
    }
    if (!phone.match(/^(\+254|0)?(7|1)\d{8}$/)) {
      toast.error("Please enter a valid M-Pesa phone number")
      return
    }

    setIsSubmitting(true)
    const promise = deposit(parsedAmount, phone)
    toast.promise(promise, {
      loading: "Sending M-Pesa STK Push prompt to your phone...",
      success: () => {
        setIsSubmitting(false)
        onOpenChange(false)
        setAmount("")
        return `Successfully deposited KES ${parsedAmount.toLocaleString()}`
      },
      error: "M-Pesa deposit failed. Please try again.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">M-Pesa Deposit</DialogTitle>
          <DialogDescription>
            Enter your M-Pesa details. You will receive an STK push prompt on your mobile phone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground block" htmlFor="dep-amount">
              Amount (KES) <span className="text-destructive">*</span>
            </label>
            <Input
              id="dep-amount"
              type="number"
              min="10"
              placeholder="e.g. 500"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              disabled={isSubmitting}
              required
              className="focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground block" htmlFor="dep-phone">
              M-Pesa Phone Number <span className="text-destructive">*</span>
            </label>
            <Input
              id="dep-phone"
              placeholder="e.g. 0712345678"
              value={phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
              disabled={isSubmitting}
              required
              className="focus-visible:ring-primary"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground hover:opacity-90">
              {isSubmitting ? "Processing..." : "Deposit Instantly"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function WithdrawModal({ open, onOpenChange }: ModalProps) {
  const { withdraw, walletBalance } = useBetStore()
  const [amount, setAmount] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount < 50) {
      toast.error("Minimum withdrawal is KES 50")
      return
    }
    if (parsedAmount > walletBalance) {
      toast.error("Insufficient balance in wallet")
      return
    }

    setIsSubmitting(true)
    const success = await withdraw(parsedAmount)
    setIsSubmitting(false)
    if (success) {
      toast.success(`Successfully withdrew KES ${parsedAmount.toLocaleString()} to your registered number!`)
      onOpenChange(false)
      setAmount("")
    } else {
      toast.error("Withdrawal failed. Please check your balance.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Withdraw Winnings</DialogTitle>
          <DialogDescription>
            Withdraw your winnings directly to your M-Pesa mobile number. (Available: KES {walletBalance.toLocaleString()})
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground block" htmlFor="with-amount">
              Amount (KES) <span className="text-destructive">*</span>
            </label>
            <Input
              id="with-amount"
              type="number"
              min="50"
              placeholder="e.g. 250"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              disabled={isSubmitting}
              required
              className="focus-visible:ring-primary"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground hover:opacity-90">
              {isSubmitting ? "Processing..." : "Withdraw Now"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface ShareModalProps extends ModalProps {
  matchName: string
}

export function ShareModal({ open, onOpenChange, matchName }: ShareModalProps) {
  const [copied, setCopied] = React.useState(false)
  const shareUrl = typeof window !== "undefined" ? window.location.href : "https://betixpro.com/user"

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl + "?ref=share_match")
    setCopied(true)
    toast.success("Match link copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Share Match Details</DialogTitle>
          <DialogDescription>
            Share the live odds and details for {matchName} with your friends.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <Input
            value={`${shareUrl}?ref=share_match`}
            readOnly
            className="flex-1 focus-visible:ring-primary text-xs"
          />
          <Button onClick={handleCopy} size="icon" variant="outline">
            {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
