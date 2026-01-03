import { supabase } from '@/supabase/client'

// 计算结果接口
export interface CalculationResult {
  employee_name: string
  avg_salary: number
  contribution_base: number
  company_fee: number
}

// 员工工资记录接口
interface SalaryRecord {
  employee_name: string
  salary_amount: number
}

// 城市标准接口
interface CityStandard {
  base_min: number
  base_max: number
  rate: number
}

/**
 * 核心计算函数
 * 1. 清空 results 表
 * 2. 从 salaries 表读取所有数据
 * 3. 按员工姓名分组，计算年度月平均工资
 * 4. 从 cities 表获取城市标准
 * 5. 计算每位员工的缴费基数和公司应缴纳金额
 * 6. 批量插入 results 表
 */
export async function calculateAndStore(): Promise<{
  success: boolean
  message: string
  count?: number
}> {
  try {
    // 1. 清空 results 表
    const { error: deleteError } = await supabase
      .from('results')
      .delete()
      .neq('id', 0)

    if (deleteError) {
      console.error('清空 results 表失败:', deleteError)
      return { success: false, message: '清空结果表失败' }
    }

    // 2. 从 salaries 表读取所有数据
    const { data: salaries, error: salariesError } = await supabase
      .from('salaries')
      .select('*')

    if (salariesError) {
      console.error('读取 salaries 表失败:', salariesError)
      return { success: false, message: '读取工资数据失败' }
    }

    if (!salaries || salaries.length === 0) {
      return { success: false, message: '没有工资数据，请先上传员工工资数据' }
    }

    // 3. 按员工姓名分组，计算年度月平均工资
    const groupedByEmployee = new Map<string, SalaryRecord[]>()
    salaries.forEach((record: any) => {
      const name = record.employee_name
      if (!groupedByEmployee.has(name)) {
        groupedByEmployee.set(name, [])
      }
      groupedByEmployee.get(name)!.push(record)
    })

    const avgSalaries = new Map<string, number>()
    for (const [name, records] of groupedByEmployee.entries()) {
      const total = records.reduce((sum, r) => sum + r.salary_amount, 0)
      avgSalaries.set(name, total / records.length)
    }

    // 4. 从 cities 表获取城市标准（默认取第一条）
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('*')
      .limit(1)

    if (citiesError) {
      console.error('读取 cities 表失败:', citiesError)
      return { success: false, message: '读取城市标准失败' }
    }

    if (!cities || cities.length === 0) {
      return { success: false, message: '没有城市标准数据，请先上传城市标准数据' }
    }

    const city = cities[0] as CityStandard
    const { base_min, base_max, rate } = city

    // 5. 计算每位员工的缴费基数和公司应缴纳金额
    const results: CalculationResult[] = []
    for (const [name, avgSalary] of avgSalaries.entries()) {
      let contributionBase: number

      if (avgSalary < base_min) {
        contributionBase = base_min
      } else if (avgSalary > base_max) {
        contributionBase = base_max
      } else {
        contributionBase = avgSalary
      }

      const companyFee = contributionBase * rate

      results.push({
        employee_name: name,
        avg_salary: Math.round(avgSalary * 100) / 100, // 保留两位小数
        contribution_base: Math.round(contributionBase * 100) / 100,
        company_fee: Math.round(companyFee * 100) / 100
      })
    }

    // 6. 批量插入 results 表
    const { error: insertError } = await supabase
      .from('results')
      .insert(results)

    if (insertError) {
      console.error('插入 results 表失败:', insertError)
      return { success: false, message: '保存计算结果失败' }
    }

    return {
      success: true,
      message: `计算完成，共处理 ${results.length} 名员工`,
      count: results.length
    }
  } catch (error) {
    console.error('计算过程出错:', error)
    return { success: false, message: '计算过程出错' }
  }
}
