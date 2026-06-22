"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ArrowUpRight, Copy, Check, Loader } from "lucide-react"

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2500, 5000]
const MIN_AMOUNT = 10
const MAX_AMOUNT = 1000000

function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email.trim())
}

type DepositStage = "idle" | "initiating" | "processing" | "redirect" | "complete" | "error"

interface TransactionResult {
  status: "success" | "failed" | "pending"
  message: string
  reference?: string
  amount?: number
  timestamp?: number
}

export function PaystackDepositSheet() {
  const wallet = useQuery(api.mpesa.getWallet)
  const createPaystackTransaction = useMutation(api.paystack.createTransaction)

  const [amount, setAmount] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [stage, setStage] = React.useState<DepositStage>("idle")
  const [transactionResult, setTransactionResult] = React.useState<TransactionResult | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [reference, setReference] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setTransactionResult(null)

    const parsedAmount = parseFloat(amount)

    if (!amount.trim() || isNaN(parsedAmount)) {
      setErrorMessage("Please enter a valid amount")
      return
    }

    if (parsedAmount < MIN_AMOUNT || parsedAmount > MAX_AMOUNT) {
      setErrorMessage(`Amount must be KES ${MIN_AMOUNT} - ${MAX_AMOUNT}`)
      return
    }

    if (!isValidEmail(email)) {
      setErrorMessage("Enter a valid email address")
      return
    }

    setStage("initiating")

    try {
      // Step 1: Initialize Paystack transaction
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          amount: parsedAmount,
          metadata: {
            type: "deposit",
            platform: "bet-flow",
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        setErrorMessage(error.message || "Failed to initiate payment")
        setStage("error")
        return
      }

      const data = await response.json()
      setReference(data.reference)

      // Step 2: Create transaction record in database
      await createPaystackTransaction({
        type: "deposit",
        amount: parsedAmount,
        email: email.trim(),
        reference: data.reference,
      })

      // Step 3: Redirect to Paystack checkout
      setStage("redirect")
      window.location.href = data.authorization_url
    } catch (error) {
      console.error("Paystack deposit error:", error)
      setErrorMessage("Failed to initiate deposit")
      setStage("error")
    }
  }

  const handleReset = () => {
    setAmount("")
    setEmail("")
    setStage("idle")
    setTransactionResult(null)
    setErrorMessage(null)
    setReference(null)
  }

  if (stage === "idle") {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="animate-in fade-in-50 slide-in-from-top-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-xs font-medium text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* Amount Section */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Amount (KES)
          </label>
          <Input
            type="number"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-sm font-semibold h-10"
            autoFocus
          />
          <div className="grid grid-cols-3 gap-2 pt-2">
            {QUICK_AMOUNTS.map((amt, idx) => (
              <Button
                key={amt}
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8 font-medium animate-in fade-in-50"
                style={{ animationDelay: `${idx * 25}ms` }}
                onClick={() => setAmount(amt.toString())}
              >
                +{amt}
              </Button>
            ))}
          </div>
        </div>

        {/* Email Section */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-sm font-semibold h-10"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full text-sm font-bold gap-2 h-10 animate-in fade-in-50"
          size="default"
        >
          <ArrowUpRight className="h-4 w-4" />
          Deposit via Paystack
        </Button>
      </form>
    )
  }

  if (stage === "error") {
    return (
      <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-700 mb-1">Payment Failed</p>
          <p className="text-xs text-red-600">{errorMessage}</p>
        </div>
        <Button className="w-full text-sm font-bold h-10" onClick={handleReset} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (stage === "redirect") {
    return (
      <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-700 mb-1">Redirecting to Paystack</p>
          <p className="text-xs text-blue-600">You will be redirected to complete your payment...</p>
        </div>
        <div className="flex justify-center">
          <Loader className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return null
}
