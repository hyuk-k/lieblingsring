// lieblingsring/lieblingsring/app/api/admin/import-lookbook/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parse as csvParse } from "csv-parse/sync";
import * as XLSX from "xlsx";

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

            // 우회 처리: 현재 schema에 image (단일) 필드가 있으므로, 여러 이미지 중 첫번째만 저장
            const firstImage = imageUrls.length > 0 ? imageUrls[0] : "";

            const created = await tx.lookbook.create({
              data: {
                title,
                image: firstImage,
                caption: description || null,
              },
            });

            results.push({ rowIndex, ok: true, lookbookId: created.id });
          } catch (err: any) {
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