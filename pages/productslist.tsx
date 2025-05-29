// pages/index.tsx
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import ProductCard from "../components/ProductCard";
import { getAllProducts, PRODUCTS_PER_PAGE } from "../services/productService";
import { Product } from "@/types";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductListPanel from "@/components/ProductListPanel";
import { useRouter } from "next/router";

type Props = {
  products: Product[];
  total: number;
  currentPage: number;
  sortBy: string;
};

export default function ProductsList({
  products,
  total,
  currentPage,
  sortBy,
}: Props) {
  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedSort, setSelectedSort] = useState(sortBy);
  const router = useRouter();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    setSelectedSort(newSort);
    router.push({
      pathname: "/productslist",
      query: { ...router.query, sortBy: newSort },
    });
  };

  return (
    <>
      <Head>
        <title>Sneakers | DTwears</title>
        <meta name="description" content="Shop premium sneakers online" />
      </Head>

      <main className="container mx-auto md:px-16 px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Sneakers</h1>
        <ProductListPanel
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedSort={selectedSort}
          onSortChange={handleSortChange}
        />
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-20"
              : "space-y-4"
          }
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isListView={viewMode === "list"}
            />
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-10 space-x-2 flex-wrap">
            {/* Prev Button */}
            <Link
              href={{
                pathname: "/productslist",
                query: {
                  page: currentPage - 1,
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
                    : "bg-white text-black border-gray-400"
                }`}
              >
                <ChevronLeft />
              </button>
            </Link>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={{
                  pathname: "/productslist",
                  query: {
                    page: page,
                    sortBy: router.query.sortBy || "newest",
                  },
                }}
                scroll={false}
              >
                <button
                  className={`p-2 border rounded cursor-pointer ${
                    page === currentPage
                      ? "bg-black text-white"
                      : "bg-white text-black border-gray-400"
                  }`}
                >
                  {page}
                </button>
              </Link>
            ))}

            <Link
              href={{
                pathname: "/productslist",
                query: {
                  page: currentPage + 1,
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
                    : "bg-white text-black border-gray-400"
                }`}
              >
                <ChevronRight />
              </button>
            </Link>
          </div>
        )}
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const page = parseInt(context.query.page as string) || 1;
  const sortBy = (context.query.sortBy as string) || "newest";
  const { products, total } = await getAllProducts(page, sortBy);

  return {
    props: {
      products,
      total,
      currentPage: page,
      sortBy,
    },
  };
};
