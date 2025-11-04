// lieblingsring/lieblingsring/app/api/admin/import-products/route.ts
export const runtime = "nodejs"; // <- 추가: Node 런타임 사용

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parse as csvParse } from "csv-parse/sync";
import * as XLSX from "xlsx";

// TODO: 실제 관리자 인증 로직으로 대체하세요.
async function isAdmin(req: Request) {
  // 예시: 쿠키/헤더에서 세션 또는 토큰 확인
  return true;
}

// 간단한 slug 생성기(필요 시 더 정교하게 교체)
function makeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[\s\_]+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-+|\-+$/g, "");
}

export const POST = async (req: Request) => {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, message: "파일이 필요합니다." }, { status: 400 });
    }

    const filename = (file.name || "").toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let rows: any[] = [];

    if (filename.endsWith(".csv")) {
      const text = buffer.toString("utf-8");
      rows = csvParse(text, { columns: true, skip_empty_lines: true });
    } else if (filename.endsWith(".xls") || filename.endsWith(".xlsx")) {
      const wb = XLSX.read(buffer, { type: "buffer" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    } else {
      return NextResponse.json({ ok: false, message: "지원하지 않는 파일 형식입니다. CSV 또는 XLSX 사용" }, { status: 400 });
    }

    const results: { rowIndex: number; ok: boolean; message?: string; productId?: string }[] = [];

    const BATCH = 100; // 배치 단위 조정 가능
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      await prisma.$transaction(async (tx) => {
        for (const [idx, r] of batch.entries()) {
          const rowIndex = i + idx + 1;
          try {
            const name = String(r.name ?? r.title ?? "").trim();
            const price = Number(r.price ?? 0);
            const description = String(r.description ?? r.summary ?? "");
            const rawImgs = String(r.image_urls ?? r.images ?? "").trim(); // field names tolerant
            const imageUrls = rawImgs ? rawImgs.split(/;|,/).map((s: string) => s.trim()).filter(Boolean) : [];

            if (!name || !price) {
              results.push({ rowIndex, ok: false, message: "name 또는 price가 유효하지 않습니다." });
              continue;
            }

            const providedSlug = r.slug ? String(r.slug).trim() : "";
            const baseSlug = providedSlug || makeSlug(name) || `product-${Date.now()}`;
            let slug = baseSlug;
            let suffix = 0;
            // 충돌 방지
            while (true) {
              const exists = await tx.product.findUnique({ where: { slug } });
              if (!exists) break;
              suffix += 1;
              slug = `${baseSlug}-${suffix}`;
            }

            const created = await tx.product.create({
              data: {
                name,
                price,
                description,
                images: imageUrls, // images 가 실제 스키마 필드명이라면 이렇게
                slug,
              },
            });

            results.push({ rowIndex, ok: true, productId: created.id });
          } catch (err: any) {
            results.push({ rowIndex, ok: false, message: err?.message || "DB 생성 오류" });
          }
        }
      });
    }

    return NextResponse.json({ ok: true, total: rows.length, results });
  } catch (err: any) {
    console.error("import-products error:", err);
    return NextResponse.json({ ok: false, message: err?.message || "서버 오류" }, { status: 500 });
  }
};