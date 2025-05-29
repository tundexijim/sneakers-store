import Head from "next/head";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import Link from "next/link";
import { useIsClient } from "@/hooks/useIsClient";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import RandomProducts from "@/components/RandomProducts";

export default function CartPage() {
  const { cart, updateQty, removeFromCart, total } = useCart();
  const isClient = useIsClient();
  const [removedItems, setRemovedItems] = useState<string[]>([]);
  const uniqueProductIds = Array.from(new Set(cart.map((item) => item.id)));

  useEffect(() => {
    if (!isClient) return;

    const newMessages: string[] = [];

    cart.forEach((item) => {
      const stock =
        item.sizes?.find((s) => s.size === item.selectedSize)?.stock ?? 0;
      if (item.qty > stock) {
        updateQty(item.id, item.selectedSize, stock);
        newMessages.push(
          `"${item.name}" (size ${item.selectedSize}) quantity reduced to available stock (${stock}).`
        );
      }
    });

    if (newMessages.length > 0) {
      setRemovedItems(newMessages);

      setTimeout(() => {
        setRemovedItems([]);
      }, 5000);
    }
  }, [isClient, cart, updateQty]);

  if (!isClient) return null;
  return (
    <>
      <Head>
        <title>Cart | DTwears</title>
        <meta name="description" content="Your shopping cart" />
      </Head>

      <main className="container mx-auto md:px-16 px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
        <p className="text-gray-500 mb-4">{cart.length} item(s) in your cart</p>
        {removedItems.length > 0 && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
            {removedItems.map((msg, i) => (
              <p key={i}>{msg}</p>
            ))}
          </div>
        )}
        {cart.length === 0 ? (
          <p className="text-gray-600">
            Your cart is empty.{" "}
            <Link href="/productslist" className="text-blue-500 underline">
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
        <RandomProducts excludeIds={uniqueProductIds} />
      </main>
    </>
  );
}
