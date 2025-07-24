"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: ["5 hours of transcription per month", "Basic accuracy", "Standard support", "Export to TXT"],
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      popular: true,
      features: [
        "50 hours of transcription per month",
        "High accuracy with speaker ID",
        "Priority support",
        "Export to TXT, DOCX, PDF, SRT",
        "AI summaries and insights",
      ],
    },
    {
      name: "Business",
      price: "$49",
      period: "per month",
      features: [
        "200 hours of transcription per month",
        "Highest accuracy with speaker ID",
        "24/7 priority support",
        "All export formats",
        "AI summaries and insights",
        "Team collaboration",
        "API access",
      ],
    },
  ]

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
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-logo">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-300">Choose the plan that fits your transcription needs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`bg-white/5 border-white/10 relative ${plan.popular ? "ring-2 ring-white/20" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-white text-black px-3 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  {plan.price}
                  <span className="text-lg font-normal text-gray-400">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.popular ? "glow-button bg-white text-black hover:bg-gray-200" : "border-white/20 text-white hover:bg-white hover:text-black"}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
          <p className="text-gray-300 mb-6">Contact us for enterprise pricing and custom integrations</p>
          <Link href="/contact">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white hover:text-black bg-transparent"
            >
              Contact Sales
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
