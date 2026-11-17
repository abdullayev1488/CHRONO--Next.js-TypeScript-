"use client";

import { useTranslations } from "next-intl";
import { StarRating } from "./StarRating";

/** Başlığın yanında qısa reytinq; kliklənəndə rəylər bölməsinə sürüşdürür. */
export const RatingSummary = ({ rating }) => {
  const t = useTranslations("Rating");
  const count = rating?.count ?? 0;

  const scrollToReviews = (event) => {
    event.preventDefault();
    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <a
      href="#reviews"
      onClick={scrollToReviews}
      className="mt-3 inline-flex w-fit items-center gap-2 text-xs text-[#171717]/60 transition-colors hover:text-[#B08D57]"
    >
      {count > 0 ? (
        <>
          <StarRating value={rating.average} showValue />
          <span className="underline underline-offset-4">{t("reviewsCount", { count })}</span>
        </>
      ) : (
        <span className="underline underline-offset-4">{t("noReviews")}</span>
      )}
    </a>
  );
};
