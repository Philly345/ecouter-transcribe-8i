"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"

export default function StatusPage() {
  const services = [
    { name: "Transcription API", status: "operational", uptime: "99.9%" },
    { name: "File Upload", status: "operational", uptime: "99.8%" },
    { name: "User Authentication", status: "operational", uptime: "100%" },
    { name: "Dashboard", status: "operational", uptime: "99.9%" },
    { name: "Payment Processing", status: "operational", uptime: "99.7%" },
    { name: "Email Notifications", status: "degraded", uptime: "98.2%" },
  ]

  const incidents = [
    {
      date: "Jan 20, 2024",
      title: "Email delivery delays",
      status: "investigating",
      description: "We're experiencing delays in email notifications. Transcription services are not affected.",
    },
    {
      date: "Jan 18, 2024",
      title: "Scheduled maintenance completed",
      status: "resolved",
      description: "Scheduled maintenance for our transcription servers has been completed successfully.",
    },
    {
      date: "Jan 15, 2024",
      title: "Brief API slowdown",
      status: "resolved",
      description: "API response times were slower than usual for approximately 15 minutes. Issue has been resolved.",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "outage":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "investigating":
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      operational: "bg-green-500/20 text-green-400 border-green-500/30",
      degraded: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      outage: "bg-red-500/20 text-red-400 border-red-500/30",
      investigating: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      resolved: "bg-green-500/20 text-green-400 border-green-500/30",
    }

    return <Badge className={`${variants[status as keyof typeof variants]} capitalize`}>{status}</Badge>
  }

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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 gradient-logo">System Status</h1>
          <p className="text-xl text-gray-300">Current status of TranscribeAI services and infrastructure</p>
        </div>

        {/* Overall Status */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Overall Status</CardTitle>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-green-400 font-semibold">All Systems Operational</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              All core services are running normally. We're currently investigating minor email delivery delays.
            </p>
          </CardContent>
        </Card>

        {/* Services Status */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Service Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(service.status)}
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400">{service.uptime} uptime</span>
                    {getStatusBadge(service.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-xl">Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {incidents.map((incident, index) => (
                <div key={index} className="border-l-2 border-white/20 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{incident.title}</h3>
                    {getStatusBadge(incident.status)}
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{incident.date}</p>
                  <p className="text-gray-300">{incident.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subscribe to Updates */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-300 mb-6">Subscribe to get notified about service updates and incidents</p>
          <Button className="glow-button bg-white text-black hover:bg-gray-200">Subscribe to Updates</Button>
        </div>
      </div>
    </div>
  )
}
