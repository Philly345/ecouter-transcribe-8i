import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // In production, validate against your database
    if (email && password) {
      const mockUser = {
        id: "user_" + Date.now(),
        email,
        name: email.split("@")[0],
        isNewUser: false,
      }

      const mockToken = "jwt_token_" + Date.now()

      return NextResponse.json({
        user: mockUser,
        token: mockToken,
      })
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
