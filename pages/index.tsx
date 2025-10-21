import React from "react";
import { ArrowRight, Star, Zap, Truck } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { getAllCategories } from "@/services/categoriesService";
import Image from "next/image";
import { GetServerSideProps } from "next";
import { Category } from "@/types";
import FeaturedProducts from "@/components/FeaturedProducts";

type Props = {
  categories: Category[];
  error?: string;
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(price);
};

const SneakersHomepage = ({ categories, error }: Props) => {
  // Handle error state
  if (error) {
    console.error("Error loading categories:", error);
    // You can show a fallback UI or use empty array
    const fallbackCategories: Category[] = [];
    return <SneakersHomepageContent categories={fallbackCategories} />;
  }

  return <SneakersHomepageContent categories={categories} />;
};

const SneakersHomepageContent = ({
  categories,
}: {
  categories: Category[];
}) => {
  return (
    <>
      <Head>
        <title>DTwears - Premium Sneakers & NFL Jerseys</title>
        <meta
          name="description"
          content="Shop premium sneakers and NFL jerseys online at DTwears. Discover the latest collections to elevate your style and performance."
        />
        <meta
          property="og:title"
          content="DTwears - Premium Sneakers & Jerseys"
        />
        <meta
          property="og:description"
          content="Shop premium sneakers and jerseys online at DTwears"
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
        <meta
          name="twitter:title"
          content="DTwears - Premium Sneakers & Jerseys"
        />
        <meta
          name="twitter:description"
          content="Shop premium sneakers and jerseys online at DTwears"
        />
        <meta
          name="twitter:image"
          content="https://www.dtwears.ng/images/heroimage.jpg"
        />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="628" />
        <script
          type="application/id+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "DTwears",
              url: "https://dtwears.ng",
              logo: "https://dtwears.ng/logo2.png",
            }),
          }}
        />
        <link rel="canonical" href="https://dtwears.ng" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section
          className="relative min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden px-2 md:px-16"
          style={{
            backgroundImage: "url('./images/banner3.jpg')",
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Gradient overlay for extra depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-transparent to-slate-900/40"></div>

          <div className="relative container mx-auto px-4 py-16 lg:py-24 min-h-screen flex items-center">
            <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
              <div className="text-white space-y-6">
                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>New Collection Available</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Step Up Your{" "}
                  <span className="block bg-gradient-to-r from-blue-600 to-blue-900 bg-clip-text text-transparent">
                    Game
                  </span>
                </h1>
                <p className="text-xl text-gray-300 max-w-lg">
                  Discover the latest jerseys and sneakers to elevate your style
                  and performance.
                </p>
                <Link href="/products">
                  <button className="bg-[#00C8C8] text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center space-x-2 group cursor-pointer">
                    <span>Shop Now</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>

              {/* Visual element on the right side */}
              <div className="relative w-full h-96 lg:block hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
                <div className="relative w-full h-96 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 flex items-center justify-center">
                  <div className="text-center text-white/70">
                    <h3 className="text-2xl font-bold mb-2">
                      Premium Collection
                    </h3>
                    <p className="text-sm">Curated just for you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50 px-2 md:px-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Free Shipping</h3>
                <p className="text-gray-600">
                  Free delivery on orders over {formatPrice(100000)}. Fast and
                  reliable shipping nationwide.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold">Premium Quality</h3>
                <p className="text-gray-600">
                  Carefully curated selection of the finest sneakers and
                  jerseys.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 md:px-16">
          <div className="mb-12 text-center px-2">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Featured Releases
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of the most coveted sneakers and
              jerseys.
            </p>
          </div>
          <FeaturedProducts />
          <div className="text-center mt-4">
            <Link href="/products">
              <button className="bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors duration-300 inline-flex items-center space-x-2 cursor-pointer">
                <span>View All Products</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 px-2 md:px-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Shop by Category
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Find the perfect sneakers and jerseys for every activity and
                lifestyle. From performance to fashion.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <Link
                    key={category.id || index}
                    href={`collections/${category.name}`}
                  >
                    <div className="relative group w-full h-80 cursor-pointer overflow-hidden rounded-xl">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold mb-1">
                          {category.name.charAt(0).toLocaleUpperCase() +
                            category.name.slice(1).toLocaleLowerCase()}
                        </h3>
                      </div>
                      <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/20 transition-colors duration-300"></div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-400">
                    No categories available at the moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-700">
                Ready to Find Your Perfect Wears?
              </h2>
              <Link href="/products">
                <button className="bg-black text-white px-8 py-4 rounded-full cursor-pointer font-semibold hover:bg-gray-800 transition-all duration-300 inline-flex items-center justify-center space-x-2 group">
                  <span>Start Shopping</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SneakersHomepage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const categories = await getAllCategories();

    return {
      props: {
        categories,
      },
    };
  } catch (error: any) {
    console.error("Error in getServerSideProps:", error);

    // Return empty categories array instead of just error
    return {
      props: {
        categories: [],
        error: error.message || "Failed to load categories",
      },
    };
  }
};
