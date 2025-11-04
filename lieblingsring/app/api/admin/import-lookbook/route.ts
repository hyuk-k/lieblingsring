// lieblingsring/lieblingsring/app/api/admin/import-lookbook/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parse as csvParse } from "csv-parse/sync";
import * as XLSX from "xlsx"; // Turbopack 호환 import 방식

// TODO: 실제 관리자 인증 로직으로 대체하세요.
async function isAdmin(req: Request) {
  return true;
}

export const POST = async (req: Request) => {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ ok: false, message: "파일 필요" }, { status: 400 });

    const filename = (file.name || "").toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let rows: any[] = [];
    if (filename.endsWith(".csv")) {
      rows = csvParse(buffer.toString("utf-8"), { columns: true, skip_empty_lines: true });
    } else if (filename.endsWith(".xls") || filename.endsWith(".xlsx")) {
      const wb = XLSX.read(buffer, { type: "buffer" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    } else {
      return NextResponse.json({ ok: false, message: "CSV/XLSX만 지원" }, { status: 400 });
    }

    const results: { rowIndex: number; ok: boolean; message?: string; lookbookId?: string }[] = [];

    const BATCH = 100;
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      await prisma.$transaction(async (tx) => {
        for (const [idx, r] of batch.entries()) {
          const rowIndex = i + idx + 1;
          try {
            const title = String(r.title ?? r.name ?? "").trim();
            const description = String(r.description ?? "");
            const rawImgs = String(r.image_urls ?? r.images ?? "").trim();
            const imageUrls = rawImgs ? rawImgs.split(/;|,/).map((s: string) => s.trim()).filter(Boolean) : [];

            if (!title) {
              results.push({ rowIndex, ok: false, message: "title 필요" });
              continue;
            }

            // 안전 처리 로직:
            // 1) 가능한 경우 images 배열로 생성 시도 (다중 이미지 지원)
            // 2) 실패하면 image(단일 필드)가 있는 스키마로 간주하고 첫 이미지로 생성 시도
            // Prisma 타입 정의 때문에 컴파일 오류가 발생하는 것을 피하기 위해 tx를 any로 단언합니다.
            const txAny = tx as any;

            let created: any = null;
            try {
              // 먼저 images 배열로 넣어본다 (스키마가 images: String[]이면 성공)
              created = await txAny.lookbook.create({
                data: {
                  title,
                  caption: description || null,
                  images: imageUrls,
                },
              });
            } catch (e1: any) {
              // images 필드가 없거나 다른 에러가 나면, 단일 image 필드로 다시 시도
              try {
                const firstImage = imageUrls.length > 0 ? imageUrls[0] : "";
                created = await txAny.lookbook.create({
                  data: {
                    title,
                    caption: description || null,
                    image: firstImage,
                  },
                });
              } catch (e2: any) {
                // 둘 다 실패하면 에러 리포트
                throw e2;
              }
            }

            results.push({ rowIndex, ok: true, lookbookId: created?.id });
          } catch (err: any) {
            console.error("import-lookbook row error:", err);
            results.push({ rowIndex, ok: false, message: err?.message || "DB 오류" });
          }
        }
      });
    }

    return NextResponse.json({ ok: true, total: rows.length, results });
  } catch (err: any) {
    console.error("import-lookbook error:", err);
    return NextResponse.json({ ok: false, message: err?.message || "서버 오류" }, { status: 500 });
  }
};