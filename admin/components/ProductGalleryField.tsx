"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Plus, X } from "lucide-react";
import { MAX_GALLERY_IMAGES } from "@/backend/constants";
import { getImageUrl } from "@/admin/utils/format";
import { ALLOWED_IMAGE_TYPES, getImageFileError } from "@/admin/utils/imageUpload";

interface NewImage {
  file: File;
  previewUrl: string;
}

export interface GalleryValue {
  /** Qalereyada saxlanılacaq mövcud şəkillər */
  kept: string[];
  /** Əlavə olunacaq yeni fayllar */
  files: File[];
}

interface ProductGalleryFieldProps {
  /** Məhsulun hazırkı qalereyası (yeni məhsul üçün boş) */
  initial: string[];
  /** Qalereya dəyişəndə çağırılır (yeni fayllar + saxlanılan şəkillər) */
  onChange: (value: GalleryValue) => void;
  onError: (message: string) => void;
}

const thumbClass = "relative h-20 w-20 shrink-0 border border-[#E8E2D8] bg-white";

const RemoveButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="absolute -right-2 -top-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-[#171717] text-white transition-colors hover:bg-[#AD4944]"
  >
    <X size={12} />
  </button>
);

export const ProductGalleryField = ({ initial, onChange, onError }: ProductGalleryFieldProps) => {
  const [kept, setKept] = useState(initial);
  const [added, setAdded] = useState<NewImage[]>([]);
  const previewUrlsRef = useRef<string[]>([]);

  const total = kept.length + added.length;
  const isFull = total >= MAX_GALLERY_IMAGES;

  // Brauzer yaddaşındakı önizləmə URL-ləri komponent bağlananda təmizlənir
  useEffect(() => {
    const urls = previewUrlsRef.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const publish = (nextKept: string[], nextAdded: NewImage[]) => {
    setKept(nextKept);
    setAdded(nextAdded);
    onChange({ kept: nextKept, files: nextAdded.map((image) => image.file) });
  };

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";

    const accepted: NewImage[] = [];

    for (const file of selected) {
      const problem = getImageFileError(file);

      if (problem) {
        onError(problem);
        return;
      }

      accepted.push({ file, previewUrl: URL.createObjectURL(file) });
      previewUrlsRef.current.push(accepted[accepted.length - 1].previewUrl);
    }

    const room = MAX_GALLERY_IMAGES - total;
    const fitting = accepted.slice(0, room);

    // Yerə sığmayanların önizləməsi dərhal təmizlənir
    accepted.slice(room).forEach((image) => URL.revokeObjectURL(image.previewUrl));

    if (accepted.length > room) onError(`Gallery can contain at most ${MAX_GALLERY_IMAGES} images.`);
    else onError("");

    publish(kept, [...added, ...fitting]);
  };

  const removeKept = (url: string) => publish(kept.filter((item) => item !== url), added);

  const removeAdded = (target: NewImage) => {
    URL.revokeObjectURL(target.previewUrl);
    publish(kept, added.filter((image) => image !== target));
  };

  return (
    <div className="sm:col-span-2">
      <label className="mb-1.5 block text-[11px] font-medium text-[#555]">
        Gallery Images ({total}/{MAX_GALLERY_IMAGES})
      </label>

      <div className="flex flex-wrap gap-3 border border-[#E8E2D8] bg-white p-3">
        {kept.map((url) => (
          <div key={url} className={thumbClass}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getImageUrl(url)} alt="Gallery" className="h-full w-full object-contain" />
            <RemoveButton onClick={() => removeKept(url)} label="Remove gallery image" />
          </div>
        ))}

        {added.map((image) => (
          <div key={image.previewUrl} className={thumbClass}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.previewUrl} alt="New gallery" className="h-full w-full object-contain" />
            <RemoveButton onClick={() => removeAdded(image)} label="Remove new gallery image" />
          </div>
        ))}

        {!isFull && (
          <label
            htmlFor="product-gallery"
            className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-[#CFC5B5] text-[#B08D57] transition-colors hover:border-[#B08D57]"
          >
            <Plus size={18} />
            <span className="text-[10px]">Add</span>

            <input
              id="product-gallery"
              type="file"
              multiple
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              onChange={handleSelect}
              className="sr-only"
            />
          </label>
        )}
      </div>

      <p className="mt-2 text-[10px] text-[#999]">
        Up to {MAX_GALLERY_IMAGES} extra images. Supported formats: PNG, JPG, WEBP
      </p>
    </div>
  );
};
