import { useEffect, useState } from "react";
import axios from "axios";
import ProductFeaturedCard from "./ProductFeaturedCard";
import { Product } from "@/types";

interface RandomProductsProps {
  excludeIds?: string[];
  type?: string;
}

const RandomProducts: React.FC<RandomProductsProps> = ({
  excludeIds = [],
  type,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = "/api/random-products";

        // Only append excludeIds if they exist and are non-empty
        if (excludeIds && excludeIds.length > 0) {
          const params = new URLSearchParams();
          excludeIds.forEach((id) => params.append("excludeIds", id));
          url += `?${params.toString()}`;
        }
        if (type) {
          url = `/api/random-products?type = ${type}`;
        }

        const res = await axios.get(url);
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch random products", err);
      } finally {
        setLoading(false);
      }
    };

    if (products.length === 0) {
      fetchProducts();
    }
  }, [excludeIds, type]);

  if (loading)
    return (
      <p className="mt-10">
        {" "}
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </p>
    );

  return (
    <section className="py-8">
      {type ? (
        <div className="mb-12 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Featured Releases
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of the latest and most coveted
            sneakers from the world's top brands.
          </p>
        </div>
      ) : (
        <h2 className="text-3xl lg:text-4xl font-bold mb-8 mt-12">
          You Might Like
        </h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductFeaturedCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
};

export default RandomProducts;
