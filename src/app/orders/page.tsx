import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'รอชำระเงิน', color: 'bg-yellow-100 text-yellow-800' },
  submitted: { label: 'รอตรวจสอบ', color: 'bg-blue-100 text-blue-800' },
  paid: { label: 'ชำระแล้ว', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'ถูกปฏิเสธ', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'ยกเลิก', color: 'bg-gray-100 text-gray-800' },
  expired: { label: 'หมดอายุ', color: 'bg-gray-100 text-gray-800' },
}

export default async function OrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      products (id, title, cover_image_url)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">คำสั่งซื้อของฉัน</h1>

      {!orders || orders.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-muted text-lg mb-4">คุณยังไม่มีคำสั่งซื้อ</p>
          <Link href="/products" className="btn-primary">
            ดูสินค้า
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusMap[order.status || 'pending']
            const product = order.products as { id: string; title: string; cover_image_url: string | null }

            return (
              <div key={order.id} className="card">
                <div className="flex gap-4">
                  {product?.cover_image_url ? (
                    <img
                      src={product.cover_image_url}
                      alt={product.title}
                      className="w-20 h-28 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-28 bg-secondary rounded flex items-center justify-center">
                      <span className="text-2xl">📚</span>
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="font-semibold">{product?.title}</h2>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    <p className="text-primary font-bold mb-2">
                      ฿{order.amount.toLocaleString()}
                    </p>

                    <p className="text-muted text-sm mb-3">
                      สั่งซื้อเมื่อ {new Date(order.created_at!).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>

                    {order.status === 'pending' && (
                      <Link href={`/orders/${order.id}/pay`} className="btn-primary text-sm">
                        แจ้งชำระเงิน
                      </Link>
                    )}

                    {order.status === 'rejected' && (
                      <Link href={`/orders/${order.id}/pay`} className="btn-primary text-sm">
                        แจ้งชำระเงินใหม่
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
