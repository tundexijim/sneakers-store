import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { deleteProduct, getProductBySlug } from "../../services/productService";
import { Product } from "../../types";
import { useCart } from "../../context/CartContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  X,
  ArrowLeft,
  Shield,
  Truck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/router";
import { DeleteDialog, InfoDialog } from "@/components/DialogBox";
import ProductsRelatedCategory from "@/components/ProductsRelatedCategory";
import Faq from "@/components/FAQ";
import WhatsAppFloatingButton from "@/components/WhatsApp";

export default function ProductPage({
  product,
  fullUrl,
}: {
  product: Product;
  fullUrl: string;
}) {
  const { addToCart, cart } = useCart();
  const [selectedSize, setSelectedSize] = useState<number | string | null>(
    null
  );
  const isInCart = cart.some((item) => item.id === product.id);
  const { user } = useAuth();
  const [stockinsize, setstockInSize] = useState<number | null>(null);
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Gallery states
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const stock = product.sizes.reduce((sum, size) => sum + size.stock, 0);
  const router = useRouter();
  const eventId = "addtocart_" + Date.now();
  const eventIdView = "viewcontent_" + Date.now();

  // Convert single image to array or use existing images array
  const productImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image];

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

  const imagePaths = productImages.map((url) => getPathFromUrl(url));

  useEffect(() => {
    const productChange = () => {
      setSelectedSize(null);
      setstockInSize(null);
      setSelectedImageIndex(0);
    };

    productChange();
  }, [product.id]);
  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.fbq !== "undefined") {
      window.fbq(
        "track",
        "ViewContent",
        {
          content_ids: [product.slug],
          content_type: "product",
          value: product.price,
          currency: "NGN",
        },
        { eventID: eventIdView }
      );
    }
  }, [product.id]);

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
      if (typeof window.fbq !== "undefined") {
        window.fbq(
          "track",
          "AddToCart",
          {
            content_name: product.name,
            content_ids: [product.slug],
            content_type: "product",
            value: product.price,
            currency: "NGN",
          },
          { eventID: eventId }
        );
      }
    }
  };

  const handleSelectSize = (size: number | string, stock: number) => {
    setSelectedSize(size);
    setstockInSize(stock);
  };

  const handleDelete = (productId: string, imagePath: string[]) => {
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
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && selectedImageIndex < productImages.length - 1) {
      setSelectedImageIndex((prev) => prev + 1);
    }
    if (isRightSwipe && selectedImageIndex > 0) {
      setSelectedImageIndex((prev) => prev - 1);
    }
  };
  const handlePrevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1
    );
    setIsImageLoading(true);
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1
    );
    setIsImageLoading(true);
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageLoading(true);
  };
  return (
    <>
      <Head>
        <title>{`${product.name} | DTwears`}</title>
        <meta name="description" content={product.description} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              name: product.name,
              image: [product.image],
              description: product.description,
              sku: product.id,
              brand: {
                "@type": "Brand",
                name: "DTwears",
              },
              offers: {
                "@type": "Offer",
                priceCurrency: "NGN",
                price: product.price,
                availability: "https://schema.org/InStock",
                url: `https://dtwears.ng/products/${product.slug}`,
              },
            }),
          }}
        />
        <link
          rel="canonical"
          href={`https://dtwears.ng/products/${product.slug}`}
        />
      </Head>

      <main className=" bg-gradient-to-br from-gray-50 via-white to-gray-100 pb-8">
        {/* Navigation Bar */}
        <div className="container mx-auto px-4 md:px-16 my-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Shop</span>
          </Link>
        </div>

        {/* Main Product Section */}
        <div className="container mx-auto px-4 md:px-16 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Product Image Gallery Section */}
            <div className="space-y-4">
              {/* Mobile Slider View */}
              <div className="block md:hidden -mx-4">
                <div
                  className="relative aspect-square overflow-hidden"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {isImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    </div>
                  )}

                  {/* Mobile Image Slider */}
                  <div
                    className="flex transition-transform duration-300 ease-out h-full"
                    style={{
                      transform: `translateX(-${selectedImageIndex * 100}%)`,
                    }}
                  >
                    {productImages.map((image, index) => (
                      <div
                        key={index}
                        className="w-full h-full flex-shrink-0 relative"
                      >
                        <Image
                          src={image}
                          alt={`${product.name} - Image ${index + 1}`}
                          fill
                          priority={index === 0}
                          className="object-contain"
                          onLoad={() => setIsImageLoading(false)}
                        />
                      </div>
                    ))}
                  </div>
                  {/* Mobile Image Counter */}
                  {productImages.length > 1 && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full backdrop-blur-sm z-20">
                      {selectedImageIndex + 1} / {productImages.length}
                    </div>
                  )}

                  {/* Mobile Dot Indicators */}
                  {productImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                      {productImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handleThumbnailClick(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${
                            selectedImageIndex === index
                              ? "bg-white scale-125"
                              : "bg-white/50 hover:bg-white/75"
                          }`}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
                      <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg">
                        OUT OF STOCK
                      </div>
                    </div>
                  )}
                </div>
                {productImages.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mt-4 ml-4">
                    {productImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => handleThumbnailClick(index)}
                        className={`relative flex-shrink-0 w-16 h-16 overflow-hidden border-2 transition-all duration-200 ${
                          selectedImageIndex === index
                            ? "border-black shadow-lg scale-110"
                            : "border-gray-200 hover:border-gray-400 hover:shadow-md"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          fill
                          className="object-contain"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Desktop Gallery View */}
              <div className="hidden md:block">
                {/* Main Image Display */}
                <div className="relative">
                  <div className="relative aspect-square overflow-hidden group">
                    {isImageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                      </div>
                    )}
                    <Image
                      src={productImages[selectedImageIndex]}
                      alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                      fill
                      priority={selectedImageIndex === 0}
                      className="object-contain group-hover:scale-105 transition-transform duration-700 w-full"
                      onLoad={() => setIsImageLoading(false)}
                    />

                    {/* Desktop Navigation Arrows */}
                    {productImages.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm z-20"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm z-20"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}

                    {/* Desktop Image Counter */}
                    {productImages.length > 1 && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full backdrop-blur-sm z-20">
                        {selectedImageIndex + 1} / {productImages.length}
                      </div>
                    )}

                    {stock === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
                        <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg">
                          OUT OF STOCK
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop Thumbnail Gallery */}
                {productImages.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mt-4">
                    {productImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => handleThumbnailClick(index)}
                        className={`relative flex-shrink-0 w-20 h-20 overflow-hidden border-2 transition-all duration-200 ${
                          selectedImageIndex === index
                            ? "border-black shadow-lg scale-110"
                            : "border-gray-200 hover:border-gray-400 hover:shadow-md"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          fill
                          className="object-contain"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info Section */}
            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-4">
                <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="text-xl font-semibold bg-gradient-to-r text-gray-600 bg-clip-text">
                    {formatPrice(product.price)}
                  </div>
                  {stock > 0 && (
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      In Stock
                    </div>
                  )}
                </div>
              </div>

              {/* Stock Info */}
              {stockinsize && (
                <p className="text-amber-800 font-medium">
                  Only {stockinsize} left of this size!
                </p>
              )}

              {/* Size Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl  text-gray-900">Select Size:</h3>
                </div>
                <div className="flex gap-2">
                  {product.sizes
                    .sort((a: any, b: any) => a.size - b.size)
                    .map((size, i) => (
                      <div className="relative" key={i}>
                        <button
                          onClick={() =>
                            handleSelectSize(size.size, size.stock)
                          }
                          disabled={size.stock === 0}
                          className={`p-2 border-2 font-semibold text-lg transition-all duration-300 relative overflow-hidden ${
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
                    <button className="w-full h-14 bg-[#00c8c8] text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                      View Cart & Checkout
                    </button>
                  </Link>
                )}
              </div>

              {product.description !== "" && (
                <div className="border-t border-gray-200 bg-white md:px-0 px-2 py-4 mb-0">
                  <h1 className="text-xl font-bold">DESCRIPTION</h1>
                  <div className="font-mono text-gray-700 mt-2 whitespace-pre-wrap">
                    {product.description}
                  </div>
                </div>
              )}

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
                      On orders over ₦100,000
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
              {user?.email === process.env.NEXT_PUBLIC_EMAIL && (
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
        <div className="border-t border-gray-200 bg-white md:px-16 py-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-8 px-4 md:px-0">
            You Might Like
          </h2>
          <ProductsRelatedCategory
            key={product.id}
            categoryName={product.categorySlug}
            excludeProductId={product.id}
          />
        </div>
        <div className="flex flex-col gap-8 md:px-16 px-4">
          <div>
            <h1 className="text-center mb-4 text-3xl">FAQs</h1>
            <p className="text-center">Have a question? We are here to help</p>
          </div>
          <div className="border-t border-gray-200">
            {[
              {
                header: "What payment methods do you accept?",
                body: `We accept the following payment methods: 
- Credit/Debit Card: VISA/MASTERCARD powered by Paystack
- Bank Transfer
- Cash on delivery`,
              },
              {
                header: "Do you offer same day delivery within Lagos?",
                body: "Yes we do! However, your order must be placed and confirmed before 10am to be eligible for same day delivery.\nDelivery timeframe is between 10:30am - 6:30pm",
              },
              {
                header: "Do you ship nationwide?",
                body: "We offer nationwide express shipping on all orders.  You'll receive your order in an estimated 1–4 days after shipment. However, Doorstep delivery sometimes takes longer. We ship all orders within 1-2 business days!. Delivery takes 1-4 business days outside Lagos.",
              },
              {
                header: "Do you offer Pay on Delivery?",
                body: "Yes, we do offer pay on delivery nationwide. You can select this option at checkout and pay in cash or bank transfer when your order is delivered to you.",
              },
            ].map(({ header, body }) => (
              <Faq key={header} header={header} body={body} />
            ))}
          </div>
        </div>
        <div className="fixed bottom-6 right-6 z-40 transition-all duration-300 hover:scale-105">
          <WhatsAppFloatingButton
            message={`Hi! I am interested in this product ${fullUrl} from dtwears. Kindly assist me.`}
            position="bottom-right"
            showTooltip={false}
          />
        </div>

        {/* Dialogs */}
        <DeleteDialog
          isOpen={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
          imagePath={imagePaths}
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

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const slug = params?.slug as string;
  const product = await getProductBySlug(slug);
  const cleanFacebookParams = (url: string) => {
    const removeParams = [
      "fbclid",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "ref",
      "gclid",
    ];
    const parsed = new URL(url);
    removeParams.forEach((param) => {
      if (parsed.searchParams.has(param)) {
        parsed.searchParams.delete(param);
      }
    });
    return (
      parsed.origin +
      parsed.pathname +
      (parsed.search ? "?" + parsed.searchParams.toString() : "")
    );
  };
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["host"];
  let path = req.url;
  if (path?.startsWith("/_next/data")) {
    const parts = path.split("/");
    parts.splice(1, 3);
    path = parts.join("/").replace(".json", "");
  }
  const dirtyUrl = `${protocol}://${host}${path}`;
  const fullUrl = cleanFacebookParams(dirtyUrl);
  if (!product) {
    return { notFound: true };
  }
  return { props: { product, fullUrl } };
};
