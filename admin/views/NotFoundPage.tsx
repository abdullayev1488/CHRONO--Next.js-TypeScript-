import Link from "next/link";

export const NotFoundPage = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B08D57]">404</p>

    <h1 className="mt-3 font-serif text-[30px] text-[#171717]">Page not found</h1>

    <Link
      href="/admin"
      className="mt-6 bg-[#171717] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#B08D57]"
    >
      Back to Dashboard
    </Link>
  </div>
);
