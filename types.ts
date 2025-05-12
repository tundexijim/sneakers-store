// types/Product.ts

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  sizes: number[];
  createdAt: string;
};

export type CartItem = Product & { qty: number; selectedSize: number };
