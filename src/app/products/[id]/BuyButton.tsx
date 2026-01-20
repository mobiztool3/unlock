'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  productId: string
  price: number
}

export default function BuyButton({ productId, price }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleBuy = async () => {
    setLoading(true)
    const supabase = createClient()

    // Check if logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(`/login?redirect=/products/${productId}`)
      return
    }

    // Create order
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        product_id: productId,
        amount: price,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
      setLoading(false)
      return
    }

    // Redirect to payment page
    router.push(`/orders/${order.id}/pay`)
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="btn-primary w-full py-4 text-lg disabled:opacity-50"
    >
      {loading ? 'กำลังดำเนินการ...' : 'ซื้อเลย'}
    </button>
  )
}
