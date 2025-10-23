// lib/ga.ts
// Google Analytics (gtag) helper for Next.js (client-safe, no-op on server)
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ""; // e.g. G-XXXXXXX

type GtagEventParams = Record<string, any> | undefined;

/**
 * 내부: gtag 함수 안전하게 호출
 * - 서버(빌드) 환경에서는 아무 동작하지 않음
 * - window.gtag이 없으면 no-op
 */
function safeGtag(command: "config" | "event" | "set", ...args: any[]) {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (typeof w.gtag !== "function") return;
  w.gtag(command, ...args);
}

/**
 * 페이지뷰 기록
 * @param url 현재 페이지 경로 (예: window.location.pathname + window.location.search)
 */
export function pageview(url: string) {
  if (!GA_ID) return;
  safeGtag("config", GA_ID, { page_path: url });
}

/**
 * 범용 이벤트 기록
 * @param action 이벤트 이름 (예: 'click', 'purchase')
 * @param params 이벤트 파라미터(선택)
 */
export function event(action: string, params?: GtagEventParams) {
  if (!GA_ID) return;
  // gtag('event', action, params)
  safeGtag("event", action, params ?? {});
}

/**
 * 기존 gtag 래퍼(하위 호환)
 * @param action 또는 'config' 등
 * @param params
 */
export const gtag = (action: string, params?: GtagEventParams) => {
  // 단순 래퍼: 기존 코드에서 gtag(action, params)처럼 사용하던 경우를 지원
  if (!GA_ID) return;
  if (action === "pageview" && typeof params === "string") {
    pageview(params);
    return;
  }
  // 기본적으로 'event'로 전달
  event(action, params);
};

/**
 * 유틸 사용 예시(주석)
 *
 * // 페이지 전환 시
 * import { pageview } from "@/lib/ga";
 * pageview(window.location.pathname + window.location.search);
 *
 * // 이벤트 기록
 * import { event } from "@/lib/ga";
 * event("purchase", { value: 12345, currency: "KRW" });
 *
 * // 혹은 기존 gtag 래퍼 사용
 * import { gtag } from "@/lib/ga";
 * gtag("click_button", { label: "buy-now" });
 */
export default {
  pageview,
  event,
  gtag,
};