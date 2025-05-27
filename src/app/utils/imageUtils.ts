export const getFullImageUrl = (
  url: string,
  fallback: string = "/logo.jpg"
): string => {
  if (!url || url.trim() === "") {
    return fallback;
  }

  // If it's already a complete HTTP URL, return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // If it starts with /uploads/, it's already a proper path from the server
  if (url.startsWith("/uploads/")) {
    return url;
  }

  // If it's a relative path, prepend /uploads/services/
  const fullUrl = `/uploads/services/${url}`;

  return fullUrl;
};
