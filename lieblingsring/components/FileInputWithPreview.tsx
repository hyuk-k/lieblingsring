// lieblingsring/lieblingsring/components/FileInputWithPreview.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxBytes?: number;
  onChangeFiles?: (files: File[]) => void;
};

export default function FileInputWithPreview({
  accept = "image/*",
  multiple = true,
  maxFiles = 6,
  maxBytes = 6 * 1024 * 1024,
  onChangeFiles,
}: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const prevUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      prevUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      prevUrlsRef.current = [];
    };
  }, []);

  useEffect(() => {
    prevUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    prevUrlsRef.current = previews.slice();
  }, [previews]);

  const handleFiles = (fl: FileList | null) => {
    if (!fl) return;
    const arr = Array.from(fl).slice(0, maxFiles);
    // client-side validation
    for (const f of arr) {
      if (!f.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }
      if (f.size > maxBytes) {
        alert(`파일 크기가 너무 큽니다. (최대 ${(maxBytes / (1024 * 1024)).toFixed(1)}MB)`);
        return;
      }
    }
    setFiles(arr);
    setPreviews(arr.map((f) => URL.createObjectURL(f)));
    onChangeFiles?.(arr);
  };

  const remove = (index: number) => {
    const newFiles = files.slice();
    const newPreviews = previews.slice();
    const url = newPreviews[index];
    if (url) URL.revokeObjectURL(url);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setFiles(newFiles);
    setPreviews(newPreviews);
    onChangeFiles?.(newFiles);
  };

  return (
    <div>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        {previews.map((p, i) => (
          <div key={i} style={{ width: 120, height: 120, position: "relative", borderRadius: 6, overflow: "hidden", border: "1px solid #eee" }}>
            <img src={p} alt={`preview-${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`이미지 ${i + 1} 제거`}
              style={{ position: "absolute", top: 6, right: 6, background: "rgba(255,255,255,0.8)", border: "none", borderRadius: 4, padding: "2px 6px", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
