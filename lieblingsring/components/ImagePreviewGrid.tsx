// lieblingsring/lieblingsring/components/ImagePreviewGrid.tsx
"use client";

import React from "react";

export default function ImagePreviewGrid({ images }: { images: string[] }) {
  if (!images || images.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {images.map((src, i) => (
        <div key={i} style={{ width: 120, height: 120, overflow: "hidden", borderRadius: 6, border: "1px solid #eee" }}>
          <img src={src} alt={`img-${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ))}
    </div>
  );
}
