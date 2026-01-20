import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import DeleteButton from './DeleteButton'

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">จัดการสินค้า</h1>
        <Link href="/admin/products/new" className="btn-primary">
          + เพิ่มสินค้าใหม่
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-muted text-lg mb-4">ยังไม่มีสินค้า</p>
          <Link href="/admin/products/new" className="btn-primary">
            เพิ่มสินค้าแรก
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="card">
              <div className="flex gap-4">
                {product.cover_image_url ? (
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
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-semibold">{product.title}</h2>
                      <p className="text-primary font-bold">
                        ฿{product.price.toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.is_active ? 'เปิดขาย' : 'ปิดขาย'}
                    </span>
                  </div>

                  <p className="text-muted text-sm mt-2 line-clamp-2">
                    {product.description || 'ไม่มีรายละเอียด'}
                  </p>

                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="btn-secondary text-sm"
                    >
                      แก้ไข
                    </Link>
                    <DeleteButton productId={product.id} title={product.title} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
