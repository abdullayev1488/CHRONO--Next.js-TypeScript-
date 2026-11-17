export const CATEGORIES = ["Classic", "Luxury", "Modern"] as const;
export type Category = (typeof CATEGORIES)[number];

export const BADGES = ["New", "Bestseller", "Popular", "Sale", "Exclusive"] as const;
export type Badge = (typeof BADGES)[number];

export const MECHANISMS = ["Automatic", "Manual", "Quartz"] as const;
export type Mechanism = (typeof MECHANISMS)[number];

/** Məhsulun əlavə qalereya şəkillərinin maksimum sayı (əsas şəkil buraya daxil deyil) */
export const MAX_GALLERY_IMAGES = 4;

export const ORDER_STATUSES = ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["Unpaid", "Paid", "Refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const SHIPPING_METHODS = {
  standard: { label: "Standard", price: 10 },
  express: { label: "Express", price: 20 },
} as const;
export type ShippingMethod = keyof typeof SHIPPING_METHODS;

export const FREE_SHIPPING_THRESHOLD = 150;

/** Yüklənmiş şəkillərin ictimai URL prefiksi (fayllar storage/uploads-dadır) */
export const UPLOADS_URL_PREFIX = "/images/uploads/";
