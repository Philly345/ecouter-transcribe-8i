"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Search, Download, Eye, Trash2, Filter, Calendar, Clock } from "lucide-react"

export default function RecentFilesPage() {
  const { user } = useAuth()
  const [files, setFiles] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFiles()
  }, [user])

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/files?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      }
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files?id=${fileId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setFiles(files.filter((file) => file.id !== fileId))
      }
    } catch (error) {
      console.error("Error deleting file:", error)
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

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.file_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || file.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "processing":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
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
        <h1 className="text-2xl font-bold mb-2">Recent Files</h1>
        <p className="text-gray-400">Manage and access your transcribed files</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
          />
        </div>

        <div className="flex gap-2">
          {["all", "completed", "processing", "error"].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className={
                filterStatus === status ? "bg-white text-black" : "border-white/20 text-gray-400 hover:text-white"
              }
            >
              <Filter className="mr-2 h-4 w-4" />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid gap-6">
        {filteredFiles.map((file) => (
          <Card key={file.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <FileText className="h-6 w-6" />
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

                <Badge className={getStatusColor(file.status)}>
                  {file.status?.charAt(0).toUpperCase() + file.status?.slice(1)}
                </Badge>
              </div>

              {/* File Details */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Confidence</p>
                  <p className="font-medium">{file.confidence ? `${Math.round(file.confidence * 100)}%` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Speakers</p>
                  <p className="font-medium">{file.speakers?.length || "N/A"}</p>
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
                  <p className="text-sm text-gray-300 bg-white/5 p-3 rounded-lg">
                    {file.summary.length > 150 ? `${file.summary.substring(0, 150)}...` : file.summary}
                  </p>
                </div>
              )}

              {/* Transcript Preview */}
              {file.transcript && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Transcript Preview</p>
                  <p className="text-sm text-gray-300 bg-white/5 p-3 rounded-lg">
                    {file.transcript.substring(0, 150)}...
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex space-x-2">
                  {file.status === "completed" && (
                    <>
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
                    </>
                  )}

                  {file.status === "processing" && (
                    <Button size="sm" variant="ghost" disabled className="text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      Processing...
                    </Button>
                  )}

                  {file.status === "error" && (
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                      <Eye className="h-4 w-4 mr-2" />
                      View Error
                    </Button>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-red-400"
                  onClick={() => deleteFile(file.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-base font-semibold mb-2">No files found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Upload your first file to get started"}
            </p>
            <Button className="glow-button bg-white text-black hover:bg-gray-200">Upload File</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
