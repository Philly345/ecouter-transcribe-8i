"use client"
import { FileAudio, FileVideo, Download, Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileStatusBadge } from "./FileStatusBadge"
import { UploadedFile } from "../types"

export function FileItem({
  file,
  onRemove,
  onDownload,
  onView,
  onRetry
}: {
  file: UploadedFile
  onRemove: () => void
  onDownload: () => void
  onView: () => void
  onRetry: () => void
}) {
  const getFileIcon = () => {
    return file.file.type.startsWith("audio/") 
      ? <FileAudio className="h-8 w-8 text-blue-400" /> 
      : <FileVideo className="h-8 w-8 text-purple-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="p-4 bg-white/5 rounded-lg space-y-4">
      <div className="flex items-center space-x-4">
        {getFileIcon()}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{file.file.name}</p>
          <p className="text-sm text-gray-400">{formatFileSize(file.file.size)}</p>
          {file.status === "uploading" && <Progress value={file.progress} className="mt-2" />}
        </div>
        <div className="flex items-center space-x-2">
          <FileStatusBadge status={file.status} />
          <Button size="sm" variant="ghost" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Render different states */}
      {file.status === "error" && <ErrorState error={file.error} onRetry={onRetry} />}
      {file.status === "completed" && file.result && (
        <CompletedState result={file.result} onDownload={onDownload} onView={onView} />
      )}
      {file.status === "processing" && <ProcessingState />}
    </div>
  )
}

// Sub-components for different states
function ErrorState({ error, onRetry }: { error?: string, onRetry: () => void }) {
  return (
    <div className="border-t border-white/10 pt-4">
      {/* Error display and retry button */}
    </div>
  )
}

function CompletedState({ result, onDownload, onView }: { 
  result: any, 
  onDownload: () => void, 
  onView: () => void 
}) {
  return (
    <div className="space-y-4 border-t border-white/10 pt-4">
      {/* Results display */}
    </div>
  )
}

function ProcessingState() {
  return (
    <div className="border-t border-white/10 pt-4">
      {/* Processing indicator */}
    </div>
  )
}
