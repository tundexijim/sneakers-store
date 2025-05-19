import { GetServerSideProps } from "next";
import Head from "next/head";
import ProductCard from "../components/ProductCard";
import { getAllProducts } from "../services/productService";
import { Product } from "@/types";
import { useEffect, useState } from "react";

export default function Home({ products }: { products: Product[] }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Render a loading state or skeleton until client-side
  if (!isClient) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        <p>Loading...</p>
      </main>
    );
  }
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
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const products = await getAllProducts();
  return { props: { products } };
};
