'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setIsAdmin(profile?.role === 'admin')
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-primary">
            Unlock
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/products" className="text-foreground hover:text-primary transition-colors">
              สินค้า
            </Link>

            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/library" className="text-foreground hover:text-primary transition-colors">
                      คลังหนังสือ
                    </Link>
                    <Link href="/orders" className="text-foreground hover:text-primary transition-colors">
                      คำสั่งซื้อ
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="text-primary font-medium hover:text-primary-hover transition-colors">
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="btn-secondary text-sm"
                    >
                      ออกจากระบบ
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-foreground hover:text-primary transition-colors">
                      เข้าสู่ระบบ
                    </Link>
                    <Link href="/register" className="btn-primary text-sm">
                      สมัครสมาชิก
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
