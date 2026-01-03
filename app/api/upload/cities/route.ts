import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/supabase/client";
import { parseCitiesExcel, type CityData } from "@/lib/excelParser";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "请选择文件" },
        { status: 400 }
      );
    }

    // 检查文件类型
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return NextResponse.json(
        { success: false, message: "请上传 Excel 文件 (.xlsx 或 .xls)" },
        { status: 400 }
      );
    }

    // 解析 Excel
    const buffer = await file.arrayBuffer();
    const { data, errors } = parseCitiesExcel(buffer);

    if (data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "没有有效的数据",
          errors,
        },
        { status: 400 }
      );
    }

    // 检查城市名+年份重复
    const { data: existingCities } = await supabase
      .from("cities")
      .select("city_name, year");

    const existingSet = new Set(
      existingCities?.map((c) => `${c.city_name}-${c.year}`) || []
    );

    // 过滤掉重复的数据
    const uniqueData: CityData[] = [];
    const skipped: string[] = [];

    data.forEach((item) => {
      const key = `${item.city_name}-${item.year}`;
      if (existingSet.has(key)) {
        skipped.push(`${item.city_name} (${item.year})`);
      } else {
        uniqueData.push(item);
        existingSet.add(key);
      }
    });

    // 插入数据
    if (uniqueData.length > 0) {
      const { error: insertError } = await supabase
        .from("cities")
        .insert(uniqueData);

      if (insertError) {
        console.error("插入 cities 表失败:", insertError);
        return NextResponse.json(
          { success: false, message: "数据插入失败" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `成功导入 ${uniqueData.length} 条数据`,
      skipped: skipped.length,
      skippedItems: skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("上传城市标准失败:", error);
    return NextResponse.json(
      { success: false, message: "服务器错误" },
      { status: 500 }
    );
  }
}
