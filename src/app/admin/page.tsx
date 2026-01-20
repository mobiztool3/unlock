import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Get counts
  const [
    { count: pendingPayments },
    { count: totalOrders },
    { count: totalProducts },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from('payment_notifications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <p className="text-muted text-sm">รอตรวจสอบการชำระ</p>
          <p className="text-3xl font-bold text-primary">{pendingPayments || 0}</p>
        </div>
        <div className="card">
          <p className="text-muted text-sm">คำสั่งซื้อทั้งหมด</p>
          <p className="text-3xl font-bold">{totalOrders || 0}</p>
        </div>
        <div className="card">
          <p className="text-muted text-sm">สินค้าทั้งหมด</p>
          <p className="text-3xl font-bold">{totalProducts || 0}</p>
        </div>
        <div className="card">
          <p className="text-muted text-sm">ผู้ใช้ทั้งหมด</p>
          <p className="text-3xl font-bold">{totalUsers || 0}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/admin/payments" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl">💳</span>
            </div>
            <div>
              <h2 className="font-semibold text-lg">จัดการการชำระเงิน</h2>
              <p className="text-muted text-sm">ตรวจสอบและอนุมัติการชำระเงิน</p>
            </div>
          </div>
          {(pendingPayments || 0) > 0 && (
            <div className="mt-4 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">
              มี {pendingPayments} รายการรอตรวจสอบ
            </div>
          )}
        </Link>

        <Link href="/admin/products" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h2 className="font-semibold text-lg">จัดการสินค้า</h2>
              <p className="text-muted text-sm">เพิ่ม แก้ไข ลบสินค้า</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
