import { NextRequest, NextResponse } from "next/server"
import { initializePaystackService } from "@/lib/paystack-service"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference } = body

    if (!reference) {
      return NextResponse.json(
        { message: "Reference is required" },
        { status: 400 }
      )
    }

    // Initialize Paystack service
    const paystack = initializePaystackService()

    // Verify transaction
    const verification = await paystack.verifyTransaction(reference)

    if (!verification.status) {
      return NextResponse.json(
        { message: "Failed to verify transaction" },
        { status: 400 }
      )
    }

    // Update transaction in database
    const status =
      verification.data.status === "success"
        ? "success"
        : verification.data.status === "failed"
          ? "failed"
          : "pending"

    await convex.mutation(api.paystack.updateTransactionStatus, {
      reference,
      status,
      amount: verification.data.amount ? verification.data.amount / 100 : undefined, // Convert from cents
      authorizationCode: verification.data.authorization?.authorization_code,
      cardType: verification.data.authorization?.card_type,
    })

    return NextResponse.json({
      success: true,
      status: verification.data.status,
      amount: verification.data.amount / 100,
    })
  } catch (error) {
    console.error("[Paystack API] Verify error:", error)
    return NextResponse.json(
      { message: `Error: ${String(error)}` },
      { status: 500 }
    )
  }
}
