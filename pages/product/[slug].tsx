import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { getProductBySlug } from "../../services/productService";
import { Product } from "../../types";
import { useCart } from "../../context/CartContext";
import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";
import RandomProducts from "@/components/RandomProducts";

export default function ProductPage({ product }: { product: Product }) {
  const { addToCart, cart } = useCart();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const isInCart = cart.some((item) => item.id === product.id);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const stock = product.sizes.reduce((sum, size) => sum + size.stock, 0);

  const handleAddToCart = () => {
    if (isLoading) return;
    setIsLoading(true);
    if (selectedSize === null) {
      setIsLoading(false);
      return alert("Please select a size");
    } else {
      setTimeout(() => {
        setIsLoading(false);
        addToCart({ ...product, qty: 1, selectedSize });
      }, 1000);
    }
  };

  return (
    <>
      <Head>
        <title>{`${product.name} | DTwears`}</title>
        <meta name="description" content={product.description} />
      </Head>

      <main className="container mx-auto md:px-16 px-4 py-8">
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
            {stock === 0 && <p className="text-red-500">Out Of Stock</p>}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Select Size:</h3>
              <div className="flex gap-2">
                {product.sizes.map((size, i) => (
                  <div className="relative" key={i}>
                    <button
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
                      <span className="absolute left-0.5 top-0 ">
                        <X color="#f40b0b" size={40} />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col">
              <button
                onClick={handleAddToCart}
                className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 w-fit cursor-pointer mt-4"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Adding...</span>
                  </div>
                ) : (
                  "Add to Cart"
                )}
              </button>
              {isInCart && (
                <Link href="/cart">
                  <button className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 cursor-pointer mt-4">
                    View Cart
                  </button>
                </Link>
              )}
            </div>
            <div className="mt-4">
              <Link href="/productslist" passHref>
                <button className="text-blue-600 underline hover:text-blue-800">
                  ← Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        </div>
        <RandomProducts excludeIds={[product.id]} />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { notFound: true };
  }

  return { props: { product } };
};
