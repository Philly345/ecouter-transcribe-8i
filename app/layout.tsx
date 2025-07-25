import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ecouter Transcribe – Smart AI-Powered Transcription",
  description:
    "Transcribe audio instantly with speaker labels, smart summaries, and full verbatim. Try the best AI transcription tool.",
  metadataBase: new URL("https://ecoutertranscribe.tech"),
  alternates: {
    canonical: "https://ecoutertranscribe.tech",
  },
  openGraph: {
    title: "Ecouter Transcribe – Smart AI-Powered Transcription",
    description:
      "Transcribe audio instantly with speaker labels, smart summaries, and full verbatim. Try the best AI transcription tool.",
    url: "https://ecoutertranscribe.tech",
    siteName: "Ecouter Transcribe",
    images: [
      {
        url: "https://ecoutertranscribe.tech/og-image.jpg", // 🔁 Upload this to your /public folder
        width: 1200,
        height: 630,
        alt: "Ecouter Transcribe App Screenshot",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ecouter Transcribe – Smart AI-Powered Transcription",
    description:
      "Transcribe audio instantly with speaker labels, smart summaries, and full verbatim. Try the best AI transcription tool.",
    images: ["https://ecoutertranscribe.tech/og-image.jpg"],
    creator: "@yourtwitterhandle", // Replace if applicable
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EHQJ4EMKC5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EHQJ4EMKC5');
          `}
        </Script>

        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

