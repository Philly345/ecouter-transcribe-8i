"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, Loader2 } from "lucide-react"

export default function ProcessingFilesPage() {
  const { user } = useAuth()
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProcessingFiles()
    const interval = setInterval(fetchProcessingFiles, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [user])

  const fetchProcessingFiles = async () => {
    try {
      const response = await fetch(`/api/files?status=processing&userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      }
    } catch (error) {
      console.error("Error fetching processing files:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "Unknown size"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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
        <h1 className="text-2xl font-bold mb-2">Processing Files</h1>
        <p className="text-gray-400">Files currently being transcribed and analyzed</p>
      </div>

      {/* Processing Files */}
      <div className="grid gap-6">
        {files.map((file) => (
          <Card key={file.id} className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <FileText className="h-6 w-6 text-yellow-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1 truncate">{file.file_name || "Unknown File"}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Started {new Date(file.created_at).toLocaleTimeString()}
                      </div>
                      <span>{formatFileSize(file.file_size)}</span>
                    </div>
                  </div>
                </div>

                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Processing
                </Badge>
              </div>

              <div className="flex items-center space-x-2 text-yellow-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Transcribing audio and generating AI summary...</span>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                This usually takes 2-5 minutes per hour of audio. Please keep this page open.
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {files.length === 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No files processing</h3>
            <p className="text-gray-400">All your files have been processed or are waiting to be uploaded.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
