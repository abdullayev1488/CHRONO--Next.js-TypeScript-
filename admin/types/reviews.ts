export interface ReviewProduct {
  _id: string;
  name: string;
  image: string;
}

export interface Review {
  _id: string;
  /** Məhsul silinibsə (ehtimal) null ola bilər */
  product: ReviewProduct | null;
  authorName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

export interface ReviewsParams {
  page: number;
  limit: number;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  pages: number;
}
