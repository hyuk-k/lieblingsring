export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
export const gtag = {
  event: (action: string, params: Record<string, any> = {}) => {
    if (typeof window === "undefined" || !GA_ID) return;
    // @ts-ignore
    window.gtag("event", action, params);
  },
};
