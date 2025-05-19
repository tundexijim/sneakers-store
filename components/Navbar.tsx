import Link from "next/link";
import { useCart } from "../context/CartContext";
import { Menu, ShoppingCart, X } from "lucide-react"; // uses lucide icons
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();
  const { cart } = useCart();
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const [MenuOpen, setMenuOpen] = useState(false);

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
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [MenuOpen]);

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto md:px-16 px-4 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold text-gray-800 hidden md:flex"
        >
          DTwears
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
        <div
          className={`space-x-6 flex md:flex-row md:static md:p-0 md:gap-0 flex-col absolute bg-white bottom-0 top-24 p-20 gap-10 z-10 transition-all duration-400 ease-in-out ${
            MenuOpen ? "left-0" : "left-[-280px]"
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
