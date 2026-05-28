/**
 * Returns a displayable image URL.
 * Handles: full URLs, relative paths, null/undefined.
 */
export const getImageUrl = (path) => {
  if (!path) return null;

  // Already a full URL (http/https) — use directly
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Relative path — prepend API base URL
  return `${import.meta.env.VITE_API_BASE_URL}/${path}`;
};
