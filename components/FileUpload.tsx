'use client'

import { useState } from 'react'

interface FileUploadProps {
  label: string
  accept: string
  onUpload: (file: File) => Promise<{ success: boolean; message: string; skipped?: number; skippedItems?: string[]; errors?: string[] }>
}

export default function FileUpload({ label, accept, onUpload }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [skippedItems, setSkippedItems] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage(null)
    setSkippedItems([])
    setErrors([])

    try {
      const result = await onUpload(file)
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        if (result.skippedItems) {
          setSkippedItems(result.skippedItems)
        }
        if (result.errors) {
          setErrors(result.errors)
        }
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '上传失败，请重试' })
    } finally {
      setUploading(false)
      // 重置文件输入
      e.target.value = ''
    }
  }

  return (
    <div className="border border-gray-300 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{label}</h3>

      <div className="space-y-4">
        <label className="block">
          <span className="sr-only">选择文件</span>
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />
        </label>

        {uploading && (
          <div className="flex items-center gap-2 text-blue-600">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>上传中...</span>
          </div>
        )}

        {message && (
          <div
            className={`p-3 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {skippedItems.length > 0 && (
          <div className="p-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md">
            <p className="font-medium mb-2">跳过 {skippedItems.length} 条重复数据：</p>
            <ul className="text-sm list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
              {skippedItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {errors.length > 0 && (
          <div className="p-3 bg-orange-50 text-orange-800 border border-orange-200 rounded-md">
            <p className="font-medium mb-2">解析错误：</p>
            <ul className="text-sm list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
