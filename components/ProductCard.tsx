import Link from "next/link";
import { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="">
      <Link href={`/product/${product.slug}`}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-72 object-cover mb-2"
        />
        <h2 className="text-lg font-semibold">{product.name}</h2>
        <p className="font-bold">${product.price}</p>
        <p className="font-bold">{product.description}</p>
      </Link>
    </div>
  );
}
