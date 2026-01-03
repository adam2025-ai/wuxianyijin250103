import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/supabase/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { data: results, error } = await supabase
      .from("results")
      .select("*")
      .order("employee_name", { ascending: true });

    if (error) {
      console.error("获取结果失败:", error);
      return NextResponse.json(
        { success: false, message: "获取结果失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: results || [],
    });
  } catch (error) {
    console.error("获取结果失败:", error);
    return NextResponse.json(
      { success: false, message: "服务器错误" },
      { status: 500 }
    );
  }
}
