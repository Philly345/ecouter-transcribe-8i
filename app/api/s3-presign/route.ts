import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { fileName, fileType } = await req.json()
    
    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'Both fileName and fileType are required' },
        { status: 400 }
      )
    }

    // Create a unique key with timestamp and sanitized filename
    const Key = `uploads/${Date.now()}-${fileName
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_\-.]/g, '')}`
    
    const command = new PutObjectCommand({ 
      Bucket: process.env.R2_BUCKET_NAME, 
      Key, 
      ContentType: fileType,
      // Optional: Add metadata if needed
      // Metadata: {
      //   uploadedBy: 'your-app-name',
      //   originalName: fileName
      // }
    })

    const url = await getSignedUrl(s3, command, { 
      expiresIn: 600 // URL expires in 10 minutes
    })

    return NextResponse.json({ 
      uploadUrl: url, 
      key: Key,
      publicUrl: `https://${process.env.R2_PUBLIC_URL}/${Key}`
    })

  } catch (error) {
    console.error("Error creating presigned URL:", error)
    return NextResponse.json(
      { error: 'Failed to create upload URL' }, 
      { status: 500 }
    )
  }
}
