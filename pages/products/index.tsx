import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import ProductCard from "@/components/cards/ProductCard";
import { getAllProducts, PRODUCTS_PER_PAGE } from "@/services/productService";
import { Product } from "@/types";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductListPanel from "@/components/ProductListPanel";
import { useRouter } from "next/router";
import { LoadingOverlay } from "@/components/Loading";
import CategoryBadge from "@/components/Categorybadge";
import WhatsAppFloatingButton from "@/components/WhatsApp";

type Props = {
  products: Product[];
  total: number;
  currentPage: number;
  sortBy: string;
  error: string;
};

export default function ProductsList({
  products,
  total,
  currentPage,
  sortBy,
  error,
}: Props) {
  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedSort, setSelectedSort] = useState(sortBy);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleRouteChangeStart = () => setIsLoading(true);
    const handleRouteChangeComplete = () => setIsLoading(false);
    const handleRouteChangeError = () => setIsLoading(false);

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeError);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeError);
    };
  }, [router]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSort(e.target.value);
    router.push({
      pathname: "/products",
      query: { ...router.query, sortBy: e.target.value, page: 1 },
    });
  };

  const getPaginationNumbers = () => {
    const pages = [];
    const showPages = 5;
    if (totalPages <= showPages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - Math.floor(showPages / 2));
      let end = Math.min(
        totalPages - 1,
        currentPage + Math.floor(showPages / 2)
      );
      if (start > 2) {
        pages.push("...");
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < totalPages - 1) {
        pages.push("...");
      }
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };
  const paginationNumbers = getPaginationNumbers();
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[500px] px-4">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-500 text-lg font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sneakers | DTwears</title>
        <meta name="description" content="Shop premium sneakers online" />
        <meta
          property="og:description"
          content="Shop premium sneakers online"
        />
        <meta
          property="og:image"
          content="https://www.dtwears.ng/images/sneakers.webp"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://dtwears.ng" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DTwears" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DTwears" />
        <meta
          name="twitter:description"
          content="Shop premium sneakers online"
        />
        <meta
          name="twitter:image"
          content="https://www.dtwears.ng/images/sneakers.jpg"
        />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="628" />
        <link rel="canonical" href="https://dtwears.ng" />
      </Head>

      <main className="container mx-auto md:px-16 px-2 pb-8">
        <CategoryBadge category="Shop" />{" "}
        <ProductListPanel
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedSort={selectedSort}
          onSortChange={handleSortChange}
        />
        <LoadingOverlay isLoading={isLoading}>
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6 gap-y-10"
                : "space-y-4"
            }
          >
            {products.map((product) => {
              // calculate total stock for this product
              const stock = product.sizes.reduce(
                (sum, size) => sum + size.stock,
                0
              );

              return (
                <div key={product.id} className="relative">
                  {/* Out of stock badge */}
                  {stock === 0 && (
                    <div
                      aria-hidden="true"
                      className="absolute top-2 right-2 z-20 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded"
                    >
                      OUT OF STOCK
                    </div>
                  )}

                  <ProductCard
                    product={product}
                    isListView={viewMode === "list"}
                  />
                  {product.oldPrice !== 0 && (
                    <div
                      aria-hidden="true"
                      className="absolute top-2 left-2 z-20 bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded"
                    >
                      SALES
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </LoadingOverlay>
        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-10 space-x-2 flex-wrap">
            <Link
              href={{
                pathname: "/products",
                query: {
                  page: Math.max(1, currentPage - 1),
                  sortBy: router.query.sortBy || "newest",
                },
              }}
              scroll={false}
            >
              <button
                disabled={currentPage === 1}
                className={`p-2 border rounded cursor-pointer ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white text-black border-gray-400 hover:bg-gray-50"
                }`}
              >
                <ChevronLeft />
              </button>
            </Link>
            {paginationNumbers.map((page, index) => (
              <div key={index}>
                {page === "..." ? (
                  <span className="px-3 py-2 text-gray-500">...</span>
                ) : (
                  <Link
                    href={{
                      pathname: "/products",
                      query: {
                        page: page,
                        sortBy: router.query.sortBy || "newest",
                      },
                    }}
                    scroll={false}
                  >
                    <button
                      className={`p-2 border rounded cursor-pointer min-w-[40px] ${
                        page === currentPage
                          ? "bg-black text-white"
                          : "bg-white text-black border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  </Link>
                )}
              </div>
            ))}
            <Link
              href={{
                pathname: "/products",
                query: {
                  page: Math.min(totalPages, currentPage + 1),
                  sortBy: router.query.sortBy || "newest",
                },
              }}
              scroll={false}
            >
              <button
                disabled={currentPage === totalPages}
                className={`p-2 border rounded cursor-pointer ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white text-black border-gray-400 hover:bg-gray-50"
                }`}
              >
                <ChevronRight />
              </button>
            </Link>
          </div>
        )}
        <div className="text-center mt-4 text-sm text-gray-600">
          Showing {(currentPage - 1) * PRODUCTS_PER_PAGE + 1} to{" "}
          {Math.min(currentPage * PRODUCTS_PER_PAGE, total)} of {total}
        </div>
        <div className="fixed bottom-6 right-6 z-40 transition-all duration-300 hover:scale-105">
          <WhatsAppFloatingButton
            message="Hello! I am interested in your products. Kindly assist me."
            position="bottom-right"
            showTooltip={false}
          />
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const page = parseInt(context.query.page as string) || 1;
  const sortBy = (context.query.sortBy as string) || "newest";
  try {
    const { products, total } = await getAllProducts(page, sortBy);
    return {
      props: {
        products,
        total,
        currentPage: page,
        sortBy,
      },
    };
  } catch (error: any) {
    return {
      props: { error: error.message },
    };
  }
};
