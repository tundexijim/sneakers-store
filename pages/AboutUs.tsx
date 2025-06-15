import Link from "next/link";
import React from "react";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-20 p-16 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
          <h1 className="text-6xl sm:text-7xl font-black text-white mb-6 drop-shadow-lg animate-pulse">
            DTwears
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 font-light">
            Where Style Meets Street Culture
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 relative">
              Our Story
              <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              DTwears was born from a passion for authentic street culture and
              the belief that the right pair of sneakers can transform not just
              your look, but your entire day. Founded by sneaker enthusiasts who
              understand that every step tells a story, we've built more than
              just a store – we've created a community.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              From our humble beginnings as a small local retailer to becoming a
              trusted destination for sneakerheads worldwide, we've never
              forgotten our roots: genuine passion, authentic products, and
              treating every customer like family.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 relative">
              Our Mission
              <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              We're on a mission to make premium sneakers accessible to everyone
              who shares our love for authentic street style. Every pair we
              curate tells a story of craftsmanship, innovation, and cultural
              significance.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Whether you're stepping into your first pair of premium sneakers
              or you're a seasoned collector adding to your rotation, we're here
              to ensure you find exactly what speaks to your style and soul.
            </p>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm p-12 rounded-2xl shadow-xl mb-16">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">
            What Drives Us
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4 filter drop-shadow-lg">👟</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Authenticity First
              </h3>
              <p className="text-gray-600">
                Every sneaker is 100% authentic. We work directly with
                authorized retailers and brands to guarantee the real deal,
                every time.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4 filter drop-shadow-lg">🌟</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Quality Obsessed
              </h3>
              <p className="text-gray-600">
                We're not just selling shoes – we're curating experiences. Each
                pair is carefully inspected to meet our exacting standards.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-pink-50 to-red-50 hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4 filter drop-shadow-lg">🤝</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Community Driven
              </h3>
              <p className="text-gray-600">
                Built by sneakerheads, for sneakerheads. We understand the
                culture because we live it every day.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4 filter drop-shadow-lg">⚡</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Always Evolving
              </h3>
              <p className="text-gray-600">
                Street culture never stands still, and neither do we. We're
                constantly evolving to bring you the latest and greatest.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-16 rounded-2xl text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Step Up Your Game?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of satisfied customers who trust DTwears for their
              sneaker needs. Your perfect pair is waiting.
            </p>
            <Link href="/productslist">
              <button className="bg-white/20 hover:bg-white/30 text-white cursor-pointer font-semibold py-4 px-8 rounded-full text-lg backdrop-blur-sm border border-white/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                Shop Premium Sneakers
              </button>
            </Link>
          </div>

          <div className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full animate-bounce"></div>
          <div
            className="absolute top-20 right-20 w-6 h-6 bg-white/20 rounded-full animate-bounce"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute bottom-10 left-20 w-3 h-3 bg-white/20 rounded-full animate-bounce"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-20 right-10 w-5 h-5 bg-white/20 rounded-full animate-bounce"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
