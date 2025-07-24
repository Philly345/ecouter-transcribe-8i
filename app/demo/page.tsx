"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Sparkles, FileText, Users } from "lucide-react"

export default function DemoPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const startDemo = async () => {
    setLoading(true)

    // Create demo user session
    const demoUser = {
      id: "demo_user",
      email: "demo@transcribeai.com",
      name: "Demo User",
      picture: "/placeholder.svg?height=40&width=40&text=Demo",
      isNewUser: true,
    }

    const demoToken = "demo_token_" + Date.now()

    localStorage.setItem("auth_token", demoToken)
    localStorage.setItem("user_data", JSON.stringify(demoUser))

    // Redirect to dashboard
    setTimeout(() => {
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      <Card className="w-full max-w-2xl bg-white/5 border-white/10 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl gradient-logo mb-2">Try TranscribeAI Demo</CardTitle>
          <CardDescription className="text-gray-400 text-base">
            Experience the full power of AI transcription without creating an account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Demo Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="p-3 bg-blue-500/10 rounded-lg mx-auto w-fit">
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-base">AI Transcription</h3>
                <p className="text-sm text-gray-400">Upload audio/video files for instant transcription</p>
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="p-3 bg-green-500/10 rounded-lg mx-auto w-fit">
                <Sparkles className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Smart Summaries</h3>
                <p className="text-sm text-gray-400">Get AI-generated summaries and key topics</p>
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="p-3 bg-purple-500/10 rounded-lg mx-auto w-fit">
                <Users className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Speaker ID</h3>
                <p className="text-sm text-gray-400">Automatic speaker identification and separation</p>
              </div>
            </div>
          </div>

          {/* Demo Info */}
          <div className="bg-white/5 p-6 rounded-lg space-y-4">
            <h3 className="font-semibold text-base">What's included in the demo:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Upload and transcribe audio/video files (up to 100MB)
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                AI-powered summaries and topic extraction
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Speaker identification and timestamps
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Download transcripts and summaries
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Full dashboard experience
              </li>
            </ul>
          </div>

          {/* Demo Limitations */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-400 mb-2">Demo Limitations:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Files are not permanently saved</li>
              <li>• Maximum 3 files per demo session</li>
              <li>• Demo session expires after 2 hours</li>
            </ul>
          </div>

          {/* Start Demo Button */}
          <div className="text-center space-y-4">
            <Button
              onClick={startDemo}
              disabled={loading}
              size="lg"
              className="glow-button bg-white text-black hover:bg-gray-200 text-lg px-12 py-4"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Starting Demo...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Start Demo Now
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500">No registration required • Start transcribing in seconds</p>
          </div>

          {/* Contact for Full Access */}
          <div className="text-center pt-6 border-t border-white/10">
            <p className="text-sm text-gray-400 mb-2">Need full access with unlimited uploads and permanent storage?</p>
            <Button variant="ghost" className="text-gray-400 hover:text-white text-sm">
              Contact us for full access
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
