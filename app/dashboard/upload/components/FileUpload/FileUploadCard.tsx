"use client"
import { Upload } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function FileUploadCard({
  isDragActive,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  handleFileSelect,
  user
}: {
  isDragActive: boolean
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  user: any
}) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-8">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-white bg-white/5" : "border-white/20 hover:border-white/40 hover:bg-white/5"
          }`}
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
                <p className="text-xs text-yellow-400 mt-2">
                  ⚠️ Max file size: {user?.id === "demo_user" ? "15MB" : "50MB"}
                </p>
              </div>
            )}
          </label>
        </div>
      </CardContent>
    </Card>
  )
}
