import Link from "next/link";
import { useCart } from "../context/CartContext";
import { Menu, ShoppingCart, X } from "lucide-react"; // uses lucide icons
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useIsClient } from "@/hooks/useIsClient";
export default function Navbar() {
  const router = useRouter();
  const { cart } = useCart();
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const [MenuOpen, setMenuOpen] = useState(false);
  const isClient = useIsClient();

  useEffect(() => {
    const handleRouteChange = () => {
      setMenuOpen(false);
    };

    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    if (MenuOpen) {
      scrollY = window.scrollY;
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;

      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [MenuOpen]);
  if (!isClient) return null;

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto md:px-16 px-4 py-4 flex justify-between items-center">
        <Link href="/" className="hidden md:flex">
          <img src="/logo.png" alt="logo" className="w-14" />
        </Link>

        {!MenuOpen ? (
          <Menu
            color="#141414"
            className="md:hidden"
            onClick={() => setMenuOpen(true)}
          />
        ) : (
          <X
            color="#141414"
            className="md:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}
        <Link href="/" className=" md:hidden">
          <img src="/logo.png" alt="logo" className="w-14" />
        </Link>

        <div
          className={`space-x-6 flex md:flex-row md:static md:p-0 md:gap-0 flex-col absolute bg-white bottom-0 top-30 py-20 pl-20 pr-40 gap-10 z-10 transition-all duration-400 ease-in-out ${
            MenuOpen ? "left-0" : "left-[-420px]"
          }`}
        >
          <Link href="/" className="text-gray-700 hover:text-black">
            Home
          </Link>
          <Link href="/checkout" className="text-gray-700 hover:text-black">
            Checkout
          </Link>

          <Link href="/cart" className="relative hidden md:flex">
            <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-black" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
        <Link href="/cart" className="relative md:hidden">
          <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-black" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
