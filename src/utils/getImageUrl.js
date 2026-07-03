export const getImageUrl = (path) => {
  if (!path) return null;
  return path; // Cloudinary URLs are already full https:// URLs
};
