'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  paymentId: string
  orderId: string
  userId: string
  productId: string
}

export default function PaymentActions({ paymentId, orderId, userId, productId }: Props) {
  const [loading, setLoading] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const router = useRouter()

  const handleApprove = async () => {
    if (!confirm('ยืนยันการอนุมัติการชำระเงินนี้?')) return

    setLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Update payment notification
    await supabase
      .from('payment_notifications')
      .update({
        status: 'verified',
        verified_by: user?.id,
        verified_at: new Date().toISOString(),
      })
      .eq('id', paymentId)

    // Update order status
    await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', orderId)

    // Create entitlement
    await supabase
      .from('entitlements')
      .insert({
        user_id: userId,
        product_id: productId,
        order_id: orderId,
      })

    router.refresh()
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('กรุณาระบุเหตุผลที่ปฏิเสธ')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Update payment notification
    await supabase
      .from('payment_notifications')
      .update({
        status: 'rejected',
        verified_by: user?.id,
        verified_at: new Date().toISOString(),
        rejection_reason: rejectReason,
      })
      .eq('id', paymentId)

    // Update order status
    await supabase
      .from('orders')
      .update({ status: 'rejected' })
      .eq('id', orderId)

    router.refresh()
  }

  if (showRejectForm) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="font-medium mb-2">ระบุเหตุผลที่ปฏิเสธ:</p>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="input mb-3"
          rows={2}
          placeholder="เช่น ยอดเงินไม่ตรง, สลิปไม่ชัด"
        />
        <div className="flex gap-2">
          <button
            onClick={handleReject}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'กำลังดำเนินการ...' : 'ยืนยันปฏิเสธ'}
          </button>
          <button
            onClick={() => setShowRejectForm(false)}
            className="btn-secondary"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleApprove}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'กำลังดำเนินการ...' : 'อนุมัติ'}
      </button>
      <button
        onClick={() => setShowRejectForm(true)}
        disabled={loading}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
      >
        ปฏิเสธ
      </button>
    </div>
  )
}
