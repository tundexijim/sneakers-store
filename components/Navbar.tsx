import Link from "next/link";
import { useCart } from "../context/CartContext";
import { Menu, ShoppingCart, X } from "lucide-react"; // uses lucide icons
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useIsClient } from "@/hooks/useIsClient";
import Image from "next/image";
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
    <nav className="bg-black shadow-md sticky top-0 left-0 w-full z-50">
      <div className="container mx-auto md:px-16 px-2 py-4 flex justify-between items-center">
        <Link href="/" className="hidden md:flex">
          <Image
            src="/logo2.png"
            alt="logo"
            width={30}
            height={30}
            className="w-14"
          />
        </Link>

        {!MenuOpen ? (
          <Menu
            color="#ffffff"
            className="md:hidden"
            onClick={() => setMenuOpen(true)}
            size={30}
          />
        ) : (
          <X
            color="#ffffff"
            className="md:hidden text-white"
            onClick={() => setMenuOpen(false)}
            size={30}
          />
        )}
        <Link href="/" className=" md:hidden">
          <Image
            src="/logo2.png"
            alt="logo"
            width={30}
            height={30}
            className="w-14"
          />
        </Link>

        <div
          className={`space-x-6 flex md:flex-row h-screen md:h-auto md:static md:p-0 md:gap-0 flex-col absolute bg-white md:bg-black bottom-0 top-21 py-20 pl-20 pr-40 gap-10 z-10 transition-all duration-400 ease-in-out ${
            MenuOpen ? "left-0" : "left-[-420px]"
          }`}
        >
          <Link href="/" className="md:text-white text-gray-700 ">
            Home
          </Link>
          <Link href="/checkout" className="md:text-white text-gray-700">
            About Us
          </Link>

          <Link href="/cart" className="relative hidden md:flex">
            <ShoppingCart className=" text-white" size={25} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-1 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
        <Link href="/cart" className="relative md:hidden">
          <ShoppingCart className=" text-white" size={25} />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-1 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
