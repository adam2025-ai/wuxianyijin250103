'use client'

import { useState } from 'react'

interface Result {
  id: number
  employee_name: string
  avg_salary: number
  contribution_base: number
  company_fee: number
}

interface DataTableProps {
  data: Result[]
}

export default function DataTable({ data }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [minSalary, setMinSalary] = useState('')
  const [maxSalary, setMaxSalary] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // 筛选数据
  const filteredData = data.filter(item => {
    const matchesName = item.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMinSalary = minSalary === '' || item.avg_salary >= parseFloat(minSalary)
    const matchesMaxSalary = maxSalary === '' || item.avg_salary <= parseFloat(maxSalary)
    return matchesName && matchesMinSalary && matchesMaxSalary
  })

  // 分页数据
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  // 导出 Excel
  const handleExport = () => {
    const headers = ['员工姓名', '年度月平均工资', '缴费基数', '公司缴纳金额']
    const rows = filteredData.map(item => [
      item.employee_name,
      item.avg_salary.toFixed(2),
      item.contribution_base.toFixed(2),
      item.company_fee.toFixed(2)
    ])

    // 创建 CSV 内容
    let csvContent = headers.join(',') + '\n'
    rows.forEach(row => {
      csvContent += row.join(',') + '\n'
    })

    // 添加 BOM 以支持中文
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `五险一金计算结果_${new Date().toLocaleDateString()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* 搜索和筛选 */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            搜索员工姓名
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="输入员工姓名..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="minSalary" className="block text-sm font-medium text-gray-700 mb-1">
            最低工资
          </label>
          <input
            type="number"
            id="minSalary"
            value={minSalary}
            onChange={e => setMinSalary(e.target.value)}
            placeholder="最低"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="maxSalary" className="block text-sm font-medium text-gray-700 mb-1">
            最高工资
          </label>
          <input
            type="number"
            id="maxSalary"
            value={maxSalary}
            onChange={e => setMaxSalary(e.target.value)}
            placeholder="最高"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleExport}
            disabled={filteredData.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            导出 Excel
          </button>
        </div>
      </div>

      {/* 数据统计 */}
      <div className="text-sm text-gray-600">
        共 {filteredData.length} 条记录
      </div>

      {/* 数据表格 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                员工姓名
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                年度月平均工资
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                缴费基数
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                公司缴纳金额
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.employee_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ¥{item.avg_salary.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ¥{item.contribution_base.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                    ¥{item.company_fee.toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            第 {currentPage} / {totalPages} 页
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
