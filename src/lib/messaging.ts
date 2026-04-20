import type { Artwork, GallerySource } from "../galleries/types.ts";

export type Message =
  | {
      type: "GET_ARTWORK";
      slotId: string;
      slotWidth: number;
      slotHeight: number;
    }
  | { type: "GET_SETTINGS" }
  | { type: "SET_SETTINGS"; settings: Partial<Settings> }
  | { type: "CLEAR_CACHE" };

export type MessageResponse =
  | { ok: true; artwork: Artwork }
  | { ok: true; settings: Settings }
  | { ok: true }
  | { ok: false; error: string };

export interface Settings {
  enabled: boolean;
  sources: GallerySource[];
  showAttribution: boolean;
  blocklistedDomains: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  sources: ["artic", "met", "cleveland"],
  showAttribution: true,
  blocklistedDomains: [],
};
