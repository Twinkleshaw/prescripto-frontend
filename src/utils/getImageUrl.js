// src/utils/getImageUrl.js
export const getImageUrl = (path) => {
  if (!path) return null;

  // Already a full URL
  if (path.startsWith("http://") || path.startsWith("https://")) {
    // Fix any stored localhost URLs
    if (path.includes("localhost") || path.includes("127.0.0.1")) {
      const filePath = path.split("/uploads/").pop();
      return `${import.meta.env.VITE_STORAGE_URL}/uploads/${filePath}`;
    }
    return path;
  }

  // Relative path like "uploads/profile/filename.png"
  return `${import.meta.env.VITE_STORAGE_URL}/${path}`;
};
