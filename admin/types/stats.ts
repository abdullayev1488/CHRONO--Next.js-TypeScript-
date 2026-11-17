import type { RecentOrder } from "./orderSummary";

export type StatsPeriod = "today" | "7" | "30";

export type Granularity = "hour" | "day";

export interface Kpi {
  value: number;
  /** Əvvəlki dövrlə faiz fərqi; əvvəlki dövrdə məlumat yoxdursa null */
  change: number | null;
}

/** Server yalnız satış olan vaxtları qaytarır */
export interface SeriesEntry {
  key: string;
  revenue: number;
  orders: number;
}

/** Boş vaxtlar 0 ilə doldurulmuş qrafik nöqtəsi */
export interface SeriesPoint extends SeriesEntry {
  label: string;
}

export interface CategorySale {
  name: string;
  revenue: number;
  percentage: number;
}

export interface BrandSale {
  name: string;
  sold: number;
}

export interface TopProduct {
  id: string;
  name: string;
  brand: string;
  image: string;
  sold: number;
  revenue: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  image: string;
  stock: number;
}

export interface Stats {
  kpis: {
    revenue: Kpi;
    orders: Kpi;
    averageOrderValue: Kpi;
    newCustomers: Kpi;
  };
  productCount: number;
  series: SeriesEntry[];
  granularity: Granularity;
  salesByCategory: CategorySale[];
  topBrands: BrandSale[];
  topProducts: TopProduct[];
  lowStock: LowStockProduct[];
  recentOrders: RecentOrder[];
}
