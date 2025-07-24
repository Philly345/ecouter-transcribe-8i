"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate sending reset email
    setTimeout(() => {
      setSent(true)
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-xl gradient-logo">{sent ? "Check Your Email" : "Reset Password"}</CardTitle>
          <CardDescription className="text-gray-400">
            {sent
              ? "We've sent a password reset link to your email"
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full glow-button bg-white text-black hover:bg-gray-200"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <Mail className="h-8 w-8 mx-auto mb-2 text-green-400" />
                <p className="text-sm text-green-400">Password reset link sent to {email}</p>
              </div>

              <p className="text-sm text-gray-400">Didn't receive the email? Check your spam folder or try again.</p>
            </div>
          )}

          <div className="text-center">
            <Link href="/login" className="inline-flex items-center text-sm text-gray-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
