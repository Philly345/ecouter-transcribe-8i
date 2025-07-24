import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_CLIENT_ID = "204687581915-v0ficd9osiofs5vblt910f5or4agrgkd.apps.googleusercontent.com"
const GOOGLE_CLIENT_SECRET = "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"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    // Redirect to Google OAuth
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    googleAuthUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID)
    googleAuthUrl.searchParams.set("redirect_uri", `${request.nextUrl.origin}/api/auth/google`)
    googleAuthUrl.searchParams.set("response_type", "code")
    googleAuthUrl.searchParams.set("scope", "openid email profile")
    googleAuthUrl.searchParams.set("access_type", "offline")

    return NextResponse.redirect(googleAuthUrl.toString())
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${request.nextUrl.origin}/api/auth/google`,
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokens.access_token) {
      throw new Error("Failed to get access token")
    }

    // Get user info
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    const googleUser = await userResponse.json()

    // Create user session
    const user = {
      id: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      isNewUser: true, // Mark as new user for fresh interface
    }

    const token = "jwt_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)

    // Redirect to dashboard with user data
    const dashboardUrl = new URL("/dashboard", request.nextUrl.origin)
    dashboardUrl.searchParams.set("token", token)
    dashboardUrl.searchParams.set("user", JSON.stringify(user))

    return NextResponse.redirect(dashboardUrl.toString())
  } catch (error) {
    console.error("Google OAuth error:", error)
    return NextResponse.redirect(`${request.nextUrl.origin}/login?error=oauth_failed`)
  }
}
