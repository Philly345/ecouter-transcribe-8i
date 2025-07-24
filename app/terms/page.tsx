"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TermsPage() {
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

      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-8 gradient-logo">Terms of Service</h1>
        <p className="text-gray-400 mb-8">Last updated: January 2024</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300">
              By accessing and using TranscribeAI, you accept and agree to be bound by the terms and provision of this
              agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
            <p className="text-gray-300 mb-4">
              TranscribeAI provides AI-powered transcription services that convert audio and video files into text
              format. Our services include:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Automated transcription of audio and video files</li>
              <li>Speaker identification and separation</li>
              <li>AI-generated summaries and insights</li>
              <li>Multiple export formats</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
            <p className="text-gray-300 mb-4">
              To use our services, you must create an account and provide accurate information. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Acceptable Use</h2>
            <p className="text-gray-300 mb-4">You agree not to use our service to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Upload content that violates any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious software or harmful content</li>
              <li>Attempt to reverse engineer or hack our systems</li>
              <li>Use the service for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Content and Intellectual Property</h2>
            <p className="text-gray-300 mb-4">
              You retain ownership of your uploaded content. By using our service, you grant us a limited license to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Process your files to provide transcription services</li>
              <li>Store your content temporarily for processing</li>
              <li>Use anonymized data to improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Payment and Billing</h2>
            <p className="text-gray-300 mb-4">Payment terms for our services:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Fees are charged based on your selected plan</li>
              <li>All payments are processed securely through third-party providers</li>
              <li>Refunds are provided according to our refund policy</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Service Availability</h2>
            <p className="text-gray-300">
              While we strive for 99.9% uptime, we cannot guarantee uninterrupted service. We reserve the right to
              modify or discontinue services with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-300">
              TranscribeAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages
              resulting from your use of our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Termination</h2>
            <p className="text-gray-300">
              Either party may terminate this agreement at any time. Upon termination, your access to the service will
              cease, and we will delete your data according to our retention policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Contact Information</h2>
            <p className="text-gray-300">
              For questions about these Terms of Service, please contact us at{" "}
              <Link href="/contact" className="text-white hover:underline">
                legal@transcribeai.com
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
