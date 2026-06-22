"use client"

import React, { useState, useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Eye, EyeOff, Loader, Check, Wallet, Percent, CreditCard } from "lucide-react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { useMediaQuery } from "@/hooks/use-media-query"
import { toast } from "sonner"

interface DarajaConfig {
  _id: string
  consumerKey: string
  consumerSecret: string
  businessCode: string
  passkey: string
  callbackUrl: string
  timeoutUrl: string
  shortcode: string
  initiatorName: string
  initiatorPassword: string
  isProduction: boolean
  isEnabled: boolean
  useEnvVariables: boolean
  source?: string
  updatedAt: number
}

interface PaystackConfig {
  _id?: string
  publicKey: string
  secretKey: string
  isProduction: boolean
  isEnabled: boolean
  useEnvVariables: boolean
  source?: string
  updatedAt?: number
}

type PaymentMode = "mpesa" | "paystack"

export default function SettingsPage() {
  const [showDrawer, setShowDrawer] = useState(false)
  const [drawerMode, setDrawerMode] = useState<PaymentMode | "none">("none")
  const [activePaymentTab, setActivePaymentTab] = useState<PaymentMode>("mpesa")
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [bulkEnvText, setBulkEnvText] = useState("")
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  // Queries
  const currentDarajaConfig = useQuery(api.daraja.getConfig)
  const currentPaystackConfig = useQuery(api.paystack.getConfig)
  const paymentMode = useQuery(api.paymentMode.getActiveMode)

  // Mutations
  const saveDarajaConfig = useMutation(api.daraja.saveConfig)
  const savePaystackConfig = useMutation(api.paystack.saveConfig)
  const testDarajaConfig = useMutation(api.daraja.testConfig)
  const testPaystackConfig = useMutation(api.paystack.testConfig)
  const setPaymentMode = useMutation(api.paymentMode.setMode)

  const [limitsForm, setLimitsForm] = useState({ minDeposit: "100", minWithdrawal: "500" })
  const [feesForm, setFeesForm] = useState({ withdrawalFeePercent: "2.5", flatFee: "0" })

  const [darajaFormData, setDarajaFormData] = useState<Partial<DarajaConfig>>({
    consumerKey: "",
    consumerSecret: "",
    businessCode: "",
    passkey: "",
    callbackUrl: "",
    timeoutUrl: "",
    shortcode: "",
    initiatorName: "",
    initiatorPassword: "",
    isProduction: false,
  })

  const [paystackFormData, setPaystackFormData] = useState<Partial<PaystackConfig>>({
    publicKey: "",
    secretKey: "",
    isProduction: false,
  })

  useEffect(() => {
    if (currentDarajaConfig && currentDarajaConfig.source !== "environment") {
      setDarajaFormData(currentDarajaConfig)
    }
  }, [currentDarajaConfig])

  useEffect(() => {
    if (currentPaystackConfig && currentPaystackConfig.source !== "environment") {
      setPaystackFormData(currentPaystackConfig)
    }
  }, [currentPaystackConfig])

  useEffect(() => {
    if (paymentMode) {
      setActivePaymentTab(paymentMode.mode)
    }
  }, [paymentMode])

  const handleDarajaInputChange = (field: string, value: string | boolean) => {
    setDarajaFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePaystackInputChange = (field: string, value: string | boolean) => {
    setPaystackFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveDarajaConfig = async () => {
    try {
      setLoading(true)
      setMessage(null)
      await saveDarajaConfig({
        consumerKey: darajaFormData.consumerKey || "",
        consumerSecret: darajaFormData.consumerSecret || "",
        businessCode: darajaFormData.businessCode || "",
        passkey: darajaFormData.passkey || "",
        callbackUrl: darajaFormData.callbackUrl || "",
        timeoutUrl: darajaFormData.timeoutUrl || "",
        shortcode: darajaFormData.shortcode || "",
        initiatorName: darajaFormData.initiatorName || "",
        initiatorPassword: darajaFormData.initiatorPassword || "",
        isProduction: darajaFormData.isProduction || false,
      })
      setMessage({ type: "success", text: "M-Pesa configuration saved" })
      toast.success("M-Pesa configuration saved successfully")
      setTimeout(() => setShowDrawer(false), 1000)
    } catch (error) {
      setMessage({ type: "error", text: `Error: ${String(error)}` })
      toast.error(`Error saving M-Pesa config: ${String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePaystackConfig = async () => {
    try {
      setLoading(true)
      setMessage(null)
      await savePaystackConfig({
        publicKey: paystackFormData.publicKey || "",
        secretKey: paystackFormData.secretKey || "",
        isProduction: paystackFormData.isProduction || false,
      })
      setMessage({ type: "success", text: "Paystack configuration saved" })
      toast.success("Paystack configuration saved successfully")
      setTimeout(() => setShowDrawer(false), 1000)
    } catch (error) {
      setMessage({ type: "error", text: `Error: ${String(error)}` })
      toast.error(`Error saving Paystack config: ${String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleTestDarajaConfig = async () => {
    try {
      setLoading(true)
      setMessage(null)
      const result = await testDarajaConfig({
        consumerKey: darajaFormData.consumerKey || "",
        consumerSecret: darajaFormData.consumerSecret || "",
      })
      setMessage({ type: result.success ? "success" : "error", text: result.message })
      if (result.success) {
        toast.success("M-Pesa credentials valid!")
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      setMessage({ type: "error", text: `Error: ${String(error)}` })
      toast.error(`Error testing config: ${String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleTestPaystackConfig = async () => {
    try {
      setLoading(true)
      setMessage(null)
      const result = await testPaystackConfig({
        secretKey: paystackFormData.secretKey || "",
      })
      setMessage({ type: result.success ? "success" : "error", text: result.message })
      if (result.success) {
        toast.success("Paystack credentials valid!")
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      setMessage({ type: "error", text: `Error: ${String(error)}` })
      toast.error(`Error testing config: ${String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchPaymentMode = async (mode: PaymentMode) => {
    try {
      setLoading(true)
      await setPaymentMode({ mode })
      toast.success(`Payment mode switched to ${mode.toUpperCase()}`)
      setActivePaymentTab(mode)
    } catch (error) {
      toast.error(`Error switching payment mode: ${String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleShowSecret = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const parseBulkEnvVars = (envText: string, isPaystack: boolean = false) => {
    const darajaEnvVarMap: Record<string, string> = {
      MPESA_CONSUMER_KEY: "consumerKey",
      MPESA_CONSUMER_SECRET: "consumerSecret",
      MPESA_BUSINESS_CODE: "businessCode",
      MPESA_PASSKEY: "passkey",
      MPESA_CALLBACK_URL: "callbackUrl",
      MPESA_TIMEOUT_URL: "timeoutUrl",
      MPESA_SHORTCODE: "shortcode",
      MPESA_INITIATOR_NAME: "initiatorName",
      MPESA_INITIATOR_PASSWORD: "initiatorPassword",
    }

    const paystackEnvVarMap: Record<string, string> = {
      PAYSTACK_PUBLIC_KEY: "publicKey",
      PAYSTACK_SECRET_KEY: "secretKey",
    }

    const envVarMap = isPaystack ? paystackEnvVarMap : darajaEnvVarMap
    const lines = envText.split("\n")
    const updates: Record<string, string> = {}

    lines.forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) return

      const match = trimmed.match(/^([A-Z_]+)\s*=\s*(.+)$/)
      if (match) {
        const [, envKey, envValue] = match
        const formField = envVarMap[envKey]
        if (formField) {
          updates[formField] = envValue.trim()
        }
      }
    })

    if (isPaystack) {
      setPaystackFormData((prev) => ({ ...prev, ...updates }))
    } else {
      setDarajaFormData((prev) => ({ ...prev, ...updates }))
    }

    setShowBulkImport(false)
    setMessage({ type: "success", text: `${Object.keys(updates).length} field(s) imported successfully` })
    setTimeout(() => setMessage(null), 3000)
  }

  const DarajaConfigForm = () => (
    <div className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded text-xs font-medium ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
        >
          {message.text}
        </div>
      )}

      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => setShowBulkImport(!showBulkImport)}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mb-3"
        >
          <span>+</span> Import from .env
        </button>

        {showBulkImport && (
          <div className="space-y-2 p-3 bg-muted/40 rounded border border-border">
            <p className="text-xs text-muted-foreground">
              Paste M-Pesa environment variables and they'll be automatically mapped.
            </p>
            <textarea
              placeholder={`MPESA_CONSUMER_KEY=your_key\nMPESA_CONSUMER_SECRET=your_secret`}
              onChange={(e) => setBulkEnvText(e.target.value)}
              value={bulkEnvText}
              className="w-full h-24 p-2 text-xs font-mono bg-background border border-border rounded resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="default"
                onClick={() => parseBulkEnvVars(bulkEnvText, false)}
                className="flex-1 text-xs h-8"
              >
                Import
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowBulkImport(false)
                  setBulkEnvText("")
                }}
                className="flex-1 text-xs h-8"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="consumerKey" className="text-xs font-semibold">
          Consumer Key
        </Label>
        <Input
          id="consumerKey"
          value={darajaFormData.consumerKey || ""}
          onChange={(e) => handleDarajaInputChange("consumerKey", e.target.value)}
          className="h-9 font-mono text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold">Consumer Secret</Label>
        <div className="relative">
          <Input
            type={showSecrets.consumerSecret ? "text" : "password"}
            value={darajaFormData.consumerSecret || ""}
            onChange={(e) => handleDarajaInputChange("consumerSecret", e.target.value)}
            className="h-9 font-mono text-xs pr-10"
          />
          <button
            type="button"
            onClick={() => toggleShowSecret("consumerSecret")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showSecrets.consumerSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Business Code</Label>
          <Input
            value={darajaFormData.businessCode || ""}
            onChange={(e) => handleDarajaInputChange("businessCode", e.target.value)}
            className="h-9 font-mono text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Shortcode</Label>
          <Input
            value={darajaFormData.shortcode || ""}
            onChange={(e) => handleDarajaInputChange("shortcode", e.target.value)}
            className="h-9 font-mono text-xs"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold">Passkey</Label>
        <div className="relative">
          <Input
            type={showSecrets.passkey ? "text" : "password"}
            value={darajaFormData.passkey || ""}
            onChange={(e) => handleDarajaInputChange("passkey", e.target.value)}
            className="h-9 font-mono text-xs pr-10"
          />
          <button
            type="button"
            onClick={() => toggleShowSecret("passkey")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showSecrets.passkey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Initiator Name</Label>
          <Input
            value={darajaFormData.initiatorName || ""}
            onChange={(e) => handleDarajaInputChange("initiatorName", e.target.value)}
            className="h-9 font-mono text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Initiator Password</Label>
          <div className="relative">
            <Input
              type={showSecrets.initiatorPassword ? "text" : "password"}
              value={darajaFormData.initiatorPassword || ""}
              onChange={(e) => handleDarajaInputChange("initiatorPassword", e.target.value)}
              className="h-9 font-mono text-xs pr-10"
            />
            <button
              type="button"
              onClick={() => toggleShowSecret("initiatorPassword")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showSecrets.initiatorPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold">Callback URL</Label>
        <Input
          value={darajaFormData.callbackUrl || ""}
          onChange={(e) => handleDarajaInputChange("callbackUrl", e.target.value)}
          className="h-9 font-mono text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold">Timeout URL</Label>
        <Input
          value={darajaFormData.timeoutUrl || ""}
          onChange={(e) => handleDarajaInputChange("timeoutUrl", e.target.value)}
          className="h-9 font-mono text-xs"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleTestDarajaConfig} variant="outline" size="sm" disabled={loading} className="flex-1">
          {loading ? <Loader className="size-4 animate-spin" /> : <Check className="size-4" />}
          <span className="ml-1">Test</span>
        </Button>
        <Button onClick={handleSaveDarajaConfig} size="sm" disabled={loading} className="flex-1">
          {loading ? <Loader className="size-4 animate-spin" /> : <Check className="size-4" />}
          <span className="ml-1">Save</span>
        </Button>
      </div>
    </div>
  )

  const PaystackConfigForm = () => (
    <div className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded text-xs font-medium ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
        >
          {message.text}
        </div>
      )}

      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => setShowBulkImport(!showBulkImport)}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mb-3"
        >
          <span>+</span> Import from .env
        </button>

        {showBulkImport && (
          <div className="space-y-2 p-3 bg-muted/40 rounded border border-border">
            <p className="text-xs text-muted-foreground">
              Paste Paystack environment variables and they'll be automatically mapped.
            </p>
            <textarea
              placeholder={`PAYSTACK_PUBLIC_KEY=your_public_key\nPAYSTACK_SECRET_KEY=your_secret_key`}
              onChange={(e) => setBulkEnvText(e.target.value)}
              value={bulkEnvText}
              className="w-full h-20 p-2 text-xs font-mono bg-background border border-border rounded resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="default"
                onClick={() => parseBulkEnvVars(bulkEnvText, true)}
                className="flex-1 text-xs h-8"
              >
                Import
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowBulkImport(false)
                  setBulkEnvText("")
                }}
                className="flex-1 text-xs h-8"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="publicKey" className="text-xs font-semibold">
          Public Key
        </Label>
        <Input
          id="publicKey"
          value={paystackFormData.publicKey || ""}
          onChange={(e) => handlePaystackInputChange("publicKey", e.target.value)}
          className="h-9 font-mono text-xs"
          placeholder="pk_test_xxx or pk_live_xxx"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold">Secret Key</Label>
        <div className="relative">
          <Input
            type={showSecrets.secretKey ? "text" : "password"}
            value={paystackFormData.secretKey || ""}
            onChange={(e) => handlePaystackInputChange("secretKey", e.target.value)}
            className="h-9 font-mono text-xs pr-10"
            placeholder="sk_test_xxx or sk_live_xxx"
          />
          <button
            type="button"
            onClick={() => toggleShowSecret("secretKey")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showSecrets.secretKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleTestPaystackConfig} variant="outline" size="sm" disabled={loading} className="flex-1">
          {loading ? <Loader className="size-4 animate-spin" /> : <Check className="size-4" />}
          <span className="ml-1">Test</span>
        </Button>
        <Button onClick={handleSavePaystackConfig} size="sm" disabled={loading} className="flex-1">
          {loading ? <Loader className="size-4 animate-spin" /> : <Check className="size-4" />}
          <span className="ml-1">Save</span>
        </Button>
      </div>
    </div>
  )

  return (
    <AdminLayout pageTitle="Settings">
      <div className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto bg-background">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-xs text-muted-foreground">Manage platform integrations and financial limits</p>
        </div>

        {/* Payment Mode Selector */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-primary" />
              <CardTitle className="text-sm">Payment Mode</CardTitle>
            </div>
            <CardDescription className="text-xs">Select the active payment method for deposits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={activePaymentTab === "mpesa" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSwitchPaymentMode("mpesa")}
                disabled={loading}
                className="flex-1 text-xs h-9"
              >
                {loading && activePaymentTab === "mpesa" && <Loader className="size-3 mr-1 animate-spin" />}
                M-Pesa
              </Button>
              <Button
                variant={activePaymentTab === "paystack" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSwitchPaymentMode("paystack")}
                disabled={loading}
                className="flex-1 text-xs h-9"
              >
                {loading && activePaymentTab === "paystack" && <Loader className="size-3 mr-1 animate-spin" />}
                Paystack
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Active mode: <span className="font-semibold text-foreground">{activePaymentTab.toUpperCase()}</span>
            </p>
          </CardContent>
        </Card>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* M-Pesa Config Card */}
          <Card className="flex flex-col border border-border hover:shadow-sm transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Settings className="size-4 text-primary" />
                <CardTitle className="text-sm">Daraja API (M-Pesa)</CardTitle>
              </div>
              <CardDescription className="text-xs">M-Pesa payment gateway credentials.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 text-xs text-muted-foreground space-y-2">
              {currentDarajaConfig ? (
                <>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded font-medium ${currentDarajaConfig.isProduction
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {currentDarajaConfig.isProduction ? "Production" : "Sandbox"}
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded font-medium ${currentDarajaConfig.source === "environment"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                        }`}
                    >
                      {currentDarajaConfig.source === "environment" ? "ENV" : "DB"}
                    </span>
                  </div>
                  <p>Code: {currentDarajaConfig.businessCode}</p>
                </>
              ) : (
                <p>Not configured yet.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  setDrawerMode("mpesa")
                  setShowDrawer(true)
                }}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Configure
              </Button>
            </CardFooter>
          </Card>

          {/* Paystack Config Card */}
          <Card className="flex flex-col border border-border hover:shadow-sm transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                <CardTitle className="text-sm">Paystack API</CardTitle>
              </div>
              <CardDescription className="text-xs">Paystack payment processor credentials.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 text-xs text-muted-foreground space-y-2">
              {currentPaystackConfig ? (
                <>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded font-medium ${currentPaystackConfig.isProduction
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {currentPaystackConfig.isProduction ? "Production" : "Sandbox"}
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded font-medium ${currentPaystackConfig.source === "environment"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                        }`}
                    >
                      {currentPaystackConfig.source === "environment" ? "ENV" : "DB"}
                    </span>
                  </div>
                  <p>Configured</p>
                </>
              ) : (
                <p>Not configured yet.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  setDrawerMode("paystack")
                  setShowDrawer(true)
                }}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Configure
              </Button>
            </CardFooter>
          </Card>

          {/* Transaction Limits Card */}
          <Card className="flex flex-col border border-border hover:shadow-sm transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="size-4 text-primary" />
                <CardTitle className="text-sm">Transaction Limits</CardTitle>
              </div>
              <CardDescription className="text-xs">Set deposit and withdrawal boundaries.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Minimum Deposit (KES)</Label>
                <Input
                  type="number"
                  value={limitsForm.minDeposit}
                  onChange={(e) => setLimitsForm((prev) => ({ ...prev, minDeposit: e.target.value }))}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Minimum Withdrawal (KES)</Label>
                <Input
                  type="number"
                  value={limitsForm.minWithdrawal}
                  onChange={(e) => setLimitsForm((prev) => ({ ...prev, minWithdrawal: e.target.value }))}
                  className="h-8 text-xs"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button size="sm" className="w-full">
                Save Limits
              </Button>
            </CardFooter>
          </Card>

          {/* Fees & Charges Card */}
          <Card className="flex flex-col border border-border hover:shadow-sm transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Percent className="size-4 text-primary" />
                <CardTitle className="text-sm">Fees & Charges</CardTitle>
              </div>
              <CardDescription className="text-xs">Configure platform transaction cuts.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Withdrawal Fee (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={feesForm.withdrawalFeePercent}
                  onChange={(e) => setFeesForm((prev) => ({ ...prev, withdrawalFeePercent: e.target.value }))}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Flat Additional Fee (KES)</Label>
                <Input
                  type="number"
                  value={feesForm.flatFee}
                  onChange={(e) => setFeesForm((prev) => ({ ...prev, flatFee: e.target.value }))}
                  className="h-8 text-xs"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button size="sm" className="w-full">
                Save Fees
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Configuration Drawer/Sheet */}
      {isDesktop ? (
        <Sheet open={showDrawer} onOpenChange={setShowDrawer}>
          <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col border-l border-border bg-card">
            <SheetHeader className="border-b border-border bg-muted/20 px-4 py-4 flex justify-between items-center">
              <SheetTitle className="text-xl font-bold">
                {drawerMode === "mpesa" ? "Daraja API (M-Pesa)" : "Paystack API"}
              </SheetTitle>
              <SheetClose />
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              {drawerMode === "mpesa" ? <DarajaConfigForm /> : <PaystackConfigForm />}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Drawer open={showDrawer} onOpenChange={setShowDrawer}>
          <DrawerContent className="flex flex-col max-h-[85vh]">
            <DrawerHeader className="border-b border-border bg-muted/20 px-6 py-4">
              <div className="flex justify-between items-center">
                <DrawerTitle className="text-xl font-bold">
                  {drawerMode === "mpesa" ? "Configure Daraja API" : "Configure Paystack API"}
                </DrawerTitle>
                <DrawerClose />
              </div>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {drawerMode === "mpesa" ? <DarajaConfigForm /> : <PaystackConfigForm />}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </AdminLayout>
  )
}
