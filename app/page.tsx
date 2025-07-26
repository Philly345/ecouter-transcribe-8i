"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FloatingBubbles } from "@/components/floating-bubbles"
import { Mic, Zap, Shield, Users, Clock, Download, Star, ArrowRight, Play, Languages } from "lucide-react"

export default function HomePage() {
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [isTranslating, setIsTranslating] = useState(false)

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === "en") {
      setSelectedLanguage("en")
      return
    }

    setIsTranslating(true)
    setSelectedLanguage(languageCode)
    // Simulate translation delay
    setTimeout(() => {
      setIsTranslating(false)
    }, 1000)
  }

  const getTranslatedText = (englishText: string) => {
    if (selectedLanguage === "en" || isTranslating) return englishText

    // Simple demonstration - in real implementation, you'd translate all text
    const translations: { [key: string]: { [key: string]: string } } = {
      es: {
        "Transform Audio into Intelligent Insights": "Transformar Audio en Perspectivas Inteligentes",
        "Get Started": "Empezar",
        "Try Demo": "Probar Demo",
        "Trusted by 10,000+ users worldwide": "Confiado por más de 10,000 usuarios en todo el mundo",
        "Sign Up": "Registrarse",
        "Join Waitlist": "Unirse a Lista de Espera",
      },
      fr: {
        "Transform Audio into Intelligent Insights": "Transformer l'Audio en Insights Intelligents",
        "Get Started": "Commencer",
        "Try Demo": "Essayer la Démo",
        "Trusted by 10,000+ utilisateurs dans le monde": "Approuvé par plus de 10 000 utilisateurs dans le monde",
        "Sign Up": "S'inscrire",
        "Join Waitlist": "Rejoindre la Liste d'Attente",
      },
      de: {
        "Transform Audio into Intelligent Insights": "Audio in Intelligente Erkenntnisse Verwandeln",
        "Get Started": "Loslegen",
        "Try Demo": "Demo Testen",
        "Trusted by 10,000+ users worldwide": "Vertraut von über 10.000 Nutzern weltweit",
        "Sign Up": "Anmelden",
        "Join Waitlist": "Warteliste Beitreten",
      },
    }

    return translations[selectedLanguage]?.[englishText] || englishText
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <FloatingBubbles />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 md:p-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Mic className="h-5 w-5 text-black" />
          </div>
          <span className="text-xl font-bold">TranscribeAI</span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <Link href="/features" className="hover:text-gray-300 transition-colors">
            Features
          </Link>
          <Link href="/help" className="hover:text-gray-300 transition-colors">
            Help
          </Link>

          {/* Website Language Selector */}
          <div className="flex items-center space-x-2">
            <Languages className="h-4 w-4 text-gray-400" />
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/20 text-white max-h-60">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
                <SelectItem value="ko">한국어</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="hi">हिन्दी</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="it">Italiano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-white text-black hover:bg-gray-200">{getTranslatedText("Get Started")}</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-20 pb-32">
        <div className="text-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent px-4">
              {getTranslatedText("Transform Audio into Intelligent Insights")}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {isTranslating
                ? "Translating..."
                : "Advanced AI-powered transcription with speaker identification, sentiment analysis, and intelligent summaries. Upload your audio and get professional results in minutes."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-8 py-4 text-lg">
                {getTranslatedText("Get Started")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
              >
                <Play className="mr-2 h-5 w-5" />
                {getTranslatedText("Try Demo")}
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm">{getTranslatedText("Trusted by 10,000+ users worldwide")}</span>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Mic className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Transcription</h3>
              <p className="text-gray-400">
                State-of-the-art speech recognition with 99%+ accuracy across 100+ languages
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Speaker ID</h3>
              <p className="text-gray-400">Automatically identify and separate different speakers in your audio</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Summaries</h3>
              <p className="text-gray-400">AI-generated summaries, key topics, and actionable insights</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Processing</h3>
              <p className="text-gray-400">
                Get your transcripts in minutes, not hours. Optimized for speed and accuracy
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-400">Enterprise-grade security with end-to-end encryption and GDPR compliance</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multiple Formats</h3>
              <p className="text-gray-400">Export in TXT, SRT, VTT, or JSON. Perfect for any workflow</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section - Updated buttons */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 pb-20">
        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-white/10">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Audio?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of professionals who trust TranscribeAI for their transcription needs
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-8 py-4">
                  {getTranslatedText("Sign Up")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/waitlist">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-4 bg-transparent"
                >
                  {getTranslatedText("Join Waitlist")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Mic className="h-5 w-5 text-black" />
                </div>
                <span className="text-xl font-bold">TranscribeAI</span>
              </div>
              <p className="text-gray-400">Advanced AI transcription for professionals and businesses worldwide.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2">
                <Link href="/features" className="block text-gray-400 hover:text-white transition-colors">
                  Features
                </Link>
                <Link href="/api-docs" className="block text-gray-400 hover:text-white transition-colors">
                  API Docs
                </Link>
                <Link href="/status" className="block text-gray-400 hover:text-white transition-colors">
                  Status
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <Link href="/help" className="block text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="block text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="/cookies" className="block text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TranscribeAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}




