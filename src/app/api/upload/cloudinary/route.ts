import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
/* eslint-disable */
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfp9qc0gu',
  api_key: process.env.CLOUDINARY_API_KEY || '256561399931126',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'IDsMlP2lOykGLgLWKGgrhxiy01w'
})

export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'raw'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Convert buffer to base64
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary with folder organization
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64String,
        {
          folder: `lms/${folder}`,
          resource_type: 'auto', // Auto-detect resource type (image, video, raw)
          public_id: `${Date.now()}_${file.name.replace(/\.[^/.]+$/, '')}`, // Remove extension
          overwrite: false,
          timestamp: Math.floor(Date.now() / 1000)
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
    })

    // Return the uploaded file details
    const uploadedResult = result as any
    return NextResponse.json({
      success: true,
      url: uploadedResult.secure_url,
      public_id: uploadedResult.public_id,
      resource_type: uploadedResult.resource_type,
      format: uploadedResult.format,
      bytes: uploadedResult.bytes,
      created_at: uploadedResult.created_at,
      folder: uploadedResult.folder
    })

  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Optional: Add DELETE endpoint for file cleanup
export async function DELETE(request: NextRequest) {
  try {
    const { public_id } = await request.json()

    if (!public_id) {
      return NextResponse.json(
        { error: 'No public_id provided' },
        { status: 400 }
      )
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(public_id, (error: any, result: unknown) => {
        if (error) reject(error)
        else resolve(result)
      })
    })

    return NextResponse.json({
      success: true,
      result
    })

  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}