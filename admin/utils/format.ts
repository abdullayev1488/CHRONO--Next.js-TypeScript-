export const formatMoney = (value: number | null | undefined): string =>
  `$${Number(value ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export const formatDate = (value: string | number | Date): string =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatDateTime = (value: string | number | Date): string =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// DB-də şəkil yolu "/images/..." formasında saxlanılır; şəkillər eyni tətbiqdən verilir
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;

  return encodeURI(path);
};
