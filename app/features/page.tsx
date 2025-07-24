"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mic, Users, Clock, Shield, Sparkles, Globe, FileText, Download, Search, Zap } from "lucide-react"
import Link from "next/link"

export default function FeaturesPage() {
  const features = [
    {
      icon: Mic,
      title: "High Accuracy Transcription",
      description: "Advanced AI models ensure 99%+ accuracy for clear audio with minimal background noise.",
      badge: "Core Feature",
      details: [
        "State-of-the-art speech recognition",
        "Noise reduction algorithms",
        "Multiple audio format support",
        "Real-time processing",
      ],
    },
    {
      icon: Users,
      title: "Speaker Identification",
      description: "Automatically identify and separate different speakers in your audio files.",
      badge: "AI Powered",
      details: ["Up to 10 speakers per file", "Speaker diarization", "Voice pattern recognition", "Timestamp accuracy"],
    },
    {
      icon: Clock,
      title: "Fast Processing",
      description: "Get your transcriptions in minutes, not hours, regardless of file size.",
      badge: "Performance",
      details: [
        "2-5 minutes per hour of audio",
        "Parallel processing",
        "Cloud-based infrastructure",
        "Real-time progress tracking",
      ],
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your files are encrypted during upload and processing, then automatically deleted.",
      badge: "Security",
      details: ["End-to-end encryption", "GDPR compliant", "Auto-deletion after 30 days", "No data retention"],
    },
    {
      icon: Sparkles,
      title: "AI Summaries",
      description: "Get intelligent summaries, key topics, and insights from your transcriptions.",
      badge: "AI Powered",
      details: ["Automatic summarization", "Key topic extraction", "Sentiment analysis", "Action item identification"],
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Support for over 100 languages with high accuracy across different accents.",
      badge: "Global",
      details: [
        "100+ languages supported",
        "Accent recognition",
        "Regional dialect support",
        "Translation capabilities",
      ],
    },
    {
      icon: FileText,
      title: "Multiple Export Formats",
      description: "Export your transcriptions in various formats including TXT, SRT, VTT, and more.",
      badge: "Flexibility",
      details: [
        "TXT, SRT, VTT formats",
        "Timestamp preservation",
        "Speaker labels included",
        "Custom formatting options",
      ],
    },
    {
      icon: Search,
      title: "Advanced Search",
      description: "Search through your transcriptions with powerful filtering and highlighting.",
      badge: "Productivity",
      details: ["Full-text search", "Keyword highlighting", "Time-based filtering", "Speaker-specific search"],
    },
    {
      icon: Download,
      title: "Batch Processing",
      description: "Upload and process multiple files simultaneously for increased productivity.",
      badge: "Enterprise",
      details: ["Multiple file upload", "Queue management", "Progress tracking", "Bulk export options"],
    },
    {
      icon: Zap,
      title: "API Integration",
      description: "Integrate our transcription service into your applications with our REST API.",
      badge: "Developer",
      details: ["RESTful API", "Webhook support", "SDK libraries", "Comprehensive documentation"],
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="gradient-logo text-xl font-bold">
            TranscribeAI
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/demo">
              <Button className="bg-white text-black hover:bg-gray-200">Try Demo</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold gradient-logo">Powerful Features</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover all the advanced capabilities that make TranscribeAI the most comprehensive transcription solution
            for professionals and businesses.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="border-white/20 text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center text-xs text-gray-400">
                      <div className="w-1 h-1 bg-white/40 rounded-full mr-2" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6 py-12">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Experience the power of AI-driven transcription with all these features and more. Start your free trial
            today and see the difference quality makes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200">
                Try Free Demo
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
