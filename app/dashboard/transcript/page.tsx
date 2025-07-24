"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Download,
  Copy,
  Clock,
  Users,
  FileText,
  Sparkles,
  ArrowLeft,
  Languages,
  Loader2,
  CheckCircle,
} from "lucide-react"
import { languages, translateText, getLanguageName } from "@/lib/translation"

interface TranscriptData {
  id: string
  transcript: string
  summary: string
  topics: string[]
  insights: string
  speakers: string[]
  timestamps: Array<{
    speaker: string
    start: number
    end: number
    text: string
  }>
  confidence: number
  duration: number
  word_count: number
  language: string
  created_at: string
  file_name: string
  file_size: number
}

export default function TranscriptPage() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<TranscriptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [highlightedText, setHighlightedText] = useState("")
  const [translatedContent, setTranslatedContent] = useState<{
    transcript?: string
    summary?: string
    insights?: string
  }>({})
  const [targetLanguage, setTargetLanguage] = useState("en")
  const [isTranslating, setIsTranslating] = useState(false)

  useEffect(() => {
    const dataParam = searchParams.get("data")
    if (dataParam) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(dataParam))
        setData(parsedData)
        setTargetLanguage(parsedData.language || "en")
      } catch (err) {
        console.error("Failed to parse transcript data:", err)
        setError("Invalid transcript data")
      }
    } else {
      setError("No transcript data provided")
    }
    setLoading(false)
  }, [searchParams])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text
    const regex = new RegExp(`(${term})`, "gi")
    return text.replace(regex, "<mark class='bg-yellow-400 text-black'>$1</mark>")
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  const downloadTranscript = (format = "txt") => {
    if (!data) return

    let content = ""
    let filename = ""
    let mimeType = ""

    const currentTranscript = translatedContent.transcript || data.transcript
    const currentSummary = translatedContent.summary || data.summary
    const currentInsights = translatedContent.insights || data.insights

    switch (format) {
      case "txt":
        content = `${data.file_name} - Transcript
Generated: ${new Date(data.created_at).toLocaleString()}
Language: ${getLanguageName(data.language)}
Duration: ${formatTime(data.duration)}
Confidence: ${(data.confidence * 100).toFixed(1)}%

SUMMARY:
${currentSummary}

TOPICS:
${data.topics.join(", ")}

INSIGHTS:
${currentInsights}

TRANSCRIPT:
${currentTranscript}`
        filename = `${data.file_name}_transcript${targetLanguage !== data.language ? `_${targetLanguage}` : ""}.txt`
        mimeType = "text/plain"
        break

      case "srt":
        content = data.timestamps
          .map((item, index) => {
            const startTime = new Date(item.start * 1000).toISOString().substr(11, 12).replace(".", ",")
            const endTime = new Date(item.end * 1000).toISOString().substr(11, 12).replace(".", ",")
            return `${index + 1}\n${startTime} --> ${endTime}\n${item.text}\n`
          })
          .join("\n")
        filename = `${data.file_name}_subtitles${targetLanguage !== data.language ? `_${targetLanguage}` : ""}.srt`
        mimeType = "text/plain"
        break

      case "json":
        content = JSON.stringify(
          {
            ...data,
            translatedContent: translatedContent,
            targetLanguage: targetLanguage,
          },
          null,
          2,
        )
        filename = `${data.file_name}_data${targetLanguage !== data.language ? `_${targetLanguage}` : ""}.json`
        mimeType = "application/json"
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleTranslate = async (field: "transcript" | "summary" | "insights") => {
    if (!data || targetLanguage === data.language) return

    setIsTranslating(true)
    try {
      let textToTranslate = ""
      switch (field) {
        case "transcript":
          textToTranslate = data.transcript
          break
        case "summary":
          textToTranslate = data.summary
          break
        case "insights":
          textToTranslate = data.insights
          break
      }

      const translatedText = await translateText(textToTranslate, targetLanguage, data.language)
      setTranslatedContent((prev) => ({
        ...prev,
        [field]: translatedText,
      }))
    } catch (error) {
      console.error("Translation failed:", error)
      // You could add error handling/toast here
    } finally {
      setIsTranslating(false)
    }
  }

  const handleTranslateAll = async () => {
    if (!data || targetLanguage === data.language) return

    setIsTranslating(true)
    try {
      const [translatedTranscript, translatedSummary, translatedInsights] = await Promise.all([
        translateText(data.transcript, targetLanguage, data.language),
        translateText(data.summary, targetLanguage, data.language),
        translateText(data.insights, targetLanguage, data.language),
      ])

      setTranslatedContent({
        transcript: translatedTranscript,
        summary: translatedSummary,
        insights: translatedInsights,
      })
    } catch (error) {
      console.error("Translation failed:", error)
    } finally {
      setIsTranslating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center">
            <p className="text-red-400 mb-4">{error || "No transcript data found"}</p>
            <Button onClick={() => window.history.back()} className="bg-white text-black hover:bg-gray-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => window.history.back()} className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{data.file_name}</h1>
            <p className="text-gray-400">Generated on {new Date(data.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <div className="flex items-center space-x-2">
            <Languages className="h-4 w-4 text-gray-400" />
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/10 text-white max-h-60">
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} className="hover:bg-white/10">
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Translate All Button */}
          {targetLanguage !== data.language && (
            <Button onClick={handleTranslateAll} disabled={isTranslating} className="bg-blue-600 hover:bg-blue-700">
              {isTranslating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Languages className="h-4 w-4 mr-2" />
              )}
              Translate All
            </Button>
          )}

          {/* Download Menu */}
          <Select onValueChange={downloadTranscript}>
            <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
              <Download className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Download" />
            </SelectTrigger>
            <SelectContent className="bg-black border-white/10 text-white">
              <SelectItem value="txt">Text (.txt)</SelectItem>
              <SelectItem value="srt">Subtitles (.srt)</SelectItem>
              <SelectItem value="json">Data (.json)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Duration</p>
                <p className="font-semibold">{formatTime(data.duration)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Speakers</p>
                <p className="font-semibold">{data.speakers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Words</p>
                <p className="font-semibold">{data.word_count.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Confidence</p>
                <p className="font-semibold">{(data.confidence * 100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="transcript" className="space-y-6">
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger value="transcript">Full Transcript</TabsTrigger>
          <TabsTrigger value="summary">AI Summary</TabsTrigger>
          <TabsTrigger value="timestamps">Timestamps</TabsTrigger>
          <TabsTrigger value="details">File Details</TabsTrigger>
        </TabsList>

        <TabsContent value="transcript" className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transcript</CardTitle>
                <div className="flex items-center space-x-2">
                  {targetLanguage !== data.language && !translatedContent.transcript && (
                    <Button
                      size="sm"
                      onClick={() => handleTranslate("transcript")}
                      disabled={isTranslating}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isTranslating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Languages className="h-4 w-4 mr-2" />
                      )}
                      Translate
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(translatedContent.transcript || data.transcript)}
                    className="border-white/20 hover:bg-white/10"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Search transcript..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm bg-white/5 border-white/10"
                />
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              {translatedContent.transcript && (
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-blue-400">Translated to {getLanguageName(targetLanguage)}</span>
                  </div>
                </div>
              )}
              <div
                className="prose prose-invert max-w-none text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: highlightSearchTerm(translatedContent.transcript || data.transcript, searchTerm),
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-400">AI Summary</CardTitle>
                  <div className="flex items-center space-x-2">
                    {targetLanguage !== data.language && !translatedContent.summary && (
                      <Button
                        size="sm"
                        onClick={() => handleTranslate("summary")}
                        disabled={isTranslating}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isTranslating ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Languages className="h-4 w-4 mr-2" />
                        )}
                        Translate
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(translatedContent.summary || data.summary)}
                      className="border-white/20 hover:bg-white/10"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {translatedContent.summary && (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-blue-400">Translated to {getLanguageName(targetLanguage)}</span>
                    </div>
                  </div>
                )}
                <p className="text-gray-300 leading-relaxed">{translatedContent.summary || data.summary}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-purple-400">Key Insights</CardTitle>
                  <div className="flex items-center space-x-2">
                    {targetLanguage !== data.language && !translatedContent.insights && (
                      <Button
                        size="sm"
                        onClick={() => handleTranslate("insights")}
                        disabled={isTranslating}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isTranslating ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Languages className="h-4 w-4 mr-2" />
                        )}
                        Translate
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(translatedContent.insights || data.insights)}
                      className="border-white/20 hover:bg-white/10"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {translatedContent.insights && (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-blue-400">Translated to {getLanguageName(targetLanguage)}</span>
                    </div>
                  </div>
                )}
                <p className="text-gray-300 leading-relaxed">{translatedContent.insights || data.insights}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-blue-400">Topics Discussed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.topics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timestamps" className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Speaker Timeline</CardTitle>
              <p className="text-gray-400">Detailed breakdown with timestamps and speaker identification</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {data.timestamps.map((item, index) => (
                  <div key={index} className="flex space-x-4 p-3 bg-white/5 rounded-lg">
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {item.speaker}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(item.start)} - {formatTime(item.end)}
                      </p>
                    </div>
                    <p className="text-gray-300 flex-1">{item.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>File Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">File Name</p>
                    <p className="font-medium">{data.file_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">File Size</p>
                    <p className="font-medium">{formatFileSize(data.file_size)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="font-medium">{formatTime(data.duration)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Language</p>
                    <p className="font-medium">{getLanguageName(data.language)}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Transcription ID</p>
                    <p className="font-medium font-mono text-sm">{data.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Confidence Score</p>
                    <p className="font-medium">{(data.confidence * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Word Count</p>
                    <p className="font-medium">{data.word_count.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Speakers Detected</p>
                    <p className="font-medium">{data.speakers.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
