import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-red-50 to-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-primary">Unlock</span> ความรู้ใหม่
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
            ร้านขาย eBook ภาษาไทยคุณภาพ ดาวน์โหลดได้ทันทีหลังชำระเงิน
          </p>
          <Link href="/products" className="btn-primary text-lg px-8 py-3">
            ดูสินค้าทั้งหมด
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold mb-8">สินค้าแนะนำ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <div className="card hover:shadow-md transition-shadow">
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
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-primary font-bold text-xl">
                    ฿{product.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/products" className="btn-secondary">
              ดูสินค้าทั้งหมด →
            </Link>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="bg-secondary py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">ทำไมต้อง Unlock</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💳</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">ชำระเงินง่าย</h3>
              <p className="text-muted">
                รองรับการโอนเงินผ่านธนาคารและ PromptPay
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">รวดเร็ว</h3>
              <p className="text-muted">
                ดาวน์โหลดได้ทันทีหลังการชำระเงินได้รับการอนุมัติ
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">ปลอดภัย</h3>
              <p className="text-muted">
                ระบบรักษาความปลอดภัยระดับสูง ข้อมูลคุณปลอดภัย
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-2xl font-bold mb-2">Unlock</p>
          <p className="text-gray-400 text-sm">
            © 2024 Unlock. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
