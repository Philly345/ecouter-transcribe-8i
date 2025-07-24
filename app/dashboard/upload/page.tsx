"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  FileAudio,
  FileVideo,
  X,
  Settings,
  Clock,
  Info,
  CheckCircle,
  Loader2,
  Download,
  Eye,
  Sparkles,
  Globe,
  AlertCircle,
} from "lucide-react"
import { languages } from "@/lib/translation"

interface UploadedFile {
  file: File
  id: string
  progress: number
  status: "uploading" | "processing" | "completed" | "error"
  result?: any
  error?: string
}

export default function UploadPage() {
  const { user } = useAuth()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [language, setLanguage] = useState("en")
  const [quality, setQuality] = useState("standard")
  const [speakerIdentification, setSpeakerIdentification] = useState(true)
  const [includeTimestamps, setIncludeTimestamps] = useState(true)
  const [filterProfanity, setFilterProfanity] = useState(false)
  const [autoPunctuation, setAutoPunctuation] = useState(true)
  const [showFormats, setShowFormats] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processFiles(files)
  }, [])

  const processFiles = (files: File[]) => {
    // Check demo limitations
    if (user?.id === "demo_user" && uploadedFiles.length >= 3) {
      alert("Demo limit reached! You can only upload 3 files in demo mode. Contact us for unlimited access.")
      return
    }

    const acceptedFiles = files.filter((file) => {
      const isAudio = file.type.startsWith("audio/")
      const isVideo = file.type.startsWith("video/")
      const maxSize = user?.id === "demo_user" ? 100 * 1024 * 1024 : 500 * 1024 * 1024 // 100MB for demo, 500MB for full
      const isUnderLimit = file.size <= maxSize

      if (!isAudio && !isVideo) {
        alert(`${file.name} is not a supported audio or video file`)
        return false
      }

      if (!isUnderLimit) {
        alert(`${file.name} is too large. Maximum size is ${user?.id === "demo_user" ? "100MB" : "500MB"}`)
        return false
      }

      return true
    })

    // Additional demo check
    if (user?.id === "demo_user") {
      const remainingSlots = 3 - uploadedFiles.length
      if (acceptedFiles.length > remainingSlots) {
        alert(`Demo limit: You can only upload ${remainingSlots} more file(s).`)
        return
      }
    }

    if (acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        progress: 0,
        status: "uploading" as const,
      }))

      setUploadedFiles((prev) => [...prev, ...newFiles])

      // Start transcription for each file
      newFiles.forEach((uploadedFile) => {
        transcribeFile(uploadedFile)
      })
    }
  }

  const transcribeFile = async (uploadedFile: UploadedFile) => {
    try {
      // Update to processing
      setUploadedFiles((prev) =>
        prev.map((file) => (file.id === uploadedFile.id ? { ...file, status: "processing", progress: 100 } : file)),
      )

      const formData = new FormData()
      formData.append("file", uploadedFile.file)
      formData.append("language", language)
      formData.append("speakerLabels", speakerIdentification.toString())
      formData.append("punctuate", autoPunctuation.toString())
      formData.append("filterProfanity", filterProfanity.toString())

      console.log("Starting transcription with language:", language)

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      // Save to files database
      try {
        await fetch("/api/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...result,
            userId: user?.id,
            status: "completed",
          }),
        })
      } catch (dbError) {
        console.warn("Failed to save to database:", dbError)
        // Continue anyway - the transcription was successful
      }

      // Update file status
      setUploadedFiles((prev) =>
        prev.map((file) => (file.id === uploadedFile.id ? { ...file, status: "completed", result } : file)),
      )
    } catch (error) {
      console.error("Transcription error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

      setUploadedFiles((prev) =>
        prev.map((file) => (file.id === uploadedFile.id ? { ...file, status: "error", error: errorMessage } : file)),
      )
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const downloadTranscript = (file: UploadedFile) => {
    if (!file.result) return

    const content = `Transcript: ${file.result.transcript}

Summary: ${file.result.summary}

Topics: ${file.result.topics.join(", ")}

Insights: ${file.result.insights}`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${file.file.name}_transcript.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const viewFullTranscript = (file: UploadedFile) => {
    if (file.result) {
      // Navigate to transcript view page with file data
      const transcriptData = encodeURIComponent(JSON.stringify(file.result))
      window.location.href = `/dashboard/transcript?data=${transcriptData}`
    }
  }

  const retryTranscription = (file: UploadedFile) => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, status: "uploading", progress: 0, error: undefined } : f)),
    )
    transcribeFile(file)
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("audio/")) {
      return <FileAudio className="h-8 w-8 text-blue-400" />
    }
    return <FileVideo className="h-8 w-8 text-purple-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Upload & Transcribe</h1>
        <p className="text-gray-400">Upload your audio or video files for AI-powered transcription</p>
      </div>

      {user?.id === "demo_user" && (
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              <div>
                <p className="font-medium text-blue-400">Demo Mode Active</p>
                <p className="text-sm text-gray-400">
                  You can upload up to 3 files (max 100MB each) in demo mode. Files are not permanently saved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drag & Drop Zone */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                  ${isDragActive ? "border-white bg-white/5" : "border-white/20 hover:border-white/40 hover:bg-white/5"}
                `}
              >
                <input
                  type="file"
                  multiple
                  accept="audio/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />

                  {isDragActive ? (
                    <p className="text-base">Drop the files here...</p>
                  ) : (
                    <div>
                      <p className="text-base mb-2">
                        Drag & drop your files here, or <span className="text-white underline">browse</span>
                      </p>
                      <p className="text-sm text-gray-400">Supports MP3, MP4, WAV, M4A, FLAC, MOV, AVI, MKV, WMV</p>
                    </div>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Files & Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadedFiles.map((uploadedFile) => (
                  <div key={uploadedFile.id} className="p-4 bg-white/5 rounded-lg space-y-4">
                    <div className="flex items-center space-x-4">
                      {getFileIcon(uploadedFile.file)}

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{uploadedFile.file.name}</p>
                        <p className="text-sm text-gray-400">{formatFileSize(uploadedFile.file.size)}</p>

                        {uploadedFile.status === "uploading" && (
                          <Progress value={uploadedFile.progress} className="mt-2" />
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            uploadedFile.status === "completed"
                              ? "default"
                              : uploadedFile.status === "processing"
                                ? "secondary"
                                : uploadedFile.status === "error"
                                  ? "destructive"
                                  : "outline"
                          }
                        >
                          {uploadedFile.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {uploadedFile.status === "processing" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                          {uploadedFile.status === "error" && <AlertCircle className="h-3 w-3 mr-1" />}
                          {uploadedFile.status.charAt(0).toUpperCase() + uploadedFile.status.slice(1)}
                        </Badge>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(uploadedFile.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Error Message */}
                    {uploadedFile.status === "error" && uploadedFile.error && (
                      <div className="border-t border-white/10 pt-4">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-red-400">Transcription Failed</p>
                              <p className="text-sm text-gray-300 mt-1">{uploadedFile.error}</p>
                              <Button
                                size="sm"
                                onClick={() => retryTranscription(uploadedFile)}
                                className="mt-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
                              >
                                Retry
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Results */}
                    {uploadedFile.status === "completed" && uploadedFile.result && (
                      <div className="space-y-4 border-t border-white/10 pt-4">
                        {/* Summary */}
                        <div>
                          <h4 className="font-medium mb-2 text-green-400">AI Summary</h4>
                          <p className="text-sm text-gray-300 bg-white/5 p-3 rounded-lg">
                            {uploadedFile.result.summary}
                          </p>
                        </div>

                        {/* Topics */}
                        <div>
                          <h4 className="font-medium mb-2 text-blue-400">Topics</h4>
                          <div className="flex flex-wrap gap-2">
                            {uploadedFile.result.topics.map((topic: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Transcript Preview */}
                        <div>
                          <h4 className="font-medium mb-2 text-purple-400">Transcript Preview</h4>
                          <p className="text-sm text-gray-300 bg-white/5 p-3 rounded-lg">
                            {uploadedFile.result.transcript.substring(0, 200)}...
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => downloadTranscript(uploadedFile)}
                            className="bg-white/10 hover:bg-white/20"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 hover:bg-white/10 bg-transparent"
                            onClick={() => viewFullTranscript(uploadedFile)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Full
                          </Button>
                        </div>
                      </div>
                    )}

                    {uploadedFile.status === "processing" && (
                      <div className="border-t border-white/10 pt-4">
                        <div className="flex items-center space-x-2 text-yellow-400">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Transcribing audio and generating AI summary...</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          This may take several minutes depending on file length
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Transcription Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Language
                </label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/10 text-white max-h-60">
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.assemblyCode} className="hover:bg-white/10">
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400">Select the primary language spoken in your audio</p>
              </div>

              {/* Quality */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quality</label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Options */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Additional Options</label>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="speaker-id"
                      checked={speakerIdentification}
                      onCheckedChange={setSpeakerIdentification}
                    />
                    <label htmlFor="speaker-id" className="text-sm">
                      Speaker Identification
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="timestamps" checked={includeTimestamps} onCheckedChange={setIncludeTimestamps} />
                    <label htmlFor="timestamps" className="text-sm">
                      Include Timestamps
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="profanity" checked={filterProfanity} onCheckedChange={setFilterProfanity} />
                    <label htmlFor="profanity" className="text-sm">
                      Filter Profanity
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="punctuation" checked={autoPunctuation} onCheckedChange={setAutoPunctuation} />
                    <label htmlFor="punctuation" className="text-sm">
                      Auto-punctuation
                    </label>
                  </div>
                </div>
              </div>

              {/* Processing Time Estimate */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Clock className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-400">Processing Time</p>
                    <p className="text-xs text-gray-400">Typically 2–5 minutes per hour of audio</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supported Formats */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowFormats(!showFormats)}
              >
                <div className="flex items-center">
                  <Info className="mr-2 h-5 w-5" />
                  Supported Formats
                </div>
                <Button variant="ghost" size="sm">
                  {showFormats ? "Hide" : "Show"}
                </Button>
              </CardTitle>
            </CardHeader>

            {showFormats && (
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Audio Formats</h4>
                  <div className="flex flex-wrap gap-2">
                    {["MP3", "WAV", "M4A", "FLAC", "AAC"].map((format) => (
                      <Badge key={format} variant="outline" className="text-xs">
                        {format}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Video Formats</h4>
                  <div className="flex flex-wrap gap-2">
                    {["MP4", "MOV", "AVI", "MKV", "WMV"].map((format) => (
                      <Badge key={format} variant="outline" className="text-xs">
                        {format}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-400 space-y-1">
                  <p>• Max file size: {user?.id === "demo_user" ? "100MB" : "500MB"}</p>
                  <p>• Max duration: 4 hours</p>
                  <p>• Min sample rate: 16kHz</p>
                  <p>• Max speakers: 10</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-sm">Tips for Better Results</h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Use clear audio with minimal background noise</li>
                    <li>• Avoid overlapping speech</li>
                    <li>• Keep speakers close to microphone</li>
                    <li>• Record in a quiet environment</li>
                  </ul>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
