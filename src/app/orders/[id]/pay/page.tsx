import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import PaymentForm from './PaymentForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PaymentPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      products (id, title, cover_image_url, price)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!order) {
    notFound()
  }

  // If already paid, redirect to library
  if (order.status === 'paid') {
    redirect('/library')
  }

  const product = order.products as { id: string; title: string; cover_image_url: string | null; price: number }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">แจ้งชำระเงิน</h1>

      <div className="card mb-6">
        <h2 className="font-semibold mb-4">รายละเอียดคำสั่งซื้อ</h2>
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
          <div>
            <h3 className="font-medium">{product?.title}</h3>
            <p className="text-primary font-bold text-xl mt-2">
              ฿{order.amount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="font-semibold mb-4">ช่องทางการชำระเงิน</h2>
        <div className="bg-secondary rounded-lg p-4">
          <p className="font-medium mb-2">ธนาคารกสิกรไทย</p>
          <p className="text-lg font-mono">123-4-56789-0</p>
          <p className="text-muted text-sm mt-1">ชื่อบัญชี: บริษัท อันล็อค จำกัด</p>
        </div>
        <p className="text-muted text-sm mt-4">
          หรือสแกน QR Code ด้านล่างเพื่อชำระผ่าน PromptPay
        </p>
        <div className="mt-4 flex justify-center">
          <div className="w-48 h-48 bg-secondary rounded-lg flex items-center justify-center">
            <span className="text-muted">QR Code</span>
          </div>
        </div>
      </div>

      <PaymentForm orderId={order.id} userId={user.id} />
    </div>
  )
}
