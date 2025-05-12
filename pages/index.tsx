import { GetServerSideProps } from "next";
import Head from "next/head";
import ProductCard from "../components/ProductCard";
import { getAllProducts } from "../services/productService";
import { Product } from "@/types";

export default function Home({ products }: { products: Product[] }) {
  return (
    <>
      <Head>
        <title>Sneaker Store</title>
        <meta name="description" content="Shop premium sneakers online" />
      </Head>

      <main className="container mx-auto px-16 py-8">
        <h1 className="text-3xl font-bold mb-6">Sneaker Collection</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
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
