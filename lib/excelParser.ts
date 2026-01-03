import * as xlsx from 'xlsx'

// Cities 表接口
export interface CityData {
  city_name: string
  year: string
  base_min: number
  base_max: number
  rate: number
}

// Salaries 表接口
export interface SalaryData {
  employee_id: string
  employee_name: string
  month: string
  salary_amount: number
}

// 解析 cities.xlsx
export function parseCitiesExcel(buffer: ArrayBuffer): {
  data: CityData[]
  errors: string[]
} {
  const workbook = xlsx.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const jsonData = xlsx.utils.sheet_to_json(worksheet) as any[]

  const data: CityData[] = []
  const errors: string[] = []

  // 字段映射：Excel 列名 -> 数据库字段名
  const fieldMap: Record<string, string> = {
    '城市名': 'city_name',
    '年份': 'year',
    '基数下限': 'base_min',
    '基数上限': 'base_max',
    '综合比例': 'rate'
  }

  // 辅助函数：从行中获取值，支持多种可能的键名（包括带空格和拼写错误的）
  const getValue = (row: any, possibleKeys: string[]): any => {
    for (const key of possibleKeys) {
      // 直接匹配
      if (row[key] !== undefined) return row[key]
      // 去除空格后匹配
      const trimmedKey = key.trim()
      if (row[trimmedKey] !== undefined) return row[trimmedKey]
    }
    return undefined
  }

  jsonData.forEach((row: any, index: number) => {
    try {
      // 先修剪行中的键名
      const trimmedRow: any = {}
      for (const key in row) {
        trimmedRow[key.trim()] = row[key]
      }

      const cityData: CityData = {
        city_name: getValue(trimmedRow, ['city_name', 'city_namte', fieldMap['城市名']]) || '',
        year: String(getValue(trimmedRow, ['year', fieldMap['年份']]) || ''),
        base_min: Number(getValue(trimmedRow, ['base_min', fieldMap['基数下限']]) || 0),
        base_max: Number(getValue(trimmedRow, ['base_max', fieldMap['基数上限']]) || 0),
        rate: Number(getValue(trimmedRow, ['rate', fieldMap['综合比例']]) || 0)
      }

      // 验证必填字段
      if (!cityData.city_name || !cityData.year) {
        errors.push(`第 ${index + 2} 行：缺少城市名或年份`)
        return
      }

      if (cityData.base_min <= 0 || cityData.base_max <= 0 || cityData.rate <= 0) {
        errors.push(`第 ${index + 2} 行：基数下限、基数上限或综合比例必须大于0`)
        return
      }

      data.push(cityData)
    } catch (error) {
      errors.push(`第 ${index + 2} 行：解析失败`)
    }
  })

  return { data, errors }
}

// 解析 salaries.xlsx
export function parseSalariesExcel(buffer: ArrayBuffer): {
  data: SalaryData[]
  errors: string[]
} {
  const workbook = xlsx.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const jsonData = xlsx.utils.sheet_to_json(worksheet) as any[]

  const data: SalaryData[] = []
  const errors: string[] = []

  // 字段映射：Excel 列名 -> 数据库字段名
  const fieldMap: Record<string, string> = {
    '工号': 'employee_id',
    '姓名': 'employee_name',
    '年份月份': 'month',
    '工资金额': 'salary_amount'
  }

  // 辅助函数：从行中获取值，支持多种可能的键名
  const getValue = (row: any, possibleKeys: string[]): any => {
    for (const key of possibleKeys) {
      if (row[key] !== undefined) return row[key]
      const trimmedKey = key.trim()
      if (row[trimmedKey] !== undefined) return row[trimmedKey]
    }
    return undefined
  }

  jsonData.forEach((row: any, index: number) => {
    try {
      // 先修剪行中的键名
      const trimmedRow: any = {}
      for (const key in row) {
        trimmedRow[key.trim()] = row[key]
      }

      const salaryData: SalaryData = {
        employee_id: String(getValue(trimmedRow, ['employee_id', fieldMap['工号']]) || ''),
        employee_name: String(getValue(trimmedRow, ['employee_name', fieldMap['姓名']]) || ''),
        month: String(getValue(trimmedRow, ['month', fieldMap['年份月份']]) || ''),
        salary_amount: Number(getValue(trimmedRow, ['salary_amount', fieldMap['工资金额']]) || 0)
      }

      // 验证必填字段
      if (!salaryData.employee_id || !salaryData.employee_name || !salaryData.month) {
        errors.push(`第 ${index + 2} 行：缺少工号、姓名或年份月份`)
        return
      }

      if (salaryData.salary_amount < 0) {
        errors.push(`第 ${index + 2} 行：工资金额不能为负数`)
        return
      }

      data.push(salaryData)
    } catch (error) {
      errors.push(`第 ${index + 2} 行：解析失败`)
    }
  })

  return { data, errors }
}
