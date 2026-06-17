"use client"

import * as React from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { BottomNav } from "@/components/bottom-nav"
import { useBetStore } from "@/hooks/use-bet-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, PlayCircle, Send, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function TestPayHeroPage() {
  const { transactions, updateAdminTransactionStatus } = useBetStore()
  
  // Payment test inputs
  const [paymentAmount, setPaymentAmount] = React.useState("19")
  const [paymentPhone, setPaymentPhone] = React.useState("0708255202")
  const [paymentProvider, setPaymentProvider] = React.useState("m-pesa")
  const [paymentNetworkCode, setPaymentNetworkCode] = React.useState("63902")
  const [paymentChannelId, setPaymentChannelId] = React.useState("100")
  const [paymentAccountId, setPaymentAccountId] = React.useState("5")
  const [paymentExtRef, setPaymentExtRef] = React.useState("test_ext_" + Math.random().toString(36).substring(7))
  const [paymentCallbackUrl, setPaymentCallbackUrl] = React.useState("https://your-callback-url.com/webhook")

  // Withdrawal test inputs
  const [withdrawAmount, setWithdrawAmount] = React.useState("21")
  const [withdrawPhone, setWithdrawPhone] = React.useState("0708344101")
  const [withdrawChannel, setWithdrawChannel] = React.useState("mobile")
  const [withdrawNetworkCode, setWithdrawNetworkCode] = React.useState("63902")
  const [withdrawChannelId, setWithdrawChannelId] = React.useState("1523")
  const [withdrawAccountId, setWithdrawAccountId] = React.useState("5")
  const [withdrawExtRef, setWithdrawExtRef] = React.useState("test_ext_" + Math.random().toString(36).substring(7))
  const [withdrawCallbackUrl, setWithdrawCallbackUrl] = React.useState("https://your-callback-url.com/webhook")
  const [withdrawAccNo, setWithdrawAccNo] = React.useState("")

  // API State
  const [loading, setLoading] = React.useState(false)
  const [apiResponse, setApiResponse] = React.useState<any>(null)
  const [apiError, setApiError] = React.useState<string | null>(null)
  const [activeEndpoint, setActiveEndpoint] = React.useState<"payment" | "withdraw" | null>(null)

  const handleTestPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setApiResponse(null)
    setApiError(null)
    setActiveEndpoint("payment")

    try {
      const payload = {
        amount: parseFloat(paymentAmount),
        phone_number: paymentPhone,
        provider: paymentProvider,
        network_code: paymentNetworkCode,
        channel_id: parseInt(paymentChannelId),
        account_id: parseInt(paymentAccountId),
        external_reference: paymentExtRef,
        callback_url: paymentCallbackUrl,
      }

      const response = await fetch("/api/payhero/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      setApiResponse(data)

      if (response.ok && data.success) {
        toast.success("Payment initiated successfully!")
        
        // Add transaction locally
        const localTxs = localStorage.getItem("bet_transactions")
        const currentTxs = localTxs ? JSON.parse(localTxs) : []
        const newTx = {
          id: data.reference || "TX-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          type: "deposit" as const,
          amount: payload.amount,
          phone: payload.phone_number,
          time: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + ", " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "pending" as const,
        }
        localStorage.setItem("bet_transactions", JSON.stringify([newTx, ...currentTxs]))
        window.dispatchEvent(new Event("storage"))
      } else {
        setApiError(data.message || "Failed to trigger payment push.")
        toast.error("API response returned failure.")
      }
    } catch (err) {
      console.error(err)
      setApiError("Network or internal error occurred while making request.")
      toast.error("Request failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleTestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setApiResponse(null)
    setApiError(null)
    setActiveEndpoint("withdraw")

    try {
      const payload = {
        amount: parseFloat(withdrawAmount),
        phone_number: withdrawPhone,
        channel: withdrawChannel,
        network_code: withdrawNetworkCode,
        channel_id: parseInt(withdrawChannelId),
        account_id: parseInt(withdrawAccountId),
        external_reference: withdrawExtRef,
        callback_url: withdrawCallbackUrl,
        account_number: withdrawAccNo || undefined,
      }

      const response = await fetch("/api/payhero/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      setApiResponse(data)

      if (response.ok && data.status === "QUEUED") {
        toast.success("Withdrawal initiated successfully!")

        // Save transaction locally
        const localTxs = localStorage.getItem("bet_transactions")
        const currentTxs = localTxs ? JSON.parse(localTxs) : []
        const newTx = {
          id: data.merchant_reference || "TX-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          type: "withdrawal" as const,
          amount: payload.amount,
          time: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + ", " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "success" as const,
        }
        localStorage.setItem("bet_transactions", JSON.stringify([newTx, ...currentTxs]))
        window.dispatchEvent(new Event("storage"))
      } else {
        setApiError(data.message || "Failed to trigger withdrawal.")
        toast.error("API response returned failure.")
      }
    } catch (err) {
      console.error(err)
      setApiError("Network or internal error occurred while making request.")
      toast.error("Request failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleCallbackSimulate = (txId: string, status: "success" | "failed") => {
    updateAdminTransactionStatus(txId, status)
    toast.success(`Transaction ${txId} simulation status updated to ${status}!`)
    // Force storage sync
    window.dispatchEvent(new Event("storage"))
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Header />

      <div className="flex-1 flex max-w-[1400px] w-full mx-auto overflow-hidden">
        <Sidebar className="hidden lg:flex w-60 shrink-0 h-full" />

        <main className="flex-1 min-w-0 p-4 sm:p-6 overflow-y-auto h-full flex flex-col gap-6 scrollbar-thin">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">PayHero Africa API Testing Console</h1>
              <p className="text-xs text-muted-foreground">Scaffold payment prompts & withdrawals, inspect request/response payloads, and simulate webhooks.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            {/* Tabs for payments / withdrawals */}
            <div className="space-y-4">
              <Tabs defaultValue="payment">
                <TabsList className="grid grid-cols-2 bg-muted border border-border">
                  <TabsTrigger value="payment" className="text-xs font-semibold">Local Payments (Deposit)</TabsTrigger>
                  <TabsTrigger value="withdraw" className="text-xs font-semibold">Local Withdrawals</TabsTrigger>
                </TabsList>

                {/* Local Payments Tab */}
                <TabsContent value="payment" className="mt-4">
                  <Card className="border-border">
                    <CardHeader className="py-4">
                      <CardTitle className="text-sm">Initiate Payment Push (STK Push)</CardTitle>
                      <CardDescription className="text-xs">Triggers M-Pesa or SasaPay payment request prompts directly to user device.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <form onSubmit={handleTestPayment} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="pay-amt">Amount (KES)</label>
                            <Input id="pay-amt" type="number" size={30} value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="pay-phone">Phone Number</label>
                            <Input id="pay-phone" placeholder="e.g. 0708255202" value={paymentPhone} onChange={(e) => setPaymentPhone(e.target.value)} required />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="pay-provider">Provider</label>
                            <Input id="pay-provider" value={paymentProvider} onChange={(e) => setPaymentProvider(e.target.value)} required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="pay-network">Network Code</label>
                            <Input id="pay-network" value={paymentNetworkCode} onChange={(e) => setPaymentNetworkCode(e.target.value)} required />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="pay-channel">Channel ID</label>
                            <Input id="pay-channel" type="number" value={paymentChannelId} onChange={(e) => setPaymentChannelId(e.target.value)} required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="pay-account">Account ID</label>
                            <Input id="pay-account" type="number" value={paymentAccountId} onChange={(e) => setPaymentAccountId(e.target.value)} required />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="pay-ref">External Reference</label>
                          <Input id="pay-ref" value={paymentExtRef} onChange={(e) => setPaymentExtRef(e.target.value)} required />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="pay-callback">Callback URL</label>
                          <Input id="pay-callback" value={paymentCallbackUrl} onChange={(e) => setPaymentCallbackUrl(e.target.value)} required />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full font-semibold gap-1.5 mt-2">
                          {loading && activeEndpoint === "payment" ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Triggering STK...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Test Payment Push
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Local Withdrawals Tab */}
                <TabsContent value="withdraw" className="mt-4">
                  <Card className="border-border">
                    <CardHeader className="py-4">
                      <CardTitle className="text-sm">Initiate Withdrawal Request</CardTitle>
                      <CardDescription className="text-xs">Send money to recipient wallet or bank from PayHero accounts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <form onSubmit={handleTestWithdrawal} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="w-amt">Amount (KES)</label>
                            <Input id="w-amt" type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="w-phone">Recipient Phone</label>
                            <Input id="w-phone" placeholder="e.g. 0708344101" value={withdrawPhone} onChange={(e) => setWithdrawPhone(e.target.value)} required />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="w-channel">Channel</label>
                            <Input id="w-channel" value={withdrawChannel} onChange={(e) => setWithdrawChannel(e.target.value)} required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="w-network">Network Code</label>
                            <Input id="w-network" value={withdrawNetworkCode} onChange={(e) => setWithdrawNetworkCode(e.target.value)} required />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="w-channel-id">Channel ID</label>
                            <Input id="w-channel-id" type="number" value={withdrawChannelId} onChange={(e) => setWithdrawChannelId(e.target.value)} required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="w-account-id">Account ID</label>
                            <Input id="w-account-id" type="number" value={withdrawAccountId} onChange={(e) => setWithdrawAccountId(e.target.value)} required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="w-acc-no">Bank Account</label>
                            <Input id="w-acc-no" placeholder="Optional" value={withdrawAccNo} onChange={(e) => setWithdrawAccNo(e.target.value)} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="w-ref">External Reference</label>
                          <Input id="w-ref" value={withdrawExtRef} onChange={(e) => setWithdrawExtRef(e.target.value)} required />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="w-callback">Callback URL</label>
                          <Input id="w-callback" value={withdrawCallbackUrl} onChange={(e) => setWithdrawCallbackUrl(e.target.value)} required />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full font-semibold gap-1.5 mt-2">
                          {loading && activeEndpoint === "withdraw" ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Triggering Withdrawal...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Test Withdrawal
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* API response console and Simulation console */}
            <div className="space-y-6">
              {/* API Response Display */}
              <div className="border border-border bg-card rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="text-sm font-bold flex items-center gap-1.5">
                    <PlayCircle className="h-4 w-4 text-primary" />
                    <span>Live API Response Console</span>
                  </h3>
                  {activeEndpoint && (
                    <Badge variant="outline" className="text-[10px] uppercase font-bold px-2">
                      {activeEndpoint}
                    </Badge>
                  )}
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-xs gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span>Waiting for PayHero Africa API responses...</span>
                  </div>
                ) : apiResponse ? (
                  <pre className="text-[11px] font-mono bg-muted p-4 rounded-md overflow-x-auto text-foreground max-h-80 scrollbar-thin">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                ) : apiError ? (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-4 rounded-md flex flex-col gap-1">
                    <span className="font-bold">API Proxy Error:</span>
                    <span className="font-mono">{apiError}</span>
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-border rounded-lg text-muted-foreground text-xs">
                    Trigger an API call from the left panel to inspect the results.
                  </div>
                )}
              </div>

              {/* Transactions Webhook Simulation Console */}
              <div className="border border-border bg-card rounded-lg p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-bold">Local Webhook Callback Simulation</h3>
                  <p className="text-[11px] text-muted-foreground leading-normal mt-0.5">
                    Since development is local, PayHero webhooks won&apos;t reach your localhost. Use these controls to simulate webhook callbacks on pending transactions.
                  </p>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto scrollbar-thin pr-1">
                  {transactions.filter((t) => t.type === "deposit").length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-border rounded text-muted-foreground text-xs">
                      No deposit transactions found in state history.
                    </div>
                  ) : (
                    transactions
                      .filter((t) => t.type === "deposit")
                      .map((tx) => (
                        <div key={tx.id} className="border border-border rounded p-2.5 flex items-center justify-between text-xs bg-muted/20">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold font-mono text-[11px] truncate max-w-[120px]">{tx.id}</span>
                              <Badge variant={tx.status === "success" ? "default" : tx.status === "failed" ? "destructive" : "secondary"} className="text-[9px] uppercase tracking-wide px-1.5 py-0">
                                {tx.status}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground">Amount: KES {tx.amount} • {tx.time}</p>
                          </div>
                          
                          {tx.status === "pending" && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[10px] border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                                onClick={() => handleCallbackSimulate(tx.id, "success")}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Success
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[10px] border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
                                onClick={() => handleCallbackSimulate(tx.id, "failed")}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Fail
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-auto pt-8 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>PayHero API testing utility</span>
            <Link href="/" className="text-primary hover:underline">Return to Betting Board</Link>
          </footer>
        </main>
      </div>

      <BottomNav liveCount={0} />
    </div>
  )
}
