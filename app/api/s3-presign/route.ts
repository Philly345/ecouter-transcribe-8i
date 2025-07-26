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
  const { fileName, fileType } = await req.json()
  const Key = `uploads/${Date.now()}-${fileName}`
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key, ContentType: fileType }),
    { expiresIn: 600 }
  )
  return NextResponse.json({ uploadUrl: url, key: Key })
}
