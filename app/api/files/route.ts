import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, use a real database
let mockFiles: any[] = []

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const userId = searchParams.get("userId")

  let filteredFiles = mockFiles

  if (status && status !== "all") {
    filteredFiles = filteredFiles.filter((file) => file.status === status)
  }

  if (userId) {
    filteredFiles = filteredFiles.filter((file) => file.userId === userId)
  }

  return NextResponse.json(filteredFiles)
}

export async function POST(request: NextRequest) {
  try {
    const fileData = await request.json()
    const newFile = {
      ...fileData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    }

    mockFiles.push(newFile)
    return NextResponse.json(newFile)
  } catch (error) {
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get("id")

  if (fileId) {
    mockFiles = mockFiles.filter((file) => file.id !== fileId)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "File ID required" }, { status: 400 })
}
