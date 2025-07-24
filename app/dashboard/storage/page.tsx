"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { HardDrive, Trash2, Download, FileText, Calendar } from "lucide-react"

export default function StoragePage() {
  const { user } = useAuth()
  const [files, setFiles] = useState<any[]>([])
  const [storageUsed, setStorageUsed] = useState(0)
  const [loading, setLoading] = useState(true)

  const STORAGE_LIMIT = 1024 * 1024 * 1024 // 1GB in bytes

  useEffect(() => {
    fetchStorageData()
  }, [user])

  const fetchStorageData = async () => {
    try {
      const response = await fetch(`/api/files?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data)

        // Calculate total storage used
        const totalSize = data.reduce((sum: number, file: any) => sum + (file.file_size || 0), 0)
        setStorageUsed(totalSize)
      }
    } catch (error) {
      console.error("Error fetching storage data:", error)
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
        fetchStorageData() // Refresh data
      }
    } catch (error) {
      console.error("Error deleting file:", error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const storagePercentage = (storageUsed / STORAGE_LIMIT) * 100

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="h-32 bg-white/10 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Storage Management</h1>
        <p className="text-gray-400">Monitor and manage your file storage usage</p>
      </div>

      {/* Storage Overview */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <HardDrive className="mr-2 h-5 w-5" />
            Storage Usage
          </CardTitle>
          <CardDescription>
            You're using {formatFileSize(storageUsed)} of your {formatFileSize(STORAGE_LIMIT)} storage limit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={storagePercentage} className="mb-4" />
          <div className="flex justify-between text-sm text-gray-400">
            <span>{formatFileSize(storageUsed)} used</span>
            <span>{formatFileSize(STORAGE_LIMIT - storageUsed)} remaining</span>
          </div>

          {storagePercentage > 80 && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-400">
                ⚠️ You're running low on storage space. Consider deleting old files or upgrading your plan.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Breakdown */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-blue-400" />
            <p className="text-xl font-bold">{files.length}</p>
            <p className="text-sm text-gray-400">Total Files</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6 text-center">
            <HardDrive className="h-8 w-8 mx-auto mb-2 text-green-400" />
            <p className="text-xl font-bold">{formatFileSize(storageUsed)}</p>
            <p className="text-sm text-gray-400">Used Space</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6 text-center">
            <div className="h-8 w-8 mx-auto mb-2 bg-purple-400 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">{Math.round(storagePercentage)}%</span>
            </div>
            <p className="text-xl font-bold">{Math.round(storagePercentage)}%</p>
            <p className="text-sm text-gray-400">Storage Used</p>
          </CardContent>
        </Card>
      </div>

      {/* File List */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Your Files</CardTitle>
          <CardDescription>Manage individual files to free up storage space</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-4">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium truncate">{file.file_name || "Unknown File"}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(file.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-400">{formatFileSize(file.file_size)}</span>

                  <div className="flex space-x-2">
                    {file.status === "completed" && (
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-red-400"
                      onClick={() => deleteFile(file.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {files.length === 0 && (
            <div className="text-center py-8">
              <HardDrive className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-base font-semibold mb-2">No files stored</h3>
              <p className="text-gray-400">Upload some files to see your storage usage</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
