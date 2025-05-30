import Link from "next/link";
import { Product } from "@/types";

export default function ProductCard({
  product,
  isListView = false,
}: {
  product: Product;
  isListView: boolean;
}) {
  return (
    <Link href={`/product/${product.slug}`}>
      <div
        className={`group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
          isListView
            ? "flex items-center justify-between space-x-4 p-4 mb-4"
            : ""
        }`}
      >
        <div
          className={`relative overflow-hidden ${
            isListView ? "w-24 h-24 flex-shrink-0" : "w-full h-64"
          } bg-gray-100 ${isListView ? "rounded-lg" : "rounded-t-xl"}`}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        <div className={`${isListView ? "flex-1" : "p-4"} space-y-2 relative`}>
          <h3
            className={`${
              isListView ? "text-lg" : "text-xl"
            } font-semibold group-hover:text-blue-600 transition-colors line-clamp-2`}
          >
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <p
              className={`${
                isListView ? "text-xl" : "text-2xl"
              } font-bold text-blue-600`}
            >
              ${product.price}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
