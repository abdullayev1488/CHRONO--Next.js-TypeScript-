import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { UPLOADS_URL_PREFIX } from "../constants";

/** Yüklənmiş şəkillər public-dən kənarda saxlanılır və /images/uploads/[file] route-u ilə verilir (UPLOADS_DIR yalnız testlər üçün). */
export const UPLOADS_DIR =
  process.env.UPLOADS_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), "storage", "uploads");

export type ImageType = "png" | "jpg" | "webp";

export const IMAGE_CONTENT_TYPES: Record<ImageType, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
};

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Faylın real tipi MIME başlığına yox, ilk baytlara (signature) görə müəyyən edilir. */
export const detectImageType = (buffer: Buffer): ImageType | null => {
  if (buffer.length < 12) return null;

  if (buffer.subarray(0, 8).equals(PNG_SIGNATURE)) return "png";

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";

  const isWebp =
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP";

  return isWebp ? "webp" : null;
};

/** Yalnız təsdiqlənmiş şəkil saxlanılır, ad təsadüfi yaradılır. Etibarsız şəkildə null qaytarır. */
export const saveImage = async (buffer: Buffer): Promise<string | null> => {
  const type = detectImageType(buffer);
  if (!type) return null;

  await fs.mkdir(/*turbopackIgnore: true*/ UPLOADS_DIR, { recursive: true });

  const filename = `${crypto.randomUUID()}.${type}`;
  await fs.writeFile(path.join(/*turbopackIgnore: true*/ UPLOADS_DIR, filename), buffer, { flag: "wx" });

  return `${UPLOADS_URL_PREFIX}${filename}`;
};

/** Bütün şəkillər etibarlıdırsa hamısını saxlayır (sıra qorunur); biri etibarsızdırsa heç birini yazmır və null qaytarır. */
export const saveImages = async (buffers: Buffer[]): Promise<string[] | null> => {
  if (buffers.some((buffer) => detectImageType(buffer) === null)) return null;

  const urls: string[] = [];
  for (const buffer of buffers) urls.push((await saveImage(buffer)) as string);

  return urls;
};

/** Yalnız uploads qovluğundakı faylı silir; seed şəkillərinə toxunmur. */
export const deleteUploadedImage = async (imageUrl: string | null | undefined): Promise<void> => {
  if (typeof imageUrl !== "string" || !imageUrl.startsWith(UPLOADS_URL_PREFIX)) return;

  const filePath = path.resolve(/*turbopackIgnore: true*/ UPLOADS_DIR, path.basename(imageUrl));
  if (path.dirname(filePath) !== path.resolve(UPLOADS_DIR)) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Image cleanup failed:", (error as Error).message);
    }
  }
};

const STORED_FILE = /^[0-9a-f-]{36}\.(png|jpg|webp)$/;

/** Saxlanmış şəkli oxuyur; ad formatı yoxlanılır (path traversal yoxdur). Tapılmazsa null. */
export const readUploadedImage = async (
  filename: string
): Promise<{ data: Buffer; contentType: string } | null> => {
  const match = STORED_FILE.exec(filename);
  if (!match) return null;

  try {
    const data = await fs.readFile(path.join(/*turbopackIgnore: true*/ UPLOADS_DIR, filename));
    return { data, contentType: IMAGE_CONTENT_TYPES[match[1] as ImageType] };
  } catch {
    return null;
  }
};
