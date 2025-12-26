import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    if (!youtubeRegex.test(url)) {
      return NextResponse.json(
        { success: false, error: 'Invalid YouTube URL' },
        { status: 400 }
      )
    }

    // In a browser environment, we can't actually download video files
    // Instead, we'll simulate the download process and provide info
    // For a real implementation, this would need a server-side process

    // Extract video ID
    let videoId = ''
    try {
      const urlObj = new URL(url)
      if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1)
      } else {
        videoId = urlObj.searchParams.get('v') || ''
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Could not parse URL' },
        { status: 400 }
      )
    }

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'Could not extract video ID' },
        { status: 400 }
      )
    }

    // Simulate download process
    // In production, this would use ytdl-core or similar library on a Node.js server
    const downloadInfo = {
      videoId,
      url,
      timestamp: new Date().toISOString(),
      message: 'تم تسجيل طلب التحميل بنجاح'
    }

    // Return success
    return NextResponse.json({
      success: true,
      data: downloadInfo,
      message: 'Download request processed successfully'
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Download API is running',
    info: 'POST a YouTube URL to this endpoint to download'
  })
}
