import Link from "next/link";
import { useCart } from "../context/CartContext";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useIsClient } from "@/hooks/useIsClient";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();
  const { cart } = useCart();
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isClient = useIsClient();

  // Refs
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Combine static links with category links
  const combinedNavigationLinks = [
    { href: "/productslist", label: "Shop" },
    { href: "/collections/jerseys", label: "Jerseys" },
    { href: "/collections/sneakers", label: "Sneakers" },
  ];

  // Scroll lock utility functions
  const lockScroll = useCallback(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
  }, []);

  const unlockScroll = useCallback(() => {
    const scrollY = document.body.style.top;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
    }
  }, []);

  // Handle menu open/close with scroll lock
  const setMenuState = useCallback(
    (open: boolean) => {
      setIsMenuOpen(open);
      if (open) {
        lockScroll();
      } else {
        unlockScroll();
      }
    },
    [lockScroll, unlockScroll]
  );

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    const handleRouteChange = () => setMenuState(false);

    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router.events, setMenuState]);

  // Handle click outside menu
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(target)
      ) {
        setMenuState(false);
      }
    },
    [setMenuState]
  );

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, handleClickOutside]);

  // Toggle menu function
  const toggleMenu = useCallback(() => {
    setMenuState(!isMenuOpen);
  }, [isMenuOpen, setMenuState]);

  // Cleanup scroll lock on unmount or when menu is closed
  useEffect(() => {
    return () => {
      if (isMenuOpen) {
        unlockScroll();
      }
    };
  }, [isMenuOpen, unlockScroll]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setMenuState(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen, setMenuState]);

  // Cart badge component
  const CartBadge = ({ className = "" }: { className?: string }) => (
    <Link href="/cart" className={`relative group ${className}`}>
      <ShoppingCart
        className="text-white transition-transform duration-200 group-hover:scale-110"
        size={25}
      />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-1 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-pulse">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );

  // Navigation link component
  const NavLink = ({
    href,
    children,
    className = "",
    mobile = false,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    mobile?: boolean;
  }) => {
    const isActive = router.asPath === href || router.asPath.startsWith(href);

    return (
      <Link
        href={href}
        className={`
          ${
            mobile
              ? `flex items-center gap-3 text-gray-700 hover:text-black py-3 px-4 rounded-lg transition-all duration-200 hover:bg-gray-50 ${
                  isActive ? "bg-gray-100 text-black font-semibold" : ""
                }`
              : `text-white hover:text-gray-300 transition-colors duration-200 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300 hover:after:w-full ${
                  isActive ? "after:w-full" : ""
                }`
          } 
          ${className}
        `}
      >
        {children}
      </Link>
    );
  };

  if (!isClient) return null;

  return (
    <nav
      className={`
      bg-black shadow-lg  w-full transition-all duration-300
      ${isScrolled ? "backdrop-blur-sm bg-black/95" : "bg-black"}
    `}
    >
      <div className="container mx-auto md:px-16 p-4">
        <div className="flex justify-between items-center">
          {/* Desktop Logo */}
          <Link href="/" className="hidden md:flex group">
            <Image
              src="/logo2.png"
              alt="logo"
              width={56}
              height={56}
              className="w-14 transition-transform duration-200 group-hover:scale-105"
              priority
            />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            ref={menuButtonRef}
            className="md:hidden p-2 -m-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            <div className="relative w-6 h-6">
              <Menu
                className={`absolute inset-0 text-white transition-all duration-300 ${
                  isMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                }`}
                size={24}
              />
              <X
                className={`absolute inset-0 text-white transition-all duration-300 ${
                  isMenuOpen ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
                }`}
                size={24}
              />
            </div>
          </button>

          {/* Mobile Logo */}
          <Link href="/" className="md:hidden group">
            <Image
              src="/logo2.png"
              alt="logo"
              width={56}
              height={56}
              className="w-14 transition-transform duration-200 group-hover:scale-105"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {combinedNavigationLinks.map(({ href, label }) => (
              <NavLink key={href} href={href}>
                {label.charAt(0).toLocaleUpperCase() +
                  label.slice(1).toLocaleLowerCase()}
              </NavLink>
            ))}
            <CartBadge />
          </div>

          {/* Mobile Cart Icon */}
          <CartBadge className="md:hidden" />
        </div>

        {/* Mobile Menu */}

        <div
          ref={mobileMenuRef}
          className={`
            fixed top-21.5 left-0 h-[calc(100vh-80px)] w-80 max-w-[85vw] bg-white shadow-2xl z-50
            transition-transform duration-300 ease-out md:hidden overflow-y-auto
            ${isMenuOpen ? "translate-x-0" : "translate-x-[-100%]"}
          `}
        >
          <div className="p-6">
            <nav className="space-y-2">
              {combinedNavigationLinks.map(({ href, label }) => (
                <NavLink key={href} href={href} mobile>
                  {label.charAt(0).toLocaleUpperCase() +
                    label.slice(1).toLocaleLowerCase()}
                </NavLink>
              ))}
            </nav>

            {/* Mobile Menu Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Cart Items</span>
                <span className="font-semibold text-black">{itemCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
