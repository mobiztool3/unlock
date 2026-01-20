'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  filePath: string
  title: string
}

export default function DownloadButton({ filePath, title }: Props) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    const supabase = createClient()

    // Get signed URL (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from('ebooks')
      .createSignedUrl(filePath, 3600)

    if (error || !data?.signedUrl) {
      alert('ไม่สามารถดาวน์โหลดได้ กรุณาลองใหม่')
      setLoading(false)
      return
    }

    // Download file
    const link = document.createElement('a')
    link.href = data.signedUrl
    link.download = title + '.pdf'
    link.click()

    setLoading(false)
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="btn-primary text-sm disabled:opacity-50"
    >
      {loading ? 'กำลังโหลด...' : 'ดาวน์โหลด'}
    </button>
  )
}
