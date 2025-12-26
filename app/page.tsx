'use client'

import { useState, useEffect } from 'react'

interface Download {
  url: string
  timestamp: string
  status: string
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('')
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error' | 'warning'>('info')
  const [loading, setLoading] = useState(false)
  const [scheduleActive, setScheduleActive] = useState(false)
  const [downloads, setDownloads] = useState<Download[]>([])

  useEffect(() => {
    checkScheduleStatus()
    loadDownloads()
  }, [])

  const checkScheduleStatus = async () => {
    try {
      const res = await fetch('/api/schedule')
      const data = await res.json()
      setScheduleActive(data.active || false)
    } catch (error) {
      console.error('Error checking schedule:', error)
    }
  }

  const loadDownloads = () => {
    const saved = localStorage.getItem('downloads')
    if (saved) {
      setDownloads(JSON.parse(saved))
    }
  }

  const saveDownload = (url: string, status: string) => {
    const newDownload: Download = {
      url,
      timestamp: new Date().toLocaleString('ar-EG'),
      status
    }
    const updated = [newDownload, ...downloads].slice(0, 10)
    setDownloads(updated)
    localStorage.setItem('downloads', JSON.stringify(updated))
  }

  const handleDownload = async () => {
    if (!url) {
      setStatus('الرجاء إدخال رابط فيديو يوتيوب')
      setStatusType('warning')
      return
    }

    setLoading(true)
    setStatus('جاري تحميل الفيديو...')
    setStatusType('info')

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      const data = await res.json()

      if (data.success) {
        setStatus('تم تحميل الفيديو بنجاح! ✓')
        setStatusType('success')
        saveDownload(url, 'نجح')
        setUrl('')
      } else {
        setStatus(`فشل التحميل: ${data.error}`)
        setStatusType('error')
        saveDownload(url, 'فشل')
      }
    } catch (error) {
      setStatus('حدث خطأ أثناء التحميل')
      setStatusType('error')
      saveDownload(url, 'خطأ')
    } finally {
      setLoading(false)
    }
  }

  const handleStartSchedule = async () => {
    if (!url) {
      setStatus('الرجاء إدخال رابط فيديو يوتيوب للتحميل التلقائي')
      setStatusType('warning')
      return
    }

    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, action: 'start' })
      })

      const data = await res.json()

      if (data.success) {
        setScheduleActive(true)
        setStatus('تم تفعيل التحميل التلقائي كل 5 دقائق')
        setStatusType('success')
      } else {
        setStatus(`فشل تفعيل الجدولة: ${data.error}`)
        setStatusType('error')
      }
    } catch (error) {
      setStatus('حدث خطأ أثناء تفعيل الجدولة')
      setStatusType('error')
    }
  }

  const handleStopSchedule = async () => {
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      })

      const data = await res.json()

      if (data.success) {
        setScheduleActive(false)
        setStatus('تم إيقاف التحميل التلقائي')
        setStatusType('info')
      } else {
        setStatus(`فشل إيقاف الجدولة: ${data.error}`)
        setStatusType('error')
      }
    } catch (error) {
      setStatus('حدث خطأ أثناء إيقاف الجدولة')
      setStatusType('error')
    }
  }

  return (
    <div className="container">
      <h1>🤖 مساعد تحميل فيديوهات يوتيوب</h1>
      <p className="subtitle">نظام ذكي لتحميل الفيديوهات تلقائياً كل 5 دقائق</p>

      {scheduleActive && (
        <div className="schedule-info">
          <h3>⏰ التحميل التلقائي مفعل</h3>
          <p>سيتم تحميل الفيديو تلقائياً كل 5 دقائق</p>
        </div>
      )}

      <div className="input-group">
        <label htmlFor="url">رابط فيديو يوتيوب</label>
        <input
          type="text"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          disabled={loading}
        />
      </div>

      <div className="button-group">
        <button
          className="btn-download"
          onClick={handleDownload}
          disabled={loading}
        >
          {loading ? 'جاري التحميل...' : '⬇️ تحميل الآن'}
        </button>

        {!scheduleActive ? (
          <button
            className="btn-schedule"
            onClick={handleStartSchedule}
            disabled={loading}
          >
            🔄 تفعيل التحميل التلقائي
          </button>
        ) : (
          <button
            className="btn-stop"
            onClick={handleStopSchedule}
            disabled={loading}
          >
            ⏹️ إيقاف التحميل التلقائي
          </button>
        )}
      </div>

      {status && (
        <div className={`status ${statusType}`}>
          {status}
          {loading && <span className="spinner"></span>}
        </div>
      )}

      {downloads.length > 0 && (
        <div className="downloads-list">
          <h2>📋 سجل التحميلات</h2>
          {downloads.map((download, index) => (
            <div key={index} className="download-item">
              <div className="download-info">
                <div className="download-url">{download.url}</div>
                <div className="download-time">{download.timestamp} - الحالة: {download.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
