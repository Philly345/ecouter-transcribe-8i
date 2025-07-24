import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // In production, save to your database
    if (email && password && name) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
