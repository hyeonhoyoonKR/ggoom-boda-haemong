import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(request: Request) {
  if (!supabase) {
    return Response.json({ error: "DB가 연결되지 않았습니다." }, { status: 500 });
  }

  const { rating, comment } = await request.json();

  if (!rating || rating < 1 || rating > 5) {
    return Response.json({ error: "별점을 선택해주세요." }, { status: 400 });
  }

  const { error } = await supabase.from("feedback").insert([
    { rating, comment: comment?.trim() || null },
  ]);

  if (error) {
    console.error("Supabase feedback insert error:", error);
    return Response.json({ error: "저장에 실패했습니다." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
