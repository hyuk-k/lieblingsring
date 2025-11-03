// lieblingsring/lieblingsring/components/CloudinaryThumb.tsx
"use client";

import React from "react";

type Props = {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
};

export default function CloudinaryThumb({ src, width = 400, height, alt = "", className }: Props) {
  if (!src) return null;
  // src가 Cloudinary upload URL 형식이라 가정: https://res.cloudinary.com/<cloud>/image/upload/<rest>
  // 변환 옵션을 /upload/ 뒤에 삽입
  const parts = src.split("/upload/");
  const transform = `w_${width},c_fill,f_auto,q_auto`;
  const thumb = parts.length === 2 ? `${parts[0]}/upload/${transform}/${parts[1]}` : src;
  const style: React.CSSProperties = { width: "100%", height: height ? `${height}px` : "auto", objectFit: "cover" };
  return <img src={thumb} alt={alt} className={className} style={style} loading="lazy" />;
}
