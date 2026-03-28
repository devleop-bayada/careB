import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth-helpers";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "파일을 선택해주세요." }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "파일 크기는 5MB 이하여야 합니다." }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "JPG, PNG, WebP, GIF 형식만 업로드 가능합니다." }, { status: 400 });
    }

    const supabase = createServiceClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${randomUUID()}.${ext}`;
    const path = `uploads/${fileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("careb-uploads")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[Upload Error]", uploadError);
      return NextResponse.json({ error: "파일 업로드에 실패했습니다." }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from("careb-uploads")
      .getPublicUrl(path);

    return NextResponse.json({ url: urlData.publicUrl }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
