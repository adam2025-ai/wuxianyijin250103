'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import DataTable from '@/components/DataTable'

interface Result {
  id: number
  employee_name: string
  avg_salary: number
  contribution_base: number
  company_fee: number
}

export default function ResultsPage() {
  const [data, setData] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/results')
      const result = await response.json()

      if (result.success) {
        setData(result.data || [])
      } else {
        console.error('获取结果失败:', result.message)
      }
    } catch (error) {
      console.error('获取结果失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
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

        <h1 className="text-3xl font-bold text-gray-900 mb-8">结果查询</h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">加载中...</div>
          </div>
        ) : (
          <DataTable data={data} />
        )}
      </div>
    </div>
  )
}
