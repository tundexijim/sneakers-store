import Link from "next/link";
import { Product } from "@/types";
import Image from "next/image";

export default function ProductCard({
  product,
  isListView = false,
}: {
  product: Product;
  isListView: boolean;
}) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(price);
  };
  return (
    <Link href={`/products/${product.slug}`}>
      <div
        className={`group cursor-pointer bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
          isListView
            ? "flex items-center justify-between space-x-4 p-4 mb-4"
            : ""
        }`}
      >
        <div
          className={`relative overflow-hidden ${
            isListView ? "w-24 h-24 flex-shrink-0" : "w-full h-60"
          } bg-gray-100`}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            className=" object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        <div className={`${isListView ? "flex-1" : "p-4"} space-y-2 relative`}>
          <h3
            className={`${
              isListView ? "text-lg" : "text-xl"
            } font-semibold transition-colors line-clamp-2`}
          >
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-[17px] font-semibold text-gray-500">
              {formatPrice(product.price)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
