import { cacheLife } from "next/cache";

/** Cari il (Footer üçün). `new Date()` yalnız keşlənən funksiyada icazəlidir; il dəyişəndə təzələnir. */
export const getCurrentYear = async (): Promise<number> => {
  "use cache";
  cacheLife("days");

  return new Date().getFullYear();
};
