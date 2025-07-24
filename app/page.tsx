"use client"

import { TypingText } from "@/components/typing-text"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Mic, Clock, Users, Shield, Star, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6">
        <div className="gradient-logo text-xl font-bold">TranscribeAI</div>
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

      {/* Hero Section */}
      <section className="relative z-10 text-center py-20 px-6">
        <h1 className="gradient-logo text-4xl md:text-6xl font-bold mb-6">
          Transcribe smarter,
          <br />
          not harder.
        </h1>

        <div className="text-lg md:text-xl text-gray-300 mb-12 h-8">
          <TypingText text="AI-powered transcription with speaker identification and smart summaries" />
        </div>

        <Link href="/demo">
          <Button size="lg" className="glow-button bg-white text-black hover:bg-gray-200 text-lg px-8 py-4">
            Try Demo
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Powerful Features</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Mic,
                title: "High Accuracy",
                description: "Advanced AI models ensure 99%+ accuracy for clear audio",
              },
              {
                icon: Users,
                title: "Speaker ID",
                description: "Automatically identify and separate different speakers",
              },
              {
                icon: Clock,
                title: "Fast Processing",
                description: "Get your transcriptions in minutes, not hours",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Your files are encrypted and automatically deleted",
              },
            ].map((feature, index) => (
              <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                <CardContent className="p-6 text-center">
                  <feature.icon className="h-12 w-12 mx-auto mb-4 text-white" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">What Our Users Say</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Journalist",
                content:
                  "This tool has revolutionized my interview workflow. The speaker identification is incredibly accurate.",
                rating: 5,
              },
              {
                name: "Mike Chen",
                role: "Researcher",
                content: "Fast, accurate, and the AI summaries save me hours of work. Highly recommended!",
                rating: 5,
              },
              {
                name: "Emily Davis",
                role: "Content Creator",
                content: "Perfect for transcribing my podcast episodes. The quality is consistently excellent.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Frequently Asked Questions</h2>

          <Accordion type="single" collapsible className="space-y-4">
            {[
              {
                question: "What file formats do you support?",
                answer:
                  "We support all major audio formats (MP3, WAV, M4A, FLAC, AAC) and video formats (MP4, MOV, AVI, MKV, WMV). Maximum file size is 500MB.",
              },
              {
                question: "How accurate is the transcription?",
                answer:
                  "Our AI models achieve 99%+ accuracy for clear audio with minimal background noise. Accuracy may vary based on audio quality, accents, and technical terminology.",
              },
              {
                question: "Do you support multiple languages?",
                answer:
                  "Yes, we support over 50 languages including English, Spanish, French, German, Chinese, Japanese, and many more.",
              },
              {
                question: "Is my data secure?",
                answer:
                  "Absolutely. All files are encrypted during upload and processing. We automatically delete your files after 30 days, and you can delete them immediately after download.",
              },
              {
                question: "How long does transcription take?",
                answer:
                  "Processing time is typically 2-5 minutes per hour of audio, depending on file size and current system load.",
              },
            ].map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-white/10">
                <AccordionTrigger className="text-left hover:text-gray-300">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-400">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="gradient-logo text-xl font-bold mb-4">TranscribeAI</div>
              <p className="text-gray-400">
                Professional AI-powered transcription service for all your audio and video needs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-base">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-base">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Status
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-base">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TranscribeAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
