// import DTwears from "@/components/DTwears";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Providers from "@/context/Providers";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import WhatsAppFloatingButton from "@/components/WhatsApp";
import { useScrollDirection } from "@/hooks/useScrollDirection"; // Adjust path as needed
import DTwears from "@/components/DTwears";

export default function App({ Component, pageProps }: AppProps) {
  const { scrollDirection, isAtTop } = useScrollDirection(10);

  // Determine if navbar should be visible
  const showNavbar =
    scrollDirection === "up" || isAtTop || scrollDirection === null;

  return (
    <Providers>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 transition-all duration-300">
        {/* Header Section with scroll-based visibility */}
        <header
          className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-200/50 shadow-sm transition-transform duration-300 ease-in-out ${
            showNavbar ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <DTwears />
          <Navbar />
        </header>

        {/* Spacer to prevent content jump - adjust height based on your header height */}
        <div className="h-32 flex-shrink-0" />

        {/* Main Content Area with enhanced spacing and responsive design */}
        <main className="flex-grow relative overflow-hidden">
          {/* Enhanced Toaster with better positioning and styling */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            containerClassName="mt-4"
            toastOptions={{
              duration: 4000,
              className:
                "backdrop-blur-sm bg-white/95 border border-gray-200/50 shadow-lg",
              style: {
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "14px",
                fontWeight: "500",
              },
              success: {
                iconTheme: {
                  primary: "#10B981",
                  secondary: "#FFFFFF",
                },
              },
              error: {
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "#FFFFFF",
                },
              },
            }}
          />

          {/* Content wrapper with smooth transitions */}
          <div className="min-h-full transition-all duration-300 ease-in-out">
            <Component {...pageProps} />
          </div>

          {/* Enhanced WhatsApp Button with improved positioning and animations */}
          <div className="fixed bottom-6 right-6 z-40 transition-all duration-300 hover:scale-105">
            <WhatsAppFloatingButton
              phoneNumber="2348106758547"
              message="Hi! I'm interested in your DTwears products."
              position="bottom-right"
              showTooltip={false}
            />
          </div>
        </main>

        {/* Footer with enhanced visual separation */}
        <footer className="border-t border-gray-200/70 bg-gradient-to-r from-gray-50 to-gray-100 shadow-inner">
          <Footer />
        </footer>
      </div>
    </Providers>
  );
}
