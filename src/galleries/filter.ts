const NON_PAINTING_KEYWORDS = [
  "fresco",
  "sculpture",
  "relief",
  "vessel",
  "ceramic",
  "pottery",
  "manuscript",
  "folio",
  "codex",
  "codices",
  "book",
  "document",
  "drawing",
  "sketch",
  "print",
  "etching",
  "engraving",
  "lithograph",
  "woodcut",
  "illumination",
  "illuminated",
  "page from",
  "leaf from",
  "photograph",
  "textile",
  "tapestry",
  "costume",
  "furniture",
  "armor",
];

export function looksLikePainting(
  ...parts: Array<string | undefined | null>
): boolean {
  const haystack = parts
    .map((p) => p ?? "")
    .join(" ")
    .toLowerCase();
  for (const kw of NON_PAINTING_KEYWORDS) {
    if (haystack.includes(kw)) return false;
  }
  return true;
}
