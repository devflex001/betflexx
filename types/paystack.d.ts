/**
 * TypeScript declarations for Paystack Popup v2
 * Official Paystack inline payment modal SDK
 */

interface PaystackTransaction {
  reference: string
  status: string
  message: string
  trans: string
  transaction: string
  trxref: string
}

interface PaystackSetupOptions {
  key: string
  email: string
  amount: number
  ref?: string
  currency?: string
  metadata?: Record<string, any>
  onSuccess?: (transaction: PaystackTransaction) => void
  onCancel?: () => void
  onClose?: () => void
}

interface PaystackInstance {
  setup: (options: PaystackSetupOptions) => PaystackModal
}

interface PaystackModal {
  openIframe: () => void
  resumeTransaction: (accessCode: string) => void
}

interface Window {
  PaystackPop: PaystackInstance
}
