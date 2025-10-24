// app/api/uploads/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export const POST = async (req: Request) => {
  try {
    const formData = await req.formData();
    const files = formData.getAll("images");

    if (!files || files.length === 0) {
      return NextResponse.json({ ok: false, message: "이미지 파일이 없습니다." }, { status: 400 });
    }

    // 업로드 제한(파일 수, 파일 타입/크기 검사)은 여기서 추가하세요
    const uploaded = await Promise.all(
      files.map(async (f) => {
        if (!(f instanceof File)) return null;
        // 파일 크기 확인(예: 6MB 이하)
        const maxBytes = 6 * 1024 * 1024;
        const buffer = Buffer.from(await f.arrayBuffer());
        if (buffer.byteLength > maxBytes) {
          throw new Error("파일이 너무 큽니다 (최대 6MB).");
        }
        // 이미지 타입 검사
        if (!f.type.startsWith("image/")) {
          throw new Error("이미지 형식만 업로드 가능합니다.");
        }

        const base64 = buffer.toString("base64");
        const dataUri = `data:${f.type};base64,${base64}`;

        const res = await cloudinary.uploader.upload(dataUri, {
          folder: "lieblingsring/products",
          resource_type: "image",
        });
        return { url: res.secure_url, public_id: res.public_id };
      })
    );

    const images = uploaded.filter(Boolean);
    return NextResponse.json({ ok: true, images });
  } catch (err: any) {
    console.error("upload error:", err);
    return NextResponse.json({ ok: false, message: err?.message || "업로드 실패" }, { status: 500 });
  }
};