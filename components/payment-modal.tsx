"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PaymentStage =
  | "initiating"
  | "pending_user_action"
  | "processing"
  | "success"
  | "failed"
  | "cancelled"
  | "timeout"
  | "error"

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stage: PaymentStage
  amount?: number
  phone?: string
  provider: "mpesa" | "paystack"
  message?: string
  mpesaReceiptNumber?: string
  paystackReference?: string
  onReset?: () => void
  onClose?: () => void
}

const stageConfig = {
  initiating: {
    title: "Processing Payment",
    icon: Loader2,
    iconClass: "text-primary animate-spin",
  },
  pending_user_action: {
    title: "Complete Payment",
    icon: Loader2,
    iconClass: "text-primary animate-spin",
  },
  processing: {
    title: "Verifying Payment",
    icon: Loader2,
    iconClass: "text-primary animate-spin",
  },
  success: {
    title: "Payment Successful",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
  },
  failed: {
    title: "Payment Failed",
    icon: XCircle,
    iconClass: "text-red-600",
  },
  cancelled: {
    title: "Payment Cancelled",
    icon: AlertTriangle,
    iconClass: "text-amber-600",
  },
  timeout: {
    title: "Payment Timeout",
    icon: Clock,
    iconClass: "text-gray-600",
  },
  error: {
    title: "Error",
    icon: XCircle,
    iconClass: "text-red-600",
  },
}

export function PaymentModal({
  open,
  onOpenChange,
  stage,
  provider,
  message,
  onReset,
  onClose,
}: PaymentModalProps) {
  const safeStage = stage || "initiating"
  const config = stageConfig[safeStage]
  const Icon = config.icon
  const isComplete = ["success", "failed", "cancelled", "timeout", "error"].includes(safeStage)

  React.useEffect(() => {
    if (safeStage === "success" && onClose) {
      const timer = setTimeout(() => {
        onClose()
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [safeStage, onClose])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 border-0">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <Icon className={cn("h-14 w-14", config.iconClass)} />
            <h2 className="text-lg font-semibold text-white">{config.title}</h2>

            {message && safeStage !== "success" && (
              <p className="text-sm text-slate-300">{message}</p>
            )}

            {isComplete && (
              <div className="w-full pt-4 space-y-2">
                {safeStage === "success" ? (
                  <Button
                    onClick={() => {
                      if (onClose) onClose()
                      if (onReset) onReset()
                    }}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Close
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        if (onClose) onClose()
                      }}
                      variant="outline"
                      className="w-full border-slate-600 text-white hover:bg-slate-700"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        if (onClose) onClose()
                        if (onReset) onReset()
                      }}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      Try Again
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
