import Head from "next/head";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
  //   const { cart, updateQty, removeFromCart, total } = useContext(CartContext);
  const { cart, updateQty, removeFromCart, total } = useCart();
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
        <title>Cart | Sneaker Store</title>
        <meta name="description" content="Your shopping cart" />
      </Head>

      <main className="container mx-auto px-16 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

        {cart.length === 0 ? (
          <p className="text-gray-600">
            Your cart is empty.{" "}
            <Link href="/" className="text-blue-500 underline">
              Go shopping
            </Link>
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-6">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b pb-4"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={100}
                    height={100}
                    className="rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    <p>${item.price}</p>
                    <div className="flex items-center mt-2 gap-2">
                      <button
                        className="px-2 py-1 bg-gray-200 rounded"
                        onClick={() =>
                          updateQty(item.id, item.selectedSize, item.qty - 1)
                        }
                        disabled={item.qty <= 1}
                      >
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button
                        className="px-2 py-1 bg-gray-200 rounded"
                        onClick={() =>
                          updateQty(item.id, item.selectedSize, item.qty + 1)
                        }
                      >
                        +
                      </button>
                      <button
                        className="ml-4 text-red-600 underline"
                        onClick={() =>
                          removeFromCart(item.id, item.selectedSize)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right font-semibold">
                    ${(item.price * item.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-right">
              <p className="text-xl font-bold mb-4">
                Subtotal: ${total.toFixed(2)}
              </p>
              <Link href="/checkout">
                <button className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800">
                  Proceed to Checkout
                </button>
              </Link>
            </div>
          </>
        )}
      </main>
    </>
  );
}
