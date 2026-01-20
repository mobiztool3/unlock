import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">สินค้าทั้งหมด</h1>

      {!products || products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted text-lg">ยังไม่มีสินค้าในขณะนี้</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <div className="card hover:shadow-md transition-shadow cursor-pointer">
                {product.cover_image_url ? (
                  <img
                    src={product.cover_image_url}
                    alt={product.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-secondary rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-4xl">📚</span>
                  </div>
                )}
                <h2 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h2>
                <p className="text-muted text-sm mb-3 line-clamp-2">{product.description}</p>
                <p className="text-primary font-bold text-xl">
                  ฿{product.price.toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
