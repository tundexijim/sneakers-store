import Head from "next/head";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import Link from "next/link";
import { useIsClient } from "@/hooks/useIsClient";
import toast from "react-hot-toast";
import { useEffect } from "react";

export default function CartPage() {
  const { cart, updateQty, removeFromCart, total } = useCart();
  const isClient = useIsClient();
  useEffect(() => {
    if (!isClient) return;
    cart.forEach((item) => {
      const stock =
        item.sizes.find((s) => s.size === item.selectedSize)?.stock ?? 0;
      if (item.qty > stock) {
        updateQty(item.id, item.selectedSize, stock);
        toast(
          `"${item.name}" (size ${item.selectedSize}) quantity reduced to available stock (${stock}).`,
          {
            icon: "⚠️",
            duration: 5000,
          }
        );
      }
    });
  }, [isClient, cart, updateQty]);
  if (!isClient) return null;

  // const outOfStockItems = cart.filter((item) => {
  //   const stock =
  //     item.sizes.find((s) => s.size === item.selectedSize)?.stock ?? 0;
  //   return item.qty > stock;
  // });

  return (
    <>
      <Head>
        <title>Cart | DTwears</title>
        <meta name="description" content="Your shopping cart" />
      </Head>

      <main className="container mx-auto md:px-16 px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
        <p className="text-gray-500 mb-4">{cart.length} item(s) in your cart</p>

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
              {cart.map((item) => {
                const stock =
                  item.sizes.find((s) => s.size === item.selectedSize)?.stock ??
                  0;
                const displayQty = item.qty > stock ? stock : item.qty;

                return (
                  <div
                    key={`${item.id}-${item.selectedSize}`}
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
                      <p>Size: {item.selectedSize}</p>
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
                        <span>{displayQty}</span>
                        <button
                          className={`px-2 py-1 rounded ${
                            item.qty >= stock
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-gray-200"
                          }`}
                          onClick={() => {
                            if (item.qty >= stock) {
                              toast.error("Stock limit reached for this size.");
                            } else {
                              updateQty(
                                item.id,
                                item.selectedSize,
                                item.qty + 1
                              );
                            }
                          }}
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
                      ${(item.price * displayQty).toFixed(2)}
                    </div>
                  </div>
                );
              })}
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
