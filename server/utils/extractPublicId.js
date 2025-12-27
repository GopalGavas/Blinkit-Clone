export const extractPublicIdFromUrl = (url) => {
  if (!url) return null;

  // Remove query params
  const cleanUrl = url.split("?")[0];

  // Split after /upload/
  const uploadPart = cleanUrl.split("/upload/")[1];
  if (!uploadPart) return null;

  // Remove version (v12345/)
  const withoutVersion = uploadPart.replace(/^v\d+\//, "");

  // Remove file extension
  const publicId = withoutVersion.replace(/\.[^/.]+$/, "");

  return publicId; // ex: blinkit/abc123
};
