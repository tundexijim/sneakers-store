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
import Script from "next/script";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import * as fbq from "@/lib/fbpixel";

export default function App({ Component, pageProps }: AppProps) {
  const { scrollDirection, isAtTop } = useScrollDirection(10);

  // Determine if navbar should be visible
  const showNavbar =
    scrollDirection === "up" || isAtTop || scrollDirection === null;
  const router = useRouter();
  const [icon, setIcon] = useState(true);

  useEffect(() => {
    // Track initial page load
    fbq.pageview();

    // Track on route changes
    const handleRouteChange = () => {
      fbq.pageview();
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <Providers>
      <Script
        dangerouslySetInnerHTML={{
          __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', ${fbq.FB_PIXEL_ID}); 
              fbq('track', 'PageView');
            `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=3738275022983537&ev=PageView&noscript=1"
        />
      </noscript>

      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 transition-all duration-300">
        {/* Header Section with scroll-based visibility */}
        <header
          className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-200/50 shadow-sm transition-transform duration-300 ease-in-out ${
            showNavbar ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <DTwears icon={icon} setIcon={setIcon} />
          <Navbar />
        </header>

        {/* Spacer to prevent content jump - adjust height based on your header height */}
        <div className={`flex-shrink-0 ${icon ? "h-32" : "h-20"}`} />

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
              message=""
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
