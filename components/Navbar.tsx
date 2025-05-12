import Link from "next/link";
import { useCart } from "../context/CartContext";
import { ShoppingCart } from "lucide-react"; // uses lucide icons

export default function Navbar() {
  const { cart } = useCart();
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-16 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-800">
          DTwears
        </Link>

        <div className="space-x-6 flex items-center">
          <Link href="/" className="text-gray-700 hover:text-black">
            Home
          </Link>
          <Link href="/checkout" className="text-gray-700 hover:text-black">
            Checkout
          </Link>

          <Link href="/cart" className="relative">
            <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-black" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
