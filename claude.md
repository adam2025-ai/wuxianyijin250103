# 五险一金计算器 - 项目上下文管理中枢

## 项目概述

构建一个迷你"五险一金"计算器Web应用，根据员工工资数据和城市社保标准，计算公司应缴纳的社保公积金费用。

## 技术栈

| 层级 | 技术选型 |
|------|----------|
| 前端框架 | Next.js (App Router) |
| UI/样式 | Tailwind CSS |
| 数据库/后端 | Supabase (PostgreSQL) |
| Excel处理 | xlsx / sheetjs |

## 数据库设计

### cities (城市标准表)

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| id | int | 主键，自增 | 1 |
| city_name | text | 城市名 | 佛山 |
| year | text | 年份 | 2024 |
| base_min | int | 社保基数下限 | 1900 |
| base_max | int | 社保基数上限 | 31862 |
| rate | float | 综合缴纳比例 | 0.1512 |

**唯一约束**：(city_name, year)

**Excel导入字段映射**：
- 城市名 → city_name
- 年份 → year
- 基数下限 → base_min
- 基数上限 → base_max
- 综合比例 → rate

### salaries (员工工资表)

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| id | int | 主键，自增 | 1 |
| employee_id | text | 员工工号 | E001 |
| employee_name | text | 员工姓名 | 张三 |
| month | text | 年份月份 (YYYYMM) | 202401 |
| salary_amount | int | 该月工资金额 | 8000 |

**唯一约束**：(employee_id, month)

**Excel导入字段映射**：
- 工号 → employee_id
- 姓名 → employee_name
- 年份月份 → month
- 工资金额 → salary_amount

### results (计算结果表)

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| id | int | 主键，自增 | 1 |
| employee_name | text | 员工姓名 | 张三 |
| avg_salary | float | 年度月平均工资 | 8500.00 |
| contribution_base | float | 最终缴费基数 | 8500.00 |
| company_fee | float | 公司缴纳金额 | 1285.20 |

**说明**：每次计算前清空整表

## 核心业务逻辑

### 计算函数流程

```javascript
// 伪代码描述
async function calculateAndStore() {
  // 1. 清空 results 表
  await supabase.from('results').delete().neq('id', 0)

  // 2. 从 salaries 表读取所有数据
  const salaries = await supabase.from('salaries').select('*')

  // 3. 按员工姓名分组，计算年度月平均工资
  const groupedByEmployee = groupBy(salaries, 'employee_name')
  const avgSalaries = {}
  for (const [name, records] of Object.entries(groupedByEmployee)) {
    const total = records.reduce((sum, r) => sum + r.salary_amount, 0)
    avgSalaries[name] = total / records.length
  }

  // 4. 从 cities 表获取城市标准（默认取第一条，可扩展为选择城市）
  const city = await supabase.from('cities').select('*').limit(1).single()
  const { base_min, base_max, rate } = city.data

  // 5. 计算每位员工的缴费基数和公司应缴纳金额
  const results = []
  for (const [name, avgSalary] of Object.entries(avgSalaries)) {
    let contributionBase
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
      avg_salary: avgSalary,
      contribution_base: contributionBase,
      company_fee: companyFee
    })
  }

  // 6. 批量插入 results 表
  await supabase.from('results').insert(results)
}
```

### 缴费基数确定规则

| 年度月平均工资 | 最终缴费基数 |
|----------------|--------------|
| < base_min | base_min |
| > base_max | base_max |
| base_min ~ base_max | 平均工资本身 |

## 前端页面设计

### 1. 主页 (/)

**布局**：两个并排或垂直排列的功能卡片

```tsx
// 卡片一：数据上传
<Card link="/upload">
  <h2>数据上传</h2>
  <p>上传城市标准和员工工资数据</p>
</Card>

// 卡片二：结果查询
<Card link="/results">
  <h2>结果查询</h2>
  <p>查看五险一金计算结果</p>
</Card>
```

**样式参考**：简洁现代的卡片设计，使用 Tailwind CSS

### 2. 数据上传页 (/upload)

**功能组件**：

| 组件 | 功能 |
|------|------|
| 城市标准上传 | 选择 cities.xlsx，解析并导入 cities 表 |
| 员工工资上传 | 选择 salaries.xlsx，解析并导入 salaries 表 |
| 执行计算按钮 | 触发计算逻辑，清空并重建 results 表 |

**数据验证规则**：
- cities：城市名+年份重复则跳过该行
- salaries：工号+年月份重复则跳过该行
- 必填字段缺失则跳过该行并提示

**上传反馈**：
- 成功：显示成功导入条数
- 跳过：显示跳过条数及原因
- 失败：显示错误信息

### 3. 结果查询页 (/results)

**组件结构**：
- 搜索/筛选栏
- 数据表格
- 分页控件
- 导出Excel按钮

**表格列**：
- 员工姓名
- 年度月平均工资
- 缴费基数
- 公司缴纳金额

**筛选功能**：
- 按员工姓名搜索（模糊匹配）
- 按平均工资范围筛选

**分页设置**：每页 10 条记录

**导出功能**：将当前筛选结果导出为 Excel 文件

## 项目文件结构

```
wuxianyijin/
├── claude.md                    # 本文件
├── package.json
├── next.config.js
├── tailwind.config.js
├── supabase/
│   └── client.js               # Supabase 客户端配置
├── app/
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 主页
│   ├── upload/
│   │   └── page.tsx            # 数据上传页
│   ├── results/
│   │   └── page.tsx            # 结果查询页
│   └── api/                    # API 路由
│       ├── upload/
│       │   ├── cities/route.ts    # 上传城市标准
│       │   └── salaries/route.ts  # 上传员工工资
│       └── calculate/route.ts     # 执行计算
├── lib/
│   ├── calculation.ts          # 核心计算逻辑
│   └── excelParser.ts          # Excel 解析工具
└── components/
    ├── Card.tsx                # 卡片组件
    ├── DataTable.tsx           # 数据表格组件
    └── FileUpload.tsx          # 文件上传组件
```

## Supabase 配置

### 环境变量 (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### SQL 初始化脚本

```sql
-- 创建 cities 表
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  city_name TEXT NOT NULL,
  year TEXT NOT NULL,
  base_min INTEGER NOT NULL,
  base_max INTEGER NOT NULL,
  rate FLOAT NOT NULL,
  UNIQUE (city_name, year)
);

-- 创建 salaries 表
CREATE TABLE salaries (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL,
  salary_amount INTEGER NOT NULL,
  UNIQUE (employee_id, month)
);

-- 创建 results 表
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  avg_salary FLOAT NOT NULL,
  contribution_base FLOAT NOT NULL,
  company_fee FLOAT NOT NULL
);

-- 启用 RLS（可选，如需公开访问则可关闭）
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- 允许公开访问
CREATE POLICY "Allow public access" ON cities FOR ALL USING (true);
CREATE POLICY "Allow public access" ON salaries FOR ALL USING (true);
CREATE POLICY "Allow public access" ON results FOR ALL USING (true);
```

## 开发 TODO 清单

### 阶段一：项目初始化与配置

- [ ] 创建 Next.js 项目（App Router）
- [ ] 安装依赖：Tailwind CSS、Supabase 客户端、xlsx 库
- [ ] 配置 Tailwind CSS
- [ ] 配置 Supabase 客户端
- [ ] 在 Supabase 创建项目并获取连接信息
- [ ] 执行 SQL 初始化脚本创建数据表
- [ ] 配置环境变量

### 阶段二：核心工具与组件

- [ ] 创建 Supabase 客户端配置文件 (`supabase/client.js`)
- [ ] 创建 Excel 解析工具 (`lib/excelParser.ts`)
  - 解析 cities.xlsx
  - 解析 salaries.xlsx
  - 数据验证逻辑
- [ ] 创建 Card 组件 (`components/Card.tsx`)
- [ ] 创建 FileUpload 组件 (`components/FileUpload.tsx`)
- [ ] 创建 DataTable 组件 (`components/DataTable.tsx`)

### 阶段三：核心业务逻辑

- [ ] 实现核心计算函数 (`lib/calculation.ts`)
  - 清空 results 表
  - 计算年度月平均工资
  - 确定缴费基数
  - 计算公司应缴纳金额
  - 存储结果

### 阶段四：API 路由

- [ ] 创建 `/api/upload/cities` 路由
  - 接收文件上传
  - 解析 Excel
  - 数据验证（城市名+年份重复检查）
  - 插入 cities 表
  - 返回处理结果
- [ ] 创建 `/api/upload/salaries` 路由
  - 接收文件上传
  - 解析 Excel
  - 数据验证（工号+年月份重复检查）
  - 插入 salaries 表
  - 返回处理结果
- [ ] 创建 `/api/calculate` 路由
  - 调用核心计算函数
  - 返回处理结果

### 阶段五：前端页面

- [ ] 创建主页 (`app/page.tsx`)
  - 两个功能卡片布局
  - 导航链接
- [ ] 创建数据上传页 (`app/upload/page.tsx`)
  - 城市标准上传区域
  - 员工工资上传区域
  - 执行计算按钮
  - 上传状态反馈
- [ ] 创建结果查询页 (`app/results/page.tsx`)
  - 搜索/筛选组件
  - 数据表格展示
  - 分页控件
  - 导出 Excel 功能

### 阶段六：测试与优化

- [ ] 使用提供的 cities.xlsx 和 salaries.xlsx 测试数据上传
- [ ] 测试计算功能正确性
- [ ] 测试搜索筛选功能
- [ ] 测试导出 Excel 功能
- [ ] 测试分页功能
- [ ] 测试数据重复性检查
- [ ] UI/UX 优化

### 阶段七：部署准备

- [ ] 代码清理与注释
- [ ] 环境变量检查
- [ ] 生产环境构建测试
- [ ] 部署到 Vercel（可选）

## 数据示例

### cities.xlsx 示例

| 城市名 | 年份 | 基数下限 | 基数上限 | 综合比例 |
|--------|------|----------|----------|----------|
| 佛山   | 2024 | 1900     | 31862    | 0.1512   |

### salaries.xlsx 示例

| 工号  | 姓名  | 年份月份 | 工资金额 |
|-------|-------|----------|----------|
| E001  | 张三  | 202401   | 8000     |
| E001  | 张三  | 202402   | 8500     |
| E002  | 李四  | 202401   | 9000     |

### 计算结果示例

| 员工姓名 | 年度月平均工资 | 缴费基数 | 公司缴纳金额 |
|----------|----------------|----------|--------------|
| 张三     | 8250.00        | 8250.00  | 1247.40      |
| 李四     | 9000.00        | 9000.00  | 1360.80      |

---

**注意**：本文件是项目的上下文管理中枢，所有开发工作应以此为基准进行。如需修改需求或技术方案，请及时更新本文件。
