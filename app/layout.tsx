import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'مساعد تحميل فيديوهات يوتيوب',
  description: 'نظام ذكي لتحميل فيديوهات يوتيوب تلقائياً',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
