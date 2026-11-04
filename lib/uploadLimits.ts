// Upload size limits, shared by the upload API, the admin upload screens and
// proxy.ts so every place gives the same friendly message.
// Photos are shrunk before saving, so a big phone photo is fine to accept.
// GIFs are saved as they are (to keep animations), so they keep a lower cap.
// next.config.ts sets the proxy body limit (25 MB) above MAX_UPLOAD_BYTES.
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
export const MAX_GIF_BYTES = 5 * 1024 * 1024;
export const TOO_LARGE_MESSAGE = "File too large (max 20 MB)";
export const GIF_TOO_LARGE_MESSAGE = "GIF too large (max 5 MB). GIFs aren't shrunk, so they keep the lower limit.";

// Returns the message to show when a file is over its limit, or null.
export function uploadSizeError(name: string, size: number): string | null {
  if (size > MAX_UPLOAD_BYTES) return TOO_LARGE_MESSAGE;
  if (name.toLowerCase().endsWith(".gif") && size > MAX_GIF_BYTES) return GIF_TOO_LARGE_MESSAGE;
  return null;
}