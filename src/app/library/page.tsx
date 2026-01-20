import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DownloadButton from './DownloadButton'

export default async function LibraryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?redirect=/library')
  }

  const { data: entitlements } = await supabase
    .from('entitlements')
    .select(`
      *,
      products (id, title, description, cover_image_url, file_path)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">คลังหนังสือของฉัน</h1>

      {!entitlements || entitlements.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-muted text-lg mb-4">คุณยังไม่มีหนังสือในคลัง</p>
          <a href="/products" className="btn-primary">
            เลือกซื้อหนังสือ
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {entitlements.map((entitlement) => {
            const product = entitlement.products as {
              id: string
              title: string
              description: string | null
              cover_image_url: string | null
              file_path: string
            }

            return (
              <div key={entitlement.id} className="card">
                <div className="flex gap-4">
                  {product?.cover_image_url ? (
                    <img
                      src={product.cover_image_url}
                      alt={product.title}
                      className="w-24 h-32 object-cover rounded"
                    />
                  ) : (
                    <div className="w-24 h-32 bg-secondary rounded flex items-center justify-center">
                      <span className="text-3xl">📚</span>
                    </div>
                  )}

                  <div className="flex-1">
                    <h2 className="font-semibold text-lg mb-2">{product?.title}</h2>
                    <p className="text-muted text-sm mb-4 line-clamp-2">
                      {product?.description || 'ไม่มีรายละเอียด'}
                    </p>
                    <DownloadButton filePath={product?.file_path} title={product?.title} />
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
