export const AD_SELECTORS: readonly string[] = [
  "ins.adsbygoogle",
  "iframe[src*='doubleclick.net']",
  "iframe[src*='googlesyndication']",
  "iframe[src*='amazon-adsystem']",
  "iframe[id^='google_ads_iframe']",
  "iframe[id^='aswift_']",
  "div[id^='div-gpt-ad']",
  "div[id^='google_ads_']",
  "div[class*='ad-slot']",
  "div[class*='adsbox']",
  "div[data-ad-slot]",
  "[data-google-query-id]",
  "aside[aria-label='advertisement' i]",
];

export const MIN_AD_WIDTH = 120;
export const MIN_AD_HEIGHT = 60;

export function isLikelyAd(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const rect = el.getBoundingClientRect();
  if (rect.width < MIN_AD_WIDTH || rect.height < MIN_AD_HEIGHT) return false;
  return true;
}
