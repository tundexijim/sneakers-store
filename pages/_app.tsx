import DTwears from "@/components/DTwears";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        {/* <DTwears /> */}
        <Navbar />
        <main className="flex-grow min-h-screen">
          <Toaster position="top-right" reverseOrder={false} />
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </Providers>
  );
}
