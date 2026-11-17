"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImage } from "../ProductImage";

/**
 * Əsas şəkil + miniatürlər. `images` — [əsas şəkil, ...qalereya].
 * `children` əsas şəklin üzərində göstərilir (məs. badge).
 * Məhsul dəyişəndə seçim sıfırlansın deyə çağıran tərəf `key={product._id}` verməlidir.
 */
export const ProductGallery = ({ images, alt, children }) => {
  const t = useTranslations("ProductGallery");
  const [index, setIndex] = useState(0);

  const count = images.length;
  const hasMultiple = count > 1;

  const goTo = (next) => setIndex((next + count) % count);

  const handleKeyDown = (event) => {
    if (!hasMultiple) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[300px] sm:max-w-[380px] lg:max-w-[420px]">
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={t("label", { name: alt })}
        tabIndex={hasMultiple ? 0 : undefined}
        onKeyDown={handleKeyDown}
        className="relative h-[240px] w-full overflow-hidden bg-[#F0EBE2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B08D57] min-[400px]:h-[280px] sm:h-[400px] lg:h-[500px]"
      >
        <ProductImage
          src={images[index]}
          alt={hasMultiple ? t("imageAlt", { name: alt, current: index + 1, total: count }) : alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
          className="object-cover"
        />

        {children}

        {hasMultiple && (
          <>
            <button
              type="button"
              aria-label={t("previous")}
              onClick={() => goTo(index - 1)}
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center bg-white/85 text-[#171717] shadow-md transition-colors hover:bg-[#B08D57] hover:text-white"
            >
              <ChevronLeft size={18} strokeWidth={1.6} />
            </button>

            <button
              type="button"
              aria-label={t("next")}
              onClick={() => goTo(index + 1)}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center bg-white/85 text-[#171717] shadow-md transition-colors hover:bg-[#B08D57] hover:text-white"
            >
              <ChevronRight size={18} strokeWidth={1.6} />
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {images.map((image, imageIndex) => (
            <li key={image}>
              <button
                type="button"
                aria-label={t("showImage", { number: imageIndex + 1 })}
                aria-current={imageIndex === index ? "true" : undefined}
                onClick={() => setIndex(imageIndex)}
                className={`relative block h-14 w-14 cursor-pointer overflow-hidden border bg-[#F0EBE2] transition-colors sm:h-16 sm:w-16 ${
                  imageIndex === index
                    ? "border-[#B08D57]"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <ProductImage
                  src={image}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
