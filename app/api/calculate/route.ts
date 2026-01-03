import { NextRequest, NextResponse } from "next/server";
import { calculateAndStore } from "@/lib/calculation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const result = await calculateAndStore();

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("计算失败:", error);
    return NextResponse.json(
      { success: false, message: "服务器错误" },
      { status: 500 }
    );
  }
}
