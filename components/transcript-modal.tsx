"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Download, Copy, Clock, Users, FileText, Sparkles, Calendar, BarChart3 } from "lucide-react"

interface TranscriptModalProps {
  file: any
  isOpen: boolean
  onClose: () => void
}

export function TranscriptModal({ file, isOpen, onClose }: TranscriptModalProps) {
  const [activeTab, setActiveTab] = useState<"transcript" | "summary" | "details">("transcript")
  const [copied, setCopied] = useState(false)

  if (!isOpen || !file) return null

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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black/95 border border-white/10 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold truncate">{file.file_name || "Unknown File"}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
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

          <div className="flex items-center space-x-2">
            <Button size="sm" variant="ghost" onClick={downloadTranscript} className="text-gray-400 hover:text-white">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {[
            { id: "transcript", label: "Transcript", icon: FileText },
            { id: "summary", label: "AI Summary", icon: Sparkles },
            { id: "details", label: "Details", icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors
                ${activeTab === tab.id ? "text-white border-b-2 border-white" : "text-gray-400 hover:text-white"}
              `}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "transcript" && (
            <div className="h-full p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Full Transcript</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(file.transcript || "")}
                  className="border-white/20 text-gray-400 hover:text-white"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>

              {/* Timestamps view if available */}
              {file.timestamps && file.timestamps.length > 0 ? (
                <div className="space-y-4">
                  {file.timestamps.map((timestamp: any, index: number) => (
                    <div key={index} className="flex space-x-4 p-4 bg-white/5 rounded-lg">
                      <div className="flex-shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {timestamp.speaker}
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(timestamp.start / 1000)} - {formatTime(timestamp.end / 1000)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-300 flex-1">{timestamp.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 p-6 rounded-lg">
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {file.transcript || "No transcript available"}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "summary" && (
            <div className="h-full p-6 overflow-y-auto space-y-6">
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
                  <p className="text-gray-300 leading-relaxed">{file.summary || "No summary available"}</p>
                </CardContent>
              </Card>

              {/* Topics */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-blue-400">Key Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {file.topics && file.topics.length > 0 ? (
                      file.topics.map((topic: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-white/20">
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
                    <p className="text-gray-300 leading-relaxed">{file.insights}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "details" && (
            <div className="h-full p-6 overflow-y-auto space-y-6">
              {/* File Information */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle>File Information</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">File Name</p>
                    <p className="font-medium">{file.file_name || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">File Size</p>
                    <p className="font-medium">{formatFileSize(file.file_size)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Duration</p>
                    <p className="font-medium">{file.duration ? formatTime(file.duration) : "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Language</p>
                    <p className="font-medium">{file.language || "English"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Created</p>
                    <p className="font-medium">{new Date(file.created_at).toLocaleString()}</p>
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
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Confidence Score</p>
                    <p className="font-medium">{file.confidence ? `${Math.round(file.confidence * 100)}%` : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Word Count</p>
                    <p className="font-medium">{file.word_count || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Speakers Detected</p>
                    <p className="font-medium">{file.speakers?.length || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Processing Time</p>
                    <p className="font-medium">~2-5 minutes</p>
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
                    <div className="flex flex-wrap gap-2">
                      {file.speakers.map((speaker: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-white/20">
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
