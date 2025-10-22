export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export const pageview = (path: string) => {
  // @ts-expect-error gtag는 전역으로 주입됨
  window.gtag?.("config", GA_ID, { page_path: path });
};
