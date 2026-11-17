import Image from "next/image";
import { getImageUrl } from "../utils/imageUrl";

// Məhsul şəkli: next/image (avif/webp, düzgün ölçü, lazy-load). `src` DB-dəki yoldur ("/images/...")
export const ProductImage = ({ src, alt, ...props }) => (
    <Image src={getImageUrl(src)} alt={alt} {...props} />
);
