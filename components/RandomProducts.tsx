import { useEffect, useState } from "react";
import axios from "axios";
import ProductFeaturedCard from "./ProductFeaturedCard";
import { Product } from "@/types";
import { Loading } from "./Loading";

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
  }, [excludeIds]);

  if (loading)
    return (
      <div className="mt-10">
        <Loading />
      </div>
    );

  return (
    <section>
      {type ? (
        <div className="mb-12 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Featured Releases
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of the most coveted sneakers and
            jerseys.
          </p>
        </div>
      ) : (
        <h2 className="text-3xl lg:text-4xl font-bold mb-8 mt-12 px-4 md:px-0">
          You Might Like
        </h2>
      )}

      {/* Mobile Slider (sm and below) */}
      <div className="sm:hidden">
        <div className="px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 snap-x snap-mandatory w-max">
            {products.map((p) => (
              <div key={p.id} className="flex-none w-72 snap-start">
                <ProductFeaturedCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Layout (sm and above) */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
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
};

export default RandomProducts;
