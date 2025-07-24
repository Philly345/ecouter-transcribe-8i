"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Download,
  Copy,
  Clock,
  Users,
  FileText,
  Sparkles,
  Calendar,
  BarChart3,
  Share2,
  Search,
} from "lucide-react"
import { Input } from "@/components/ui/input"

export default function TranscriptPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [file, setFile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<"transcript" | "summary" | "details">("transcript")
  const [copied, setCopied] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = searchParams.get("data")
    if (data && !file) {
      // Only process if we don't already have file data
      try {
        const fileData = JSON.parse(decodeURIComponent(data))
        setFile(fileData)
        setLoading(false)
      } catch (error) {
        console.error("Error parsing file data:", error)
        router.push("/dashboard")
      }
    } else if (!data && !loading) {
      // Only redirect if we're not loading and there's no data
      router.push("/dashboard")
    } else if (data && file) {
      // We have both data and file, just stop loading
      setLoading(false)
    }
  }, [searchParams, router, file, loading]) // Add file and loading to dependencies

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const downloadTranscript = () => {
    if (!file) return

    const content = `Transcript: ${file.transcript}\n\nSummary: ${file.summary}\n\nTopics: ${file.topics?.join(", ") || "N/A"}\n\nInsights: ${file.insights || "N/A"}`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${file.file_name}_transcript.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "Unknown size"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text

    const regex = new RegExp(`(${searchTerm})`, "gi")
    return text.replace(regex, '<mark class="bg-yellow-400 text-black">$1</mark>')
  }

  const filteredTimestamps =
    file?.timestamps?.filter(
      (timestamp: any) => !searchTerm || timestamp.text.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  if (loading || !file) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">File not found</h1>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()} className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold truncate">{file.file_name || "Unknown File"}</h1>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(file.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {file.duration ? formatTime(file.duration) : "Unknown"}
                  </div>
                  <span>{formatFileSize(file.file_size)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button size="sm" variant="ghost" onClick={downloadTranscript} className="text-gray-400 hover:text-white">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10">
          <div className="flex space-x-8">
            {[
              { id: "transcript", label: "Transcript", icon: FileText },
              { id: "summary", label: "AI Summary", icon: Sparkles },
              { id: "details", label: "Details", icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 px-4 py-3 text-xs font-medium transition-colors border-b-2
                  ${
                    activeTab === tab.id
                      ? "text-white border-white"
                      : "text-gray-400 hover:text-white border-transparent"
                  }
                `}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "transcript" && (
            <div className="space-y-6">
              {/* Search */}
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search in transcript..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Transcript Content */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Full Transcript</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(file.transcript || "")}
                      className="border-white/20 text-gray-400 hover:text-white"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copied ? "Copied!" : "Copy All"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Timestamps view if available */}
                  {file.timestamps && file.timestamps.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {(searchTerm ? filteredTimestamps : file.timestamps).map((timestamp: any, index: number) => (
                        <div
                          key={index}
                          className="flex space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <div className="flex-shrink-0 min-w-0">
                            <Badge variant="outline" className="text-xs mb-2">
                              {timestamp.speaker}
                            </Badge>
                            <p className="text-xs text-gray-400">
                              {formatTime(timestamp.start / 1000)} - {formatTime(timestamp.end / 1000)}
                            </p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-xs text-gray-300 leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: highlightSearchTerm(timestamp.text, searchTerm),
                              }}
                            />
                          </div>
                        </div>
                      ))}

                      {searchTerm && filteredTimestamps.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-400">No results found for "{searchTerm}"</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white/5 p-6 rounded-lg max-h-96 overflow-y-auto">
                      <p
                        className="text-gray-300 whitespace-pre-wrap leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: highlightSearchTerm(file.transcript || "No transcript available", searchTerm),
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "summary" && (
            <div className="space-y-6">
              {/* AI Summary */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-400">
                    <Sparkles className="h-5 w-5 mr-2" />
                    AI-Generated Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Summary</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(file.summary || "")}
                      className="border-white/20 text-gray-400 hover:text-white"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-sm">{file.summary || "No summary available"}</p>
                </CardContent>
              </Card>

              {/* Topics */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-blue-400">Key Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {file.topics && file.topics.length > 0 ? (
                      file.topics.map((topic: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-white/20 text-xs py-0.5 px-2">
                          {topic}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-400">No topics identified</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Insights */}
              {file.insights && (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-purple-400">Key Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed text-sm">{file.insights}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "details" && (
            <div className="space-y-6">
              {/* File Information */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle>File Information</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">File Name</p>
                    <p className="font-medium text-sm">{file.file_name || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">File Size</p>
                    <p className="font-medium text-sm">{formatFileSize(file.file_size)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Duration</p>
                    <p className="font-medium text-sm">{file.duration ? formatTime(file.duration) : "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Language</p>
                    <p className="font-medium text-sm">{file.language || "English"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Created</p>
                    <p className="font-medium text-sm">{new Date(file.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Status</p>
                    <Badge className="bg-green-500/20 text-green-400">
                      {file.status?.charAt(0).toUpperCase() + file.status?.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Transcription Details */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle>Transcription Details</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Confidence Score</p>
                    <p className="font-medium text-sm">
                      {file.confidence ? `${Math.round(file.confidence * 100)}%` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Word Count</p>
                    <p className="font-medium text-sm">{file.word_count || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Speakers Detected</p>
                    <p className="font-medium text-sm">{file.speakers?.length || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Processing Time</p>
                    <p className="font-medium text-sm">~2-5 minutes</p>
                  </div>
                </CardContent>
              </Card>

              {/* Speakers */}
              {file.speakers && file.speakers.length > 0 && (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Speakers Identified
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {file.speakers.map((speaker: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-white/20 text-xs py-0.5 px-2">
                          {speaker}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
