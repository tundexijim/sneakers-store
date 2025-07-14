import Link from "next/link";
import { useCart } from "../context/CartContext";
import { Menu, ShoppingCart, X, Home, Store, Users } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useIsClient } from "@/hooks/useIsClient";
import Image from "next/image";
import { getAllCategories } from "@/services/categoriesService";

export default function Navbar() {
  const router = useRouter();
  const { cart } = useCart();
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const isClient = useIsClient();

  // Refs
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getAllCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Combine static links with category links
  const combinedNavigationLinks = [
    { href: "/productslist", label: "Shop" },
    ...categories.map((cat) => ({
      href: `/collections/${cat.name}`,
      label: cat.name,
      // No icon for categories
    })),
  ];
  console.log(categories);
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
    const handleRouteChange = () => setIsMenuOpen(false);

    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router.events]);

  // Handle click outside menu
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as Node;

    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(target) &&
      menuButtonRef.current &&
      !menuButtonRef.current.contains(target)
    ) {
      setIsMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, handleClickOutside]);

  // Body scroll lock for mobile menu
  useEffect(() => {
    if (isMenuOpen) {
      scrollY = window.scrollY;
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.cssText = `
        overflow: hidden;
        padding-right: ${scrollBarWidth}px;
        position: fixed;
        top: -${scrollY}px;
        left: 0;
        right: 0;
        width: 100%;
      `;
    } else {
      document.body.style.cssText = "";
      window.scrollTo(0, scrollY);
    }

    return () => {
      document.body.style.cssText = "";
    };
  }, [isMenuOpen]);

  // Toggle menu function
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

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
    const isActive = router.pathname === href;

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
      bg-black shadow-lg sticky top-0 left-0 w-full z-50 transition-all duration-300
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
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
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
                {label}
              </NavLink>
            ))}
            <CartBadge />
          </div>

          {/* Mobile Cart Icon */}
          <CartBadge className="md:hidden" />
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`
            fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden
            ${
              isMenuOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }
          `}
          style={{ top: "80px" }}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          className={`
            fixed top-20 left-0 h-[calc(100vh-80px)] w-80 max-w-[85vw] bg-white shadow-2xl
            transition-transform duration-300 ease-out md:hidden overflow-y-auto
            ${isMenuOpen ? "translate-x-0" : "translate-x-[-100%]"}
          `}
        >
          <div className="p-6">
            <nav className="space-y-2">
              {combinedNavigationLinks.map(({ href, label }) => (
                <NavLink key={href} href={href} mobile>
                  {label}
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
