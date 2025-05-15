// types/Product.ts
export type ProductSize = {
  size: number;
  stock: number;
};
export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  sizes: ProductSize[];
  createdAt: string;
};

export type CartItem = Product & { qty: number; selectedSize: number };
