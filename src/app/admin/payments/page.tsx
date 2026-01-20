import { createClient } from '@/lib/supabase/server'
import PaymentActions from './PaymentActions'

export default async function AdminPaymentsPage() {
  const supabase = await createClient()

  const { data: payments } = await supabase
    .from('payment_notifications')
    .select(`
      *,
      orders (
        id,
        amount,
        user_id,
        products (id, title),
        profiles:user_id (email, display_name)
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">จัดการการชำระเงิน</h1>

      {!payments || payments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-muted text-lg">ไม่มีรายการชำระเงิน</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => {
            const order = payment.orders as {
              id: string
              amount: number
              user_id: string
              products: { id: string; title: string }
              profiles: { email: string; display_name: string }
            }

            const statusColors: Record<string, string> = {
              pending: 'bg-yellow-100 text-yellow-800',
              verified: 'bg-green-100 text-green-800',
              rejected: 'bg-red-100 text-red-800',
            }

            const statusLabels: Record<string, string> = {
              pending: 'รอตรวจสอบ',
              verified: 'อนุมัติแล้ว',
              rejected: 'ปฏิเสธ',
            }

            return (
              <div key={payment.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-semibold">{order?.products?.title}</h2>
                    <p className="text-muted text-sm">
                      โดย: {order?.profiles?.display_name || order?.profiles?.email}
                    </p>
                    <p className="text-primary font-bold mt-1">
                      ฿{order?.amount?.toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[payment.status || 'pending']}`}>
                    {statusLabels[payment.status || 'pending']}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-muted text-sm mb-2">สลิปการโอน:</p>
                    <SlipImage slipPath={payment.slip_url} />
                  </div>
                  <div>
                    {payment.note && (
                      <div className="mb-4">
                        <p className="text-muted text-sm mb-1">หมายเหตุจากลูกค้า:</p>
                        <p className="bg-secondary p-2 rounded text-sm">{payment.note}</p>
                      </div>
                    )}
                    <p className="text-muted text-sm">
                      แจ้งเมื่อ: {new Date(payment.created_at!).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {payment.status === 'pending' && (
                  <PaymentActions
                    paymentId={payment.id}
                    orderId={order?.id}
                    userId={order?.user_id}
                    productId={order?.products?.id}
                  />
                )}

                {payment.status === 'rejected' && payment.rejection_reason && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                    <strong>เหตุผลที่ปฏิเสธ:</strong> {payment.rejection_reason}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

async function SlipImage({ slipPath }: { slipPath: string }) {
  const supabase = await createClient()
  const { data } = await supabase.storage
    .from('slips')
    .createSignedUrl(slipPath, 3600)

  if (!data?.signedUrl) {
    return <div className="bg-secondary p-4 rounded text-muted">ไม่สามารถโหลดสลิปได้</div>
  }

  return (
    <a href={data.signedUrl} target="_blank" rel="noopener noreferrer">
      <img
        src={data.signedUrl}
        alt="Payment slip"
        className="max-w-xs rounded-lg border hover:opacity-90 transition-opacity"
      />
    </a>
  )
}
