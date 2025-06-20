import DTwears from "@/components/DTwears";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import WhatsAppFloatingButton from "@/components/WhatsApp";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        {/* <DTwears /> */}
        <Navbar />
        <main className="flex-grow min-h-screen">
          <Toaster position="top-right" reverseOrder={false} />
          <Component {...pageProps} />
          <WhatsAppFloatingButton
            phoneNumber="2348106758547" // Replace with your actual WhatsApp number
            message="Hi! I'm interested in your DTwears products. Can you help me?"
            position="bottom-right"
            showTooltip={true}
          />
        </main>
        <Footer />
      </div>
    </Providers>
  );
}
