'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  orderId: string
  userId: string
}

export default function PaymentForm({ orderId, userId }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('กรุณาเลือกไฟล์สลิป')
      return
    }

    setError('')
    setLoading(true)

    const supabase = createClient()

    // Upload slip
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/${orderId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('slips')
      .upload(filePath, file)

    if (uploadError) {
      setError('อัปโหลดสลิปไม่สำเร็จ: ' + uploadError.message)
      setLoading(false)
      return
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('slips')
      .getPublicUrl(filePath)

    // Create payment notification
    const { error: notifyError } = await supabase
      .from('payment_notifications')
      .insert({
        order_id: orderId,
        slip_url: filePath,
        note: note || null,
        status: 'pending',
      })

    if (notifyError) {
      setError('บันทึกการแจ้งชำระไม่สำเร็จ: ' + notifyError.message)
      setLoading(false)
      return
    }

    // Update order status
    await supabase
      .from('orders')
      .update({ status: 'submitted' })
      .eq('id', orderId)

    router.push('/orders')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="font-semibold mb-4">อัปโหลดหลักฐานการชำระเงิน</h2>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          สลิปการโอนเงิน <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full"
          required
        />
        <p className="text-muted text-xs mt-1">รองรับไฟล์ภาพ (JPG, PNG, etc.)</p>
      </div>

      {file && (
        <div className="mb-4">
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="max-w-xs rounded-lg border"
          />
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          หมายเหตุ (ถ้ามี)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input"
          rows={3}
          placeholder="เช่น โอนจากบัญชี xxx, เวลาที่โอน เป็นต้น"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !file}
        className="btn-primary w-full disabled:opacity-50"
      >
        {loading ? 'กำลังส่ง...' : 'แจ้งชำระเงิน'}
      </button>
    </form>
  )
}
