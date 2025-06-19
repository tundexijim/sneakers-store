import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { deleteProduct, getProductBySlug } from "../../services/productService";
import { Product } from "../../types";
import { useCart } from "../../context/CartContext";
import Link from "next/link";
import { useState } from "react";
import { X, ArrowLeft, Shield, Truck, RefreshCw, Heart } from "lucide-react";
import RandomProducts from "@/components/RandomProducts";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/router";
import { DeleteDialog, InfoDialog } from "@/components/DialogBox";

export default function ProductPage({ product }: { product: Product }) {
  const { addToCart, cart } = useCart();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const isInCart = cart.some((item) => item.id === product.id);
  const { user } = useAuth();
  const [stockinsize, setstockInSize] = useState<number | null>(null);
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const stock = product.sizes.reduce((sum, size) => sum + size.stock, 0);
  const router = useRouter();

  const formatPrice = (price: number) =>
    `₦${price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getPathFromUrl = (url: string) => {
    const decodedUrl = decodeURIComponent(url);
    const pathStart = decodedUrl.indexOf("/o/") + 3;
    const pathEnd = decodedUrl.indexOf("?alt=");
    return decodedUrl.substring(pathStart, pathEnd);
  };

  const imagePath = getPathFromUrl(product.image);

  const handleAddToCart = () => {
    if (isLoading) return;
    setIsLoading(true);
    if (selectedSize === null) {
      setIsLoading(false);
      setShowInfo(true);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        addToCart({ ...product, qty: 1, selectedSize });
      }, 1000);
    }
  };

  const handleSelectSize = (size: number, stock: number) => {
    setSelectedSize(size);
    setstockInSize(stock);
  };

  const handleDelete = (productId: string, imagePath: string) => {
    deleteProduct(productId, imagePath)
      .then(() => {
        router.replace("/productslist");
        setShowDelete(false);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to delete the product. Please try again.");
        setShowDelete(false);
      });
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <>
      <Head>
        <title>{`${product.name} | DTwears`}</title>
        <meta name="description" content={product.description} />
      </Head>

      <main className="min-h-screen bg-gradient-to-br  from-gray-50 via-white to-gray-100">
        {/* Navigation Bar */}
        <div className="container mx-auto px-4 md:px-16 py-6">
          <Link
            href="/productslist"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Shop</span>
          </Link>
        </div>

        {/* Main Product Section */}
        <div className="container mx-auto px-4 md:px-16 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Product Image Section */}
            <div className="relative">
              <div className="relative aspect-square bg-white rounded-3xl shadow-2xl overflow-hidden group">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {stock === 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg">
                      OUT OF STOCK
                    </div>
                  </div>
                )}

                {/* Wishlist Button */}
              </div>
            </div>

            {/* Product Info Section */}
            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {formatPrice(product.price)}
                  </div>
                  {stock > 0 && (
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      In Stock
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Stock Info */}
              {stockinsize && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-amber-800 font-medium">
                    ⚡ Only {stockinsize} left in this size!
                  </p>
                </div>
              )}

              {/* Size Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    Select Size
                  </h3>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {product.sizes.map((size, i) => (
                    <div className="relative" key={i}>
                      <button
                        onClick={() => handleSelectSize(size.size, size.stock)}
                        disabled={size.stock === 0}
                        className={`w-full h-14 border-2 rounded-xl font-bold text-lg transition-all duration-300 relative overflow-hidden ${
                          selectedSize === size.size
                            ? "bg-black text-white border-black shadow-lg scale-105"
                            : size.stock === 0
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            : "bg-white text-gray-900 border-gray-300 hover:border-black hover:shadow-md hover:scale-105"
                        }`}
                      >
                        {size.size}
                        {size.stock === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <X
                              className="w-8 h-8 text-red-500"
                              strokeWidth={3}
                            />
                          </div>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={stock === 0 || isLoading}
                  className="w-full h-16 bg-gradient-to-r from-black to-gray-800 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Adding to Cart...</span>
                    </div>
                  ) : stock === 0 ? (
                    "Out of Stock"
                  ) : (
                    "Add to Cart"
                  )}
                </button>

                {isInCart && (
                  <Link href="/cart" className="block">
                    <button className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                      View Cart & Checkout
                    </button>
                  </Link>
                )}
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Free Shipping
                    </div>
                    <div className="text-sm text-gray-600">
                      On orders over ₦75,000
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Secure Payment
                    </div>
                    <div className="text-sm text-gray-600">
                      100% secure checkout
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              {user?.email === "ijimakindetunde@gmail.com" && (
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowDelete(true)}
                    className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
                  >
                    Delete Product
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/admin/add-product?product=${product.slug}`)
                    }
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                  >
                    Update Product
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 md:px-16">
            <RandomProducts excludeIds={[product.id]} />
          </div>
        </div>

        {/* Dialogs */}
        <DeleteDialog
          isOpen={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
          imagePath={imagePath}
          productId={product.id}
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
        />

        <InfoDialog
          isOpen={showInfo}
          onClose={() => setShowInfo(false)}
          title="Size Required"
          message="Please select a size before adding to cart."
        />
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
