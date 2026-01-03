// supabase/client.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (_supabaseInstance) return _supabaseInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
  }

  if (!key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");
  }

  _supabaseInstance = createClient(url, key);
  return _supabaseInstance;
}

// 使用 Proxy 实现懒加载，只在访问时才创建客户端
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient];
  }
});