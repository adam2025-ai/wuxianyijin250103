'use client'

import { useState } from 'react'
import Link from 'next/link'
import FileUpload from '@/components/FileUpload'

export default function UploadPage() {
  const [calculating, setCalculating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 上传城市标准
  const handleUploadCities = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload/cities', {
      method: 'POST',
      body: formData
    })

    return await response.json()
  }

  // 上传员工工资
  const handleUploadSalaries = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload/salaries', {
      method: 'POST',
      body: formData
    })

    return await response.json()
  }

  // 执行计算
  const handleCalculate = async () => {
    setCalculating(true)
    setMessage(null)

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST'
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '计算失败，请重试' })
    } finally {
      setCalculating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 返回链接 */}
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">数据上传</h1>

        <div className="space-y-6">
          {/* 城市标准上传 */}
          <FileUpload
            label="上传城市标准 (cities.xlsx)"
            accept=".xlsx,.xls"
            onUpload={handleUploadCities}
          />

          {/* 员工工资上传 */}
          <FileUpload
            label="上传员工工资 (salaries.xlsx)"
            accept=".xlsx,.xls"
            onUpload={handleUploadSalaries}
          />

          {/* 计算按钮和结果 */}
          <div className="border border-gray-300 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">执行计算</h3>

            <button
              onClick={handleCalculate}
              disabled={calculating}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {calculating ? '计算中...' : '开始计算'}
            </button>

            {message && (
              <div
                className={`mt-4 p-4 rounded-md ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
