import browser from "webextension-polyfill";
import type { Artwork } from "../galleries/types.ts";
import type { Message, MessageResponse, Settings } from "../lib/messaging.ts";
import { AD_SELECTORS, isLikelyAd } from "./ad-selectors.ts";

const REPLACED_ATTR = "data-gallery-mode-replaced";
const SLOT_ATTR = "data-gallery-mode-slot";

let settings: Settings | null = null;
let slotCounter = 0;

async function init(): Promise<void> {
  const host = location.hostname;
  const response = (await browser.runtime.sendMessage({
    type: "GET_SETTINGS",
  } satisfies Message)) as MessageResponse;

  if (!response.ok || !("settings" in response)) return;
  settings = response.settings;

  if (!settings.enabled) return;
  if (settings.blocklistedDomains.some((d) => host.endsWith(d))) return;

  scanAndReplace();
  observeMutations();
}

function scanAndReplace(): void {
  const nodes = document.querySelectorAll<HTMLElement>(AD_SELECTORS.join(","));
  for (const node of nodes) {
    if (node.hasAttribute(REPLACED_ATTR)) continue;
    if (!isLikelyAd(node)) continue;
    void replace(node);
  }
}

function observeMutations(): void {
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const added of m.addedNodes) {
        if (added instanceof HTMLElement) {
          if (added.matches?.(AD_SELECTORS.join(","))) {
            if (!added.hasAttribute(REPLACED_ATTR) && isLikelyAd(added)) {
              void replace(added);
            }
          }
          const inner = added.querySelectorAll?.<HTMLElement>(
            AD_SELECTORS.join(","),
          );
          inner?.forEach((el) => {
            if (!el.hasAttribute(REPLACED_ATTR) && isLikelyAd(el)) {
              void replace(el);
            }
          });
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

async function replace(adElement: HTMLElement): Promise<void> {
  adElement.setAttribute(REPLACED_ATTR, "pending");
  const slotId = `slot-${++slotCounter}`;
  adElement.setAttribute(SLOT_ATTR, slotId);

  const rect = adElement.getBoundingClientRect();

  try {
    const response = (await browser.runtime.sendMessage({
      type: "GET_ARTWORK",
      slotId,
      slotWidth: rect.width,
      slotHeight: rect.height,
    } satisfies Message)) as MessageResponse;

    if (!response.ok || !("artwork" in response)) {
      adElement.removeAttribute(REPLACED_ATTR);
      return;
    }

    const replacement = buildArtworkElement(response.artwork, rect);
    adElement.replaceWith(replacement);
  } catch (err) {
    console.warn("[gallery-mode] failed to replace ad", err);
    adElement.removeAttribute(REPLACED_ATTR);
  }
}

function buildArtworkElement(artwork: Artwork, rect: DOMRect): HTMLElement {
  const frame = document.createElement("a");
  frame.className = "gallery-mode-frame";
  frame.setAttribute(REPLACED_ATTR, "true");
  frame.href = artwork.sourceUrl;
  frame.target = "_blank";
  frame.rel = "noopener noreferrer";
  frame.title = `${artwork.title} — ${artwork.artist} · click for details`;
  frame.style.width = `${rect.width}px`;
  frame.style.height = `${rect.height}px`;

  const img = document.createElement("img");
  img.className = "gallery-mode-img";
  img.loading = "lazy";
  img.decoding = "async";
  img.referrerPolicy = "no-referrer";
  img.alt = `${artwork.title} — ${artwork.artist}`;
  img.src = artwork.thumbnailUrl ?? artwork.imageUrl;
  frame.appendChild(img);

  if (settings?.showAttribution !== false) {
    const caption = document.createElement("span");
    caption.className = "gallery-mode-caption";
    caption.textContent = `${artwork.title} · ${artwork.artist}`;
    frame.appendChild(caption);
  }

  return frame;
}

init().catch((err) => console.warn("[gallery-mode] init failed", err));
