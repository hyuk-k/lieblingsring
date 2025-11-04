// lieblingsring/lieblingsring/app/api/admin/product-with-upload/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

const MAX_PER_FILE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 6;

async function isAdmin(req: Request): Promise<boolean> {
  // TODO: 실제 인증 로직으로 교체하세요 (쿠키, 세션, Authorization 헤더 등 확인)
  return true;
}

function formDataEntryToFiles(formData: FormData): File[] {
  const files: File[] = [];
  for (const [_key, value] of formData.entries()) {
    if (value instanceof File) files.push(value);
    else if (Array.isArray(value)) {
      // unlikely in typical fetch FormData, but kept for completeness
      for (const v of value) if (v instanceof File) files.push(v);
    }
  }
  return files;
}

function uploadToCloudinaryBuffer(buffer: Buffer, filename?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "lieblingsring_uploads" }, // 필요시 변경
      (error: any, result: any) => {
        if (error) return reject(error);
        if (!result || !result.secure_url) return reject(new Error("Cloudinary 업로드 실패"));
        resolve(result.secure_url as string);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 401 });
    }

    const formData = await req.formData();
    // 필드 추출: name, price, description
    const nameVal = formData.get("name");
    const priceVal = formData.get("price");
    const descriptionVal = formData.get("description");

    if (!nameVal || typeof nameVal !== "string" || !nameVal.trim()) {
      return NextResponse.json({ ok: false, message: "상품명(name)을 입력하세요." }, { status: 400 });
    }

    // price 숫자 변환
    let priceNum: number | null = null;
    if (typeof priceVal === "string" && priceVal.trim() !== "") {
      const n = Number(priceVal);
      if (!Number.isNaN(n)) priceNum = Math.floor(n);
    } else if (typeof priceVal === "number") {
      priceNum = priceVal;
    }
    if (priceNum === null) {
      return NextResponse.json({ ok: false, message: "유효한 가격(price)을 입력하세요." }, { status: 400 });
    }

    // 파일들 추출 (FormData에 files 필드로 여러개 또는 각 파일 별 입력 가능)
    const files = formDataEntryToFiles(formData);

    if (files.length === 0) {
      // 허용: 이미지 없이도 제품 생성 허용. 필요 시 400으로 변경 가능
      const productNoImage = await prisma.product.create({
        data: {
          name: nameVal.trim(),
          price: priceNum,
          description: typeof descriptionVal === "string" ? descriptionVal : "",
          images: [],
          slug: nameVal.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, ""),
        },
      });
      return NextResponse.json({ ok: true, product: productNoImage });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ ok: false, message: `최대 ${MAX_FILES}장까지 업로드 가능합니다.` }, { status: 400 });
    }

    // 파일당 용량 검사 및 업로드
    const uploadedUrls: string[] = [];

    for (const f of files) {
      // File.size는 number로 제공됨
      const size = (f as any).size as number | undefined;
      if (typeof size === "number" && size > MAX_PER_FILE) {
        return NextResponse.json({ ok: false, message: `${f.name} 파일이 10MB를 초과합니다.` }, { status: 413 });
      }

      // 브라우저 File -> ArrayBuffer -> Buffer
      const arrayBuffer = await f.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      try {
        const url = await uploadToCloudinaryBuffer(buffer, f.name);
        uploadedUrls.push(url);
      } catch (err: any) {
        console.error("Cloudinary upload error:", err);
        return NextResponse.json({ ok: false, message: "이미지 업로드 실패: " + (err?.message || "unknown") }, { status: 500 });
      }
    }

    // 제품 생성
    const product = await prisma.product.create({
      data: {
        name: nameVal.trim(),
        price: priceNum,
        description: typeof descriptionVal === "string" ? descriptionVal : "",
        images: uploadedUrls,
        slug: nameVal.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, ""),
      },
    });

    return NextResponse.json({ ok: true, product });
  } catch (err: any) {
    console.error("product-with-upload route error:", err);
    return NextResponse.json({ ok: false, message: err?.message || "서버 오류" }, { status: 500 });
  }
}
