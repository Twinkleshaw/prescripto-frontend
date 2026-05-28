// src/utils/getImageUrl.js
export const getImageUrl = (path) => {
  if (!path) return null;

  // Already a full URL — but could be localhost, fix it
  if (path.startsWith("http://") || path.startsWith("https://")) {
    // If it contains localhost, replace with actual API base URL
    if (path.includes("localhost") || path.includes("127.0.0.1")) {
      const filename = path.split("/uploads/").pop();
      return `${import.meta.env.VITE_API_BASE_URL}/uploads/${filename}`;
    }
    return path; // already a valid production URL
  }

  // Relative path — prepend API base URL
  return `${import.meta.env.VITE_API_BASE_URL}/${path}`;
};
