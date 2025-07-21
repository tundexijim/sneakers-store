// types/Product.ts
export type ProductSize = {
  size: number | string;
  stock: number;
};
export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  slug: string;
  description: string;
  sizes: ProductSize[];
  createdAt: string | null;
  randomValue: number;
  categorySlug: string;
};

export type Category = {
  id: string;
  name: string;
  image: string;
  // createdAt: string;
};

export type CartItem = Product & { qty: number; selectedSize: number | string };
