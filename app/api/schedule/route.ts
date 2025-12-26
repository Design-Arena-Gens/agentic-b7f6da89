import { NextRequest, NextResponse } from 'next/server'

// Global state for schedule (in production, use Redis or database)
let scheduleState = {
  active: false,
  url: '',
  lastRun: null as Date | null,
  interval: null as NodeJS.Timeout | null,
  runCount: 0
}

async function downloadVideo(url: string) {
  try {
    // In production, this would call the actual download logic
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })

    const data = await response.json()
    scheduleState.lastRun = new Date()
    scheduleState.runCount++

    console.log(`Scheduled download completed at ${scheduleState.lastRun}:`, data)
    return data
  } catch (error) {
    console.error('Scheduled download error:', error)
    return { success: false, error: 'Download failed' }
  }
}

export async function GET() {
  return NextResponse.json({
    active: scheduleState.active,
    url: scheduleState.url,
    lastRun: scheduleState.lastRun,
    runCount: scheduleState.runCount,
    interval: '5 minutes'
  })
}

export async function POST(request: NextRequest) {
  try {
    const { action, url } = await request.json()

    if (action === 'start') {
      if (!url) {
        return NextResponse.json(
          { success: false, error: 'URL is required to start schedule' },
          { status: 400 }
        )
      }

      // Stop existing schedule if any
      if (scheduleState.interval) {
        clearInterval(scheduleState.interval)
      }

      // Update state
      scheduleState.active = true
      scheduleState.url = url
      scheduleState.runCount = 0

      // Run immediately first time
      await downloadVideo(url)

      // Set up interval for every 5 minutes (300000 ms)
      scheduleState.interval = setInterval(async () => {
        if (scheduleState.active && scheduleState.url) {
          await downloadVideo(scheduleState.url)
        }
      }, 5 * 60 * 1000) // 5 minutes

      return NextResponse.json({
        success: true,
        message: 'Schedule started successfully',
        url: scheduleState.url,
        interval: '5 minutes'
      })

    } else if (action === 'stop') {
      if (scheduleState.interval) {
        clearInterval(scheduleState.interval)
        scheduleState.interval = null
      }

      scheduleState.active = false

      return NextResponse.json({
        success: true,
        message: 'Schedule stopped successfully',
        totalRuns: scheduleState.runCount
      })

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "start" or "stop"' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Schedule error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
