import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Read credentials from env
    const basicAuth = process.env.PAYHERO_BASIC_AUTH || "QlFxb1h0ekFtOGJEVndwaFdQS2U6QkpVZlRnclJhRWhOaVpIUjVCTDJTdnRTN3duSUZzWndDT2Z3YjRLcA==";
    
    // Log the request payload for testing purposes
    console.log("[PayHero API Proxy] Initiating withdrawal request with payload:", body);

    const response = await fetch("https://backend.payhero.co.ke/api/v2/withdraw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${basicAuth}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("[PayHero API Proxy] PayHero withdrawal response:", data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[PayHero API Proxy] Error during withdrawal proxy:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
