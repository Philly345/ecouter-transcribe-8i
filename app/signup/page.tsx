"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { signup, loginWithGoogle } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const success = await signup(email, password, name)
    if (success) {
      router.push("/login")
    } else {
      setError("Failed to create account. Please try again.")
    }
    setLoading(false)
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    const success = await loginWithGoogle()
    if (success) {
      router.push("/dashboard")
    } else {
      setError("Failed to sign up with Google. Please try again.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-xl gradient-logo">Create Account</CardTitle>
          <CardDescription className="text-gray-400">Join thousands of users transcribing smarter</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="text-base font-semibold text-blue-400 mb-2">Account Creation Disabled</h3>
              <p className="text-sm text-gray-400">
                New account registration is currently disabled. Try our demo instead to experience the full
                transcription capabilities.
              </p>
            </div>

            <Link href="/demo">
              <Button className="w-full glow-button bg-white text-black hover:bg-gray-200">Try Demo Instead</Button>
            </Link>
          </div>

          <div className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
