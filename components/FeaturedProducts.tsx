import { getFeaturedProducts } from "@/services/productService";
import { Product } from "@/types";
import { useEffect, useState } from "react";
import { Loading } from "./Loading";
import ProductFeaturedCard from "./cards/ProductFeaturedCard";

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const products = await getFeaturedProducts(4);
        setFeaturedProducts(products);
      } catch (err) {
        setError("Failed to load featured products");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading)
    return (
      <div className="mt-10">
        <Loading />
      </div>
    );

  return (
    <section>
      {/* Mobile Slider (sm and below) */}
      <div className="sm:hidden">
        <div className="px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 snap-x snap-mandatory w-max">
            {featuredProducts.map((p) => (
              <div key={p.id} className="flex-none w-72 snap-start">
                <ProductFeaturedCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Layout (sm and above) */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {featuredProducts.map((p) => (
          <ProductFeaturedCard key={p.id} product={p} />
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
