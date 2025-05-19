// pages/index.tsx
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import ProductCard from "../components/ProductCard";
import { getAllProducts, PRODUCTS_PER_PAGE } from "../services/productService";
import { Product } from "@/types";
import { useEffect } from "react";

type Props = {
  products: Product[];
  total: number;
  currentPage: number;
};

export default function Home({ products, total, currentPage }: Props) {
  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <>
      <Head>
        <title>DTwears</title>
        <meta name="description" content="Shop premium sneakers online" />
      </Head>

      <main className="container mx-auto md:px-16 px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Collections</h1>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Pagination Buttons */}
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-10 space-x-2 flex-wrap">
            {/* Prev Button */}
            <Link href={`/?page=${currentPage - 1}`} scroll={false}>
              <button
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white text-black border-gray-400"
                }`}
              >
                Prev
              </button>
            </Link>

            {/* Numbered Page Buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link key={page} href={`/?page=${page}`} scroll={false}>
                <button
                  className={`px-4 py-2 border rounded ${
                    page === currentPage
                      ? "bg-black text-white"
                      : "bg-white text-black border-gray-400"
                  }`}
                >
                  {page}
                </button>
              </Link>
            ))}

            {/* Next Button */}
            <Link href={`/?page=${currentPage + 1}`} scroll={false}>
              <button
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white text-black border-gray-400"
                }`}
              >
                Next
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
