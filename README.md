# 五险一金计算器

根据员工工资数据和城市社保标准，计算公司应缴纳的社保公积金费用的 Web 应用。

## 功能特性

- 📊 **数据上传**：支持上传城市标准和员工工资 Excel 文件
- 🧮 **自动计算**：自动计算年度月平均工资、缴费基数和公司缴纳金额
- 🔍 **数据查询**：支持按员工姓名搜索、按工资范围筛选
- 📥 **数据导出**：支持将计算结果导出为 Excel/CSV 文件
- 📄 **分页展示**：每页 10 条记录，方便浏览

## 技术栈

| 层级 | 技术选型 |
|------|----------|
| 前端框架 | [Next.js 14](https://nextjs.org/) (App Router) |
| UI/样式 | [Tailwind CSS](https://tailwindcss.com/) |
| 数据库 | [Supabase](https://supabase.com/) (PostgreSQL) |
| Excel处理 | [xlsx](https://www.npmjs.com/package/xlsx) |

## 数据库设计

### cities (城市标准表)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 主键，自增 |
| city_name | text | 城市名 |
| year | text | 年份 |
| base_min | int | 社保基数下限 |
| base_max | int | 社保基数上限 |
| rate | float | 综合缴纳比例 |

### salaries (员工工资表)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 主键，自增 |
| employee_id | text | 员工工号 |
| employee_name | text | 员工姓名 |
| month | text | 年份月份 (YYYYMM) |
| salary_amount | int | 该月工资金额 |

### results (计算结果表)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 主键，自增 |
| employee_name | text | 员工姓名 |
| avg_salary | float | 年度月平均工资 |
| contribution_base | float | 最终缴费基数 |
| company_fee | float | 公司缴纳金额 |

## 安装和运行

### 1. 克隆项目

```bash
git clone https://github.com/adam2025-ai/wuxianyijin250103.git
cd wuxianyijin250103
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 Supabase

首先在 [Supabase](https://supabase.com/) 创建项目，然后在 SQL 编辑器中执行以下初始化脚本：

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

-- 启用 RLS
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- 允许公开访问
CREATE POLICY "Allow public access" ON cities FOR ALL USING (true);
CREATE POLICY "Allow public access" ON salaries FOR ALL USING (true);
CREATE POLICY "Allow public access" ON results FOR ALL USING (true);
```

### 4. 配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_anon_key
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 使用说明

### 1. 上传数据

访问 **数据上传** 页面，依次上传：
- 城市标准文件 (cities.xlsx)
- 员工工资文件 (salaries.xlsx)

### 2. 执行计算

点击 **开始计算** 按钮，系统将：
1. 计算每位员工的年度月平均工资
2. 根据城市标准确定缴费基数
3. 计算公司应缴纳金额

### 3. 查看结果

访问 **结果查询** 页面，可以：
- 按员工姓名搜索
- 按工资范围筛选
- 导出计算结果

## Excel 文件格式

### cities.xlsx 格式

| 城市名 | 年份 | 基数下限 | 基数上限 | 综合比例 |
|--------|------|----------|----------|----------|
| 佛山   | 2024 | 1900     | 31862    | 0.1512   |

### salaries.xlsx 格式

| 工号  | 姓名  | 年份月份 | 工资金额 |
|-------|-------|----------|----------|
| E001  | 张三  | 202401   | 8000     |
| E001  | 张三  | 202402   | 8500     |

## 计算规则

| 年度月平均工资 | 最终缴费基数 |
|----------------|--------------|
| < 基数下限     | 基数下限     |
| > 基数上限     | 基数上限     |
| 基数下限 ~ 基数上限 | 平均工资本身 |

**公司缴纳金额 = 缴费基数 × 综合比例**

## 项目结构

```
wuxianyijin/
├── app/
│   ├── api/                    # API 路由
│   │   ├── upload/
│   │   │   ├── cities/         # 上传城市标准
│   │   │   └── salaries/       # 上传员工工资
│   │   ├── calculate/          # 执行计算
│   │   └── results/            # 获取结果
│   ├── upload/                 # 数据上传页
│   ├── results/                # 结果查询页
│   └── page.tsx                # 主页
├── components/
│   ├── Card.tsx                # 卡片组件
│   ├── FileUpload.tsx          # 文件上传组件
│   └── DataTable.tsx           # 数据表格组件
├── lib/
│   ├── calculation.ts          # 核心计算逻辑
│   └── excelParser.ts          # Excel 解析工具
└── supabase/
    └── client.ts               # Supabase 客户端
```

## License

MIT
