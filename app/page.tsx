"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileAudio, FileVideo, X, CheckCircle, AlertCircle } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface UploadedFile {
  file: File
  id: string
  progress: number
  status: "uploading" | "completed" | "error"
  error?: string
  result?: any
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: "uploading" as const,
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // Start uploading each file
    newFiles.forEach(uploadFile)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac"],
      "video/*": [".mp4", ".mov", ".avi", ".mkv", ".webm"],
    },
    maxSize: 500 * 1024 * 1024, // 500MB limit
    multiple: true,
  })

  const uploadFile = async (uploadedFile: UploadedFile) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", uploadedFile.file)
      formData.append("fileId", uploadedFile.id)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Upload failed: ${response.status} ${response.statusText}. ${errorText}`)
      }

      // Check content type to ensure it's JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text()
        throw new Error(`Server returned non-JSON response: ${errorText}`)
      }

      const result = await response.json()

      setFiles((prev) =>
        prev.map((f) => (f.id === uploadedFile.id ? { ...f, status: "completed", progress: 100, result } : f)),
      )
    } catch (error) {
      console.error("Upload error:", error)
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f,
        ),
      )
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const retryUpload = (file: UploadedFile) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, status: "uploading", progress: 0, error: undefined } : f)),
    )
    uploadFile(file)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Upload Audio & Video Files</h1>
          <p className="text-gray-400">Upload your audio or video files for AI-powered transcription</p>
        </div>

        {/* Upload Area */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-blue-400 bg-blue-400/10" : "border-white/20 hover:border-white/40"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              {isDragActive ? (
                <p className="text-lg">Drop the files here...</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg">Drag & drop files here, or click to select</p>
                  <p className="text-sm text-gray-400">Supports MP3, WAV, MP4, MOV and more (max 500MB per file)</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* File List */}
        {files.length > 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Uploaded Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {files.map((uploadedFile) => (
                <div key={uploadedFile.id} className="border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {uploadedFile.file.type.startsWith("audio/") ? (
                        <FileAudio className="h-5 w-5 text-blue-400" />
                      ) : (
                        <FileVideo className="h-5 w-5 text-purple-400" />
                      )}
                      <div>
                        <p className="font-medium truncate max-w-xs">{uploadedFile.file.name}</p>
                        <p className="text-sm text-gray-400">{formatFileSize(uploadedFile.file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {uploadedFile.status === "completed" && <CheckCircle className="h-5 w-5 text-green-400" />}
                      {uploadedFile.status === "error" && <AlertCircle className="h-5 w-5 text-red-400" />}
                      <Button variant="ghost" size="sm" onClick={() => removeFile(uploadedFile.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {uploadedFile.status === "uploading" && <Progress value={uploadedFile.progress} className="mb-2" />}

                  {uploadedFile.status === "error" && (
                    <div className="space-y-2">
                      <Alert className="border-red-500/20 bg-red-500/10">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-400">{uploadedFile.error}</AlertDescription>
                      </Alert>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => retryUpload(uploadedFile)}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Retry Upload
                      </Button>
                    </div>
                  )}

                  {uploadedFile.status === "completed" && uploadedFile.result && (
                    <Alert className="border-green-500/20 bg-green-500/10">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="text-green-400">
                        Upload completed successfully! Processing will begin shortly.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}



