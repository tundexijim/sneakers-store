import Head from "next/head";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import Link from "next/link";
import { useIsClient } from "@/hooks/useIsClient";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Minus, Plus, Trash2 } from "lucide-react";
import { fetchProductsByIds } from "@/services/productService";
import FeaturedProducts from "@/components/FeaturedProducts";
import WhatsAppFloatingButton from "@/components/WhatsApp";

export default function CartPage() {
  const { cart, updateQty, removeFromCart, total, setCart } = useCart();
  const isClient = useIsClient();
  const [removedItems, setRemovedItems] = useState<string[]>([]);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(price);
  };

  const cartIds = useMemo(
    () => cart?.map((item) => item.id).join(",") || "",
    [cart]
  );

  useEffect(() => {
    const refreshCart = async () => {
      const ids = [...new Set(cart.map((item) => item.id))];
      if (!ids.length) return;

      const products = await fetchProductsByIds(ids);

      const updatedCart = cart
        .filter((item) => {
          const product = products.find((p) => p.id === item.id);
          if (!product) {
            removeFromCart(item.id, item.selectedSize);
            return false; // Remove from array
          }
          return true; // Keep in array
        })
        .map((item) => {
          const product = products.find((p) => p.id === item.id);
          const sizeData = product?.sizes?.find(
            (s) => s.size === item.selectedSize
          );
          return {
            ...item,
            price: product?.price ?? item.price,
            image: product?.image ?? item.image,
            name: product?.name ?? item.name,
            description: product?.description ?? item.description,
            sizes: product?.sizes ?? item.sizes,
            stock: sizeData?.stock ?? 0,
            slug: product?.slug ?? item.slug,
          };
        });

      setCart(updatedCart);
    };

    refreshCart();
  }, [cartIds]);

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
    }
    setTimeout(() => {
      setRemovedItems([]);
    }, 2000);
  }, [isClient, cart, updateQty]);

  if (!isClient) return null;
  return (
    <>
      <Head>
        <title>Cart | DTwears</title>
        <meta name="description" content="Your shopping cart" />
        <meta
          property="og:description"
          content="Shop premium sneakers online"
        />
        <meta
          property="og:image"
          content="https://www.dtwears.ng/images/sneakers.webp"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://dtwears.ng" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DTwears" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DTwears" />
        <meta
          name="twitter:description"
          content="Shop premium sneakers online"
        />
        <meta
          name="twitter:image"
          content="https://www.dtwears.ng/images/sneakers.jpg"
        />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="628" />
        <link rel="canonical" href="https://dtwears.ng" />
      </Head>

      <main className="container mx-auto md:px-16 px-4 py-8">
        {removedItems.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                {removedItems.map((msg, i) => (
                  <p key={i} className="text-yellow-800 text-sm">
                    {msg}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your cart is currently empty
            </h2>
            <p className="text-gray-600 mb-8">Add some items to get started</p>
            <Link href="/products">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Continue Shopping
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-6">
              {cart.map((item) => {
                const stock =
                  item.sizes.find((s) => s.size === item.selectedSize)?.stock ??
                  0;
                const displayQty = item.qty > stock ? stock : item.qty;

                const lowStock = stock > 0 && stock <= 3;

                if (item.qty === 0) {
                  removeFromCart(item.id, item.selectedSize);
                }

                return (
                  <div
                    key={`${item.id}-${item.selectedSize}`}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <Link
                          href={`/products/${item.slug}`}
                          className="relative"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {item.name}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                <span>Size: {item.selectedSize}</span>
                                {lowStock && (
                                  <>
                                    <span>•</span>
                                    <span className="text-orange-600 font-medium">
                                      Only {stock} left
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xl font-bold text-gray-900">
                                  {formatPrice(item.price)}
                                </span>
                              </div>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() =>
                                removeFromCart(item.id, item.selectedSize)
                              }
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-500" />
                            </button>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-2 mt-4">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-600">
                                Quantity:
                              </span>
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                  onClick={() =>
                                    updateQty(
                                      item.id,
                                      item.selectedSize,
                                      item.qty - 1
                                    )
                                  }
                                  disabled={item.qty <= 1}
                                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-2 text-center min-w-[3rem] border-x border-gray-300">
                                  {displayQty}
                                </span>
                                <button
                                  onClick={() => {
                                    updateQty(
                                      item.id,
                                      item.selectedSize,
                                      item.qty + 1
                                    );
                                  }}
                                  disabled={item.qty >= stock}
                                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                {formatPrice(item.price * displayQty)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-24">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Order Summary
                  </h2>

                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({cart.length} items)</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-lg font-semibold text-gray-900">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Link href="/checkout">
                    <button className="w-full bg-black hover:bg-gray-800 cursor-pointer text-white font-semibold py-4 px-6 rounded-lg transition-colors mb-4">
                      Proceed to Checkout
                    </button>
                  </Link>

                  <Link href="/products">
                    <button className="w-full border border-gray-300 cursor-pointer hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors">
                      Continue Shopping
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
        <div className="py-16 md:m-0 -m-4">
          <h2 className="text-3xl lg:text-4xl font-bold mb-8 mt-12 px-4 md:px-0">
            You Might Like
          </h2>
          <FeaturedProducts />
        </div>
        <div className="fixed bottom-6 right-6 z-40 transition-all duration-300 hover:scale-105">
          <WhatsAppFloatingButton
            phoneNumber="2348106758547"
            message="Hello! I am interested in your products. Kindly assist me."
            position="bottom-right"
            showTooltip={false}
          />
        </div>
      </main>
    </>
  );
}
