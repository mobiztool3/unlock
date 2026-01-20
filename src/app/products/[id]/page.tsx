import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BuyButton from './BuyButton'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!product) {
    notFound()
  }

  // Check if user already owns this product
  const { data: { user } } = await supabase.auth.getUser()
  let hasEntitlement = false

  if (user) {
    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .single()

    hasEntitlement = !!entitlement
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          {product.cover_image_url ? (
            <img
              src={product.cover_image_url}
              alt={product.title}
              className="w-full rounded-xl shadow-lg"
            />
          ) : (
            <div className="w-full aspect-[3/4] bg-secondary rounded-xl flex items-center justify-center">
              <span className="text-8xl">📚</span>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

          <p className="text-muted mb-6 whitespace-pre-wrap">
            {product.description || 'ไม่มีรายละเอียด'}
          </p>

          <div className="bg-secondary rounded-xl p-6 mb-6">
            <p className="text-muted text-sm mb-1">ราคา</p>
            <p className="text-primary font-bold text-3xl">
              ฿{product.price.toLocaleString()}
            </p>
          </div>

          {hasEntitlement ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-700 font-medium">คุณเป็นเจ้าของสินค้านี้แล้ว</p>
              <a href="/library" className="text-primary hover:underline text-sm">
                ไปที่คลังหนังสือ →
              </a>
            </div>
          ) : (
            <BuyButton productId={product.id} price={product.price} />
          )}
        </div>
      </div>
    </div>
  )
}
