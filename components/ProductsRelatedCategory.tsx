import { getProductsRelatedCategory } from "@/services/productService";
import { Product } from "@/types";
import { useEffect, useState } from "react";
import { Loading } from "./Loading";
import ProductFeaturedCard from "./cards/ProductFeaturedCard";

export default function ProductsRelatedCategory({
  categoryName,
  excludeProductId,
}: {
  categoryName: string;
  excludeProductId: string;
}) {
  const [RelatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const products = await getProductsRelatedCategory(
          4,
          categoryName,
          excludeProductId
        );
        setRelatedProducts(products);
      } catch (err) {
        setError("Failed to load featured products");
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
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
            {RelatedProducts.map((product) => {
              const stock = product.sizes.reduce(
                (sum, size) => sum + size.stock,
                0
              );
              return (
                <div
                  key={product.id}
                  className="flex-none w-72 snap-start relative"
                >
                  {stock === 0 && (
                    <div
                      aria-hidden="true"
                      className="absolute top-2 right-2 z-20 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded"
                    >
                      OUT OF STOCK
                    </div>
                  )}
                  <ProductFeaturedCard key={product.id} product={product} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid Layout (sm and above) */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {RelatedProducts.map((product) => {
          const stock = product.sizes.reduce(
            (sum, size) => sum + size.stock,
            0
          );
          return (
            <div key={product.id} className="relative">
              {stock === 0 && (
                <div
                  aria-hidden="true"
                  className="absolute top-2 right-2 z-20 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded"
                >
                  OUT OF STOCK
                </div>
              )}
              <ProductFeaturedCard key={product.id} product={product} />
            </div>
          );
        })}
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
