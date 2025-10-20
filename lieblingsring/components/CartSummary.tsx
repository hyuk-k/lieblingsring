"use client";

import Link from "next/link";

export default function CartSummary({
  total,
  disabled,
}: { total: number; disabled?: boolean }) {
  return (
    <div style={{
      marginTop: 14,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderTop: "1px solid #e5e7eb",
      paddingTop: 12
    }}>
      <span style={{ fontSize: 20, fontWeight: 700 }}>
        합계 {total.toLocaleString()}원
      </span>
      <Link
        href={disabled ? "#" : "/checkout"}
        aria-disabled={disabled}
        className="btn btn-primary"
        style={{ opacity: disabled ? .5 : 1, pointerEvents: disabled ? "none" as const : "auto" }}
      >
        결제하기
      </Link>
    </div>
  );
}

