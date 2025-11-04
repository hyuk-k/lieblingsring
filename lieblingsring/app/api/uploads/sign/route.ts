// lieblingsring/lieblingsring/app/api/uploads/sign/route.ts
export const runtime = "nodejs";

import crypto from "crypto";
import { NextResponse } from "next/server";

/**
 * 클라이언트에서 업로드 전에 signature와 timestamp, cloudName, apiKey를 요청합니다.
 * 클라이언트는 이 값을 사용해 Cloudinary에 직접 POST 업로드를 수행합니다.
 */

export async function GET(req: Request) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ ok: false, message: "Cloudinary 환경변수가 설정되어 있지 않습니다." }, { status: 500 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    // Cloudinary 요구 사항에 맞게 시그니처 생성 (간단 예: timestamp만 사용)
    const toSign = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(toSign).digest("hex");

    return NextResponse.json({
      ok: true,
      signature,
      timestamp,
      cloudName,
      apiKey,
    });
  } catch (err: any) {
    console.error("sign error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류" }, { status: 500 });
  }
}
