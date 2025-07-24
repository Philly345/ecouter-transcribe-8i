"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Key, Zap, Shield } from "lucide-react"
import Link from "next/link"

export default function APIPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 border-b border-white/10">
        <Link href="/" className="gradient-logo text-xl font-bold">
          TranscribeAI
        </Link>
        <div className="space-x-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Login
            </Button>
          </Link>
          <Link href="/demo">
            <Button className="glow-button bg-white text-black hover:bg-gray-200">Try Demo</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-logo">TranscribeAI API</h1>
          <p className="text-xl text-gray-300">Integrate powerful AI transcription into your applications</p>
        </div>

        {/* API Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              icon: Code,
              title: "RESTful API",
              description: "Simple HTTP endpoints for easy integration",
            },
            {
              icon: Key,
              title: "Secure Authentication",
              description: "API keys with rate limiting and usage tracking",
            },
            {
              icon: Zap,
              title: "Real-time Processing",
              description: "WebSocket support for live transcription updates",
            },
            {
              icon: Shield,
              title: "Enterprise Ready",
              description: "99.9% uptime SLA with dedicated support",
            },
          ].map((feature, index) => (
            <Card key={index} className="bg-white/5 border-white/10 text-center">
              <CardContent className="p-6">
                <feature.icon className="h-12 w-12 mx-auto mb-4 text-white" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Start */}
        <Card className="bg-white/5 border-white/10 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Start</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">1. Get Your API Key</h3>
                <p className="text-gray-300">Sign up for an account and generate your API key from the dashboard.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">2. Upload a File</h3>
                <div className="bg-black/50 p-4 rounded-lg">
                  <code className="text-green-400">
                    {`curl -X POST https://api.transcribeai.com/v1/transcribe \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@audio.mp3" \\
  -F "language=en"`}
                  </code>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">3. Get Results</h3>
                <p className="text-gray-300">Receive your transcription with speaker identification and timestamps.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <Card className="bg-white/5 border-white/10 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">API Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                {
                  method: "POST",
                  endpoint: "/v1/transcribe",
                  description: "Upload and transcribe an audio/video file",
                },
                {
                  method: "GET",
                  endpoint: "/v1/transcriptions/{id}",
                  description: "Get transcription status and results",
                },
                {
                  method: "GET",
                  endpoint: "/v1/transcriptions",
                  description: "List all your transcriptions",
                },
                {
                  method: "DELETE",
                  endpoint: "/v1/transcriptions/{id}",
                  description: "Delete a transcription",
                },
              ].map((endpoint, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                  <Badge
                    className={`${endpoint.method === "GET" ? "bg-blue-500/20 text-blue-400" : endpoint.method === "POST" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                  >
                    {endpoint.method}
                  </Badge>
                  <code className="text-white font-mono">{endpoint.endpoint}</code>
                  <span className="text-gray-400">{endpoint.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to integrate?</h2>
          <p className="text-gray-300 mb-6">Get started with our API documentation and examples</p>
          <div className="space-x-4">
            <Button className="glow-button bg-white text-black hover:bg-gray-200">View Documentation</Button>
            <Link href="/signup">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white hover:text-black bg-transparent"
              >
                Get API Key
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
