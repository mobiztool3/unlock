'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id?: string
  title: string
  description: string
  price: number
  cover_image_url: string
  file_path: string
  is_active: boolean
}

interface Props {
  product?: Product
}

export default function ProductForm({ product }: Props) {
  const [title, setTitle] = useState(product?.title || '')
  const [description, setDescription] = useState(product?.description || '')
  const [price, setPrice] = useState(product?.price || 0)
  const [coverImageUrl, setCoverImageUrl] = useState(product?.cover_image_url || '')
  const [filePath, setFilePath] = useState(product?.file_path || '')
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [ebookFile, setEbookFile] = useState<File | null>(null)
  const router = useRouter()

  const isEdit = !!product?.id

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    let finalCoverUrl = coverImageUrl
    let finalFilePath = filePath

    // Upload cover image if selected
    if (coverFile) {
      const ext = coverFile.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(path, coverFile)

      if (uploadError) {
        setError('อัปโหลดรูปปกไม่สำเร็จ')
        setLoading(false)
        return
      }

      const { data } = supabase.storage.from('covers').getPublicUrl(path)
      finalCoverUrl = data.publicUrl
    }

    // Upload ebook file if selected
    if (ebookFile) {
      const ext = ebookFile.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('ebooks')
        .upload(path, ebookFile)

      if (uploadError) {
        setError('อัปโหลดไฟล์ eBook ไม่สำเร็จ')
        setLoading(false)
        return
      }

      finalFilePath = path
    }

    if (!finalFilePath && !isEdit) {
      setError('กรุณาอัปโหลดไฟล์ eBook')
      setLoading(false)
      return
    }

    const productData = {
      title,
      description,
      price,
      cover_image_url: finalCoverUrl || null,
      file_path: finalFilePath,
      is_active: isActive,
    }

    if (isEdit) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', product.id)

      if (error) {
        setError('อัปเดตไม่สำเร็จ: ' + error.message)
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert(productData)

      if (error) {
        setError('สร้างสินค้าไม่สำเร็จ: ' + error.message)
        setLoading(false)
        return
      }
    }

    router.push('/admin/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-2xl">
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          ชื่อสินค้า <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">รายละเอียด</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input"
          rows={4}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          ราคา (บาท) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="input"
          min={0}
          step={1}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">รูปปก</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          className="w-full"
        />
        {(coverFile || coverImageUrl) && (
          <img
            src={coverFile ? URL.createObjectURL(coverFile) : coverImageUrl}
            alt="Cover preview"
            className="mt-2 w-32 h-auto rounded"
          />
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          ไฟล์ eBook (PDF) {!isEdit && <span className="text-red-500">*</span>}
        </label>
        <input
          type="file"
          accept=".pdf,.epub"
          onChange={(e) => setEbookFile(e.target.files?.[0] || null)}
          className="w-full"
          required={!isEdit}
        />
        {filePath && !ebookFile && (
          <p className="text-muted text-sm mt-1">ไฟล์ปัจจุบัน: {filePath}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">เปิดขาย</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? 'กำลังบันทึก...' : isEdit ? 'อัปเดต' : 'สร้างสินค้า'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  )
}
