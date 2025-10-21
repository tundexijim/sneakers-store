import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function CategoryBadge({ category }: { category: string }) {
  const [showdropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const categories = [
    { href: "/products", label: "Shop" },
    { href: "/collections/jerseys", label: "Jerseys" },
    { href: "/collections/sneakers", label: "Sneakers" },
  ];

  useEffect(() => {
    setShowDropdown(false);
  }, [router]);
  return (
    // <div className="md:px-16 px-2">
    <div
      className="flex items-center gap-6 md:-mx-16 -mx-2 mb-2 py-10 flex-col text-white"
      style={{
        backgroundImage: "url('/images/banner.png')",
      }}
    >
      <h1 className="text-4xl font-bold">{category}</h1>
      <p
        onClick={() => setShowDropdown(!showdropdown)}
        className="flex items-center cursor-pointer"
      >
        Categories
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            showdropdown ? "rotate-180" : ""
          }`}
        />
      </p>
      {showdropdown &&
        categories.map(({ href, label }) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
    </div>
    // </div>
  );
}
