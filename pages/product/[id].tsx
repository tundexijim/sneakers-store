import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { getProductById } from "../../services/productService";
import { Product } from "../../types";
import { useCart } from "../../context/CartContext";
import Link from "next/link";
import { useState } from "react";

export default function ProductPage({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<number>(0);

  const handleAddToCart = () => {
    if (selectedSize === 0) return alert("Please select a size");
    addToCart({ ...product, qty: 1, selectedSize });
  };

  return (
    <>
      <Head>
        <title>{product.name} | DTwears</title>
        <meta name="description" content={product.description} />
      </Head>

      <main className="container mx-auto px-16 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <Image
              src={product.image}
              alt={product.name}
              width={600}
              height={600}
              className="rounded-xl object-contain"
            />
          </div>
          <div className="w-full md:w-1/2">
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-gray-600 mb-6">{product.description}</p>
            <div className="text-2xl font-semibold mb-4">${product.price}</div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Select Size:</h3>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <div className="relative">
                    <button
                      key={size.size}
                      onClick={() => setSelectedSize(size.size)}
                      disabled={size.stock === 0}
                      className={`px-4 py-2 border rounded ${
                        selectedSize === size.size
                          ? "bg-black text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      {size.size}
                    </button>
                    {size.stock === 0 && (
                      <span className="10 text-red-500 font-bold absolute left-[40%] top-[20%]">
                        &times;
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 cursor-pointer mt-4"
            >
              Add to Cart
            </button>
            <div className="mt-4">
              <Link href="/" passHref>
                <button className="text-blue-600 underline hover:text-blue-800">
                  ← Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  const product = await getProductById(id);

  if (!product) {
    return { notFound: true };
  }

  return { props: { product } };
};
