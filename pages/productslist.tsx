// pages/index.tsx
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import ProductCard from "../components/ProductCard";
import { getAllProducts, PRODUCTS_PER_PAGE } from "../services/productService";
import { Product } from "@/types";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Grid, List } from "lucide-react";
import ProductListPanel from "@/components/ProductListPanel";

type Props = {
  products: Product[];
  total: number;
  currentPage: number;
};

export default function ProductsList({ products, total, currentPage }: Props) {
  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <>
      <Head>
        <title>Sneakers | DTwears</title>
        <meta name="description" content="Shop premium sneakers online" />
      </Head>

      <main className="container mx-auto md:px-16 px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Sneakers</h1>
        <ProductListPanel viewMode={viewMode} setViewMode={setViewMode} />
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

        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-10 flex-wrap space-x-2">
            <Link href={`/productslist?page=${currentPage - 1}`} scroll={false}>
              <button
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm cursor-pointer ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-black hover:underline"
                }`}
              >
                <ChevronLeft />
              </button>
            </Link>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/productslist?page=${page}`}
                scroll={false}
              >
                <button className="relative px-2 py-1 text-sm cursor-pointer">
                  <span
                    className={`${
                      page === currentPage
                        ? "after:content-[''] after:absolute after:left-[-2] after:h-[2px] after:w-3 after:bg-black after:bottom-[-2]"
                        : ""
                    } relative`}
                  >
                    {page}
                  </span>
                </button>
              </Link>
            ))}
            <Link href={`/productslist?page=${currentPage + 1}`} scroll={false}>
              <button
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm cursor-pointer ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-black hover:underline"
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
  const { products, total } = await getAllProducts(page);

  return {
    props: {
      products,
      total,
      currentPage: page,
    },
  };
};
