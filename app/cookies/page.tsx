"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CookiesPage() {
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
        <h1 className="text-4xl font-bold mb-8 gradient-logo">Cookie Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: January 2024</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">What Are Cookies</h2>
            <p className="text-gray-300">
              Cookies are small text files that are stored on your computer or mobile device when you visit our website.
              They help us provide you with a better experience by remembering your preferences and improving our
              services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">How We Use Cookies</h2>
            <p className="text-gray-300 mb-4">We use cookies for several purposes:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>
                <strong>Essential Cookies:</strong> Required for the website to function properly
              </li>
              <li>
                <strong>Performance Cookies:</strong> Help us understand how visitors interact with our website
              </li>
              <li>
                <strong>Functionality Cookies:</strong> Remember your preferences and settings
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Provide insights into website usage and performance
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Types of Cookies We Use</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Essential Cookies</h3>
                <p className="text-gray-300 mb-2">
                  These cookies are necessary for the website to function and cannot be switched off:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Authentication cookies to keep you logged in</li>
                  <li>Security cookies to protect against fraud</li>
                  <li>Session cookies to maintain your preferences during your visit</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Analytics Cookies</h3>
                <p className="text-gray-300 mb-2">These cookies help us understand how our website is being used:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Google Analytics to track website usage</li>
                  <li>Performance monitoring to identify issues</li>
                  <li>User behavior analysis to improve our services</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Functionality Cookies</h3>
                <p className="text-gray-300 mb-2">These cookies enhance your experience on our website:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Language preferences</li>
                  <li>Theme settings (dark/light mode)</li>
                  <li>Recently uploaded files</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Third-Party Cookies</h2>
            <p className="text-gray-300 mb-4">We may also use third-party services that set their own cookies:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>
                <strong>Google Analytics:</strong> For website analytics and performance monitoring
              </li>
              <li>
                <strong>Stripe:</strong> For secure payment processing
              </li>
              <li>
                <strong>Intercom:</strong> For customer support chat functionality
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Managing Cookies</h2>
            <p className="text-gray-300 mb-4">You can control and manage cookies in several ways:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Use your browser settings to block or delete cookies</li>
              <li>Opt out of analytics cookies through our cookie banner</li>
              <li>Use browser extensions to manage cookie preferences</li>
              <li>Visit third-party websites to opt out of their tracking</li>
            </ul>
            <p className="text-gray-300 mt-4">
              Please note that disabling certain cookies may affect the functionality of our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Cookie Retention</h2>
            <p className="text-gray-300 mb-4">Different cookies have different retention periods:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>
                <strong>Session Cookies:</strong> Deleted when you close your browser
              </li>
              <li>
                <strong>Persistent Cookies:</strong> Remain for a set period (typically 1-2 years)
              </li>
              <li>
                <strong>Authentication Cookies:</strong> Expire after 30 days of inactivity
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Updates to This Policy</h2>
            <p className="text-gray-300">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page with an
              updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-gray-300">
              If you have any questions about our use of cookies, please contact us at{" "}
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
