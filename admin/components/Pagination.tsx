"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  onChange: (page: number) => void;
}

const buttonClass =
  "flex h-9 w-9 cursor-pointer items-center justify-center border border-[#E8E2D8] bg-white text-[#555] transition-colors hover:border-[#B08D57] hover:text-[#B08D57] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#E8E2D8] disabled:hover:text-[#555]";

export const Pagination = ({ page, pages, total, onChange }: PaginationProps) => {
  if (total === 0) return null;

  return (
    <nav aria-label="Pagination" className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <p className="text-[12px] text-[#777]">
        {total} {total === 1 ? "result" : "results"} · Page {page} of {pages}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className={buttonClass}
        >
          <ChevronLeft size={16} />
        </button>

        <button
          type="button"
          aria-label="Next page"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          className={buttonClass}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
};
