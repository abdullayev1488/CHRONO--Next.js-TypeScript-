import { MAX_GALLERY_IMAGES } from "../constants";
import { ApiError } from "../http/errors";
import { deleteUploadedImage, saveImages } from "../lib/imageStorage";
import { parseProductInput } from "../lib/productInput";
import { revalidateCatalog } from "../lib/revalidate";
import { Order } from "../models/order";
import { Product } from "../models/product";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const MAX_FORM_FIELDS = 24;
const INVALID_IMAGE = "Image must be a valid PNG, JPEG or WEBP file";
const GALLERY_LIMIT_MESSAGE = `Gallery can contain at most ${MAX_GALLERY_IMAGES} images`;

const NOT_ARCHIVED = { archived: { $ne: true } };

export interface ProductForm {
  fields: Record<string, string>;
  /** Əsas şəkil (yenilənəndə göndərilməyə bilər) */
  image: Buffer | null;
  /** Qalereyaya əlavə olunacaq yeni şəkillər */
  gallery: Buffer[];
  /** Qalereyadan silinməsi istənən şəkil URL-ləri */
  removeGallery: string[];
}

const invalidUpload = () => ApiError.badRequest("Invalid upload");

const assertImageSize = (file: File): void => {
  if (file.size > MAX_IMAGE_SIZE) throw ApiError.badRequest("Image is too large (max 8 MB)");
};

const toBuffer = async (file: File): Promise<Buffer> => Buffer.from(await file.arrayBuffer());

/**
 * multipart/form-data gövdəsini oxuyur: mətn sahələri, tək `image` faylı, təkrarlanan `gallery`
 * faylları və təkrarlanan `removeGallery` URL-ləri (hər fayl maks. 8 MB).
 */
export const readProductForm = async (request: Request): Promise<ProductForm> => {
  let form: FormData;

  try {
    form = await request.formData();
  } catch {
    throw invalidUpload();
  }

  const fields: Record<string, string> = {};
  const removeGallery: string[] = [];
  const galleryFiles: File[] = [];
  let image: File | null = null;
  let fieldCount = 0;

  for (const [key, value] of form.entries()) {
    if (typeof value === "string") {
      if (key === "removeGallery") {
        removeGallery.push(value);
        continue;
      }
      if (++fieldCount > MAX_FORM_FIELDS) throw invalidUpload();
      fields[key] = value;
    } else if (key === "image") {
      if (value.size === 0) continue;
      if (image) throw invalidUpload();
      image = value;
    } else if (key === "gallery") {
      if (value.size > 0) galleryFiles.push(value);
    } else {
      throw invalidUpload();
    }
  }

  if (galleryFiles.length > MAX_GALLERY_IMAGES || removeGallery.length > MAX_GALLERY_IMAGES) {
    throw ApiError.badRequest(GALLERY_LIMIT_MESSAGE);
  }

  if (image) assertImageSize(image);
  galleryFiles.forEach(assertImageSize);

  return {
    fields,
    image: image ? await toBuffer(image) : null,
    gallery: await Promise.all(galleryFiles.map(toBuffer)),
    removeGallery,
  };
};

const validationError = (errors: string[]) => ApiError.badRequest(errors[0], { errors });

interface SavedImages<Main extends string | null = string | null> {
  /** Yeni əsas şəkil (göndərilməyibsə null) */
  image: Main;
  gallery: string[];
}

/** Əsas və qalereya şəkillərini birlikdə saxlayır: hamısı etibarlıdırsa yazılır, yoxsa heç biri. */
async function saveFormImages(image: Buffer, gallery: Buffer[]): Promise<SavedImages<string>>;
async function saveFormImages(image: Buffer | null, gallery: Buffer[]): Promise<SavedImages>;
async function saveFormImages(image: Buffer | null, gallery: Buffer[]): Promise<SavedImages> {
  const urls = await saveImages(image ? [image, ...gallery] : gallery);
  if (!urls) throw ApiError.badRequest(INVALID_IMAGE);

  return image ? { image: urls[0], gallery: urls.slice(1) } : { image: null, gallery: urls };
}

const deleteImages = (urls: Array<string | null>): Promise<void[]> =>
  Promise.all(urls.map((url) => deleteUploadedImage(url)));

/** Yeni məhsul yaradır; əsas şəkil məcburidir. */
export const createProduct = async ({ fields, image, gallery }: ProductForm) => {
  const { data, errors } = parseProductInput(fields);
  if (!image) errors.push("Product image is required");
  if (!image || errors.length > 0) throw validationError(errors);

  const saved = await saveFormImages(image, gallery);

  try {
    const product = await Product.create({ ...data, image: saved.image, images: saved.gallery });
    revalidateCatalog([product.id]);
    return product;
  } catch (error) {
    await deleteImages([saved.image, ...saved.gallery]);
    throw error;
  }
};

/** Məhsulun mövcud qalereyasından silinəcəkləri və qalanları ayırır (yalnız məhsulun öz URL-ləri silinə bilər). */
const splitGallery = (current: string[], requested: string[]) => {
  const toRemove = new Set(requested.filter((url) => current.includes(url)));

  return {
    kept: current.filter((url) => !toRemove.has(url)),
    removed: current.filter((url) => toRemove.has(url)),
  };
};

/** Məhsulu yeniləyir; şəkil göndərilməyibsə köhnəsi qalır, qalereya isə removeGallery/gallery ilə dəyişir. */
export const updateProduct = async (
  id: string,
  { fields, image, gallery, removeGallery }: ProductForm
) => {
  const { data, errors } = parseProductInput(fields);
  if (errors.length > 0) throw validationError(errors);

  const product = await Product.findOne({ _id: id, ...NOT_ARCHIVED });
  if (!product) throw ApiError.notFound("Product not found");

  const { kept, removed } = splitGallery(product.images, removeGallery);
  if (kept.length + gallery.length > MAX_GALLERY_IMAGES) {
    throw ApiError.badRequest(GALLERY_LIMIT_MESSAGE);
  }

  const saved = await saveFormImages(image, gallery);
  const oldImage = product.image;

  try {
    product.set({
      ...data,
      image: saved.image ?? oldImage,
      images: [...kept, ...saved.gallery],
    });
    await product.save();
  } catch (error) {
    await deleteImages([saved.image, ...saved.gallery]);
    throw error;
  }

  revalidateCatalog([id]);
  await deleteImages([saved.image ? oldImage : null, ...removed]);

  return product;
};

/** Sifarişi olan məhsul arxivlənir, olmayan silinir (yüklənmiş şəkilləri ilə birlikdə). */
export const deleteProduct = async (id: string) => {
  const product = await Product.findOne({ _id: id, ...NOT_ARCHIVED });
  if (!product) throw ApiError.notFound("Product not found");

  const hasOrders = await Order.exists({ "items.product": product._id });

  if (hasOrders) {
    product.archived = true;
    product.featured = false;
    await product.save();
    revalidateCatalog([id]);

    return { message: "Product archived", archived: true };
  }

  await product.deleteOne();
  revalidateCatalog([id]);
  await deleteImages([product.image, ...product.images]);

  return { message: "Product deleted", archived: false };
};
