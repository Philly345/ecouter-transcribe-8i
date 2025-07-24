"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold mb-8 gradient-logo">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: January 2024</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
            <p className="text-gray-300 mb-4">
              We collect information you provide directly to us, such as when you create an account, upload files for
              transcription, or contact us for support.
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Account information (name, email address, password)</li>
              <li>Audio and video files you upload for transcription</li>
              <li>Payment information (processed securely through third-party providers)</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-300 mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Provide, maintain, and improve our transcription services</li>
              <li>Process your files and generate transcriptions</li>
              <li>Communicate with you about your account and our services</li>
              <li>Analyze usage patterns to improve our platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Data Security</h2>
            <p className="text-gray-300 mb-4">
              We implement appropriate technical and organizational measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>All files are encrypted during upload and processing</li>
              <li>Data is stored on secure, encrypted servers</li>
              <li>Access to your data is restricted to authorized personnel only</li>
              <li>We automatically delete your files after 30 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Data Retention</h2>
            <p className="text-gray-300 mb-4">
              We retain your information for as long as necessary to provide our services:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Uploaded files: Automatically deleted after 30 days</li>
              <li>Transcriptions: Stored until you delete them or close your account</li>
              <li>Account information: Retained until you request deletion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Sharing of Information</h2>
            <p className="text-gray-300 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties, except:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
            <p className="text-gray-300 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Contact Us</h2>
            <p className="text-gray-300">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <Link href="/contact" className="text-white hover:underline">
                privacy@transcribeai.com
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
