/**
 * Parse a comma-separated list of Cloudinary public_ids (or local paths).
 * Returns an empty array for empty / null input.
 */
export function parseImagesField(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}