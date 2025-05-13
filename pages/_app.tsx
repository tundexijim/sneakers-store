import DTwears from "@/components/DTwears";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/context/authContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <DTwears />
          <Navbar />
          <main className="flex-grow">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Providers>
  );
}
