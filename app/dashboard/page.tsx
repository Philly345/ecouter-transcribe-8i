"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { FileText, Clock, CheckCircle, HardDrive, TrendingUp, Upload, Sparkles } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, markUserAsExisting } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Handle Google OAuth callback
    const token = searchParams.get("token")
    const userParam = searchParams.get("user")

    if (token && userParam) {
      try {
        const userData = JSON.parse(userParam)
        localStorage.setItem("auth_token", token)
        localStorage.setItem("user_data", JSON.stringify(userData))

        // Clean URL
        router.replace("/dashboard")
        window.location.reload()
      } catch (error) {
        console.error("Error processing OAuth callback:", error)
      }
    }
  }, [searchParams, router])

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  // Show welcome screen for new users
  if (user.isNewUser) {
    const isDemoUser = user.id === "demo_user"

    return (
      <div className="p-6 md:p-8 space-y-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-4">
              {isDemoUser
                ? "Welcome to the TranscribeAI Demo! 🎉"
                : `Welcome to TranscribeAI, ${user.name?.split(" ")[0]}! 🎉`}
            </h1>
            <p className="text-lg text-gray-400 mb-8">
              {isDemoUser
                ? "You're in demo mode! Upload up to 3 files to experience our AI transcription."
                : "You're all set up! Let's get you started with your first transcription."}
            </p>
          </div>

          {isDemoUser && (
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-blue-400">
                🚀 Demo Mode Active - Files uploaded in demo mode are not permanently saved
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
              <CardContent className="p-6 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                <h3 className="text-base font-semibold mb-2">Upload Files</h3>
                <p className="text-gray-400 text-sm">Drag & drop your audio or video files for instant transcription</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-green-400" />
                <h3 className="text-base font-semibold mb-2">AI-Powered</h3>
                <p className="text-gray-400 text-sm">
                  Get accurate transcripts with speaker identification and summaries
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                <h3 className="text-base font-semibold mb-2">Fast Processing</h3>
                <p className="text-gray-400 text-sm">Get your transcriptions in minutes, not hours</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Link href="/dashboard/upload">
              <Button size="lg" className="glow-button bg-white text-black hover:bg-gray-200 text-lg px-8 py-4">
                <Upload className="mr-2 h-5 w-5" />
                Upload Your First File
              </Button>
            </Link>

            <div>
              <Button variant="ghost" onClick={markUserAsExisting} className="text-gray-400 hover:text-white">
                Skip to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Regular dashboard for existing users
  const stats = [
    {
      title: "Total Transcriptions",
      value: "0",
      change: "+0%",
      icon: FileText,
      color: "text-blue-400",
    },
    {
      title: "Minutes Processed",
      value: "0",
      change: "+0%",
      icon: Clock,
      color: "text-green-400",
    },
    {
      title: "Completed Today",
      value: "0",
      change: "+0%",
      icon: CheckCircle,
      color: "text-purple-400",
    },
    {
      title: "Storage Used",
      value: "0 MB",
      change: "+0%",
      icon: HardDrive,
      color: "text-orange-400",
    },
  ]

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name?.split(" ")[0] || "User"}!</h1>
          <p className="text-lg text-gray-400">Ready to transcribe some audio? Let's get started.</p>
        </div>

        <Link href="/dashboard/upload">
          <Button className="glow-button bg-white text-black hover:bg-gray-200 mt-4 md:mt-0">
            <Upload className="mr-2 h-4 w-4" />
            Upload New File
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                    <span className="text-sm text-green-400">{stat.change}</span>
                  </div>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Storage Usage */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <HardDrive className="mr-2 h-5 w-5" />
            Storage Usage
          </CardTitle>
          <CardDescription>You're using 0 MB of your 1 GB storage limit</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={0} className="mb-2" />
          <div className="flex justify-between text-sm text-gray-400">
            <span>0 MB used</span>
            <span>1 GB total</span>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>Upload your first audio or video file to begin transcribing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Upload className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-base font-semibold mb-2">No files yet</h3>
            <p className="text-gray-400 mb-6">
              Upload your first audio or video file to get started with AI transcription
            </p>

            <Link href="/dashboard/upload">
              <Button className="glow-button bg-white text-black hover:bg-gray-200">
                <Upload className="mr-2 h-4 w-4" />
                Upload Your First File
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
