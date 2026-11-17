export const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

/** Fayl yükləməyə yararlı deyilsə istifadəçiyə göstəriləcək xəta mətnini, yararlıdırsa null qaytarır. */
export const getImageFileError = (file: File): string | null => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Please select a PNG, JPG or WEBP image.";
  if (file.size > MAX_IMAGE_SIZE) return "Image is too large (max 8 MB).";
  return null;
};
