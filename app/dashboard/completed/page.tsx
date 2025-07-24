"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Eye, CheckCircle, Calendar, Clock } from "lucide-react"

export default function CompletedFilesPage() {
  const { user } = useAuth()
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompletedFiles()
  }, [user])

  const fetchCompletedFiles = async () => {
    try {
      const response = await fetch(`/api/files?status=completed&userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      }
    } catch (error) {
      console.error("Error fetching completed files:", error)
    } finally {
      setLoading(false)
    }
  }

  const downloadTranscript = (file: any) => {
    const content = `Transcript: ${file.transcript}\n\nSummary: ${file.summary}\n\nTopics: ${file.topics?.join(", ") || "N/A"}`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${file.file_name}_transcript.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "Unknown size"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const viewFullTranscript = (file: any) => {
    const transcriptData = encodeURIComponent(JSON.stringify(file))
    window.location.href = `/dashboard/transcript?data=${transcriptData}`
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Completed Files</h1>
        <p className="text-gray-400">Successfully transcribed files ready for download</p>
      </div>

      {/* Completed Files */}
      <div className="grid gap-6">
        {files.map((file) => (
          <Card key={file.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <FileText className="h-6 w-6 text-green-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1 truncate">{file.file_name || "Unknown File"}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {file.duration
                          ? `${Math.floor(file.duration / 60)}:${(file.duration % 60).toString().padStart(2, "0")}`
                          : "Unknown"}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(file.created_at).toLocaleDateString()}
                      </div>
                      <span>{formatFileSize(file.file_size)}</span>
                    </div>
                  </div>
                </div>

                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              </div>

              {/* File Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Confidence</p>
                  <p className="font-medium">{file.confidence ? `${Math.round(file.confidence * 100)}%` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Speakers</p>
                  <p className="font-medium">{file.speakers?.length || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Word Count</p>
                  <p className="font-medium">{file.word_count || "N/A"}</p>
                </div>
              </div>

              {/* Topics */}
              {file.topics && file.topics.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {file.topics.map((topic: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs border-white/20">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              {file.summary && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">AI Summary</p>
                  <p className="text-sm text-gray-300 bg-white/5 p-3 rounded-lg">{file.summary}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-4 border-t border-white/10">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  onClick={() => viewFullTranscript(file)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Full
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  onClick={() => downloadTranscript(file)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {files.length === 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No completed files</h3>
            <p className="text-gray-400">Your completed transcriptions will appear here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
