"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, Search, MessageCircle, Mail, Book, Video, FileText } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I upload a file for transcription?",
          answer:
            "Simply drag and drop your audio or video file onto the upload area, or click to browse and select your file. We support all major formats including MP3, WAV, MP4, and more.",
        },
        {
          question: "What file formats are supported?",
          answer:
            "We support all major audio formats (MP3, WAV, M4A, FLAC, AAC) and video formats (MP4, MOV, AVI, MKV, WMV). Maximum file size is 500MB.",
        },
        {
          question: "How long does transcription take?",
          answer:
            "Processing time is typically 2-5 minutes per hour of audio, depending on file size and current system load. You'll receive real-time progress updates.",
        },
      ],
    },
    {
      category: "Features & Functionality",
      questions: [
        {
          question: "How accurate is the transcription?",
          answer:
            "Our AI models achieve 99%+ accuracy for clear audio with minimal background noise. Accuracy may vary based on audio quality, accents, and technical terminology.",
        },
        {
          question: "Can you identify different speakers?",
          answer:
            "Yes! Our speaker identification feature can automatically detect and separate up to 10 different speakers in your audio, with timestamps for each speaker segment.",
        },
        {
          question: "Do you support multiple languages?",
          answer:
            "Yes, we support over 100 languages including English, Spanish, French, German, Chinese, Japanese, Arabic, Hindi, and many more with high accuracy.",
        },
        {
          question: "What is the AI summary feature?",
          answer:
            "Our AI automatically generates concise summaries, extracts key topics, identifies main insights, and can even detect sentiment and action items from your transcriptions.",
        },
      ],
    },
    {
      category: "Privacy & Security",
      questions: [
        {
          question: "Is my data secure?",
          answer:
            "Absolutely. All files are encrypted during upload and processing using industry-standard encryption. We're GDPR compliant and follow strict security protocols.",
        },
        {
          question: "How long do you keep my files?",
          answer:
            "We automatically delete your files after 30 days. You can also delete them immediately after download if you prefer. We don't retain any data longer than necessary.",
        },
        {
          question: "Who has access to my transcriptions?",
          answer:
            "Only you have access to your transcriptions. Our staff cannot view your content, and we never share or sell your data to third parties.",
        },
      ],
    },
    {
      category: "Billing & Plans",
      questions: [
        {
          question: "Do you offer a free trial?",
          answer:
            "Yes! You can try our service with a free demo that allows you to transcribe up to 15 minutes of audio to experience our quality and features.",
        },
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers.",
        },
        {
          question: "Can I cancel my subscription anytime?",
          answer:
            "Yes, you can cancel your subscription at any time. There are no cancellation fees, and you'll retain access until the end of your billing period.",
        },
      ],
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "My transcription failed. What should I do?",
          answer:
            "First, check that your file is in a supported format and under 500MB. If the issue persists, try uploading again or contact our support team with the error details.",
        },
        {
          question: "Can I integrate TranscribeAI with my application?",
          answer:
            "Yes! We offer a comprehensive REST API with webhooks, SDKs, and detailed documentation for seamless integration into your applications.",
        },
        {
          question: "Do you offer bulk processing?",
          answer:
            "Yes, our Pro and Enterprise plans support batch processing, allowing you to upload and process multiple files simultaneously.",
        },
      ],
    },
  ]

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0)

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
            <Link href="/contact">
              <Button className="bg-white text-black hover:bg-gray-200">Contact Support</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold gradient-logo">Help Center</h1>
          <p className="text-xl text-gray-300">Find answers to common questions and get the help you need</p>
        </div>

        {/* Search */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-400 h-12"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <Book className="h-8 w-8 mx-auto mb-2 text-blue-400" />
              <CardTitle className="text-lg">Documentation</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-400 text-sm mb-4">Comprehensive guides and tutorials</p>
              <Button variant="outline" size="sm" className="border-white/20 bg-transparent">
                View Docs
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <Video className="h-8 w-8 mx-auto mb-2 text-green-400" />
              <CardTitle className="text-lg">Video Tutorials</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-400 text-sm mb-4">Step-by-step video guides</p>
              <Button variant="outline" size="sm" className="border-white/20 bg-transparent">
                Watch Videos
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-purple-400" />
              <CardTitle className="text-lg">API Reference</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-400 text-sm mb-4">Developer documentation and examples</p>
              <Link href="/api-docs">
                <Button variant="outline" size="sm" className="border-white/20 bg-transparent">
                  View API
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>

          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-400">{category.category}</h3>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem
                      key={faqIndex}
                      value={`${categoryIndex}-${faqIndex}`}
                      className="border-white/10 bg-white/5 rounded-lg px-4"
                    >
                      <AccordionTrigger className="text-left hover:text-gray-300">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-gray-400 leading-relaxed">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No results found for "{searchQuery}"</p>
              <Button
                variant="ghost"
                onClick={() => setSearchQuery("")}
                className="mt-4 text-blue-400 hover:text-blue-300"
              >
                Clear search
              </Button>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Still need help?</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-300">Can't find what you're looking for? Our support team is here to help.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-white text-black hover:bg-gray-200">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </Link>
              <Button variant="outline" className="border-white/20 bg-transparent">
                <MessageCircle className="h-4 w-4 mr-2" />
                Live Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
