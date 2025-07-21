import Link from "next/link";
import { Product } from "@/types";

export default function ProductFeaturedCard({ product }: { product: Product }) {
  const formatPrice = (price: number) =>
    `₦${price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  return (
    <div className="group cursor-pointer">
      <Link href={`/product/${product.slug}`}>
        <div className="relative overflow-hidden rounded-2xl bg-gray-100 mb-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold transition-colors">
            {product.name}
          </h3>
          <p className="text-[17px] font-semibold text-gray-500">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
    </div>
  );
}
